# Migration Patterns - Tự Động Sửa Code

## Các Pattern Cần Thay Thế

### 1. Import Statements

**Tìm:**
```javascript
import { ref, computed, onMounted, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import Component from '@/components/common/Component.vue';
import { something } from '@api/auth';
import { something } from '@utils/helper';
import { something } from '@config';
```

**Thay bằng:**
```javascript
// Auto-imported: ref, computed, onMounted, useRouter
// Auto-imported: Component from components/common/Component.vue
// Sử dụng composables thay vì import từ @api, @utils
```

### 2. getCurrentInstance() và proxy

**Tìm:**
```javascript
const { proxy } = getCurrentInstance();
proxy.$api.apiGet('endpoint');
proxy.$helper.formatCurrency(1000);
proxy.$notification.success('Message');
proxy.$config.something;
```

**Thay bằng:**
```javascript
const { api } = useApi();
const { formatCurrency } = useHelper();
const { success } = useNotification();
const config = useConfig();

api.apiGet('endpoint');
formatCurrency(1000);
success('Message');
config.something;
```

### 3. Vuex Store

**Tìm:**
```javascript
const store = useStore();
store.getters.userData;
store.state.configuration;
store.commit('setConfiguration', data);
store.dispatch('updateUserData', data);
```

**Thay bằng:**
```javascript
const userStore = useUserStore();
const configStore = useConfigStore();

userStore.getUserData;
configStore.configuration;
configStore.setConfiguration(data);
userStore.setUserData(data);
```

### 4. Router Navigation

**Tìm:**
```javascript
router.push('/path');
router.push({ name: 'route-name' });
router.push({ name: 'route-name', query: params });
```

**Thay bằng:**
```javascript
navigateTo('/path');
navigateTo({ path: '/path' });
navigateTo({ path: '/path', query: params });
// hoặc vẫn dùng router.push() được
```

### 5. Router Links

**Tìm:**
```vue
<router-link to="/path">Link</router-link>
```

**Thay bằng:**
```vue
<NuxtLink to="/path">Link</NuxtLink>
```

### 6. Environment Variables

**Tìm:**
```javascript
import.meta.env.VITE_API_URL
import.meta.env.VITE_PUSHER_APP_KEY
```

**Thay bằng:**
```javascript
const config = useRuntimeConfig();
config.public.apiUrl
config.public.pusherAppKey
```

### 7. Browser APIs

**Tìm:**
```javascript
const isMobile = ref(window.innerWidth <= 1024);
window.addEventListener('resize', handler);
localStorage.setItem('key', value);
sessionStorage.getItem('key');
```

**Thay bằng:**
```javascript
const isMobile = ref(false);
onMounted(() => {
  if (process.client) {
    isMobile.value = window.innerWidth <= 1024;
    window.addEventListener('resize', handler);
  }
});

// hoặc
if (process.client) {
  localStorage.setItem('key', value);
  const value = sessionStorage.getItem('key');
}
```

### 8. Head Management

**Tìm:**
```javascript
import { useHead } from '@vueuse/head';
useHead({ title: 'Page Title' });
```

**Thay bằng:**
```javascript
// Auto-imported
useHead({ title: 'Page Title' });
// hoặc
useSeoMeta({ title: 'Page Title', description: '...' });
```

### 9. Import Paths

**Tìm:**
```javascript
import Component from '@/components/common/Component.vue';
import { something } from '@api/auth';
import { something } from '@utils/helper';
import { something } from '@config';
import '@css/app.css';
```

**Thay bằng:**
```javascript
// Components: Auto-imported từ components/
// API: Sử dụng useApi() composable
// Utils: Sử dụng composables (useHelper, useNotification, etc.)
import { something } from '~/config';
import '~/assets/css/app.css';
```

### 10. definePageMeta

**Thêm vào mỗi page:**
```vue
<script setup>
definePageMeta({
  layout: 'default', // hoặc 'auth'
  middleware: 'auth', // hoặc 'guest', 'role'
});
</script>
```

## Script Tự Động Sửa (PowerShell)

Bạn có thể sử dụng script sau để tự động thay thế một số pattern:

```powershell
# Thay thế router.push
Get-ChildItem -Path pages -Recurse -Filter *.vue | ForEach-Object {
    (Get-Content $_.FullName) -replace 'router\.push\([''"]([^''"]+)[''"]\)', 'navigateTo(''$1'')' | Set-Content $_.FullName
}

# Thay thế router-link
Get-ChildItem -Path pages,components -Recurse -Filter *.vue | ForEach-Object {
    (Get-Content $_.FullName) -replace '<router-link', '<NuxtLink' -replace '</router-link>', '</NuxtLink>' | Set-Content $_.FullName
}
```

## Checklist Cho Mỗi File

Khi sửa mỗi file, đảm bảo:

- [ ] Xóa `getCurrentInstance()` và `proxy`
- [ ] Thay `proxy.$api` → `useApi()`
- [ ] Thay `proxy.$helper` → `useHelper()`
- [ ] Thay `proxy.$notification` → `useNotification()`
- [ ] Thay `proxy.$config` → `useConfig()`
- [ ] Thay `useStore()` → Pinia stores
- [ ] Thay `store.getters.*` → `store.*`
- [ ] Thay `store.commit()` → `store.methodName()`
- [ ] Thay `store.dispatch()` → `store.methodName()`
- [ ] Wrap browser APIs với `process.client` hoặc `onMounted()`
- [ ] Thay `router.push()` → `navigateTo()` (optional)
- [ ] Thay `router-link` → `NuxtLink`
- [ ] Thay `import.meta.env.VITE_*` → `useRuntimeConfig()`
- [ ] Thay `@/components` → auto-import (xóa import)
- [ ] Thay `@/config` → `~/config`
- [ ] Thay `@css` → `~/assets/css`
- [ ] Thêm `definePageMeta()` cho pages
- [ ] Xóa import statements không cần thiết

