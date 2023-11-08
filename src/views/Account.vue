<template>
  <div class="main-wrapper">
    <div class="main-content">

      <v-container
       style="margin-top: 120px;"
       v-if="store.user"
      >
        <div
          class="row"
        >
          <div class="profile-image-container">
            <v-img
                v-if="store.user.has_image"
                :src="`${store.url}/profile-image/${store.user.id}?${Date.now()}`"
                cover
                class="profile-image"
                :key="profileImageUpdated"
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
              <div v-if="!store.user.has_image" class="profile-image empty">
                <v-icon class="empty-icon">
                  mdi-account
                </v-icon>
              </div>
              <div @click="openFileInput()" class="change-img-text">Vaihda kuva</div>
          </div>
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
  <input
    type="file"
    ref="fileInput"
    @change="handleFileChange"
    style="display: none;"
    id="customFileInput"
  />

  <v-dialog
    v-model="profileImageDialog"
    width="500"
  >

    <v-card>
      <canvas id="imageCanvas" style="display: none;"></canvas>
      <v-card-item>
        <div class="new-profile-img-wrapper">
          <div class="new-profile-img-container">
            <v-img
              :src="newProfileImageResult"
              alt="your image"
              cover
              aspect-ratio="1"
              id="new-profile-img"
            >
            </v-img>
          </div>
          <div @click="openFileInput()" class="change-img-text">Vaihda kuva</div>
        </div>

      </v-card-item>

      <v-card-actions>
        <v-col class="d-flex justify-space-between">
          <v-btn @click="profileImageDialog = false" class="text-none">Peruuta</v-btn>
          <v-btn color="primary" @click="confirmProfileImage()" class="text-none">Valmis</v-btn>
        </v-col>
      </v-card-actions>
    </v-card>

  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAppStore } from '@/store/app';

const store = useAppStore();
const fileInput = ref(null);
const profileImageDialog = ref(false);

const newProfileImageResult = ref(null);
const newProfileImage = ref(null);
const profileImageUpdated = ref(0);

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
  return 'Käyttäjä luotu ' + store.formatDate(store.user.created_at);
});
if (store.user) {
  // router.replace({ path: '/' })
  // store.tab = '';
  // fullName.value = ;
} else {
  store.loginDialogShowing = true;
}

function handleFileChange(event) {
  const selectedFile = event.target.files[0];
  // Check if a file is selected
  if (selectedFile) {
    // Check if the selected file is an image (you can adjust the accepted image types)
    if (selectedFile.type.startsWith('image/') && !selectedFile.type.startsWith('image/gif')) {
      newProfileImage.value = null;
      newProfileImageResult.value = null;
      store.loading = true;
      // selectedFiles.value.push(selectedFile);
      profileImageDialog.value = true;
      var reader = new FileReader();
      reader.onload = function (e) {
        // selectedFileResults.value.push(e.target.result);
        const img = new Image();
        img.onload = () => {
          let targetWidth = 1080;
          let targetHeight = 1080;

          const imageCanvas = document.getElementById('imageCanvas');
          const canvasContext = imageCanvas.getContext('2d');

          // Calculate the aspect ratio of the image
          const imageAspectRatio = img.width / img.height;

          // Calculate the target aspect ratio
          const targetAspectRatio = targetWidth / targetHeight;

          let drawWidth, drawHeight, xOffset, yOffset;

          if (imageAspectRatio > targetAspectRatio) {
            // Image is wider than the target aspect ratio, crop horizontally
            drawHeight = targetHeight;
            drawWidth = drawHeight * imageAspectRatio;
            yOffset = 0;
            xOffset = (drawWidth - targetWidth) / 2;
          } else {
            // Image is taller than the target aspect ratio, crop vertically
            drawWidth = targetWidth;
            drawHeight = drawWidth / imageAspectRatio;
            xOffset = 0;
            yOffset = (drawHeight - targetHeight) / 2;
          }

          // Set the canvas dimensions to the target size
          imageCanvas.width = targetWidth;
          imageCanvas.height = targetHeight;

          // Draw the cropped and resized image
          canvasContext.drawImage(img, -xOffset, -yOffset, drawWidth, drawHeight);

          imageCanvas.toBlob((blob) => {
            newProfileImage.value = new File([blob], selectedFile.name, { type: selectedFile.type });
            newProfileImageResult.value = imageCanvas.toDataURL('image/jpeg', 0.8);
            store.loading = false;
          }, selectedFile.type, 0.8);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(selectedFile);
    } else {
      // Handle the case where the selected file is not an image
      store.snackbarText = 'Valitse kuva tiedostotyyppi';
      store.snackbarColor = 'red-darken-2';
      store.snackbar = true;
    }
  }
}

function openFileInput() {
  // Trigger the hidden file input
  fileInput.value.click();
}

function confirmProfileImage() {
  let payload = {
    image: newProfileImage.value
  };
  store.loading = true;
  store.loadingBackground = true;
  store.uploadProfileImage(payload).then((res) => {
    profileImageDialog.value = false;
    store.loading = false;
    store.loadingBackground = false;
    setTimeout(() => {
      profileImageUpdated.value++;
    }, 500);
  }).catch((e) => {
    store.loading = false;
    store.loadingBackground = false;
  })
}

store.tab = 'account';

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
    width: 100px;
    height: 100px;
    border-radius: 50%;
    flex: none;
  }

  .profile-image.empty {
    background-color: #efefef;
    position: relative;
    overflow: hidden;
  }
  .profile-image.empty .empty-icon {
    font-size: 120px;
    color: #838383;
    position: absolute;
    left: 50%;
    top: 60%;
    transform: translate(-50%, -50%);
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
    padding-bottom: 25px;
  }

  .joined-at {
    font-size: 18px;
  }

  .profile-image-container {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 10px;
  }
  .change-img-text:hover {
    text-decoration: underline;
    cursor: pointer;
  }

  .new-profile-img-wrapper {
    /* width: 400px; */
    height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 20px;
  }

  .new-profile-img-container {
    width: 300px;
    height: 300px;
    overflow: hidden;
    border-radius: 50%;
  }

</style>
