<template>
  <template v-if="store.allowed">
    <router-view />
  </template>

  <template v-else>

    <v-container id="main">
      <v-card width="400px" class="pa-10" elevation="10">
        <v-card-title>
          Syötä salasana jatkaaksesi
        </v-card-title>
        <v-text-field
          v-model="password"
          label="Salasana"
          type="password"
          :error="passwordError"
          @keyup.enter="checkPassword"
        ></v-text-field>
        <v-btn @click="checkPassword" color="primary" width="100%" height="50px">Jatka</v-btn>
      </v-card>
    </v-container>

  </template>
</template>

<script setup>

import { useAppStore } from '@/store/app';
import { ref } from 'vue';
import i18n from "@/i18n/i18n";

const locale = localStorage.getItem('locale');

if (locale) {
  i18n.global.locale = locale;
}
// i18n.global.locale = 'en';
const store = useAppStore();

store.initializeAxios();
// if (!store.auth_token) {
//   store.auth_token = window.auth_token;
// }
if (store.auth_token) {
  store.getUser().then((response) => {
    store.userInit();
  })
}

setTimeout(() => {
  // store.maintenanceDialog = true;
}, 1000);

const password = ref(null);
const passwordError = ref(false);

function checkPassword() {
  if (password.value == 'cassu') {
    store.allowed = true;
  } else {
    passwordError.value = true;
  }
}

</script>

<style scoped>
  #main {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>

<style>

.area-chip {
  padding: 2px 15px;
  background-color: #e7e7e7;
  border-radius: 30px;
  text-wrap: nowrap;
  background-color: var(--main-light-color);
}

.area-container {
  display: flex;
  gap: 5px;
}
body, html {
  min-width: 370px;
}

.dialog-close-btn {
  position: absolute !important;
  top: 5px;
  right: 5px;
}

.cursor-default {
  cursor: default;
  pointer-events: all;
}

main {
  background-color: var(--main-bg-color);
}

a {
  text-decoration: none;
  color: inherit;
}

.v-main {
  padding-top: var(--app-bar-height) !important;
}

</style>
