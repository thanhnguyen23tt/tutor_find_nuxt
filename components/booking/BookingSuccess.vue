<script setup>
import { computed, onMounted, watchEffect } from 'vue'

const { success, error: notifyError } = useNotification()
const { formatDate, formatCurrency, removeDataBooking } = useHelper()
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
        navigateTo('/')
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
                                    <span class="sub-title">{{ bookingData.time_slot?.name }}</span>
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
                            <img :src="bookingData.tutor?.avatar || '/images/default-avatar.png'" :alt="bookingData.tutor?.full_name" />
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
                        <div class="payment-total">
                            <span class="payment-label">Tổng cộng</span>
                            <span class="payment-value total">{{ formatCurrency(bookingData.total_price) }}</span>
                        </div>
                    </div>
                </div>

                <!-- Support Card -->
                <div class="info-card support-card">
                    <div class="card-content support-content">
                        <div class="support-row">
                            <span class="support-icon">
                                <svg class="icon-lg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <rect x="2" y="2" width="20" height="20" rx="5" />
                                    <path d="M8 10h.01" />
                                    <path d="M16 10h.01" />
                                    <path d="M12 16v.01" />
                                </svg>
                            </span>
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

@import url("~/assets/css/BookingSuccess.css");
</style>
