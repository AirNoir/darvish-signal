<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';

const props = defineProps<{
  title: string;
  defaultExpanded?: boolean;
  indicators?: { color: string; label: string }[];
}>();

const emit = defineEmits<{
  expanded: [];
}>();

// 預設展開
const isExpanded = ref(props.defaultExpanded !== false);

const toggle = () => {
  isExpanded.value = !isExpanded.value;
};

// 當展開時，觸發 resize 事件讓圖表重新調整大小
watch(isExpanded, async (expanded) => {
  if (expanded) {
    await nextTick();
    // 觸發 window resize 事件，讓所有圖表重新計算大小
    window.dispatchEvent(new Event('resize'));
    emit('expanded');
  }
});
</script>

<template>
  <div class="border border-[#333] rounded-lg overflow-hidden flex-shrink-0">
    <!-- Collapsed Header (always visible) -->
    <div
      class="flex items-center justify-between px-3 py-1.5 bg-[#1a1a1a] cursor-pointer hover:bg-[#222] transition-colors select-none"
      @click="toggle"
    >
      <div class="flex items-center gap-2 text-xs">
        <span class="text-white font-bold">{{ title }}</span>
        <template v-if="indicators">
          <span
            v-for="ind in indicators"
            :key="ind.label"
            :style="{ color: ind.color }"
          >
            {{ ind.label }}
          </span>
        </template>
      </div>
      <svg
        :class="[
          'w-4 h-4 text-[#666] transition-transform',
          isExpanded ? '' : 'rotate-180'
        ]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
      </svg>
    </div>

    <!-- Chart Content -->
    <div
      v-if="isExpanded"
      class="h-[120px]"
    >
      <slot />
    </div>
  </div>
</template>
