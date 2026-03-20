<script setup lang="ts">
const props = defineProps<{
  modelValue: {
    volume: boolean;
    institutional: boolean;
    macd: boolean;
    kd: boolean;
    rsi: boolean;
    bollinger: boolean;
  };
}>();

const emit = defineEmits<{
  'update:modelValue': [value: {
    volume: boolean;
    institutional: boolean;
    macd: boolean;
    kd: boolean;
    rsi: boolean;
    bollinger: boolean;
  }];
  close: [];
}>();

const toggleIndicator = (key: string) => {
  const currentValue = props.modelValue[key as keyof typeof props.modelValue];
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: !currentValue
  });
};

const indicators = [
  { key: 'volume', label: '成交量', description: '每日成交量柱狀圖' },
  { key: 'institutional', label: '法人買賣', description: '外資、投信、自營商買賣超' },
  { key: 'macd', label: 'MACD', description: 'MACD 指標 (DIF/DEA/柱狀)' },
  { key: 'kd', label: 'KD', description: 'KD 隨機指標' },
  { key: 'rsi', label: 'RSI', description: '相對強弱指標 (9/14日)' },
  { key: 'bollinger', label: '布林通道 %B', description: '布林帶百分比位置' },
];
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="emit('close')">
    <div class="bg-[#1a1a1a] border border-[#333] rounded-lg w-80 max-h-[80vh] overflow-hidden">
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
      <div class="p-4 space-y-3 overflow-y-auto max-h-[60vh]">
        <div
          v-for="indicator in indicators"
          :key="indicator.key"
          class="flex items-center justify-between p-3 bg-[#252525] rounded-lg hover:bg-[#2a2a2a] transition-colors cursor-pointer"
          @click="toggleIndicator(indicator.key)"
        >
          <div>
            <div class="text-white text-sm font-medium">{{ indicator.label }}</div>
            <div class="text-[#888] text-xs mt-0.5">{{ indicator.description }}</div>
          </div>
          <div
            :class="[
              'w-10 h-6 rounded-full transition-colors relative',
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
