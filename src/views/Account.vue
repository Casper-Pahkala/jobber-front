<template>
  <div class="main-wrapper">
    <div class="main-content">

      <div
       v-if="store.user"
      >
        <v-tabs
          class="d-none d-sm-flex mb-10 profile-tabs"
          v-model="accountTab"
        >
          <v-tab @click="changeTab('profile')" value="profile" class="text-none tab">Profiili</v-tab>
          <v-tab @click="changeTab('messages')" value="messages" class="text-none tab">Viestit</v-tab>
          <v-tab @click="changeTab('listings')" value="listings" class="text-none tab">Omat listaukset</v-tab>

          <div id="tabs-bottom">

          </div>
        </v-tabs>

        <v-window v-model="accountTab">
          <v-window-item value="profile">
            <profile></profile>
          </v-window-item>

          <v-window-item value="messages">
            <messages></messages>
          </v-window-item>

          <v-window-item value="listings">
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
import Profile from '@/components/Account/Profile.vue';
import Messages from '@/components/Account/Messages.vue';
import Listings from '@/components/Account/MyListings.vue';

const router = useRouter();
const route = useRoute();
const store = useAppStore();
let currentTab = route.name || '';

if (store.user) {

} else {
  store.loginDialogShowing = true;
}

const accountTab = ref('profile');
if (currentTab === 'messages') {
  accountTab.value = 'messages';
}
if (currentTab === 'listings') {
  accountTab.value = 'listings';
}
function changeTab(tab) {
  if (tab === 'profile') {
    router.replace(`/account`);
  } else {
    router.replace(`/account/${tab}`);
  }
}

const currentRoute = computed(() => {
  return route.name;
})

watch(currentRoute, async (newVal, oldVal) => {
  if (newVal === 'account') {
    newVal = 'profile';
  }
  accountTab.value = newVal;
});
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
</style>

<style>

</style>
