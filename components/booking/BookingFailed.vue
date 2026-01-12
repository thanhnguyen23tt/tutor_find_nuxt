<script setup>
import { computed, onMounted } from 'vue'

const { error: notifyError } = useNotification()
const { formatDate, formatCurrency, showImage, formatTime } = useHelper()

const props = defineProps({
    bookingData: {
        type: Object,
        required: true,
    },
})

const bookingData = computed(() => props.bookingData || null)

const goToHome = () => navigateTo('/')
const retryBooking = () => {
    // Navigate back to the booking page or a retry mechanism
    // For now, let's go back to the tutor detail or home
    if (bookingData.value?.tutor?.uid) {
    return navigateTo(`/tutor/${bookingData.value.tutor.uid}`)
    } else {
    return navigateTo('/')
    }
}
const contactSupport = () => {
    // Navigate to contact or support page
return navigateTo('/contact')
}

</script>
<template>
<div class="booking-failed-page" v-if="bookingData?.user">
    <div class="container">
        <div class="failed-layout">
            <!-- Left Column - Main Content -->
            <div class="failed-left">
                <!-- Failed Header -->
                <div class="failed-header-container">
                    <div class="failed-header-card">
                        <div class="failed-background">
                            <div class="failed-pattern"></div>
                            <div class="failed-glow"></div>
                        </div>
                        <div class="failed-content">
                            <div class="failed-icon-container">
                                <div class="failed-icon">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </div>
                                <div class="failed-rings">
                                    <div class="ring ring-1"></div>
                                    <div class="ring ring-2"></div>
                                    <div class="ring ring-3"></div>
                                </div>
                            </div>
                            <div class="failed-text">
                                <h1 class="failed-title">
                                    <span class="title-main">Đặt lịch thất bại</span>
                                    <span class="title-accent">⚠️</span>
                                </h1>
                                <p class="failed-description">
                                    Đã có lỗi xảy ra trong quá trình xử lý yêu cầu của bạn.
                                </p>
                                <div class="failed-badge">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                         <circle cx="12" cy="12" r="10"></circle>
                                         <line x1="12" y1="8" x2="12" y2="12"></line>
                                         <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                    </svg>
                                    <span>Vui lòng thử lại</span>
                                </div>
                            </div>
                        </div>
                        <div class="error-details-section" v-if="bookingData.error_message || bookingData.note">
                             <div class="error-container">
                                <span class="error-label">Chi tiết lỗi:</span>
                                <span class="error-value">{{ bookingData.error_message || bookingData.note || 'Lỗi không xác định' }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Booking Details (What they tried to book) -->
                <div class="info-card booking-details-card">
                    <div class="card-header">Thông tin đặt lịch</div>
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

                <div class="info-card steps-card">
                    <div class="card-content">
                        <div class="actions-list">
                            <button class="btn-md w-100 btn-primary-red" @click="retryBooking">
                                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                                   <path d="M23 4v6h-6"></path>
                                   <path d="M1 20v-6h6"></path>
                                   <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                                </svg>
                                <span>Thử lại</span>
                            </button>
                            <button class="btn-md w-100 btn-secondary" @click="contactSupport">
                                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                                     <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                                <span>Liên hệ hỗ trợ</span>
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
            <div class="failed-right">
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
                            <span class="payment-status status-failed">Thất bại</span>
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
                        <div class="support-desc">Nếu bạn gặp vấn đề khi thanh toán, hãy liên hệ với chúng tôi để được hỗ trợ ngay.</div>
                        <button class="btn-md w-100 btn-secondary" @click="contactSupport">Liên hệ hỗ trợ</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<style scoped>
@import url("~/assets/css/BookingCommon.css");

/* Booking Failed Page */
.booking-failed-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #fff1f2 0%, #fff5f5 100%);
    padding: 2rem 0;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}

/* Layout */
.failed-layout {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 2rem;
    align-items: start;
}

.failed-left {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.failed-right {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    position: sticky;
    top: 2rem;
}

/* Info Cards */
.info-card {
    background: white;
    border-radius: 16px;
    border: 1px solid rgba(226, 232, 240, 0.8);
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
}

.info-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(135deg, #ef4444 0%, #fca5a5 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.info-card:hover {
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    transform: translateY(-4px);
    border-color: rgba(239, 68, 68, 0.3);
}

.info-card:hover::before {
    opacity: 1;
}

.card-header {
    font-size: 1.125rem;
    font-weight: 700;
    color: #1e293b;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid rgba(241, 245, 249, 0.8);
    background: linear-gradient(135deg, #fff 0%, #fff1f2 100%);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    position: relative;
}

.card-header::before {
    content: '';
    width: 4px;
    height: 24px;
    background: linear-gradient(135deg, #ef4444 0%, #fca5a5 100%);
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.card-content {
    padding: 2rem;
    background: linear-gradient(135deg, #ffffff 0%, #fff1f2 100%);
}

/* Failed Header Container */
.failed-header-container {
    position: relative;
    margin-bottom: 1.5rem;
}

.failed-header-card {
    position: relative;
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(239, 68, 68, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.failed-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
}

.failed-pattern {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
    background-size: 20px 20px;
    animation: patternMove 20s linear infinite;
}

.failed-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    animation: glowPulse 3s ease-in-out infinite;
}

.failed-content {
    position: relative;
    z-index: 2;
    padding: 2.5rem 2rem;
    display: flex;
    align-items: center;
    gap: 2rem;
}

.failed-icon-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.failed-icon {
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
    animation: iconShake 3s ease-in-out infinite;
}

@keyframes iconShake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.failed-rings {
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

.ring-1 { width: 100px; height: 100px; animation-delay: 0s; }
.ring-2 { width: 120px; height: 120px; animation-delay: 0.5s; }
.ring-3 { width: 140px; height: 140px; animation-delay: 1s; }

.failed-text {
    flex: 1;
    color: white;
}

.failed-title {
    font-size: 2rem;
    font-weight: 800;
    margin: 0 0 0.75rem 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    line-height: 1.2;
}

.title-main {
    background: linear-gradient(135deg, #ffffff 0%, #fee2e2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.failed-description {
    font-size: 1.125rem;
    margin: 0 0 1.5rem 0;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.6;
    font-weight: 500;
}

.failed-badge {
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
}

.error-details-section {
    position: relative;
    z-index: 2;
    padding: 0 2rem 2rem 2rem;
}

.error-container {
    display: flex;
    flex-direction: column;
    background: rgba(255, 255, 255, 0.15);
    padding: 1rem 1.25rem;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
}

.error-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 0.25rem;
}

.error-value {
    font-size: 1rem;
    color: white;
    font-weight: 500;
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
    background: linear-gradient(135deg, #ef4444 0%, #fca5a5 100%);
    transform: scaleX(0);
    transition: transform 0.3s ease;
}

.detail-item:hover {
    border-color: rgba(239, 68, 68, 0.3);
    box-shadow: 0 8px 25px rgba(239, 68, 68, 0.15);
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
    background: linear-gradient(135deg, #ef4444 0%, #fca5a5 100%);
    border-radius: 12px;
    color: white;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    transition: all 0.3s ease;
    display: none;
}

.detail-item:hover .detail-label {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
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

/* Actions */
.actions-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.btn-primary-red {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    border: none;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn-primary-red:hover {
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
}

.status-failed {
    color: #ef4444;
    font-weight: 700;
}
/* Response Design */
@media (max-width: 900px) {
    .failed-layout {
        grid-template-columns: 1fr;
    }
    
    .failed-right {
        position: static;
    }
}
</style>
