// Utilities
import { defineStore } from 'pinia'
import axios from 'axios';
import moment from 'moment';

export const useAppStore = defineStore('app', {
  state: () => ({
    tab: null,
    url: window.url,
    baseUrl: window.baseUrl,
    user: null,
    auth_token: null,
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
      totalCount: 0
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
          params: {
            page: this.jobParams.page,
            limit: this.jobParams.limit,
          }
        }).then((response) => {
          let data = response.data;
          this.jobParams.page = parseInt(data.page);
          this.jobParams.limit = parseInt(data.limit);
          this.jobParams.totalCount = parseInt(data.totalCount);
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
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        })
      })
    },
    register(payload) {
      return new Promise((resolve, reject) => {
        this.axios.post(this.url + `/api/users/register.json`, payload).then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
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
    getMessages(jobId, userId) {
      return new Promise((resolve, reject) => {
        this.axios.get(this.url + `/api/messages/${jobId}/${userId}.json`).then((response) => {
          let data = response.data;
          data.messages.forEach(item => {
              if (!this.allMessages.find(m => m.id === item.id)) {
                this.allMessages.push(item);
              }
          });
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
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        })
      })
    },
    formatDate(date, format = 'DD.MM.YYYY') {
      return moment(date).format(format);
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
        return document.exitFullscreen() // exit fullscreen on next click
      }
      if (element.requestFullscreen) {
        element.requestFullscreen()
      } else if (this.element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen() // Safari
      } else if (this.element.msRequestFullscreen) {
        element.msRequestFullscreen() // IE11
      }
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
          this.auth_token = null;
          this.user = null;

          this.loading = false;
          this.loadingBackground = false;
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

        xhr.open('POST', `${this.url}/api/jobs/upload-image.json`, true); // Replace with your actual endpoint
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
  },
  getters: {
    latestMessages() {
      let latestMessages = [];
      this.allMessages.forEach(m => {
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
