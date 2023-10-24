<template>
  <div>
      <div class="top-layout">
        <v-row
          class="fill-height top-wrapper"
          align="center"
          justify="center"
        >
          <v-col
            cols="8"
          >

          <v-text-field
            :loading="queryLoading"
            density="compact"
            variant="solo"
            label="Search templates"
            append-inner-icon="mdi-magnify"
            single-line
            hide-details
            @click:append-inner="submit()"
          ></v-text-field>

          </v-col>
          <v-col
            cols="4"
          >
          <v-btn
            color="primary"
            @click="showAddJob = true"
            class="col-4 add-button"
            v-if="store.user"
          >
            Lisää työ
          </v-btn>
          </v-col>
        </v-row>
      </div>

      <div id="jobs-container">
        <template v-for="job in jobs" :key="job.id">
          <v-hover v-slot="{ isHovering, props }">
            <v-card
              @click="handleJobClick(job)"
              class="job"
              :elevation="isHovering ? 8 : 4"
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
                      <div class="job-description">{{ job.description }}</div>
                  </div>

                  <div class="job-info">
                    <div class="job-info-item">{{ store.formatDate(job.date) }}</div>
                    <div class="job-info-item">{{ job.distance }}</div>
                    <div class="job-info-item">{{ job.estimated_time }}h</div>
                    <div class="job-info-item">{{ job.full_salary }}€</div>
                  </div>
              </div>
            </v-card >
          </v-hover>
        </template>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router';
import AddJobComponent from'@/components/AddJob.vue';

const store = useAppStore();
const router = useRouter();
const jobs = ref([]);
const showAddJob = ref(false);
const queryLoading = ref(false);

store.fetchJobs().then((response) => {
  let data = response.data;
  if (!data.error) {
    jobs.value = data.jobs;
  }
})

function handleJobClick(job) {
  router.push('/jobs/' + job.hashed_id);
}

function imageUrl(job, lazy) {
  if (job.pictures && job.pictures > 0) {
    return store.url + '/job-image/' + job.hashed_id + '/image_0' +(lazy ? '_low' : '');
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
</style>
