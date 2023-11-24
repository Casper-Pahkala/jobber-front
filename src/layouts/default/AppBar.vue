<template>
  <v-navigation-drawer v-model="drawer" temporary>
    <v-list>

      <template v-if="store.user">
        <v-list-item
          v-if="store.user.has_image"
          :prepend-avatar="store.user.profileImageUrl"
          :title="store.user.first_name + ' ' + store.user.last_name"
          :subtitle="store.user.email"
          class="drawer-item pb-4 pt-2"
          :active="false"
          @click="changeTab('profile')"
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
          @click="changeTab('listings')"
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
      <v-list-item prepend-icon="mdi-account-group" title="Henkilöt ja palvelut" @click="changeTab('workers')" :active="false" class="drawer-item"></v-list-item>
      <!-- <v-divider v-if="!store.user"></v-divider>
      <v-list-item v-if="!store.user" prepend-icon="mdi-login" title="Kirjaudu sisään" @click="store.loginDialogShowing = true" :active="false" class="drawer-item"></v-list-item>
      <v-list-item v-if="!store.user" prepend-icon="mdi-plus" title="Luo käyttäjä" @click="store.registerDialogShowing = true" :active="false" class="drawer-item"></v-list-item> -->

      <v-divider class="mt-2 mb-2"></v-divider>

      <v-list-item prepend-icon="mdi-headset" title="Asiakastuki" @click="changeTab('jobs')" :active="false" class="drawer-item"></v-list-item>

      <v-list-item prepend-icon="mdi-information" title="Tietoa meistä" @click="changeTab('jobs')" :active="false" class="drawer-item"></v-list-item>

      <v-list-item prepend-icon="mdi-shield" title="Tietosuojakäytäntö" @click="changeTab('jobs')" :active="false" class="drawer-item"></v-list-item>

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
      <!-- <template v-if="currentTabs === 'main'"> -->
        <v-tab @click="changeTab('jobs')" value="jobs" class="text-none tab">Avoimet työt</v-tab>
        <v-tab @click="changeTab('workers')" value="workers" class="text-none tab">Henkilöt ja palvelut</v-tab>
      <!-- </template> -->

      <!-- <template v-else-if="currentTabs === 'account'">
        <v-tab @click="changeTab('account')" value="account" class="text-none tab">Profiili</v-tab>
        <v-tab @click="changeTab('messages')" value="messages" class="text-none tab">Viestit</v-tab>
        <v-tab @click="changeTab('listings')" value="listings" class="text-none tab">Omat listaukset</v-tab>
      </template> -->
    </v-tabs>
    <template v-slot:append>
      <template v-if="store.user">
        <v-btn
          prepend-icon="mdi-plus"
          class="mr-5"
          style="height: 100%;"
          @click="changeTab('add-job')"
        >
          Luo listaus
        </v-btn>

        <v-menu
          v-model="messagesMenu"
          class="mr-1"
          :close-on-content-click="false"
        >
          <template v-slot:activator="{ props }">
            <div class="unseen-wrapper">
              <v-btn
                icon="mdi-message-text"
                v-bind="props"
              >
              </v-btn>
              <div
                class="unseen-count"
                v-if="recentMessages.length > 0"
              >
                {{ allUnseenMessages.length }}
              </div>
            </div>

          </template>
          <v-card>
            <v-card-title
             style="font-size: 18px;"
            >
              Lukemattomat viestit
            </v-card-title>

            <div class="show-all-messages" @click="changeTab('messages')">
              Näytä kaikki
            </div>
            <v-divider></v-divider>
            <v-list
             v-if="recentMessages.length > 0"
              class="recent-messages"
            >
              <v-list-item
                v-for="(item, index) in recentMessages"
                :key="index"
                :value="index"
                class="pt-4 pb-4"
                @click="openRecentMessage(item)"
              >
                <template v-slot:prepend>
                  <div class="not-seen"></div>
                  <v-avatar size="50px">
                    <v-img
                      alt="Avatar"
                      :src="`${store.url}/profile-image/${item.other_user_id}.jpg`"
                    ></v-img>
                  </v-avatar>
                </template>

                <v-list-item-title>{{ item.other_full_name }}</v-list-item-title>
                <v-list-item-subtitle style="opacity: 1;" class="pt-1">{{ item.job_title }}</v-list-item-subtitle>
                <v-list-item-subtitle class="pt-1">
                  <div class="latest-message">
                    <div class="message">
                      {{ item.message }}
                    </div>

                    <v-icon
                      icon="mdi-circle"
                      size="6"
                    >
                    </v-icon>

                    {{ timeFromDate(item.time) }}
                  </div>
                </v-list-item-subtitle>
                <div class="messages-count">
                  {{ allMessagesCount(item) }}
                </div>
              </v-list-item>
            </v-list>

            <div v-else class="no-messages-text">
              Tyhjää täynnä
            </div>
          </v-card>
        </v-menu>
        <v-menu
          :close-on-content-click="false"
          v-model="accountMenu"
        >
          <template v-slot:activator="{ props }">
            <v-btn
              icon="mdi-account"
              v-bind="props"
            >
            </v-btn>
          </template>
          <v-list
          min-width="180px"
          >
            <v-list-item
              v-for="(item, index) in accountItems"
              :key="index"
              :value="index"
              @click="item.onClick()"
              :append-icon="item.icon ?? ''"
            >
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
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
import moment from 'moment';

const store = useAppStore();
const drawer = ref(false);
const router = useRouter();
const route = useRoute();
const currentTabs = ref('');
const messagesMenu = ref(false);
const accountMenu = ref(false);

let currentTab = route.name || '';
store.tab = currentTab;

const accountTabs = [
  'profile',
  'messages',
  'listings'
];

function changeTab(tab) {
  messagesMenu.value = false;
  accountMenu.value = false;
  drawer.value = false;

  if (accountTabs.includes(tab)) {
    store.tab = 'account';
    if (tab === 'profile') {
      router.push('/account');
    } else {
      router.push('/account/' + tab);
    }
    return;
  }
  setTimeout(() => {
    router.push(`/${tab}`);
    store.tab = tab;
  }, 10);

  setTimeout(() => {
    store.updateMainComponent++;
  }, 100);
}

function logOut() {
  store.logOut().then((response) => {
    changeTab('jobs');
    })
    .catch(e => {
      changeTab('jobs');
    });
}

function openRecentMessage(message) {
  messagesMenu.value = false;
  store.openChat(message);
}

const accountItems = [
  {
    title: 'Tili',
    onClick: () => changeTab('profile'),
    // icon: 'mdi-account'
  },
  {
    title: 'Viestit',
    onClick: () => changeTab('messages'),
    // icon: 'mdi-message-text'
  },
  {
    title: 'Omat listaukset',
    onClick: () => changeTab('listings'),
    // icon: 'mdi-clipboard-account'
  },
  {
    title: 'Kirjaudu ulos',
    onClick: () => logOut(),
    icon: 'mdi-logout'
  }
];

const recentMessages = computed(() => {
  return store.unseenMessages;
});

const allUnseenMessages = computed(() => {
  return store.allUnseenMessages;
})

function allMessagesCount(message) {
  return allUnseenMessages.value.filter(m => m.job_hashed_id === message.job_hashed_id && m.other_user_id === message.other_user_id).length;
}




setTimeout(() => {
  store.tab = currentTab;
}, 1);


function timeFromDate (date) {
  if (moment(date).isSame(moment(), 'day')) {
    return 'Tänään ' + moment(date).format('HH:mm');
  } else if (moment(date).isSame(moment().clone().subtract(1, 'days'), 'day')) {
    return 'Eilen ' + moment(date).format('HH:mm');
  }
  return moment(date).format('DD.MM HH:mm');
}

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

  .recent-messages {
    width: 450px;
    max-height: 300px;
  }

  .no-messages-text {
    width: 350px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
  }


  /* Custom scrollbar styles */
  .recent-messages::-webkit-scrollbar {
    width: 6px; /* Scrollbar width */
    display: none;
  }

  .recent-messages::-webkit-scrollbar-track {
    background: #fff; /* Track color */
  }

  .recent-messages::-webkit-scrollbar-thumb {
    background: #888; /* Handle color */
  }

  .recent-messages::-webkit-scrollbar-thumb:hover {
    background: #555; /* Handle color on hover */
  }

  .recent-messages:hover::-webkit-scrollbar {
    display: block;
  }

  .not-seen {
    height: 5px;
    width: 5px;
    left: 6px;
    position: absolute;
    border-radius: 2.5px;
    background-color: #3ea6ff;
  }

  .show-all-messages {
    position: absolute;
    right: 10px;
    top: 10px;
    color: #1565C0;
    cursor: pointer;
  }

  .unseen-count {
    position: absolute;
    top: 5px;
    right: 5px;
    background-color: #3ea6ff;
    font-size: 13px;
    border-radius: 50%;
    width: 20px;
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 20px;
    pointer-events: none;
  }

  .unseen-wrapper {
    position: relative;
  }

  .tab {
    letter-spacing: 0.001rem;
    font-size: 1rem;
    font-weight: 700;
    color: #373737;
  }

  .messages-count {
    position: absolute;
    right: 30px;
    top: 20px;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    background-color: #3ea6ff;
    /* transform: translateY(-50%); */
  }

  .latest-message {
    display: flex;
    gap: 10px;
    align-items: center;
    font-size: 16px;
  }

  .message {
    max-width: 50%;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
</style>

<style>
  .v-slide-group-item--active {
    color: #000 !important;
  }
</style>
