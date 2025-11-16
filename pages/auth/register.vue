<script setup>
// Auto-imported: ref, computed, reactive, onUnmounted, useRouter
// Auto-imported: useFormValidation from composables/useFormValidation.js

definePageMeta({
  layout: 'auth',
  middleware: 'guest'
});

const router = useRouter();
const configStore = useConfigStore();
const { register } = useAuth();
const { api } = useApi();
const { success, error: notifyError } = useNotification();

const educationLevels = computed(() => configStore.configuration?.education_levels || []);

const ROLE_STUDENT = 0;
const ROLE_TUTOR = 1;

const isLoading = ref(false);
const registrationStep = ref(1); // 1: form, 2: OTP verification
const isLoadingOtp = ref(false);
const otpCode = ref('');
const otpTimer = reactive({
    remaining: 0,
    interval: null
});

// Form validation composable
const { formErrors, handleValidationError, clearError, clearAllErrors, setError, getError } = useFormValidation();

// Separate form validation for OTP
const {
    formErrors: otpErrors,
    handleValidationError: handleOtpValidationError,
    clearError: clearOtpError,
    clearAllErrors: clearAllOtpErrors,
    getError: getOtpError,
    setError: setOtpError
} = useFormValidation();

const formData = reactive({
    role: 0,
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    passwordConfirmation: '',
    educationLevels: null,
    terms: false
});

const validate = () => {
    clearAllErrors();

    if (formData.role != ROLE_STUDENT && formData.role != ROLE_TUTOR) {
        setError('role', 'Vai trò không hợp lệ');
    }

    if (!formData.first_name) {
        setError('first_name', 'Họ không được để trống');
    }

    if (!formData.last_name) {
        setError('last_name', 'Tên không được để trống');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
        setError('email', 'Email không được để trống');
    } else if (!emailRegex.test(formData.email)) {
        setError('email', 'Email không hợp lệ');
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!formData.phone) {
        setError('phone', 'Số điện thoại không được để trống');
    } else if (!phoneRegex.test(formData.phone)) {
        setError('phone', 'Số điện thoại phải là 10 chữ số');
    }

    if (!formData.password) {
        setError('password', 'Mật khẩu không được để trống');
    } else if (formData.password.length < 8) {
        setError('password', 'Mật khẩu phải có ít nhất 8 ký tự');
    }

    if (!formData.passwordConfirmation) {
        setError('passwordConfirmation', 'Xác nhận mật khẩu không được để trống');
    } else if (formData.password !== formData.passwordConfirmation) {
        setError('passwordConfirmation', 'Mật khẩu không khớp');
    }

    if (formData.role === ROLE_STUDENT && !formData.educationLevels) {
        setError('educationLevels', 'Vui lòng chọn cấp học hiện tại');
    }

    if (!formData.terms) {
        setError('terms', 'Bạn phải đồng ý với điều khoản');
    }

    return Object.keys(formErrors.value).length === 0;
};

const addEducationLevel = (item) => {
    formData.educationLevels = item.id;
};

const resetFormData = () => {
    clearAllErrors();
};

const sendRegistrationOtp = async () => {
    if (!validate()) {
        return;
    }

    try {
        isLoadingOtp.value = true;
        clearAllErrors();

        const response = await api.apiPost('auth/register/otp', {
            email: formData.email,
            phone: formData.phone,
            first_name: formData.first_name,
            last_name: formData.last_name
        });

        if (response?.success) {
            success(response.message || 'Mã OTP đã được gửi đến email của bạn');
            registrationStep.value = 2;

            // Start countdown timer
            const resendRemains = response?.data?.timers?.resend?.remains || 60;
            otpTimer.remaining = resendRemains;
            if (otpTimer.interval) {
                clearInterval(otpTimer.interval);
            }
            otpTimer.interval = setInterval(() => {
                if (otpTimer.remaining > 0) {
                    otpTimer.remaining--;
                } else {
                    clearInterval(otpTimer.interval);
                    otpTimer.interval = null;
                }
            }, 1000);
        } else {
            notifyError(response?.message || 'Gửi mã OTP thất bại');
        }
    } catch (error) {
        // Nếu bị rate limit (429), hiển thị timer
        if (error.response?.status === 429) {
            const remainingSeconds = error.response?.data?.data?.remaining_seconds ||
                                   error.response?.data?.data?.timers?.resend?.remains;

            if (remainingSeconds) {
                otpTimer.remaining = remainingSeconds;
                if (otpTimer.interval) {
                    clearInterval(otpTimer.interval);
                }
                otpTimer.interval = setInterval(() => {
                    if (otpTimer.remaining > 0) {
                        otpTimer.remaining--;
                    } else {
                        clearInterval(otpTimer.interval);
                        otpTimer.interval = null;
                    }
                }, 1000);
            }
        }
        handleValidationError(error, 'Gửi mã OTP thất bại');
    } finally {
        isLoadingOtp.value = false;
    }
};

const handleOtpInput = (value) => {
    otpCode.value = value.replace(/[^0-9]/g, '');
    clearOtpError('otp');
};

const verifyOtp = async () => {
    if (otpCode.value.length !== 6) {
        setOtpError('otp', 'Mã OTP phải có 6 chữ số');
        return;
    }

    try {
        isLoadingOtp.value = true;
        clearAllOtpErrors();

        const response = await api.apiPost('auth/register/verify', {
            email: formData.email,
            otp: otpCode.value
        });

        if (response?.success) {
            success(response.message || 'Xác thực mã OTP thành công');
            // Sau khi verify thành công, thực hiện đăng ký
            await handleRegister();
        } else {
            notifyError(response?.message || 'Mã OTP không hợp lệ');
        }
    } catch (error) {
        handleOtpValidationError(error, 'Xác thực mã OTP thất bại');
    } finally {
        isLoadingOtp.value = false;
    }
};

const resendOtp = async () => {
    if (otpTimer.remaining > 0) return;
    await sendRegistrationOtp();
};

const handleRegister = async () => {
    try {
        isLoading.value = true;
        clearAllErrors();

        const registerData = {
            ...formData,
            otp: otpCode.value
        };

        const response = await register(registerData);

        // Token is already saved in useAuth().register()
        // User data will be fetched in layout/default.vue on mount
        navigateTo('/');
    } catch (error) {
        console.error(error);
        handleValidationError(error, error.response?.data?.message);
    } finally {
        isLoading.value = false;
    }
};

// Cleanup timer on unmount
onUnmounted(() => {
    if (otpTimer.interval) {
        clearInterval(otpTimer.interval);
    }
});

const handleGoogleLogin = () => {
    if (process.client) {
        const config = useRuntimeConfig();
        const apiUrl = config.public.apiBaseUrl;
    window.location.href = `${apiUrl}/api/auth/google`;
    }
};

const handleFacebookLogin = () => {
    if (process.client) {
        const config = useRuntimeConfig();
        const apiUrl = config.public.apiBaseUrl;
    window.location.href = `${apiUrl}/api/auth/facebook`;
    }
};

const openLoginModal = () => {
    navigateTo('/auth/login');
};
</script>

<template>
<div class="main-register">
    <div class="container-register">
        <!-- Left side - Form -->
        <div class="register-left">
            <div class="register-content">
                <div class="header">
                    <div class="logo-section">
                        <div class="logo-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                <path d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                            </svg>
                        </div>
                        <span class="logo-text">TutorFind</span>
                    </div>
                    <h2>Bắt đầu hành trình học tập</h2>
                    <p>Tạo tài khoản để kết nối với hàng ngàn gia sư chất lượng</p>
                </div>

                <div class="role-selector">
                    <button :class="['role-button', { active: formData.role === ROLE_STUDENT }]" @click="formData.role = ROLE_STUDENT; resetFormData()">
                        <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Học sinh
                    </button>
                    <button :class="['role-button', { active: formData.role === ROLE_TUTOR }]" @click="formData.role = ROLE_TUTOR; resetFormData()">
                        <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Gia sư
                    </button>
                </div>

                <!-- Step 1: Registration Form -->
                <form v-if="registrationStep === 1" @submit.prevent="sendRegistrationOtp" class="register-form">
                    <div class="form-group-row">
                        <base-input v-model="formData.first_name" type="text" label="Họ" placeholder="Nguyễn" :error="getError('first_name')" @update:modelValue="clearError('first_name')" required>
                            <template #icon>
                                <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </template>
                        </base-input>

                        <base-input v-model="formData.last_name" type="text" label="Tên" placeholder="Văn A" :error="getError('last_name')" @update:modelValue="clearError('last_name')" required>
                            <template #icon>
                                <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </template>
                        </base-input>
                    </div>

                    <base-input v-model="formData.email" type="email" label="Email" placeholder="name@example.com" :error="getError('email')" @update:modelValue="clearError('email')" required>
                        <template #icon>
                            <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </template>
                    </base-input>

                    <base-input v-model="formData.phone" type="tel" label="Số điện thoại" placeholder="0912345678" :error="getError('phone')" @update:modelValue="clearError('phone')" required>
                        <template #icon>
                            <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                        </template>
                    </base-input>

                    <div class="form-group-row">
                        <base-input v-model="formData.password" type="password" label="Mật khẩu" placeholder="••••••" :error="getError('password')" @update:modelValue="clearError('password')" required>
                            <template #icon>
                                <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </template>
                        </base-input>

                        <base-input v-model="formData.passwordConfirmation" type="password" label="Xác nhận mật khẩu" placeholder="••••••" :error="getError('passwordConfirmation')" @update:modelValue="clearError('passwordConfirmation')" required>
                            <template #icon>
                                <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </template>
                        </base-input>
                    </div>

                    <div class="form-group" v-if="formData.role === ROLE_STUDENT">
                        <label>Cấp học hiện tại</label>
                        <div class="education-level">
                            <div class="level-item" v-for="level in educationLevels" :key="level.id" :class="{ 'active': formData.educationLevels === level.id }" @click="addEducationLevel(level)">
                                <div class="icon">
                                    <img :src="level.image" class="icon-md" alt="icon">
                                </div>
                                <span>{{ level.name }}</span>
                            </div>
                        </div>
                        <span v-if="getError('educationLevels')" class="error-message">{{ getError('educationLevels') }}</span>
                    </div>

                    <div class="form-group terms">
                        <label class="checkbox-container">
                            <input type="checkbox" v-model="formData.terms" required>
                            <span>Tôi đồng ý với <a href="/terms" class="link">Điều khoản dịch vụ</a> và <a href="/privacy" class="link">Chính sách bảo mật</a></span>
                        </label>
                        <span v-if="getError('terms')" class="error-message">{{ getError('terms') }}</span>
                    </div>

                    <div class="form-group">
                        <button type="submit" class="btn-lg btn-primary w-100" :disabled="isLoadingOtp">
                            <span v-if="!isLoadingOtp">Gửi mã xác thực</span>
                            <span v-else class="loading-spinner"></span>
                        </button>
                    </div>

                    <div class="divider">
                        <span>Hoặc đăng ký với</span>
                    </div>

                    <div class="social-login">
                        <button type="button" class="btn-lg btn-white google w-100" @click="handleGoogleLogin">
                            <img src="/images/google.svg" alt="Google" class="social-icon">
                            Google
                        </button>
                        <button type="button" class="btn-lg btn-white facebook w-100" @click="handleFacebookLogin">
                            <img src="/images/facebook.svg" alt="Facebook" class="social-icon">
                            Facebook
                        </button>
                    </div>

                    <p class="login-prompt">
                        Đã có tài khoản?
                        <a href="#" @click.prevent="openLoginModal">Đăng nhập</a>
                    </p>
                </form>

                <!-- Step 2: OTP Verification -->
                <div v-if="registrationStep === 2" class="otp-verification">
                    <div class="otp-header">
                        <h3>Xác thực email</h3>
                        <p>Chúng tôi đã gửi mã OTP đến email <strong>{{ formData.email }}</strong></p>
                        <p class="otp-hint">Vui lòng kiểm tra email và nhập mã OTP để hoàn tất đăng ký</p>
                    </div>

                    <form @submit.prevent="verifyOtp" class="register-form">
                        <div class="form-group">
                            <base-input
                                v-model="otpCode"
                                type="text"
                                label="Mã OTP"
                                placeholder="000000"
                                :error="getOtpError('otp')"
                                @update:modelValue="handleOtpInput"
                                maxlength="6"
                                required
                            >
                                <template #icon>
                                    <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </template>
                            </base-input>
                        </div>

                        <div class="form-group">
                            <button type="submit" class="btn-lg btn-primary w-100" :disabled="isLoadingOtp || otpCode.length !== 6 || isLoading">
                                <span v-if="!isLoadingOtp && !isLoading">Xác thực và đăng ký</span>
                                <span v-else class="loading-spinner"></span>
                            </button>
                        </div>

                        <div class="otp-actions">
                            <div v-if="otpTimer.remaining > 0" class="timer-info">
                                <p class="timer-text">Bạn có thể gửi lại mã sau <strong>{{ otpTimer.remaining }}</strong> giây</p>
                            </div>
                            <div class="resend-otp">
                                <p>
                                    Không nhận được mã?
                                    <a href="#" @click.prevent="resendOtp" :class="{ disabled: otpTimer.remaining > 0 }">
                                        Gửi lại
                                    </a>
                                </p>
                            </div>
                            <button type="button" class="btn-link" @click="registrationStep = 1">
                                ← Quay lại sửa thông tin
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Right side - Illustration -->
        <div class="register-right">
            <div class="illustration-wrapper">
                <div class="floating-elements">
                    <div class="floating-card card-1">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <span>Học mọi lúc</span>
                    </div>
                    <div class="floating-card card-2">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <span>1000+ Gia sư</span>
                    </div>
                    <div class="floating-card card-3">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <span>Đảm bảo chất lượng</span>
                    </div>
                </div>

                <div class="main-illustration">
                    <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <!-- Background circles -->
                        <circle cx="250" cy="250" r="200" fill="url(#gradient1)" opacity="0.1" />
                        <circle cx="250" cy="250" r="150" fill="url(#gradient2)" opacity="0.1" />

                        <!-- Person studying -->
                        <ellipse cx="250" cy="420" rx="120" ry="15" fill="#E5E7EB" opacity="0.5" />

                        <!-- Desk -->
                        <rect x="150" y="350" width="200" height="10" rx="5" fill="#374151" />
                        <rect x="160" y="360" width="180" height="5" rx="2" fill="#4B5563" />

                        <!-- Laptop -->
                        <rect x="200" y="310" width="100" height="60" rx="3" fill="#1F2937" />
                        <rect x="205" y="315" width="90" height="45" fill="#3B82F6" />
                        <path d="M250 335 L245 340 L255 340 Z" fill="#60A5FA" />

                        <!-- Person -->
                        <circle cx="250" cy="280" r="30" fill="#F59E0B" />
                        <path d="M250 310 Q240 340 220 350 L280 350 Q260 340 250 310" fill="#3B82F6" />
                        <rect x="218" y="340" width="15" height="60" rx="3" fill="#1E40AF" />
                        <rect x="267" y="340" width="15" height="60" rx="3" fill="#1E40AF" />

                        <!-- Books -->
                        <rect x="320" y="325" width="20" height="30" rx="2" fill="#EF4444" transform="rotate(-15 330 340)" />
                        <rect x="340" y="330" width="20" height="25" rx="2" fill="#10B981" transform="rotate(-5 350 342)" />
                        <rect x="360" y="332" width="20" height="23" rx="2" fill="#8B5CF6" transform="rotate(10 370 343)" />

                        <!-- Floating icons -->
                        <g class="floating-icon" opacity="0.7">
                            <circle cx="100" cy="150" r="25" fill="#FCD34D" />
                            <text x="100" y="160" text-anchor="middle" font-size="30" fill="#92400E">📚</text>
                        </g>
                        <g class="floating-icon" opacity="0.7">
                            <circle cx="400" cy="180" r="25" fill="#FCA5A5" />
                            <text x="400" y="190" text-anchor="middle" font-size="30" fill="#991B1B">✏️</text>
                        </g>
                        <g class="floating-icon" opacity="0.7">
                            <circle cx="120" cy="300" r="20" fill="#A7F3D0" />
                            <text x="120" y="310" text-anchor="middle" font-size="25" fill="#065F46">💡</text>
                        </g>

                        <!-- Gradients -->
                        <defs>
                            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#8B5CF6;stop-opacity:1" />
                            </linearGradient>
                            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:#F59E0B;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#EF4444;stop-opacity:1" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                <div class="illustration-text">
                    <h3>Kết nối với gia sư tốt nhất</h3>
                    <p>Hơn 10,000 học sinh đã tin tưởng và sử dụng TutorFind để tìm kiếm gia sư phù hợp</p>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<style scoped>
.main-register {
    min-height: 100vh;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    position: relative;
    overflow: hidden;
}

.main-register::before {
    content: '';
    position: absolute;
    width: 400px;
    height: 400px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    top: -200px;
    left: -200px;
    animation: float 20s infinite ease-in-out;
}

.main-register::after {
    content: '';
    position: absolute;
    width: 300px;
    height: 300px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    bottom: -150px;
    right: -150px;
    animation: float 15s infinite ease-in-out reverse;
}

@keyframes float {
    0%,
    100% {
        transform: translateY(0) translateX(0);
    }

    50% {
        transform: translateY(30px) translateX(30px);
    }
}

.container-register {
    max-width: 1200px;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    background: white;
    border-radius: 24px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    position: relative;
    z-index: 10;
}

/* Left side - Form */
.register-left {
    padding: 3rem;
    display: flex;
    align-items: center;
    background: white;
    border-radius: 24px 0 0 24px;
    overflow-y: auto;
    /* max-height: 95vh; */
}

.register-content {
    width: 100%;
    max-width: 450px;
    margin: 0 auto;
}

.logo-section {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 2rem;
}

.logo-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
}

.logo-icon svg {
    width: 24px;
    height: 24px;
}

.logo-text {
    font-size: var(--font-size-large);
    font-weight: 700;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.header {
    margin-bottom: 2rem;
}

.header h2 {
    font-size: var(--font-size-heading-4);
    font-weight: 800;
    color: var(--gray-900);
    margin-bottom: 0.5rem;
}

.header p {
    font-size: var(--font-size-base);
    color: var(--gray-500);
}

.role-selector {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 2rem;
    background: var(--gray-100);
    padding: 6px;
    border-radius: 12px;
    border: 1px solid var(--gray-300);
}

.role-button {
    padding: 0.9rem;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: var(--gray-500);
    font-weight: 600;
    font-size: var(--font-size-base);
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.role-button.active {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    color: var(--secondary-color);
    box-shadow: 0 4px 12px rgba(var(--color-primary), 0.4);
    transform: translateY(-2px);
}

.role-button:hover:not(.active) {
    background: var(--gray-100);
    color: #374151;
}

.register-form {
    display: grid;
    gap: 1.25rem;
}

.form-group-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.education-level {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
    margin-top: 0.5rem;
}

.level-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    cursor: pointer;
    gap: 0.5rem;
    border: 2px solid var(--gray-300);
    border-radius: 12px;
    padding: 1rem;
    font-size: var(--font-size-small);
    font-weight: 500;
    transition: all 0.3s ease;
    background: white;
}

.level-item:hover {
    background-color: var(--gray-100);
    border-color: var(--color-primary);
}

.level-item.active {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    border-color: var(--color-primary);
    color: white;
}

.level-item .icon {
    background: var(--gray-100);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.level-item.active .icon {
    background: rgba(255, 255, 255, 0.2);
}

.terms {
    margin-top: 0.5rem;
}

.checkbox-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-size: var(--font-size-small);
    color: #4b5563;
    font-weight: 400;
}

.checkbox-container input[type="checkbox"] {
    width: 18px;
    height: 18px;
    margin: 0;
    cursor: pointer;
    accent-color: var(--color-primary);
}

.checkbox-container .link {
    color: var(--color-primary);
    text-decoration: none;
    font-weight: 600;
}

.checkbox-container .link:hover {
    text-decoration: underline;
}

.error-message {
    color: var(--color-danger);
    font-size: var(--font-size-small);
    margin-top: 4px;
}

.loading-spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 2px solid var(--secondary-color);
    border-radius: 50%;
    border-top-color: transparent;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.divider {
    position: relative;
    text-align: center;
    margin: 1.5rem 0 1rem;
}

.divider::before,
.divider::after {
    content: '';
    position: absolute;
    top: 50%;
    width: calc(50% - 90px);
    height: 1px;
    background: var(--gray-300);
}

.divider::before {
    left: 0;
}

.divider::after {
    right: 0;
}

.divider span {
    background: var(--secondary-color);
    padding: 0 16px;
    color: var(--gray-500);
    font-size: var(--font-size-small);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.social-icon {
    width: 20px;
    height: 20px;
}

.login-prompt {
    text-align: center;
    color: #6b7280;
    margin: 1rem 0 0;
    font-size: var(--font-size-small);
}

.login-prompt a {
    color: var(--color-primary);
    text-decoration: none;
    font-weight: 600;
    transition: color 0.3s ease;
}

.login-prompt a:hover {
    color: var(--color-primary-light);
    text-decoration: underline;
}

/* Right side - Illustration */
.register-right {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    padding: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    border-radius: 0 24px 24px 0;
}

.illustration-wrapper {
    position: relative;
    width: 100%;
    max-width: 500px;
}

.floating-elements {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
}

.floating-card {
    position: absolute;
    background: rgba(255, 255, 255, 0.95);
    padding: 1rem 1.5rem;
    border-radius: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    animation: floatCard 3s ease-in-out infinite;
    z-index: 2;
}

.floating-card svg {
    width: 24px;
    height: 24px;
    color: var(--color-primary);
}

.floating-card span {
    font-weight: 600;
    color: var(--gray-700);
    font-size: 14px;
    white-space: nowrap;
}

.card-1 {
    top: 10%;
    left: -5%;
    animation-delay: 0s;
}

.card-2 {
    top: 50%;
    right: -15%;
    animation-delay: 1s;
}

.card-3 {
    bottom: 15%;
    left: -5%;
    animation-delay: 2s;
}

@keyframes floatCard {
    0%,
    100% {
        transform: translateY(0) rotate(0deg);
    }

    50% {
        transform: translateY(-20px) rotate(2deg);
    }
}

.main-illustration {
    width: 100%;
    height: auto;
    position: relative;
    z-index: 1;
}

.main-illustration svg {
    width: 100%;
    height: auto;
    filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.2));
}

.illustration-text {
    text-align: center;
    margin-top: 2rem;
    color: white;
}

.illustration-text h3 {
    font-size: var(--font-size-heading-4);
    font-weight: 800;
    margin-bottom: 0.75rem;
}

.illustration-text p {
    font-size: var(--font-size-base);
    opacity: 0.9;
    line-height: 1.6;
}

/* Custom scrollbar for form */
.register-left::-webkit-scrollbar {
    width: 8px;
}

.register-left::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}

.register-left::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    border-radius: 10px;
}

.register-left::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #5568d3 0%, #66388d 100%);
}

/* Responsive */
@media (max-width: 1024px) {
    .container-register {
        grid-template-columns: 1fr;
        max-width: 500px;
    }

    .register-right {
        display: none;
    }

    .register-left {
        padding: 2rem;
        border-radius: 24px;
    }
}

@media (max-width: 640px) {
    .main-register {
        padding: 1rem;
    }

    .register-left {
        padding: 1.5rem;
    }

    .header h2 {
        font-size: var(--font-size-heading-4);
    }

    .social-login {
        grid-template-columns: 1fr;
    }

    .role-selector {
        gap: 8px;
    }

    .form-group-row {
        grid-template-columns: 1fr;
    }

    .education-level {
        grid-template-columns: 1fr 1fr;
    }

    .container-register {
        border-radius: 16px;
    }
}

/* OTP Verification Styles */
.otp-verification {
    width: 100%;
}

.otp-header {
    text-align: center;
    margin-bottom: 2rem;
}

.otp-header h3 {
    font-size: var(--font-size-heading-4);
    font-weight: 700;
    color: var(--gray-900);
    margin-bottom: 0.75rem;
}

.otp-header p {
    font-size: var(--font-size-base);
    color: var(--gray-600);
    margin-bottom: 0.5rem;
}

.otp-header p strong {
    color: var(--gray-900);
    font-weight: 600;
}

.otp-hint {
    font-size: var(--font-size-small);
    color: var(--gray-500);
    margin-top: 0.5rem;
}

.otp-actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1rem;
}

.timer-info {
    text-align: center;
    padding: 12px;
    background: var(--gray-50);
    border-radius: 8px;
}

.timer-text {
    font-size: var(--font-size-small);
    color: var(--gray-600);
    margin: 0;
}

.timer-text strong {
    color: var(--color-primary);
    font-weight: 600;
}

.resend-otp {
    text-align: center;
}

.resend-otp p {
    font-size: var(--font-size-small);
    color: var(--gray-600);
    margin: 0;
}

.resend-otp a {
    color: var(--color-primary);
    text-decoration: none;
    font-weight: 600;
    transition: color 0.3s ease;
}

.resend-otp a:hover:not(.disabled) {
    color: var(--color-primary-light);
    text-decoration: underline;
}

.resend-otp a.disabled {
    color: var(--gray-400);
    cursor: not-allowed;
    pointer-events: none;
}

.btn-link {
    background: none;
    border: none;
    color: var(--color-primary);
    font-size: var(--font-size-small);
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    text-decoration: none;
    transition: color 0.3s ease;
}

.btn-link:hover {
    color: var(--color-primary-light);
    text-decoration: underline;
}
</style>
