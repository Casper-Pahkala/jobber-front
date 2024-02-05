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
        >{{ $t('Kirjaudu sisään') }}</v-btn>
        </v-list-item>

      </template>

      <v-divider class="mt-2 mb-2"></v-divider>

      <v-list-item prepend-icon="mdi-briefcase" title="Työt" @click="changeTab('jobs')" :active="false" class="drawer-item"></v-list-item>
      <v-list-item prepend-icon="mdi-account-group" title="Henkilöt ja palvelut" @click="changeTab('workers')" :active="false" class="drawer-item"></v-list-item>
      <v-list-item prepend-icon="mdi-plus" title="Luo ilmoitus" @click="changeTab('add-job')" :active="false" class="drawer-item"></v-list-item>

      <v-divider class="mt-2 mb-2"></v-divider>

      <v-list-item prepend-icon="mdi-headset" title="Asiakastuki" @click="changeTab('jobs')" :active="false" class="drawer-item"></v-list-item>

      <v-list-item prepend-icon="mdi-information" title="Tietoa meistä" @click="changeTab('jobs')" :active="false" class="drawer-item"></v-list-item>

      <v-list-item prepend-icon="mdi-shield" title="Tietosuojakäytäntö" @click="changeTab('jobs')" :active="false" class="drawer-item"></v-list-item>

      <v-list-item prepend-icon="mdi-comment" title="Anna palautetta"  @click="openFeedback()" :active="false" class="drawer-item"></v-list-item>

      <v-divider class="mt-2 mb-2" v-if="!store.user"></v-divider>

      <v-list-item v-if="!store.user" prepend-icon="mdi-login" title="Kirjaudu sisään" @click="store.loginDialogShowing = true" :active="false" class="drawer-item"></v-list-item>
      <v-list-item v-if="!store.user" prepend-icon="mdi-plus" title="Luo käyttäjä" @click="store.registerDialogShowing = true" :active="false" class="drawer-item"></v-list-item>

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

    <v-app-bar flat class="app-bar" :class="{ scrolled: scrolled}" :elevation="scrolled ? 4 : 0">
      <div class="app-bar-content-wrapper">
        <div class="app-bar-content">

          <div>
            <v-app-bar-nav-icon @click.stop="drawer = !drawer" class="menu-btn" :ripple="false" flat v-if="store.window.width < 1199"></v-app-bar-nav-icon>
            <router-link to="/jobs" @click="updateTab('jobs')" v-if="store.window.width >= 1199">
              <div class="rekrytor-text">
                Rekrytor
              </div>
            </router-link>
          </div>
          <div class="tabs">
            <v-tabs
              class="d-none d-sm-flex"
              v-model="store.tab"
            >
              <v-tab @click="updateTab('jobs')" value="jobs" class="text-none tab" :ripple="false">
                <router-link to="/jobs" class="router-link">{{ $t('Avoimet työt') }}</router-link>
              </v-tab>
              <v-tab @click="updateTab('workers')" value="workers" class="text-none tab" :ripple="false">
                <router-link to="/workers" class="router-link">{{ $t('Henkilöt ja palvelut') }}</router-link>
              </v-tab>
            </v-tabs>
          </div>
            <div class="app-bar-append">
              <v-btn
                prepend-icon="mdi-plus"
                class="add-job-btn mr-5"
                style="height: 48px;"
                @click="changeTab('add-job')"
              >
                {{ $t('Luo ilmoitus') }}
              </v-btn>
              <template v-if="store.user">

                <v-menu
                  :class="{ 'light-theme': store.lightTheme }"
                  v-model="messagesMenu"
                  class="mr-1"
                  :close-on-content-click="false"
                  location="bottom end"
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
                  <v-card class="menu-card">
                    <v-card-title
                     style="font-size: 18px;"
                    >
                      {{ $t('Lukemattomat viestit') }}
                    </v-card-title>

                    <div class="show-all-messages" @click="changeTab('messages')">
                      {{ $t('Näytä kaikki') }}
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
                      {{ $t('Tyhjää täynnä') }}
                    </div>
                  </v-card>
                </v-menu>
                <v-menu
                  :class="{ 'light-theme': store.lightTheme }"
                  :close-on-content-click="false"
                  v-model="accountMenu"
                  location="bottom end"
                >
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon="mdi-account"
                      v-bind="props"
                    >
                    </v-btn>
                  </template>
                  <v-list
                    class="menu-card"
                    min-width="180px"
                  >
                  <template
                    v-for="(item, index) in accountItems"
                    :key="index"
                  >
                    <v-list-item
                      :value="index"
                      @click="item.onClick()"
                      v-if="item.element && item.element === 'theme'"
                    >
                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                        <template v-slot:append>
                          <v-switch
                            inset
                            hide-details
                            v-model="store.lightTheme"
                            density="compact"
                          ></v-switch>
                        </template>
                    </v-list-item>

                    <v-menu v-else-if="item.element && item.element === 'language'" location="left">
                      <template v-slot:activator="{ props }">
                        <v-list-item
                          v-bind="props"
                          :value="index"
                        >
                            <v-list-item-title>{{ item.title }}</v-list-item-title>
                            <template v-slot:append>
                              <img class="flag" :src="languageSrc()">
                            </template>
                        </v-list-item>
                      </template>
                      <v-list>

                        <v-list-item @click="changeLanguage('fi')">
                          <div class="list-language-item">
                            <img class="flag" src="/finnish_flag.png">
                            Suomi
                          </div>
                        </v-list-item>

                        <v-list-item @click="changeLanguage('sv')">
                          <div class="list-language-item">
                            <img class="flag" src="/swedish_flag.png">
                            Svenska
                          </div>
                        </v-list-item>

                        <v-list-item @click="changeLanguage('en')">
                          <div class="list-language-item">
                            <img class="flag" src="/english_flag.png">
                            English
                          </div>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                    <v-list-item
                      :value="index"
                      @click="item.onClick()"
                      :append-icon="item.icon ?? ''"
                      v-else
                    >
                      <v-list-item-title>{{ item.title }}</v-list-item-title>
                    </v-list-item>
                    </template>
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
                >{{ $t('Kirjaudu sisään') }}</v-btn>
              </template>
            </div>
        </div>
      </div>
    </v-app-bar>
</template>

<script setup>
import { useAppStore } from '@/store/app'
import { ref, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router';
import moment from 'moment';
import i18n from "@/i18n/i18n";
import { useTheme } from 'vuetify'

const theme = useTheme()
const store = useAppStore();
const drawer = ref(false);
const router = useRouter();
const route = useRoute();
const messagesMenu = ref(false);
const accountMenu = ref(false);
const scrolled = ref(false);
let currentTab = route.name || 'jobs';
store.tab = currentTab;

const accountTabs = [
  'account',
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
    if (tab === 'account') {
      router.push('/account');
    } else {
      router.push('/account/' + tab);
    }
    return;
  }
  setTimeout(() => {
    router.push(`/${tab}`);
  }, 10);

  setTimeout(() => {
    store.updateMainComponent++;
  }, 100);
}

function updateTab(tab) {
  messagesMenu.value = false;
  accountMenu.value = false;
  drawer.value = false;

  setTimeout(() => {
    store.tab = tab;
  }, 10);
}

function logOut() {
  accountMenu.value = false;
  drawer.value = false;
  store.logOut().then(() => {
    // router.replace('/')
  });
}

function openRecentMessage(message) {
  messagesMenu.value = false;
  store.openChat(message);
}

const accountItems = computed(() => {
  return [
  {
    title: i18n.global.t('Tili'),
    onClick: () => changeTab('account'),
    icon: 'mdi-account'
  },
  {
    title: i18n.global.t('Profiili'),
    onClick: () => changeTab('profile'),
    icon: 'mdi-account'
  },
  {
    title: i18n.global.t('Viestit'),
    onClick: () => changeTab('messages'),
    icon: 'mdi-message-text'
  },
  {
    title: i18n.global.t('Omat listaukset'),
    onClick: () => changeTab('listings'),
    icon: 'mdi-clipboard-account'
  },
  {
    title: i18n.global.t('Teema'),
    onClick: () => {
      store.lightTheme = !store.lightTheme;
      theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
    },
    element: 'theme'
  },
  {
    title: i18n.global.t('Kieli'),
    onClick: () => {
    },
    element: 'language'
  },
  {
    title: i18n.global.t('Kirjaudu ulos'),
    onClick: () => logOut(),
    icon: 'mdi-logout'
  }
];
})


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

function openFeedback() {
  store.feedbackDialog = true;
  drawer.value = false;
}

window.addEventListener("scroll", function(ev){
  if (window.scrollY > 0) {
    scrolled.value = true;
  } else {
    scrolled.value = false;
  }
});

function changeLanguage(language) {
  i18n.global.locale = language;
  localStorage.setItem('locale', language);
}

function languageName() {
  switch (i18n.global.locale) {
    case 'fi':
      return 'Suomi'
    case 'sv':
      return 'Svenska'
    case 'en':
      return 'English'
    default:
      return 'Suomi'
  }
}

function languageSrc() {
  switch (i18n.global.locale) {
    case 'fi':
      return '/finnish_flag.png'
    case 'sv':
      return '/swedish_flag.png'
    case 'en':
      return '/english_flag.png'
    default:
      return '/finnish_flag.png'
  }
}

if (window.scrollY > 0) {
  scrolled.value = true;
} else {
  scrolled.value = false;
}
</script>

<style scoped>


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

  .app-bar-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  .app-bar {
    background: var(--main-bg-color) !important;
    height: var(--app-bar-height);
  }

  .app-bar.scrolled {
    background: var(--app-bar-bg-color) !important;
    transition: 0.3s ease;
  }

  .app-bar-content-wrapper {
    position: absolute;
    max-width: 1200px;
    left: 50% !important;
    transform: translateX(-50%) !important;
    width: 100%;
    height: 100%;
  }

  .tabs {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }

  .rekrytor-text {
    font-size: 28px;
    font-weight: 600;
    padding-left: 15px;
  }

  .rekrytor-text, .app-bar-append {
    width: 400px;
    flex-shrink: 0;
  }

  .app-bar-append {
    display: flex;
    align-items: center;
    justify-content: end;
  }

  .router-link {
    text-decoration: none;
    color: inherit;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .menu-btn {
    font-size: 20px;
  }

  .app-bar-content {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 5px;
  }

  .flag {
    height: 20px;
  }

  .list-language-item {
    display: flex;
    align-items: center;
    gap: 15px;
    cursor: pointer;
  }

  @media (max-width: 1199px) {
    .add-job-btn {
      display: none;
    }

    .rekrytor-text, .app-bar-append {
      width: 150px;
    }

    .login-btn {
      margin-right: 10px;
    }
  }

  @media (max-width: 640px) {
    .tabs {
      display: none;
    }
  }
</style>
