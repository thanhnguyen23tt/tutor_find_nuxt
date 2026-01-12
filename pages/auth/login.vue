<template>
<div class="main-login">
    <div class="container-login">
        <!-- Left side - Form -->
        <div class="login-left">
            <div class="login-content">
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
                    <h2 v-if="loginStep === 1">Chào mừng trở lại</h2>
                    <h2 v-else>Đặt lại mật khẩu</h2>
                    <p v-if="loginStep === 1">Đăng nhập để tiếp tục hành trình học tập của bạn</p>
                    <p v-else>Vui lòng làm theo các bước để đặt lại mật khẩu của bạn</p>
                </div>

                <!-- Step 1: Login Form -->
                <div v-if="loginStep === 1">
                    <div class="type-selector">
                        <button :class="['type-button', { active: formType === 'email' }]" @click="changeType('email')">
                            <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>Email</span>
                        </button>
                        <button :class="['type-button', { active: formType === 'phone' }]" @click="changeType('phone')">
                            <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span>Số điện thoại</span>
                        </button>
                    </div>

                    <form @submit.prevent="handleSubmit" class="login-form">
                    <div class="form-group" v-if="formType === 'email'">
                        <base-input v-model="formData.email" type="email" label="Email" placeholder="example@gmail.com" :error="getError('email')" @update:modelValue="clearError('email')" required>

                        </base-input>
                    </div>

                    <div class="form-group" v-if="formType === 'phone'">
                        <base-input v-model="formData.phone" type="phone" label="Số điện thoại" placeholder="0123456789" :error="getError('phone')" @update:modelValue="clearError('phone')" required>

                        </base-input>
                    </div>

                    <div class="form-group form-group-password">
                        <div class="label-group">
                            <a href="#" class="forgot-password" @click.prevent="openForgotPassword">Quên mật khẩu?</a>
                        </div>
                        <base-input v-model="formData.password" type="password" label="Mật khẩu" placeholder="Nhập mật khẩu" :error="getError('password')" @update:modelValue="clearError('password')" required>

                        </base-input>

                        <span v-if="getError('general')" class="error-message">{{ getError('general') }}</span>
                    </div>

                    <div class="form-group">
                        <button type="submit" class="btn-lg btn-primary w-100" :disabled="isLoading">
                            <span v-if="!isLoading">Đăng nhập</span>
                            <span v-else class="loading-spinner"></span>
                        </button>
                    </div>

                    <div class="divider">
                        <span>Hoặc đăng nhập với</span>
                    </div>

                    <div class="social-login">
                        <button type="button" class="btn-lg btn-white google w-100" @click="handleGoogleLogin">
                            <img src="/images/google.webp" alt="Google" class="social-icon">
                            Google
                        </button>
                        <button type="button" class="btn-lg btn-white facebook w-100" @click="handleFacebookLogin">
                            <img src="/images/facebook.webp" alt="Facebook" class="social-icon">
                            Facebook
                        </button>
                    </div>

                    <p class="register-prompt">
                        Chưa có tài khoản?
                        <a href="#" @click.prevent="openRegisterModal">Đăng ký ngay</a>
                    </p>
                </form>
                </div>

                <!-- Step 2: Forgot Password -->
                <div v-if="loginStep === 2" class="forgot-password-content">
                    <!-- Step 2.1: Enter Email -->
                    <div v-if="forgotPasswordStep === 1" class="forgot-password-step">
                        <p class="step-description">Nhập email đã đăng ký để nhận mã OTP đặt lại mật khẩu</p>
                        <form @submit.prevent="sendResetOtp" class="login-form">
                            <div class="form-group">
                                <base-input
                                    v-model="forgotPasswordData.email"
                                    type="email"
                                    label="Email"
                                    placeholder="example@gmail.com"
                                    :error="getForgotPasswordError('email')"
                                    @update:modelValue="clearForgotPasswordError('email')"
                                    required
                                >

                                </base-input>
                            </div>
                            <div class="form-group">
                                <button type="submit" class="btn-lg btn-primary" :disabled="isLoadingOtp || !forgotPasswordData.email">
                                    <span v-if="!isLoadingOtp">Gửi mã OTP</span>
                                    <span v-else class="loading-spinner"></span>
                                </button>
                            </div>
                            <div v-if="otpTimer.remaining > 0" class="timer-info">
                                <p class="timer-text">Bạn có thể gửi lại mã sau <strong>{{ otpTimer.remaining }}</strong> giây</p>
                            </div>
                            <div class="forgot-password-actions">
                                <button type="button" class="btn-link" @click="closeForgotPassword">
                                    ← Quay lại đăng nhập
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- Step 2.2: Verify OTP -->
                    <div v-if="forgotPasswordStep === 2" class="forgot-password-step">
                        <form @submit.prevent="verifyOtp" class="login-form">
                            <div class="form-group">
                                <base-input
                                    v-model="forgotPasswordData.otp"
                                    type="text"
                                    label="Mã OTP"
                                    placeholder="000000"
                                    :error="getForgotPasswordError('otp')"
                                    @update:modelValue="handleOtpInput"
                                    maxlength="6"
                                    required
                                >

                                </base-input>
                            </div>
                            <div class="form-group">
                                <button type="submit" class="btn-lg btn-primary" :disabled="isLoadingOtp || forgotPasswordData.otp.length !== 6">
                                    <span v-if="!isLoadingOtp">Xác thực</span>
                                    <span v-else class="loading-spinner"></span>
                                </button>
                            </div>
                            <div class="forgot-password-actions">
                                <div v-if="otpTimer.remaining > 0" class="timer-info">
                                    <p class="timer-text">Bạn có thể gửi lại mã sau <strong>{{ otpTimer.remaining }}</strong> giây</p>
                                </div>
                                <div class="resend-otp">
                                    <p>Không nhận được mã? <a href="#" @click.prevent="resendOtp" :class="{ disabled: otpTimer.remaining > 0 }">Gửi lại</a></p>
                                </div>
                                <button type="button" class="btn-link" @click="forgotPasswordStep = 1">← Quay lại</button>
                            </div>
                        </form>
                    </div>

                    <!-- Step 2.3: Reset Password -->
                    <div v-if="forgotPasswordStep === 3" class="forgot-password-step">
                        <form @submit.prevent="resetPassword" class="login-form">
                            <div class="form-group">
                                <base-input
                                    v-model="forgotPasswordData.password"
                                    type="password"
                                    label="Mật khẩu mới"
                                    placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
                                    :error="getForgotPasswordError('password')"
                                    @update:modelValue="clearForgotPasswordError('password')"
                                    required
                                >

                                </base-input>
                            </div>
                            <div class="form-group">
                                <base-input
                                    v-model="forgotPasswordData.password_confirmation"
                                    type="password"
                                    label="Xác nhận mật khẩu"
                                    placeholder="Nhập lại mật khẩu mới"
                                    :error="getForgotPasswordError('password_confirmation')"
                                    @update:modelValue="clearForgotPasswordError('password_confirmation')"
                                    required
                                >

                                </base-input>
                            </div>
                            <div class="form-group">
                                <button type="submit" class="btn-lg btn-primary" :disabled="isLoadingReset || !forgotPasswordData.password || !forgotPasswordData.password_confirmation">
                                    <span v-if="!isLoadingReset">Đặt lại mật khẩu</span>
                                    <span v-else class="loading-spinner"></span>
                                </button>
                            </div>
                            <div class="forgot-password-actions">
                                <button type="button" class="btn-link" @click="forgotPasswordStep = 2">← Quay lại</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- Right side - Illustration -->
        <div class="login-right">
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



<script setup>
definePageMeta({
  layout: 'auth',
  middleware: 'guest'
});

const {handleValidationError, clearError, clearAllErrors, getError } = useFormValidation();

const { login, sendResetOtp: authSendResetOtp, verifyResetOtp: authVerifyResetOtp, resetPassword: authResetPassword } = useAuth();
// const { api } = useApi(); // No longer needed directly here
const { success, error: notifyError } = useNotification();

const formType = ref('email');
const isLoading = ref(false);
const loginStep = ref(1); // 1: login form, 2: forgot password
const forgotPasswordStep = ref(1); // 1: email, 2: OTP, 3: new password
const isLoadingOtp = ref(false);
const isLoadingReset = ref(false);

const forgotPasswordData = reactive({
    email: '',
    otp: '',
    password: '',
    password_confirmation: ''
});

// Separate form validation for forgot password modal
const {
    formErrors: forgotPasswordErrors,
    handleValidationError: handleForgotPasswordValidationError,
    clearError: clearForgotPasswordError,
    clearAllErrors: clearAllForgotPasswordErrors,
    getError: getForgotPasswordError,
    setError: setForgotPasswordError
} = useFormValidation();

const formData = reactive({
    email: '',
    phone: '',
    password: '',
    remember: false
});

const otpTimer = reactive({
    remaining: 0,
    interval: null
});

const changeType = (type) => {
    formType.value = type;
    formData.email = '';
    formData.phone = '';
    clearAllErrors();
};

const handleSubmit = async () => {
    try {
        isLoading.value = true;
        clearAllErrors();
		
        await login(formData);

    return navigateTo('/');
    } catch (error) {
        handleValidationError(error, error.data.message);
    } finally {
        isLoading.value = false;
    }
};

const openRegisterModal = () => {
return navigateTo('/auth/register');
};

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

// Forgot Password Functions
const openForgotPassword = () => {
    loginStep.value = 2;
    forgotPasswordStep.value = 1;
    forgotPasswordData.email = '';
    forgotPasswordData.otp = '';
    forgotPasswordData.password = '';
    forgotPasswordData.password_confirmation = '';
    clearAllForgotPasswordErrors();
    otpTimer.remaining = 0;
    if (otpTimer.interval) {
        clearInterval(otpTimer.interval);
        otpTimer.interval = null;
    }
};

const closeForgotPassword = () => {
    loginStep.value = 1;
    forgotPasswordStep.value = 1;
    forgotPasswordData.email = '';
    forgotPasswordData.otp = '';
    forgotPasswordData.password = '';
    forgotPasswordData.password_confirmation = '';
    clearAllForgotPasswordErrors();
    otpTimer.remaining = 0;
    if (otpTimer.interval) {
        clearInterval(otpTimer.interval);
        otpTimer.interval = null;
    }
};

const sendResetOtp = async () => {
    try {
        isLoadingOtp.value = true;
        clearAllForgotPasswordErrors();

        const response = await authSendResetOtp({
            email: forgotPasswordData.email
        });

        if (response?.success) {
            success(response.message || 'Mã OTP đã được gửi đến email của bạn');
            forgotPasswordStep.value = 2;

            // Sử dụng timer từ API response
            const resendRemains = response?.data?.timers?.resend?.remains || 60;

            // Start countdown timer
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
        // Nếu bị rate limit (429), hiển thị timer nhưng vẫn xử lý validation errors
        if (error.response?.status === 429) {
            const remainingSeconds = error.response?.data?.data?.remaining_seconds ||
                                   error.response?.data?.data?.timers?.resend?.remains;

            if (remainingSeconds) {
                // Hiển thị timer khi bị rate limit
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

        // Xử lý validation errors
        handleForgotPasswordValidationError(error, 'Gửi mã OTP thất bại');
    } finally {
        isLoadingOtp.value = false;
    }
};

const handleOtpInput = (value) => {
    forgotPasswordData.otp = value.replace(/[^0-9]/g, '');
    clearForgotPasswordError('otp');
};

const resendOtp = async () => {
    if (otpTimer.remaining > 0) return;
    await sendResetOtp();
};

const verifyOtp = async () => {
    try {
        isLoadingOtp.value = true;
        clearAllForgotPasswordErrors();

        const response = await authVerifyResetOtp({
            email: forgotPasswordData.email,
            otp: forgotPasswordData.otp
        });

        if (response?.success) {
            success(response.message || 'Xác thực mã OTP thành công');
            forgotPasswordStep.value = 3;
        } else {
            notifyError(response?.message || 'Mã OTP không hợp lệ');
        }
    } catch (error) {
        handleForgotPasswordValidationError(error, 'Xác thực mã OTP thất bại');
    } finally {
        isLoadingOtp.value = false;
    }
};

const resetPassword = async () => {
    try {
        isLoadingReset.value = true;
        clearAllForgotPasswordErrors();

        if (forgotPasswordData.password !== forgotPasswordData.password_confirmation) {
            setForgotPasswordError('password_confirmation', 'Mật khẩu xác nhận không khớp');
            return;
        }

        const response = await authResetPassword({
            email: forgotPasswordData.email,
            otp: forgotPasswordData.otp,
            password: forgotPasswordData.password,
            password_confirmation: forgotPasswordData.password_confirmation
        });

        if (response?.success) {
            success(response.message || 'Đặt lại mật khẩu thành công');
            closeForgotPassword();
            // Optionally redirect to login
            setTimeout(() => {
                formData.email = forgotPasswordData.email;
                formData.password = '';
                formType.value = 'email';
            }, 500);
        } else {
            notifyError(response?.message || 'Đặt lại mật khẩu thất bại');
        }
    } catch (error) {
        handleForgotPasswordValidationError(error, 'Đặt lại mật khẩu thất bại');
    } finally {
        isLoadingReset.value = false;
    }
};

// Cleanup timer on unmount
onUnmounted(() => {
    if (otpTimer.interval) {
        clearInterval(otpTimer.interval);
    }
});
</script>


<style scoped>
@import url('~/assets/css/auth.css');
</style>