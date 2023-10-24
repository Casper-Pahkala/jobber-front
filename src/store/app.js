// Utilities
import { defineStore } from 'pinia'
import axios from 'axios';
import moment from 'moment';

export const useAppStore = defineStore('app', {
  state: () => ({
    tab: null,
    url: window.url,
    user: null,
    auth_token: null,
    loading: false,
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
    redirect: null
  }),
  actions: {
    connectToWebsocket() {
      this.websocket = new WebSocket('ws://165.227.145.175:8000?token=' + this.auth_token);

      this.websocket.addEventListener('open', () => {
        this.websocketStatus = 'Connected';
      });

      this.websocket.addEventListener('message', (event) => {
        let data = JSON.parse(event.data);
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
        }, 3000);
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
        this.axios.get(this.url + '/api/get-jobs.json').then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        })
      })
    },
    addJob(payload) {
      return new Promise((resolve, reject) => {
        const formData = new FormData();
        for (let i = 0; i < payload.images.length; i++) {
          formData.append('image[]', payload.images[i]);
        }
        formData.append('title', payload.title);
        formData.append('date', payload.date);
        formData.append('duration', payload.duration);
        formData.append('full_salary', payload.full_salary);
        formData.append('description', payload.description);
        formData.append('address', payload.address);
        this.axios.post(this.url + '/api/add-job.json', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }).then((response) => {
          resolve(response);
        })
        .catch((error) => {
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
          resolve(response);
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
    getMessages(jobId) {
      return new Promise((resolve, reject) => {
        this.axios.get(this.url + `/api/messages/${jobId}.json`).then((response) => {
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
    }
  },
})
