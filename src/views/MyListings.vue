<template>
  <div class="main-wrapper">
      <div class="main-content">
        <div id="jobs-container">
        <template v-for="listing in myListings" :key="listing.id">
          <v-hover v-slot="{ isHovering, props }">
            <v-card
              @click="handleJobClick(listing)"
              class="job"
              :elevation="isHovering ? 8 : 4"
              v-bind="props"
            >
              <v-img
                :src="imageUrl(listing)"
                :lazy-src="imageUrl(listing, true)"
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
                      <div class="job-title">{{ listing.title }}</div>
                      <div class="job-description">{{ listing.description }}</div>
                  </div>

                  <div class="job-info">
                    <div class="job-info-item">{{ store.formatDate(listing.date) }}</div>
                    <div class="job-info-item">{{ listing.address }}</div>
                    <div class="job-info-item">{{ listing.estimated_time }}h</div>
                    <div class="job-info-item">{{ listing.full_salary }}€</div>
                  </div>
              </div>
            </v-card >
          </v-hover>
        </template>
      </div>

      <div v-if="loading" class="loading-container">
        <span class="loader"></span>
      </div>


      <div v-if="myListings.length == 0 && store.user && !loading" class="no-messages-text">
        Ei listauksia
        <v-btn color="primary" class="text-none" @click="toJobs()">
          Lisää työ
        </v-btn>
      </div>

      <div v-if="!store.user" class="no-messages-text">
        Kirjaudu sisään niin pääset näkemään listauksesi
        <v-btn
          class="mt-7"
          size="large"
          color="primary"
          @click="store.loginDialogShowing = true"
        >
          Kirjaudu
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAppStore } from '@/store/app';
import { useRouter } from 'vue-router';
import { ref } from 'vue';

const router = useRouter();
const store = useAppStore();
const myListings = ref([]);
const loading = ref(false);
loading.value = true;

if (store.user) {
  store.getMyListings().then((response) => {
    myListings.value = response.messages ?? [];
    loading.value = false;
  }).catch(error => {
    loading.value = false;
  })
} else {
  loading.value = false;
  store.loginDialogShowing = true;
}

function toJobs() {
  store.tab = 'jobs';
  router.push('/jobs');
}
</script>
<style scoped>
    #jobs-container {
      margin-top: 60px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding-bottom: 100px;
  }
  .top-layout {
    margin-top: 60px;
    display: flex;
    justify-content: center;
  }
  .top-wrapper {
    max-width: 1024px;
    display: flex;
    justify-content: space-between;
  }
  .filters {
      width: 500px;
  }
  .job {
    cursor: pointer;
    border-radius: 6px;
    width: 100%;
    max-width: 1000px;
    height: 180px;
    display: flex;
    position: relative;
    margin: 10px;
  }
  .job-image {
      width: 180px;
      height: 180px;
      object-fit: cover;
      /* border-radius: 6px; */
  }
  .job-title {
      font-weight: 600;
      font-size: 24px;
  }
  .job-main {
      width: 70%;
  }

  .job-content {
      display: flex;
      padding: 5px;
      padding-right: 10px;
      padding-left: 20px;
      width: calc(100% - 150px);
  }
  .job-info {
      width: 30%;
  }

  .send-message-btn {
      position: absolute;
      bottom: 10px;
      /* right: 10px; */
  }
  .add-button {
    float: right;
  }
  .job-info-item {
    direction: rtl;
  }

  .dark-background {
  pointer-events: all;
  background-color: rgba(0, 0, 0, 0.5);
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

.search-btn {
  background-color: #ccc;
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
