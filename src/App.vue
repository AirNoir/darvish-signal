<script setup lang="ts">
// Root App component - provides router-view + 全域登入 modal
import LoginModal from './components/LoginModal.vue';
import { useAuthStore } from './stores/authStore';

// 啟動時用保存的 JWT 還原並向 AccountService 驗證登入狀態
void useAuthStore().validate();
</script>

<template>
  <router-view />
  <LoginModal />
</template>
