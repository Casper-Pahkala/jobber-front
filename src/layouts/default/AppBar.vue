<template>
  <v-navigation-drawer v-model="drawer" temporary>
    <v-list>

      <template v-if="store.user">
        <v-list-item
          v-if="store.user.has_image"
          :prepend-avatar="`${store.url}/profile-image/${store.user.id}`"
          :title="store.user.first_name + ' ' + store.user.last_name"
          :subtitle="store.user.email"
          class="drawer-item pb-4 pt-2"
          :active="false"
          @click="changeTab('account')"
        >
        </v-list-item>

        <!-- <v-divider></v-divider> -->

        <v-list-item
          prepend-icon="mdi-message-text"
          title="Viestit"
          :active="false"
          @click="changeTab('messages')"
          class="drawer-item"
        >
        </v-list-item>

        <v-list-item
          prepend-icon="mdi-clipboard-account"
          title="Omat ilmoitukset"
          :active="false"
          @click="changeTab('my-listings')"
          class="drawer-item"
        >
        </v-list-item>

      </template>

      <template v-else>
        <v-list-item>
          <v-btn
          text="90"
          rounded="lg"
          class="text-none bg-primary mb-3 mt-2 drawer-login-btn"
          @click="store.loginDialogShowing = true"
        >Kirjaudu sisään</v-btn>
        </v-list-item>

      </template>

      <v-divider class="mt-2 mb-2"></v-divider>

      <!-- <v-list-item prepend-icon="mdi-home" title="Koti" @click="changeTab('')" :active="false"></v-list-item> -->
      <v-list-item prepend-icon="mdi-briefcase" title="Työt" @click="changeTab('jobs')" :active="false" class="drawer-item"></v-list-item>
      <v-list-item prepend-icon="mdi-account-group" title="Työntekijät" @click="changeTab('workers')" :active="false" class="drawer-item"></v-list-item>
      <!-- <v-divider v-if="!store.user"></v-divider>
      <v-list-item v-if="!store.user" prepend-icon="mdi-login" title="Kirjaudu sisään" @click="store.loginDialogShowing = true" :active="false" class="drawer-item"></v-list-item>
      <v-list-item v-if="!store.user" prepend-icon="mdi-plus" title="Luo käyttäjä" @click="store.registerDialogShowing = true" :active="false" class="drawer-item"></v-list-item> -->

      <v-divider class="mt-2 mb-2"></v-divider>

      <v-list-item prepend-icon="mdi-headset" title="Asiakastuki" @click="changeTab('jobs')" :active="false" class="drawer-item"></v-list-item>

      <v-list-item prepend-icon="mdi-information" title="Tietoa meistä" @click="changeTab('jobs')" :active="false" class="drawer-item"></v-list-item>

      <v-list-item prepend-icon="mdi-shield" title="Tietosuojaseloste" @click="changeTab('jobs')" :active="false" class="drawer-item"></v-list-item>

      <v-list-item prepend-icon="mdi-comment" title="Anna palautetta" @click="changeTab('jobs')" :active="false" class="drawer-item"></v-list-item>

      <template v-if="store.user">
        <v-divider class="mt-2 mb-2"></v-divider>

        <v-list-item
          prepend-icon="mdi-logout"
          title="Kirjaudu ulos"
          @click="logOut()"
          :active="false"
          class="drawer-item"
          >
        </v-list-item>
      </template>
    </v-list>
  </v-navigation-drawer>
  <v-app-bar>
    <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    <v-tabs
      class="d-none d-sm-flex"
      v-model="store.tab"
    >
      <template v-if="currentTabs === 'main'">
        <v-tab @click="changeTab('jobs')" value="jobs">Työt</v-tab>
        <v-tab @click="changeTab('workers')" value="workers">Työntekijät</v-tab>
      </template>

      <template v-else-if="currentTabs === 'account'">
        <v-tab @click="changeTab('account')" value="account">Profiili</v-tab>
        <v-tab @click="changeTab('messages')" value="messages">Viestit</v-tab>
        <v-tab @click="changeTab('my-listings')" value="my-listings">Omat listaukset</v-tab>
      </template>
    </v-tabs>
    <template v-slot:append>
      <template v-if="store.user">
        <v-btn icon="mdi-heart"></v-btn>

        <!-- <v-btn icon="mdi-magnify"></v-btn> -->

        <v-btn icon="mdi-dots-vertical"></v-btn>
      </template>

      <template v-else>
        <v-btn
          size="small"
          text="81"
          rounded="xl"
          class="text-none login-btn bg-primary"
          @click="store.loginDialogShowing = true"
        >Kirjaudu sisään</v-btn>
      </template>


    </template>
  </v-app-bar>
</template>

<script setup>
import { useAppStore } from '@/store/app'
import { ref, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router';

const store = useAppStore();
const drawer = ref(false);
const router = useRouter();
const route = useRoute();

const currentTabs = ref('');

let currentTab = route.name || '';
const previousTab = ref(currentTab);
store.tab = currentTab;
updateTabs(currentTab);
const changeTab = (tab) => {
  if (previousTab.value == tab) return;
  updateTabs(tab);
  previousTab.value = tab;
  setTimeout(() => {
    store.tab = tab;
    drawer.value = false;
    router.push(`/${tab}`);
  }, 10);

};

function logOut() {
  store.logOut().then((response) => {
    changeTab('jobs');
    })
    .catch(e => {
      changeTab('jobs');
    });
}

function updateTabs(tab) {
  const mainTabs = [
    'jobs',
    'workers',
    'job'
  ];

  const accountTabs = [
    'account',
    'messages',
    'my-listings'
  ];


  if (mainTabs.includes(tab)) {
    currentTabs.value = 'main';
  } else if (accountTabs.includes(tab)) {
    currentTabs.value = 'account';
  } else {
    currentTabs.value = '';
  }
}

const currentRoute = computed(() => {
  return route.name;
})

watch(currentRoute, async (newVal, oldVal) => {
  updateTabs(newVal);
  setTimeout(() => {
    store.tab = newVal;
  }, 10);
});
</script>

<style scoped>

  @media (max-width: 1199px) {
    .main-nav {
      display: none;
    }
  }


  .drawer-login-btn {
    width: 100%;
    height: 45px;
    font-size: 15px;
  }
</style>
