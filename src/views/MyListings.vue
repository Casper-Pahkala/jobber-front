<template>
  <div class="main-wrapper">
      <div class="main-content">
        <div id="jobs-container" v-if="myListings.length != 0 && store.user && !loading">
          <v-chip-group
            mandatory
            selected-class="text-primary"
            column
            style="width: 100%;"
            v-model="listingsType"
          >
            <v-chip
            >
            Aktiiviset
            </v-chip>
            <v-chip
            >
            Poistetut
            </v-chip>
          </v-chip-group>
        <template v-for="listing in filteredListings" :key="listing.id">
          <v-hover v-slot="{ isHovering, props }">
            <v-card
              class="job"
              :elevation="isHovering ? 4 : 4"
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

              <div
                class="action-btns"
              >
                <v-btn
                  color="primary"
                  class="show-btn"
                  @click="handleJobClick(listing)"
                >
                  Näytä
                </v-btn>

                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" icon="mdi-dots-vertical" class="ml-5 more-btn" color="grey-lighten-3"></v-btn>
                  </template>

                  <v-list>
                    <v-list-item
                    title="Muokkaa"
                    class="menu-action-btn"
                    @click="editListing(listing)"
                    >
                    </v-list-item>

                    <v-list-item
                        @click="deleteListing(listing)"
                      class="menu-action-btn"
                      title="Poista listaus"
                    >
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>

              <div v-if="listing.is_deleted" class="deleted">
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
import { ref, computed } from 'vue';
import { list } from 'postcss';

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
  if (job.pictures && job.pictures > 0) {
    return store.url + '/job-image/' + job.hashed_id + '/image_0' +(lazy ? '_low' : '');
  } else {
    return store.url + '/no-img.png'
  }
}

function handleJobClick(job) {
  router.push('/jobs/' + job.hashed_id);
}

function editListing(listing) {

}

function deleteListing(listing) {
  let confirm = window.confirm('Haluatko varmasti poistaa listauksen ' + listing.title + '?');

  if (confirm) {
    const payload = {
      job_id: listing.hashed_id
    };
    store.deleteListing(payload).then(res => {
      listing.is_deleted = true;
    })
  }
}

</script>
<style scoped>
.main-content {
  display: flex;
  justify-content: center;
}
.action-btns {
  position: absolute;
  bottom: 5px;
  right: 5px;
}
#jobs-container {
    margin-top: 60px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 100px;
    width: 1000px;
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

.more-btn {
  height: 40px;
  width: 40px;
}

.menu-action-btn {
  cursor: pointer;
}

.deleted {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background-color: #00000040;
  display: flex;
  justify-content: center;
  align-items: center;
}

.deleted::after {
  content: "Poistettu";
  color: #000;
  font-size: 24px;
  font-weight: 600;
  transform: rotate(17deg);
}
</style>
