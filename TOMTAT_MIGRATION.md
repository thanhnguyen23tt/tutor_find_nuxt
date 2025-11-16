# Tóm Tắt Migration Vue → Nuxt

## 🔴 CÁC THAY ĐỔI BẮT BUỘC

### 1. Cấu trúc thư mục
- `src/views/` → `pages/`
- `src/components/layout/Main.vue` → `layouts/default.vue`
- Xóa `src/router/index.js` (dùng file-based routing)

### 2. API Calls
```javascript
// ❌ TRƯỚC
const { proxy } = getCurrentInstance();
await proxy.$api.apiGet('tutors');

// ✅ SAU
const { api } = useApi();
await api.apiGet('tutors');
```

### 3. Helper Functions
```javascript
// ❌ TRƯỚC
proxy.$helper.formatCurrency(1000);

// ✅ SAU
const { formatCurrency } = useHelper();
formatCurrency(1000);
```

### 4. Vuex → Pinia
```javascript
// ❌ TRƯỚC
const store = useStore();
store.commit('setConfiguration', data);
store.state.configuration;

// ✅ SAU
const configStore = useConfigStore();
configStore.setConfiguration(data);
configStore.configuration;
```

### 5. Route Guards
```javascript
// ❌ TRƯỚC (router/index.js)
router.beforeEach(async (to, from, next) => { ... });

// ✅ SAU (middleware/auth.js)
export default defineNuxtRouteMiddleware((to, from) => {
  if (!isAuthenticated) return navigateTo('/login');
});
```

### 6. Client-side Code
```javascript
// ❌ TRƯỚC
const isMobile = ref(window.innerWidth <= 1024);

// ✅ SAU
const isMobile = ref(false);
onMounted(() => {
  isMobile.value = window.innerWidth <= 1024;
});
// hoặc
if (process.client) {
  isMobile.value = window.innerWidth <= 1024;
}
```

### 7. Head Management
```javascript
// ❌ TRƯỚC
import { useHead } from '@vueuse/head';

// ✅ SAU
useHead({ title: '...' }); // Built-in Nuxt
```

### 8. Components Import
```vue
<!-- ❌ TRƯỚC -->
<script setup>
import TutorCard from '@/components/common/TutorCard.vue';
</script>

<!-- ✅ SAU -->
<script setup>
<!-- Auto-imported, không cần import -->
</script>
```

## 📋 CHECKLIST NHANH

### Setup
- [ ] Cài Nuxt 3
- [ ] Tạo `nuxt.config.ts`
- [ ] Setup Pinia
- [ ] Tạo composables (useApi, useHelper, useNotification)

### Migration
- [ ] Di chuyển `views/` → `pages/`
- [ ] Tạo `layouts/default.vue`
- [ ] Tạo `middleware/auth.js`
- [ ] Thay tất cả `proxy.$api` → `useApi()`
- [ ] Thay tất cả `proxy.$helper` → `useHelper()`
- [ ] Chuyển Vuex → Pinia
- [ ] Fix client-side code (window, document, Echo)

## ⚠️ LƯU Ý QUAN TRỌNG

1. **getCurrentInstance()** → Không dùng được trong Nuxt, thay bằng composables
2. **window/document** → Chỉ dùng trong `onMounted()` hoặc `process.client`
3. **Laravel Echo** → Chỉ khởi tạo ở client-side (plugin)
4. **Global properties** → Tất cả chuyển sang composables
5. **Auto-imports** → Xóa các import không cần thiết

## 📊 ƯỚC TÍNH

- **Thời gian:** 2-4 tuần
- **Độ khó:** Trung bình - Cao
- **Rủi ro:** Trung bình (cần test kỹ)

## 🎯 LỢI ÍCH SAU MIGRATION

- ✅ SSR/SSG support
- ✅ SEO tốt hơn
- ✅ Auto-imports (code ngắn gọn hơn)
- ✅ File-based routing (dễ quản lý)
- ✅ Better DX (Developer Experience)



