<script setup lang="ts">
import type { IndicatorSettings } from '../types';

const props = defineProps<{
  modelValue: IndicatorSettings;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: IndicatorSettings];
  close: [];
}>();

const toggleIndicator = (key: string) => {
  const currentValue = props.modelValue[key as keyof IndicatorSettings];
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: !currentValue
  });
};

const indicatorGroups = [
  {
    title: '價量指標',
    items: [
      { key: 'volume', label: '成交量', description: '每日成交量柱狀圖' },
      { key: 'turnoverRate', label: '週轉率', description: '成交量/流通股數' },
      { key: 'volumeMA', label: '成交均量', description: '5/10/20日成交量均線' },
    ]
  },
  {
    title: '法人買賣',
    items: [
      { key: 'foreignNet', label: '外資買賣超', description: '外資買賣超張數' },
      { key: 'trustNet', label: '投信買賣超', description: '投信買賣超張數' },
    ]
  },
  {
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
    title: '技術指標',
    items: [
      { key: 'rsi', label: 'RSI', description: '相對強弱指標 (9/14日)' },
      { key: 'macd', label: 'MACD', description: 'MACD 指標 (DIF/DEA/柱狀)' },
      { key: 'bollinger', label: '布林通道', description: '布林帶 %B 指標' },
      { key: 'kd', label: 'KD', description: 'KD 隨機指標' },
    ]
  },
];
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="emit('close')">
    <div class="bg-[#1a1a1a] border border-[#333] rounded-lg w-96 max-h-[85vh] overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-[#333]">
        <h3 class="text-white font-medium">指標設定</h3>
        <button @click="emit('close')" class="text-[#888] hover:text-white transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Indicator List -->
      <div class="p-4 space-y-4 overflow-y-auto max-h-[65vh]">
        <div v-for="group in indicatorGroups" :key="group.title">
          <h4 class="text-[#888] text-xs font-medium mb-2 uppercase tracking-wider">{{ group.title }}</h4>
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
