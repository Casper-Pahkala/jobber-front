// Utilities
import { defineStore } from 'pinia'
import axios from 'axios';
import moment from 'moment';
import Cookies from 'js-cookie';

export const useAppStore = defineStore('app', {
  state: () => ({
    lightTheme: false,
    allowed: true,
    feedbackDialog: false,
    maintenanceDialog: false,
    tab: null,
    url: window.url,
    baseUrl: window.baseUrl,
    user: null,
    auth_token: Cookies.get('auth_token') || null,
    loading: false,
    loadingBackground: false,
    loginDialogShowing: false,
    registerDialogShowing: false,
    snackbar: false,
    snackbarText: null,
    snackbarColor: 'black',
    axios: axios,
    chatOpen: false,
    websocketStatus: 'Not connected',
    websocket: null,
    redirect: null,
    jobParams: {
      page: 1,
      limit: 5,
      totalCount: 0,
      term: '',
      contract_types: [ 0, 1, 2 ]
    },
    updateMainComponent: 0,
    recentMessages: [],
    allMessages: [],
    preloadedUnseenMessageImages: [],
    displayedJob: {
      id: null,
      userId: null
    },
    chat: {
      jobId: null,
      userId: null
    },
    addJobForm: {
      images: [],
    },
    jobs: [],
    fullscreen: false,
    window: {
      width: null,
      height: null
    }
  }),
  actions: {
    connectToWebsocket() {
       // Check if websocket instance exists and its state is not 'CLOSED'
        // readyState values:
        // CONNECTING 0 The connection is not yet open.
        // OPEN 1 The connection is open and ready to communicate.
        // CLOSING 2 The connection is in the process of closing.
        // CLOSED 3 The connection is closed or couldn't be opened.
      console.log('CONNECTING TO WS');
      if (this.websocket && this.websocket.readyState !== 3) {
        console.log('WebSocket connection is already open or in progress.');
        return;
      }

      this.websocket = new WebSocket('wss://' + this.baseUrl + ':8000?token=' + this.auth_token);

      this.websocket.addEventListener('open', () => {
        this.websocketStatus = 'Connected';
        console.log('Connected to ws');
      });

      this.websocket.addEventListener('message', (event) => {
        let data = JSON.parse(event.data);
        console.log(data);
        if (data.action == 'CHAT_MESSAGE') {
          if (data.message.job_hashed_id === this.chat.jobId && data.message.received && this.chat.jobId && this.chat.userId && this.chat.userId === data.message.other_user_id) {
            console.log('in chat to receive');
            this.getMessages(this.chat.jobId, this.chat.userId);
          } else {
            data.message.message = data.message.message.replace(/\n/g, '<br>');
            this.allMessages.unshift(data.message);
          }
        } else if (data.action === 'CHAT_SEEN') {
          this.getAllMessages();
        }

      });

      this.websocket.addEventListener('close', () => {
        this.websocketStatus = 'Closed';
        setTimeout(() => {
          this.connectToWebsocket();
        }, 1000);
      });
    },
    initializeAxios() {
      this.axios = axios.create({
        baseURL: this.url,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      this.axios.interceptors.request.use(
        config => {
          if (this.auth_token) {
            config.headers.Authorization = `Bearer ${this.auth_token}`;
          }

          return config;
        },
        error => {
          return Promise.reject(error);
        }
      );
    },
    fetchJobs() {
      return new Promise((resolve, reject) => {
        this.axios.get(this.url + '/api/jobs.json', {
          params: this.jobParams
        }).then((response) => {
          let data = response.data;
          if (!data.error) {
            data.jobs.forEach(job => {
              job.area = JSON.parse(job.area);
            });
          }
          this.jobParams.page = parseInt(data.page);
          this.jobParams.limit = parseInt(data.limit);
          this.jobParams.totalCount = parseInt(data.totalCount);
          this.jobs = data.jobs;
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        })
      })
    },
    addJob(payload) {
      return new Promise((resolve, reject) => {
        this.loading = true;
        this.loadingBackground = true;
        this.axios.post(this.url + '/api/add-job.json', payload).then((response) => {
          let data = response.data;
          this.loading = false;
          this.loadingBackground = false;
          if (data.status === 'success') {
            this.successToast('Työ lisätty onnistuneesti');
            resolve(data);
          } else {
            this.errorToast('Työn lisäyksessä tapahtui virhe');
            reject();
          }
        })
        .catch((error) => {
          this.loading = false;
          this.loadingBackground = false;
          this.errorToast('Työn lisäyksessä tapahtui virhe');
          reject(error);
        })
      })
    },
    fetchJob(id) {
      return new Promise((resolve, reject) => {
        this.axios.get(this.url + `/api/job/${id}.json`).then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        })
      })
    },
    sendMessage(payload) {
      return new Promise((resolve, reject) => {
        this.axios.post(this.url + `/api/messages/send-message.json`, payload).then((response) => {
          let data = response.data;
          if (data.status == 'error') {
            this.errorToast('Tapahtui virhe: ' + data.message);
            reject(data.message);
          } else {
            resolve(data);
          }
        })
        .catch((error) => {
          reject(error);
        })
      })
    },
    login(payload) {
      return new Promise((resolve, reject) => {
        this.axios.post(this.url + `/api/users/login.json`, payload).then((response) => {
          const data = response.data;
          this.auth_token = data.token;

          Cookies.set('auth_token', data.token, { expires: 7 });
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        })
      })
    },
    register(payload) {
      return new Promise((resolve, reject) => {
        this.loading = true;
        this.axios.post(this.url + `/api/users/register.json`, payload).then((response) => {
          const data = response.data;
          if (data.status != 'error' && data.token) {
            this.registerDialogShowing = false;
            this.auth_token = data.token;
            this.getUser().then(() => {
              this.loading = false;
              this.loginDialogShowing = false;
            });
            resolve(data);
          } else {
            switch (data.errorCode) {
              case 101:
                this.errorToast('Sähköposti on jo käytössä');
                reject(data);
                break;
              case 102:
                this.errorToast('Sähköpostin tallennuksessa tapahtui virhe');
                reject(data);
                break;
            }
          }
          this.loading = false;
        })
        .catch((error) => {
          this.loading = false;
          this.errorToast('Käyttäjän luominen epäonnistui');
          reject(error);
        })
      })
    },
    getCookie(cookieName) {
      const name = cookieName + '=';
      const cookies = document.cookie.split(';');

      for(let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.indexOf(name) === 0) {
          return cookie.substring(name.length, cookie.length);
        }
      }

      return null;
    },
    getUser() {
      return new Promise((resolve, reject) => {
        this.axios.get(this.url + `/api/users.json`).then((response) => {
          let data = response.data;
          this.user = data.user;
          this.user.profileImageUrl = `${this.url}/profile-image/${this.user.id}.jpg`;
          this.connectToWebsocket();
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        })
      })
    },
    getMessages(jobId = null, userId = null) {
      return new Promise((resolve, reject) => {
        this.axios.get(this.url + `/api/messages/${jobId ?? ''}/${userId ?? ''}.json`).then((response) => {
          let data = response.data;
          data.messages.forEach(item => {
              let m = this.allMessages.find(m => m.id === item.id);
              if (!m) {
                item.message = item.message.replace(/\n/g, '<br>');
                this.allMessages.push(item);
              }
          });
          console.log(this.allMessages);
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        })
      })
    },
    getAllMessages() {
      return new Promise((resolve, reject) => {
        this.axios.get(this.url + `/api/users/my-messages.json`).then((response) => {
          let data = response.data;
          this.recentMessages = data.messages.filter(m => m.seen == null);
          let messages = data.messages;

          messages.forEach(m => {
            if (m.attachment_id && m.attachment_name && this.getFileExtension(m.attachment_name) !== 'pdf') {
              m.attachment_url = '';
              // this.getImageSrc(m.attachment_id, m);
            }
            m.message = m.message.replace(/\n/g, '<br>');
          })
          this.allMessages = messages;
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        })
      })
    },
    getMyListings() {
      return new Promise((resolve, reject) => {
        this.axios.get(this.url + `/api/users/my-listings.json`).then((response) => {
          let data = response.data;
          data.listings.forEach(job => {
            job.area = JSON.parse(job.area);
          });
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        })
      })
    },
    formatDate(date, format = 'DD.MM.YYYY') {
      return moment(date).format(format).replace(/(^|\.)(0+)/g, '$1');
    },
    uploadProfileImage(payload) {
      return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('image', payload.image);
        this.axios.post(this.url + `/api/users/update-profile-image.json`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }).then((response) => {
          let data = response.data;
          this.successToast('Kuva vaihdettu onnistuneesti');
          resolve(data);
        })
        .catch((error) => {
          this.errorToast('Kuvan latauksessa tapahtui virhe (' + error.code +')');
          reject(error);
        })
      })
    },
    getAddressSuggestions(input) {
      return new Promise((resolve, reject) => {
        this.axios.post(this.url + `/api/jobs/autocompleteAddress.json?input=${input}`).then((response) => {
          let data = response.data;
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        })
      })
    },
    toggleFullscreen(element) {
      if (document.fullscreenElement) {
        this.fullscreen = false;
        document.exitFullscreen() // exit fullscreen on next click
      }
      if (element.requestFullscreen) {
        this.fullscreen = true;
        element.requestFullscreen()
      } else if (this.element.webkitRequestFullscreen) {
        this.fullscreen = true;
        element.webkitRequestFullscreen() // Safari
      } else if (this.element.msRequestFullscreen) {
        this.fullscreen = true;
        element.msRequestFullscreen() // IE11
      } else {
        // TODO Cant fullscreen
      }
      console.log(this.fullscreen);
    },
    successToast(message) {
      this.snackbar = false;
      setTimeout(() => {
        this.snackbarText = message;
        this.snackbarColor = 'green-darken-2';
        this.snackbar = true;
      }, 10);
    },
    errorToast(message) {
      this.snackbar = false;
      setTimeout(() => {
        this.snackbarText = message;
        this.snackbarColor = 'red-darken-2';
        this.snackbar = true;
      }, 10);
    },
    toast(message) {
      this.snackbar = false;
      setTimeout(() => {
        this.snackbarText = message;
        this.snackbarColor = 'red-darken-2';
        this.snackbar = true;
      }, 10);
    },
    logOut() {
      this.loading = true;
      this.loadingBackground = true;
      return new Promise((resolve, reject) => {
        this.axios.post(this.url + `/api/users/logout.json`).then((response) => {
          const data = response.data;
          Cookies.remove('auth_token');
          window.location.href = '/';
          resolve(data);
        })
        .catch((error) => {
          this.loading = false;
          this.loadingBackground = false;
          reject(error);
        })
      })
    },
    preloadImage(url) {
      const img = new Image();
      img.src = url;
    },
    openChat(message) {
      this.chat.jobId = message.job_hashed_id;
      this.chat.userId = message.other_user_id;
      this.chatOpen = true;
    },
    deleteListing(payload) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        this.axios.post(this.url + `/api/delete-listing.json`, payload).then((response) => {
          this.loading = false;
          let data = response.data;
          if (data.status !== 'success') {
            this.errorToast('Listauksen poistossa tapahtui virhe: ' + data.message);
            reject(data.message);
            return;
          }
          this.successToast('Listaus poistettu');
          resolve(data);
        })
        .catch((error) => {
          this.errorToast('Listauksen poistossa tapahtui virhe');
          this.loading = false;
          reject(error);
        })
      })
    },
    editUser(payload) {
      this.loading = true;
      this.loadingBackground = true;
      return new Promise((resolve, reject) => {
        this.axios.post(this.url + `/api/users/edit.json`, payload).then((response) => {
          let data = response.data;
          this.loading = false;
          this.loadingBackground = false;
          if (data.status !== 'success') {
            this.errorToast('Nimen muokkauksessa tapahtui virhe: ' + data.message);
            reject(data.message)
            return;
          }
          this.successToast('Nimi päivitetty onnistuneesti');
          resolve(data);
        })
        .catch((error) => {
          this.loading = false;
          this.loadingBackground = false;
          this.errorToast('Nimen muokkauksessa tapahtui virhe');
          reject(error);
        })
      })
    },
    deleteUser(payload) {
      this.loading = true;
      this.loadingBackground = true;

      return new Promise((resolve, reject) => {
        this.axios.post(this.url + `/api/users/delete-user.json`, payload).then((response) => {
          let data = response.data;

          this.loading = false;
          this.loadingBackground = false;

          if (data.status !== 'success') {
            this.errorToast('Käyttäjän poistossa tapahtui virhe: ' + data.message);
            reject(data.message);
            return;
          }
          resolve(data);
        })
        .catch((error) => {
          this.loading = false;
          this.loadingBackground = false;
          this.errorToast('Käyttäjän poistossa tapahtui virhe');
          reject(error);
        })
      })
    },
    uploadImage(payload) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('image', payload);

        let self = this;

        const index = self.addJobForm.images.length;

        self.addJobForm.images.push({
          progress: 0
        });

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            console.log(`Upload Progress: ${progress.toFixed(2)}%`);

            self.addJobForm.images[index].progress = progress.toFixed(2);
          }
        });

        xhr.open('POST', `${this.url}/api/jobs/upload-image.json`, true);

        const authToken = this.auth_token;
        xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);

        xhr.onreadystatechange = function () {
          if (xhr.readyState == 4 && xhr.status == 200) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve(data.data);
            } catch (e) {
              console.error('Error parsing response:', e);
              reject(e);
            }
          }
        };
        xhr.send(formData);
      })
    },
    sendAttachment(payload) {
      return new Promise((resolve, reject) => {
        this.loading = true;
        this.loadingBackground = true;
        const xhr = new XMLHttpRequest();
        const formData = new FormData();

        for (let key in payload) {
          formData.append(key, payload[key]);
        }

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            console.log(`Upload Progress: ${progress.toFixed(2)}%`);
          }
        });

        xhr.open('POST', `${this.url}/api/messages/send-attachment.json`, true);

        const authToken = this.auth_token;
        xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);

        xhr.onreadystatechange = () => {
          if (xhr.readyState == 4) {
            this.loading = false;
            this.loadingBackground = false;

            if (xhr.status == 200) {
              try {
                const data = JSON.parse(xhr.responseText);
                console.log(data);

                if (data.status !== 'success') {
                  this.errorToast(data.message);
                  reject();
                  return;
                }
                resolve(data);
              } catch (e) {
                console.error('Error parsing response:', e);
                this.errorToast('Error parsing response: ' + e.message);
                reject(e);
              }
            } else {
              const error = `Request failed with status: ${xhr.status}`;
              console.error(error);
              this.errorToast(error);
              reject(new Error(error));
            }
          }
        };

        xhr.onerror = () => {
          const error = 'Network error occurred during the request.';
          console.error(error);
          this.loading = false;
          this.loadingBackground = false;
          this.errorToast(error);
          reject(new Error(error));
        };


        xhr.send(formData);
      })
    },
    async downloadFile(id) {
      try {
        const response = await this.axios.get(this.url + `/api/attachment/${id}`, {
          responseType: 'blob', // Important: Set response type as 'blob'
        });

        // Create a Blob from the PDF Stream
        const file = new Blob(
          [response.data],
          { type: 'application/octet-stream' } // Set the correct MIME type
        );

        // Build a URL from the file
        const fileURL = URL.createObjectURL(file);

        // Create a temporary link element
        const link = document.createElement('a');
        link.href = fileURL;
        console.log(response.headers);
        link.setAttribute('download', response.headers['filename']);
        document.body.appendChild(link);

        // Programmatically click the link to trigger the download
        link.click();

        // Remove the link after downloading
        document.body.removeChild(link);

        // Release the created object URL
        URL.revokeObjectURL(fileURL);
      } catch (error) {
        console.error('Error during file download:', error);
      }
    },
    getFileExtension(fileName) {
      if (fileName.includes('.') && fileName.lastIndexOf('.') !== 0) {
          return fileName.substring(fileName.lastIndexOf('.') + 1);
      } else {
          return '';
      }
    },
    async getImageSrc(attachmentId, message) {
      try {
        const response = await fetch(`${this.url}/api/attachment/${attachmentId}.${this.getFileExtension(message.attachment_name)}`, {
          headers: {
            'Authorization': 'Bearer ' + this.auth_token,
          },
        });
        const blob = await response.blob();
        // Create a File object from the blob
        const file = new File([blob], message.attachment_name, { type: blob.type });
        console.log(file);
        // Use the File object to create the object URL
        message.attachment_url = URL.createObjectURL(file);
      } catch (error) {
        console.error('Error fetching image:', error);
        message.attachment_url = '';
      }
    },
    userInit() {
      this.preloadImage(`${this.url}/profile-image/${this.user.id}.jpg`);
      this.getMessages();
    },
    jobShortInfo(job) {
      let description = '';
      if (job.contract_type === 0) {
        description += 'Keikkatyö';

        if (job.salary) {
          if (job.salary_type === 0) {
            // description += ' - Tuntipalkka';
            description += ' - ' + job.salary + '€/h';
          } else {
            // description += ' - Urakkapalkka';
            description += ' - ' + job.salary + '€';
          }
        }
      } else if (job.contract_type === 1) {
        description += 'Vakituinen työsuhde';

        if (job.salary) {
          if (job.salary_type === 0) {
            // description += ' - Tuntipalkka';
            description += ' - ' + job.salary + '€/h';
          } else {
            // description += ' - Kuukausipalkka';
            description += ' - ' + job.salary + '€/kk';
          }
        }
      } else {
        description += 'Toistaiseksi voimassa oleva';

        if (job.salary) {
          if (job.salary_type === 0) {
            // description += ' - Tuntipalkka';
            description += ' - ' + job.salary + '€/h';
          } else {
            // description += ' - Kuukausipalkka';
            description += ' - ' + job.salary + '- €/kk';
          }
        }
      }
      return description;
    },
    sendFeedback(payload) {
      this.loading = true;
      this.loadingBackground = true;

      return new Promise((resolve, reject) => {
        this.axios.post(this.url + `/api/feedback.json`, payload).then((response) => {
          let data = response.data;
          this.loading = false;
          this.loadingBackground = false;
          this.feedbackDialog = false;
          if (data.status !== 'success') {
            this.errorToast('Palautteen lähetyksessä tapahtui virhe: ' + data.message);
            reject(data.message);
            return;
          }
          this.successToast('Palaute lähetetty onnistuneesti!');
          resolve(data);
        })
        .catch((error) => {
          this.loading = false;
          this.feedbackDialog = false;
          this.loadingBackground = false;
          this.errorToast('Palautteen lähetyksessä tapahtui virhe');
          reject(error);
        })
      })
    }


  },
  getters: {
    theme() {
      return this.lightTheme ? 'light' : 'dark';
    },
    cardCloseBtnColor() {
      return this.lightTheme ? '#f0f0f0' : 'rgb(33, 33, 33)';
    },
    latestMessages() {
      let latestMessages = [];

      let allMessages = this.allMessages;

      allMessages.sort((a, b) => {
        return moment(a.time).isAfter(b.time) ? -1 : 1;
      });

      allMessages.forEach(m => {
        let addedMessage = latestMessages.find(mes => mes.job_hashed_id === m.job_hashed_id && mes.other_user_id === m.other_user_id);
        if (!addedMessage) {
          latestMessages.push(m);
        }
      });
      latestMessages.sort((a, b) => {
        return moment(a.time).isAfter(b.time) ? 1 : -1;
      });
      latestMessages.sort((x, y) => {
        return (x === y)? 0 : x.deleted ? 1 : -1;
      })
      return latestMessages;
    },
    currentChatMessages() {
      let currentMessages = this.allMessages.filter(m => m.job_hashed_id === this.chat.jobId && m.other_user_id === this.chat.userId);
      currentMessages.sort((a, b) => {
        return moment(a.time).isAfter(b.time) ? 1 : -1;
      });
      let usedDates = [];
      let toUpdate = [];
      currentMessages.forEach(m => {
        if (m.attachment_id && m.attachment_name && !m.attachment_url) {
          m.attachment_url = '';
          this.getImageSrc(m.attachment_id, m);
        }
        let date = moment(m.time).format('YYYY-MM-DD');
        if (!usedDates.includes(date)) {
          let timeData = {
            is_date_seperator: true,
            time: moment(m.time).format('dddd DD.MM.YYYY')
          };

          if (moment(m.time).isSame(moment(), 'day')) {
            timeData.time = 'Tänään';
          } else if (moment(m.time).isSame(moment().clone().subtract(1, 'days'), 'day')) {
            timeData.time = 'Eilen';
          }

          toUpdate.push({
            afterId: m.id,
            data: timeData
          });

          usedDates.push(date);
        }
      });

      toUpdate.forEach(p => {
        let index = currentMessages.findIndex(m => m.id === p.afterId);
        currentMessages.splice(index, 0, p.data);
      });
      return currentMessages;
    },
    unseenMessages() {
      return this.latestMessages.filter(m => !m.seen && m.received);
    },
    allUnseenMessages() {
      let unseenMessages = this.allMessages.filter(m => !m.seen && m.received)

      unseenMessages.forEach(m => {
        if (!this.preloadedUnseenMessageImages.includes(m.other_user_id)) {
          this.preloadedUnseenMessageImages.push(m.other_user_id);
          this.preloadImage(`${this.url}/profile-image/${m.other_user_id}.jpg`)
        }
      })
      return unseenMessages;
    }
  }
})
