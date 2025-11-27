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
                <button class="btn-md  btn-primary" @click="handleSubmit" :disabled="isSubmitting || !selectedPaymentMethod">
                    <span v-if="isSubmitting">Đang xử lý...</span>
                    <span v-else>Thanh toán và đặt lịch <i class="fas fa-arrow-right"></i></span>
                </button>
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
    <div class="user-detail-content" :class="{ 'show': mobileUserInfoState.showUserInfo }">
        <div class="avatar-wrapper_mobile">
            <img :src="tutorInfo.avatar || tutorInfo.user_avatar || '/images/default-avatar.png'" :alt="tutorInfo.full_name" />
        </div>
        <h1 class="user-name_mobile">
            <span>{{ tutorInfo.full_name || tutorInfo.user_full_name }}</span>
            <svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <g id="Stars 3">
                    <path id="Vector" fill-rule="evenodd" clip-rule="evenodd" d="M14.1027 3.76073C13.3007 3.50073 12.6673 2.86873 12.408 2.06806C12.3193 1.79339 11.8627 1.79339 11.774 2.06806C11.5147 2.86873 10.8813 3.50073 10.0793 3.76073C9.942 3.80539 9.84866 3.93339 9.84866 4.07806C9.84866 4.22206 9.942 4.35006 10.0793 4.39473C10.88 4.65406 11.5133 5.28939 11.774 6.09406C11.818 6.23139 11.9467 6.32473 12.0907 6.32473C12.2353 6.32473 12.364 6.23139 12.408 6.09406C12.6687 5.28939 13.302 4.65406 14.1027 4.39473C14.24 4.35006 14.3333 4.22206 14.3333 4.07806C14.3333 3.93339 14.24 3.80539 14.1027 3.76073Z" fill="#5D5DEC" />
                    <path id="Vector_2" fill-rule="evenodd" clip-rule="evenodd" d="M11.716 8.26755L8.56066 7.24288L7.53666 4.08818C7.44866 3.81485 7.20466 3.63818 6.91666 3.63818C6.62799 3.63818 6.38466 3.81485 6.29599 4.08818L5.28066 7.24088L2.11932 8.26688C1.84866 8.35288 1.66666 8.60222 1.66666 8.88822C1.66666 9.17355 1.84866 9.42288 2.11799 9.50822L5.27066 10.5275L6.29599 13.6876C6.38466 13.9609 6.62799 14.1382 6.91666 14.1382C7.20466 14.1382 7.44866 13.9609 7.53666 13.6876L8.55332 10.5349L11.714 9.50888C11.9847 9.42288 12.1673 9.17355 12.1673 8.88822C12.1673 8.60222 11.9847 8.35288 11.716 8.26755Z" fill="#5D5DEC" />
                </g>
            </svg>
        </h1>
        
        <div class="description-section_mobile" v-if="tutorInfo.about_you">
            <p class="description-text">{{ tutorInfo.about_you }}</p>
        </div>

        <div class="subject-tags" v-if="tutorInfo.user_subjects">
            <span class="subject-tag" v-for="item in tutorInfo.user_subjects" :key="item.id">{{ item.subject_name }}</span>
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

@import url("~/assets/css/ConfirmBookingNew.css");
</style>
