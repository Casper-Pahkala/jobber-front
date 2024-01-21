<template>
  <div class="main-wrapper">
    <div class="main-content">

      <div
       v-if="store.user"
      >
        <v-tabs
          class="d-sm-flex profile-tabs"
          v-model="accountTab"
        >
        <v-tab @click="changeTab('account')" value="account" class="text-none tab">{{ $t('Tili') }}</v-tab>
          <v-tab @click="changeTab('profile')" value="profile" class="text-none tab">{{ $t('Profiili') }}</v-tab>
          <v-tab @click="changeTab('messages')" value="messages" class="text-none tab">{{ $t('Viestit') }}</v-tab>
          <v-tab @click="changeTab('listings')" value="listings" class="text-none tab">{{ $t('Omat listaukset') }}</v-tab>

          <div id="tabs-bottom">

          </div>
        </v-tabs>

        <v-window v-model="accountTab" class="pt-10" disabled>
          <v-window-item value="account" class="window">
            <account></account>
          </v-window-item>

          <v-window-item value="profile" class="window">
            <profile></profile>
          </v-window-item>

          <v-window-item value="messages" class="window">
            <messages></messages>
          </v-window-item>

          <v-window-item value="listings" class="window">
            <listings></listings>
          </v-window-item>
        </v-window>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useAppStore } from '@/store/app';
import { useRouter, useRoute } from 'vue-router';
import Account from '@/components/Account/Account.vue';
import Profile from '@/components/Account/Profile.vue';
import Messages from '@/components/Account/Messages.vue';
import Listings from '@/components/Account/MyListings.vue';

const router = useRouter();
const route = useRoute();
const store = useAppStore();
let currentTab = route.name || '';

if (!store.user) {
  store.loginDialogShowing = true;
}

const accountTab = ref('account');
if (currentTab === 'profile') {
  accountTab.value = 'profile';
}
if (currentTab === 'messages') {
  accountTab.value = 'messages';
}
if (currentTab === 'listings') {
  accountTab.value = 'listings';
}
function changeTab(tab) {
  if (tab === 'account') {
    router.replace(`/account`);
  } else {
    router.replace(`/account/${tab}`);
  }
}
</script>

<style scoped>
  .main-wrapper {
    display: flex;
    justify-content: center;
  }
  .main-content {
    max-width: 1000px;
    width: 100%;
    /* padding-top: 40px; */
  }

/* #tabs-bottom {
  position: absolute;
  bottom: 0;
  height: 2px;
  background-color: #acacac;
  width: 100%;
} */

.tab {
  /* border-top-right-radius: 10px;
  border-top-left-radius: 10px; */
}

.window {
  min-height: calc(100vh - var(--app-bar-height) - 98px);
  padding: 0 15px;
  display: flex;
  flex-direction: column;
}

.profile-tabs {
  padding: 0 15px;
}
</style>

<style>

</style>
