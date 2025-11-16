# Danh Sách File Đã Di Chuyển

## ✅ Components

### Common Components
- ✅ `components/common/BaseDatePicker.vue`
- ✅ `components/common/BaseInput.vue`
- ✅ `components/common/BaseLoading.vue`
- ✅ `components/common/BaseMenu.vue`
- ✅ `components/common/BaseModal.vue`
- ✅ `components/common/BaseMoreMenu.vue`
- ✅ `components/common/BasePagination.vue`
- ✅ `components/common/BaseSelect.vue`
- ✅ `components/common/BaseStatusTabs.vue`
- ✅ `components/common/ImageCropModal.vue`
- ✅ `components/common/Logo.vue`
- ✅ `components/common/Notification.vue` (đã migrate to Pinia)
- ✅ `components/common/NotificationPreview.vue`
- ✅ `components/common/SendMessage.vue`
- ✅ `components/common/TutorCard.vue`

### Layout Components
- ✅ `components/layout/Footer.vue`
- ✅ `components/layout/Header.vue`
- ✅ `components/layout/Main.vue` (có thể xóa, đã có layouts/default.vue)

### Profile Components
- ✅ `components/profile/OverviewNew.vue`
- ✅ `components/profile/ProfileInfoNew.vue`
- ✅ `components/profile/ScheduleNew.vue`
- ✅ `components/profile/WalletBalance.vue`

### Booking Components
- ✅ `components/booking/BookingCardList.vue`
- ✅ `components/booking/BookingSuccess.vue`
- ✅ `components/booking/ComplaintModal.vue`
- ✅ `components/booking/ConfirmBookingNew.vue`
- ✅ `components/booking/LessonInformation.vue`
- ✅ `components/booking/PackageSelection.vue`
- ✅ `components/booking/RealBooking.vue`
- ✅ `components/booking/ReviewModal.vue`

### UserDetail Components
- ✅ `components/userDetail/OverviewTab.vue`
- ✅ `components/userDetail/ReviewsTab.vue`

## ✅ Pages

### Core Pages
- ✅ `pages/index.vue` (từ Home.vue)
- ✅ `pages/search.vue`
- ✅ `pages/message.vue`
- ✅ `pages/saved.vue`
- ✅ `pages/setting.vue`
- ✅ `pages/become-tutor.vue`
- ✅ `pages/help.vue`
- ✅ `pages/privacy.vue`
- ✅ `pages/terms.vue`
- ✅ `pages/guide.vue`
- ✅ `pages/notification.vue`

### Auth Pages
- ✅ `pages/auth/login.vue`
- ✅ `pages/auth/register.vue`
- ✅ `pages/auth/select-role.vue`
- ✅ `pages/auth/facebook/callback.vue`
- ✅ `pages/auth/google/callback.vue`

### Profile Pages
- ✅ `pages/profile/index.vue`

### Booking Pages
- ✅ `pages/booking/[uid].vue`
- ✅ `pages/booking/manager.vue`
- ✅ `pages/booking/success/[id].vue`

### Classroom Pages
- ✅ `pages/classroom/[id].vue`
- ✅ `pages/classroom-manager.vue`

### Tutor Pages
- ✅ `pages/tutor/[uid].vue`

## ✅ Assets

### CSS Files
- ✅ `assets/css/*.css` (tất cả CSS files từ src/assets/css/)

### Images
- ✅ `assets/images/*` (tất cả images từ src/assets/images/)

## ✅ Config

- ✅ `config/header.js`
- ✅ `config/index.js`

## 📝 Lưu Ý

Tất cả các file đã được di chuyển, nhưng **chưa được sửa code** để tương thích với Nuxt 3. Cần:

1. **Sửa tất cả components và pages** để:
   - Thay `getCurrentInstance()` → composables
   - Thay `proxy.$api` → `useApi()`
   - Thay `proxy.$helper` → `useHelper()`
   - Thay `proxy.$notification` → `useNotification()`
   - Thay `proxy.$config` → `useConfig()`
   - Thay `useStore()` → Pinia stores
   - Wrap browser APIs với `process.client` hoặc `onMounted()`
   - Thêm `definePageMeta()` cho mỗi page
   - Xóa import statements không cần thiết

2. **Cập nhật import paths** trong các file:
   - `@/components/` → `~/components/` hoặc auto-import
   - `@/views/` → không cần (đã là pages)
   - `@css/` → `~/assets/css/`
   - `@api/` → không cần (dùng useApi())
   - `@utils/` → không cần (dùng composables)
   - `@config/` → `~/config/`

3. **Sửa router navigation**:
   - `router.push()` → `navigateTo()` (optional, vẫn dùng được router.push())
   - `router-link` → `NuxtLink`

4. **Sửa head management**:
   - Xóa `import { useHead } from '@vueuse/head'`
   - Sử dụng `useHead()` hoặc `useSeoMeta()` (auto-imported)

## 🚀 Bước Tiếp Theo

1. Chạy `npm install` để cài đặt dependencies
2. Bắt đầu sửa từng file theo hướng dẫn trong `MIGRATION_GUIDE.md`
3. Test từng page sau khi sửa

