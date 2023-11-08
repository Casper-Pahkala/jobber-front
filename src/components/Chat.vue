<template>
  <v-dialog
    v-model="store.chatOpen"
    max-width="700"
    persistent
  >
      <v-card
      min-width="300"
      >
        <div class="chat">
          <div class="contact bar">
            <v-img
                :src="jobUser && jobUser.has_profile_image ? `${store.url}/profile-image/${jobUser.id}` : `${store.url}/no-profile-img.png`"
                cover
                class="profile-image"

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

            <div>
              <div class="name">
                {{ jobUserFullName }}
              </div>
              <div class="seen">
                {{ '11:41' }}
              </div>
            </div>

          </div>
          <div class="messages" id="messages" ref="chatContainer">
            <div
              v-for="(message, index) in messages"
              :key="index"
            >
              <div
                v-if="!message.is_date_seperator"
                class="message"
                :class="message.received === 0 ? 'sent' : 'received'"
              >
                <div class="time" :style="message.received === 0 ? 'right: 10px' : 'left: 10px'">
                  {{ timeFromDate(message.time) }}
                </div>
                {{ message.message }}
              </div>

              <div v-else class="date">
                {{ message.time }}
              </div>
            </div>
            <div class="message received" v-if="otherTyping">
              <div class="typing typing-1"></div>
              <div class="typing typing-2"></div>
              <div class="typing typing-3"></div>
            </div>

            <v-hover v-slot="{ isHovering, props }">
              <v-card
                class="job-container"
                :elevation="isHovering ? 12 : 8"
                color="grey-lighten-3"
                v-bind="props"
                @click="openJob()"
              >
                <v-card-item>
                  <v-img
                    v-if="job"
                    :src="`${store.url}/job-image/${job.hashed_id}/image_0`"
                    cover
                    aspect-ratio="1"
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
                </v-card-item>
              </v-card>
            </v-hover>
          </div>
          <v-card class="chat-container" elevation="3">
            <v-card-text>
              <v-row align="center">
                  <v-text-field
                    v-model="message"
                    outlined
                    placeholder="Viesti"
                    solo
                    hide-details
                    variant="solo"
                    @keyup.enter="sendMessage"
                    class="message-input ml-2 mr-2 mb-2 mt-2"
                    elevation="12"
                    bg-color="grey-lighten-2"
                  ></v-text-field>
                  <v-btn @click="sendMessage" color="primary" dark fab small class="send-btn mr-1">
                    <v-icon>mdi-send</v-icon>
                  </v-btn>
              </v-row>
            </v-card-text>
          </v-card>
        </div>

        <v-btn
          class="close-btn"
          flat
          icon="mdi-close"
          @click="store.chatOpen = false"
        >
        </v-btn>
      </v-card>
  </v-dialog>

</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useAppStore } from '@/store/app';
import moment from 'moment';
import { useRouter } from 'vue-router';

const router = useRouter();
const store = useAppStore();
const chatOpen = computed(() => {
  return store.chatOpen;
})
const messageActive = ref(false);
const jobUserFullName = ref(null);
const messages = computed(() => {
  return store.currentMessages;
});
const job = ref(null);
const message = ref('');
const otherTyping = ref(false);
const chatContainer = ref(null);
const jobUser = ref(null);
function sendMessage() {
  if (message.value.trim() === '' || message.value.trim().length === 0) {
    return;
  }
  let payload = {
    job_id: store.currentJobId,
    message: message.value,
    receiver_id: store.currentChatUserId
  }
  store.sendMessage(payload).then(() => {
  }).catch(() => {

  })
  message.value = '';
}

watch(chatOpen, async (newVal, oldVal) => {
  if (newVal) {
    if (store.user) {
      init();
    } else {
      store.chatOpen = false;
      store.loginDialogShowing = true;
    }
  }
});

watch(messages, async (newVal, oldVal) => {
  scrollToBottom();
}, { deep: true });

function init() {
  store.currentMessages = [];
  store.getMessages(store.currentJobId, store.currentChatUserId).then((response) => {
    store.currentMessages = response.messages;
    jobUserFullName.value = response.user.name;
    jobUser.value = response.user;
    job.value = response.job;
    let usedDates = [];
    let toUpdate = [];
    store.currentMessages.forEach((m, index) => {
      let date = moment(m.time).format('YYYY-MM-DD');
      if (!usedDates.includes(date)) {
        let timeData = {
          is_date_seperator: true,
          time: moment(m.time).format('dddd DD.MM.YYYY')
        };

        if (moment(m.time).isSame(moment(), 'day')) {
          timeData.time = 'Tänään';
        } else if (moment(m.time).isSame(moment().clone().subtract(1, 'days'), 'day')) {
          timeData.time = 'Eilen';
        }

        toUpdate.push({
          afterId: m.id,
          data: timeData
        });

        usedDates.push(date);
      }
    })
    toUpdate.forEach(p => {
      let index = store.currentMessages.findIndex(m => m.id === p.afterId);
      store.currentMessages.splice(index, 0, p.data);
    })
    scrollToBottom();
  })
}

function scrollToBottom() {
  setTimeout(() => {
    if (chatContainer.value) {
      chatContainer.value.scroll({ top: chatContainer.value.scrollHeight });
    }
  }, 10);
}

function timeFromDate(date) {
  return moment(date).format('HH:mm');
}

function openJob() {
  if (job.value) {
    router.push('/jobs/' + job.value.hashed_id);
    store.chatOpen = false;
    store.tab = 'jobs';
  }
}
</script>

<style scoped>

.main-wrapper {
    display: flex;
    justify-content: center;
  }
  .main-content {
    max-width: 600px;
    width: 100%;
    padding-top: 40px;
  }

.sent-message {
  /* text-align: center; */
  line-height: 30px;
  padding: 10px 20px;
  border: 1px solid #ccc;
  background-color: #ccc;
  max-width: 60%;
  width: fit-content;
  border-radius: 10px 10px 10px 0; /* top left, top right, bottom right, bottom left */

}

.receiver-message {
  text-align: center;
  line-height: 30px;
  padding: 10px 20px;
  border: 1px solid #ccc;
  background-color: #ccc;


}

#chat-container {
  border: 1px solid black;
  height: calc(60vh - 100px);
  padding: 10px;
}

@import url("https://fonts.googleapis.com/css?family=Red+Hat+Display:400,500,900&display=swap");
body, html {
  font-family: Red hat Display, sans-serif;
  font-weight: 400;
  line-height: 1.25em;
  letter-spacing: 0.025em;
  color: #333;
  background: #F7F7F7;
}

.center {
  position: absolute;
  top: 50%;
  left: calc(50%);
  transform: translate(-50%, -50%);
}

.profile-image {
  width: 4rem;
  height: 4rem;
  background-size: cover;
  background-position: center;
  border-radius: 50%;
  max-width: none;
  max-height: none;
}
.contact {
  position: relative;
  margin-bottom: 1rem;
  padding-left: 5rem;
  height: 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.contact .profile-image {
  position: absolute;
  left: 0;
}
.contact .name {
  font-weight: 500;
  margin-bottom: 0.125rem;
}
.contact .message, .contact .seen {
  font-size: 0.9rem;
  color: #999;
}
.contact .badge {
  box-sizing: border-box;
  position: absolute;
  width: 1.5rem;
  height: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
  padding-top: 0.125rem;
  border-radius: 1rem;
  top: 0;
  left: 2.5rem;
  background: #333;
  color: white;
}

.contacts {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translate(-6rem, -50%);
  width: 24rem;
  height: 32rem;
  padding: 1rem 2rem 1rem 1rem;
  box-sizing: border-box;
  border-radius: 1rem 0 0 1rem;
  cursor: pointer;
  background: white;
  box-shadow: 0 0 8rem 0 rgba(0, 0, 0, 0.1), 2rem 2rem 4rem -3rem rgba(0, 0, 0, 0.5);
  transition: transform 500ms;
}
.contacts h2 {
  margin: 0.5rem 0 1.5rem 5rem;
}
.contacts .fa-bars {
  position: absolute;
  left: 2.25rem;
  color: #999;
  transition: color 200ms;
}
.contacts .fa-bars:hover {
  color: #666;
}
.contacts .contact:last-child {
  margin: 0;
}
.contacts:hover {
  transform: translate(-23rem, -50%);
}

.chat {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  height: calc(100vh - 100px);
  max-height: 45rem;
  z-index: 2;
  box-sizing: border-box;
  border-radius: 1rem;
  background: #F7F7F7;
  box-shadow: 0 0 8rem 0 rgba(0, 0, 0, 0.1), 0rem 2rem 4rem -3rem rgba(0, 0, 0, 0.5);
}
.chat .contact.bar {
  flex-basis: 3.5rem;
  flex-shrink: 0;
  margin: 1rem;
  box-sizing: border-box;
  flex: 1;
}
.chat .messages {
  position: relative;
  padding: 1rem;
  background: #F7F7F7;
  flex-shrink: 2;
  overflow-y: auto;
  box-shadow: inset 0 2rem 2rem -2rem rgba(0, 0, 0, 0.05), inset 0 -2rem 2rem -2rem rgba(0, 0, 0, 0.05);
  flex: 8;
  margin-top: 105px;
}
.chat .messages .date {
  font-size: 0.8rem;
  background: #EEE;
  padding: 0.25rem 1rem;
  border-radius: 2rem;
  color: #999;
  width: -webkit-fit-content;
  width: -moz-fit-content;
  width: fit-content;
  margin: 0 auto;
}

.chat .messages .time {
  font-size: 0.8rem;
  color: #999;
  width: -webkit-fit-content;
  width: -moz-fit-content;
  width: fit-content;
  position: absolute;
  top: -20px;
}

.chat .messages .message {
  position: relative;
  box-sizing: border-box;
  padding: 0.5rem 1rem;
  margin: 1.6rem;
  background: #FFF;
  border-radius: 1.125rem 1.125rem 1.125rem 0;
  min-height: 2.25rem;
  width: -webkit-fit-content;
  width: -moz-fit-content;
  width: fit-content;
  max-width: 66%;
  box-shadow: 0 0 2rem rgba(0, 0, 0, 0.075), 0rem 1rem 1rem -1rem rgba(0, 0, 0, 0.1);
}
.chat .messages .message.sent {
  margin: 1.6rem 1rem 1.6rem auto;
  border-radius: 1.125rem 1.125rem 0 1.125rem;
  background: #333;
  color: white;
}
.chat .messages .message .typing {
  display: inline-block;
  width: 0.8rem;
  height: 0.8rem;
  margin-right: 0rem;
  box-sizing: border-box;
  background: #ccc;
  border-radius: 50%;
}
.chat .messages .message .typing.typing-1 {
  -webkit-animation: typing 3s infinite;
          animation: typing 3s infinite;
}
.chat .messages .message .typing.typing-2 {
  -webkit-animation: typing 3s 250ms infinite;
          animation: typing 3s 250ms infinite;
}
.chat .messages .message .typing.typing-3 {
  -webkit-animation: typing 3s 500ms infinite;
          animation: typing 3s 500ms infinite;
}
.chat .input {
  box-sizing: border-box;
  flex-basis: 4rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 0 0.5rem 0 1.5rem;
  flex: 1;
}

.chat .input input:focus-visible {
  /* border: 1px solid #7c7c7c !important; */
  outline: none;
}
.chat .input i {
  font-size: 1.5rem;
  margin-right: 1rem;
  color: #666;
  cursor: pointer;
  transition: color 200ms;
}
.chat .input i:hover {
  color: #333;
}
.chat .input input {
  border: 1px solid transparent;
  background-image: none;
  background-color: white;
  padding: 0.5rem 1rem;
  margin-right: 1rem;
  border-radius: 1.125rem;
  flex-grow: 2;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1), 0rem 1rem 1rem -1rem rgba(0, 0, 0, 0.2);
  font-family: Red hat Display, sans-serif;
  font-weight: 400;
  letter-spacing: 0.025em;
  width: 100%;
  overflow: hidden;
  height: auto;
}
.chat .input input:placeholder {
  color: #999;
}

@-webkit-keyframes typing {
  0%, 75%, 100% {
    transform: translate(0, 0.25rem) scale(0.9);
    opacity: 0.5;
  }
  25% {
    transform: translate(0, -0.25rem) scale(1);
    opacity: 1;
  }
}

@keyframes typing {
  0%, 75%, 100% {
    transform: translate(0, 0.25rem) scale(0.9);
    opacity: 0.5;
  }
  25% {
    transform: translate(0, -0.25rem) scale(1);
    opacity: 1;
  }
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 100;
}
.send-btn {
  height: 45px;
  border-radius: 50%;
  min-width: 45px;
  width: 45px;
  padding: 0;
}

@media (max-width: 599px) {
  .send-btn {
    width: 40px;
    padding: 0;
    min-width: 40px;
    border-radius: 50%;
    height: 40px;
  }
}
#messages {
  scrollbar-width: thin;
  scrollbar-color: #333 #f0f0f0;
}

#messages::-webkit-scrollbar {
  width: 6px; /* Adjust the width as needed */
}

/* Customize the scrollbar thumb (the draggable part) */
#messages::-webkit-scrollbar-thumb {
  background-color: #4a4a4a; /* Scrollbar thumb color */
  border-radius: 5px; /* Rounded edges of the thumb */
}
#messages::-webkit-scrollbar-thumb:hover {
  background-color: #333333; /* Scrollbar thumb color */
}

#messages::-webkit-scrollbar-thumb:active {
  background-color: #171717; /* Scrollbar thumb color */
}

/* Customize the scrollbar track (background) */
#messages::-webkit-scrollbar-track {
  background: #f0f0f0; /* Scrollbar track color */
}

.job-container {
  position: fixed;
  height: 100px;
  top: 90px;
  left: 10px;
  right: 10px;
  cursor: pointer;
}

.job-image {
  /* height: 100%; */
  width: 80px;
}
</style>
<style>
.message-input input {
  padding: 0 10px;
  min-height: 45px !important;
  height: 45px;
}
</style>
