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
    currentMessages: [],
    currentJobId: null,
    currentChatUserId: null,
    redirect: null,
    jobParams: {
      page: 1,
      limit: 5,
      totalCount: 0
    },
    updateMainComponent: 0,
    recentMessages: [],
    unseenMessages: []
  }),
  actions: {
    connectToWebsocket() {
       // Check if websocket instance exists and its state is not 'CLOSED'
        // readyState values:
        // CONNECTING 0 The connection is not yet open.
        // OPEN 1 The connection is open and ready to communicate.
        // CLOSING 2 The connection is in the process of closing.
        // CLOSED 3 The connection is closed or couldn't be opened.

      if (this.websocket && this.websocket.readyState !== 3) {
        console.log('WebSocket connection is already open or in progress.');
        return;
      }

      this.websocket = new WebSocket('ws://' + this.baseUrl + ':8000?token=' + this.auth_token);

      this.websocket.addEventListener('open', () => {
        this.websocketStatus = 'Connected';
        console.log('Connected to ws');
      });

      this.websocket.addEventListener('message', (event) => {
        let data = JSON.parse(event.data);
        console.log('WS_MESSAGE', data);
        if (data.action == 'CHAT_MESSAGE') {
          let timeData = {
            is_date_seperator: true,
            time: 'Tänään'
          };
          if (moment(data.time).isSame(moment(), 'day') && !this.currentMessages.find(m => m.time === timeData.time)) {
            this.currentMessages.push(timeData);
          }
          this.currentMessages.push(data);
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
        this.axios.get(this.url + '/api/get-jobs.json', {
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
        const formData = new FormData();
        for (let i = 0; i < payload.images.length; i++) {
          formData.append('image[]', payload.images[i]);
        }
        for (let key in payload) {
          formData.append(key.toString(), payload[key]);
        }
        this.axios.post(this.url + '/api/add-job.json', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }).then((response) => {
          let data = response.data;
          this.loading = false;
          this.loadingBackground = false;
          if (data.status === 'success') {
            this.successToast('Työ lisätty onnistuneesti');
            this.updateMainComponent++;
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
    uploadImage(payload) {
      return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('image', payload.image);
        formData.append('job_id', payload.job_id);
        this.axios.post(this.url + `/api/jobs/upload-image.json`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }).then((response) => {
          let data = response.data;
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        })
      })
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
      console.log(element);
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
      this.currentJobId = message.job_hashed_id;
      this.currentChatUserId = message.other_user_id;
      this.chatOpen = true;
    },
    getUnseenMessages() {
       return new Promise((resolve, reject) => {
        this.axios.get(this.url + `/api/users/recent-messages.json`).then((response) => {
          let data = response.data;

          const unseenMessages = data.messages;
          let fixedList = [];
          unseenMessages.forEach(m => {
            if (!fixedList.find(l => l.other_user_id === m.other_user_id && l.job_hashed_id === m.job_hashed_id)) {
              fixedList.push(m);
            }
          })
          this.unseenMessages = fixedList;
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        })
      })
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
  },
})
