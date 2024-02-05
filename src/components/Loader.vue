<template>
  <v-dialog
    v-model="store.loading"
    :class="{ 'dark-background': store.loadingBackground}"
    persistent
  >
    <div class="loading-overlay">
      <span class="loader" :style="store.loadingBackground ? 'border-color: #fff' : ''"></span>
    </div>
  </v-dialog>
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
  z-index: 10000;
}

.dark-background {
  pointer-events: all;
  background-color: rgba(0, 0, 0, 0.5);
}

.loader {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: inline-block;
  border-top: 3px solid #2a2a2a;
  border-right: 3px solid transparent;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
