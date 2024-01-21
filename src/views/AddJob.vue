<template>
  <v-container
    class="add-container"
  >
    <h1 class="title pb-5">{{ $t('Luo listaus') }}</h1>
      <v-window v-model="jobTab" class="main-window" disabled>
        <v-window-item value="one" class="window">
          <!-- <div class="title">
            <h2>Kuvat</h2>
          </div> -->
          <div class="content">
            <v-row
              justify="center"
              align="center"
              class="images"
            >
              <v-card
                v-for="(image, index) in selectedFileResults"
                :key="index"
                elevation="8"
                class="image-card"
              >
                <v-img
                  :src="image ? image.image : '#'"
                  alt="your image"
                  cover
                  aspect-ratio="1"
                >
                </v-img>

                <v-btn
                  v-if="image.ready"
                  class="close-btn"
                  icon="mdi-delete"
                  elevation="8"
                  size="35"
                  :style="store.lightTheme ? 'color: rgb(25, 25, 25);' : 'color: rgb(220, 220, 220);'"
                  @click="deleteImage(index)"
                >
                </v-btn>

                <v-progress-circular class="progress-bar" :model-value="image.progress" v-if="!image.ready" color="primary"></v-progress-circular>
              </v-card>
              <canvas id="imageCanvas" style="display: none;"></canvas>
              <v-card
                v-if="selectedFileResults.length < 8"
                elevation="8"
                class="image-card"
              >
                  <input
                    type="file"
                    ref="fileInput"
                    @change="handleFileChange"
                    style="display: none;"
                    id="customFileInput"
                  />
                  <v-btn @click="openFileInput" icon="mdi-plus" flat id="add-img-btn" class="text-none image-card">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
                      <v-icon
                        style="font-size: 35px;"
                      >
                      </v-icon>
                      {{ $t('Lisää kuva') }}
                    </div>
                  </v-btn>
              </v-card>
            </v-row>
          </div>

          <div class="actions">
            <v-btn color="primary" class="text-none" append-icon="mdi-chevron-right" style="float: right;" @click="changeJobTab('two')" :disabled="!allImagesUploaded">{{ $t('Seuraava') }}</v-btn>
          </div>

        </v-window-item>

        <v-window-item value="two" class="window">
          <div class="title">
            <h2>Tiedot</h2>
          </div>
          <div class="content">
            <v-form @submit.prevent="changeJobTab('three')" ref="jobForm">
              <v-container>
                  <h4 class="pl-1">{{ $t('Mikä on työn otsikko?') }} *</h4>
                  <span class="pl-1">{{ $t('Esim. Lastenhoitaja tai Nurmikonleikkaaja') }}</span>
                  <v-text-field
                    v-model="title"
                    label="Työn otsikko"
                    :rules="jobTitleRules"
                    required
                    :theme="store.theme"
                  ></v-text-field>
                </v-container>

                <v-container>
                  <h4 class="pl-1">{{ $t('Mikä on kohde alueesi?') }} *</h4>
                  <v-autocomplete
                    v-if="false"
                    label="Alue"
                    :items="areaSearchTerm.length > 0 ? areaSuggestions : defaultSuggestions"
                    @update:search="getAddressSuggestions()"
                    hide-no-data
                    v-model:search="areaSearchTerm"
                    v-model="area"
                    auto-select-first
                    clearable
                    :loading="areaSuggestionsLoading"
                    multiple
                    chips
                    closable-chips
                    no-data-text="Aluetta ei löytynyt"
                    :theme="store.theme"
                  ></v-autocomplete>

                  <v-autocomplete
                    v-model="area"
                    v-model:search="areaSearchTerm"
                    auto-select-first
                    clearable
                    multiple
                    chips
                    closable-chips
                    item-value="id"
                    item-title="name"
                    :theme="store.theme"
                    :items="store.finnishCities"
                    placeholder="Valitse kaupunki"
                  ></v-autocomplete>
                </v-container>

                <v-container>
                  <v-textarea label="Kuvaus" :rules="descriptionRules" required v-model="description" no-resize></v-textarea>
                </v-container>

              </v-form>
            </div>
            <div class="actions">
              <v-btn @click="changeJobTab('one')" class="back-btn text-none" :color="store.lightTheme ? 'grey-lighten-3' : 'grey-darken-3'">{{ $t('Takaisin') }}</v-btn>
              <v-btn color="primary" type="submit" class="text-none" @click="changeJobTab('three')" append-icon="mdi-chevron-right">{{ $t('Seuraava') }}</v-btn>
            </div>
        </v-window-item>

        <v-window-item value="three" class="window">
          <div class="title">
            <h2>{{ $t('Tiedot') }}</h2>
          </div>

          <div class="content">

            <v-container>
              <h4 class="pl-1">{{ $t('Milloin työt alkavat?') }} *</h4>
              <v-chip-group
                mandatory
                selected-class="text-primary"
                column
                v-model="startTimeKnown"
              >
                <v-chip
                  v-for="(dateType, index) in dateTypes"
                  :key="index"
                >
                  {{ dateType }}
                </v-chip>

              </v-chip-group>

              <v-dialog v-model="dateDialogShowing" max-width="400" v-if="startTimeKnown == 1">
                <template v-slot:activator="{ on }">
                  <v-text-field
                    v-model="formattedDate"
                    label="Päivä"
                    readonly
                    v-on="on"
                    @update:focused="dateDialogShowing = true"
                    :rules="jobDateRules"
                    required
                    :theme="store.theme"
                  ></v-text-field>
                </template>
                <v-card :theme="store.theme">
                  <v-card-item>
                    <v-locale-provider locale="fi">
                      <v-date-picker
                        v-model="tempDate"
                        hide-actions
                        :min="minDate"
                        title="Valitse päivämäärä"
                      >
                      </v-date-picker>
                    </v-locale-provider>
                  </v-card-item>
                  <v-card-actions style="direction: rtl;">
                    <v-btn flat @click="confirmDateSelection">{{ $t('OK') }}</v-btn>
                    <v-btn flat @click="dateDialogShowing = false">{{ $t('Peruuta') }}</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-container>

            <v-container>
                  <h4 class="pl-1">{{ $t('Mikä on työsopimuksen tyyppi?') }}</h4>
                  <v-chip-group
                    mandatory
                    selected-class="text-primary"
                    column
                    v-model="contractType"
                  >
                    <v-chip
                      v-for="(contractType, index) in contractTypes"
                      :key="index"
                    >
                      {{ contractType }}
                    </v-chip>
                  </v-chip-group>

                  <template
                  v-if="contractType == 0"
                  >
                  <h4 class="pl-1">{{ $t('Mikä on työn kesto?') }}</h4>
                  <span class="pl-1">{{ $t('Jätä tyhjäksi jos ei tiedossa') }}</span>

                  <v-text-field
                    label="kesto"
                    suffix="h"
                    type="number"
                    v-model="duration"
                    @update:model-value="estimatedTimeUpdated"
                    min="0"
                    :rules="numberRules"
                    :theme="store.theme"
                  >
                  </v-text-field>

                  <h4 class="pl-1">{{ $t('Mikä on palkan tyyppi?') }}</h4>
                  <span class="pl-1">{{ $t('Jätä tyhjäksi jos ei tiedossa') }}</span>
                  <v-chip-group
                    mandatory
                    selected-class="text-primary"
                    column
                    v-model="salaryType"
                  >
                    <v-chip
                      v-for="(salaryType, index) in salaryTypes"
                      :key="index"
                    >
                      {{ salaryType }}
                    </v-chip>
                  </v-chip-group>

                  <v-text-field
                    :label="salaryTypes[salaryType]"
                    :suffix="salaryType == 0 ? '€/h' : '€'"
                    type="number"
                    v-model="salary"
                    min="0"
                    @change="sanitizeSalary()"
                    :rules="numberRules"
                    :theme="store.theme"
                  >
                  </v-text-field>
                  </template>

                  <template v-else>

                    <h4 class="pl-1">{{ $t('Paljonko tunteja viikossa?') }}</h4>
                    <span class="pl-1">{{ $t('Jätä tyhjäksi jos ei tiedossa') }}</span>

                    <v-text-field
                      label="Tunteja viikossa"
                      suffix="h"
                      type="number"
                      v-model="hoursPerWeek"
                      min="0"
                      :rules="numberRules"
                      :theme="store.theme"
                    >
                    </v-text-field>

                    <h4 class="pl-1">{{ $t('Mikä on palkan tyyppi?') }}</h4>
                    <span class="pl-1">{{ $t('Jätä tyhjäksi jos ei tiedossa') }}</span>
                    <v-chip-group
                      mandatory
                      selected-class="text-primary"
                      column
                      v-model="salaryType"
                    >
                      <v-chip
                        v-for="(salaryType, index) in salaryTypes2"
                        :key="index"
                      >
                        {{ salaryType }}
                      </v-chip>
                    </v-chip-group>
                    <v-text-field
                      :label="salaryTypes2[salaryType]"
                      :suffix="salaryType == 0 ? '€/h' : '€/kk'"
                      type="number"
                      v-model="salary"
                      min="0"
                      :rules="numberRules"
                      @change="sanitizeSalary()"
                      :theme="store.theme"
                    >
                    </v-text-field>
                  </template>
                </v-container>
          </div>

          <div class="actions">
            <v-btn @click="changeJobTab('two')" class="back-btn text-none" :color="store.lightTheme ? 'grey-lighten-3' : 'grey-darken-3'">{{ $t('Takaisin') }}</v-btn>
            <v-btn color="primary" class="text-none" append-icon="mdi-plus" style="float: right;" @click="addjob" v-if="store.user">{{ $t('Luo listaus') }}</v-btn>
            <v-btn color="primary" class="text-none" style="float: right;" @click="store.loginDialogShowing = true" v-else>{{ $t('Kirjaudu sisään') }}</v-btn>
          </div>
        </v-window-item>
      </v-window>
  </v-container>

  <!-- <div v-if="!store.user" class="login-container">
    Kirjaudu sisään niin pääset lisäämään listauksen
    <v-btn
      class="mt-7"
      size="large"
      color="primary"
      @click="store.loginDialogShowing = true"
    >
      Kirjaudu
    </v-btn>
  </div> -->
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useAppStore } from '@/store/app';
import moment from 'moment';
import { useRouter } from 'vue-router';

const router = useRouter();
const store = useAppStore();
const selectedFileResults = ref([]);
const selectedFiles = ref([]);
const fileInput = ref(null);
const jobTab = ref('one');

const dateTypes = ['Sopimuksen mukaan', 'Tarkka päivämäärä'];
const contractTypes = ['Keikkatyö', 'Vakituinen', 'Toistaiseksi voimassa oleva'];
const salaryTypes = ['Tuntipalkka', 'Urakkapalkka'];
const salaryTypes2 = ['Tuntipalkka', 'Kuukausipalkka'];
const title = ref('');

const area = ref([]);
const areaSearchTerm = ref('');
const areaSuggestionsLoading = ref(false);
const areaSuggestions = ref([]);

const defaultSuggestions = [
  'Helsinki, Suomi',
  'Espoo, Suomi',
  'Tampere, Suomi',
  'Vantaa, Suomi',
  'Oulu, Suomi',
  'Turku, Suomi',
  'Jyväskylä, Suomi',
  'Kuopio, Suomi',
  'Lahti, Suomi',
  'Pori, Suomi'
];

const description = ref('');

const dateDialogShowing = ref(false);
const startTimeKnown = ref(0);
const startTime = ref(null);
const formattedDate = computed(() => {
  return startTime.value ? moment(startTime.value).format('DD.MM.YYYY') : null;
})
const tempDate = ref(null);

const contractType = ref(0);
const duration = ref(null);
const salaryType = ref(0);
const hoursPerWeek = ref(null);
const salary = ref(null);

const allImagesUploaded = computed(() => {
  if (selectedFileResults.value.length === 0) {
    // TODO: This should probably be false in prod
    return true;
  }

  let allReady = true;
  selectedFileResults.value.forEach(f => {
    if (!f.ready) {
      allReady = false;
    }
  });
  if (allReady) {
    console.log('uploaded all');
    return true;
  } else {
    return false;
  }
})

watch(area, async (newVal, oldVal) => {
  if (newVal.length > oldVal.length) {
    areaSearchTerm.value = ''
  }
});

function confirmDateSelection() {
  dateDialogShowing.value = false;
  startTime.value = tempDate.value;
}

function openFileInput() {
  // Trigger the hidden file input
  fileInput.value.click();
}

function deleteImage(imageIndex) {
  selectedFileResults.value =  selectedFileResults.value.filter((result, index) => index !== imageIndex);
  selectedFiles.value =  selectedFiles.value.filter((result, index) => index !== imageIndex);
}

function handleFileChange(event) {
  const selectedFile = event.target.files[0];

  // Check if a file is selected
  if (selectedFile) {
    // Check if the selected file is an image (you can adjust the accepted image types)
    if (selectedFile.type.startsWith('image/') && !selectedFile.type.startsWith('image/gif')) {
      // selectedFiles.value.push(selectedFile);
      var reader = new FileReader();
      reader.onload = function (e) {
        // selectedFileResults.value.push(e.target.result);
        const img = new Image();
        img.onload = () => {
            const maxWidth = 1920;
            const maxHeight = 1080;
            let width = img.width;
            let height = img.height;

            if (width > maxWidth || height > maxHeight) {
                if (width / maxWidth > height / maxHeight) {
                    height *= maxWidth / width;
                    width = maxWidth;
                } else {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }
            const imageCanvas = document.getElementById('imageCanvas');
            const canvasContext = imageCanvas.getContext('2d');
            imageCanvas.width = width;
            imageCanvas.height = height;
            canvasContext.drawImage(img, 0, 0, width, height);

            // Now the image is resized and ready for upload
            const resizedImageData = imageCanvas.toDataURL('image/jpeg', 0.8); // Adjust the quality as needed
            selectedFileResults.value.push({
              image: resizedImageData,
              progress: 10,
              ready: false
            });

            imageCanvas.toBlob((blob) => {
              const resizedFile = new File([blob], selectedFile.name, { type: 'image/jpeg' });
              selectedFiles.value.push(resizedFile);

              uploadImage(blob);
            }, 'image/jpeg', 0.8);
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

function uploadImage(payload) {
  const xhr = new XMLHttpRequest();
  const formData = new FormData();
  formData.append('image', payload);
  let index = selectedFileResults.value.length - 1;
  if (index < 0) {
    index = 0;
  }
  const image = selectedFileResults.value[index];
  xhr.upload.addEventListener('progress', (event) => {
    if (event.lengthComputable) {
      const progress = (event.loaded / event.total) * 100;
      image.progress = progress;
      if (progress >= 100) {
        setTimeout(() => {
          image.ready = true;
        }, 1000);
      }

    }
  });

  xhr.open('POST', `${store.url}/api/jobs/upload-image.json`, true); // Replace with your actual endpoint
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      try {
        const data = JSON.parse(xhr.responseText).data;
        image.id = data.image_id;
        console.log(image);

      } catch (e) {
        console.error('Error parsing response:', e);
      }
    }
  };
  xhr.send(formData);
}

function changeJobTab(tab) {
  jobTab.value = tab;
}

function getAddressSuggestions() {
  let term = null;
  areaSuggestions.value = [];
  setTimeout(() => {
    term = areaSearchTerm.value;
  }, 100);
  // if (areaSearchTerm.value && areaSearchTerm.value.length > 0 && term === areaSearchTerm.value) {
    setTimeout(() => {
      if (areaSearchTerm.value && areaSearchTerm.value.length > 0 && term === areaSearchTerm.value) {
        areaSuggestionsLoading.value = true;
        store.getAddressSuggestions(areaSearchTerm.value).then((response) => {
          areaSuggestions.value = response.suggestions;
          areaSuggestionsLoading.value = false;
        });
      }
    }, 500);
  // }
  // else {
  //   areaSuggestionsLoading.value = true;
  //     store.getAddressSuggestions('Helsinki').then((response) => {
  //       areaSuggestions.value = response.suggestions;
  //       areaSuggestionsLoading.value = false;
  //     });
  // }

}

function addjob() {
  store.loading = true;

  let payload = {
    title: title.value,
    area: area.value,
    description: description.value,
    images: selectedFileResults.value.map(f => f.id),
    date: startTimeKnown.value === 1 ? startTime.value : null,
    contract_type: contractType.value,
    salary_type: salaryType.value,
    salary: salary.value,
  };

  if (contractType.value === 0) {
    payload.hours = duration.value;
  } else {
    payload.hours = hoursPerWeek.value;
  }

  store.addJob(payload).then((response) => {
    router.replace('/jobs/' + response.job_id);
  })
  .catch(() => {

  });
  // jobForm.value.validate().then((response) => {
  //   if (response.valid) {
  //   }
  // })
}

function sanitizeSalary() {
  var v = parseFloat(salary.value);
  if (isNaN(v)) {
    salary.value = '';
  } else {
    salary.value = v.toFixed(2);
  }
}

</script>

<style scoped>

  .add-container {
    min-height: calc(100vh - var(--app-bar-height));
    max-width: 1080px;
  }

  #add-img-btn {
    width: 100%;
    height: 100%;
    border-radius: 0;
  }

  .close-btn, .progress-bar {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 100;
    background-color: var(--card-bg-color);
    border-radius: 50%;
  }

  .images {
    gap: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex: none !important;
    height: fit-content;
    margin: 10px;
  }

  .main-window {
    height: 100%;
  }

  .window {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 780px;
  }

  .window .title, .window .actions {
    flex: 1;
  }

  .window .actions {
    display: flex;
    gap: 20px;
    justify-content: end;
    align-items: end;
    padding: 10px;
    margin-bottom: 60px;
  }

  .window .content {
    flex: 8;
    display: flex;
    justify-content: center;
    flex-direction: column;
  }

  .login-container {
    height: calc(100vh - 64px);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-direction: column;
    gap: 20px;
  }
  .image-card {
    background-color: var(--card-bg-color) !important;
    width: 180px;
    height: 180px;
  }

  @media (max-width: 1199px) {
    .image-card {
      width: 160px;
      height: 160px;
    }

    .title {
      font-size: 24px;
    }

    h2 {
      font-size: 20px;
    }

    .window .content {
      flex: 10;
      /* justify-content: start; */
    }
  }

  @media (max-width: 699px) {
    .image-card {
      width: 140px;
      height: 140px;
    }
  }

</style>
