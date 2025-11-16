import axios from 'axios';

export default defineNuxtPlugin(() => {
  if (process.client) {
    window.axios = axios;
    window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
  }
});

