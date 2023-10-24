<template>
  <div class="loading-overlay" v-if="store.loading">
    <v-progress-circular
      indeterminate
      color="primary"
    ></v-progress-circular>
  </div>
</template>

<script setup>
import { useAppStore } from '@/store/app';

const store = useAppStore();
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  pointer-events: all;
  z-index: 10000;
}
</style>
