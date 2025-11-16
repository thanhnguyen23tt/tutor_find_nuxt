<script setup>
import {
    ref,
    reactive,
    onMounted,
    onUnmounted,
} from 'vue';

const { api } = useApi();
const { success, error: notifyError } = useNotification();
const notificationStore = useNotificationStore();
const { genderOptions } = useConfig();

// Form data
const userProfile = ref({});
const isLoading = ref(false);
const isSaving = ref(false);

// Form sections
const basicInfoForm = reactive({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    cccd: '',
    sex: null,
});


// Validation errors
const errors = ref({});

// Methods
const loadUserProfile = async () => {
    isLoading.value = true;
    try {
        const response = await api.apiGet('me/setting');
        if (response.success !== false) {
            userProfile.value = response.data;

            // Populate forms with user data
            Object.assign(basicInfoForm, {
                first_name: response.data.first_name || '',
                last_name: response.data.last_name || '',
                phone: response.data.phone || '',
                email: response.data.email || '',
                cccd: response.data.cccd || '',
                sex: response.data.sex || null,
                about_you: response.data.about_you || ''
            });

        }
    } catch (error) {
        console.error('Error loading user profile:', error);
        proxy.$notification.error('Không thể tải thông tin hồ sơ');
    } finally {
        isLoading.value = false;
    }
};

const updateProfile = async () => {
    isSaving.value = true;
    errors.value = {};

    try {
        const formData = {
            ...basicInfoForm,
        };

        const response = await api.apiPut('me/setting', formData);

        if (response.success !== false) {
            success('Cập nhật thông tin thành công!');
            userProfile.value = response.data;
        } else {
            if (response.errors) {
                errors.value = response.errors;
            }
            notifyError(response.message || 'Cập nhật thất bại');
        }
    } catch (error) {
        console.error('Error updating profile:', error);

        if (error?.errors) {
            errors.value = error.errors;
        }

        notifyError(
            error?.message || 'Có lỗi xảy ra khi cập nhật thông tin'
        );
    } finally {
        isSaving.value = false;
    }
};

const resetForm = () => {
    loadUserProfile();
    errors.value = {};
};


// Lifecycle
onMounted(() => {
    loadUserProfile();
    // Hide footer
    notificationStore.setHiddenFooter(true);
});
onUnmounted(() => {
    // Show footer
    notificationStore.setHiddenFooter(false);
});

</script>

<template>
<div class="setting-page">
    <!-- Animated Background -->
    <div class="background-decoration">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
    </div>

    <div class="container">
        <base-loading v-if="isLoading" />

        <div v-else class="setting-content">
            <!-- Header with Icon -->
            <div class="page-header">
                <h1 class="title-header">Cài đặt tài khoản</h1>
                <p class="desc">Quản lý thông tin cá nhân và tùy chọn tài khoản của bạn</p>
            </div>

            <!-- Form Sections -->
            <div class="setting-form">
                <!-- Basic Information -->
                <div class="form-section">
                    <div class="section-header">
                        <div class="section-header-content">
                            <h3 class="section-title">Thông tin cơ bản</h3>
                            <p class="section-desc">Cập nhật thông tin cá nhân của bạn</p>
                        </div>
                    </div>

                    <div class="form-grid">
                        <div class="form-row">
                            <base-input
                                v-model="basicInfoForm.first_name"
                                label="Họ và tên đệm"
                                placeholder="Nhập họ và tên đệm..."
                                :required="true"
                            >
                                <template #icon>
                                    <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </template>
                            </base-input>
                            <base-input
                                v-model="basicInfoForm.last_name"
                                label="Tên"
                                placeholder="Nhập tên..."
                                :required="true"
                            >
                                <template #icon>
                                    <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </template>
                            </base-input>
                        </div>

                        <div class="form-row">
                            <base-input
                                v-model="basicInfoForm.phone"
                                label="Số điện thoại"
                                placeholder="Nhập số điện thoại..."
                                :required="true"
                            >
                                <template #icon>
                                    <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </template>
                            </base-input>
                            <base-input
                                v-model="basicInfoForm.email"
                                label="Email"
                                type="email"
                                placeholder="Nhập email..."
                                :required="true"
                            >
                                <template #icon>
                                    <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </template>
                            </base-input>
                        </div>

                        <div class="form-row">
                            <base-input
                                v-model="basicInfoForm.cccd"
                                label="CCCD/CMND"
                                placeholder="Nhập số CCCD/CMND..."
                                :required="true"
                            >
                                <template #icon>
                                    <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                    </svg>
                                </template>
                            </base-input>
                            <base-select
                                v-model="basicInfoForm.sex"
                                label="Giới tính"
                                :options="genderOptions"
                                placeholder="Chọn giới tính..."
                                :required="true"
                                :error="errors.sex"
                            >
                                <template #icon>
                                    <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </template>
                            </base-select>
                        </div>
                    </div>
                </div>

                <!-- Form Actions -->
                <div class="form-actions">
                    <button class="btn-md btn-secondary" @click="resetForm" :disabled="isSaving">
                        <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                            <path d="M21 3v5h-5"></path>
                            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                            <path d="M3 21v-5h5"></path>
                        </svg>
                        Khôi phục
                    </button>
                    <button class="btn-md btn-primary" @click="updateProfile" :disabled="isSaving">
                        <svg v-if="isSaving" class="icon-sm animate-spin" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                            <path d="M3 3v5h5"></path>
                            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                        </svg>
                        <svg v-else class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                            <polyline points="17,21 17,13 7,13 7,21"></polyline>
                            <polyline points="7,3 7,8 15,8"></polyline>
                        </svg>
                        {{ isSaving ? 'Đang lưu...' : 'Lưu thay đổi' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<style scoped>
.setting-page {
    min-height: 100vh;
    position: relative;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    padding: 3rem 0;
    overflow: hidden;
}

/* Animated Background */
.background-decoration {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    overflow: hidden;
    z-index: 0;
}

.circle {
    position: absolute;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
    animation: float 20s infinite ease-in-out;
}

.circle-1 {
    width: 400px;
    height: 400px;
    top: -200px;
    left: -100px;
    animation-delay: 0s;
}

.circle-2 {
    width: 300px;
    height: 300px;
    bottom: -150px;
    right: -100px;
    animation-delay: 5s;
}

.circle-3 {
    width: 250px;
    height: 250px;
    top: 50%;
    right: -50px;
    animation-delay: 10s;
}

@keyframes float {
    0%, 100% {
        transform: translate(0, 0) scale(1);
    }
    33% {
        transform: translate(30px, -30px) scale(1.1);
    }
    66% {
        transform: translate(-20px, 20px) scale(0.9);
    }
}

.container {
    margin: 0 auto;
    max-width: 1200px;
    padding: 0 1rem;
    position: relative;
    z-index: 1;
}

.setting-content {
    display: grid;
    gap: 2rem;
}

.page-header {
    text-align: center;
    padding: 2rem 0 0;
    position: relative;
}

.header-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 1.5rem;
    background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
    animation: iconPulse 3s ease-in-out infinite;
}

.header-icon svg {
    width: 40px;
    height: 40px;
}

@keyframes iconPulse {
    0%, 100% {
        transform: scale(1);
        box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
    }
    50% {
        transform: scale(1.05);
        box-shadow: 0 15px 50px rgba(102, 126, 234, 0.4);
    }
}

.title-header {
    font-size: var(--font-size-heading-2);
    font-weight: 900;
    background: white;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    margin: 0 0 0.75rem 0;
    letter-spacing: -0.5px;
}

.desc {
    color: white;
    margin: 0;
    font-size: var(--font-size-medium);
    font-weight: 500;
    max-width: 600px;
    margin: 0 auto;
}

.tabs-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;
}

.profile-summary {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 2.5rem;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow:
        0 20px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
    transition: all 0.3s ease;
}

.profile-summary:hover {
    transform: translateY(-5px);
    box-shadow:
        0 25px 50px -12px rgba(0, 0, 0, 0.25),
        0 20px 25px -5px rgba(0, 0, 0, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.profile-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
    border: 4px solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.profile-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    font-size: 2rem;
    font-weight: 700;
}

.profile-info {
    flex: 1;
}

.profile-name {
    font-size: var(--font-size-heading-4);
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 0.25rem 0;
}

.profile-role {
    color: var(--gray-500);
    margin: 0 0 1rem 0;
}

.profile-completion {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.completion-text {
    font-size: var(--font-size-small);
    color: var(--gray-600);
    font-weight: 500;
}

.completion-bar {
    width: 200px;
    height: 8px;
    background: #e5e7eb;
    border-radius: 4px;
    overflow: hidden;
}

.completion-progress {
    height: 100%;
    background: linear-gradient(90deg, #667eea, #764ba2);
    transition: width 0.3s ease;
}

.setting-form {
    background: white;
    border-radius: 24px;
    overflow: hidden;
    box-shadow:
        0 20px 60px rgba(0, 0, 0, 0.1),
        0 10px 30px rgba(0, 0, 0, 0.05);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid rgba(255, 255, 255, 0.8);
    width: 800px;
    margin: 0 auto;
}

.setting-form:hover {
    transform: translateY(-5px);
    box-shadow:
        0 30px 80px rgba(0, 0, 0, 0.15),
        0 15px 40px rgba(0, 0, 0, 0.08);
}

.form-section {
    padding: 3rem;
    animation: fadeInUp 0.6s ease-out;
}

.section-header {
    margin-bottom: 2.5rem;
    position: relative;
    display: flex;
    align-items: center;
    gap: 1rem;
    padding-bottom: 1.5rem;
    border-bottom: 2px solid transparent;
    border-image: linear-gradient(90deg, var(--color-primary), var(--color-primary-light)) 1;
}

.section-header::before {
    content: '';
    width: 4px;
    height: 50px;
    background: linear-gradient(180deg, var(--color-primary), var(--color-primary-light));
    border-radius: 2px;
    flex-shrink: 0;
}

.section-header-content {
    flex: 1;
}

.section-title {
    font-size: var(--font-size-heading-4);
    font-weight: 800;
    color: var(--gray-900);
    margin: 0 0 0.5rem 0;
    letter-spacing: -0.3px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.section-desc {
    color: var(--gray-500);
    margin: 0;
    font-weight: 500;
    font-size: var(--font-size-small);
    line-height: 1.5;
}

.form-grid {
    display: grid;
    gap: 2rem;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding: 1.5rem 3rem;
    background: white;
    border-top: 2px solid #e5e7eb;
    position: relative;
}

.form-actions::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
    opacity: 0.5;
}

.form-actions button {
    min-width: 140px;
    font-weight: 600;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.form-actions button:hover:not(:disabled) {
    transform: translateY(-2px);
}

.form-actions button:active:not(:disabled) {
    transform: translateY(0);
}

.animate-spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 1024px) {
    .circle-1,
    .circle-2,
    .circle-3 {
        opacity: 0.5;
    }

    .setting-form {
        width: 100%;
    }
}

@media (max-width: 768px) {
    .setting-page {
        padding: 2rem 0;
    }

    .container {
        padding: 0 1rem;
    }

    .page-header {
        padding: 1.5rem 0 2rem;
    }

    .header-icon {
        width: 60px;
        height: 60px;
    }

    .header-icon svg {
        width: 30px;
        height: 30px;
    }

    .title-header {
        font-size: var(--font-size-heading-3);
    }

    .desc {
        font-size: var(--font-size-base);
    }

    .profile-summary {
        flex-direction: column;
        text-align: center;
        padding: 2rem;
    }

    .form-section {
        padding: 2rem;
    }

    .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .section-header::before {
        width: 40px;
        height: 4px;
    }

    .section-title {
        font-size: var(--font-size-heading-5);
    }

    .form-row {
        grid-template-columns: 1fr;
        gap: 1.25rem;
    }

    .form-actions {
        flex-direction: column;
        padding: 2rem;
        gap: 0.75rem;
    }

    .form-actions button {
        width: 100%;
        min-width: auto;
    }

    .completion-bar {
        width: 100%;
    }

    .circle-1 {
        width: 300px;
        height: 300px;
    }

    .circle-2 {
        width: 200px;
        height: 200px;
    }

    .circle-3 {
        width: 150px;
        height: 150px;
    }
}

@media (max-width: 480px) {
    .setting-page {
        padding: 1.5rem 0;
    }

    .container {
        padding: 0 0.75rem;
    }

    .page-header {
        padding: 1rem 0 1.5rem;
    }

    .header-icon {
        width: 50px;
        height: 50px;
        margin-bottom: 1rem;
    }

    .header-icon svg {
        width: 25px;
        height: 25px;
    }

    .title-header {
        font-size: var(--font-size-heading-4);
    }

    .setting-form {
        border-radius: 16px;
    }

    .form-section {
        padding: 1.5rem;
    }

    .section-header {
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
    }

    .form-grid {
        gap: 1.5rem;
    }

    .form-actions {
        padding: 1.5rem;
    }

    .setting-content {
        gap: 1.5rem;
    }
}
</style>
