# Migration Status - Vue 3 to Nuxt 3

## ✅ Đã Hoàn Thành

### 1. Setup Nuxt 3
- [x] Cài đặt Nuxt 3 và dependencies (package.json)
- [x] Tạo `nuxt.config.ts`
- [x] Cấu hình runtime config
- [x] Cấu hình CSS imports
- [x] Cấu hình Vite aliases

### 2. Composables
- [x] `composables/useApi.js` - Thay thế `proxy.$api`
- [x] `composables/useHelper.js` - Thay thế `proxy.$helper`
- [x] `composables/useNotification.js` - Thay thế `proxy.$notification`
- [x] `composables/useConfig.js` - Thay thế `proxy.$config`
- [x] `composables/useAuth.js` - Authentication utilities

### 3. Pinia Stores
- [x] `stores/config.js` - Configuration store
- [x] `stores/user.js` - User data store
- [x] `stores/notification.js` - Notification store

### 4. Layouts
- [x] `layouts/default.vue` - Main layout
- [x] `layouts/auth.vue` - Auth pages layout

### 5. Middleware
- [x] `middleware/auth.js` - Authentication guard
- [x] `middleware/guest.js` - Guest route guard
- [x] `middleware/role.js` - Role-based access control

### 6. Plugins
- [x] `plugins/echo.client.ts` - Laravel Echo setup
- [x] `plugins/axios.client.ts` - Axios setup
- [x] `plugins/global-components.client.ts` - Global components (placeholder)

### 7. App & Components
- [x] `app.vue` - Root component
- [x] `components/common/Notification.vue` - Notification component (migrated to Pinia)

### 8. Config
- [x] Di chuyển `src/config/*.js` → `config/*.js`

## 🔄 Cần Hoàn Thành

### 1. Components Migration
- [ ] Di chuyển `src/components/common/*.vue` → `components/common/*.vue`
  - [ ] BaseModal.vue
  - [ ] BaseInput.vue
  - [ ] BaseSelect.vue
  - [ ] BasePagination.vue
  - [ ] BaseDatePicker.vue
  - [ ] BaseMoreMenu.vue
  - [ ] BaseLoading.vue
  - [ ] BaseStatusTabs.vue
  - [ ] Logo.vue
  - [ ] TutorCard.vue
  - [ ] NotificationPreview.vue
  - [ ] SendMessage.vue
  - [ ] ImageCropModal.vue
  - [ ] BaseMenu.vue

- [ ] Di chuyển `src/components/layout/*.vue` → `components/layout/*.vue`
  - [ ] Header.vue (cần sửa để dùng composables)
  - [ ] Footer.vue

- [ ] Sửa tất cả components:
  - [ ] Thay `getCurrentInstance()` → composables
  - [ ] Thay `proxy.$api` → `useApi()`
  - [ ] Thay `proxy.$helper` → `useHelper()`
  - [ ] Thay `proxy.$notification` → `useNotification()`
  - [ ] Thay `proxy.$config` → `useConfig()`
  - [ ] Thay `useStore()` → Pinia stores
  - [ ] Xóa import statements không cần thiết

### 2. Pages Migration
- [ ] Core Pages:
  - [ ] `src/views/Home.vue` → `pages/index.vue`
  - [ ] `src/views/Search.vue` → `pages/search.vue`
  - [ ] `src/views/Message.vue` → `pages/message.vue`

- [ ] Auth Pages:
  - [ ] `src/views/Auth/Login.vue` → `pages/auth/login.vue`
  - [ ] `src/views/Auth/Register.vue` → `pages/auth/register.vue`
  - [ ] `src/views/Auth/RoleSelection.vue` → `pages/auth/select-role.vue`
  - [ ] `src/views/FacebookCallback.vue` → `pages/auth/facebook/callback.vue`
  - [ ] `src/views/GoogleCallback.vue` → `pages/auth/google/callback.vue`

- [ ] Profile Pages:
  - [ ] `src/views/profile/Index.vue` → `pages/profile/index.vue`
  - [ ] `src/views/profile/components/*.vue` → `components/profile/*.vue`

- [ ] Booking Pages:
  - [ ] `src/views/booking/index.vue` → `pages/booking/[uid].vue`
  - [ ] `src/views/booking/BookingManager.vue` → `pages/booking/manager.vue`
  - [ ] `src/views/booking/components/BookingSuccess.vue` → `pages/booking/success/[id].vue`
  - [ ] `src/views/booking/components/*.vue` → `components/booking/*.vue`

- [ ] Classroom Pages:
  - [ ] `src/views/classRoom/ClassRoom.vue` → `pages/classroom/[id].vue`
  - [ ] `src/views/classRoom/Index.vue` → `pages/classroom-manager.vue`

- [ ] Other Pages:
  - [ ] `src/views/userDetail/UserDetail.vue` → `pages/tutor/[uid].vue`
  - [ ] `src/views/userDetail/components/*.vue` → `components/userDetail/*.vue`
  - [ ] `src/views/Saved.vue` → `pages/saved.vue`
  - [ ] `src/views/Setting.vue` → `pages/setting.vue`
  - [ ] `src/views/BecomeTutor.vue` → `pages/become-tutor.vue`
  - [ ] `src/views/Help.vue` → `pages/help.vue`
  - [ ] `src/views/Privacy.vue` → `pages/privacy.vue`
  - [ ] `src/views/Terms.vue` → `pages/terms.vue`
  - [ ] `src/views/Guide.vue` → `pages/guide.vue`
  - [ ] `src/views/notification/Notification.vue` → `pages/notification.vue`

### 3. Assets Migration
- [ ] Di chuyển `src/assets/css/*.css` → `assets/css/*.css`
- [ ] Di chuyển `src/assets/images/*` → `assets/images/*`
- [ ] Cập nhật import paths trong các file

### 4. Code Updates
- [ ] Sửa tất cả pages để:
  - [ ] Thay `getCurrentInstance()` → composables
  - [ ] Thay `proxy.$api` → `useApi()`
  - [ ] Thay `proxy.$helper` → `useHelper()`
  - [ ] Thay `proxy.$notification` → `useNotification()`
  - [ ] Thay `proxy.$config` → `useConfig()`
  - [ ] Thay `useStore()` → Pinia stores
  - [ ] Wrap browser APIs với `process.client` hoặc `onMounted()`
  - [ ] Thay `useHead` từ `@vueuse/head` → Nuxt `useHead()`
  - [ ] Thay `router.push()` → `navigateTo()` (optional)
  - [ ] Thêm `definePageMeta()` cho mỗi page
  - [ ] Xóa import statements không cần thiết

### 5. Testing
- [ ] Test tất cả routes
- [ ] Test authentication flow
- [ ] Test API calls
- [ ] Test real-time features (Echo)
- [ ] Test SSR compatibility
- [ ] Test browser APIs (window, document, localStorage, sessionStorage)

## 📋 Hướng Dẫn Migration

Xem file `MIGRATION_GUIDE.md` để biết chi tiết cách migration từng file.

## 🔧 Các Thay Đổi Chính

### 1. API Calls
```javascript
// ❌ TRƯỚC
const { proxy } = getCurrentInstance();
await proxy.$api.apiGet('tutors');

// ✅ SAU
const { api } = useApi();
await api.apiGet('tutors');
```

### 2. Helper Functions
```javascript
// ❌ TRƯỚC
proxy.$helper.formatCurrency(1000);

// ✅ SAU
const { formatCurrency } = useHelper();
formatCurrency(1000);
```

### 3. State Management
```javascript
// ❌ TRƯỚC
const store = useStore();
store.commit('setConfiguration', data);

// ✅ SAU
const configStore = useConfigStore();
configStore.setConfiguration(data);
```

### 4. Browser APIs
```javascript
// ❌ TRƯỚC
const isMobile = ref(window.innerWidth <= 1024);

// ✅ SAU
const isMobile = ref(false);
onMounted(() => {
  if (process.client) {
    isMobile.value = window.innerWidth <= 1024;
  }
});
```

### 5. Route Navigation
```javascript
// ❌ TRƯỚC
router.push('/path');

// ✅ SAU
navigateTo('/path');
// hoặc vẫn dùng router.push() được
```

### 6. Head Management
```javascript
// ❌ TRƯỚC
import { useHead } from '@vueuse/head';
useHead({ title: 'Page Title' });

// ✅ SAU
useHead({ title: 'Page Title' }); // Auto-imported
```

## 🚀 Chạy Project

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

## ⚠️ Lưu Ý

1. **getCurrentInstance()**: Không dùng được trong Nuxt, thay bằng composables
2. **window/document**: Chỉ dùng trong `onMounted()` hoặc `process.client`
3. **Laravel Echo**: Chỉ khởi tạo ở client-side (đã setup trong plugin)
4. **Global properties**: Tất cả chuyển sang composables
5. **Auto-imports**: Xóa các import không cần thiết
6. **Components**: Nuxt tự động import từ `components/` directory
7. **Router**: Sử dụng file-based routing, không cần router config

## 📚 Tài Liệu

- [Nuxt 3 Documentation](https://nuxt.com/docs)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)

