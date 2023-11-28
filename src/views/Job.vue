<template>
  <div class="main-wrapper">
    <div class="main-content">
      <template v-if="!job.is_deleted && !loading">
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
              id="mainJobImage"
              @click="toggleFullscreen()"
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
            class="carousel mt-2"
          >
            <v-img
              v-for="(a, index) in job.job_images"
              :key="index"
              :src="imageUrl(index)"
              :lazy-src="imageUrl(index, true)"
              cover
              class="carousel-img"
              @click="imageIndex = index"
              :class="image === mainImage ? 'selected' : ''"
              aspect-ratio="1"
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
          <div class="job-info" v-if="job">
            <v-icon icon="mdi-briefcase"></v-icon>{{ contractType() }}
          </div>
          <div class="job-info" v-if="job.area">
            <v-icon icon="mdi-map-marker"></v-icon>
            {{ job.area }}
          </div>
          <div class="job-info" v-if="job.date">
              <v-icon icon="mdi-calendar-range"></v-icon>
              {{ store.formatDate(job.date) }}
          </div>
          <div class="job-info" v-if="job.hours" >
              <v-icon icon="mdi-timer-outline"></v-icon>
              {{ job.hours }}h
              {{ job.contract_type === 1 || job.contract_type === 2 ? '/ viikko' : '' }}
          </div>
          <div class="job-info" v-if="job.salary">
              <v-icon icon="mdi-cash"></v-icon>
              {{ jobSalary() }}
          </div>
          <v-divider class="mt-5"></v-divider>
          <p id="job-description">
            {{ job.description }}
          </p>
        </v-container>

        <v-divider class="mt-5 mb-5"></v-divider>

        <div>
          <v-container>
            <v-card class="pa-5" elevation="8">
              <div>

                <div style="display: flex; gap: 5px;">
                  <v-icon icon="mdi-account"></v-icon>
                  <h3>
                    {{ jobUserFullName }}
                  </h3>
                </div>
                <div class="mt-2">
                  Käyttäjä luotu {{ store.formatDate(job.user.created_at) }}
                </div>
              </div>


              <v-btn
                v-if="!isMyJob"
                class="mt-6"
                color="primary"
                @click="contact()"
              >
                Ota yhteyttä
              </v-btn>

              <v-btn
                v-else
                class="mt-4"
                color="red"
                @click="deleteListing()"
              >
                Poista listaus
              </v-btn>
            </v-card>
          </v-container>
          <v-divider class="mt-5 mb-5"></v-divider>
        </div>
      </template>

      <template v-else-if="!loading">
        <div class="listing-deleted">
          <div>
            Listaus poistettu
          </div>
          <v-btn
            color="primary"
            @click="toJobs()"
          >
            Selaa töitä
          </v-btn>
        </div>
      </template>
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
const loading = ref(true);

const carousel = ref(null);
const mainJobImage = ref(null);
const jobUserFullName = ref('');
const isMyJob = computed(() => {
  return job.value.user && store.user && job.value.user.hashed_id === store.user.id;
});

const imageIndex = ref(0);
store.displayedJob.id = route.params.id;

store.fetchJob(store.displayedJob.id).then((response) => {
  let data = response.data;
  if (!data.error) {
    job.value = data.job;
    jobUserFullName.value = data.job.user.first_name + ' ' + data.job.user.last_name;
    store.displayedJob.userId = data.job.user.hashed_id;
  }
  loading.value = false;
})

function goBack() {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.replace({ path: '/jobs' })
  }
}

function toJobs() {
  router.replace({ path: '/jobs' });
}

window.scrollTo(0, 0);

function contact() {
  store.chat.jobId = store.displayedJob.id;
  store.chat.userId = store.displayedJob.userId;
  // router.push({ path: '/chat/' + route.params.id });
  store.chatOpen = true;


}

function imageUrl(index = 0, lazy = false) {
  if (job.value.job_images && job.value.job_images.length > 0) {
    return store.url + '/job-image/' + job.value.job_images[index].name;

  } else {
    return store.url + '/no-img.png';
  }
}

function toggleFullscreen() {
  // store.toggleFullscreen(document.getElementById('mainJobImage'));
}

function selectItem(index) {
  carousel.value.selectItem(index);
}

function contractType() {
  console.log(job.value);
  if (job.value.contract_type === 0) {
    return 'Keikka työ';
  } else if (job.value.contract_type === 1) {
    return 'Vakituinen työsopimus';
  } else {
    return 'Toistaiseksi voimassa oleva työsopimus';
  }
}

function jobSalary() {
  let j = job.value;

  if (j.salary) {
    let prefix = '';
    if (j.contract_type === 0) {
      if (j.salary_type === 0) {
        prefix = '€/h';
      } else {
        prefix = '€';
      }
    } else {
      if (j.salary_type === 0) {
        prefix = '€/h';
      } else {
        prefix = '€/kk';
      }
    }
    return j.salary + ' ' + prefix;
  }
  return 'Sopimuksen mukaan';
}

function deleteListing() {
  let confirm = window.confirm('Haluatko varmasti poistaa listauksen ' + job.value.title + '?');

  if (confirm) {
    const payload = {
      job_id: job.value.hashed_id
    };
    store.deleteListing(payload).then(res => {
      job.value.is_deleted = true;
    })
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
    padding: 0 0 10px;
  }
  .job-info {
    padding: 20px 0 0 0;
  }

  #images-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    /* padding-bottom: 500px; */
    /* gap: 20px; */
    /* background-color: #ededed; */
    border-radius: 12px;
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
    /* align-items: center; */
    gap: 15px;
    width: 100%;
  }

  .carousel-img {
    /* width: 80px; */
    height: 90px;
    width: 90px;
    object-fit: contain;
    filter: brightness(0.8);
    cursor: pointer;
    flex: none;
    background-color: transparent !important;
  }
  .main-image-container {
    height: 500px;
    display: flex;
    justify-content: center;
    background-color: #ededed;
    padding: 0;
    /* margin: 10px; */
  }
  .carousel-img.selected {
    filter: brightness(1);
  }

  .listing-deleted {
    display: flex;
    flex-direction: column;
    gap: 30px;
    justify-content: center;
    align-items: center;
    height: calc(100%);

    font-size: 24px;
    /* font-weight: 600; */
  }

  .delimiter-image {
  /* Your styles for small images as delimiters */
  cursor: pointer;
  max-width: 50px; /* example size for delimiter images */
  opacity: 0.7;
}
.delimiter-image:hover {
  opacity: 1;
}
</style>
<style>
  .job-info .v-icon {
    width: 40px;
  }
</style>
