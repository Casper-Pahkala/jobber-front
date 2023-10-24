<template>

<v-dialog
    width="600px"
    class=""
  >
    <v-card>
      <v-card-item>
        <v-window v-model="jobTab">
          <v-window-item value="one">
            <v-form @submit.prevent="changeJobTab('two')">
              <v-container>
                <v-row
                  style="height: 440px;"
                  justify="center"
                  align="center"
                >

                  <v-col
                    v-for="(image, index) in selectedFileResults"
                    :key="index"
                    class="d-flex child-flex"
                    cols="4"
                  >
                    <v-card
                      elevation="12"
                      width="140"
                      height="140"
                    >
                      <v-img
                        :src="image ? image : '#'"
                        alt="your image"
                        cover
                        aspect-ratio="1"
                      >
                      </v-img>

                      <v-btn
                        class="close-btn"
                        icon="mdi-delete"
                        elevation="12"
                        size="35"
                        @click="deleteImage(index)"
                      >
                      </v-btn>
                    </v-card>
                  </v-col>
                  <canvas id="imageCanvas" style="display: none;"></canvas>
                  <v-col
                    class="d-flex child-flex"
                    cols="4"
                  >
                    <v-card
                      elevation="12"
                      width="140"
                      height="140"
                    >
                        <input
                          type="file"
                          ref="fileInput"
                          @change="handleFileChange"
                          style="display: none;"
                          id="customFileInput"
                        />
                        <v-btn @click="openFileInput" icon="mdi-plus" flat id="add-img-btn" class="text-none">
                          <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
                            <v-icon
                              style="font-size: 35px;"
                            >
                            </v-icon>
                            Lisää kuva
                          </div>
                        </v-btn>
                    </v-card>
                  </v-col>
                </v-row>
              </v-container>

              <v-card-actions>
                <v-col class="d-flex justify-space-between">
                  <v-btn @click="close()" class="text-none">Peruuta</v-btn>
                  <v-btn color="primary" type="submit" class="text-none">Seuraava</v-btn>
                </v-col>
              </v-card-actions>
            </v-form>
          </v-window-item>

          <v-window-item value="two">
            <v-form @submit.prevent="addjob" ref="jobForm">
              <v-container>
                <v-text-field
                  v-model="jobTitle"
                  label="Työn otsikko"
                  :rules="jobTitleRules"
                  required
                ></v-text-field>
              </v-container>
              <v-container>
                <v-dialog v-model="dateDialogShowing" max-width="400">
                  <template v-slot:activator="{ on }">
                    <v-text-field
                      v-model="formattedDate"
                      label="Päivä"
                      readonly
                      v-on="on"
                      @update:focused="dateDialogShowing = true"
                      :rules="jobDateRules"
                      required
                    ></v-text-field>
                  </template>
                  <v-card>
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
                      <v-btn flat @click="confirmDateSelection">OK</v-btn>
                      <v-btn flat @click="dateDialogShowing = false">Peruuta</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-container>

              <v-container>
                <v-autocomplete
                  label="Osoite"
                  :items="suggestions"
                  @update:search="getAddressSuggestions()"
                  hide-no-data
                  v-model:search="jobAddressSearch"
                  v-model="jobAddress"
                  auto-select-first
                  clearable
                ></v-autocomplete>
              </v-container>

              <v-container>
                <v-row>
                  <v-col
                   cols="4"
                  >
                    <v-text-field
                    label="kesto"
                    suffix="h"
                    type="number"
                    v-model="jobEstimatedTime"
                    @update:model-value="estimatedTimeUpdated"
                    min="0"
                    :rules="numberRules"
                    >
                    </v-text-field>
                  </v-col>

                  <v-col
                   cols="4"
                  >
                    <v-text-field
                      label="Tuntipalkka"
                      suffix="€"
                      type="number"
                      @update:model-value="calculateFullSalary"
                      v-model="jobHourlySalary"
                      min="0"
                      :rules="numberRules"
                    >
                    </v-text-field>
                  </v-col>

                  <v-col
                   cols="4"
                  >
                    <v-text-field
                    label="Kokonaispalkka"
                    suffix="€"
                    type="number"
                    @update:model-value="calculateHourlySalary"
                    v-model="jobFullSalary"
                    min="0"
                    :rules="numberRules"
                    >
                    </v-text-field>
                  </v-col>
                </v-row>
              </v-container>
              <v-container>
                <v-textarea label="Kuvaus" :rules="descriptionRules" required v-model="jobDescription"></v-textarea>
              </v-container>
              <v-card-actions>
                <v-col class="d-flex justify-space-between">
                  <v-btn @click="close()" class="text-none">Peruuta</v-btn>
                  <div>
                    <v-btn @click="changeJobTab('one')" class="text-none">Takaisin</v-btn>
                    <v-btn color="primary" type="submit" class="text-none">Seuraava</v-btn>
                  </div>
                </v-col>
              </v-card-actions>
            </v-form>
          </v-window-item>
        </v-window>
      </v-card-item>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { useAppStore } from '@/store/app'
import { ref, computed, defineEmits } from 'vue'
import moment from 'moment';

const store = useAppStore();
const dateDialogShowing = ref(false);
const date = ref(null);
const formattedDate = computed(() => {
  return date.value ? moment(date.value).format('DD.MM.YYYY') : null;
})
const tempDate = ref(null);
const minDate = ref(new Date().toISOString().substr(0, 10));
const jobTitle = ref(null);
const jobEstimatedTime = ref(null);
const jobHourlySalary = ref(null);
const jobFullSalary = ref(null);
const jobs = ref([]);
const jobForm = ref(null);
const jobDescription = ref(null);
const jobTab = ref('one');
const fileInput = ref(null);
const jobAddress = ref(null);
const jobAddressSearch = ref(null);
const jobAddressSuggestions = ref([]);
const suggestions = computed(() => {
  let s = [...jobAddressSuggestions.value];
  if (jobAddressSearch.value) {
    if (!s.find(_s => _s === jobAddressSearch.value)) {
      s.unshift(jobAddressSearch.value);
    }
  }
  return s;
});

const jobTitleRules = [
  value => {
    if (value) return true

    return 'Syötä otsikko'
  },
];

const emit = defineEmits(["close"])

const jobDateRules = [
  value => {
    if (value) return true

    return 'Syötä päivämäärä'
  },
];

const numberRules = [
  value => {
    let errorMessage = 'Syötä arvo';
    let valid = false;
    if (value) {
      valid = true;
    }
    if (!parseFloat(value)) {
      valid = false;
    }
    if (parseFloat(value) <= 0) {
      errorMessage = 'Arvo ei saa olla 0';
    }

    return valid ? true : errorMessage
  },
];

const descriptionRules = [
  value => {
    let errorMessage = 'Kuvauksen täytyy olla vähintään 20 merkkiä';
    let valid = false;
    if (value) {
      valid = true;
    }
    if (value && value.length < 20) {
      valid = false;
    }

    return valid ? true : errorMessage
  },
];

const selectedFiles = ref([]);
const selectedFileResults = ref([]);

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
            selectedFileResults.value.push(resizedImageData);

            imageCanvas.toBlob((blob) => {
              const resizedFile = new File([blob], selectedFile.name, { type: selectedFile.type });
              selectedFiles.value.push(resizedFile);
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

store.fetchJobs().then((response) => {
  let data = response.data;
  if (!data.error) {
    jobs.value = data.jobs;
  }
})

function addjob() {
  jobForm.value.validate().then((response) => {
    if (response.valid) {
      const payload = {
        title: jobTitle.value,
        date: moment(date.value).format('YYYY-MM-DD HH:mm:ss'),
        duration: jobEstimatedTime.value,
        full_salary: jobFullSalary.value,
        description: jobDescription.value,
        address: jobAddress.value,
        image_count: selectedFiles.value.length,
        images: selectedFiles.value
      };
      store.loading = true;
      store.addJob(payload).then((response) => {
        let data = response.data;
        store.loading = false;
        if (data.status === 'success') {
          close();
          store.snackbarText = 'Työ lisätty onnistuneesti';
          store.snackbarColor = 'green-darken-2';
          store.snackbar = true;
        } else {
          store.snackbarText = 'Työn lisäyksessä tapahtui virhe';
          store.snackbarColor = 'red-darken-2';
          store.snackbar = true;
        }
      });
    }
  })
}

function confirmDateSelection() {
  dateDialogShowing.value = false;
  date.value = tempDate.value;
}

function calculateFullSalary(value) {
  if (jobEstimatedTime.value) {
    jobFullSalary.value = value * jobEstimatedTime.value;
  }
}
function calculateHourlySalary(value) {
  if (jobEstimatedTime.value) {
    jobHourlySalary.value = value / jobEstimatedTime.value;
  }
}
function estimatedTimeUpdated(value) {
  if (jobHourlySalary.value) {
    jobFullSalary.value = value * jobHourlySalary.value;
  }
}

function changeJobTab(tab) {
  jobTab.value = tab;
}

function close () {
  emit('close');
}

function openFileInput() {
  // Trigger the hidden file input
  fileInput.value.click();
}

function deleteImage(imageIndex) {
  selectedFileResults.value =  selectedFileResults.value.filter((result, index) => index !== imageIndex);
  selectedFiles.value =  selectedFiles.value.filter((result, index) => index !== imageIndex);
}

function getAddressSuggestions() {
  let term = null;
  jobAddressSuggestions.value = [];
  setTimeout(() => {
    term = jobAddressSearch.value;
  }, 100);
  setTimeout(() => {
    if (jobAddressSearch.value && jobAddressSearch.value.length > 2 && term === jobAddressSearch.value) {
      store.getAddressSuggestions(jobAddressSearch.value).then((response) => {
        jobAddressSuggestions.value = response.suggestions;
      });
    }
  }, 500);
}
</script>

<style scoped>
#add-img-btn {
  width: 100%;
  height: 100%;
  border-radius: 0;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 100;
}
</style>
