<script setup lang="ts">
// 我的最愛星號：點開群組選單勾選（同一檔可在多個群組），星號實心代表至少在一個群組裡。
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useFavoritesStore, addResultMessage } from '../stores/favoritesStore';

const props = defineProps<{ symbol: string }>();

const auth = useAuthStore();
const favorites = useFavoritesStore();
const open = ref(false);
const pendingGroup = ref<number | null>(null);
const notice = ref<string | null>(null);
const root = ref<HTMLElement | null>(null);

const isStarred = computed(() => favorites.isFavorite(props.symbol));
const starredCount = computed(() => favorites.groupsContaining(props.symbol).length);

const handleClick = () => {
  if (!auth.isLoggedIn) {
    auth.openLogin('star_button');
    return;
  }
  open.value = !open.value;
  notice.value = null;
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

// 點選單外、按 Esc 或換股票時關閉
const onDocPointer = (e: PointerEvent) => {
  if (open.value && root.value && !root.value.contains(e.target as Node)) open.value = false;
};
const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape') open.value = false;
};
onMounted(() => {
  document.addEventListener('pointerdown', onDocPointer);
  document.addEventListener('keydown', onKey);
});
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocPointer);
  document.removeEventListener('keydown', onKey);
});
watch(
  () => props.symbol,
  () => {
    open.value = false;
  }
);
</script>

<template>
  <div ref="root" class="relative">
    <button
      @click="handleClick"
      class="p-1 transition-colors"
      :class="isStarred ? 'text-series-gold' : 'text-fg-subtle hover:text-series-gold'"
      :aria-label="isStarred ? '管理我的最愛群組' : '加入我的最愛'"
      :title="isStarred ? `已在 ${starredCount} 個群組` : '加入我的最愛'"
      aria-haspopup="menu"
      :aria-expanded="open"
    >
      <svg class="w-4 h-4" :fill="isStarred ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.5a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.5.04.7.663.32.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.32-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    </button>

    <!-- 群組選單（名稱、數量、上限都來自後端） -->
    <div
      v-if="open"
      role="menu"
      aria-label="我的最愛群組"
      class="absolute right-0 top-full mt-1 w-52 bg-surface border border-line rounded-xl shadow-xl z-50 p-1"
    >
      <p class="px-2 py-1 text-[11px] text-fg-muted">
        選擇群組<template v-if="favorites.loaded">（每組最多 {{ favorites.maxPerGroup }} 檔）</template>
      </p>
      <p v-if="!favorites.loaded" class="px-2 py-1.5 text-xs text-fg-muted">載入中…</p>
      <button
        v-for="g in favorites.groups"
        :key="g.group_no"
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
  </div>
</template>
