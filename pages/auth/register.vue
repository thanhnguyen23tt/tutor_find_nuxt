<script setup>
// Auto-imported: ref, computed, reactive, onUnmounted, useRouter
// Auto-imported: useFormValidation from composables/useFormValidation.js

definePageMeta({
	layout: 'auth',
	middleware: 'guest'
});

const router = useRouter();
const configStore = useConfigStore();
const { register, sendRegisterOtp, verifyRegisterOtp } = useAuth();
const { api } = useApi();
const { success, error: notifyError } = useNotification();

const educationLevels = computed(() => configStore.configuration?.education_levels || []);

const ROLE_STUDENT = 'user';
const ROLE_TUTOR = 'tutor';

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
	role: 'user',
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

		const response = await sendRegisterOtp({
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

		const response = await verifyRegisterOtp({
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

		await register(registerData);

		return navigateTo('/');
	} catch (error) {
		console.error(error);
		handleValidationError(error, error.data?.message || 'Đăng ký thất bại');
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
return navigateTo('/auth/login');
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
									<path
										d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
									<path
										d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
								</svg>
							</div>
							<span class="logo-text">TutorFind</span>
						</div>
						<h2>Bắt đầu hành trình học tập</h2>
						<p>Tạo tài khoản để kết nối với hàng ngàn gia sư chất lượng</p>
					</div>

					<div class="role-selector">
						<button :class="['role-button', { active: formData.role === ROLE_STUDENT }]"
							@click="formData.role = ROLE_STUDENT; resetFormData()">
							<svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
									d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
							</svg>
							Học sinh
						</button>
						<button :class="['role-button', { active: formData.role === ROLE_TUTOR }]"
							@click="formData.role = ROLE_TUTOR; resetFormData()">
							<svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
									d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
							</svg>
							Gia sư
						</button>
					</div>

					<!-- Step 1: Registration Form -->
					<form v-if="registrationStep === 1" @submit.prevent="sendRegistrationOtp" class="register-form">
						<div class="form-group-container">
							<base-input v-model="formData.first_name" type="text" label="Họ" placeholder="Nguyễn"
								:error="getError('first_name')" @update:modelValue="clearError('first_name')" required>

							</base-input>

							<base-input v-model="formData.last_name" type="text" label="Tên" placeholder="Văn A"
								:error="getError('last_name')" @update:modelValue="clearError('last_name')" required>

							</base-input>
						</div>

						<base-input v-model="formData.email" type="email" label="Email" placeholder="name@example.com"
							:error="getError('email')" @update:modelValue="clearError('email')" required>

						</base-input>

						<base-input v-model="formData.phone" type="tel" label="Số điện thoại" placeholder="0912345678"
							:error="getError('phone')" @update:modelValue="clearError('phone')" required>

						</base-input>

						<div class="form-group-container">
							<base-input v-model="formData.password" type="password" label="Mật khẩu"
								placeholder="••••••" :error="getError('password')"
								@update:modelValue="clearError('password')" required>

							</base-input>

							<base-input v-model="formData.passwordConfirmation" type="password"
								label="Xác nhận mật khẩu" placeholder="••••••" :error="getError('passwordConfirmation')"
								@update:modelValue="clearError('passwordConfirmation')" required>

							</base-input>
						</div>

						<div class="form-group" v-if="formData.role === ROLE_STUDENT">
							<label>Cấp học hiện tại</label>
							<div class="education-level">
								<div class="level-item" v-for="level in educationLevels" :key="level.id"
									:class="{ 'active': formData.educationLevels === level.id }"
									@click="addEducationLevel(level)">
									<div class="icon">
										<img :src="level.image" class="icon-md" alt="icon">
									</div>
									<span>{{ level.name }}</span>
								</div>
							</div>
							<span v-if="getError('educationLevels')" class="error-message">{{
								getError('educationLevels') }}</span>
						</div>

						<div class="form-group terms">
							<label class="checkbox-container">
								<input type="checkbox" v-model="formData.terms" required>
								<span>Tôi đồng ý với <a href="/terms" class="link">Điều khoản dịch vụ</a> và <a
										href="/privacy" class="link">Chính sách bảo mật</a></span>
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
								<img src="/images/google.webp" alt="Google" class="social-icon">
								Google
							</button>
							<button type="button" class="btn-lg btn-white facebook w-100" @click="handleFacebookLogin">
								<img src="/images/facebook.webp" alt="Facebook" class="social-icon">
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
								<base-input v-model="otpCode" type="text" label="Mã OTP" placeholder="000000"
									:error="getOtpError('otp')" @update:modelValue="handleOtpInput" maxlength="6"
									required>

								</base-input>
							</div>

							<div class="form-group">
								<button type="submit" class="btn-lg btn-primary w-100"
									:disabled="isLoadingOtp || otpCode.length !== 6 || isLoading">
									<span v-if="!isLoadingOtp && !isLoading">Xác thực và đăng ký</span>
									<span v-else class="loading-spinner"></span>
								</button>
							</div>

							<div class="otp-actions">
								<div v-if="otpTimer.remaining > 0" class="timer-info">
									<p class="timer-text">Bạn có thể gửi lại mã sau <strong>{{ otpTimer.remaining
											}}</strong> giây</p>
								</div>
								<div class="resend-otp">
									<p>
										Không nhận được mã?
										<a href="#" @click.prevent="resendOtp"
											:class="{ disabled: otpTimer.remaining > 0 }">
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
								<path
									d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
									stroke="currentColor" stroke-width="2" stroke-linecap="round"
									stroke-linejoin="round" />
							</svg>
							<span>Học mọi lúc</span>
						</div>
						<div class="floating-card card-2">
							<svg viewBox="0 0 24 24" fill="none">
								<path
									d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
									stroke="currentColor" stroke-width="2" stroke-linecap="round"
									stroke-linejoin="round" />
							</svg>
							<span>1000+ Gia sư</span>
						</div>
						<div class="floating-card card-3">
							<svg viewBox="0 0 24 24" fill="none">
								<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor"
									stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
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
							<rect x="320" y="325" width="20" height="30" rx="2" fill="#EF4444"
								transform="rotate(-15 330 340)" />
							<rect x="340" y="330" width="20" height="25" rx="2" fill="#10B981"
								transform="rotate(-5 350 342)" />
							<rect x="360" y="332" width="20" height="23" rx="2" fill="#8B5CF6"
								transform="rotate(10 370 343)" />

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
@import url('~/assets/css/auth.css');
</style>