<template>
  <v-dialog
    v-model="store.chatOpen"
    max-width="700"
    persistent
  >
      <v-card
      min-width="300"
      >
        <div class="chat" v-if="job">
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
              <!-- <div class="seen">
                {{ '11:41' }}
              </div> -->
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
                :class="{ sent: message.received === 0, received: message.received !== 0, 'pa-0': message.attachment_name && store.getFileExtension(message.attachment_name) !== 'pdf'}"
              >
                <div class="time" :style="message.received === 0 ? 'right: 10px' : 'left: 10px'">
                  {{ timeFromDate(message.time) }}
                </div>
                <div :class="{ attachment: message.attachment_id }" @click="openChatAttachment(message)">
                  <div v-if="message.attachment_name">
                    <template
                      v-if="store.getFileExtension(message.attachment_name) === 'pdf'"
                    >
                      <v-icon
                      >
                        mdi-file-pdf-box
                      </v-icon>
                      {{ getMessage(message) }}
                    </template>

                    <v-img
                      :src="message.attachment_url"
                      class="attachment-image"
                      v-else
                    ></v-img>
                  </div>
                  <div v-else>
                    {{ getMessage(message) }}
                  </div>
                </div>
                <div v-if="(index == messages.length - 1) && !message.received" class="status">
                  {{ getMessageStatus(message) }}
                </div>
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
                v-if="job"
                class="job-container"
                :elevation="isHovering && !job.is_deleted ? 8 : 6"
                color="grey-lighten-3"
                v-bind="props"
                @click="openJob()"
                :disabled="job.is_deleted"
              >
                <v-card-item>
                  <div class="job-container">
                    <v-img
                      :src="`${store.url}/job-image/${job.job_images[0].name}`"
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

                    <div class="job-content">
                      <div class="job-main">
                        <div class="job-title">
                          {{ job.title }}
                        </div>
                        <div>
                          {{ job.description }}
                        </div>
                      </div>

                      <div class="job-info">
                        <div class="job-info-item">{{ store.formatDate(job.date) }}</div>
                      </div>
                    </div>

                  </div>
                </v-card-item>
                <div v-if="job.is_deleted" class="deleted-job">
                </div>
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
                    :disabled="job.is_deleted"
                  ></v-text-field>

                  <v-btn v-if="message.length == 0" @click="openFileInput" color="primary" dark fab small class="send-btn mr-1" :disabled="job.is_deleted">
                    <v-icon size="24px">mdi-paperclip</v-icon>
                  </v-btn>

                  <v-btn v-else @click="sendMessage" color="primary" dark fab small class="send-btn mr-1" :disabled="job.is_deleted">
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
          @click="close()"
        >
        </v-btn>
      </v-card>

      <input
        type="file"
        ref="fileInput"
        @change="handleFileChange"
        style="display: none;"
      />

      <v-dialog
        v-model="confirmAttachmentDialog"
        width="500"
      >
        <v-card>
          <v-card-title>
            Vahvista liite
          </v-card-title>
          <v-card-item>
            <div @click="openAttachment" class="attachmentName">
              {{ attachmentName }}
            </div>
          </v-card-item>

          <v-card-actions>
            <v-col class="d-flex justify-space-between">
              <v-btn @click="confirmAttachmentDialog = false" class="text-none">Peruuta</v-btn>
              <v-btn color="primary" @click="sendAttachment()" class="text-none">Lähetä</v-btn>
            </v-col>
          </v-card-actions>
        </v-card>

      </v-dialog>
  </v-dialog>
  <canvas id="imageAttachmentCanvas" style="display: none;"></canvas>

  <v-dialog
    v-model="showLargeImageDialog"
    id="chat-large-image"
  >
    <v-card
      style="background-color: #333;"
    >
        <v-img
          :src="largeImageUrl"
          class="large-image"
        ></v-img>

        <v-btn
          class="close-btn"
          flat
          icon="mdi-close"
          @click="showLargeImageDialog = false"
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
  let messages = store.currentChatMessages;
  return messages;
});


const job = ref(null);
const message = ref('');
const otherTyping = ref(false);
const chatContainer = ref(null);
const jobUser = ref(null);

const attachment = ref(null);
const attachmentName = ref(null);
const attachmentResult = ref(null);

const confirmAttachmentDialog = ref(false);
const fileInput = ref(null);

const showLargeImageDialog = ref(false);
const largeImageUrl = ref(null);

const jobId = computed(() => {
  return store.chat.jobId
});

const chatUserId = computed(() => {
  return store.chat.userId
});

function sendMessage() {
  if (message.value.trim() === '' || message.value.trim().length === 0) {
    return;
  }
  let payload = {
    job_id: jobId.value,
    message: message.value,
    receiver_id: chatUserId.value
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
  } else {
    store.chatOpen = false;
    store.chat.jobId = null;
    store.chat.userId = null;
  }
});

watch(messages, async (newVal, oldVal) => {
  if (newVal.length != oldVal.length) {
    scrollToBottom();
  }
}, { deep: true });

function init() {
  store.getMessages(jobId.value, chatUserId.value).then((response) => {
    jobUserFullName.value = response.user.name;
    jobUser.value = response.user;
    job.value = response.job;
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
  if (job.value && !job.value.is_deleted) {
    router.push('/jobs/' + job.value.hashed_id);
    store.chatOpen = false;
    store.tab = 'job';
  }
}

function getMessageStatus(message) {
  if (message.seen) {
    return 'Nähty';
  }
  return 'Toimitettu';
}

function close() {
  store.chatOpen = false;
}

function openFileInput() {
  // Trigger the hidden file input
  fileInput.value.click();
}

function handleFileChange(event) {
  const selectedFile = event.target.files[0];
  attachmentName.value = selectedFile.name;
  // Check if a file is selected
  if (selectedFile) {
    // Check if the selected file is an image (you can adjust the accepted image types)
    if ((selectedFile.type.startsWith('image/') && !selectedFile.type.startsWith('image/gif')) || selectedFile.type === 'application/pdf') {
      attachment.value = null;
      attachmentResult.value = null;
      store.loading = true;
      confirmAttachmentDialog.value = true;

      if (selectedFile.type.startsWith('image/')) {
        var reader = new FileReader();
        reader.onload = function (e) {
          const img = new Image();
          img.onload = () => {
            let targetWidth = 1080;
            let targetHeight = 1080;

            const imageCanvas = document.getElementById('imageAttachmentCanvas');
            const canvasContext = imageCanvas.getContext('2d');

            // Calculate the aspect ratio of the image
            const imageAspectRatio = img.width / img.height;

            // Calculate the target aspect ratio
            const targetAspectRatio = targetWidth / targetHeight;

            let drawWidth, drawHeight, xOffset, yOffset;

            if (imageAspectRatio > targetAspectRatio) {
              // Image is wider than the target aspect ratio, crop horizontally
              drawHeight = targetHeight;
              drawWidth = drawHeight * imageAspectRatio;
              yOffset = 0;
              xOffset = (drawWidth - targetWidth) / 2;
            } else {
              // Image is taller than the target aspect ratio, crop vertically
              drawWidth = targetWidth;
              drawHeight = drawWidth / imageAspectRatio;
              xOffset = 0;
              yOffset = (drawHeight - targetHeight) / 2;
            }

            // Set the canvas dimensions to the target size
            imageCanvas.width = targetWidth;
            imageCanvas.height = targetHeight;

            // Draw the cropped and resized image
            canvasContext.drawImage(img, -xOffset, -yOffset, drawWidth, drawHeight);

            imageCanvas.toBlob((blob) => {
              attachment.value = blob;
              console.log(blob);
              // attachmentResult.value = imageCanvas.toDataURL('image/jpeg', 0.8);
              store.loading = false;
            }, selectedFile.type, 0.8);
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(selectedFile);
      } else if (selectedFile.type === 'application/pdf') {

        let reader = new FileReader();
        reader.onload = function (e) {
          // Create a Blob URL from the PDF and open it in a new tab
          attachment.value = new Blob([reader.result], { type: 'application/pdf' });
          store.loading = false;
        };
        reader.readAsArrayBuffer(selectedFile);
      }



    } else {
      // Handle the case where the selected file is not an image
      store.snackbarText = 'Valitse kuva tiedostotyyppi';
      store.snackbarColor = 'red-darken-2';
      store.snackbar = true;
    }
  }
}

function sendAttachment() {
  const att = new File([attachment.value], attachmentName.value, { type: attachment.value.type });
  let payload = {
    attachment: att,
    job_id: jobId.value,
    receiver_id: chatUserId.value
  }
  store.sendAttachment(payload).then(() => {
    confirmAttachmentDialog.value = false;
  });
}

function openAttachment() {
  const url = URL.createObjectURL(attachment.value);
  window.open(url, '_blank');
}

function getMessage(message) {
  if (message.message.length > 0) {
    return message.message;
  } else {
    return message.attachment_name;
  }
}

function openChatAttachment(message) {
  largeImageUrl.value = '';
  if (!message.attachment_id) {
    return;
  }

  if (store.getFileExtension(message.attachment_name) === 'pdf') {
    store.downloadFile(message.attachment_id);
  } else {
    showLargeImageDialog.value = true;
    largeImageUrl.value = message.attachment_url;
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
  margin-top: 73px;
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

.chat .messages .status {
  font-size: 0.8rem;
  color: #999;
  width: -webkit-fit-content;
  width: -moz-fit-content;
  width: fit-content;
  position: absolute;
  bottom: -20px;
  right: 0;
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
  height: 70px;
  top: 90px;
  left: 10px;
  right: 10px;
  cursor: pointer;
  border-radius: 4px;
  overflow: hidden;
}

.job-image {
  /* height: 100%; */
  width: 70px;
  flex: auto !important;
}

.job-container {
  display: flex;
}

.job-content {
  padding: 5px 10px;
  width: calc(100% - 70px);
  display: flex;
}

.job-title {
  font-weight: 600;
  font-size: 16px;
}

.job-info {
  width: 30%;
}

.job-main {
  width: 70%;
}

.job-info-item {
    direction: rtl;
  }

.deleted-job {
  cursor: default;
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background-color: #00000040;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: all;
}

.deleted-job::after {
  content: "Poistettu";
  color: #000;
  font-size: 20px;
  font-weight: 600;
  transform: rotate(10deg);
}

.attachmentName {
  cursor: pointer;
}

.attachmentName:hover {
  text-decoration: underline;
}

.attachment {
  cursor: pointer;
  display: flex;
  gap: 10px;
}

.attachment:hover {
  text-decoration: underline;
}

.attachment-image {
  width: 200px;
  height: 200px;
}

.received .attachment-image {
  border-radius: 1.125rem 1.125rem 1.125rem 0;
}
.sent .attachment-image {
  border-radius: 1.125rem 1.125rem 0 1.125rem;
}

.large-image {
  max-width: 100vw;
  max-height: calc(100vh - 48px);
  object-fit: contain;
}

#chat-large-image {
  max-width: 100vw;
  max-height: 100vh;
}
</style>
<style>
.message-input input {
  padding: 0 10px;
  min-height: 45px !important;
  height: 45px;
}
</style>
