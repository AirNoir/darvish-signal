<script setup lang="ts">
import { ref } from 'vue';
import { useWatchlistStore, MAX_GROUPS } from '../stores/watchlistStore';

const emit = defineEmits<{ close: [] }>();

const watchlist = useWatchlistStore();
const editingId = ref<string | null>(null);
const editingName = ref('');
const newGroupName = ref('');

// 編輯名稱時自動 focus + 全選
const vFocus = {
  mounted(el: HTMLElement) {
    el.focus();
    if (el instanceof HTMLInputElement) el.select();
  }
};

const startEdit = (id: string, name: string) => {
  editingId.value = id;
  editingName.value = name;
};

const confirmEdit = () => {
  if (editingId.value) {
    watchlist.renameGroup(editingId.value, editingName.value);
  }
  editingId.value = null;
};

const handleAdd = () => {
  const group = watchlist.addGroup(newGroupName.value);
  if (group) newGroupName.value = '';
};

const handleRemove = (id: string, name: string, count: number) => {
  const msg = count > 0
    ? `確定要刪除「${name}」嗎？群組內的 ${count} 檔個股將一併移除。`
    : `確定要刪除「${name}」嗎？`;
  if (window.confirm(msg)) {
    watchlist.removeGroup(id);
  }
};
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
      <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="emit('close')"></div>

      <div class="relative w-full sm:max-w-md bg-[#141414] border border-white/10 rounded-t-2xl sm:rounded-2xl shadow-2xl">
        <!-- Header -->
        <div class="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/5">
          <div>
            <h2 class="text-white text-base font-bold">管理群組</h2>
            <p class="text-xs text-gray-500 mt-0.5">{{ watchlist.groups.length }}/{{ MAX_GROUPS }} 個群組</p>
          </div>
          <button @click="emit('close')" class="p-1 text-gray-500 hover:text-white transition-colors" aria-label="關閉">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Group list -->
        <div class="px-3 py-3 flex flex-col gap-1 max-h-[50vh] overflow-y-auto">
          <div
            v-for="group in watchlist.groups"
            :key="group.id"
            class="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <!-- 名稱 / 編輯輸入框 -->
            <template v-if="editingId === group.id">
              <input
                v-model="editingName"
                v-focus
                type="text"
                maxlength="12"
                @keydown.enter="confirmEdit"
                @keydown.escape="editingId = null"
                class="flex-1 px-2 py-1 bg-[#1e1e1e] border border-[#3b82f6] rounded text-sm text-white focus:outline-none"
              />
              <button @click="confirmEdit" class="px-2 py-1 text-xs text-blue-400 hover:text-blue-300 shrink-0">確定</button>
            </template>
            <template v-else>
              <div class="flex-1 min-w-0">
                <span class="text-sm text-gray-200 truncate">{{ group.name }}</span>
                <span class="text-xs text-gray-600 ml-2">{{ group.symbols.length }} 檔</span>
              </div>
              <button
                @click="startEdit(group.id, group.name)"
                class="p-1.5 text-gray-500 hover:text-white transition-colors shrink-0"
                aria-label="重新命名"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click="handleRemove(group.id, group.name, group.symbols.length)"
                class="p-1.5 text-gray-500 hover:text-red-400 transition-colors shrink-0"
                aria-label="刪除群組"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </template>
          </div>
        </div>

        <!-- Add group -->
        <div class="px-5 pb-5 pt-2 border-t border-white/5">
          <div v-if="watchlist.canAddGroup" class="flex items-center gap-2">
            <input
              v-model="newGroupName"
              type="text"
              maxlength="12"
              placeholder="新群組名稱（可留空）"
              @keydown.enter="handleAdd"
              class="flex-1 px-3 py-2 bg-[#1e1e1e] border border-[#333] rounded-lg text-base md:text-sm text-white placeholder-[#666] focus:outline-none focus:border-[#3b82f6] transition-colors"
            />
            <button
              @click="handleAdd"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors shrink-0"
            >
              新增群組
            </button>
          </div>
          <p v-else class="text-xs text-gray-500 text-center py-1">已達群組上限（{{ MAX_GROUPS }} 個）</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>
