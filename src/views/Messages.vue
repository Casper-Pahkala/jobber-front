<template>
  <h1>Viestit</h1>
  <div class="main-wrapper">
      <div class="main-content">
        <v-container>
          <v-card
            v-for="(message, index) in messages"
            :key="index"
            @click="openChat(message)"
            class="message-container"
          >
            <div class="message-wrapper">
              <v-img class="pic" src="/mowing.jpg" aspect-ratio="1" cover>
              </v-img>

              <div class="message-info">
                <div class="name">
                  {{ message.job.user.first_name }} {{ message.job.user.last_name }}
                </div>
                <div class="job-title">
                  {{ message.job.title }}
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
          </v-card>
        </v-container>
      </div>
  </div>
</template>

<script setup>
import { useAppStore } from '@/store/app';
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import moment from 'moment';

const router = useRouter();
const store = useAppStore();
const messages = ref([]);


if (store.user) {
  store.getAllMessages().then((response) => {
    messages.value = response.messages;
  })
} else {
  router.replace({ path: '/' })
  store.tab = '';
  store.loginDialogShowing = true;
}

function openChat(message) {
  store.currentJobId = message.job.hashed_id;
  store.currentChatUserId = message.other_user_id;
  store.chatOpen = true;
}

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

.pic {
  width: 100px;
  max-width: 100px;
  height: 100%;
  border-radius: 50%;
}
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
</style>
