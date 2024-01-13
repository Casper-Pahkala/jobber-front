<template>
  <div class="top-wrapper">

    <div class="row">
      <div class="profile-image-container">
        <v-img
          v-if="store.user.has_image"
          :src="store.user.profileImageUrl"
          cover
          class="profile-image"
          :key="profileImageUpdated"
          @click.stop="openFileInput()"
        >
          <template v-slot:placeholder>
            <v-skeleton-loader type="image" round :theme="store.theme"/>
          </template>
        </v-img>
        <div v-else class="profile-image empty">
          <v-icon class="empty-icon" @click.stop="openFileInput()">
            mdi-account
          </v-icon>
        </div>

        <v-icon
          @click.stop="openFileInput()"
          id="edit-profile-image-btn"
        >
          mdi-pencil
          </v-icon>
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
  </div>

  <div class="info-container">
    <div class="info-item">
      <v-checkbox
        label="Näytä profiili julkisilla listoilla"
        v-model="showInPublicLists"
        :theme="store.theme"
      ></v-checkbox>
    </div>

    <div class="info-item large row">
      <div class="info-item medium">
        <label>Näkyvyys</label>
        <v-select
          v-model="visibility"
          item-value="id"
          item-title="text"
          variant="outlined"
          :items="visibilityItems"
          :theme="store.theme"
        ></v-select>
      </div>

      <div class="info-item medium">
        <label>Rooli</label>
        <v-select
          v-model="role"
          item-value="id"
          item-title="text"
          variant="outlined"
          :items="roleItems"
          :theme="store.theme"
        ></v-select>
      </div>
    </div>

    <div class="info-item large">
      <div class="label-container">
        <label v-if="role === 1">Haettavat työt</label>
        <label v-else-if="role === 2">Tarjottavat työt</label>
        <label v-else>Tarjottavat palvelut</label>

        <div class="label-info">
          Lisää painamalla enter tai klikkaamalla ulos kentästä
        </div>
      </div>
      <v-combobox
        v-model="lookingOrOfferingJobs"
        chips
        multiple
        variant="outlined"
        :placeholder="role !== 3 ? 'Esim. Nurmikonleikkuu, Lastenhoito' : 'Esim. Muuttopalvelut'"
        :theme="store.theme"
      ></v-combobox>
    </div>

    <div class="info-item large">
      <label>Alue</label>
      <v-chip-group
        mandatory
        selected-class="text-primary"
        column
        style="width: 100%;"
        v-model="areaType"
      >
        <v-chip
        class="chip"
        color="primary"
        >
          Valitse kaupungit
        </v-chip>
        <v-chip
        class="chip"
        >
          Koko suomi
        </v-chip>
      </v-chip-group>
      <v-autocomplete
        v-show="areaType === 0"
        v-model="areas"
        v-model:search="areaSearchTerm"
        auto-select-first
        clearable
        multiple
        chips
        closable-chips
        item-value="id"
        item-title="name"
        variant="outlined"
        :theme="store.theme"
        :items="store.finnishCities"
        placeholder="Valitse kaupunki"
      ></v-autocomplete>
    </div>

    <div class="info-item large">
      <label>Kuvaus</label>
      <v-textarea
        :no-resize="true"
        v-model="description"
        placeholder="Esittele itsesi tai yrityksesi tässä"
        variant="outlined"
        auto-grow
        :rows="1"
        :max-rows="1"
        :theme="store.theme"
      >
      </v-textarea>
    </div>

    <div class="actions">
      <v-btn
        class="text-none"
        :theme="store.theme"
        variant="outlined"
      >
        Peruuta
      </v-btn>

      <v-btn
        class="text-none"
        color="primary"
      >
        Tallenna
      </v-btn>
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

    <v-card :theme="store.theme">
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
import { ref, computed, watch } from 'vue';
import { useAppStore } from '@/store/app';
import { useRouter } from 'vue-router';
import { nextTick } from 'vue';

const router = useRouter();
window.scrollTo(0, 0);
const store = useAppStore();
const fileInput = ref(null);
const profileImageDialog = ref(false);

const showInPublicLists = ref(false);
const newProfileImageResult = ref(null);
const newProfileImage = ref(null);
const profileImageUpdated = ref(0);
const visibility = ref(1);
const role = ref(1);
const lookingOrOfferingJobs = ref([]);
const areas = ref([]);
const areaSearchTerm = ref('');
const areaType = ref(0);
const visibilityItems = [
  { id: 1, text: 'Julkinen' },
  { id: 2, text: 'Vain ystävät' },
  { id: 3, text: 'Yksityinen' }
];
const roleItems = [
  { id: 1, text: 'Työnhakija' },
  { id: 2, text: 'Työnantaja' },
  { id: 3, text: 'Palvelun tarjoaja' },
];

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
if (!store.user) {
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


watch(areas, (newVal, oldVal) => {
  if (newVal.length > oldVal.length) {
    areaSearchTerm.value = ''
  }
});

watch(lookingOrOfferingJobs, (newVal, oldVal) => {
  if (newVal.length > oldVal.length) {
    let newArray = [];
    lookingOrOfferingJobs.value.forEach(job => {
      newArray.push(job.charAt(0).toUpperCase() + job.slice(1));
    });
    lookingOrOfferingJobs.value = newArray;
  }
});
</script>

<style scoped>

#edit-profile-image-btn {
  position: absolute;
  height: 40px;
  width: 40px;
  background-color: var(--edit-pencil-bg);
  border-radius: 50%;
  right: 0px;
  bottom: 0px;
  color: var(--edit-pencil-color);
  cursor: pointer;
}

  .fullname {
    font-weight: 600;
    font-size: 30px;
  }
  .row {
    display: flex;
    gap: 40px;
    align-items: center;
    padding-bottom: 10px;
  }
  .profile-image {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    flex: none;
    cursor: pointer;
    border: 2px solid #ccc;
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


  .user-info {
    display: flex;
    flex-direction: column;
    padding-bottom: 25px;
  }

  .privacy-container {
    flex-grow: 1;
    max-width: 200px;
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
    position: relative;
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

  .profile-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .info-wrapper {
    display: flex;
    padding: 20px 10px;
  }

.actions {
  max-width: 600px;
  display: flex;
  width: 100%;
  justify-content: end;
  gap: 20px;
}

.top-wrapper {
  display: flex;
  justify-content: space-between;
}

.info-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item.row {
  flex-direction: row;
  gap: 20px;
}

.info-item.row .info-item {
  flex-grow: 1;
}
.info-item.small {
  max-width: 200px;
}

.info-item.medium {
  max-width: 300px;
}

.info-item.large {
  max-width: 600px;
}

.info-item label {
  font-weight: 600;
  font-size: 16px;
  text-wrap: nowrap;
}

.flex {
  display: flex;
  gap: 20px;
}

.label-container {
  display: flex;
  align-items: end;
}

.label-info {
  margin-left: 10px;
  color: var(--text-light-color);
  font-size: 14px;
}
@media (max-width: 960px) {
  .info-wrapper {
    flex-direction: column;
  }

  .info-wrapper .actions {
    direction: ltr;
  }
}
</style>
