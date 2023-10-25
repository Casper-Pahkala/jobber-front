<template>
  <v-app>
    <default-bar />

    <default-view />

    <LoginComponent></LoginComponent>

    <LoadingComponent></LoadingComponent>

    <RegisterComponent></RegisterComponent>

    <ChatComponent></ChatComponent>

    <v-snackbar
      v-model="store.snackbar"
      elevation="24"
      :color="store.snackbarColor"
      :timeout="5000"
    >
      {{ store.snackbarText }}

      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="store.snackbar = false"
        >
          Sulje
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { useAppStore } from '@/store/app'
import DefaultBar from './AppBar.vue'
import DefaultView from './View.vue'
import LoginComponent from '@/components/Login.vue';
import RegisterComponent from '@/components/Register.vue';
import LoadingComponent from '@/components/Loader.vue';
import ChatComponent from '@/components/Chat.vue';
import moment from 'moment';
import 'moment/dist/locale/fi';

moment.locale('fi');
const store = useAppStore();

</script>
