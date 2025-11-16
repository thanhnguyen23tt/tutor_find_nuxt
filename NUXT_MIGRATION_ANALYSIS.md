# Đánh Giá Migration từ Vue 3 sang Nuxt 3

## Tổng Quan

Dự án hiện tại sử dụng:
- Vue 3 với Composition API
- Vue Router (file-based routing thủ công)
- Vuex cho state management
- Vite làm build tool
- Global properties ($api, $helper, $notification, $config)
- @vueuse/head cho head management
- Laravel Echo + Pusher cho real-time

---

## 1. CẤU TRÚC THƯ MỤC

### Hiện tại:
```
src/
  views/          → Các page components
  components/     → Shared components
  router/         → Router configuration
  store/          → Vuex store
  api/            → API client
  utils/          → Helper functions
```

### Nuxt 3:
```
pages/            → File-based routing (tự động)
components/       → Auto-imported components
layouts/          → Layout components
composables/      → Reusable composables
plugins/          → Plugins initialization
utils/            → Helper functions
stores/           → Pinia stores (hoặc Vuex)
```

**Thay đổi cần thiết:**
- ✅ Di chuyển `src/views/*.vue` → `pages/*.vue`
- ✅ Di chuyển `src/views/Auth/*.vue` → `pages/auth/*.vue`
- ✅ Di chuyển `src/views/userDetail/*.vue` → `pages/user-detail/*.vue`
- ✅ Di chuyển `src/views/classRoom/*.vue` → `pages/classroom/*.vue`
- ✅ Di chuyển `src/views/booking/*.vue` → `pages/booking/*.vue`
- ✅ Di chuyển `src/views/profile/*.vue` → `pages/profile/*.vue`
- ✅ Di chuyển `src/views/notification/*.vue` → `pages/notification/*.vue`
- ✅ Tạo `layouts/default.vue` thay cho `MainLayout`
- ✅ Tạo `layouts/auth.vue` cho auth pages

---

## 2. ROUTING

### Hiện tại (Vue Router):
```javascript
// src/router/index.js
const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', name: 'home', component: () => import('@views/Home.vue') },
      { path: 'search', name: 'search', component: () => import('@views/Search.vue') },
      // ...
    ]
  }
]
```

### Nuxt 3 (File-based routing):
```
pages/
  index.vue              → / (home)
  search.vue             → /search
  tutor/
    [uid].vue           → /tutor/:uid
  booking/
    [uid].vue           → /booking/:uid
    success/
      [id].vue          → /booking/success/:id
    manager.vue          → /booking/manager
  auth/
    login.vue            → /auth/login
    register.vue         → /auth/register
    select-role.vue      → /auth/select-role
```

**Thay đổi cần thiết:**
- ❌ Xóa `src/router/index.js`
- ✅ Sử dụng file-based routing
- ✅ Route guards → `middleware/` directory
- ✅ Meta fields → `definePageMeta()`

**Ví dụ migration:**
```vue
<!-- pages/search.vue -->
<script setup>
definePageMeta({
  middleware: 'auth', // nếu cần auth
  layout: 'default'
})
</script>
```

---

## 3. STATE MANAGEMENT

### Hiện tại (Vuex):
```javascript
// src/store/index.js
import { createStore } from 'vuex';
const store = createStore({ ... });
```

### Nuxt 3 (Pinia - khuyến nghị):
```javascript
// stores/config.js
import { defineStore } from 'pinia'
export const useConfigStore = defineStore('config', {
  state: () => ({
    configuration: {},
    userData: {},
    // ...
  })
})
```

**Thay đổi cần thiết:**
- ✅ Cài đặt Pinia: `npm install @pinia/nuxt`
- ✅ Chuyển đổi Vuex stores → Pinia stores
- ✅ Thay `useStore()` → `useConfigStore()`
- ✅ Thay `store.commit()` → `store.setConfiguration()`
- ✅ Thay `store.dispatch()` → `store.updateUserData()`

**Ví dụ:**
```javascript
// Trước (Vuex)
const store = useStore();
store.commit('setConfiguration', data);
store.dispatch('updateUserData', userData);

// Sau (Pinia)
const configStore = useConfigStore();
configStore.setConfiguration(data);
configStore.updateUserData(userData);
```

---

## 4. API CALLS & GLOBAL PROPERTIES

### Hiện tại:
```javascript
// app.js
app.config.globalProperties.$api = api;
app.config.globalProperties.$helper = helper;
app.config.globalProperties.$notification = notification;

// Component
const { proxy } = getCurrentInstance();
proxy.$api.apiGet('tutors');
proxy.$helper.formatCurrency(1000);
```

### Nuxt 3 (Composables):
```javascript
// composables/useApi.js
export const useApi = () => {
  const api = {
    async apiGet(url, params) {
      return await $fetch(`/api/${url}`, { params })
    }
  }
  return { api }
}

// composables/useHelper.js
export const useHelper = () => {
  const formatCurrency = (amount) => { /* ... */ }
  return { formatCurrency }
}
```

**Thay đổi cần thiết:**
- ❌ Xóa `getCurrentInstance()` và `proxy`
- ✅ Tạo composables cho API, helper, notification
- ✅ Thay `proxy.$api` → `useApi()`
- ✅ Thay `proxy.$helper` → `useHelper()`
- ✅ Thay `proxy.$notification` → `useNotification()`

**Ví dụ migration:**
```vue
<!-- Trước -->
<script setup>
const { proxy } = getCurrentInstance();
const response = await proxy.$api.apiGet('tutors');
</script>

<!-- Sau -->
<script setup>
const { api } = useApi();
const response = await api.apiGet('tutors');
</script>
```

---

## 5. LAYOUTS

### Hiện tại:
```javascript
// router/index.js
{
  path: '/',
  component: MainLayout,
  children: [ /* routes */ ]
}
```

### Nuxt 3:
```
layouts/
  default.vue      → Main layout
  auth.vue         → Auth pages layout
```

**Thay đổi cần thiết:**
- ✅ Di chuyển `src/components/layout/Main.vue` → `layouts/default.vue`
- ✅ Tạo `layouts/auth.vue` cho auth pages
- ✅ Sử dụng `<NuxtLayout>` hoặc `definePageMeta({ layout: 'default' })`

---

## 6. HEAD MANAGEMENT

### Hiện tại:
```javascript
// Search.vue
import { useHead } from '@vueuse/head';
useHead({
  title: metaTitle,
  meta: [ /* ... */ ]
});
```

### Nuxt 3:
```vue
<script setup>
useHead({
  title: metaTitle,
  meta: [ /* ... */ ]
})
// hoặc
useSeoMeta({
  title: metaTitle,
  description: metaDescription
})
</script>
```

**Thay đổi cần thiết:**
- ❌ Xóa `@vueuse/head`
- ✅ Sử dụng `useHead()` hoặc `useSeoMeta()` (built-in Nuxt)

---

## 7. MIDDLEWARE & ROUTE GUARDS

### Hiện tại:
```javascript
// router/index.js
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  // ...
});
```

### Nuxt 3:
```javascript
// middleware/auth.js
export default defineNuxtRouteMiddleware((to, from) => {
  const user = useUserStore();
  if (!user.isAuthenticated) {
    return navigateTo('/login');
  }
})
```

**Thay đổi cần thiết:**
- ✅ Tạo `middleware/auth.js`
- ✅ Tạo `middleware/guest.js`
- ✅ Tạo `middleware/role.js`
- ✅ Sử dụng `definePageMeta({ middleware: 'auth' })`

---

## 8. CLIENT-SIDE ONLY CODE

### Hiện tại:
```javascript
// Message.vue
const isMobile = ref(window.innerWidth <= 1024);
window.addEventListener('resize', handleResize);
```

### Nuxt 3:
```javascript
// Message.vue
const isMobile = ref(false);
if (process.client) {
  isMobile.value = window.innerWidth <= 1024;
  window.addEventListener('resize', handleResize);
}
// hoặc
onMounted(() => {
  isMobile.value = window.innerWidth <= 1024;
  window.addEventListener('resize', handleResize);
});
```

**Thay đổi cần thiết:**
- ✅ Wrap browser APIs với `process.client` hoặc `onMounted()`
- ✅ Laravel Echo/Pusher → chỉ khởi tạo ở client-side
- ✅ `window`, `document`, `localStorage`, `sessionStorage` → check `process.client`

**Ví dụ:**
```javascript
// bootstrap.js → plugins/echo.client.js
export default defineNuxtPlugin(() => {
  if (process.client) {
    window.Echo = new Echo({ /* ... */ });
  }
})
```

---

## 9. AUTO-IMPORTS

### Hiện tại:
```vue
<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
</script>
```

### Nuxt 3:
```vue
<script setup>
// Tất cả đã được auto-import!
// ref, computed, onMounted, useRouter, useStore đều có sẵn
</script>
```

**Thay đổi cần thiết:**
- ✅ Xóa các import không cần thiết (auto-imported)
- ✅ Giữ lại import cho components và utilities

---

## 10. ENVIRONMENT VARIABLES

### Hiện tại:
```javascript
import.meta.env.VITE_API_URL
import.meta.env.VITE_PUSHER_APP_KEY
```

### Nuxt 3:
```javascript
useRuntimeConfig().public.apiUrl
useRuntimeConfig().public.pusherAppKey
```

**Thay đổi cần thiết:**
- ✅ Tạo `nuxt.config.ts` với `runtimeConfig`
- ✅ Thay `import.meta.env.VITE_*` → `useRuntimeConfig()`

**Ví dụ:**
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL,
      pusherAppKey: process.env.NUXT_PUBLIC_PUSHER_APP_KEY,
    }
  }
})
```

---

## 11. PLUGINS

### Hiện tại:
```javascript
// app.js
app.component("base-modal", baseModal);
app.component("base-input", BaseInput);
// ...
```

### Nuxt 3:
```javascript
// plugins/global-components.client.ts
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('base-modal', BaseModal);
  nuxtApp.vueApp.component('base-input', BaseInput);
})
```

**Thay đổi cần thiết:**
- ✅ Tạo `plugins/` directory
- ✅ Di chuyển global component registration → plugins
- ✅ Di chuyển Echo initialization → `plugins/echo.client.ts`
- ✅ Di chuyển axios setup → `plugins/axios.ts`

---

## 12. COMPONENTS AUTO-IMPORT

### Hiện tại:
```vue
<script setup>
import TutorCard from '@/components/common/TutorCard.vue';
import BaseSelect from '@/components/common/BaseSelect.vue';
</script>
```

### Nuxt 3:
```vue
<script setup>
// Components tự động import!
// Chỉ cần sử dụng <TutorCard />, <BaseSelect />
</script>
```

**Thay đổi cần thiết:**
- ✅ Xóa import statements cho components
- ✅ Components sẽ tự động được import từ `components/`

---

## 13. CSS & STYLES

### Hiện tại:
```vue
<style scoped>
@import url('@css/home.css');
</style>
```

### Nuxt 3:
```vue
<style scoped>
@import url('~/assets/css/home.css');
</style>
```

**Thay đổi cần thiết:**
- ✅ Cập nhật import paths (nếu cần)
- ✅ Hoặc sử dụng `assets/css/` directory
- ✅ Global CSS → `assets/css/main.css` và import trong `nuxt.config.ts`

---

## 14. CÁC FILE CẦN XÓA/THAY ĐỔI

### Xóa:
- ❌ `src/router/index.js`
- ❌ `src/app.js` (thay bằng `app.vue`)
- ❌ `src/App.vue` (thay bằng `app.vue`)
- ❌ `vite.config.js` (thay bằng `nuxt.config.ts`)

### Tạo mới:
- ✅ `nuxt.config.ts`
- ✅ `app.vue`
- ✅ `pages/` directory
- ✅ `layouts/` directory
- ✅ `middleware/` directory
- ✅ `composables/` directory
- ✅ `plugins/` directory

---

## 15. CHECKLIST MIGRATION

### Phase 1: Setup
- [ ] Cài đặt Nuxt 3
- [ ] Tạo `nuxt.config.ts`
- [ ] Setup Pinia stores
- [ ] Tạo composables (useApi, useHelper, useNotification)
- [ ] Tạo plugins (echo, axios, global components)

### Phase 2: Routing & Layouts
- [ ] Di chuyển views → pages
- [ ] Tạo layouts (default, auth)
- [ ] Tạo middleware (auth, guest, role)
- [ ] Cập nhật route meta → definePageMeta

### Phase 3: Components
- [ ] Di chuyển components
- [ ] Xóa import statements (auto-import)
- [ ] Cập nhật component paths

### Phase 4: State & API
- [ ] Chuyển Vuex → Pinia
- [ ] Thay proxy.$api → useApi()
- [ ] Thay proxy.$helper → useHelper()
- [ ] Thay proxy.$notification → useNotification()

### Phase 5: Client-side Code
- [ ] Wrap browser APIs với process.client
- [ ] Di chuyển Echo setup → plugin
- [ ] Fix window/document access

### Phase 6: Testing
- [ ] Test tất cả routes
- [ ] Test authentication flow
- [ ] Test API calls
- [ ] Test real-time features (Echo)
- [ ] Test SSR compatibility

---

## 16. LƯU Ý QUAN TRỌNG

### SSR Compatibility:
- ⚠️ Không thể sử dụng `window`, `document`, `localStorage` trong SSR
- ⚠️ Laravel Echo chỉ chạy ở client-side
- ⚠️ `getCurrentInstance()` không có trong Nuxt

### Performance:
- ✅ Nuxt tự động code-split
- ✅ Auto-import giảm bundle size
- ✅ SSR cải thiện SEO và initial load

### Breaking Changes:
- ❌ `this.$router` → `useRouter()`
- ❌ `this.$route` → `useRoute()`
- ❌ `getCurrentInstance()` → composables
- ❌ Global properties → composables

---

## 17. VÍ DỤ MIGRATION HOÀN CHỈNH

### File: Home.vue

**Trước (Vue 3):**
```vue
<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import TutorCard from '@/components/common/TutorCard.vue';

const { proxy } = getCurrentInstance();
const router = useRouter();
const store = useStore();

const fetchTutors = async () => {
  const response = await proxy.$api.apiGet('tutors');
  tutors.value = response.data;
};
</script>
```

**Sau (Nuxt 3):**
```vue
<script setup>
// Auto-imported: ref, onMounted, useRouter, useStore
const { api } = useApi();
const router = useRouter();
const store = useConfigStore();

// TutorCard auto-imported từ components/

const fetchTutors = async () => {
  const response = await api.apiGet('tutors');
  tutors.value = response.data;
};
</script>
```

---

## KẾT LUẬN

Migration từ Vue 3 sang Nuxt 3 là một quá trình lớn nhưng mang lại nhiều lợi ích:
- ✅ SSR/SSG support
- ✅ Better SEO
- ✅ Auto-imports
- ✅ File-based routing
- ✅ Better developer experience

**Ước tính thời gian:** 2-4 tuần tùy vào độ phức tạp của dự án.



