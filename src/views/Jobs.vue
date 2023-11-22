<template>
  <div>
      <div class="top-layout">
        <v-row
          class="fill-height top-wrapper"
          align="center"
          justify="center"
        >
          <v-col
          >

          <v-text-field
            :loading="queryLoading"
            density="compact"
            variant="solo"
            label="Hae"
            single-line
            hide-details
            @click:append-inner="submit()"
          >
            <template v-slot:append-inner>
              <div class="search-btn">

              </div>
            </template>
          </v-text-field>

          </v-col>
          <!-- <v-col
            cols="4"
          >
          <v-btn
            color="primary"
            @click="showAddJob = true"
            class="col-4 add-button"
            v-if="store.user"
            prepend-icon="mdi-plus"
          >
            Lisää työ
          </v-btn>
          </v-col> -->
        </v-row>
      </div>
      <div v-if="loading" class="loading-container">
        <span class="loader"></span>
      </div>

      <div id="jobs-container">
        <template v-for="job in jobs" :key="job.id">
          <v-hover v-slot="{ isHovering, props }">
            <v-card
              @click="handleJobClick(job)"
              class="job"
              :elevation="isHovering ? 6 : 3"
              v-bind="props"
            >
              <v-img
                :src="imageUrl(job)"
                :lazy-src="imageUrl(job, true)"
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
                      <div class="job-title">{{ job.title }}</div>
                      <div class="job-description">{{ jobDescription(job) }}</div>
                  </div>

                  <div class="job-info">
                    <div class="job-info-item">Julkaistu {{ store.formatDate(job.created_at, 'DD.MM') }}</div>
                    <div class="job-info-item">{{ job.area }}</div>
                    <!-- <div class="job-info-item">{{ job.estimated_time ? job.estimated_time + 'h' : '' }}</div>
                    <div class="job-info-item">{{ job.full_salary ? job.full_salary + '€' : '' }}</div> -->
                  </div>
              </div>
            </v-card >
          </v-hover>
        </template>
      </div>

      <div class="pagination-container" v-if="!loading">
        <v-pagination
          v-model="store.jobParams.page"
          :length="totalPages"
          :total-visible="7"
          @update:modelValue="pageChange()"
        ></v-pagination>
      </div>

  </div>
  <add-job-component
    v-if="showAddJob"
    v-model="showAddJob"
    @close="showAddJob = false"
  >
  </add-job-component>
</template>

<script setup>
import { useAppStore } from '@/store/app'
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router';
import AddJobComponent from'@/components/AddJob.vue';

window.scrollTo(0, 0);
const router = useRouter();
const route = useRoute();
const query = route.query;
const store = useAppStore();
const loading = ref(false);
loading.value = true;

store.jobParams.page = query.p ?? 1;
store.jobParams.limit = query.l ?? 10;

const totalPages = computed(() => {
  return Math.ceil(store.jobParams.totalCount / store.jobParams.limit);
});
const jobs = ref([]);
const showAddJob = ref(false);
const queryLoading = ref(false);
const params = computed(() => {
  let p = {
    p: store.jobParams.page,
    l: store.jobParams.limit
  };
  return p;
})
router.push({ query: params.value });

store.fetchJobs().then((response) => {
  let data = response.data;
  if (!data.error) {
    jobs.value = data.jobs;
  }
  loading.value = false;
})

function handleJobClick(job) {
  router.push('/jobs/' + job.hashed_id);
}

function imageUrl(job, lazy) {
  if (job.job_images && job.job_images.length > 0) {
    return store.url + '/job-image/' + job.job_images[0].name;
  } else {
    return store.url + '/no-img.png'
  }
}

function submit() {
  queryLoading.value = true;

  setTimeout(() => {
    queryLoading.value = false;
  }, 2000)
}

function pageChange() {
  loading.value = true;
  jobs.value = [];
  window.scrollTo(0, 0);
  router.push({ query: params.value });
  store.fetchJobs().then((response) => {
    let data = response.data;
    if (!data.error) {
      jobs.value = data.jobs;
    }
    loading.value = false;
  });
}

function firstItem() {
  return ((store.jobParams.page - 1) * store.jobParams.limit) + 1;
}

function lastItem() {
  return store.jobParams.page * store.jobParams.limit;
}

function jobDescription(job) {
  let description = '';
  if (job.contract_type === 0) {
    description += 'Keikkatyö';

    if (job.salary) {
      if (job.salary_type === 0) {
        // description += ' - Tuntipalkka';
        description += ' - ' + job.salary + '€/h';
      } else {
        // description += ' - Urakkapalkka';
        description += ' - ' + job.salary + '€';
      }
    }
  } else if (job.contract_type === 1) {
    description += 'Vakituinen työsuhde';

    if (job.salary) {
      if (job.salary_type === 0) {
        // description += ' - Tuntipalkka';
        description += ' - ' + job.salary + '€/h';
      } else {
        // description += ' - Kuukausipalkka';
        description += ' - ' + job.salary + '€/kk';
      }
    }
  } else {
    description += 'Toistaiseksi voimassa oleva';

    if (job.salary) {
      if (job.salary_type === 0) {
        // description += ' - Tuntipalkka';
        description += ' - ' + job.salary + '€/h';
      } else {
        // description += ' - Kuukausipalkka';
        description += ' - ' + job.salary + '- €/kk';
      }
    }
  }



  return description;
}
</script>

<style scoped>

  #main-content {

  }

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
    height: 80px;
    display: flex;
    position: relative;
    margin: 10px;
  }
  .job-image {
      width: 80px;
      height: 80px;
      object-fit: cover;
      /* border-radius: 6px; */
  }
  .job-title {
      font-weight: 600;
      font-size: 20px;
  }
  .job-main {
      width: 70%;
  }

  .job-content {
      display: flex;
      padding: 5px;
      padding-right: 10px;
      padding-left: 20px;
      width: calc(100% - 50px);
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
    font-size: 14px;
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
</style>
