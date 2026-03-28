<script setup lang="ts">
import { computed, ref } from 'vue';
import type { IndicatorSettings } from '../types';

const props = defineProps<{
  modelValue: IndicatorSettings;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: IndicatorSettings];
  close: [];
}>();

const MAX_INDICATORS = 6;
const warningMessage = ref<string | null>(null);
let warningTimeout: ReturnType<typeof setTimeout> | null = null;

const showWarning = (message: string) => {
  warningMessage.value = message;
  if (warningTimeout) clearTimeout(warningTimeout);
  warningTimeout = setTimeout(() => {
    warningMessage.value = null;
  }, 3000);
};

// 計算目前啟用的指標數量（以圖表為單位）
const enabledChartCount = computed(() => {
  const v = props.modelValue;
  let count = 0;
  if (v.volume) count++;
  if (v.turnoverRate) count++;
  if (v.volumeMA) count++;
  if (v.foreignNet) count++;
  if (v.foreignNetMA) count++;
  if (v.trustNet) count++;
  if (v.marginBalance || v.marginChange) count++;
  if (v.shortBalance || v.shortChange) count++;
  if (v.shortMarginRatio) count++;
  if (v.macd) count++;
  if (v.kd) count++;
  if (v.rsi) count++;
  if (v.bollinger) count++;
  return count;
});

// 計算開啟某個指標後會新增多少圖表
const getChartDelta = (key: string): number => {
  const v = props.modelValue;

  // 融資：marginBalance 和 marginChange 共用一個圖表
  if (key === 'marginBalance') {
    return (!v.marginBalance && !v.marginChange) ? 1 : 0;
  }
  if (key === 'marginChange') {
    return (!v.marginBalance && !v.marginChange) ? 1 : 0;
  }
  // 融券：shortBalance 和 shortChange 共用一個圖表
  if (key === 'shortBalance') {
    return (!v.shortBalance && !v.shortChange) ? 1 : 0;
  }
  if (key === 'shortChange') {
    return (!v.shortBalance && !v.shortChange) ? 1 : 0;
  }
  // 其他指標都是獨立圖表
  return 1;
};

// 檢查某個指標是否可以被開啟
const canEnableIndicator = (key: string): boolean => {
  const isCurrentlyOn = props.modelValue[key as keyof IndicatorSettings];
  if (isCurrentlyOn) return true; // 已開啟的可以關閉
  const delta = getChartDelta(key);
  return enabledChartCount.value + delta <= MAX_INDICATORS;
};

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
      { key: 'foreignNetMA', label: '外資買超均線', description: '外資買超 5/10/15/30 日均線' },
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
  const newState = !currentValue;

  // 檢查是否會超過限制
  if (newState && !canEnableIndicator(key)) {
    showWarning(`最多只能同時觀看 ${MAX_INDICATORS} 個指標`);
    return;
  }

  emit('update:modelValue', {
    ...props.modelValue,
    [key]: newState
  });
};

// Toggle all indicators
const toggleAll = (on: boolean) => {
  if (on) {
    // 開啟全部時提示限制
    showWarning(`最多只能同時觀看 ${MAX_INDICATORS} 個指標，將只開啟前 ${MAX_INDICATORS} 個`);
  }
  const newValue = { ...props.modelValue };
  for (const key of allKeys) {
    (newValue as Record<string, boolean>)[key] = on;
  }
  emit('update:modelValue', newValue as IndicatorSettings);
};

// Toggle group
const toggleGroup = (group: typeof indicatorGroups[0]) => {
  const state = getGroupState(group);
  const targetState = state === 'all' ? false : true; // If all on, turn off; otherwise turn on

  // 如果要開啟，計算會新增多少圖表
  if (targetState) {
    let addCount = 0;
    for (const item of group.items) {
      if (!props.modelValue[item.key as keyof IndicatorSettings]) {
        addCount += getChartDelta(item.key);
      }
    }
    if (enabledChartCount.value + addCount > MAX_INDICATORS) {
      showWarning(`最多只能同時觀看 ${MAX_INDICATORS} 個指標`);
      return;
    }
  }

  const newValue = { ...props.modelValue };
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
          <span class="text-[#666] text-xs">({{ enabledChartCount }}/{{ MAX_INDICATORS }})</span>
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

      <!-- Warning Message -->
      <div
        v-if="warningMessage"
        class="mx-4 mt-3 p-2 bg-[#f59e0b]/20 border border-[#f59e0b]/50 rounded-lg text-[#f59e0b] text-xs flex items-center gap-2"
      >
        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        {{ warningMessage }}
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
              :class="[
                'flex items-center justify-between p-3 rounded-lg transition-colors',
                canEnableIndicator(indicator.key)
                  ? 'bg-[#252525] hover:bg-[#2a2a2a] cursor-pointer'
                  : 'bg-[#1f1f1f] cursor-not-allowed opacity-50'
              ]"
              @click="toggleIndicator(indicator.key)"
            >
              <div>
                <div :class="canEnableIndicator(indicator.key) ? 'text-white' : 'text-[#666]'" class="text-sm font-medium">{{ indicator.label }}</div>
                <div class="text-[#666] text-xs mt-0.5">{{ indicator.description }}</div>
              </div>
              <div
                :class="[
                  'w-10 h-6 rounded-full transition-colors relative flex-shrink-0',
                  modelValue[indicator.key as keyof typeof modelValue]
                    ? 'bg-[#3b82f6]'
                    : canEnableIndicator(indicator.key)
                      ? 'bg-[#444]'
                      : 'bg-[#333]'
                ]"
              >
                <div
                  :class="[
                    'absolute top-1 w-4 h-4 rounded-full transition-transform',
                    modelValue[indicator.key as keyof typeof modelValue] ? 'translate-x-5' : 'translate-x-1',
                    canEnableIndicator(indicator.key) ? 'bg-white' : 'bg-[#555]'
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
