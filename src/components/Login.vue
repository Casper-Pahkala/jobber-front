<template>
  <v-dialog
  v-model="store.loginDialogShowing"
  max-width="500"
  >
    <v-card min-width="300">
      <v-card-title class="headline">Kirjaudu sisään</v-card-title>
      <v-alert
        class="ma-5"
        type="error"
        title="Kirjautuminen epäonnistui"
        text="Väärä sähköposti tai salasana"
        v-if="!isValidUser"
        style="cursor:pointer;"
        @click="isValidUser = true"
      ></v-alert>
      <v-card-text>
        <v-form @submit.prevent="login">
          <v-text-field
            v-model="email"
            label="Sähköposti"
            type="email"
            name="email"
            :error="!isValidUser"
          ></v-text-field>
          <v-text-field
            v-model="password"
            label="Salasana"
            type="password"
            name="password"
            :error="!isValidUser"
          ></v-text-field>
          <v-col class="text-right">
            <v-btn type="submit" color="primary" class="text-none">Kirjaudu sisään</v-btn>
          </v-col>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue';
import { useAppStore } from '@/store/app';

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
  store.login(payload).then((response) => {
    if (response.status != 'error' && response.token) {
      store.loginDialogShowing = false;
      store.auth_token = response.token;
      setTimeout(() => {
        store.getUser().then(() => {
          store.loading = false;

          store.snackbarText = 'Kirjauduit sisään';
          store.snackbarColor = 'green-darken-2';
          store.snackbar = true;
        });
      }, 10);
    } else {
      store.loading = false;
      isValidUser.value = false;
    }
  });
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
</style>
