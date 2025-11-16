<template>
<div class="container">
    <div class="lesson-info-layout booking-content">
        <!-- Left Column: Xác nhận thông tin -->
        <div class="lesson-info-left">
            <div class="info-card confirm-main-card">
                <div class="confirm-header card-header">Xác nhận thông tin đặt lịch</div>
                <div class="card-content">
                    <div class="confirm-main-row">
                        <div class="confirm-info-grid">
                            <div class="confirm-label">Môn học:</div>
                            <div class="confirm-value">{{ bookingData.subject.name }}</div>
                            <div class="confirm-label">Cấp độ:</div>
                            <div class="confirm-value">{{ bookingData.level.name }}</div>
                            <div class="confirm-label">Ngày học:</div>
                            <div class="confirm-value">{{ bookingData.date ? formatDate(bookingData.date) : '' }}</div>
                            <div class="confirm-label">Thời gian:</div>
                            <div class="confirm-value">{{ bookingData.time.display }}</div>
                            <template v-if="bookingData.tutorSession">
                                <div class="confirm-label">Loại buổi học:</div>
                                <div class="confirm-value">{{ bookingData.tutorSession.name }}</div>
                            </template>
                            <template v-if="bookingData.note">
                                <div class="confirm-label">Ghi chú:</div>
                                <div class="confirm-value">{{ bookingData.note }}</div>
                            </template>
                        </div>

						<div class="confirm-info-grid">
                            <div class="confirm-label">Hình thức:</div>
                            <div class="confirm-value">{{ bookingData.isPackage?'Đặt theo gói' : 'Tính theo giờ' }}</div>
                            <template v-if="bookingData.isPackage">
                                <div class="confirm-label">Gói học:</div>
                                <div class="confirm-value">{{ bookingData.package.name }}</div>
                                <div class="confirm-label">Số buổi học:</div>
                                <div class="confirm-value">{{ bookingData.package.number_of_lessons }} buổi</div>
                            </template>
                            <template v-else>
                                <div class="confirm-label">Thời lượng:</div>
                                <div class="confirm-value">{{ formatDuration(lessonDurationHours) }}</div>
                                <div class="confirm-label">Học phí mỗi giờ:</div>
                                <div class="confirm-value">{{ formatCurrency(hourlyPrice) }}</div>
                            </template>
                            <div class="confirm-label"><b>Tổng học phí:</b></div>
                            <div class="confirm-value"><b>{{ formatCurrency(totalPrice) }}</b></div>
                        </div>
                    </div>

                    <!-- Payment Method Selection -->
                    <div class="payment-method-section">
                        <div class="payment-method-title">Chọn phương thức thanh toán</div>
                        <div class="payment-methods-grid">
                            <div v-for="method in paymentMethods" :key="method.id" class="payment-method-item" :class="{ active: selectedPaymentMethod?.code === method.code }" @click="selectPaymentMethod(method)">
                                <div class="payment-method-icon">
                                    <img :src="method.icon" :alt="method.name" />
                                </div>
                                <div class="payment-method-info">
                                    <div class="payment-method-name">{{ method.name }}</div>
                                    <div class="payment-method-desc">{{ method.description }}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="confirm-alert">
                        <svg width="22" height="22" fill="none" stroke="#eab308" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4" />
                            <path d="M12 8h.01" />
                        </svg>
                        <span>Sau khi gửi yêu cầu đặt lịch, gia sư sẽ xem xét và phản hồi trong vòng 24 giờ. Bạn sẽ nhận được thông báo qua email khi gia sư chấp nhận yêu cầu.</span>
                    </div>
                </div>
            </div>
            <div class="action confirm-action-row">
                <button class="btn-md  btn-secondary" @click="handleBack">Quay lại</button>
                <button class="btn-md  btn-primary" @click="handleSubmit" :disabled="isSubmitting || isSelfBooking || !selectedPaymentMethod">
                    <span v-if="isSubmitting">Đang xử lý...</span>
                    <span v-else>Thanh toán và đặt lịch <i class="fas fa-arrow-right"></i></span>
                </button>
                <div v-if="isSelfBooking" class="alert alert-danger mt-2">Bạn không thể đặt lịch với chính mình!</div>
            </div>
        </div>
        <!-- Right Column giữ nguyên như các bước trước -->
        <div class="lesson-info-right" v-if="tutorInfo">
            <div class="info-card tutor-card">
                <div class="card-header">Thông tin gia sư</div>
                <div class="card-content tutor-content-horizontal">
                    <div class="tutor-avatar">
                        <img :src="tutorInfo.avatar || tutorInfo.user_avatar || '/images/default-avatar.png'" />
                    </div>
                    <div class="tutor-info-block">
                        <div class="tutor-name">{{ tutorInfo.full_name || tutorInfo.user_full_name }}</div>
                        <div class="tutor-rating" v-if="tutorInfo.info_reviews">
                            <span class="star">
                                <svg class="icon-md" viewBox="0 0 24 24" fill="#facc15">
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                                    {{ tutorInfo.info_reviews.average_rating }}
                                </span>
                            <span class="review-count">({{ tutorInfo.info_reviews.total_reviews }} đánh giá)</span>
                        </div>
                        <div class="tutor-location"><svg class="icon-md" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0Z" />
                                <circle cx="12" cy="10" r="3" /></svg> {{ tutorInfo.provinces_name || tutorInfo.address_preview || 'TP.HCM' }}</div>
                    </div>
                </div>
            </div>
            <div class="info-card order-summary-card">
                <div class="card-header">Tóm tắt đơn hàng</div>
                <div class="card-content">
                    <template v-if="bookingData.isPackage">
                        <div class="order-row">
                            <span class="order-label">Gói học</span>
                            <span class="order-value">{{ bookingData.package.name }}</span>
                        </div>
                        <div class="order-row">
                            <span class="order-label">Số buổi học</span>
                            <span class="order-value">{{ bookingData.package.number_of_lessons }} buổi</span>
                        </div>
                    </template>
                    <template v-else>
                        <div class="order-row">
                            <span class="order-label">Học phí mỗi giờ</span>
                            <span class="order-value">{{ formatCurrency(hourlyPrice) }}</span>
                        </div>
                        <div class="order-row">
                            <span class="order-label">Thời lượng</span>
                            <span class="order-value">{{ formatDuration(lessonDurationHours) }}</span>
                        </div>
                    </template>
                    <div class="order-row" v-if="selectedPaymentMethodInfo?.fee">
                        <span class="order-label">Phí thanh toán</span>
                        <span class="order-value">{{ selectedPaymentMethodInfo.fee }}</span>
                    </div>
                    <div class="order-total">
                        <span class="order-label">Tổng cộng</span>
                        <span class="order-value total">{{ formatCurrency(totalPrice) }}</span>
                    </div>
                    <div class="order-benefit-box">
                        <ul class="order-benefits">
                            <li v-for="item in orderBenefits" :key="item">
                                <svg xmlns="http://www.w3.org/2000/svg" class="icon-check" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <path d="m9 11 3 3L22 4"></path>
                                </svg>
                                {{ item }}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="info-card support-card">
                <div class="card-content support-content">
                    <div class="support-row">
                        <span class="support-icon">
                            <svg class="icon-lg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="2" y="2" width="20" height="20" rx="5" />
                                <path d="M8 10h.01" />
                                <path d="M16 10h.01" />
                                <path d="M12 16v.01" /></svg>
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

<div class="user-info_mobile"
     v-if="tutorInfo"
     :class="{ 'expanded': mobileUserInfoState.showUserInfo }"
     @mouseenter="handleMobileUserInfoHover"
     @mouseleave="handleMobileUserInfoLeave"
     @focusin="handleMobileUserInfoHover"
     @focusout="handleMobileUserInfoLeave">
    <div class="tutor-card" :class="{ 'show': mobileUserInfoState.showUserInfo }">
        <div class="tutor-content-horizontal">
            <div class="tutor-avatar">
                <img :src="tutorInfo.avatar || tutorInfo.user_avatar || '/images/default-avatar.png'" />
            </div>
            <div class="tutor-info-block">
                <div class="tutor-name">{{ tutorInfo.full_name || tutorInfo.user_full_name }}</div>
                <div class="tutor-rating">
                    <span class="star"><svg class="icon-md" viewBox="0 0 24 24" fill="#facc15">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg> {{ tutorInfo.rating || tutorInfo.user_rating || '4.9' }}</span>
                    <span class="review-count">({{ tutorInfo.review_count || tutorInfo.user_review_count || '127' }} đánh giá)</span>
                </div>
                <div class="tutor-location"><svg class="icon-md" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0Z" />
                        <circle cx="12" cy="10" r="3" /></svg> {{ tutorInfo.provinces_name || tutorInfo.address_preview || 'TP.HCM' }}</div>
            </div>
        </div>
    </div>

    <div class="user-info_mobile_action">
        <button class="btn-sm btn-secondary" @click="handleBack"><i class="fas fa-arrow-left"></i> Quay lại</button>
        <button class="btn-sm btn-primary" @click="handleSubmit" :disabled="isSubmitting || !selectedPaymentMethod">
            <span v-if="isSubmitting">Đang xử lý...</span>
            <span v-else>Hoàn tất đặt lịch <i class="fas fa-arrow-right"></i></span>
        </button>
    </div>
</div>
</template>


<script setup>
import { defineEmits, ref, onMounted, onUnmounted, computed, reactive, watch } from 'vue'
import moment from 'moment'

const { formatDate, formatDuration, formatCurrency, handleTimeSlot } = useHelper()
const { error: notifyError } = useNotification()
const { order_benefits: orderBenefits } = useConfig()

const configStore = useConfigStore()
const userStore = useUserStore()
const {createPayment, createZalopayPayment, createMomoPayment} = usePay();

const props = defineProps({
    tutorInfo: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['submit', 'back', 'next'])
const handleBack = () => emit('back')

const isSubmitting = ref(false)
const selectedPaymentMethod = ref(null)

const mobileUserInfoState = reactive({
    showUserInfo: false,
})
const scrollTimer = ref(null)
const isScrolling = ref(false)

const myUid = computed(() => userStore.getUserData?.uid)
const isSelfBooking = computed(() => props.tutorInfo?.uid === myUid.value)

const paymentMethods = computed(() => configStore.configuration.payment_methods || [])

const bookingData = ref({
    subject: {
        id: '',
        name: '',
    },
    level: {
        id: '',
        name: '',
    },
    date: '',
    time: {
        start: '',
        end: '',
        display: '',
    },
    note: '',
    tutorSession: null,
    tutorSessionId: null,
    package: null,
    hourly_price: 0,
    total_price: 0,
    isPackage: false,
})

const selectedSubject = computed(() =>
    props.tutorInfo?.user_subjects?.find((s) => s.subject_id === bookingData.value.subject.id)
)

const selectedLevel = computed(() =>
    selectedSubject.value?.user_subject_levels?.find(
        (lvl) => lvl.education_level_id === bookingData.value.level.id
    )
)

const timeOptions = computed(() =>
    handleTimeSlot(configStore.configuration.time_slots || [], bookingData.value.date)
)

const hourlyPrice = computed(() => selectedLevel.value?.price || 0)

const lessonDurationHours = computed(() => {
    const hours = bookingData.value.tutorSession?.duration_hours
    const num = parseFloat(hours)
    return Number.isFinite(num) ? num : 0
}) 

const totalPrice = computed(() => {
    if (bookingData.value.isPackage && bookingData.value.package) {
        return bookingData.value.package.price
    }
    return hourlyPrice.value * lessonDurationHours.value
})

const selectedTutorSessionId = computed(() => {
    const id = bookingData.value.tutorSession?.id
    if (!id && bookingData.value.tutorSessionId) {
        return parseInt(bookingData.value.tutorSessionId, 10) || null
    }
    return id ? parseInt(id, 10) || null : null
})

const selectedPaymentMethodInfo = computed(() =>
    paymentMethods.value.find((method) => method.code === selectedPaymentMethod.value?.code)
)

watch(
    paymentMethods,
    (methods) => {
        if (!methods?.length) return
        if (!selectedPaymentMethod.value) {
            selectedPaymentMethod.value =
                methods.find((method) => method.code === 'momo') || methods[0]
        }
    },
    { immediate: true }
)

const { getBookingData: loadBookingDataFromStorage } = useBookingSession()

const loadBookingData = () => {
    return loadBookingDataFromStorage()
}

const validateBookingData = (data) => {
    if (!data) return false

    const hasRequiredFields = !!(
        data.subject?.id &&
        data.subject?.name &&
        data.level?.id &&
        data.level?.name &&
        data.date &&
        data.time?.start &&
        data.time?.end &&
        (data.tutorSession?.id || data.tutorSessionId) &&
        data.hourly_price >= 0 &&
        data.total_price >= 0
    )

    if (!hasRequiredFields) return false

    const now = new Date()
    const currentTime = moment(now).format('HH:mm')
    const currentDate = moment(now).format('YYYY-MM-DD')
    const isToday = data.date === currentDate

    if (isToday && data.time?.start) {
        const startTimeObj = timeOptions.value.find((t) => t.id === data.time.start)
        if (startTimeObj && startTimeObj.time) {
            const slotTime = moment(startTimeObj.time, 'HH:mm').format('HH:mm')
            if (slotTime <= currentTime) {
                notifyError('Thời gian chọn đã qua, vui lòng chọn thời gian khác')
                return false
            }
        }
    }

    return true
}

const selectPaymentMethod = (method) => {
    selectedPaymentMethod.value = method
}

const redirectTo = (url) => {
    if (process.client && url) {
        window.location.href = url
    }
}

const submitVnpayPayment = async () => {
    try {
        isSubmitting.value = true
        const payload = {
            amount: totalPrice.value,
            orderInfo: 'Thanh toan booking',
            locale: 'vn',
            uid: props.tutorInfo.uid,
            subject_id: parseInt(bookingData.value.subject.id, 10),
            education_level_id: parseInt(bookingData.value.level.id, 10),
            date: bookingData.value.date,
            time_slot_id: parseInt(bookingData.value.time.start, 10),
            tutor_session_id: selectedTutorSessionId.value,
            note: bookingData.value.note || '',
            hourly_rate: hourlyPrice.value,
            duration: lessonDurationHours.value,
            total_price: totalPrice.value,
            payment_method_code: selectedPaymentMethod.value?.code,
        }

        const res = await createPayment(payload)
        if (res?.success && res?.paymentUrl) {
			navigateTo(res?.paymentUrl, { external: true })
        } else {
            notifyError(res?.message || 'Tạo thanh toán VNPAY thất bại')
        }
    } catch (error) {
        notifyError(error?.message || 'Có lỗi khi tạo thanh toán VNPAY')
    } finally {
        isSubmitting.value = false
    }
}

const submitZalopayPayment = async () => {
    try {
        isSubmitting.value = true
        const payload = {
            amount: totalPrice.value,
            orderInfo: 'Thanh toan booking',
            locale: 'vn',
            uid: props.tutorInfo.uid,
            subject_id: parseInt(bookingData.value.subject.id, 10),
            education_level_id: parseInt(bookingData.value.level.id, 10),
            date: bookingData.value.date,
            time_slot_id: parseInt(bookingData.value.time.start, 10),
            tutor_session_id: selectedTutorSessionId.value,
            note: bookingData.value.note || '',
            hourly_rate: hourlyPrice.value,
            duration: lessonDurationHours.value,
            package_id: bookingData.value.isPackage ? bookingData.value.package?.id : null,
            num_sessions: bookingData.value.isPackage ? bookingData.value.package?.number_of_lessons : null,
            total_price: totalPrice.value,
            is_package: bookingData.value.isPackage ?? null,
            study_location_id: null,
            payment_method_code: selectedPaymentMethod.value?.code,
        }

        const res = await createZalopayPayment(payload)
        if (res?.success && res?.paymentUrl) {
            navigateTo(res?.paymentUrl, { external: true })
        } else {
            notifyError(res?.message || 'Tạo thanh toán ZaloPay thất bại')
        }
    } catch (error) {
        notifyError(error?.message || 'Có lỗi khi tạo thanh toán ZaloPay')
    } finally {
        isSubmitting.value = false
    }
}

const submitMomoPayment = async () => {
    try {
        isSubmitting.value = true
        const payload = {
            amount: totalPrice.value,
            orderInfo: 'Thanh toan booking',
            locale: 'vi',
            uid: props.tutorInfo.uid,
            subject_id: parseInt(bookingData.value.subject.id, 10),
            education_level_id: parseInt(bookingData.value.level.id, 10),
            date: bookingData.value.date,
            time_slot_id: parseInt(bookingData.value.time.start, 10),
            tutor_session_id: selectedTutorSessionId.value,
            note: bookingData.value.note || '',
            hourly_rate: hourlyPrice.value,
            duration: lessonDurationHours.value,
            total_price: totalPrice.value,
            is_package: bookingData.value.isPackage ?? null,
            study_location_id: null,
            payment_method_code: selectedPaymentMethod.value?.code,
        }

        const res = await createMomoPayment(payload)
        if (res?.success && res?.paymentUrl) {
			navigateTo(res?.paymentUrl, { external: true })
        } else {
            notifyError(res?.message || 'Tạo thanh toán MoMo thất bại')
        }
    } catch (error) {
        notifyError(error?.message || 'Có lỗi khi tạo thanh toán MoMo')
    } finally {
        isSubmitting.value = false
    }
}

const paymentStrategies = {
    vnpay: submitVnpayPayment,
    zalopay: submitZalopayPayment,
    momo: submitMomoPayment,
}

const handleSubmit = () => {
    if (!selectedPaymentMethod.value) {
        notifyError('Vui lòng chọn phương thức thanh toán')
        return
    }

    if (!selectedTutorSessionId.value) {
        notifyError('Vui lòng chọn loại buổi học')
        return
    }

    const method = selectedPaymentMethod.value.code
    const fn = paymentStrategies[method]

    if (!fn) {
        notifyError('Phương thức thanh toán không hợp lệ')
        return
    }

    fn()
}

const handleScroll = () => {
    if (!isScrolling.value) {
        isScrolling.value = true
        mobileUserInfoState.showUserInfo = true
    }

    if (scrollTimer.value) {
        clearTimeout(scrollTimer.value)
    }

    scrollTimer.value = setTimeout(() => {
        isScrolling.value = false
        if (!mobileUserInfoState.showUserInfo) return
        mobileUserInfoState.showUserInfo = false
    }, 1500)
}

const handleMobileUserInfoHover = () => {
    mobileUserInfoState.showUserInfo = true
    if (scrollTimer.value) {
        clearTimeout(scrollTimer.value)
        scrollTimer.value = null
    }
}

const handleMobileUserInfoLeave = () => {
    if (!isScrolling.value) {
        scrollTimer.value = setTimeout(() => {
            mobileUserInfoState.showUserInfo = false
        }, 500)
    }
}

const checkMobileAndAddListener = () => {
    if (!process.client) return
    const isMobile = window.innerWidth <= 1024
    if (isMobile) {
        window.addEventListener('scroll', handleScroll, { passive: true })
    }
}

const handleResize = () => {
    if (!process.client) return
    window.removeEventListener('scroll', handleScroll)
    checkMobileAndAddListener()
}

onMounted(() => {
    const data = loadBookingData()

    if (validateBookingData(data)) {
        bookingData.value = {
            ...bookingData.value,
            ...data,
        }
        bookingData.value.hourly_price = hourlyPrice.value
        bookingData.value.total_price = totalPrice.value
    } else {
        handleBack()
    }

    if (process.client) {
    checkMobileAndAddListener()
    window.addEventListener('resize', handleResize, { passive: true })
    }
})

onUnmounted(() => {
    if (process.client) {
    window.removeEventListener('scroll', handleScroll)
    window.removeEventListener('resize', handleResize)
    }
    if (scrollTimer.value) {
        clearTimeout(scrollTimer.value)
    }
})
</script>


<style scoped>
@import url("~/assets/css/BookingCommon.css");

/* Modern Confirm Layout */
.confirm-main-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-bottom: 2rem;
}

.confirm-card {
    width: 100%;
    background: #fff;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
}

.confirm-card:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.confirm-info-grid {
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 1rem 1.5rem;
    font-size: var(--font-size-small);
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    padding: 1.5rem;
    border-radius: 12px;
    /* margin: 0 1.5rem 1.5rem 1.5rem; */
    border: 1px solid #e2e8f0;
}

.confirm-label {
    color: #64748b;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.confirm-value {
    color: #1e293b;
    font-weight: 600;
    text-align: right;
}

/* Modern Payment Method Styles */
.payment-method-section {
    margin: 2rem 0;
    padding: 1.5rem;
    background: #f8fafc;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
}

.payment-method-title {
    font-size: var(--font-size-medium);
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.payment-method-title::before {
    content: '';
    width: 4px;
    height: 1rem;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    border-radius: 2px;
}

.payment-methods-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
}

.payment-method-item {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    padding: 1.5rem;
    border: 2px solid #e2e8f0;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    position: relative;
    overflow: hidden;
}

.payment-method-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
    transition: all 0.3s ease;
}

.payment-method-item:hover {
    border-color: #6366f1;
    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.15);
    transform: translateY(-2px);
}

.payment-method-item:hover::before {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
}

.payment-method-item.active {
    border-color: #6366f1;
    background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%);
    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.2);
}

.payment-method-item.active::before {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
}

.payment-method-radio {
    display: flex;
    align-items: center;
    justify-content: center;
}

.radio-circle {
    width: 24px;
    height: 24px;
    border: 2px solid #cbd5e1;
    border-radius: 50%;
    position: relative;
    transition: all 0.3s ease;
    background: #fff;
}

.radio-circle.checked {
    border-color: #6366f1;
    background: #6366f1;
}

.radio-circle.checked::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    background: #fff;
    border-radius: 50%;
}

.payment-method-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
}

.payment-method-icon img {
    width: 80%;
    height: 80%;
    object-fit: contain;
}

.payment-method-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.payment-method-name {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: #1e293b;
}

.payment-method-desc {
    font-size: var(--font-size-small);
    color: #64748b;
    font-weight: 500;
}

.payment-method-fee {
    display: flex;
    align-items: center;
}

.fee-text {
    font-size: var(--font-size-small);
    color: #10b981;
    font-weight: 600;
    background: #f0fdf4;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    border: 1px solid #bbf7d0;
}

/* Modern Confirm Alert */
.confirm-alert {
    background: linear-gradient(135deg, #fefce8 0%, #fef3c7 100%);
    border: 1px solid #fde68a;
    border-radius: 16px;
    color: #92400e;
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1.5rem 1.75rem;
    margin: 2rem 0 0 0;
    font-size: var(--font-size-small);
    font-weight: 500;
    line-height: 1.6;
    box-shadow: 0 2px 8px rgba(146, 64, 14, 0.1);
}

.confirm-alert svg {
    flex-shrink: 0;
    margin-top: 0.1em;
    color: #f59e0b;
}

/* Responsive Design */
@media (max-width: 1024px) {
    .confirm-main-row {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }

    .card-content {
        padding: 1.5rem;
    }

    .lesson-info-right .order-summary-card {
        display: none;
    }

    .payment-methods-grid {
        grid-template-columns: 1fr;
    }

    .payment-method-item {
        padding: 1.25rem;
    }

    .payment-method-icon {
        width: 40px;
        height: 40px;
    }

    .confirm-info-grid {
        grid-template-columns: 1fr 0.7fr;
        gap: 0.75rem;
    }

    .confirm-value {
        text-align: left;
    }
}

@media (max-width: 768px) {
    .confirm-main-row {
        gap: 1rem;
    }

    .card-content {
        padding: 1.25rem;
    }

    .confirm-info-grid {
        margin: 0 1.25rem 1.25rem 1.25rem;
        padding: 1.25rem;
    }

    .payment-method-section {
        padding: 1.25rem;
    }

    .payment-method-item {
        padding: 1rem;
        gap: 1rem;
    }

    .payment-method-icon {
        width: 36px;
        height: 36px;
    }

    .confirm-alert {
        padding: 1.25rem 1.5rem;
    }
}
</style>
