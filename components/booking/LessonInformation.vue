<script setup>
import {
    defineEmits,
    ref,
    onMounted,
    onUnmounted,
    computed,
    watch,
    nextTick,
    reactive
} from 'vue'

// ============================
// Core setup & constants
// ============================
const { handleTimeSlot, getDayOfWeek, dataIsNull, formatCurrency, formatDuration, formatDate } = useHelper()
const { order_benefits: orderBenefits } = useConfig()
const configStore = useConfigStore()
const userStore = useUserStore()

const STORAGE_KEY = 'bookingData'
const REQUIRED_FIELDS = ['subjectId', 'levelId', 'date', 'timeSlotId', 'tutorSessionId']
// ============================
// Props & Emits
// ============================
const props = defineProps({
    tutorInfo: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['next', 'back'])

// ============================
// Reactive state
// ============================
// Main booking data - using reactive for better performance
const bookingData = reactive({
    subject: {
        id: '',
        name: ''
    },
    level: {
        id: '',
        name: ''
    },
    date: '',
    time: {
        start: '',
        end: '',
        display: ''
    },
    location: '',
    hourly_price: 0,
    total_price: 0,
    note: '',
    tutorSession: null,
    tutorSessionId: ''
})

// Edit form state
const editForm = reactive({
    subjectId: '',
    levelId: '',
    date: '',
    timeSlotId: '',
    tutorSessionId: ''
})

// UI state
const uiState = reactive({
    showEditModal: true,
    isInitializing: false,
    showValidationErrors: false
})

const activeTutorSessionId = ref(null)

// Mobile user info state
const mobileUserInfoState = reactive({
    showUserInfo: false
})

// Scroll handling refs
const scrollTimer = ref(null)
const isScrolling = ref(false)

// ============================
// Computed properties (organized by concern)
// ============================

// Configuration & options
const configuration = computed(() => configStore.configuration || {})
const subjectOptions = computed(() =>
    props.tutorInfo?.user_subjects?.map(s => ({
        id: s.subject_id,
        name: s.subject_name
    })) || []
)

const allLevelOptions = computed(() => {
    const levels = []
    props.tutorInfo?.user_subjects?.forEach(subject => {
        subject.user_subject_levels?.forEach(level => {
            levels.push({
                id: level.education_level_id,
                name: level.education_level,
                subject_id: subject.subject_id
            })
        })
    })
    return levels
})

const editLevelOptions = computed(() =>
    allLevelOptions.value.filter(level => level.subject_id === editForm.subjectId)
)

const tutorSessionOptions = computed(() => configuration.value.tutor_sessions || [])


// Time-related computeds
const timeOptions = computed(() =>
    handleTimeSlot(configuration.value.time_slots || [], editForm.date)
)

const availableEditTimeSlots = computed(() => {
    if (!editForm.date || !props.tutorInfo?.user_weekly_time_slots) return []

    const dayOfWeek = getDayOfWeek(editForm.date)
    if (dayOfWeek === null) return []

    return props.tutorInfo.user_weekly_time_slots.filter(
        slot => slot.day_of_week_code === dayOfWeek && slot.is_available === null // null = trống
    )
})

const validSelectableTimes = computed(() => {
    if (!editForm.date || availableEditTimeSlots.value.length === 0) {
        return timeOptions.value.map(time => ({
            ...time,
            disabled: true
        }))
    }

    const availableIds = new Set(availableEditTimeSlots.value.map(slot => slot.time_slot_id))
    return timeOptions.value.map(timePoint => ({
        ...timePoint,
        disabled: timePoint.disabled || !availableIds.has(timePoint.id)
    }))
})

// Price & session computeds
const selectedSubject = computed(() =>
    props.tutorInfo?.user_subjects?.find(subject => subject.subject_id === bookingData.subject.id)
)

const selectedLevel = computed(() =>
    selectedSubject.value?.user_subject_levels?.find(
        level => level.education_level_id === bookingData.level.id
    )
)

const selectedTutorSession = computed(() =>
    tutorSessionOptions.value.find(session => session.id === activeTutorSessionId.value)
)

const lessonDurationHours = computed(() =>
    parseFloat(selectedTutorSession.value?.duration_hours || 0) || 0
)

const hourlyPrice = computed(() => selectedLevel.value?.price || 0)

const totalPrice = computed(() => hourlyPrice.value * lessonDurationHours.value)

// Validation
const isFormValid = computed(() =>
    REQUIRED_FIELDS.every(field => !!editForm[field])
)


const addHoursToTime = (startTime, hours) => {
    try {
        const [hour, minute] = (startTime || '00:00').split(':').map(n => parseInt(n, 10) || 0)
        const minutesToAdd = Math.round((hours || 0) * 60)
        const totalStartMinutes = hour * 60 + minute
        const totalEndMinutes = totalStartMinutes + minutesToAdd

        const endHour = Math.floor((totalEndMinutes % (24 * 60)) / 60)
        const endMinute = totalEndMinutes % 60
        const pad = (num) => String(num).padStart(2, '0')

        return `${pad(endHour)}:${pad(endMinute)}`
    } catch (error) {
        console.warn('Time calculation error:', error)
        return startTime
    }
}

const validateField = (fieldName) => {
    return uiState.showValidationErrors && !editForm[fieldName];
}

// ============================
// Storage utilities
// ============================
const sanitizeBookingData = (data) => {
    const cloned = JSON.parse(JSON.stringify(data || {}))
    if (cloned.mode) {
        delete cloned.mode
    }
    return cloned
}

const { setBookingData, getBookingData: loadBookingDataFromStorage } = useBookingSession()

const saveBookingData = (data) => {
    const sanitized = sanitizeBookingData(data)
    setBookingData(sanitized)
}

const loadBookingData = () => {
    const data = loadBookingDataFromStorage()
    return sanitizeBookingData(data)
}

// ============================
// Event handlers
// ============================
const onEditSubjectChange = (newSubjectId) => {
    editForm.subjectId = newSubjectId
    editForm.levelId = ''
    editForm.timeSlotId = ''
}

const onEditLevelChange = (newLevelId) => {
    editForm.levelId = newLevelId
    editForm.timeSlotId = ''
}

const onEditTimeSlotChange = (newTimeId) => {
    editForm.timeSlotId = newTimeId
}

const onSelectTutorSession = (sessionId) => {
    activeTutorSessionId.value = sessionId || null
    editForm.tutorSessionId = sessionId || ''
}


const loadDataEditForm = async () => {
    uiState.isInitializing = true

    editForm.subjectId = bookingData.subject.id
    editForm.levelId = bookingData.level.id
    editForm.date = bookingData.date
    editForm.timeSlotId = bookingData.time?.start || ''
    editForm.tutorSessionId = bookingData.tutorSession?.id || ''

    onSelectTutorSession(editForm.tutorSessionId)
    uiState.showEditModal = true

    await nextTick()
    uiState.isInitializing = false
}

const openEditModal = async () => {
    await loadDataEditForm()
    uiState.showEditModal = true
}

const handleEditSave = () => {
    if (!isFormValid.value) {
        uiState.showValidationErrors = true
        return
    }

    // Find selected options
    const selectedSubjectData = subjectOptions.value.find(s => s.id === editForm.subjectId)
    const selectedLevelData = allLevelOptions.value.find(l => l.id === editForm.levelId)
    const startTimeObj = timeOptions.value.find(t => t.id === editForm.timeSlotId)
    const session = tutorSessionOptions.value.find(s => s.id === activeTutorSessionId.value)
    const endTimeText = startTimeObj && session ? addHoursToTime(startTimeObj.name || startTimeObj.time, session.duration_hours || 0) : ''

    // Update booking data
    Object.assign(bookingData, {
        subject: {
            id: editForm.subjectId,
            name: selectedSubjectData?.name || ''
        },
        level: {
            id: editForm.levelId,
            name: selectedLevelData?.name || ''
        },
        date: editForm.date,
        time: {
            start: editForm.timeSlotId,
            end: endTimeText,
            display: (startTimeObj && session) ?
                `${startTimeObj.name || startTimeObj.time} - ${endTimeText}` :
                ''
        },
        tutorSession: session || null,
        tutorSessionId: session?.id || '',
        hourly_price: hourlyPrice.value,
        total_price: totalPrice.value
    })

    saveBookingData(bookingData);

    uiState.showEditModal = false
    uiState.showValidationErrors = false
}

const handleModalClose = () => {
    if (isFormValid.value) {
        uiState.showEditModal = false
    } else {
        uiState.showValidationErrors = true
    }
}

const handleNext = async () => {
    emit('next')
}

const handleBack = () => emit('back')

// ============================
// Watchers
// ============================

watch(() => editForm.date, (newDate) => {
    if (!newDate && !uiState.isInitializing) {
        editForm.timeSlotId = ''
        editForm.tutorSessionId = ''
    }
})

// Study locations removed - no watcher needed

// ============================
// Mobile user info handlers
// ============================
const handleScroll = () => {
    if (!isScrolling.value) {
        isScrolling.value = true
        mobileUserInfoState.showUserInfo = true
    }

    // Clear existing timeout
    if (scrollTimer.value) {
        clearTimeout(scrollTimer.value)
    }

    // Hide after scrolling stops (after 1.5 seconds)
    scrollTimer.value = setTimeout(() => {
        isScrolling.value = false
        // Only hide if not hovering/focused
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
    // Only hide if not scrolling
    if (!isScrolling.value) {
        scrollTimer.value = setTimeout(() => {
            mobileUserInfoState.showUserInfo = false
        }, 500)
    }
}

// ============================
// Lifecycle
// ============================
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

onMounted(async () => {
    const storedData = loadBookingData()

    if (storedData) {
        Object.assign(bookingData, storedData)
        await loadDataEditForm()
    }

    if (!process.client) {
        return
    }

    // Add scroll listener for mobile user info (only on mobile)
    checkMobileAndAddListener()

    // Handle window resize to add/remove listener
    window.addEventListener('resize', handleResize, { passive: true })
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

// ============================
// Expose for template
// ============================
defineExpose({
    bookingData,
    editForm,
    uiState,
    openEditModal,
    handleEditSave,
    handleNext,
    handleBack,
    // ... other methods that need to be exposed
})
</script>

<template>
<div class="container">
    <div class="lesson-info-layout booking-content">
        <!-- Left Column -->
        <div class="lesson-info-left">
            <!-- Thông tin buổi học -->
            <div class="info-card lesson-card">
                <div class="card-header">Thông tin buổi học</div>
                <div class="card-content">
                    <div class="lesson-details-grid">
                        <div class="lesson-detail-item">
                            <div class="detail-label">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-md">
                                    <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"></path>
                                    <path d="M22 10v6"></path>
                                    <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"></path>
                                </svg>
                            </div>
                            <div class="detail-value">
                                <span class="title">Môn học</span>
                                <span class="sub-title">{{ dataIsNull(bookingData.subject.name) }}</span>
                            </div>
                        </div>
                        <div class="lesson-detail-item">
                            <div class="detail-label">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-md">
                                    <path data-v-6304ec4f="" d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                                    <path data-v-6304ec4f="" d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                                </svg>
                            </div>
                            <div class="detail-value">
                                <span class="title">Cấp độ</span>
                                <span class="sub-title">{{ dataIsNull(bookingData.level.name) }}</span>
                            </div>
                        </div>
                        <div class="lesson-detail-item">
                            <div class="detail-label">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-md">
                                    <path d="M8 2v4"></path>
                                    <path d="M16 2v4"></path>
                                    <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                                    <path d="M3 10h18"></path>
                                </svg>
                            </div>
                            <div class="detail-value">
                                <span class="title">Ngày học</span>
                                <span class="sub-title">{{ dataIsNull(bookingData.date ? formatDate(bookingData.date) : '') }}</span>
                            </div>
                        </div>
                        <div class="lesson-detail-item">
                            <div class="detail-label">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-md">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                            </div>
                            <div class="detail-value">
                                <span class="title">Thời gian</span>
                                <span class="sub-title">{{ dataIsNull(bookingData.time.display) }}</span>
                            </div>
                        </div>
                        <div class="lesson-detail-item" v-if="bookingData.tutorSession">
                            <div class="detail-label">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-md">
                                    <rect x="3" y="4" width="18" height="16" rx="2" />
                                    <path d="M7 8h10" /></svg>
                            </div>
                            <div class="detail-value">
                                <span class="title">Loại buổi học</span>
                                <span class="sub-title">{{ bookingData.tutorSession?.name }}</span>
                            </div>
                        </div>
                    </div>
                    <button class="btn-md btn-secondary btn-edit" @click="openEditModal">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-md">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                        </svg>
                        <span>Chỉnh sửa</span>
                    </button>
                </div>
            </div>

            <!-- Thông tin cho gia sư -->
            <div class="info-card note-card">
                <div class="card-header">Ghi chú cho gia sư</div>
                <div class="card-content">
                    <div class="location-input-wrapper">
                    </div>
                    <div class="note-section">
                        <base-input v-model="bookingData.note" type="textarea" placeholder="Nhập ghi chú hoặc yêu cầu đặc biệt cho gia sư..." size="large"></base-input>
                        <div class="note-helper">Hãy cung cấp thông tin chi tiết về nhu cầu học tập để gia sư có thể chuẩn bị tốt nhất.</div>
                    </div>
                </div>
            </div>
            <div class="action">
                <button class="btn-md  btn-secondary" @click="handleBack"><i class="fas fa-arrow-left"></i> Quay lại</button>

                <button class="btn-md  btn-primary" @click="handleNext">
                    Tiếp tục <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        </div>

        <div class="lesson-info-right" v-if="tutorInfo">
            <div class="info-card tutor-card">
                <div class="card-header">Thông tin gia sư</div>
                <div class="card-content tutor-content-horizontal">
                    <div class="tutor-avatar">
                        <img :src="tutorInfo.avatar || '/images/default-avatar.png'" />
                    </div>
                    <div class="tutor-info-block">
                        <div class="tutor-name">{{ tutorInfo.full_name }}</div>
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
                                <circle cx="12" cy="10" r="3" /></svg> {{ tutorInfo.provinces_name || tutorInfo.address_preview }}</div>
                    </div>
                </div>
            </div>

            <div class="info-card order-summary-card">
                <div class="card-header">Tóm tắt đơn hàng</div>
                <div class="card-content">
                    <div class="order-row">
                        <span class="order-label">Học phí mỗi giờ</span>
                        <span class="order-value">{{ formatCurrency(hourlyPrice) }}</span>
                    </div>
                    <div class="order-row">
                        <span class="order-label">Thời lượng</span>
                        <span class="order-value">{{ formatDuration(lessonDurationHours) }}</span>
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
                                    <path d="m9 11 2 2 4-4"></path>
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
            <img :src="tutorInfo.avatar || '/images/default-avatar.png'" :alt="tutorInfo.full_name" />
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
        <button class="btn-sm btn-primary" @click="handleNext">Tiếp tục <i class="fas fa-arrow-right"></i></button>
    </div>
</div>

<base-modal :isOpen="uiState.showEditModal" title="Chỉnh sửa thông tin buổi học" description="Chỉnh sửa thông tin buổi học để phù hợp với nhu cầu của bạn" @close="handleModalClose" size="xl">
    <form @submit.prevent="handleEditSave">
        <div class="edit-grid">
            <base-date-picker v-model="editForm.date" class="col-span-2" />

            <div class="separation-2 col-span-2"></div>

			<base-select v-model="editForm.subjectId" :options="subjectOptions" label="Môn học" placeholder="Chọn môn học" @update:modelValue="onEditSubjectChange" :required="true"></base-select>

            <base-select v-model="editForm.levelId" :options="editLevelOptions" label="Cấp độ" placeholder="Chọn cấp độ" :disabled="!editForm.subjectId" @update:modelValue="onEditLevelChange" :required="true"></base-select>

			<div class="separation-2 col-span-2"></div>

            <div class="form-group col-span-2 time-select">
                <label class="label text-small">Khung giờ</label>
                <div class="time-select-grid">
                    <button v-for="t in validSelectableTimes" :key="'time-' + t.id" type="button" class="time-chip"
                    :class="{ selected: editForm.timeSlotId === t.id, disabled: t.disabled, inactive: !editForm.date || availableEditTimeSlots.length === 0 }"
                    @click="(!t.disabled && editForm.date && availableEditTimeSlots.length > 0) && onEditTimeSlotChange(t.id)">
                        {{ t.name || t.time }}
                    </button>
                </div>
                <div v-if="validateField('timeSlotId')" class="error-text">Vui lòng chọn khung giờ</div>
            </div>

            <div class="separation col-span-2"></div>

            <div class="form-group col-span-2 session-list">
                <label class="label text-small">Loại buổi học</label>
                <div class="session-list-grid">
                    <div v-for="(s, idx) in tutorSessionOptions" :key="s.id" class="session-item" :class="{ selected: activeTutorSessionId === s.id }" @click="onSelectTutorSession(s.id)">
                        <div class="left-icon" :class="{ active: activeTutorSessionId === s.id }">
                            <svg v-if="s.recommended" class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 7v14" />
                                <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" /></svg>
                            <svg v-else class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" /></svg>
                        </div>
                        <div class="content">
                            <div class="title-row">
                                <div class="title">{{ s.name }}</div>
                                <span v-if="s.recommended" class="badge">Gợi ý</span>
                            </div>
                            <div class="meta">
                                <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" /></svg>
                                <span>Thời lượng: {{ formatDuration(s.duration_hours) }}</span>
                            </div>
                            <div class="desc">{{ s.description }}</div>
                        </div>
                        <div class="right-radio">
                            <span class="radio" :class="{ checked: activeTutorSessionId === s.id }"></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button type="submit" class="btn-md btn-primary">Lưu thay đổi</button>
        </div>
    </form>
</base-modal>
</template>

<style scoped>
@import url("~/assets/css/BookingCommon.css");
@import url("~/assets/css/lessonInformation.css");
</style>
