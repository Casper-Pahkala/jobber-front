<template>
  <div class="top-layout">
    <v-row
      class="fill-height top-wrapper"
      align="center"
    >
      <v-col
        cols="12"
      >

      <div
        class="main-search-container"
      >
        <input id="main-search" placeholder="Hae" v-model="store.jobParams.term" @keyup.enter="getJobs">

        <v-btn id="clear-btn" icon="mdi-close" size="35px" color="grey" v-if="store.jobParams.term.length > 0" @click="clearTerm()">

        </v-btn>

        <div class="search-btn bg-blue-darken-1" @click="getJobs">
          <v-icon>
            mdi-magnify
          </v-icon>
        </div>


      </div>
      </v-col>

      <v-col cols="3" v-if="false">
        <v-menu
          :close-on-content-click="false"
        >
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" class="text-none filter-btn" prepend-icon="mdi-chevron-down">Työsuhteen tyyppi</v-btn>
          </template>
          <v-list select-strategy="classic">
            <v-list-subheader>Työsuhteen tyyppi</v-list-subheader>

            <v-list-item value="Keikkatyö" class="filter-item">
              <template v-slot:prepend="{ isActive }">
                <v-list-item-action start>
                  <v-checkbox-btn :model-value="isActive"></v-checkbox-btn>
                </v-list-item-action>
              </template>

              <v-list-item-title>Keikkatyö</v-list-item-title>
            </v-list-item>

            <v-list-item value="Vakituinen" class="filter-item">
              <template v-slot:prepend="{ isActive }">
                <v-list-item-action start>
                  <v-checkbox-btn :model-value="isActive"></v-checkbox-btn>
                </v-list-item-action>
              </template>

              <v-list-item-title>Vakituinen</v-list-item-title>
            </v-list-item>

            <v-list-item value="Toistaiseksi" class="filter-item">
              <template v-slot:prepend="{ isActive }">
                <v-list-item-action start>
                  <v-checkbox-btn :model-value="isActive"></v-checkbox-btn>
                </v-list-item-action>
              </template>

              <v-list-item-title>Toistaiseksi voimassa oleva</v-list-item-title>

              <v-list-item-subtitle>
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-col>

      <v-col cols="12">
        <v-divider class="pb-5"></v-divider>
      </v-col>
    </v-row>
  </div>

  <div class="loading-container" v-if="error">
    <div v-if="error" class="error-container">
      <span>Töiden haussa tapahtui virhe</span>
      <v-btn
        prepend-icon="mdi-refresh"
        @click="getJobs()"
      >
        Päivitä työt
      </v-btn>
    </div>
  </div>
  <div id="jobs-container">
    <template v-if="!loading">
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
                    <div class="job-description">{{ store.jobShortInfo(job) }}</div>
                </div>

                <div class="job-info">
                  <div class="job-info-item">Julkaistu {{ store.formatDate(job.created_at, 'DD.MM') }}</div>
                  <div class="job-info-item">{{ job.area }}</div>
                </div>
            </div>
          </v-card >
        </v-hover>
      </template>
    </template>

    <template v-else>
      <v-card
        class="job"
        v-for="i in 6"
        :key="i"
      >
        <v-skeleton-loader
          class="job-image"
          type="image"
        ></v-skeleton-loader>
        <div class="job-content">
          <div class="job-main">
            <v-skeleton-loader
              type="list-item-two-line"
            ></v-skeleton-loader>
          </div>
        </div>
      </v-card >

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
const error = ref(false);

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

const jobTypes = ref(null);

router.push({ query: params.value });



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
  window.scrollTo(0, 0);
  router.push({ query: params.value });
  getJobs();
}

function firstItem() {
  return ((store.jobParams.page - 1) * store.jobParams.limit) + 1;
}

function lastItem() {
  return store.jobParams.page * store.jobParams.limit;
}


function getJobs() {
  error.value = false;
  loading.value = true;
  jobs.value = [];
  const minLoadTime = 300;
  let minLoadTimeOver = false;
  let loaded = false;
  setTimeout(() => {
    minLoadTimeOver = true;
    if (loaded) {
      loading.value = false;
    }
  }, minLoadTime);
  store.fetchJobs().then((response) => {
    let data = response.data;
    if (!data.error) {
      jobs.value = data.jobs;
    }
    loaded = true;
    if (minLoadTimeOver) {
      loading.value = false;
    }
  }).catch(() => {
    store.errorToast('Töiden haussa tapahtui virhe');
    loading.value = false;
    error.value = true;
  })
}

function clearTerm() {
  store.jobParams.term = '';
  getJobs();
}

getJobs();

</script>

<style scoped>

  #main-content {

  }

  #jobs-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-bottom: 60px;
    min-height: calc(100vh - 270px);
    justify-content: start;
  }
  .top-layout {
    padding-top: 30px;
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

.error-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.search-btn {
  width: 80px;
  height: 100%;
  margin-right: -12px;
  display: flex;
  align-items: center;
  /* justify-content: center; */
  padding-left: 20px;
  position: absolute;
  right: 0;
  cursor: pointer;
}

.main-search-container {
  padding: 0;
  padding-right: 0;
  overflow: hidden;
  display: flex;
  position: relative;
  border-radius: 30px;
  overflow: hidden;
  border: 2px solid #a0a0a0;
}

#main-search {
  width: 100%;
  height: 50px;
  border: 0;
  outline: 0;
  padding-left: 20px;
  padding-right: 50px;
}

.filter-item {
  height: 60px;
  min-height: 60px;
  padding: 0;
}

.filter-btn {
  border-radius: 40px;
}

#clear-btn {
  position: absolute;
  right: 80px;
  top: 7px;
}
</style>
