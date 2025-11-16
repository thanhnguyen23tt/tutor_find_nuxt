<template>
  <div class="callback-container">
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p>Đang xử lý đăng nhập...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

const router = useRouter();
const store = useStore();

onMounted(() => {
  // Get token and user from URL query params
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const userJson = urlParams.get('user');
  const error = urlParams.get('error');

  if (error) {
    // Handle error
    alert('Đăng nhập Google thất bại. Vui lòng thử lại.');
    navigateTo('/login');
    return;
  }

  if (token && userJson) {
    try {
      const user = JSON.parse(userJson);

      // Save token first
      store.dispatch('updateToken', token);

      // Redirect to home
      navigateTo('/');
    } catch (e) {
      console.error('Error parsing user data:', e);
      navigateTo('/login');
    }
  } else {
    // Missing data, redirect to login
    navigateTo('/login');
  }
});
</script>

<style scoped>
.callback-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #fcfcfc;
}

.loading-spinner {
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-spinner p {
  color: #374151;
  font-size: 16px;
}
</style>

