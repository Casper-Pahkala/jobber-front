<template>
  <v-dialog v-model="store.loginDialogShowing" max-width="500" persistent class="login-dialog" :class="{ 'light-theme': store.lightTheme }">
  <v-card class="login-card">
    <v-card-title class="headline pa-4">
      {{ $t('Kirjaudu sisään') }}
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text class="pa-4">
      <v-alert
        type="error"
        prominent
        dense
        v-if="!isValidUser"
        @click="isValidUser = true">
        <v-row align="center">
          <v-col class="flex-grow-1">
            {{ $t('Kirjautuminen epäonnistui: Väärä sähköposti tai salasana') }}
          </v-col>
        </v-row>
      </v-alert>
      <v-form @submit.prevent="login">
        <v-text-field
          :theme="store.theme"
          v-model="email"
          label="Sähköposti"
          outlined
          type="email"
          name="email"
          :error="!isValidUser"
          class="my-2"
        ></v-text-field>
        <v-text-field
          :theme="store.theme"
          v-model="password"
          label="Salasana"
          outlined
          type="password"
          name="password"
          :error="!isValidUser"
          class="my-2"
        ></v-text-field>
        <v-col class="pa-0">
          <v-btn type="submit" color="primary" elevation="2" class="submit-btn">{{ $t('Kirjaudu sisään') }}</v-btn>
        </v-col>
      </v-form>
      <div class="new-account-text mt-5">
        {{ $t('Uusi käyttäjä?') }}
        <a class="create-account-btn" @click="toRegister()">Luo käyttäjä</a>
      </div>
    </v-card-text>

    <v-card-text class="terms pa-4">
      {{ $t('Kirjautumalla sisään hyväksyt') }}
      <a class="link">
        {{ $t('Käyttöehdot') }}
      </a>
      {{ $t('ja') }}
      <a class="link">
        {{ $t('Yksityisyydensuojan') }}
      </a>
    </v-card-text>

    <v-btn icon @click="store.loginDialogShowing = false" class="dialog-close-btn" flat  :color="store.lightTheme ? 'white' : 'grey-darken-4'">
      <v-icon>mdi-close</v-icon>
    </v-btn>
  </v-card>
</v-dialog>
</template>

<script setup>
import { ref } from 'vue';
import { useAppStore } from '@/store/app';
import { useRouter } from 'vue-router';

const router = useRouter();
const store = useAppStore();
const email = ref(null);
const password = ref(null);
const isValidUser = ref(true);

function login() {
  let payload = {
    email: email.value,
    password: password.value,
  };
  store.loading = true;
  store.loadingBackground = true;
  store.login(payload).then((response) => {
    if (response.status != 'error' && response.token) {
      store.loginDialogShowing = false;
      store.auth_token = response.token;
      setTimeout(() => {
        store.getUser().then(() => {
          store.loading = false;
          store.loadingBackground = false;
          store.snackbarText = 'Kirjauduit sisään';
          store.snackbarColor = 'green-darken-2';
          store.snackbar = true;

          // store.updateMainComponent++;

          if (store.redirect) {
            router.replace({ path: '/' + store.redirect.url })
            store.tab = store.redirect.tab;
          }

          // store.preloadImage(`${store.url}/profile-image/${store.user.id}`);
          store.userInit();
        });
      }, 10);
    } else {
      store.loading = false;
      store.loadingBackground = false;
      isValidUser.value = false;
    }
  }).catch(() => {
    store.loading = false;
    store.loadingBackground = false;
    store.errorToast('Kirjautuminen epäonnistui');
  });
}

function toRegister() {
  // store.loginDialogShowing = false;
  store.registerDialogShowing = true;
}

</script>

<style scoped>
.fill-height {
  height: 100vh;
}
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
}
.headline {
  text-align: center;
  font-size: 25px;
}

.new-account-text {
  font-size: 14px;
}

.create-account-btn {
  color: #1565C0;
  cursor: pointer;
}

.create-account-btn:hover {
  text-decoration: underline;
}

.submit-btn {
  width: 100%;
  height: 50px;
}

.terms {
  font-size: 14px !important;
}

.link {
  color: #1565C0;
  cursor: pointer;
  text-decoration: underline;
}

.login-card {
  background-color: var(--card-bg-color);
}
</style>
