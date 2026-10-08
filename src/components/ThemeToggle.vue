<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from '../theme/useTheme';

const props = defineProps<{ source: string; withLabel?: boolean }>();

const { theme, toggleTheme } = useTheme();
const isDark = computed(() => theme.value === 'dark');
const label = computed(() => (isDark.value ? '切換為淺色主題' : '切換為深色主題'));
</script>

<template>
  <button
    type="button"
    :aria-label="label"
    :title="label"
    class="inline-flex items-center gap-2 rounded-lg p-1.5 text-fg-secondary hover:text-fg-strong hover:bg-line-subtle transition-colors"
    @click="toggleTheme(props.source)"
  >
    <!-- 深色時顯示太陽（點了變淺色），淺色時顯示月亮 -->
    <svg v-if="isDark" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke-width="2" />
      <path stroke-linecap="round" stroke-width="2" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
    <span v-if="props.withLabel" class="text-sm">{{ isDark ? '淺色主題' : '深色主題' }}</span>
  </button>
</template>
