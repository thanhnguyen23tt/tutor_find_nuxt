# Kế hoạch Chuyển đổi TutorFind sang React Native

Dự án này sẽ chuyển đổi toàn bộ ứng dụng Nuxt.js hiện tại sang React Native (sử dụng Expo & TypeScript).

## Cấu trúc Dự án (React Native)

```
src/
  ├── api/                # API Client (thay thế useApi)
  ├── assets/             # Images, Fonts
  ├── components/         # Reusable Components
  │   ├── common/         # BaseInput, BaseButton, etc.
  │   └── specific/       # TutorCard, BookingForm, etc.
  ├── constants/          # Colors, Theme, Config
  ├── hooks/              # Custom Hooks (thay thế Composables)
  ├── navigation/         # React Navigation Setup
  ├── screens/            # Màn hình (thay thế Pages)
  │   ├── auth/           # Login, Register
  │   ├── main/           # Home, Search, Profile
  │   └── booking/        # Booking Flow
  ├── store/              # Redux Toolkit (thay thế Pinia)
  ├── types/              # TypeScript Definitions
  └── utils/              # Helper functions
```

## Lộ trình Chuyển đổi

### Giai đoạn 1: Khởi tạo & Cấu trúc (Foundation)
- [ ] Thiết lập Navigation (Stack & Tab Navigator).
- [ ] Cấu hình Redux Toolkit (AuthSlice, ConfigSlice).
- [ ] Xây dựng Axios Client (xử lý Token, Interceptors).
- [ ] Thiết lập Theme (Màu sắc, Font chữ từ `app.css`).

### Giai đoạn 2: Components Cơ bản (Common)
- [ ] `BaseInput` & `BaseSelect` (Input & Dropdown).
- [ ] `BaseButton` (Primary/Secondary Buttons).
- [ ] `BaseModal` (Sử dụng `react-native-modal`).
- [ ] `TutorCard` (Card hiển thị thông tin gia sư).
- [ ] `LoadingOverlay` (Spinner).

### Giai đoạn 3: Xác thực (Authentication)
- [ ] Màn hình Login (`pages/auth/login.vue`).
- [ ] Màn hình Register (`pages/auth/register.vue`).
- [ ] Màn hình Quên mật khẩu.
- [ ] Xử lý lưu trữ Token (`SecureStore`).

### Giai đoạn 4: Tính năng Chính (Core Features)
- [ ] Màn hình Home (`pages/index.vue`).
- [ ] Màn hình Tìm kiếm (`pages/search.vue`).
- [ ] Màn hình Chi tiết Gia sư (`pages/tutor/[id].vue`).
- [ ] Logic lọc nâng cao (Filter Modal).

### Giai đoạn 5: Đặt lịch (Booking)
- [ ] Flow đặt lịch (`pages/booking/[uid].vue`).
- [ ] Quản lý lịch học (`pages/profile/schedule.vue`).

### Giai đoạn 6: Hồ sơ & Cài đặt (Profile)
- [ ] Dashboard cá nhân.
- [ ] Chỉnh sửa hồ sơ (Avatar, thông tin).
- [ ] Ví & Doanh thu.

### Giai đoạn 7: Nâng cao (Advanced)
- [ ] Tích hợp WebRTC cho lớp học ảo (`pages/classroom/[id].vue`). *Lưu ý: Cần sử dụng `react-native-webrtc`.*
- [ ] Chat & Thông báo (Pusher/Laravel Echo).

## Mapping Thư viện

| Nuxt.js / Vue | React Native | Ghi chú |
|---------------|--------------|---------|
| Vue Router | React Navigation | Stack & Bottom Tabs |
| Pinia | Redux Toolkit | Hoặc Zustand |
| $fetch / useApi | Axios | Cần cấu hình Interceptors |
| CSS / SCSS | StyleSheet | Hoặc NativeWind (Tailwind) |
| Cookies | Async Storage | SecureStore cho Token |
| SimplePeer | RN WebRTC | Cần native config |

---
**Trạng thái:** Đang khởi tạo...
