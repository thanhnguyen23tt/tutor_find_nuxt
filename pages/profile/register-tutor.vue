<template>
    <div class="main-role-selection">
        <div class="container-role-selection">
            <!-- Left side - Form -->
            <div class="role-left">
                <div class="back-btn" @click="navigateTo('/profile')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 12H5"></path>
                        <path d="M12 19l-7-7 7-7"></path>
                    </svg>
                    <span>Quay lại</span>
                </div>

                <div class="role-content">
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
                        <h2>Trở thành Gia sư</h2>
                        <p>Chia sẻ kiến thức, truyền cảm hứng và kiếm thu nhập hấp dẫn</p>
                    </div>

                    <!-- Role Selection Cards -->
                    <div class="role-selection-single">
                        <!-- Tutor Card -->
                        <div class="role-card tutor-card selected">
                            <div class="role-card-icon tutor-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path
                                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h3 class="role-title">Gia sư</h3>
                            <p class="role-description">Quyền lợi khi trở thành gia sư</p>
                            <div class="role-features">
                                <div class="feature-item">
                                    <svg class="check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Tạo khóa học của riêng bạn</span>
                                </div>
                                <div class="feature-item">
                                    <svg class="check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Thu nhập linh hoạt</span>
                                </div>
                                <div class="feature-item">
                                    <svg class="check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Xây dựng thương hiệu cá nhân</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Confirm Button -->
                    <div class="form-group">
                        <button type="button" class="btn-lg btn-primary" :disabled="isLoading" @click="handleRegister">
                            <span v-if="!isLoading">Đăng ký ngay</span>
                            <span v-else class="loading-spinner"></span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Right side - Illustration -->
            <div class="role-right">
                <div class="illustration-wrapper">
                    <div class="floating-elements">
                        <div class="floating-card card-1">
                            <svg viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                    stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" />
                            </svg>
                            <span>1000+ Gia sư</span>
                        </div>
                        <div class="floating-card card-2">
                            <svg viewBox="0 0 24 24" fill="none">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor"
                                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            <span>Đảm bảo chất lượng</span>
                        </div>
                        <div class="floating-card card-3">
                            <svg viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                    stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" />
                            </svg>
                            <span>Kết nối nhanh chóng</span>
                        </div>
                    </div>

                    <div class="main-illustration">
                        <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <!-- Background circles -->
                            <circle cx="250" cy="250" r="200" fill="url(#gradient1)" opacity="0.1" />
                            <circle cx="250" cy="250" r="150" fill="url(#gradient2)" opacity="0.1" />

                            <!-- Connection Line (Center) -->
                            <line x1="150" y1="250" x2="350" y2="250" stroke="url(#connectionGradient)" stroke-width="3"
                                stroke-dasharray="5,5" opacity="0.6" />
                            <circle cx="250" cy="250" r="8" fill="url(#connectionGradient)" />

                            <!-- Left Side - Tutor -->
                            <g class="tutor-side">
                                <!-- Tutor Person -->
                                <circle cx="150" cy="250" r="35" fill="#3B82F6" />
                                <circle cx="145" cy="245" r="4" fill="white" />
                                <circle cx="155" cy="245" r="4" fill="white" />
                                <path d="M140 260 Q150 265 160 260" stroke="white" stroke-width="2" fill="none"
                                    stroke-linecap="round" />

                                <!-- Tutor Body -->
                                <path d="M150 285 Q140 320 130 340 L170 340 Q160 320 150 285" fill="#2563EB" />
                                <rect x="135" y="340" width="12" height="50" rx="3" fill="#1E40AF" />
                                <rect x="153" y="340" width="12" height="50" rx="3" fill="#1E40AF" />

                                <!-- Tutor Cap -->
                                <path d="M130 235 Q150 220 170 235 Q150 225 130 235" fill="#1E40AF" />
                                <circle cx="150" cy="230" r="3" fill="#FCD34D" />

                                <!-- Tutor Teaching Icon -->
                                <g class="tutor-icon-float">
                                    <circle cx="120" cy="200" r="20" fill="#60A5FA" opacity="0.9" />
                                    <path d="M115 195 L120 200 L125 195" stroke="white" stroke-width="2"
                                        stroke-linecap="round" stroke-linejoin="round" fill="none" />
                                </g>

                                <!-- Books for Tutor -->
                                <rect x="100" y="320" width="15" height="20" rx="2" fill="#EF4444"
                                    transform="rotate(-15 107.5 330)" />
                                <rect x="105" y="325" width="15" height="18" rx="2" fill="#10B981"
                                    transform="rotate(-10 112.5 334)" />
                            </g>

                            <!-- Right Side - Student -->
                            <g class="student-side">
                                <!-- Student Person -->
                                <circle cx="350" cy="250" r="35" fill="#F97316" />
                                <circle cx="345" cy="245" r="4" fill="white" />
                                <circle cx="355" cy="245" r="4" fill="white" />
                                <path d="M340 260 Q350 265 360 260" stroke="white" stroke-width="2" fill="none"
                                    stroke-linecap="round" />

                                <!-- Student Body -->
                                <path d="M350 285 Q340 320 330 340 L370 340 Q360 320 350 285" fill="#EA580C" />
                                <rect x="335" y="340" width="12" height="50" rx="3" fill="#C2410C" />
                                <rect x="353" y="340" width="12" height="50" rx="3" fill="#C2410C" />

                                <!-- Student Backpack -->
                                <rect x="360" y="310" width="20" height="30" rx="3" fill="#92400E" />
                                <path d="M365 310 L375 310 L380 315 L380 335 L375 340 L365 340 L360 335 Z"
                                    fill="#A16207" />

                                <!-- Student Learning Icon -->
                                <g class="student-icon-float">
                                    <circle cx="380" cy="200" r="20" fill="#FB923C" opacity="0.9" />
                                    <path d="M375 200 L380 195 L385 200 L380 205 Z" stroke="white" stroke-width="2"
                                        stroke-linecap="round" fill="white" />
                                </g>

                                <!-- Notebook for Student -->
                                <rect x="380" y="310" width="18" height="24" rx="2" fill="white"
                                    transform="rotate(15 389 322)" />
                                <line x1="385" y1="315" x2="393" y2="315" stroke="#E5E7EB" stroke-width="1" />
                                <line x1="385" y1="320" x2="393" y2="320" stroke="#E5E7EB" stroke-width="1" />
                            </g>

                            <!-- Floating Educational Icons -->
                            <g class="floating-icon" opacity="0.8">
                                <circle cx="80" cy="150" r="22" fill="#FCD34D" />
                                <path d="M80 140 L85 150 L80 155 L75 150 Z" fill="#92400E" />
                            </g>

                            <g class="floating-icon" opacity="0.8">
                                <circle cx="420" cy="150" r="22" fill="#A7F3D0" />
                                <path
                                    d="M420 138 Q425 140 420 142 Q415 140 420 142 Q420 145 420 150 Q420 155 420 157 Q425 155 420 157 Q415 155 420 157"
                                    stroke="#065F46" stroke-width="2" fill="none" />
                            </g>

                            <g class="floating-icon" opacity="0.8">
                                <circle cx="90" cy="320" r="20" fill="#FCA5A5" />
                                <path d="M85 315 L90 310 L95 315 L90 320 Z" fill="#991B1B" />
                            </g>

                            <g class="floating-icon" opacity="0.8">
                                <circle cx="410" cy="320" r="20" fill="#C7D2FE" />
                                <rect x="405" y="315" width="10" height="10" rx="1" fill="#4F46E5" />
                            </g>

                            <!-- Connection Path Elements -->
                            <g class="connection-elements">
                                <circle cx="200" cy="230" r="4" fill="#3B82F6" opacity="0.5" />
                                <circle cx="300" cy="230" r="4" fill="#F97316" opacity="0.5" />
                                <circle cx="200" cy="270" r="4" fill="#3B82F6" opacity="0.5" />
                                <circle cx="300" cy="270" r="4" fill="#F97316" opacity="0.5" />
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
                                <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
                                    <stop offset="50%" style="stop-color:#F97316;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#F97316;stop-opacity:1" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    <div class="illustration-text">
                        <h3>Bắt đầu hành trình của bạn</h3>
                        <p>Trở thành gia sư và chia sẻ kiến thức của bạn ngay hôm nay</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
definePageMeta({
	middleware: 'auth',
	layout: 'empty'
});

const userStore = useUserStore();
const { api } = useApi();
const { success, error: notifyError } = useNotification();
const isLoading = ref(false);

const handleRegister = async () => {
    try {
        isLoading.value = true;

        // Call API to update user role to Tutor
        const response = await api.apiPut('me/setting', {
            role: 'tutor'
        });

        // Update user in store
        const currentUser = userStore.getUserData;
        if (currentUser) {
            userStore.setUserData({ ...currentUser, role: 'tutor' });
        }

        // Show success message
        success('Chúc mừng! Bạn đã đăng ký trở thành gia sư thành công.');

        // Redirect to profile detail
    return navigateTo('/profile/detail');

    } catch (error) {
        console.error('Error updating role:', error);
        notifyError('Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
        isLoading.value = false;
    }
};
</script>

<style scoped>
.main-role-selection {
    min-height: 100vh;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    position: relative;
    overflow: hidden;
}

.main-role-selection::before {
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

.main-role-selection::after {
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

.container-role-selection {
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
.role-left {
    padding: 3rem;
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 24px 0 0 24px;
    position: relative;
}

.back-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: #64748b;
    cursor: pointer;
    margin-bottom: 2rem;
    font-weight: 500;
    transition: color 0.2s;
    align-self: flex-start;
}

.back-btn:hover {
    color: #1e293b;
}

.role-content {
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
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
    background-clip: text;
    -webkit-text-fill-color: transparent;
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

/* Role Selection Single */
.role-selection-single {
    margin-bottom: 2rem;
}

.role-card {
    padding: 2rem 1.5rem;
    border: 2px solid var(--gray-200);
    border-radius: 16px;
    background: white;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    position: relative;
    overflow: hidden;
}

.role-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 1;
}

.role-card.selected {
    border-color: var(--color-primary);
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
    transform: translateY(-4px);
}

.role-card.selected::before {
    opacity: 0.05;
}

.tutor-card.selected {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
    border-color: var(--color-primary);
}

.role-card-icon {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    position: relative;
    z-index: 2;
}

.tutor-icon {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    color: white;
}

.role-card-icon svg {
    width: 32px;
    height: 32px;
}

.role-title {
    font-size: var(--font-size-medium);
    font-weight: 700;
    color: var(--gray-900);
    margin: 0 0 0.5rem 0;
    position: relative;
    z-index: 2;
}

.role-description {
    font-size: 14px;
    color: var(--gray-600);
    margin: 0 0 1rem 0;
    position: relative;
    z-index: 2;
}

.role-features {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
    margin-top: auto;
    position: relative;
    z-index: 2;
}

.feature-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 13px;
    color: var(--gray-600);
    text-align: left;
    justify-content: center;
}

.check-icon {
    width: 16px;
    height: 16px;
    color: var(--color-primary);
    flex-shrink: 0;
}

.form-group {
    margin-top: 1.5rem;
}

.btn-lg {
    width: 100%;
    padding: 14px 24px;
    border: none;
    border-radius: 12px;
    font-size: var(--font-size-base);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-primary {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    color: var(--secondary-color);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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

/* Right side - Illustration */
.role-right {
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
    text-align: center;
}

.illustration-text {
    margin-top: 2rem;
    color: white;
}

.illustration-text h3 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
}

.illustration-text p {
    font-size: var(--font-size-base);
    opacity: 0.9;
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

/* SVG Animations */
.main-illustration svg .tutor-side {
    animation: tutorFloat 3s ease-in-out infinite;
    transform-origin: 150px 250px;
}

.main-illustration svg .student-side {
    animation: studentFloat 3s ease-in-out infinite;
    transform-origin: 350px 250px;
    animation-delay: 0.5s;
}

@keyframes tutorFloat {

    0%,
    100% {
        transform: translateY(0) scale(1);
    }

    50% {
        transform: translateY(-10px) scale(1.02);
    }
}

@keyframes studentFloat {

    0%,
    100% {
        transform: translateY(0) scale(1);
    }

    50% {
        transform: translateY(-10px) scale(1.02);
    }
}

.main-illustration svg .tutor-icon-float {
    animation: iconPulse 2s ease-in-out infinite;
}

.main-illustration svg .student-icon-float {
    animation: iconPulse 2s ease-in-out infinite;
    animation-delay: 0.3s;
}

@keyframes iconPulse {

    0%,
    100% {
        transform: translateY(0) scale(1);
        opacity: 0.9;
    }

    50% {
        transform: translateY(-5px) scale(1.1);
        opacity: 1;
    }
}

.main-illustration svg .floating-icon {
    animation: floatIcon 4s ease-in-out infinite;
}

.main-illustration svg .floating-icon:nth-child(1) {
    animation-delay: 0s;
}

.main-illustration svg .floating-icon:nth-child(2) {
    animation-delay: 1s;
}

.main-illustration svg .floating-icon:nth-child(3) {
    animation-delay: 2s;
}

.main-illustration svg .floating-icon:nth-child(4) {
    animation-delay: 3s;
}

@keyframes floatIcon {

    0%,
    100% {
        transform: translateY(0) rotate(0deg);
    }

    50% {
        transform: translateY(-10px) rotate(10deg);
    }
}

/* Responsive Design */
@media (max-width: 992px) {
    .container-role-selection {
        grid-template-columns: 1fr;
        max-width: 600px;
    }

    .role-left {
        border-radius: 24px 24px 0 0;
        padding: 2rem;
    }

    .role-right {
        border-radius: 0 0 24px 24px;
        padding: 2rem;
        order: -1;
        /* Show illustration first on mobile? Or maybe keep it bottom */
    }

    .floating-card {
        display: none;
        /* Hide floating cards on smaller screens to avoid clutter */
    }
}

@media (max-width: 480px) {
    .main-role-selection {
        padding: 1rem;
    }

    .role-left {
        padding: 1.5rem;
    }

    .header h2 {
        font-size: 1.5rem;
    }
}
</style>
