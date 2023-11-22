<template>
    <div
      class="row"
    >
          <div class="profile-image-container">
            <v-img
                v-if="store.user.has_image"
                :src="store.user.profileImageUrl"
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

      <v-container class="profile-container" v-if="store.user">

        <v-row
          class="info-wrapper"
        >
          <v-col
            cols="3"
            class="title"
          >
          <h4>
            Nimi
          </h4>
          </v-col>

          <v-col
            cols="6"
            class="content"
          >
          <template v-if="!editingName">
              {{ fullName }}
            </template>

            <template v-else>
              <v-row style="max-width: 440px;">
                <v-col cols="6">
                  <v-text-field
                    variant="outlined"
                    style="max-width: 200px;"
                    density="compact"
                    v-model="userFirstName"
                  >
                  </v-text-field>
                </v-col>

                <v-col cols="6">
                  <v-text-field
                    variant="outlined"
                    style="max-width: 200px;"
                    density="compact"
                    v-model="userLastName"
                  >
                  </v-text-field>
                </v-col>
              </v-row>


              <v-btn
                variant="outlined"
                class="text-none"
                @click="cancelNameEditing()"
              >
                Peruuta
              </v-btn>

              <v-btn
                variant="outlined"
                class="text-none ml-5"
                color="primary"
                @click="editName()"
              >
                Tallenna
              </v-btn>
            </template>
          </v-col>

          <v-col
            cols="3"
            class="actions"
            v-if="!editingName"
          >
            <v-btn
              variant="outlined"
              class="text-none"
              color="primary"
              @click="editingName = true"
            >
              Muokkaa
            </v-btn>
          </v-col>
        </v-row>

        <v-divider></v-divider>

        <v-row
          class="info-wrapper"
        >
          <v-col
            cols="3"
            class="title"
          >
          <h4>
            Sähköposti
          </h4>
          </v-col>


          <v-col
            cols="6"
            class="content"
          >
            <template v-if="!editingEmail">
              {{ store.user.email }}
            </template>

            <template v-else>
              <v-form ref="form" v-model="valid">
                <v-text-field
                  variant="outlined"
                  style="max-width: 400px;"
                  density="compact"
                  v-model="userEmail"
                  :rules="emailRules"
                  required
                  type="email"
                  name="email"
                >
                </v-text-field>

                <v-btn
                  variant="outlined"
                  class="text-none"
                  @click="cancelEmailEditing()"
                >
                  Peruuta
                </v-btn>

                <v-btn
                  variant="outlined"
                  class="text-none ml-5"
                  color="primary"
                  @click="editEmail()"
                  :disabled="!valid"
                >
                  Tallenna
                </v-btn>
              </v-form>
            </template>
          </v-col>

          <v-col
            cols="3"
            class="actions"
          >
            <v-btn
              variant="outlined"
              class="text-none"
              color="primary"
              @click="editingEmail = true"
              v-if="!editingEmail"
            >
              Muokkaa
            </v-btn>
          </v-col>
        </v-row>

        <v-divider></v-divider>

        <v-row
          class="info-wrapper"
        >
          <v-col
            cols="3"
            class="title"
          >
          <h4>
            Poista käyttäjä
          </h4>
          </v-col>

          <v-col
            cols="6"
            class="content"
          >
          Kaikki tietosi poistetaan tietokannastamme, eikä tätä voi peruuttaa
          </v-col>

          <v-col
            cols="3"
            class="actions"
          >
            <v-btn
              variant="outlined"
              class="text-none"
              color="error"
              @click="deleteUser"
            >
              Poista käyttäjä
            </v-btn>
          </v-col>
        </v-row>
      </v-container>

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
import { useRouter } from 'vue-router';

const router = useRouter();
window.scrollTo(0, 0);
const store = useAppStore();
const fileInput = ref(null);
const profileImageDialog = ref(false);

const newProfileImageResult = ref(null);
const newProfileImage = ref(null);
const profileImageUpdated = ref(0);

const editingEmail = ref(false);
const editingName = ref(false);

const userEmail = ref('');
const userFirstName = ref('');
const userLastName = ref('');

const fullName = computed(() => {
  if (!store.user) {
    return '';
  }
  return store.user.first_name + ' ' + store.user.last_name;
});

const valid = ref(true);

const emailRules = [
  v => !!v || 'Syötä sähköposti',
  v => /.+@.+\..+/.test(v) || 'Syötä kelpaava sähköposti',
  v => v != store.user.email || 'Syötä uusi sähköposti'
];

const joinedAt = computed(() => {
  if (!store.user) {
    return '';
  }
  return 'Käyttäjä luotu ' + store.formatDate(store.user.created_at);
});
if (store.user) {
  userEmail.value = store.user.email;
  userFirstName.value = store.user.first_name;
  userLastName.value = store.user.last_name;
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
  store.uploadProfileImage(payload).then(() => {
    profileImageDialog.value = false;
    store.loading = false;
    store.loadingBackground = false;

    let url = new URL(store.user.profileImageUrl);
    url.searchParams.set('t', new Date());
    store.user.profileImageUrl = url.toString();
    setTimeout(() => {
      profileImageUpdated.value++;
    }, 500);
  }).catch(() => {
    store.loading = false;
    store.loadingBackground = false;
  })
}

store.tab = 'account';

function cancelEmailEditing() {
  editingEmail.value = false;
  userEmail.value = store.user.email;
}

function cancelNameEditing() {
  editingName.value = false;
  userFirstName.value = store.user.first_name;
  userLastName.value = store.user.last_name;
}

function deleteUser() {
  let confirm = window.confirm('Haluatko varmasti poistaa käyttäjäsi?');

  if (confirm) {
    store.deleteUser();
  }
}

function editEmail() {
  let payload = {
    email: userEmail.value,
    type: 'email'
  };
  store.editUser(payload).then(() => {
    editingEmail.value = false;
    setTimeout(() => {
      store.getUser();
    }, 100);
  });
}

function editName() {
  let payload = {
    first_name: userFirstName.value,
    last_name: userLastName.value,
    type: 'name'
  };

  store.editUser(payload).then(() => {
    editingName.value = false;
    setTimeout(() => {
      store.getUser();
    }, 100);
  });
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

  .profile-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .info-wrapper {
    display: flex;
    padding: 20px 10px;
  }

.info-wrapper .actions {
  direction: rtl;
}
</style>
