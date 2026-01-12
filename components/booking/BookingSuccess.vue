<script setup>
import { computed, onMounted, watchEffect } from 'vue'

const { success, error: notifyError } = useNotification()
const { formatDate, formatCurrency, showImage, formatTime } = useHelper()
const { next_steps: nextSteps } = useConfig()

const props = defineProps({
    bookingData: {
        type: Object,
        required: true,
    },
})

const bookingData = computed(() => props.bookingData || null)

const copyToClipboard = async (text) => {
    if (!process.client || !navigator?.clipboard) {
        notifyError('Không thể sao chép mã đặt lịch')
        return
    }

    try {
        await navigator.clipboard.writeText(text)
        success('Đã sao chép mã đặt lịch!')
    } catch (err) {
        notifyError('Không thể sao chép mã đặt lịch')
    }
}

const goToSchedule = () => navigateTo('/booking/manager')
const goToMessages = () => navigateTo('/message')
const goToHome = () => navigateTo('/')

watchEffect(() => {
    if (process.client && !bookingData.value?.user) {
    return navigateTo('/')
    }
})

const { removeBookingData } = useBookingSession()

onMounted(() => {
    if (bookingData.value?.user) {
      	removeBookingData();
    }
})
</script>
<template>
<div class="booking-success-page" v-if="bookingData?.user">
    <div class="container">
        <div class="success-layout">
            <!-- Left Column - Main Content -->
            <div class="success-left">
                <!-- Success Header -->
                <div class="success-header-container">
                    <div class="success-header-card">
                        <div class="success-background">
                            <div class="success-pattern"></div>
                            <div class="success-glow"></div>
                        </div>
                        <div class="success-content">
                            <div class="success-icon-container">
                                <div class="success-icon">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                        <path d="m9 11 3 3L22 4"></path>
                                    </svg>
                                </div>
                                <div class="success-rings">
                                    <div class="ring ring-1"></div>
                                    <div class="ring ring-2"></div>
                                    <div class="ring ring-3"></div>
                                </div>
                            </div>
                            <div class="success-text">
                                <h1 class="success-title">
                                    <span class="title-main">Đặt lịch thành công!</span>
                                    <span class="title-accent">✨</span>
                                </h1>
                                <p class="success-description">
                                    Yêu cầu đã được gửi và đang chờ gia sư xác nhận
                                </p>
                                <div class="success-badge">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M9 12l2 2 4-4"></path>
                                        <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
                                        <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
                                    </svg>
                                    <span>Đã gửi yêu cầu</span>
                                </div>
                            </div>
                        </div>
                        <div class="booking-code-section">
                            <div class="code-header">
                                <span class="code-label">Mã đặt lịch</span>
                                <button class="copy-hint" @click="copyToClipboard(bookingData.request_code)">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                    </svg>
                                    <span>Nhấn để sao chép</span>
                                </button>
                            </div>
                            <div class="code-container" @click="copyToClipboard(bookingData.request_code)">
                                <span class="code-value">{{ bookingData.request_code }}</span>
                                <div class="copy-indicator">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Booking Details -->
                <div class="info-card booking-details-card">
                    <div class="card-header">Chi tiết đặt lịch</div>
                    <div class="card-content">
                        <div class="booking-details-grid">
                            <div class="detail-item">
                                <div class="detail-label">
                                    <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                </div>
                                <div class="detail-value">
                                    <span class="title">Gia sư</span>
                                    <span class="sub-title">{{ bookingData.tutor?.full_name }}</span>
                                </div>
                            </div>

                            <div class="detail-item">
                                <div class="detail-label">
                                    <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"></path>
                                        <path d="M22 10v6"></path>
                                        <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"></path>
                                    </svg>
                                </div>
                                <div class="detail-value">
                                    <span class="title">Môn học</span>
                                    <span class="sub-title">{{ bookingData.subject?.name }}</span>
                                </div>
                            </div>

                            <div class="detail-item">
                                <div class="detail-label">
                                    <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                                    </svg>
                                </div>
                                <div class="detail-value">
                                    <span class="title">Cấp độ</span>
                                    <span class="sub-title">{{ bookingData.education_level?.name }}</span>
                                </div>
                            </div>

                            <div class="detail-item">
                                <div class="detail-label">
                                    <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                                        <path d="M16 2v4"></path>
                                        <path d="M8 2v4"></path>
                                        <path d="M3 10h18"></path>
                                    </svg>
                                </div>
                                <div class="detail-value">
                                    <span class="title">Ngày học</span>
                                    <span class="sub-title">{{ bookingData.date ? formatDate(bookingData.date) : '' }}</span>
                                </div>
                            </div>

                            <div class="detail-item">
                                <div class="detail-label">
                                    <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 6 12 12 16 14"></polyline>
                                    </svg>
                                </div>
                                <div class="detail-value">
                                    <span class="title">Thời gian</span>
                                    <span class="sub-title">{{ `${formatTime(bookingData.start_time)} - ${formatTime(bookingData.end_time)}` }}</span>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                <!-- Next Steps -->
                <div class="info-card steps-card">
                    <div class="card-header">Các bước tiếp theo</div>
                    <div class="card-content">
                        <div class="steps-list">
                            <div class="step-item" v-for="(step, index) in nextSteps" :key="index">
                                <div class="step-number">{{ index + 1 }}</div>
                                <div class="step-content">
                                    <div class="step-title">{{ step.name }}</div>
                                    <div class="step-description">{{ step.desc }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="info-card steps-card">
                    <div class="card-content">
                        <div class="actions-list">
                            <button class="btn-md w-100 btn-secondary" @click="goToSchedule">
                                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                                    <rect x="3" y="4" width="18" height="18" rx="2" />
                                    <path d="M16 2v4" />
                                    <path d="M8 2v4" />
                                    <path d="M3 10h18" />
                                </svg>
                                <span>Xem lịch học</span>
                            </button>
                            <button class="btn-md w-100 btn-secondary" @click="goToMessages">
                                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                                <span>Nhắn tin gia sư</span>
                            </button>
                            <button class="btn-md w-100 btn-secondary" @click="goToHome">
                                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                    <polyline points="9,22 9,12 15,12 15,22"></polyline>
                                </svg>
                                <span>Về trang chủ</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Column - Sidebar -->
            <div class="success-right">
                <!-- Tutor Info -->
                <div class="info-card tutor-card">
                    <div class="card-header">Thông tin gia sư</div>
                    <div class="card-content tutor-content-horizontal">
                        <div class="tutor-avatar">
                            <img :src="showImage(bookingData.tutor?.avatar)" :alt="bookingData.tutor?.full_name" />
                        </div>
                        <div class="tutor-info-block">
                            <div class="tutor-name">{{ bookingData.tutor?.full_name }}</div>
                            <div class="tutor-rating" v-if="bookingData.tutor?.info_reviews">
                                <span class="star">
                                    <svg class="icon-md" viewBox="0 0 24 24" fill="#facc15">
                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                    </svg>
                                    {{ bookingData.tutor.info_reviews.average_rating }}
                                </span>
                                <span class="review-count">({{ bookingData.tutor.info_reviews.total_reviews }} đánh giá)</span>
                            </div>
                            <div class="tutor-location">
                                <svg class="icon-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0Z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                {{ bookingData.tutor?.address_preview }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Payment Summary -->
                <div class="info-card payment-summary-card">
                    <div class="card-header">Tóm tắt thanh toán</div>
                    <div class="card-content">
                        <div class="payment-row">
                            <span class="payment-label">Học phí</span>
                            <span class="payment-value">{{ formatCurrency(bookingData.total_price) }}</span>
                        </div>
                        <div class="payment-row">
                            <span class="payment-label">Trạng thái</span>
                            <span class="payment-status">{{ bookingData.payment?.statusText }}</span>
                        </div>
                        <div class="order-total">
                            <span class="order-label">Tổng cộng</span>
                            <span class="order-value total">{{ formatCurrency(bookingData.total_price) }}</span>
                        </div>
                    </div>
                </div>

                <!-- Support Card -->
                <div class="info-card support-card">
                    <div class="card-content support-content">
                        <div class="support-row">
                            <span class="support-title">Cần hỗ trợ?</span>
                        </div>
                        <div class="support-desc">Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn với mọi câu hỏi.</div>
                        <button class="btn-md w-100 btn-secondary">Liên hệ hỗ trợ</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<style scoped>
@import url("~/assets/css/BookingCommon.css");

/* Booking Success Page */
.booking-success-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    padding: 2rem 0;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}

/* Layout */
.success-layout {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 2rem;
    align-items: start;
}

.success-left {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.success-right {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    position: sticky;
    top: 2rem;
}

/* Success Header Container */
.success-header-container {
    position: relative;
    margin-bottom: 1.5rem;
}

.success-header-card {
    position: relative;
    background: linear-gradient(135deg, #10B995 0%, #059684 50%, #047857 100%);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(16, 185, 129, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.success-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
}

.success-pattern {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
    background-size: 20px 20px;
    animation: patternMove 20s linear infinite;
}

@keyframes patternMove {
    0% { transform: translate(0, 0); }
    100% { transform: translate(20px, 20px); }
}

.success-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    animation: glowPulse 3s ease-in-out infinite;
}

@keyframes glowPulse {
    0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
    50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.2); }
}

.success-content {
    position: relative;
    z-index: 2;
    padding: 2.5rem 2rem;
    display: flex;
    align-items: center;
    gap: 2rem;
}

.success-icon-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.success-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    color: white;
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 255, 255, 0.3);
    position: relative;
    z-index: 3;
    animation: iconFloat 3s ease-in-out infinite;
}

@keyframes iconFloat {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-5px) rotate(5deg); }
}

.success-rings {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.ring {
    position: absolute;
    top: 50%;
    left: 50%;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    animation: ringPulse 2s ease-in-out infinite;
}

.ring-1 {
    width: 100px;
    height: 100px;
    animation-delay: 0s;
}

.ring-2 {
    width: 120px;
    height: 120px;
    animation-delay: 0.5s;
}

.ring-3 {
    width: 140px;
    height: 140px;
    animation-delay: 1s;
}

@keyframes ringPulse {
    0%, 100% {
        opacity: 0.3;
        transform: translate(-50%, -50%) scale(1);
    }
    50% {
        opacity: 0.8;
        transform: translate(-50%, -50%) scale(1.1);
    }
}

.success-text {
    flex: 1;
    color: white;
}

.success-title {
    font-size: 2rem;
    font-weight: 800;
    margin: 0 0 0.75rem 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    line-height: 1.2;
}

.title-main {
    background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.title-accent {
    font-size: 1.5rem;
    animation: sparkle 2s ease-in-out infinite;
}

@keyframes sparkle {
    0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
    50% { transform: scale(1.2) rotate(180deg); opacity: 0.8; }
}

.success-description {
    font-size: 1.125rem;
    margin: 0 0 1.5rem 0;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.6;
    font-weight: 500;
}

.success-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.15);
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 600;
    color: white;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    animation: badgeGlow 2s ease-in-out infinite;
}

@keyframes badgeGlow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.3); }
    50% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.5); }
}

.booking-code-section {
    position: relative;
    z-index: 2;
    padding: 0 2rem 2rem 2rem;
}

.code-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.code-label {
    font-size: var(--font-size-small);
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
    letter-spacing: 0.5px;
}

.copy-hint {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.1);
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.2);
    cursor: pointer;
    transition: all 0.3s ease;
}

.copy-hint:hover {
    background: rgba(255, 255, 255, 0.2);
    color: white;
}

.code-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(255, 255, 255, 0.15);
    padding: 0.6rem 1.25rem;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
}

.code-container:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.code-value {
    font-size: var(--font-size-base);
    font-weight: 500;
    color: white;
    letter-spacing: 1px;
}

.copy-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    color: white;
    transition: all 0.3s ease;
}

.code-container:hover .copy-indicator {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
}

/* Booking Details */
.booking-details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
}

.detail-item {
    display: flex;
    align-items: flex-start;
    gap: 1.25rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border-radius: 12px;
    border: 1px solid rgba(226, 232, 240, 0.6);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.detail-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    transform: scaleX(0);
    transition: transform 0.3s ease;
}

.detail-item:hover {
    border-color: rgba(99, 102, 241, 0.3);
    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.15);
    transform: translateY(-3px);
}

.detail-item:hover::before {
    transform: scaleX(1);
}

.detail-label {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    border-radius: 12px;
    color: white;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    transition: all 0.3s ease;
    display: none;
}

.detail-item:hover .detail-label {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.detail-value {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    flex: 1;
}

.detail-value .title {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: #64748b;
    letter-spacing: 0.5px;
}

.detail-value .sub-title {
    font-size: var(--font-size-small);
    font-weight: 500;
    color: #1e293b;
    line-height: 1.4;
}

/* Steps */
.steps-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.step-item {
    display: flex;
    align-items: flex-start;
    gap: 1.25rem;
    position: relative;
    padding: 1.2rem 1.5rem;
    background: linear-gradient(135deg, #ffffff 0%, #fafbff 100%);
    border-radius: 12px;
    border: 1px solid rgba(226, 232, 240, 0.6);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
}

.step-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    transform: scaleX(0);
    transition: transform 0.3s ease;
}

.step-item:hover {
    border-color: var(--color-primary-light);
    transform: translateY(-3px);
}

.step-item:hover::before {
    transform: scaleX(1);
}

.step-number {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    color: black;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
    transition: all 0.3s ease;
}

.step-content {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    padding-top: 0.25rem;
}

.step-title {
    font-size: 1.0625rem;
    font-weight: 500;
    color: #1e293b;
    line-height: 1.3;
}

.step-description {
    font-size: 0.875rem;
    color: #64748b;
    line-height: 1.6;
}

/* Payment Summary */
.payment-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
    border-bottom: 1px solid rgba(241, 245, 249, 0.8);
    transition: all 0.3s ease;
}

.payment-row:hover {
    background: rgba(99, 102, 241, 0.02);
    margin: 0 -1rem;
    padding: 1rem;
    border-radius: 8px;
}

.payment-row:last-child {
    border-bottom: none;
}

/* Actions */
.actions-list {
    display: flex;
    gap: 1rem;
}

/* Responsive Design */
@media (max-width: 1024px) {
    .success-layout {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }

    .success-right {
        position: static;
    }
}

@media (max-width: 768px) {
    .booking-success-page {
        padding: 1rem 0;
    }

    .container {
        padding: 0 0.75rem;
    }

    .success-layout {
        gap: 1rem;
    }

    .success-left,
    .success-right {
        gap: 1rem;
    }

    .card-content {
        padding: 1.5rem;
    }

    .success-content {
        flex-direction: column;
        text-align: center;
        gap: 1.5rem;
        padding: 2rem 1.5rem;
    }

    .success-title {
        font-size: 1.5rem;
    }

    .success-icon {
        width: 64px;
        height: 64px;
    }

    .ring-1 {
        width: 80px;
        height: 80px;
    }

    .ring-2 {
        width: 100px;
        height: 100px;
    }

    .ring-3 {
        width: 120px;
        height: 120px;
    }

    .booking-code-section {
        padding: 0 1.5rem 1.5rem 1.5rem;
    }

    .booking-details-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }

    .detail-item {
        padding: 1.25rem;
    }

    .booking-code-section {
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
    }

    .code-container {
        padding: 0.625rem 0.875rem;
    }
}

@media (max-width: 480px) {
    .success-title {
        font-size: 1.25rem;
    }

    .success-icon {
        width: 56px;
        height: 56px;
    }

    .ring-1 {
        width: 70px;
        height: 70px;
    }

    .ring-2 {
        width: 90px;
        height: 90px;
    }

    .ring-3 {
        width: 110px;
        height: 110px;
    }

    .success-content {
        padding: 1.5rem 1rem;
        gap: 1rem;
    }

    .booking-code-section {
        padding: 0 1rem 1rem 1rem;
    }

    .code-container {
        padding: 0.875rem 1rem;
    }

    .code-value {
        font-size: var(--font-size-base);
    }

    .actions-list {
        gap: 0.75rem;
    }

    .payment-total {
        margin: 1rem -1.5rem 0 -1.5rem;
        padding: 1.25rem 1.5rem 1rem 1.5rem;
    }
}
</style>
