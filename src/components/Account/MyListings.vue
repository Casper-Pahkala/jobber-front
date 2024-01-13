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


      <div v-if="filteredListings.length == 0 && store.user && !loading" class="no-listings-text">
        Ei listauksia
        <v-btn color="primary" class="text-none" @click="toAdd()">
          Luo listaus
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

function toAdd() {
  store.tab = 'add-job';
  router.push({
    name: 'add-job'
  });
}



</script>
<style scoped>

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

.no-listings-text {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-direction: column;
  gap: 20px;
  flex-grow: 1;
  padding-bottom: 10%;
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
</style>
