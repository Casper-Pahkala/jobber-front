<template>
  <v-dialog
    v-model="store.registerDialogShowing"
    max-width="500"
    :class="{ 'light-theme': store.lightTheme }"
  >
      <v-card min-width="300" class="register-card">
        <v-card-title class="headline pa-4">{{ $t('Luo käyttäjä') }}</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="register">
            <v-text-field v-model="firstName" label="Etunimi" type="text" name="fname" :theme="store.theme"></v-text-field>
            <v-text-field v-model="lastName" label="Sukunimi" type="text" name="lname" :theme="store.theme"></v-text-field>
            <v-text-field
              v-model="email"
              label="Sähköposti"
              type="email"
              :theme="store.theme"
              :error="emailError"
              @input="isValidEmail(email)"
              name="email"
            ></v-text-field>
            <v-text-field v-model="password" label="Salasana" type="password" :theme="store.theme"></v-text-field>
            <v-text-field
              v-model="confirmPassword"
              label="Vahvista salasana"
              type="password"
              :theme="store.theme"
              :error-messages="confirmPasswordError"
            ></v-text-field>
            <v-col class="text-right">
              <v-btn type="submit" color="primary" class="text-none" :disabled="!canRegister">{{ $t('Luo käyttäjä') }}</v-btn>
            </v-col>
          </v-form>
        </v-card-text>
        <v-btn icon @click="store.registerDialogShowing = false" class="dialog-close-btn" flat :color="store.lightTheme ? 'white' : 'grey-darken-4'">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useAppStore } from '@/store/app';

const store = useAppStore();
const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');

const emailError = ref(false);
const confirmPasswordError = ref('');
const canRegister = computed(() => {
  if (!firstName.value || firstName.value.length <= 0) {
    return false;
  }
  if (!lastName.value || lastName.value.length <= 0) {
    return false;
  }
  if (!email.value || email.value.length <= 0) {
    return false;
  }
  if (!password.value || password.value.length <= 0) {
    return false;
  }
  if (!confirmPassword.value || confirmPassword.value.length <= 0) {
    return false;
  }

  if (confirmPasswordError.value.length !== 0) {
    return false;
  }

  if (!isValidEmail(email.value)) {
    return false;
  }
  return true;
});

function register() {
  let payload = {
    first_name: firstName.value,
    last_name: lastName.value,
    email: email.value,
    password: password.value,
  };
  store.register(payload).then(() => {

  }).catch((data) => {
    let emailErrors = [
      101,
      102
    ];
    if (emailErrors.includes(data.errorCode)) {
      emailError.value = true;
    }
  });
}

function isValidEmail(email) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (regex.test(email)) {
      emailError.value = false;
      return true;
    } else {
      emailError.value = true;
      return false;
    }
}

watch(() => confirmPassword.value, () => {
  validateConfirmPassword();
})

watch(() => password.value, () => {
  validateConfirmPassword();
})

function validateConfirmPassword() {
  if (confirmPassword.value && confirmPassword.value !== password.value) {
    confirmPasswordError.value = 'Salasanat eivät täsmää';
  } else {
    confirmPasswordError.value = '';
  }
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

.register-card {
  background-color: var(--card-bg-color);
}

</style>

