<template>
  <div class="main-wrapper">
    <div class="main-content">
      <v-container>
        <v-btn flat rounded id="back-btn" @click="goBack">
          <v-icon icon="mdi-arrow-left"></v-icon>
        </v-btn>
        <v-container id="images-container">
        <!-- <img id="main-image" class="job-image" src="/mowing.jpg"> -->
        <v-container
          class="main-image-container"
        >
          <v-img
            :src="imageUrl(imageIndex)"
            :lazy-src="imageUrl(imageIndex, true)"
            contain
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
        </v-container>
        <div
          class="carousel"
        >
          <v-img
            v-for="(a, index) in job.pictures"
            :key="index"
            :src="imageUrl(index)"
            :lazy-src="imageUrl(index, true)"
            contain
            class="carousel-img"
            @click="imageIndex = index"
            :class="image === mainImage ? 'selected' : ''"
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
        </div>
      </v-container>
        <h1 id="job-title">
          {{ job.title }}
        </h1>
        <v-divider></v-divider>
        <p id="job-description">
          {{ job.description }}
        </p>
        <v-divider></v-divider>
        <div class="job-info">
          <v-icon icon="mdi-map-marker"></v-icon>
          {{ job.location || 'Seinäjoki' }}
        </div>
        <div class="job-info">
          <v-icon icon="mdi-calendar-range"></v-icon>
          {{ store.formatDate(job.date) }}
        </div>
        <div class="job-info">
          <v-icon icon="mdi-timer-outline"></v-icon>
          {{ job.estimated_time }}h
        </div>
        <div class="job-info">
          <v-icon icon="mdi-cash"></v-icon>
          {{ job.full_salary }}€
        </div>
      </v-container>
      <v-divider class="mt-5 mb-5"></v-divider>
      <div v-if="!isMyJob">
        <v-container>
          <div class="job-info">
            <v-icon icon="mdi-account"></v-icon>
            {{ jobUserFullName }}
          </div>
          <v-btn
            class="mt-4"
            color="primary"
            @click="contact()"
          >
            Ota yhteyttä
          </v-btn>
        </v-container>
        <v-divider class="mt-5 mb-5"></v-divider>
      </div>

    </div>
  </div>

</template>
<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAppStore } from '@/store/app';

const route = useRoute();
const router = useRouter();

const store = useAppStore();
const job = ref({});

const jobUserFullName = ref('');
const isMyJob = computed(() => {
  return job.value.user && store.user && job.value.user.hashed_id === store.user.id;
});

const imageIndex = ref(0);

store.currentJobId = route.params.id;

store.fetchJob(store.currentJobId).then((response) => {
  let data = response.data;
  if (!data.error) {
    job.value = data.job;
    jobUserFullName.value = data.job.user.first_name + ' ' + data.job.user.last_name;
    store.currentChatUserId = data.job.user.hashed_id;
  }
})

function goBack() {
  router.replace({ path: '/jobs' })
}

window.scrollTo(0, 0);

function contact() {
  // router.push({ path: '/chat/' + route.params.id });
  store.chatOpen = true;
}

function imageUrl(index = 0, lazy = false) {
  if (job.value.pictures && job.value.pictures > 0) {
    return store.url + '/job-image/' + job.value.hashed_id + '/image_' + index +(lazy ? '_low' : '');

  } else {
    return store.url + '/no-img.png';
  }
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
    /* padding-top: 40px; */
  }
  #job-description {
    padding: 20px 0;
  }

  #job-title {
    padding: 20px 0;
  }
  .job-info {
    padding: 20px 0 0 0;
  }

  #images-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    /* padding-bottom: 500px; */
    gap: 20px;
  }
  #back-btn {
    width: 60px;
    height: 60px;
    font-size: 20px;
    border-radius: 50%;
  }

  .carousel {
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
  }

  .carousel-img {
    /* width: 80px; */
    height: 100%;
    width: 100px;
    object-fit: contain;
    filter: brightness(0.8);
    cursor: pointer;
    background-color: transparent !important;
  }
  .main-image-container {
    height: 400px;
    display: flex;
    justify-content: center;
  }
  .carousel-img.selected {
    filter: brightness(1);
  }
</style>
