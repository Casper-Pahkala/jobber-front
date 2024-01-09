<template>
  <v-app :class="{ 'light-theme': store.lightTheme }">
    <default-bar />

    <default-view :key="store.updateMainComponent"/>

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

<style>

.v-dialog > .v-overlay__content {
  width: calc(100% - 18px);
}


/* Custom scrollbar for entire app */
::-webkit-scrollbar {
    width: 8px; /* width of the entire scrollbar */
}

::-webkit-scrollbar-track {
    background: #fff; /* color of the tracking area */
}

::-webkit-scrollbar-thumb {
    background-color: #888;
    border-radius: 14px;
    /* border: 1px solid #fff; */
}

::-webkit-scrollbar-thumb:hover {
    background: #555; /* color of the scroll thumb on hover */
}



</style>
