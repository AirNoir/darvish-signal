<script setup lang="ts">
// 我的最愛愛心：實心＝至少在一個群組裡，空心＝還沒加入。
// 點開群組選單勾選（同一檔可同時在多個群組）。選單用 Teleport 固定定位，
// 放在側欄這種會捲動、overflow 裁切的清單裡也不會被切掉。
import { computed, ref, watch, onBeforeUnmount } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useFavoritesStore, addResultMessage } from '../stores/favoritesStore';

const props = withDefaults(
  defineProps<{ symbol: string; size?: 'sm' | 'md'; source?: string }>(),
  { size: 'md', source: 'favorite_button' }
);

const auth = useAuthStore();
const favorites = useFavoritesStore();
const open = ref(false);
const pendingGroup = ref<number | null>(null);
const notice = ref<string | null>(null);
const btn = ref<HTMLElement | null>(null);
const menu = ref<HTMLElement | null>(null);
const menuStyle = ref<Record<string, string>>({});

const isFavorite = computed(() => favorites.isFavorite(props.symbol));
const groupCount = computed(() => favorites.groupsContaining(props.symbol).length);

// 選單寬度固定，靠右對齊按鈕，超出視窗時往內收
const MENU_WIDTH = 208;
const place = () => {
  const r = btn.value?.getBoundingClientRect();
  if (!r) return;
  const left = Math.max(8, Math.min(r.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8));
  menuStyle.value = { top: `${r.bottom + 4}px`, left: `${left}px`, width: `${MENU_WIDTH}px` };
};

const onDocPointer = (e: PointerEvent) => {
  const t = e.target as Node;
  if (btn.value?.contains(t) || menu.value?.contains(t)) return;
  close();
};
const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape') close();
};
// 捲動或改變視窗大小後位置會失準，直接關閉
const onViewportChange = () => close();

const attach = () => {
  document.addEventListener('pointerdown', onDocPointer);
  document.addEventListener('keydown', onKey);
  window.addEventListener('scroll', onViewportChange, true);
  window.addEventListener('resize', onViewportChange);
};
const detach = () => {
  document.removeEventListener('pointerdown', onDocPointer);
  document.removeEventListener('keydown', onKey);
  window.removeEventListener('scroll', onViewportChange, true);
  window.removeEventListener('resize', onViewportChange);
};

function close() {
  if (!open.value) return;
  open.value = false;
  detach();
}

const handleClick = () => {
  if (!auth.isLoggedIn) {
    auth.openLogin(props.source);
    return;
  }
  if (open.value) {
    close();
    return;
  }
  notice.value = null;
  place();
  open.value = true;
  attach();
};

const toggleGroup = async (groupNo: number) => {
  if (pendingGroup.value !== null) return;
  pendingGroup.value = groupNo;
  notice.value = null;
  try {
    const result = await favorites.toggleInGroup(groupNo, props.symbol);
    if (typeof result === 'object' && !result.ok) {
      notice.value = addResultMessage(result, favorites.groupOf(groupNo)?.name);
    } else if (result === false) {
      notice.value = '操作失敗，請稍後再試';
    }
  } finally {
    pendingGroup.value = null;
  }
};

watch(() => props.symbol, close);
onBeforeUnmount(close);
</script>

<template>
  <span class="inline-flex items-center">
    <button
      ref="btn"
      type="button"
      data-favorite-button
      @click.stop="handleClick"
      class="p-1 transition-colors"
      :class="isFavorite ? 'text-brand-rose' : 'text-fg-subtle hover:text-brand-rose'"
      :aria-label="isFavorite ? '管理我的最愛群組' : '加入我的最愛'"
      :title="isFavorite ? `已在 ${groupCount} 個群組` : '加入我的最愛'"
      aria-haspopup="menu"
      :aria-expanded="open"
    >
      <svg
        :class="size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'"
        :fill="isFavorite ? 'currentColor' : 'none'"
        stroke="currentColor"
        stroke-width="2"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        />
      </svg>
    </button>

    <!-- 群組選單（名稱、數量、上限都來自後端） -->
    <Teleport to="body">
      <div
        v-if="open"
        ref="menu"
        role="menu"
        aria-label="我的最愛群組"
        :style="menuStyle"
        class="fixed z-[100] bg-surface border border-line rounded-xl shadow-xl p-1"
        @click.stop
      >
        <p class="px-2 py-1 text-[11px] text-fg-muted">
          選擇群組<template v-if="favorites.loaded">（每組最多 {{ favorites.maxPerGroup }} 檔）</template>
        </p>
        <p v-if="!favorites.loaded" class="px-2 py-1.5 text-xs text-fg-muted">載入中…</p>
        <button
          v-for="g in favorites.groups"
          :key="g.group_no"
          type="button"
          role="menuitemcheckbox"
          :aria-checked="favorites.isInGroup(g.group_no, symbol)"
          :disabled="pendingGroup !== null || (!favorites.isInGroup(g.group_no, symbol) && favorites.isGroupFull(g.group_no))"
          @click="toggleGroup(g.group_no)"
          class="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg text-sm text-fg hover:bg-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span class="flex items-center gap-2">
            <span
              class="w-4 h-4 rounded border flex items-center justify-center shrink-0"
              :class="favorites.isInGroup(g.group_no, symbol) ? 'bg-accent border-accent text-fg-on-accent' : 'border-line'"
            >
              <svg v-if="favorites.isInGroup(g.group_no, symbol)" class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            {{ g.name }}
          </span>
          <span class="text-[11px] text-fg-muted tabular-nums">
            {{ g.items.length }}/{{ favorites.maxPerGroup }}{{ favorites.isGroupFull(g.group_no) && !favorites.isInGroup(g.group_no, symbol) ? ' 已滿' : '' }}
          </span>
        </button>
        <p v-if="notice" class="px-2 py-1 text-[11px] text-warning-fg">{{ notice }}</p>
      </div>
    </Teleport>
  </span>
</template>
