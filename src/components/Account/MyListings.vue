<template>
        <div id="jobs-container" v-if="myListings.length != 0 && store.user && !loading">
          <v-chip-group
            mandatory
            selected-class="text-primary"
            column
            style="width: 100%;"
            v-model="listingsType"
          >
            <v-chip
            class="chip"
            color="primary"
            >
              Aktiiviset
            </v-chip>
            <v-chip
            class="chip"
            >
              Poistetut
            </v-chip>
          </v-chip-group>
        <template v-for="listing in filteredListings" :key="listing.id">
          <JobCard :job="listing" :my-listing="true" />
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
</template>

<script setup>
import { useAppStore } from '@/store/app';
import { useRouter } from 'vue-router';
import { ref, computed } from 'vue';
import { list } from 'postcss';
import JobCard from '@/components/JobCard.vue';

window.scrollTo(0, 0);
const router = useRouter();
const store = useAppStore();
const myListings = ref([]);

const filteredListings = computed(() => {
  if (listingsType.value == 0) {
    return myListings.value.filter(l => !l.is_deleted);
  } else {
    return myListings.value.filter(l => l.is_deleted);
  }
})
const loading = ref(false);
const listingsType = ref(0);
loading.value = true;

if (store.user) {
  store.getMyListings().then((response) => {
    let listings = response.listings ?? [];
    myListings.value = listings;
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

function imageUrl(job, lazy) {
  if (job.job_images && job.job_images.length > 0) {
    return store.url + '/job-image/' + job.job_images[0].name;
  } else {
    return store.url + '/no-img.png'
  }
}

function handleJobClick(job) {
  router.push('/jobs/' + job.hashed_id);
}

function editListing(listing) {

}



</script>
<style scoped>
.main-content {
  display: flex;
  justify-content: center;
}

#jobs-container {
    /* margin-top: 60px; */
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 100px;
    /* width: 1000px; */
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
    cursor: default;
    border-radius: 6px;
    width: 100%;
    height: 120px;
    display: flex;
    position: relative;
  }
  .job-image {
      width: 120px;
      height: 120px;
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
      width: calc(100% - 90px);
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



.menu-action-btn {
  cursor: pointer;
}
</style>
