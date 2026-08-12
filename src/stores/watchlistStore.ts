import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useAuthStore } from './authStore';
import { trackEvent } from '../lib/analytics';

export interface WatchlistGroup {
  id: string;
  name: string;
  symbols: string[];
}

export const MAX_GROUPS = 5;
export const MAX_SYMBOLS_PER_GROUP = 50;

interface PersistedWatchlist {
  activeGroupId: string;
  groups: WatchlistGroup[];
}

// 以使用者身分（AccountService user 的 email）分隔各帳號的自選股；未登入為 guest。
const storageKeyFor = (identity: string | null) => `kzone:watchlist:${identity ?? 'guest'}`;

const genId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `g-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

const defaultGroup = (): WatchlistGroup => ({
  id: genId(),
  name: '自選股 1',
  symbols: []
});

function loadFromStorage(key: string): PersistedWatchlist | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedWatchlist>;
    if (!Array.isArray(parsed.groups)) return null;
    const groups: WatchlistGroup[] = parsed.groups
      .filter((g): g is WatchlistGroup =>
        !!g && typeof g.id === 'string' && typeof g.name === 'string' && Array.isArray(g.symbols)
      )
      .slice(0, MAX_GROUPS)
      .map((g) => ({
        id: g.id,
        name: g.name,
        symbols: g.symbols.filter((s): s is string => typeof s === 'string')
      }));
    if (groups.length === 0) return null;
    const activeGroupId = groups.some((g) => g.id === parsed.activeGroupId)
      ? (parsed.activeGroupId as string)
      : groups[0]!.id;
    return { activeGroupId, groups };
  } catch {
    return null;
  }
}

export const useWatchlistStore = defineStore('watchlist', () => {
  const auth = useAuthStore();

  const groups = ref<WatchlistGroup[]>([]);
  const activeGroupId = ref<string>('');

  const load = () => {
    const persisted = loadFromStorage(storageKeyFor(auth.user?.email ?? null));
    if (persisted) {
      groups.value = persisted.groups;
      activeGroupId.value = persisted.activeGroupId;
    } else {
      const g = defaultGroup();
      groups.value = [g];
      activeGroupId.value = g.id;
    }
  };

  const persist = () => {
    try {
      localStorage.setItem(
        storageKeyFor(auth.user?.email ?? null),
        JSON.stringify({ activeGroupId: activeGroupId.value, groups: groups.value })
      );
    } catch {
      /* 無痕模式 / 配額滿時忽略 */
    }
  };

  load();

  // 換帳號（登入 / 登出）時切換到該帳號自己的自選股資料
  watch(() => auth.user?.email ?? null, () => load());

  watch([groups, activeGroupId], persist, { deep: true });

  const activeGroup = computed<WatchlistGroup | null>(
    () => groups.value.find((g) => g.id === activeGroupId.value) ?? groups.value[0] ?? null
  );

  const canAddGroup = computed(() => groups.value.length < MAX_GROUPS);

  const setActiveGroup = (id: string) => {
    if (groups.value.some((g) => g.id === id)) activeGroupId.value = id;
  };

  const addGroup = (name?: string): WatchlistGroup | null => {
    if (!canAddGroup.value) return null;
    const trimmed = name?.trim();
    const group: WatchlistGroup = {
      id: genId(),
      name: trimmed || `自選股 ${groups.value.length + 1}`,
      symbols: []
    };
    groups.value.push(group);
    trackEvent('watchlist_group_create', { group_count: groups.value.length });
    return group;
  };

  const renameGroup = (id: string, name: string): boolean => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    const group = groups.value.find((g) => g.id === id);
    if (!group) return false;
    group.name = trimmed;
    trackEvent('watchlist_group_rename');
    return true;
  };

  const removeGroup = (id: string) => {
    const idx = groups.value.findIndex((g) => g.id === id);
    if (idx < 0) return;
    groups.value.splice(idx, 1);
    if (groups.value.length === 0) {
      groups.value.push(defaultGroup());
    }
    if (!groups.value.some((g) => g.id === activeGroupId.value)) {
      activeGroupId.value = groups.value[0]!.id;
    }
    trackEvent('watchlist_group_delete', { group_count: groups.value.length });
  };

  const isInGroup = (symbol: string, groupId?: string): boolean => {
    const gid = groupId ?? activeGroupId.value;
    return groups.value.find((g) => g.id === gid)?.symbols.includes(symbol) ?? false;
  };

  // 該個股已加入的群組 id 清單（給個股頁星號 popover 用）
  const groupsContaining = (symbol: string): string[] =>
    groups.value.filter((g) => g.symbols.includes(symbol)).map((g) => g.id);

  const addSymbol = (groupId: string, symbol: string): boolean => {
    const group = groups.value.find((g) => g.id === groupId);
    if (!group) return false;
    if (group.symbols.includes(symbol)) return false;
    if (group.symbols.length >= MAX_SYMBOLS_PER_GROUP) return false;
    group.symbols.push(symbol);
    trackEvent('watchlist_add_stock', { symbol });
    return true;
  };

  const removeSymbol = (groupId: string, symbol: string) => {
    const group = groups.value.find((g) => g.id === groupId);
    if (!group) return;
    const idx = group.symbols.indexOf(symbol);
    if (idx >= 0) {
      group.symbols.splice(idx, 1);
      trackEvent('watchlist_remove_stock', { symbol });
    }
  };

  const toggleSymbol = (groupId: string, symbol: string) => {
    if (isInGroup(symbol, groupId)) removeSymbol(groupId, symbol);
    else addSymbol(groupId, symbol);
  };

  return {
    groups,
    activeGroupId,
    activeGroup,
    canAddGroup,
    setActiveGroup,
    addGroup,
    renameGroup,
    removeGroup,
    addSymbol,
    removeSymbol,
    toggleSymbol,
    isInGroup,
    groupsContaining
  };
});
