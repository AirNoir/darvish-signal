<script setup lang="ts">
// Root App component - provides router-view + 全域登入 modal
import LoginModal from './components/LoginModal.vue';
</script>

<template>
  <router-view />
  <LoginModal />
</template>
