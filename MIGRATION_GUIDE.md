# Hướng Dẫn Migration từ Vue 3 sang Nuxt 3

## Tổng Quan

Dự án đã được setup với Nuxt 3 cơ bản. Các file cấu hình và composables đã được tạo. Bây giờ cần di chuyển các file từ `src/` sang cấu trúc Nuxt 3.

## Các File Đã Tạo

### ✅ Đã Hoàn Thành

1. **Nuxt Config**: `nuxt.config.ts`
2. **Composables**: 
   - `composables/useApi.js`
   - `composables/useHelper.js`
   - `composables/useNotification.js`
   - `composables/useConfig.js`
   - `composables/useAuth.js`
3. **Pinia Stores**: 
   - `stores/config.js`
   - `stores/user.js`
   - `stores/notification.js`
4. **Layouts**: 
   - `layouts/default.vue`
   - `layouts/auth.vue`
5. **Middleware**: 
   - `middleware/auth.js`
   - `middleware/guest.js`
   - `middleware/role.js`
6. **Plugins**: 
   - `plugins/echo.client.ts`
   - `plugins/axios.client.ts`
   - `plugins/global-components.client.ts`
7. **App**: `app.vue`
8. **Components**: `components/common/Notification.vue`

## Các Bước Migration Còn Lại

### 1. Di Chuyển Components

```bash
# Di chuyển tất cả components từ src/components sang components/
# Nuxt sẽ tự động auto-import các components này
```

**Cấu trúc:**
- `src/components/common/*.vue` → `components/common/*.vue`
- `src/components/layout/*.vue` → `components/layout/*.vue`

**Lưu ý:** 
- Xóa các import statements không cần thiết (auto-imported)
- Thay `proxy.$api` → `useApi()`
- Thay `proxy.$helper` → `useHelper()`
- Thay `proxy.$notification` → `useNotification()`
- Thay `proxy.$config` → `useConfig()`
- Thay `useStore()` → `useUserStore()`, `useConfigStore()`, `useNotificationStore()`
- Thay `store.getters.*` → `store.*` (Pinia)
- Thay `store.commit()` → `store.methodName()` (Pinia)
- Thay `store.dispatch()` → `store.methodName()` (Pinia)

### 2. Di Chuyển Views Sang Pages

**Cấu trúc mapping:**
- `src/views/Home.vue` → `pages/index.vue`
- `src/views/Search.vue` → `pages/search.vue`
- `src/views/Message.vue` → `pages/message.vue`
- `src/views/Auth/Login.vue` → `pages/auth/login.vue`
- `src/views/Auth/Register.vue` → `pages/auth/register.vue`
- `src/views/Auth/RoleSelection.vue` → `pages/auth/select-role.vue`
- `src/views/profile/Index.vue` → `pages/profile/index.vue`
- `src/views/userDetail/UserDetail.vue` → `pages/tutor/[uid].vue`
- `src/views/booking/index.vue` → `pages/booking/[uid].vue`
- `src/views/booking/BookingManager.vue` → `pages/booking/manager.vue`
- `src/views/booking/components/BookingSuccess.vue` → `pages/booking/success/[id].vue`
- `src/views/classRoom/ClassRoom.vue` → `pages/classroom/[id].vue`
- `src/views/classRoom/Index.vue` → `pages/classroom-manager.vue`
- `src/views/Saved.vue` → `pages/saved.vue`
- `src/views/Setting.vue` → `pages/setting.vue`
- `src/views/BecomeTutor.vue` → `pages/become-tutor.vue`
- `src/views/Help.vue` → `pages/help.vue`
- `src/views/Privacy.vue` → `pages/privacy.vue`
- `src/views/Terms.vue` → `pages/terms.vue`
- `src/views/Guide.vue` → `pages/guide.vue`
- `src/views/notification/Notification.vue` → `pages/notification.vue`
- `src/views/FacebookCallback.vue` → `pages/auth/facebook/callback.vue`
- `src/views/GoogleCallback.vue` → `pages/auth/google/callback.vue`

### 3. Di Chuyển Assets

```bash
# Di chuyển assets từ src/assets sang assets/
src/assets/css/*.css → assets/css/*.css
src/assets/images/* → assets/images/*
```

### 4. Di Chuyển Config

```bash
# Di chuyển config từ src/config sang config/
src/config/*.js → config/*.js
```

### 5. Cập Nhật Các File

#### Trong mỗi file Vue component:

**Trước:**
```vue
<script setup>
import { getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import TutorCard from '@/components/common/TutorCard.vue';

const { proxy } = getCurrentInstance();
const router = useRouter();
const store = useStore();

const fetchData = async () => {
  const response = await proxy.$api.apiGet('data');
  store.commit('setData', response);
};
</script>
```

**Sau:**
```vue
<script setup>
// Auto-imported: useRouter, ref, computed, onMounted, etc.
// Auto-imported: TutorCard from components/common/TutorCard.vue

const router = useRouter();
const userStore = useUserStore();
const { api } = useApi();

const fetchData = async () => {
  const response = await api.apiGet('data');
  userStore.setData(response);
};
</script>
```

#### Browser APIs:

**Trước:**
```javascript
const isMobile = ref(window.innerWidth <= 1024);
```

**Sau:**
```javascript
const isMobile = ref(false);
onMounted(() => {
  if (process.client) {
    isMobile.value = window.innerWidth <= 1024;
  }
});
// hoặc
if (process.client) {
  isMobile.value = window.innerWidth <= 1024;
}
```

#### Route Navigation:

**Trước:**
```javascript
router.push('/path');
```

**Sau:**
```javascript
navigateTo('/path');
// hoặc vẫn dùng router.push() được
```

#### Head Management:

**Trước:**
```javascript
import { useHead } from '@vueuse/head';
useHead({ title: 'Page Title' });
```

**Sau:**
```javascript
// Auto-imported
useHead({ title: 'Page Title' });
// hoặc
useSeoMeta({ title: 'Page Title', description: '...' });
```

### 6. Cập Nhật Environment Variables

**Trước:**
```javascript
import.meta.env.VITE_API_URL
```

**Sau:**
```javascript
const config = useRuntimeConfig();
config.public.apiUrl
```

### 7. Thêm definePageMeta

Trong mỗi page, thêm `definePageMeta`:

```vue
<script setup>
definePageMeta({
  middleware: 'auth', // hoặc 'guest', 'role'
  layout: 'default', // hoặc 'auth'
});
</script>
```

## Checklist Migration

### Components
- [ ] Di chuyển `src/components/common/*.vue` → `components/common/*.vue`
- [ ] Di chuyển `src/components/layout/*.vue` → `components/layout/*.vue`
- [ ] Sửa tất cả components để sử dụng composables thay vì proxy
- [ ] Sửa tất cả components để sử dụng Pinia stores
- [ ] Xóa import statements không cần thiết

### Pages
- [ ] Di chuyển tất cả views sang pages
- [ ] Thêm `definePageMeta` cho mỗi page
- [ ] Sửa tất cả pages để sử dụng composables
- [ ] Sửa tất cả pages để sử dụng Pinia stores
- [ ] Wrap browser APIs với `process.client` hoặc `onMounted()`
- [ ] Sửa route navigation

### Assets
- [ ] Di chuyển `src/assets/css/*.css` → `assets/css/*.css`
- [ ] Di chuyển `src/assets/images/*` → `assets/images/*`
- [ ] Cập nhật import paths trong các file

### Config
- [ ] Di chuyển `src/config/*.js` → `config/*.js`
- [ ] Cập nhật import paths

### Testing
- [ ] Test tất cả routes
- [ ] Test authentication flow
- [ ] Test API calls
- [ ] Test real-time features (Echo)
- [ ] Test SSR compatibility

## Lưu Ý Quan Trọng

1. **getCurrentInstance()**: Không dùng được trong Nuxt, thay bằng composables
2. **window/document**: Chỉ dùng trong `onMounted()` hoặc `process.client`
3. **Laravel Echo**: Chỉ khởi tạo ở client-side (đã setup trong plugin)
4. **Global properties**: Tất cả chuyển sang composables
5. **Auto-imports**: Xóa các import không cần thiết
6. **Components**: Nuxt tự động import từ `components/` directory
7. **Router**: Sử dụng file-based routing, không cần router config

## Chạy Project

```bash
# Cài đặt dependencies
npm install

# Chạy dev server
npm run dev

# Build production
npm run build

# Preview production build
npm run preview
```

## Troubleshooting

### Lỗi "Cannot find module"
- Kiểm tra lại import paths
- Đảm bảo các file đã được di chuyển đúng vị trí

### Lỗi "window is not defined"
- Wrap code sử dụng window với `process.client` hoặc `onMounted()`

### Lỗi "getCurrentInstance is not defined"
- Thay bằng composables (useApi, useHelper, etc.)

### Lỗi Auto-import
- Kiểm tra lại cấu trúc thư mục
- Đảm bảo components được đặt đúng vị trí

## Tài Liệu Tham Khảo

- [Nuxt 3 Documentation](https://nuxt.com/docs)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)

