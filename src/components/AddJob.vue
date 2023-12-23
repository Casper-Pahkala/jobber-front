<template>

<v-dialog
    max-width="700px"
    persistent
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
                      elevation="8"
                      width="180"
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
                        elevation="8"
                        size="35"
                        @click="deleteImage(index)"
                      >
                      </v-btn>
                    </v-card>
                  </v-col>
                  <canvas id="imageCanvas" style="display: none;"></canvas>
                  <v-col
                    v-if="selectedFileResults.length <= 5"
                    class="d-flex child-flex"
                    cols="4"
                  >
                    <v-card
                      elevation="8"
                      width="180"
                      height="180"
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
                <h4 class="pl-1">Mikä on työn otsikko? *</h4>
                <span class="pl-1">Esim. Lastenhoitaja tai Nurmikonleikkaaja</span>
                <v-text-field
                  v-model="jobTitle"
                  label="Työn otsikko"
                  :rules="jobTitleRules"
                  required
                ></v-text-field>
              </v-container>
              <v-container>
                <h4 class="pl-1">Milloin työt alkavat? *</h4>
                <v-chip-group
                  mandatory
                  selected-class="text-primary"
                  column
                  v-model="dateType"
                >
                  <v-chip
                    v-for="(dateType, index) in dateTypes"
                    :key="index"
                  >
                    {{ dateType }}
                  </v-chip>

                </v-chip-group>

                <v-dialog v-model="dateDialogShowing" max-width="400" v-if="dateType == 1">
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
                <h4 class="pl-1">Mikä on kohde alueesi? *</h4>
                <span class="pl-1">Esim. Suomi tai Helsinki, Suomi</span>
                <v-autocomplete
                  label="Alue"
                  :items="suggestions"
                  @update:search="getAddressSuggestions()"
                  hide-no-data
                  v-model:search="jobAddressSearch"
                  v-model="jobAddress"
                  auto-select-first
                  clearable
                  :loading="addressSuggestionsLoading"
                  multiple
                  chips
                ></v-autocomplete>
              </v-container>

              <v-container>
                <h4 class="pl-1">Mikä on työsopimuksen tyyppi?</h4>
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
                <h4 class="pl-1">Mikä on työn kesto?</h4>
                <span class="pl-1">Jätä tyhjäksi jos ei tiedossa</span>
                <!-- <v-chip-group
                  mandatory
                  selected-class="text-primary"
                  column
                  v-model="jobDurationKnown"
                >
                  <v-chip
                  >
                    Kyllä
                  </v-chip>
                  <v-chip
                  >
                    Ei
                  </v-chip>
                </v-chip-group> -->

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

                <h4 class="pl-1">Mikä on palkan tyyppi?</h4>
                <span class="pl-1">Jätä määrä tyhjäksi jos ei tiedossa</span>
                <v-chip-group
                  mandatory
                  selected-class="text-primary"
                  column
                  v-model="jobSalaryType"
                >
                  <v-chip
                    v-for="(salaryType, index) in salaryTypes"
                    :key="index"
                  >
                    {{ salaryType }}
                  </v-chip>
                </v-chip-group>

                <!-- <v-text-field
                  v-if="jobSalaryType == 0"
                  label="Tuntipalkka"
                  suffix="€"
                  type="number"
                  v-model="jobSalary"
                  min="0"
                  :rules="numberRules"
                >
                </v-text-field> -->

                <v-text-field
                  :label="salaryTypes[jobSalaryType]"
                  :suffix="jobSalaryType == 0 ? '€/h' : '€'"
                  type="number"
                  v-model="jobSalary"
                  min="0"
                  :rules="numberRules"
                >
                </v-text-field>
                </template>


                <v-row
                v-else
                >
                  <v-col
                    cols="4"
                  >
                    <v-text-field
                      label="Tunteja viikossa"
                      suffix="h"
                      type="number"
                      v-model="hoursPerWeek"
                      min="0"
                      :rules="numberRules"
                    >
                    </v-text-field>
                  </v-col>

                  <v-col
                    cols="4"
                  >
                    <v-text-field
                      label="Palkan alaraja / kk"
                      suffix="€"
                      type="number"
                      v-model="salaryPerMonthMin"
                      min="0"
                      :rules="numberRules"
                    >
                    </v-text-field>
                  </v-col>

                  <v-col
                    cols="4"
                  >
                    <v-text-field
                      label="Palkan yläraja / kk"
                      suffix="€"
                      type="number"
                      v-model="salaryPerMonthMax"
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
                    <v-btn color="primary" type="submit" class="text-none">Luo ilmoitus</v-btn>
                  </div>
                </v-col>
              </v-card-actions>
            </v-form>
          </v-window-item>
        </v-window>
      </v-card-item>
      <v-btn icon @click="close()" class="dialog-close-btn" flat>
        <v-icon>mdi-close</v-icon>
      </v-btn>
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
const jobForm = ref(null);
const jobDescription = ref(null);
const jobTab = ref('one');
const fileInput = ref(null);
const jobAddress = ref(null);
const jobAddressSearch = ref(null);
const jobAddressSuggestions = ref([]);
const addressSuggestionsLoading = ref(false);
const dateType = ref(0);
const contractType = ref(0);
const dateTypes = ['Sopimuksen mukaan', 'Tarkka päivämäärä'];
const contractTypes = ['Keikkatyö', 'Vakituinen', 'Toistaiseksi voimassa oleva'];
const salaryTypes = ['Tuntipalkka', 'Urakkapalkka'];
const hoursPerWeek = ref(40);
const salaryPerMonthMin = ref(2000);
const salaryPerMonthMax = ref(3000);
const jobSalaryType = ref(0);
const jobSalary = ref(salaryTypes[0]);
const suggestions = computed(() => {
  let s = [...jobAddressSuggestions.value];
  // if (jobAddressSearch.value) {
  //   if (!s.find(_s => _s === jobAddressSearch.value)) {
  //     s.unshift(jobAddressSearch.value);
  //   }
  // }
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

    valid = true;
    if (value) {
      valid = true;
    }
    if (!parseFloat(value)) {
      // valid = false;
    }
    if (parseFloat(value) <= 0) {
      valid = false;
      errorMessage = 'Anna arvo isompi kuin 0';
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
    if (value && value.replace(/\s/g, "").length < 20) {
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

function addjob() {
  jobForm.value.validate().then((response) => {
    if (response.valid) {
      const payload = {
        title: jobTitle.value,
        description: jobDescription.value,
        address: jobAddress.value,
        image_count: selectedFiles.value.length,
        images: selectedFiles.value
      };

      if (jobEstimatedTime.value) {
        payload.duration = jobEstimatedTime.value;
      }

      if (moment(date.value).isValid()) {
        payload.date = moment(date.value).format('YYYY-MM-DD HH:mm:ss');
      }

      if (jobFullSalary.value) {
        payload.full_salary = jobFullSalary.value;
      }
      store.loading = true;
      store.addJob(payload).then((response) => {
        close();
      })
      .catch(() => {

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
    let newVal = value * jobEstimatedTime.value;
    jobFullSalary.value = newVal.toFixed(2);
  }
}
function calculateHourlySalary(value) {
  if (jobEstimatedTime.value) {
    let newVal = value / jobEstimatedTime.value;
    jobHourlySalary.value = newVal.toFixed(2);
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
      addressSuggestionsLoading.value = true;
      store.getAddressSuggestions(jobAddressSearch.value).then((response) => {
        jobAddressSuggestions.value = response.suggestions;
        addressSuggestionsLoading.value = false;
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

span {
  font-size: 14px;
}
h4 {
  font-size: 16px;
}
</style>
