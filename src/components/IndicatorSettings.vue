<script setup lang="ts">
import { computed } from 'vue';
import type { IndicatorSettings } from '../types';

const props = defineProps<{
  modelValue: IndicatorSettings;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: IndicatorSettings];
  close: [];
}>();

const indicatorGroups = [
  {
    id: 'priceVolume',
    title: '價量指標',
    items: [
      { key: 'volume', label: '成交量', description: '每日成交量柱狀圖' },
      { key: 'turnoverRate', label: '週轉率', description: '成交量/流通股數' },
      { key: 'volumeMA', label: '成交均量', description: '5/10/20日成交量均線' },
    ]
  },
  {
    id: 'institutional',
    title: '法人買賣',
    items: [
      { key: 'foreignNet', label: '外資買賣超', description: '外資買賣超張數' },
      { key: 'trustNet', label: '投信買賣超', description: '投信買賣超張數' },
    ]
  },
  {
    id: 'margin',
    title: '融資融券',
    items: [
      { key: 'marginBalance', label: '融資餘額', description: '融資餘額張數' },
      { key: 'marginChange', label: '融資增減', description: '融資增減張數' },
      { key: 'shortBalance', label: '融券餘額', description: '融券餘額張數' },
      { key: 'shortChange', label: '融券增減', description: '融券增減張數' },
      { key: 'shortMarginRatio', label: '券資比', description: '融券餘額/融資餘額' },
    ]
  },
  {
    id: 'technical',
    title: '技術指標',
    items: [
      { key: 'rsi', label: 'RSI', description: '相對強弱指標 (9/14日)' },
      { key: 'macd', label: 'MACD', description: 'MACD 指標 (DIF/DEA/柱狀)' },
      { key: 'bollinger', label: '布林通道', description: '布林帶 %B 指標' },
      { key: 'kd', label: 'KD', description: 'KD 隨機指標' },
    ]
  },
];

// Get all indicator keys
const allKeys = indicatorGroups.flatMap(g => g.items.map(i => i.key));

// Check if all indicators are on
const isAllOn = computed(() => {
  return allKeys.every(key => props.modelValue[key as keyof IndicatorSettings]);
});

// Check if all indicators are off
const isAllOff = computed(() => {
  return allKeys.every(key => !props.modelValue[key as keyof IndicatorSettings]);
});

// Check group state: 'all' | 'none' | 'partial'
const getGroupState = (group: typeof indicatorGroups[0]) => {
  const keys = group.items.map(i => i.key);
  const onCount = keys.filter(key => props.modelValue[key as keyof IndicatorSettings]).length;
  if (onCount === keys.length) return 'all';
  if (onCount === 0) return 'none';
  return 'partial';
};

// Toggle single indicator
const toggleIndicator = (key: string) => {
  const currentValue = props.modelValue[key as keyof IndicatorSettings];
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: !currentValue
  });
};

// Toggle all indicators
const toggleAll = (on: boolean) => {
  const newValue = { ...props.modelValue };
  for (const key of allKeys) {
    (newValue as Record<string, boolean>)[key] = on;
  }
  emit('update:modelValue', newValue as IndicatorSettings);
};

// Toggle group
const toggleGroup = (group: typeof indicatorGroups[0]) => {
  const state = getGroupState(group);
  const newValue = { ...props.modelValue };
  const targetState = state === 'all' ? false : true; // If all on, turn off; otherwise turn on
  for (const item of group.items) {
    (newValue as Record<string, boolean>)[item.key] = targetState;
  }
  emit('update:modelValue', newValue as IndicatorSettings);
};
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="emit('close')">
    <div class="bg-[#1a1a1a] border border-[#333] rounded-lg w-96 max-h-[85vh] overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-[#333]">
        <div class="flex items-center gap-3">
          <h3 class="text-white font-medium">指標設定</h3>
          <!-- Global Toggle -->
          <div
            @click="toggleAll(!isAllOn)"
            class="flex items-center gap-1.5 cursor-pointer"
          >
            <span class="text-[#888] text-xs">{{ isAllOn ? '全開' : isAllOff ? '全關' : '部分' }}</span>
            <div
              :class="[
                'w-8 h-5 rounded-full transition-colors relative',
                isAllOn ? 'bg-[#3b82f6]' : !isAllOff ? 'bg-[#3b82f6]/50' : 'bg-[#444]'
              ]"
            >
              <div
                :class="[
                  'absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform',
                  isAllOn ? 'translate-x-3.5' : !isAllOff ? 'translate-x-1.5' : 'translate-x-0.5'
                ]"
              />
            </div>
          </div>
        </div>
        <button @click="emit('close')" class="text-[#888] hover:text-white transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Indicator List -->
      <div class="p-4 space-y-4 overflow-y-auto max-h-[65vh]">
        <div v-for="group in indicatorGroups" :key="group.id">
          <!-- Group Header with Toggle -->
          <div
            class="flex items-center justify-between mb-2 cursor-pointer group"
            @click="toggleGroup(group)"
          >
            <h4 class="text-[#888] text-xs font-medium uppercase tracking-wider group-hover:text-white transition-colors">
              {{ group.title }}
            </h4>
            <div
              :class="[
                'w-8 h-5 rounded-full transition-colors relative flex-shrink-0',
                getGroupState(group) === 'all' ? 'bg-[#3b82f6]' : getGroupState(group) === 'partial' ? 'bg-[#3b82f6]/50' : 'bg-[#444]'
              ]"
            >
              <div
                :class="[
                  'absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform',
                  getGroupState(group) === 'all' ? 'translate-x-3.5' : getGroupState(group) === 'partial' ? 'translate-x-1.5' : 'translate-x-0.5'
                ]"
              />
            </div>
          </div>
          <!-- Group Items -->
          <div class="space-y-2">
            <div
              v-for="indicator in group.items"
              :key="indicator.key"
              class="flex items-center justify-between p-3 bg-[#252525] rounded-lg hover:bg-[#2a2a2a] transition-colors cursor-pointer"
              @click="toggleIndicator(indicator.key)"
            >
              <div>
                <div class="text-white text-sm font-medium">{{ indicator.label }}</div>
                <div class="text-[#666] text-xs mt-0.5">{{ indicator.description }}</div>
              </div>
              <div
                :class="[
                  'w-10 h-6 rounded-full transition-colors relative flex-shrink-0',
                  modelValue[indicator.key as keyof typeof modelValue] ? 'bg-[#3b82f6]' : 'bg-[#444]'
                ]"
              >
                <div
                  :class="[
                    'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                    modelValue[indicator.key as keyof typeof modelValue] ? 'translate-x-5' : 'translate-x-1'
                  ]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-4 py-3 border-t border-[#333]">
        <button
          @click="emit('close')"
          class="w-full px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm rounded-lg transition-colors"
        >
          完成
        </button>
      </div>
    </div>
  </div>
</template>
