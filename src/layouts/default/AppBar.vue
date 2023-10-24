<template>
  <v-navigation-drawer v-model="drawer" temporary>
    <v-list>
      <!-- <v-list-item prepend-icon="mdi-home" title="Koti" @click="changeTab('')" :active="false"></v-list-item> -->
      <v-list-item prepend-icon="mdi-briefcase" title="Työt" @click="changeTab('jobs')" :active="false"></v-list-item>
      <v-list-item prepend-icon="mdi-account-group" title="Työntekijät" @click="changeTab('workers')" :active="false"></v-list-item>
      <v-list-item v-if="!store.user" prepend-icon="mdi-login" title="Kirjaudu sisään" @click="store.loginDialogShowing = true" :active="false"></v-list-item>
      <v-list-item v-if="!store.user" prepend-icon="mdi-plus" title="Luo käyttäjä" @click="store.registerDialogShowing = true" :active="false"></v-list-item>
      <v-list-item v-if="store.user" prepend-icon="mdi-account" title="Käyttäjä" @click="changeTab('account')" :active="false"></v-list-item>
      <v-list-item v-if="store.user" prepend-icon="mdi-message-text" title="Viestit" @click="changeTab('messages')" :active="false"></v-list-item>
    </v-list>
  </v-navigation-drawer>
  <v-app-bar>
    <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    <v-tabs
      v-model="store.tab"
    >
      <!-- <v-tab @click="changeTab('')" value="">Koti</v-tab> -->
      <v-tab @click="changeTab('jobs')" value="jobs">Työt</v-tab>
      <v-tab @click="changeTab('workers')" value="workers">Työntekijät</v-tab>
      <v-tab @click="changeTab('messages')" value="messages" v-if="store.user">Viestit</v-tab>
    </v-tabs>
    <template v-slot:append>
      <v-btn icon="mdi-heart"></v-btn>

      <!-- <v-btn icon="mdi-magnify"></v-btn> -->

      <v-btn icon="mdi-dots-vertical"></v-btn>
    </template>
  </v-app-bar>
</template>

<script setup>
import { useAppStore } from '@/store/app'
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router';

const store = useAppStore();
const drawer = ref(false);
const router = useRouter();
const route = useRoute();

let currentTab = route.name || '';
store.tab = currentTab;
const changeTab = (tab) => {
  drawer.value = false;
  store.tab = tab;
  router.push(`/${tab}`);
};

// changeTab('jobs');
</script>
