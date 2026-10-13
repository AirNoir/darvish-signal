import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useAuthStore } from './authStore';
import { stockApi, ApiError, type FavoriteGroup, type FavoriteGroups } from '../api/stockApi';
import { trackEvent } from '../lib/analytics';

// 我的最愛（群組版）：後端 /api/favorites 為唯一資料來源，見 frontend-favorites-integration.md。
// 群組數、名稱、每組上限都由後端依 member_level 決定，前端一律用 GET 回傳值，不寫死。
// 同一檔股票可以同時在多個群組；加入 / 移除都以「群組 + 代號」為單位。

export type AddResult =
  | { ok: true }
  | { ok: false; reason: 'limit' | 'group_not_found' | 'not_found' | 'error'; limit?: number };

// 給 UI 用的錯誤文案；groupName 請傳後端回傳的群組名稱
export function addResultMessage(result: AddResult, groupName = '這個群組'): string | null {
  if (result.ok) return null;
  switch (result.reason) {
    case 'limit':
      return `${groupName}已滿（每組 ${result.limit} 檔），請先移除部分個股`;
    case 'group_not_found':
      return '群組已變更，請重新選擇';
    case 'not_found':
      return '這檔股票目前無法加入我的最愛';
    default:
      return '操作失敗，請稍後再試';
  }
}

// 群組名稱規則（與後端相同，文件 §3.4）：去掉前後空白後 1～10 個字，以 Unicode code point 計
// （用 [...name].length，不用 name.length，部分 emoji 會被算成 2），不能含換行、tab 等控制字元。
export const MAX_GROUP_NAME_LENGTH = 10;
export const groupNameLength = (input: string): number => [...input.trim()].length;

// 合法時回傳去掉空白後的名稱，不合法回 null
export function normalizeGroupName(input: string): string | null {
  const name = input.trim();
  const length = [...name].length;
  if (length === 0 || length > MAX_GROUP_NAME_LENGTH || /\p{Cc}/u.test(name)) return null;
  return name;
}

export type RenameResult =
  | { ok: true }
  | { ok: false; reason: 'invalid' | 'unsupported' | 'group_not_found' | 'error' };

export function renameResultMessage(result: RenameResult): string | null {
  if (result.ok) return null;
  switch (result.reason) {
    case 'invalid':
      return `群組名稱需為 1～${MAX_GROUP_NAME_LENGTH} 個字，且不能含換行`;
    case 'unsupported':
      return '後端尚未開放群組改名，請稍後再試';
    case 'group_not_found':
      return '群組已變更，請重新選擇';
    default:
      return '改名失敗，請稍後再試';
  }
}

// 目前選中的群組編號（跨頁共用：我的最愛頁、/app 側欄、新增個股 modal）
const ACTIVE_GROUP_KEY = 'kzone:favorites-active-group';

function readActiveGroup(): number {
  try {
    const n = Number(localStorage.getItem(ACTIVE_GROUP_KEY));
    return Number.isInteger(n) && n >= 1 ? n : 1;
  } catch {
    return 1;
  }
}

// 舊版 localStorage 自選股群組（kzone:watchlist:<email>）→ 後端群組的一次性搬移：
// 依原本的群組順序對應到群組一、群組二……，後端群組不夠時其餘略過。
const legacyKeyFor = (email: string) => `kzone:watchlist:${email}`;
const migratedKeyFor = (email: string) => `kzone:favorites-migrated-v2:${email}`;

function legacyGroups(email: string): string[][] {
  try {
    const raw = localStorage.getItem(legacyKeyFor(email));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { groups?: Array<{ symbols?: unknown[] }> };
    if (!Array.isArray(parsed.groups)) return [];
    return parsed.groups.map((g) =>
      Array.from(new Set((g.symbols ?? []).filter((s): s is string => typeof s === 'string')))
    );
  } catch {
    return [];
  }
}

export const useFavoritesStore = defineStore('favorites', () => {
  const auth = useAuthStore();

  const groups = ref<FavoriteGroup[]>([]);
  const maxGroups = ref(0);
  const maxPerGroup = ref(0);
  const isLoading = ref(false);
  const loaded = ref(false);
  const activeGroupNo = ref(readActiveGroup());

  // groupNo 可能來自 <select> 等字串來源，一律轉 number 比對
  const groupOf = (groupNo: number | string) =>
    groups.value.find((g) => g.group_no === Number(groupNo));
  const activeGroup = computed<FavoriteGroup | null>(
    () => groupOf(activeGroupNo.value) ?? groups.value[0] ?? null
  );
  const totalCount = computed(() => groups.value.reduce((n, g) => n + g.items.length, 0));

  const isInGroup = (groupNo: number, symbol: string) =>
    groupOf(groupNo)?.items.some((i) => i.symbol === symbol) ?? false;
  const groupsContaining = (symbol: string) =>
    groups.value.filter((g) => g.items.some((i) => i.symbol === symbol)).map((g) => g.group_no);
  const isFavorite = (symbol: string) => groupsContaining(symbol).length > 0;
  // 會員等級被調降時群組內數量可能 > 上限：可移除、不能再加
  const isGroupFull = (groupNo: number) => {
    const g = groupOf(groupNo);
    return !g || g.items.length >= maxPerGroup.value;
  };

  const setActiveGroup = (groupNo: number) => {
    activeGroupNo.value = groupNo;
    try {
      localStorage.setItem(ACTIVE_GROUP_KEY, String(groupNo));
    } catch {
      /* 無痕模式 / 配額滿時忽略 */
    }
  };

  const applyGroups = (data: FavoriteGroups) => {
    maxGroups.value = data.max_groups;
    maxPerGroup.value = data.max_stocks_per_group;
    groups.value = data.groups.map((g) => ({ ...g, items: g.items ?? [] }));
    // 目前選的群組不存在（例如等級調降後群組變少）就退回第一個
    const first = groups.value[0];
    if (first && !groupOf(activeGroupNo.value)) setActiveGroup(first.group_no);
  };

  // 把一筆後端回傳的資料放進群組：201 放最前面；200（本來就在）不動，維持與後端相同的順序
  const upsertItem = (groupNo: number, item: FavoriteGroup['items'][number]) => {
    const g = groupOf(groupNo);
    if (g && !g.items.some((i) => i.symbol === item.symbol)) {
      g.items = [item, ...g.items];
      g.count = g.items.length;
    }
  };

  const migrateLegacy = async (email: string) => {
    if (localStorage.getItem(migratedKeyFor(email))) return;
    const legacy = legacyGroups(email);
    try {
      if (totalCount.value === 0 && legacy.some((g) => g.length > 0)) {
        let migrated = 0;
        const n = Math.min(legacy.length, groups.value.length);
        for (let k = 0; k < n; k++) {
          const target = groups.value[k];
          const symbols = legacy[k];
          if (!target || !symbols) continue;
          for (const symbol of symbols) {
            try {
              const { group_no, ...item } = await stockApi.addFavorite(target.group_no, symbol);
              upsertItem(group_no, item);
              migrated++;
            } catch (e) {
              if (e instanceof ApiError && e.status === 409) break; // 這組滿了，換下一組
              // 404（已下架）等其他錯誤：跳過該檔繼續
            }
          }
        }
        if (migrated > 0) trackEvent('watchlist_migrated', { count: migrated });
      }
      localStorage.setItem(migratedKeyFor(email), '1');
    } catch {
      /* localStorage 不可用時忽略，下次再試 */
    }
  };

  const load = async () => {
    if (!auth.isLoggedIn) {
      groups.value = [];
      maxGroups.value = 0;
      maxPerGroup.value = 0;
      loaded.value = false;
      return;
    }
    isLoading.value = true;
    try {
      applyGroups(await stockApi.getFavorites());
      loaded.value = true;
      if (auth.user?.email) await migrateLegacy(auth.user.email);
    } catch {
      /* 401 已由 apiFetch 統一處理（登出＋開登入 modal）；其他錯誤保留現狀 */
    } finally {
      isLoading.value = false;
    }
  };

  const add = async (groupNo: number, symbol: string): Promise<AddResult> => {
    try {
      const { group_no, ...item } = await stockApi.addFavorite(groupNo, symbol);
      upsertItem(group_no, item);
      trackEvent('watchlist_add_stock', { symbol, group_no });
      return { ok: true };
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        // 以後端回傳的每組上限為準；畫面上沒滿卻 409 代表資料過期（例如別的裝置加過），重抓
        if (typeof e.body?.limit === 'number') maxPerGroup.value = e.body.limit;
        if (!isGroupFull(groupNo)) void load();
        return { ok: false, reason: 'limit', limit: maxPerGroup.value };
      }
      if (e instanceof ApiError && e.status === 404) {
        if (e.body?.error === 'group not found') {
          await load(); // 群組數可能因等級調整而改變
          return { ok: false, reason: 'group_not_found' };
        }
        return { ok: false, reason: 'not_found' };
      }
      return { ok: false, reason: 'error' };
    }
  };

  const remove = async (groupNo: number, symbol: string): Promise<boolean> => {
    const g = groupOf(groupNo);
    if (!g) return false;
    const before = g.items;
    g.items = g.items.filter((i) => i.symbol !== symbol); // 樂觀更新
    g.count = g.items.length;
    try {
      await stockApi.removeFavorite(groupNo, symbol);
      trackEvent('watchlist_remove_stock', { symbol, group_no: groupNo });
      return true;
    } catch (e) {
      g.items = before; // 失敗還原
      g.count = before.length;
      if (e instanceof ApiError && e.status === 404) await load();
      return false;
    }
  };

  // 在這個群組裡就移除，不在就加入
  const toggleInGroup = async (groupNo: number, symbol: string): Promise<AddResult | boolean> =>
    isInGroup(groupNo, symbol) ? remove(groupNo, symbol) : add(groupNo, symbol);

  // 沒有「移動」API：先加入新群組，成功後再從舊群組移除（同一群組什麼都不做，否則會把它刪掉）
  const move = async (fromGroupNo: number, toGroupNo: number, symbol: string): Promise<AddResult> => {
    if (Number(fromGroupNo) === Number(toGroupNo)) return { ok: true };
    const result = await add(toGroupNo, symbol);
    if (result.ok) await remove(fromGroupNo, symbol);
    return result;
  };

  // 群組改名：樂觀更新，失敗還原。名稱是所有頁面共用的 store 資料，改完側欄、愛心選單、modal 會一起更新
  const rename = async (groupNo: number, input: string): Promise<RenameResult> => {
    const next = normalizeGroupName(input);
    if (next === null) return { ok: false, reason: 'invalid' };
    const g = groupOf(groupNo);
    if (!g) return { ok: false, reason: 'group_not_found' };
    if (next === g.name) return { ok: true };
    const before = g.name;
    g.name = next;
    try {
      const saved = await stockApi.renameFavoriteGroup(groupNo, next);
      if (typeof saved?.name === 'string' && saved.name.length > 0) g.name = saved.name; // 以後端存下來的為準
      trackEvent('watchlist_rename_group', { group_no: groupNo });
      return { ok: true };
    } catch (e) {
      g.name = before;
      if (e instanceof ApiError) {
        if (e.status === 400) return { ok: false, reason: 'invalid' };
        if (e.status === 404 && e.body?.error === 'group not found') {
          await load();
          return { ok: false, reason: 'group_not_found' };
        }
        // 該環境的後端還沒部署改名路由：404 但 body 不是 JSON（null），或 405
        if (e.status === 404 || e.status === 405) return { ok: false, reason: 'unsupported' };
      }
      return { ok: false, reason: 'error' };
    }
  };

  // 登入 / 登出 / 換帳號時重新同步
  watch(() => auth.user?.email ?? null, () => load());
  load();

  return {
    groups,
    maxGroups,
    maxPerGroup,
    totalCount,
    isLoading,
    loaded,
    activeGroupNo,
    activeGroup,
    groupOf,
    isInGroup,
    groupsContaining,
    isFavorite,
    isGroupFull,
    setActiveGroup,
    load,
    add,
    remove,
    toggleInGroup,
    move,
    rename
  };
});
