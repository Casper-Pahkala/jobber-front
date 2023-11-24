<template>
        <v-container v-if="messages.length > 0">
          <v-card
            v-for="(message, index) in messages"
            :key="index"
            @click="store.openChat(message)"
            class="message-container"
            elevation="4"
          >
            <div class="message-wrapper">
              <v-img
                :src="`${store.url}/profile-image/${message.other_user_id}.jpg`"
                cover
                class="job-image"
              >
                <template v-slot:placeholder>
                  <v-row
                    class="fill-height ma-0"
                    align="center"
                    justify="center"
                  >
                    <v-progress-circular
                      indeterminate
                      color="grey-lighten-5"
                    ></v-progress-circular>
                  </v-row>
                </template>
              </v-img>

              <div class="message-info">
                <div class="name">
                  {{ message.other_full_name }}
                </div>
                <div class="job-title">
                  {{ message.job_title ?? 'Poistettu' }}
                </div>
                <div class="latest-message">
                  <div class="message">
                    {{ message.message }}
                  </div>

                  <v-icon
                    icon="mdi-circle"
                    size="6"
                  >
                  </v-icon>

                  {{ timeFromDate(message.time) }}
                </div>
              </div>
            </div>

            <div v-if="message.deleted" class="deleted">

            </div>
          </v-card>

          <div v-if="loading" class="loading-container">
            <span class="loader"></span>
          </div>

        </v-container>
        <div v-if="messages.length == 0 && store.user && !loading" class="no-messages-text">
          Ei viestejä
          <v-btn color="primary" class="text-none" @click="toJobs()">
            Etsi töitä
          </v-btn>
        </div>

        <div v-if="!store.user" class="no-messages-text">
          Kirjaudu sisään niin pääset näkemään viestisi
          <v-btn
            class="mt-7"
            size="large"
            color="primary"
            @click="store.loginDialogShowing = true"
          >
            Kirjaudu
          </v-btn>
        </div>
</template>

<script setup>
import { useAppStore } from '@/store/app';
import { useRouter } from 'vue-router';
import { ref, computed } from 'vue';
import moment from 'moment';

window.scrollTo(0, 0);
const router = useRouter();
const store = useAppStore();
const messages = computed(() => {
  return store.latestMessages;
});
const loading = ref(false);
loading.value = true;
if (store.user) {
  store.getAllMessages().then(() => {
    loading.value = false;
  })
} else {
  // router.replace({ path: '/' })
  // store.tab = '';
  // store.redirect = { url: 'messages', tab: 'messages'};
  store.loginDialogShowing = true;
}

function timeFromDate (date) {
  if (moment(date).isSame(moment(), 'day')) {
    return 'Tänään ' + moment(date).format('HH:mm');
  } else if (moment(date).isSame(moment().clone().subtract(1, 'days'), 'day')) {
    return 'Eilen ' + moment(date).format('HH:mm');
  }
  return moment(date).format('DD.MM HH:mm');
}

function toJobs() {
  store.tab = 'jobs';
  router.push('/jobs');
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
    padding-top: 40px;
  }

  .message-container {
    padding: 10px;
    margin: 20px;
    position: relative;
  }

  .message-wrapper {
    display: flex;
    gap: 20px;
    position: relative;
    font-size: 18px;
  }

  .message-info {
    width: calc(100% - 120px);
    padding-right: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    white-space: nowrap;
  }

  .name, .job-title {
    font-weight: 500;
    margin-bottom: 0.125rem;
  }
  .job-title {
    font-size: 16px;
  }

  .latest-message {
    display: flex;
    gap: 10px;
    color: #858585;
    align-items: center;
    font-size: 16px;
  }

  .message {
    /* max-width: 50%; */
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .deleted {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background-color: #00000040;
  display: flex;
  justify-content: center;
  align-items: center;
}

.deleted::after {
  content: "";
  color: #000;
  font-size: 24px;
  font-weight: 600;
  transform: rotate(10deg);
}

  .loader {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: inline-block;
  border-top: 3px solid #2a2a2a;
  border-right: 3px solid transparent;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 70vh;
}

.no-messages-text {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-direction: column;
  gap: 20px;
}

.job-image {
    width: 80px;
    height: 80px;
    max-width: 80px;
    border-radius: 50%;
  }

  .job-image.empty {
    background-color: #efefef;
    position: relative;
    overflow: hidden;
  }
  .job-image.empty .empty-icon {
    font-size: 100px;
    color: #838383;
    position: absolute;
    left: 50%;
    top: 60%;
    transform: translate(-50%, -50%);
  }
</style>
