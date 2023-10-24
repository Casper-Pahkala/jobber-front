<template>
  <div class="main-wrapper">
    <div class="main-content">

      <v-container
       style="margin-top: 120px;"
      >
        <div
          class="row"
        >
          <v-img
              :src="'http://165.227.145.175/job-image/d4bf216c4f86b11a6b5a431b2977b1a5623308791e6df8a7e082a9afafa31466/image_0'"
              :lazy-src="'http://165.227.145.175/job-image/d4bf216c4f86b11a6b5a431b2977b1a5623308791e6df8a7e082a9afafa31466/image_0'"
              cover
              class="profile-image"
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
            <div class="user-info">
              <span class="fullname">
                {{ fullName }}
              </span>
              <span class="joined-at">
                {{ joinedAt }}
              </span>
            </div>
        </div>
      </v-container>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAppStore } from '@/store/app';
import { useRouter } from 'vue-router';

const store = useAppStore();
const router = useRouter();
const fullName = computed(() => {
  if (!store.user) {
    return '';
  }
  return store.user.first_name + ' ' + store.user.last_name;
});

const joinedAt = computed(() => {
  if (!store.user) {
    return '';
  }
  return 'Käyttäjä luotu ' + store.formatDate(store.user.joined_at);
});
if (store.user) {
  // router.replace({ path: '/' })
  // store.tab = '';
  // fullName.value = ;
} else {
  store.loginDialogShowing = true;
}
</script>

<style scoped>

  .fullname {
    font-weight: 600;
    font-size: 30px;
  }
  .row {
    display: flex;
    gap: 40px;
    align-items: center;
  }
  .profile-image {
    width: 110px;
    height: 110px;
    border-radius: 50%;
    flex: none;
  }
  .main-wrapper {
    display: flex;
    justify-content: center;
  }
  .main-content {
    max-width: 1400px;
    width: 100%;
    /* padding-top: 40px; */
  }

  .user-info {
    display: flex;
    flex-direction: column;
  }

  .joined-at {
    font-size: 18px;
  }

</style>
