<template>
  <router-view />
</template>

<script setup>

import { useAppStore } from '@/store/app';
import { ref, computed } from 'vue';

const store = useAppStore();

store.initializeAxios();

store.auth_token = window.auth_token;
if (store.auth_token) {
  store.getUser().then((response) => {
  })
}


</script>

<style>

body, html {
  min-width: 370px;
}

.dialog-close-btn {
  position: absolute !important;
  top: 5px;
  right: 5px;
}
</style>
