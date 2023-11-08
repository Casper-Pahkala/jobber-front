<template>
  <v-dialog
  v-model="store.registerDialogShowing"
  max-width="500"
  >
      <v-card min-width="300">
        <v-card-title class="headline pa-4">Luo käyttäjä</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="register">
            <v-text-field v-model="firstName" label="Etunimi" type="text" name="fname"></v-text-field>
            <v-text-field v-model="lastName" label="Sukunimi" type="text" name="lname"></v-text-field>
            <v-text-field v-model="email" label="Sähköposti" type="email"></v-text-field>
            <v-text-field v-model="password" label="Salasana" type="password"></v-text-field>
            <v-col class="text-right">
              <v-btn type="submit" color="primary" class="text-none">Luo käyttäjä</v-btn>
            </v-col>
          </v-form>
        </v-card-text>
        <v-btn icon @click="store.registerDialogShowing = false" class="dialog-close-btn" flat>
        <v-icon>mdi-close</v-icon>
      </v-btn>
      </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue';
import { useAppStore } from '@/store/app';

const store = useAppStore();
const firstName = ref(null);
const lastName = ref(null);
const email = ref(null);
const password = ref(null);

function register() {
  let payload = {
    first_name: firstName.value,
    last_name: lastName.value,
    email: email.value,
    password: password.value,
  };
  store.loading = true;
  store.register(payload).then((response) => {
    if (response.status != 'error' && response.token) {
      store.registerDialogShowing = false;
      store.auth_token = response.token;
      store.getUser().then(() => {
        store.loading = false;
      });
    } else {
      store.loading = false;
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
