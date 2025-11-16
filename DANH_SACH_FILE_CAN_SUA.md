# Danh Sách File Cần Sửa Khi Migration

## 📊 Thống Kê

- **Tổng số file Vue trong views/:** ~20+ files
- **File sử dụng `getCurrentInstance()`/`proxy.$`:** 31 files
- **File sử dụng browser APIs (window/document):** 21 files

---

## 🔴 CÁC FILE CẦN SỬA NHIỀU NHẤT

### 1. Files sử dụng `getCurrentInstance()` và `proxy.$`

Các file này cần thay đổi:
- `proxy.$api` → `useApi()`
- `proxy.$helper` → `useHelper()`
- `proxy.$notification` → `useNotification()`
- `proxy.$config` → `useConfig()`

**Danh sách:**
1. `src/views/Home.vue`
2. `src/views/Search.vue`
3. `src/views/Message.vue`
4. `src/views/classRoom/ClassRoom.vue`
5. `src/views/classRoom/Index.vue`
6. `src/views/userDetail/UserDetail.vue`
7. `src/views/userDetail/components/OverviewTab.vue`
8. `src/views/profile/Index.vue`
9. `src/views/profile/components/OverviewNew.vue`
10. `src/views/profile/components/ProfileInfoNew.vue`
11. `src/views/profile/components/ScheduleNew.vue`
12. `src/views/profile/components/WalletBalance.vue`
13. `src/views/booking/index.vue`
14. `src/views/booking/BookingManager.vue`
15. `src/views/booking/components/BookingSuccess.vue`
16. `src/views/booking/components/ComplaintModal.vue`
17. `src/views/booking/components/ConfirmBookingNew.vue`
18. `src/views/booking/components/LessonInformation.vue`
19. `src/views/booking/components/PackageSelection.vue`
20. `src/views/booking/components/RealBooking.vue`
21. `src/views/booking/components/ReviewModal.vue`
22. `src/views/Auth/Login.vue`
23. `src/views/Auth/Register.vue`
24. `src/views/Auth/RoleSelection.vue`
25. `src/views/Saved.vue`
26. `src/views/Setting.vue`
27. `src/views/notification/Notification.vue`
28. `src/views/Help.vue`
29. `src/views/Privacy.vue`
30. `src/views/Terms.vue`
31. `src/views/Guide.vue`

### 2. Files sử dụng Browser APIs

Các file này cần wrap với `process.client` hoặc `onMounted()`:

1. `src/views/Message.vue` - window.innerWidth, window.Echo
2. `src/views/classRoom/ClassRoom.vue` - window, document
3. `src/views/classRoom/Index.vue` - window, document
4. `src/views/userDetail/UserDetail.vue` - window
5. `src/views/Auth/Register.vue` - localStorage, sessionStorage
6. `src/views/Auth/Login.vue` - localStorage, sessionStorage
7. `src/views/booking/components/ConfirmBookingNew.vue` - window, document
8. `src/views/booking/components/LessonInformation.vue` - window, document
9. `src/views/Privacy.vue` - window
10. `src/views/Terms.vue` - window
11. `src/views/Guide.vue` - window
12. `src/views/FacebookCallback.vue` - window
13. `src/views/GoogleCallback.vue` - window

---

## 📝 CHI TIẾT THAY ĐỔI TỪNG FILE

### Core Pages

#### `Home.vue`
- ✅ Thay `getCurrentInstance()` → composables
- ✅ Thay `proxy.$api` → `useApi()`
- ✅ Thay `proxy.$helper` → `useHelper()`
- ✅ Xóa import `TutorCard` (auto-import)
- ✅ Di chuyển → `pages/index.vue`

#### `Search.vue`
- ✅ Thay `getCurrentInstance()` → composables
- ✅ Thay `proxy.$api` → `useApi()`
- ✅ Thay `proxy.$helper` → `useHelper()`
- ✅ Thay `useHead` từ `@vueuse/head` → Nuxt `useHead()`
- ✅ Xóa import components (auto-import)
- ✅ Di chuyển → `pages/search.vue`

#### `Message.vue`
- ✅ Thay `getCurrentInstance()` → composables
- ✅ Thay `proxy.$api` → `useApi()`
- ✅ Thay `proxy.$helper` → `useHelper()`
- ✅ Wrap `window.innerWidth` với `onMounted()` hoặc `process.client`
- ✅ Wrap `window.Echo` với `process.client`
- ✅ Di chuyển → `pages/message.vue`

### Auth Pages

#### `Auth/Login.vue`
- ✅ Thay `getCurrentInstance()` → composables
- ✅ Thay `proxy.$api` → `useApi()`
- ✅ Wrap `localStorage`/`sessionStorage` với `process.client`
- ✅ Di chuyển → `pages/auth/login.vue`
- ✅ Sử dụng layout `auth`

#### `Auth/Register.vue`
- ✅ Thay `getCurrentInstance()` → composables
- ✅ Thay `proxy.$api` → `useApi()`
- ✅ Wrap `localStorage`/`sessionStorage` với `process.client`
- ✅ Di chuyển → `pages/auth/register.vue`
- ✅ Sử dụng layout `auth`

#### `Auth/RoleSelection.vue`
- ✅ Thay `getCurrentInstance()` → composables
- ✅ Thay `proxy.$api` → `useApi()`
- ✅ Di chuyển → `pages/auth/select-role.vue`

### Profile Pages

#### `profile/Index.vue`
- ✅ Thay `getCurrentInstance()` → composables
- ✅ Thay `proxy.$api` → `useApi()`
- ✅ Di chuyển → `pages/profile/index.vue`

#### `profile/components/*.vue`
- ✅ Tất cả components trong profile cần thay `proxy.$` → composables
- ✅ Di chuyển → `components/profile/` (giữ nguyên structure)

### Booking Pages

#### `booking/index.vue`
- ✅ Thay `getCurrentInstance()` → composables
- ✅ Thay `proxy.$api` → `useApi()`
- ✅ Di chuyển → `pages/booking/[uid].vue`

#### `booking/BookingManager.vue`
- ✅ Thay `getCurrentInstance()` → composables
- ✅ Thay `proxy.$api` → `useApi()`
- ✅ Di chuyển → `pages/booking/manager.vue`

#### `booking/components/*.vue`
- ✅ Tất cả components cần thay `proxy.$` → composables
- ✅ Wrap browser APIs với `process.client`
- ✅ Di chuyển → `components/booking/`

### Classroom Pages

#### `classRoom/ClassRoom.vue`
- ✅ Thay `getCurrentInstance()` → composables
- ✅ Thay `proxy.$api` → `useApi()`
- ✅ Wrap `window`, `document` với `process.client`
- ✅ Di chuyển → `pages/classroom/[id].vue`

#### `classRoom/Index.vue`
- ✅ Thay `getCurrentInstance()` → composables
- ✅ Thay `proxy.$api` → `useApi()`
- ✅ Wrap browser APIs với `process.client`
- ✅ Di chuyển → `pages/classroom-manager.vue`

### Other Pages

#### `userDetail/UserDetail.vue`
- ✅ Thay `getCurrentInstance()` → composables
- ✅ Thay `proxy.$api` → `useApi()`
- ✅ Wrap `window` với `process.client`
- ✅ Di chuyển → `pages/tutor/[uid].vue`

#### `Saved.vue`
- ✅ Thay `getCurrentInstance()` → composables
- ✅ Thay `proxy.$api` → `useApi()`
- ✅ Di chuyển → `pages/saved.vue`

#### `Setting.vue`
- ✅ Thay `getCurrentInstance()` → composables
- ✅ Thay `proxy.$api` → `useApi()`
- ✅ Di chuyển → `pages/setting.vue`

#### `BecomeTutor.vue`
- ✅ Di chuyển → `pages/become-tutor.vue`

#### `Help.vue`, `Privacy.vue`, `Terms.vue`, `Guide.vue`
- ✅ Thay `getCurrentInstance()` → composables (nếu có)
- ✅ Wrap `window` với `process.client` (nếu có)
- ✅ Di chuyển → `pages/help.vue`, `pages/privacy.vue`, etc.

#### `FacebookCallback.vue`, `GoogleCallback.vue`
- ✅ Wrap `window` với `process.client`
- ✅ Di chuyển → `pages/auth/facebook/callback.vue`, `pages/auth/google/callback.vue`

---

## 🔧 FILES CẦN TẠO MỚI

### Composables
1. `composables/useApi.js` - Thay thế `proxy.$api`
2. `composables/useHelper.js` - Thay thế `proxy.$helper`
3. `composables/useNotification.js` - Thay thế `proxy.$notification`
4. `composables/useConfig.js` - Thay thế `proxy.$config`

### Plugins
1. `plugins/echo.client.ts` - Laravel Echo setup (client-only)
2. `plugins/axios.ts` - Axios configuration
3. `plugins/global-components.client.ts` - Global components registration

### Middleware
1. `middleware/auth.js` - Authentication guard
2. `middleware/guest.js` - Guest route guard
3. `middleware/role.js` - Role-based access control

### Layouts
1. `layouts/default.vue` - Main layout (từ `components/layout/Main.vue`)
2. `layouts/auth.vue` - Auth pages layout

### Stores (Pinia)
1. `stores/config.js` - Configuration store
2. `stores/user.js` - User data store
3. `stores/notification.js` - Notification store

### Config
1. `nuxt.config.ts` - Nuxt configuration
2. `app.vue` - Root component

---

## 📋 CHECKLIST THEO FILE

### Priority 1 (Core Pages)
- [ ] `Home.vue` → `pages/index.vue`
- [ ] `Search.vue` → `pages/search.vue`
- [ ] `Message.vue` → `pages/message.vue`
- [ ] `App.vue` → `app.vue`

### Priority 2 (Auth)
- [ ] `Auth/Login.vue` → `pages/auth/login.vue`
- [ ] `Auth/Register.vue` → `pages/auth/register.vue`
- [ ] `Auth/RoleSelection.vue` → `pages/auth/select-role.vue`

### Priority 3 (User Features)
- [ ] `profile/Index.vue` → `pages/profile/index.vue`
- [ ] `booking/index.vue` → `pages/booking/[uid].vue`
- [ ] `userDetail/UserDetail.vue` → `pages/tutor/[uid].vue`
- [ ] `Saved.vue` → `pages/saved.vue`
- [ ] `Setting.vue` → `pages/setting.vue`

### Priority 4 (Other)
- [ ] Tất cả các file còn lại

---

## ⚠️ LƯU Ý ĐẶC BIỆT

1. **Message.vue**: Có nhiều browser APIs và Echo, cần xử lý cẩn thận
2. **ClassRoom.vue**: Có nhiều window/document access
3. **Booking components**: Nhiều file, cần migrate từng cái một
4. **Profile components**: Nhiều file phức tạp, cần test kỹ

---

## 🎯 KẾ HOẠCH MIGRATION

### Week 1: Setup & Core
- Setup Nuxt 3
- Tạo composables và plugins
- Migrate Home, Search, Message

### Week 2: Auth & User
- Migrate Auth pages
- Migrate Profile pages
- Migrate UserDetail

### Week 3: Features
- Migrate Booking pages
- Migrate Classroom pages
- Migrate other pages

### Week 4: Testing & Polish
- Test tất cả features
- Fix bugs
- Optimize performance



