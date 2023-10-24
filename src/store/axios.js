// axios.js

import axios from 'axios';
import { useAppStore } from '@/store/app';

const store = useAppStore();
const axiosInstance = axios.create({
  baseURL: 'YOUR_API_BASE_URL',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add an interceptor to update headers before each request
axiosInstance.interceptors.request.use(
  config => {
    const authToken = store.auth.token;

    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
