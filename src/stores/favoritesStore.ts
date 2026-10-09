import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useAuthStore } from './authStore';
import { stockApi, ApiError, type FavoriteItem } from '../api/stockApi';
import { trackEvent } from '../lib/analytics';

// 我的最愛：後端 /api/favorites 為唯一資料來源（取代舊的 localStorage 自選股群組）。
// 單一清單、上限依 member_level 由後端決定（一律用 GET 回傳的 limit，不在前端寫死）。

export type AddResult =
  | { ok: true }
  | { ok: false; reason: 'limit' | 'not_found' | 'error'; limit?: number };

// 舊版 localStorage 自選股群組（kzone:watchlist:<email>）→ 後端清單的一次性搬移
const legacyKeyFor = (email: string) => `kzone:watchlist:${email}`;
const migratedKeyFor = (email: string) => `kzone:favorites-migrated:${email}`;

function legacySymbols(email: string): string[] {
  try {
    const raw = localStorage.getItem(legacyKeyFor(email));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as {
      activeGroupId?: string;
      groups?: Array<{ id: string; symbols?: unknown[] }>;
    };
    if (!Array.isArray(parsed.groups)) return [];
    // 啟用中的群組優先，其餘群組依序補上（去重）
    const ordered = [...parsed.groups].sort((a, b) =>
      a.id === parsed.activeGroupId ? -1 : b.id === parsed.activeGroupId ? 1 : 0
    );
    const seen = new Set<string>();
    const symbols: string[] = [];
    for (const g of ordered) {
      for (const s of g.symbols ?? []) {
        if (typeof s === 'string' && !seen.has(s)) {
          seen.add(s);
          symbols.push(s);
        }
      }
    }
    return symbols;
  } catch {
    return [];
  }
}

export const useFavoritesStore = defineStore('favorites', () => {
  const auth = useAuthStore();

  const items = ref<FavoriteItem[]>([]);
  const limit = ref(0);
  const isLoading = ref(false);
  const loaded = ref(false);

  const count = computed(() => items.value.length);
  // 後端調低上限時 count 可能 > limit：可移除、不能再加
  const isFull = computed(() => loaded.value && items.value.length >= limit.value);
  const isFavorite = (symbol: string) => items.value.some((i) => i.symbol === symbol);

  // 舊 localStorage 自選股 → 後端（僅在後端清單為空時搬一次；塞到額滿為止）
  const migrateLegacy = async (email: string) => {
    if (localStorage.getItem(migratedKeyFor(email))) return;
    const symbols = legacySymbols(email);
    try {
      if (items.value.length === 0 && symbols.length > 0) {
        let migrated = 0;
        for (const symbol of symbols) {
          try {
            const item = await stockApi.addFavorite(symbol);
            items.value = [item, ...items.value.filter((i) => i.symbol !== item.symbol)];
            migrated++;
          } catch (e) {
            if (e instanceof ApiError && e.status === 409) break; // 額滿就停
            // 404（已下架）等其他錯誤：跳過該檔繼續
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
      items.value = [];
      limit.value = 0;
      loaded.value = false;
      return;
    }
    isLoading.value = true;
    try {
      const data = await stockApi.getFavorites();
      limit.value = data.limit;
      items.value = data.items;
      loaded.value = true;
      if (auth.user?.email) await migrateLegacy(auth.user.email);
    } catch {
      /* 401 已由 apiFetch 統一處理（登出＋開登入 modal）；其他錯誤保留現狀 */
    } finally {
      isLoading.value = false;
    }
  };

  const add = async (symbol: string): Promise<AddResult> => {
    try {
      const item = await stockApi.addFavorite(symbol);
      // 201 或 200 都放最前面；先濾掉同代號避免 200 時重複
      items.value = [item, ...items.value.filter((i) => i.symbol !== item.symbol)];
      trackEvent('watchlist_add_stock', { symbol });
      return { ok: true };
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        // 以後端回傳的上限為準（會員等級可能剛被調整）
        if (typeof e.body?.limit === 'number') limit.value = e.body.limit;
        return { ok: false, reason: 'limit', limit: limit.value };
      }
      if (e instanceof ApiError && e.status === 404) return { ok: false, reason: 'not_found' };
      return { ok: false, reason: 'error' };
    }
  };

  const remove = async (symbol: string): Promise<boolean> => {
    const before = items.value;
    items.value = items.value.filter((i) => i.symbol !== symbol); // 樂觀更新
    try {
      await stockApi.removeFavorite(symbol);
      trackEvent('watchlist_remove_stock', { symbol });
      return true;
    } catch {
      items.value = before; // 失敗還原
      return false;
    }
  };

  const toggle = async (symbol: string): Promise<AddResult | boolean> =>
    isFavorite(symbol) ? remove(symbol) : add(symbol);

  // 登入 / 登出 / 換帳號時重新同步
  watch(() => auth.user?.email ?? null, () => load());
  load();

  return {
    items,
    limit,
    count,
    isLoading,
    loaded,
    isFull,
    isFavorite,
    load,
    add,
    remove,
    toggle
  };
});
