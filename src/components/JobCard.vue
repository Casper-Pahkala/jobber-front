<template>
  <v-hover v-slot="{ isHovering, props }">
    <div style="position: relative;" class="job-wrapper">

      <router-link :to="'/jobs/' + job.hashed_id">
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
          <!-- <v-divider :vertical="true"></v-divider> -->
          <div class="job-content">
              <div class="job-main">
                  <div class="job-title">{{ job.title }}</div>
                  <div class="job-description">{{ store.jobShortInfo(job) }}</div>
              </div>

              <div class="job-info">
                <div class="job-info-item">Julkaistu {{ store.formatDate(job.created_at, 'DD.MM') }}</div>
                <div class="job-info-item mt-2">
                  <div class="area-container" :style="myListing ? 'margin-right: 50px;' : ''">
                    <template
                      v-for="(area, index) in job.area"
                      :key="index"
                    >
                      <div v-if="index < 2" class="area-chip">
                        {{ area }}
                      </div>
                    </template>
                    <div v-if="job.area.length > 2" style="line-height: 25px; letter-spacing: 2px;">
                      +{{ job.area.length - 2 }}
                    </div>
                  </div>
                </div>
              </div>
          </div>


          <div v-if="myListing && job.is_deleted" class="deleted">
          </div>
        </v-card >
      </router-link>
      <div
        v-if="myListing"
        class="action-btns"
      >
        <v-menu @click.stop :theme="store.lightTheme ? 'light' : 'dark'">
          <template v-slot:activator="{ props }">
            <v-btn @click.stop v-bind="props" icon="mdi-dots-vertical" class="more-btn" :color="!store.lightTheme ? 'grey-darken-3' : 'grey-lighten-3'"></v-btn>
          </template>

          <v-list>
            <v-list-item
              @click.stop="deleteListing(job)"
              class="menu-action-btn"
              title="Poista listaus"
            >
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </div>
  </v-hover>
</template>
<script setup>
import { defineProps } from 'vue';
import { useAppStore } from '@/store/app'
import { useRouter, useRoute } from 'vue-router';

window.scrollTo(0, 0);
const router = useRouter();
const route = useRoute();
const store = useAppStore();
const props = defineProps([
  'job',
  'myListing'
]);

const job = props.job;
const myListing = props.myListing;

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
  .job-wrapper {
    width: 100%;
    max-width: 1000px;
  }
  .job {
    cursor: pointer;
    border-radius: 6px;
    width: 100%;
    max-width: 1000px;
    height: 80px;
    display: flex;
    position: relative;
    margin: 10px 0;
    text-decoration: none;
    background-color: var(--card-bg-color);
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
      display: flex;
      flex-direction: column;
      gap: 5px;
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
      display: flex;
      flex-direction: column;
      gap: 5px;
  }
  .job-info-item {
    font-size: 14px;
    display: flex;
    justify-content: flex-end;
  }

  .action-btns {
    position: absolute;
    bottom: 15px;
    right: 5px;
  }
  .more-btn {
    height: 40px;
    width: 40px;
  }
</style>