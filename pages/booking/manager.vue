<script setup>
definePageMeta({
  middleware: [
	'auth', 
		() => {
		useLayoutStore().setHiddenFooter(true)
		}
	]
});

import { ref, computed, watch, watchEffect } from 'vue'
import SendMessage from '~/components/common/SendMessage.vue'
import ReviewModal from '~/components/booking/ReviewModal.vue'
import ComplaintModal from '~/components/booking/ComplaintModal.vue'
import BookingListTutor from '~/components/booking/BookingListTutor.vue'
import BookingListStudent from '~/components/booking/BookingListStudent.vue'

const router = useRouter()
const { api } = useApi()
const { success, error: notifyError } = useNotification()
const { status_booking: statusBooking } = useConfig()
const configStore = useConfigStore()
const userStore = useUserStore()
const {
    getFirstCharacterOfLastName,
    formatDateTime,
    formatDuration,
    formatCurrency,
    getDayOfWeek,
} = useHelper()

const createButton = (label, icon, className, handler, disabled = false) => ({
    label,
    icon,
    class: className,
    handler,
    disabled
})

const createButtonPrimary = (label, icon, handler, disabled = false) => createButton(label, icon, 'btn-primary', handler, disabled)
const createButtonSecondary = (label, icon, handler, disabled = false) => createButton(label, icon, 'btn-secondary', handler, disabled)

// STATE
const search = ref('')
const status = ref('all')
const currentPage = ref(1)
const isLoading = ref(false)

const bookings = ref([])
const dataPaginate = ref({})
const statusMap = computed(() => configStore.configuration.booking_status || {})
const listStatusComplaint = computed(() => configStore.configuration.booking_complaint_status || {})
const listComplaintTypes = computed(() => configStore.configuration.complaint_types || [])

const modals = ref({
    reject: false,
    sendMessage: false,
    logs: false,
    complaint: false,
    review: false,
    reschedule: false,
    confirmCancel: false,
    confirmReject: false,
    refund: false,
    profile: false
})

const selected = ref({
    user: null,
    logs: [],
    booking: null,
    bookingForReview: null,
    bookingForReschedule: null,
    rejectId: null,
    bookingForCancel: null,
    bookingForReject: null,
    bookingForRefund: null,
    profileUser: null
})

const forms = ref({
    reject: {
        note: ''
    },
    cancel: {
        note: ''
    },
    reschedule: {
        new_date: '',
        new_time_slot_id: '',
        note: ''
    },
    refund: {
        reason: '',
        bank_account: '',
        account_holder: '',
        bank_name: ''
    }
})

const existingReview = ref(null)
const tutorWeeklyTimeSlots = ref([])

const processBookingsResponse = (response) => {
    bookings.value = [...(response?.data || [])]
    dataPaginate.value = response?.meta || {}
    if (response?.list_status) {
        statusMap.value = response.list_status
    }
}

const fetchBookings = async (page = 1, overrides = {}) => {
    const params = { page }
    const statusValue = overrides.status ?? status.value
    const searchValue = overrides.search ?? search.value

    if (statusValue && statusValue !== 'all') {
        params.status = statusValue
    }

    if (searchValue && searchValue.trim()) {
        params.code = searchValue.trim()
    }

    const res = await api.apiGet('bookings', params)
    if (!res?.success) {
        throw new Error(res?.message || 'Tải danh sách đặt lịch thất bại')
    }
    return res
}

const isInitialLoading = ref(true)
const initialError = ref(null)

try {
    const initialResponse = await fetchBookings(currentPage.value, { status: 'all', search: '' })
    processBookingsResponse(initialResponse)
} catch (error) {
    initialError.value = error
} finally {
    isInitialLoading.value = false
}

watchEffect(() => {
    if (process.client && initialError.value) {
        notifyError(initialError.value.message || 'Không thể tải danh sách đặt lịch')
    }
})

const isPageLoading = computed(() => isLoading.value || isInitialLoading.value)

// COMPUTED
const userData = computed(() => userStore.getUserData)
const isTutor = computed(() => userData.value.role === 1)
const tabs = computed(() => statusMap.value)



const availableRescheduleTimeSlots = computed(() => {
    if (!forms.value.reschedule.new_date || !tutorWeeklyTimeSlots.value.length) return []

    const dayOfWeek = getDayOfWeek(forms.value.reschedule.new_date)
    if (dayOfWeek === null) return []

    const timeSlots = configStore.configuration.time_slots || []
    const availableSlots = tutorWeeklyTimeSlots.value.filter(slot => slot.code == dayOfWeek)
    const availableIds = new Set(availableSlots.map(slot => slot.time_slot_id))

    return timeSlots.map(timePoint => ({
        ...timePoint,
        disabled: timePoint.disabled || !availableIds.has(timePoint.id)
    }))
})

const ACTION_CONFIG = computed(() => {
    const createConfirmedButton = (label = 'Đã xác nhận', icon = 'check') =>
        createButtonSecondary(label, icon, null, true);

    const canConfirmReschedule = (booking) =>
        booking.user_booking_reschedule &&
        booking.user_booking_reschedule.uid !== userData.value.uid;

    const baseActions = {
        [statusBooking.confirmed]: {
            primary: createButtonPrimary('Xem lớp học', 'classroom', (b) => goToClassRoom(b.id))
        },
        [statusBooking.both_missed]: {
            primary: createButtonPrimary('Hoàn tiền', 'refund', (b) => openRefundModal(b)),
            secondary: createButtonSecondary(
                (b) => b.user_booking_complaint ? 'Xem khiếu nại' : 'Khiếu nại',
                'alert',
                (b) => openComplaintModal(b)
            )
        },
        [statusBooking.rejected]: {
            primary:  createButtonSecondary('Đã từ chối', 'cancel', null, true)
        },
        [statusBooking.cancelled]: {
            primary: createButtonSecondary('Đã bị hủy', 'x', null, true)
        }
    };

    // Tutor-specific actions
    const tutorActions = {
        ...baseActions,
        [statusBooking.pending]: {
            primary: createButtonPrimary('Xác nhận', 'check', (b) => changeBookingStatus(b.id, 'confirmed')),
            showReject: true,
            showReschedule: true
        },
        [statusBooking.request_rescheduled]: {
            primary: (b) => canConfirmReschedule(b)
                ? createButtonPrimary('Xác nhận', 'check', () => confirmReschedule(b.user_booking_reschedule.id))
                : null,
            showReject: canConfirmReschedule
        },
        [statusBooking.confirme_completed]: {
            primary: (b) => b.tutor_confrim
                ? createConfirmedButton()
                : createButtonPrimary('Hoàn thành', 'check', (booking) => changeBookingStatus(booking.id, 'completed'))
        }
    };

    // User-specific actions (override một số từ tutorActions)
    const userActions = {
        ...baseActions,
        [statusBooking.pending]: {
            showReschedule: true,
            showCancelled: true
        },
        [statusBooking.confirme_completed]: {
            primary: (b) => b.user_confrim
                ? createConfirmedButton()
                : createButtonPrimary('Hoàn thành', 'check', (booking) => changeBookingStatus(booking.id, 'completed'))
        },
        [statusBooking.completed]: {
            primary: createButtonPrimary(
                (b) => b.review ? 'Xem đánh giá' : 'Đánh giá',
                'star',
                (b) => openReviewModal(b)
            ),
            secondary: baseActions[statusBooking.both_missed].secondary
        }
    };

    return isTutor.value ? tutorActions : userActions;
})



const getStatusClass = (status) => {
    const statusClasses = {
        [statusBooking.pending]: 'status-pending',
        [statusBooking.confirmed]: 'status-confirmed',
        [statusBooking.completed]: 'status-completed',
        [statusBooking.cancelled]: 'status-cancelled',
        [statusBooking.rejected]: 'status-rejected',
        [statusBooking.both_missed]: 'status-missed'
    }
    return statusClasses[status] || 'status-default'
}

const resetModal = (modalName) => {
    modals.value[modalName] = false

    const resetMap = {
        reject: () => {
            forms.value.reject = { note: '' };
            selected.value.rejectId = null
        },
        sendMessage: () => {
            selected.value.user = null
        },
        logs: () => {
            selected.value.logs = []
        },
        complaint: () => {
            selected.value.booking = null
        },
        review: () => {
            selected.value.bookingForReview = null
        },
        reschedule: () => {
            forms.value.reschedule = {
                new_date: '',
                new_time_slot_id: '',
                note: ''
            }
            selected.value.bookingForReschedule = null
            tutorWeeklyTimeSlots.value = []
        },
        confirmCancel: () => {
            forms.value.cancel = { note: '' }
            selected.value.bookingForCancel = null
        },
        confirmReject: () => {
            forms.value.reject = { note: '' }
            selected.value.bookingForReject = null
        },
        refund: () => {
            forms.value.refund = {
                reason: '',
                bank_account: '',
                account_holder: '',
                bank_name: ''
            }
            selected.value.bookingForRefund = null
        },
        profile: () => {
            selected.value.profileUser = null
        }
    }

    resetMap[modalName] ?.()
}

// API CALLS
const changePage = async (page) => {
    isLoading.value = true
    try {
        currentPage.value = page
        const res = await fetchBookings(page)
        processBookingsResponse(res)
    } catch (error) {
        notifyError(error?.message || 'Không thể tải danh sách đặt lịch')
    } finally {
        isLoading.value = false
    }
}

const changeBookingStatus = async (id, newStatus, note = null) => {
    try {
        const payload = {
            id,
            status: newStatus
        }
        if (note) payload.note = note

        const res = await api.apiPost('bookings/change-status', payload)
        if (res.success) {
            success(res.message)
            changePage(currentPage.value)
        }
    } catch (e) {
        notifyError(e.message)
    }
}

const confirmReschedule = async (id) => {
    try {
        const res = await api.apiPost('bookings/confirm-reschedule', {
            reschedule_id: id,
            action: 'approved',
        })
        if (res.success) {
            success(res.message)
            changePage(currentPage.value)
        }
    } catch (e) {
        notifyError(e.message)
    }
}

// MODAL HANDLERS
const openLogsModal = (logs) => {
    selected.value.logs = logs || []
    modals.value.logs = true
}

const openRejectConfirmation = (booking) => {
    selected.value.bookingForReject = booking
    modals.value.confirmReject = true
}

const openCancelConfirmation = (booking) => {
    selected.value.bookingForCancel = booking
    modals.value.confirmCancel = true
}

const openRescheduleModal = async (booking) => {
    selected.value.bookingForReschedule = booking
    forms.value.reschedule = {
        new_date: '',
        new_time_slot_id: '',
        note: ''
    }

    try {
        const res = await api.apiGet(`bookings/${booking.id}/reschedule-info`)
        if (res.success && res.can_reschedule) {
            tutorWeeklyTimeSlots.value = res.data.user_weekly_time_slots || []
            modals.value.reschedule = true
        } else {
            notifyError(res.message)
        }
    } catch (error) {
        notifyError(error.message)
    }
}

const openSendMessageModal = (user) => {
    selected.value.user = user
    modals.value.sendMessage = true
}

const openReviewModal = (booking) => {
    selected.value.bookingForReview = booking
    existingReview.value = booking.review
    modals.value.review = true
}

const openComplaintModal = (booking) => {
    selected.value.booking = booking
    modals.value.complaint = true
}

const openRefundModal = (booking) => {
    selected.value.bookingForRefund = booking
    forms.value.refund = {
        reason: '',
        bank_account: '',
        account_holder: '',
        bank_name: ''
    }
    modals.value.refund = true
}

const openProfileModal = (user) => {
	console.log(user)
    selected.value.profileUser = user
    modals.value.profile = true
}

const submitReject = async () => {
    if (!forms.value.reject.note.trim()) return
    const type = isTutor.value ? statusBooking.rejected : statusBooking.cancelled
    await changeBookingStatus(selected.value.rejectId, type, forms.value.reject.note)
    resetModal('reject')
}


const confirmCancel = async () => {
    if (!forms.value.cancel.note.trim()) {
        notifyError('Vui lòng nhập lý do hủy lịch học')
        return
    }
    if (!selected.value.bookingForCancel) return

    await changeBookingStatus(selected.value.bookingForCancel.id, statusBooking.cancelled, forms.value.cancel.note)
    resetModal('confirmCancel')
}

const confirmReject = async () => {
    if (!forms.value.reject.note.trim()) {
        notifyError('Vui lòng nhập lý do từ chối lịch học')
        return
    }
    if (!selected.value.bookingForReject) return

    await changeBookingStatus(selected.value.bookingForReject.id, statusBooking.rejected, forms.value.reject.note)
    resetModal('confirmReject')
}

const submitReschedule = async () => {
    if (!forms.value.reschedule.new_date || !forms.value.reschedule.new_time_slot_id || !forms.value.reschedule.note.trim()) {
        notifyError('Vui lòng điền đầy đủ thông tin: ngày, khung giờ và lý do chuyển lịch')
        return
    }

    try {
        const payload = {
            booking_id: selected.value.bookingForReschedule.id,
            ...forms.value.reschedule
        }
        const res = await api.apiPost('bookings/request-reschedule', payload)
        if (res.success) {
            success(res.message)
            resetModal('reschedule')
            changePage(currentPage.value)
        } else {
            notifyError(res.message)
        }
    } catch (error) {
        notifyError('Gửi yêu cầu chuyển lịch thất bại')
    }
}


const handleMessageSent = () => {
    resetModal('sendMessage')
    success('Gửi tin nhắn thành công!')
}

const handleReviewSubmitted = (reviewData) => {
    const bookingIndex = bookings.value.findIndex(b => b.id === selected.value.bookingForReview.id)
    if (bookingIndex !== -1) {
        bookings.value[bookingIndex].review = reviewData
    }
    resetModal('review')
}

const handleComplaintSubmitted = (complaintData) => {
    const bookingIndex = bookings.value.findIndex(b => b.id === selected.value.booking.id)
    if (bookingIndex !== -1) {
        // Format complaint data to match the structure expected by the UI (same as UserBookingResource format)
        bookings.value[bookingIndex].user_booking_complaint = {
            id: complaintData.id,
            status: complaintData.status,
            statusText: listStatusComplaint.value[complaintData.status] || complaintData.status,
            description: complaintData.description,
            evidence: complaintData.evidence || [],
            created_at: complaintData.created_at,
            complaint_expected_date: complaintData.complaint_expected_date,
            user: complaintData.reported_by ? {
                uid: complaintData.reported_by.uid,
                full_name: complaintData.reported_by.full_name
            } : null,
            complaint_type: complaintData.complaint_type_label || complaintData.complaint_type
        }
    }
    resetModal('complaint')
}

const goToClassRoom = (bookingId) => {
    const routeData = router.resolve({
        name: 'classroom-manager',
        query: {
            booking_id: bookingId
        }
    })
    window.open(routeData.href, '_blank')
}

// COMPUTED - Modal states
const showRejectModal = computed({
    get: () => modals.value.reject,
    set: (val) => modals.value.reject = val
})
const showSendMessageModal = computed({
    get: () => modals.value.sendMessage,
    set: (val) => modals.value.sendMessage = val
})
const showLogsModal = computed({
    get: () => modals.value.logs,
    set: (val) => modals.value.logs = val
})
const showComplaintModal = computed({
    get: () => modals.value.complaint,
    set: (val) => modals.value.complaint = val
})
const showReviewModal = computed({
    get: () => modals.value.review,
    set: (val) => modals.value.review = val
})
const showRescheduleModal = computed({
    get: () => modals.value.reschedule,
    set: (val) => modals.value.reschedule = val
})
const showProfileModal = computed({
    get: () => modals.value.profile,
    set: (val) => modals.value.profile = val
})

const noteCancelled = computed({
    get: () => forms.value.reject.note,
    set: (val) => forms.value.reject.note = val
})
const rescheduleFormData = computed({
    get: () => forms.value.reschedule,
    set: (val) => forms.value.reschedule = val
})
const selectedUser = computed(() => selected.value.user)
const selectedLogs = computed(() => selected.value.logs)
const selectedBooking = computed(() => selected.value.booking)
const selectedBookingForReview = computed(() => selected.value.bookingForReview)
const selectedBookingForReschedule = computed(() => selected.value.bookingForReschedule)

// WATCHERS & LIFECYCLE
watch(status, () => changePage(1))
watch(search, () => changePage(1))
watch(() => forms.value.reschedule.new_date, (newDate) => {
    if (newDate) forms.value.reschedule.new_time_slot_id = ''
})
</script>

<template>
<base-loading v-if="isPageLoading" />

<BasePageError v-else-if="initialError" :message="initialError.message || 'Không thể tải danh sách đặt lịch'" />

<div class="booking-manager-page" v-else>
    <div class="container">
        <h1 class="title-header">Danh sách đặt lịch học</h1>
        <p class="desc">Quản lý và theo dõi tất cả các buổi học của bạn</p>

        <div class="booking-manager-toolbar">
            <base-input v-model="search" placeholder="Tìm kiếm theo tên gia sư, môn học hoặc mã đặt lịch..."></base-input>
        </div>

        <base-status-tabs v-model="status" :tabs="tabs" />

        <div v-if="bookings.length === 0" class="empty-list">
            <div class="empty-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M8 2v4" />
                    <path d="M16 2v4" />
                    <rect width="18" height="18" x="3" y="4" rx="2" />
                    <path d="M3 10h18" />
                </svg>
            </div>
            <p class="empty-desc">Không có lịch học nào.</p>
        </div>

        <!-- Booking List Components -->
        <BookingListTutor 
            v-if="isTutor" 
            :bookings="bookings" 
            :statusBooking="statusBooking" 
            :isTutor="isTutor" 
            :actionConfig="ACTION_CONFIG" 
            :userData="userData" 
            @openLogsModal="openLogsModal" 
            @openRejectConfirmation="openRejectConfirmation" 
            @openCancelConfirmation="openCancelConfirmation" 
            @openRescheduleModal="openRescheduleModal" 
            @openSendMessageModal="openSendMessageModal" 
            @openProfileModal="openProfileModal" 
        />
        <BookingListStudent 
            v-else 
            :bookings="bookings" 
            :statusBooking="statusBooking" 
            :isTutor="isTutor" 
            :actionConfig="ACTION_CONFIG" 
            :userData="userData" 
            @openLogsModal="openLogsModal" 
            @openRejectConfirmation="openRejectConfirmation" 
            @openCancelConfirmation="openCancelConfirmation" 
            @openRescheduleModal="openRescheduleModal" 
            @openSendMessageModal="openSendMessageModal" 
            @openProfileModal="openProfileModal" 
        />

        <base-pagination v-if="!isPageLoading" :meta="dataPaginate" :current-page="currentPage" @changePage="changePage" />
    </div>

    <!-- All Modals Below -->
    <base-modal v-if="showLogsModal" :isOpen="showLogsModal" @close="showLogsModal = false" title="Lịch sử trạng thái đặt lịch" description="Lịch sử trạng thái đặt lịch bao gồm các thay đổi trong quá trình đặt lịch" size="xl">
        <div class="booking-logs-container">
            <div v-if="selectedLogs.length === 0" class="empty-logs">
                <div class="empty-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                    </svg>
                </div>
                <h3 class="empty-title">Chưa có lịch sử thay đổi</h3>
                <p class="empty-desc">Lịch sử thay đổi trạng thái sẽ hiển thị tại đây</p>
            </div>
            <div v-else class="logs-timeline">
                <div class="timeline-header">
                    <h3 class="timeline-title">Dòng thời gian thay đổi</h3>
                    <div class="timeline-summary">
                        <span class="summary-text">{{ selectedLogs.length }} thay đổi</span>
                    </div>
                </div>
                <div class="timeline-container">
                    <div v-for="(log, index) in selectedLogs" :key="log.id" class="timeline-item" :class="{ 'is-latest': index === 0 }">
                        <div class="timeline-marker">
                            <div class="marker-dot" :class="getStatusClass(log.status)"></div>
                            <div v-if="index < selectedLogs.length - 1" class="timeline-line"></div>
                        </div>
                        <div class="timeline-content">
                            <div class="log-header">
                                <div class="log-user">
                                    <div class="user-avatar">
                                        <img v-if="log.user?.avatar" :src="log.user.avatar" :alt="log.user.full_name" />
                                        <span v-else class="avatar-text">{{ getFirstCharacterOfLastName(log.user?.full_name) }}</span>
                                    </div>
                                    <div class="user-info">
                                        <span class="user-name">{{ log.user?.full_name }}</span>
                                        <span class="user-role">{{ log.user?.role_name }}</span>
                                    </div>
                                </div>
                                <div class="log-time">
                                    <span class="time-text">{{ formatDateTime(log.created_at) }}</span>
                                    <span v-if="index === 0" class="latest-badge">Mới nhất</span>
                                </div>
                            </div>
                            <div class="log-body">
                                <div class="status-change">
                                    <span class="status-label">Trạng thái:</span>
                                    <span class="status-badge" :class="getStatusClass(log.status)">{{ log.statusText }}</span>
                                </div>
                                <div v-if="log.note" class="log-note">
                                    <span class="note-label">Ghi chú:</span>
                                    <span class="note-text">{{ log.note }}</span>
                                </div>
                                <div v-if="log.description" class="log-description">
                                    <span class="desc-label">Mô tả:</span>
                                    <span class="desc-text">{{ log.description }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </base-modal>

    <!-- Other Modals (Reject, Message, Review, Reschedule, etc.) remain the same -->
    <base-modal v-if="showRejectModal" :isOpen="showRejectModal" title="Từ chối yêu cầu đặt lịch" description="Từ chối yêu cầu đặt lịch nếu bạn không muốn tiếp tục" @close="showRejectModal = false">
        <div class="model-reject">
            <base-input type="textarea" v-model="noteCancelled" placeholder="Nhập lý do từ chối (ví dụ: Lịch đã kín, không phù hợp chuyên môn...)"></base-input>
            <div class="modal-footer">
                <button class="btn-md btn-secondary" @click="showRejectModal = false">Hủy</button>
                <button class="btn-md btn-primary" :disabled="!noteCancelled.trim()" @click="submitReject">Từ chối</button>
            </div>
        </div>
    </base-modal>

    <SendMessage v-if="showSendMessageModal" :user="selectedUser" :isOpen="showSendMessageModal" @messageSent="handleMessageSent" @close="showSendMessageModal = false" />

    <ReviewModal v-if="showReviewModal" :isOpen="showReviewModal" :booking="selectedBookingForReview" :existingReview="existingReview" @reviewSubmitted="handleReviewSubmitted" @close="showReviewModal = false" />

    <ComplaintModal v-if="showComplaintModal" :isOpen="showComplaintModal" :booking="selectedBooking" :listStatusComplaint="listStatusComplaint" :listComplaintTypes="listComplaintTypes" @complaintSubmitted="handleComplaintSubmitted" @close="showComplaintModal = false" />

    <!-- Modal chuyển lịch học -->
    <base-modal v-if="showRescheduleModal" :isOpen="showRescheduleModal" @close="showRescheduleModal = false" title="Chuyển lịch học" description="Chuyển lịch học nếu bạn muốn thay đổi thời gian học" size="large">
        <div class="reschedule-modal-content">
            <!-- Current Booking Info Card -->
            <div class="info-card">
                <div class="card-header">
                    Thông tin lịch học hiện tại
                </div>
                <div class="card-content">
                    <div class="lesson-details-grid">
                        <div class="lesson-detail-item">
                            <div class="detail-label">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"></path>
                                    <path d="M22 10v6"></path>
                                    <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"></path>
                                </svg>
                            </div>
                            <div class="detail-value">
                                <span class="title">Môn học</span>
                                <span class="sub-title">{{ selectedBookingForReschedule?.subject?.name }}</span>
                            </div>
                        </div>

                        <div class="lesson-detail-item">
                            <div class="detail-label">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                                </svg>
                            </div>
                            <div class="detail-value">
                                <span class="title">Cấp độ</span>
                                <span class="sub-title">{{ selectedBookingForReschedule?.education_level?.name }}</span>
                            </div>
                        </div>

                        <div class="lesson-detail-item">
                            <div class="detail-label">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                            </div>
                            <div class="detail-value">
                                <span class="title">Thời gian</span>
                                <span class="sub-title">
                                    {{ selectedBookingForReschedule?.start_time_text }} - {{ selectedBookingForReschedule?.end_time_text }}
                                    <br>
                                    <small>({{ formatDuration(selectedBookingForReschedule?.duration) }})</small>
                                </span>
                            </div>
                        </div>

                        <div class="lesson-detail-item" v-if="selectedBookingForReschedule?.tutor_session">
                            <div class="detail-label">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <rect x="3" y="4" width="18" height="16" rx="2" />
                                    <path d="M7 8h10" />
                                </svg>
                            </div>
                            <div class="detail-value">
                                <span class="title">Loại buổi học</span>
                                <span class="sub-title">{{ selectedBookingForReschedule?.tutor_session?.name }}</span>
                            </div>
                        </div>

                        <div class="lesson-detail-item">
                            <div class="detail-label">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="12" y1="1" x2="12" y2="23"></line>
                                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                </svg>
                            </div>
                            <div class="detail-value">
                                <span class="title">Học phí mỗi giờ</span>
                                <span class="sub-title">{{ formatCurrency(selectedBookingForReschedule?.hourly_rate) }}</span>
                            </div>
                        </div>

                        <div class="lesson-detail-item">
                            <div class="detail-label">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" />
                                    <path d="M16 2v4" />
                                    <path d="M8 2v4" />
                                    <path d="M3 10h18" />
                                </svg>
                            </div>
                            <div class="detail-value">
                                <span class="title">Ngày học</span>
                                <span class="sub-title">{{ selectedBookingForReschedule?.date }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- New Schedule Form Card -->
            <div class="info-card">
                <div class="card-header">
                    Chọn lịch học mới
                </div>
                <div class="card-content">
                    <div class="reschedule-form">
                        <div class="form-group">
                            <label class="form-label">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" />
                                    <path d="M16 2v4" />
                                    <path d="M8 2v4" />
                                    <path d="M3 10h18" />
                                </svg>
                                Ngày học mới
                            </label>
                            <base-datepicker v-model="rescheduleFormData.new_date" />
                        </div>

                        <div class="form-group">
                            <label class="form-label">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                Khung giờ mới
                            </label>
                            <div class="time-slots-container">
                                <div class="time-select-grid">
                                    <button
                                        v-for="slot in availableRescheduleTimeSlots"
                                        :key="'reschedule-time-' + slot.id"
                                        type="button"
                                        class="time-chip"
                                        :class="{
                                            selected: rescheduleFormData.new_time_slot_id === slot.id,
                                            disabled: slot.disabled || !rescheduleFormData.new_date
                                        }"
                                        @click="(!slot.disabled && rescheduleFormData.new_date) && (rescheduleFormData.new_time_slot_id = slot.id)"
                                    >
                                        {{ slot.name }}
                                    </button>
                                </div>
                                <div v-if="!rescheduleFormData.new_time_slot_id && rescheduleFormData.new_date" class="form-error">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="12" />
                                        <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    Vui lòng chọn khung giờ
                                </div>
                                <div v-if="rescheduleFormData.new_date && availableRescheduleTimeSlots.length === 0" class="form-error">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="12" />
                                        <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    Gia sư không có lịch trống vào ngày này
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14,2 14,8 20,8"></polyline>
                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                    <polyline points="10,9 9,9 8,9"></polyline>
                                </svg>
                                Lý do chuyển lịch <span class="required">*</span>
                            </label>
                            <base-input
                                type="textarea"
                                v-model="rescheduleFormData.note"
                                placeholder="Vui lòng nhập lý do chuyển lịch học (bắt buộc)"
                                :rows="4"
                            ></base-input>
                        </div>

                        <div class="notice-content">
                            <p class="notice-text">
                                <strong>Lưu ý:</strong> Yêu cầu chuyển lịch sẽ được gửi cho gia sư để xem xét và xác nhận.
                                Gia sư có thể chấp nhận hoặc từ chối yêu cầu này trong vòng 24 giờ.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn-md btn-secondary" @click="showRescheduleModal = false">
                    <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                    </svg>
                    <span>Hủy</span>
                </button>
                <button
                    class="btn-md btn-primary"
                    @click="submitReschedule"
                    :disabled="!rescheduleFormData.new_date || !rescheduleFormData.new_time_slot_id || !rescheduleFormData.note.trim()"
                >
                    <svg class="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 2 11 13"></path>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                    <span>Gửi yêu cầu</span>
                </button>
            </div>
        </div>
    </base-modal>

    <!-- Confirmation Modals -->
    <base-modal v-if="modals.confirmCancel" :isOpen="modals.confirmCancel" @close="resetModal('confirmCancel')" title="Xác nhận hủy lịch học" description="Xác nhận hủy lịch học nếu bạn không muốn tiếp tục" size="small">
        <div class="confirmation-modal">
            <div class="confirmation-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
            </div>
            <h3 class="confirmation-title">Bạn có chắc chắn muốn hủy lịch học này?</h3>
            <p class="confirmation-message">
                Hành động này không thể hoàn tác. Lịch học sẽ bị hủy và thời gian sẽ được giải phóng.
            </p>
            <div class="form-group" style="margin-top: 1rem;">
                <base-input
                    type="textarea"
                    v-model="forms.cancel.note"
                    placeholder="Nhập lý do hủy lịch học (bắt buộc)..."
                    :rows="3"
                />
            </div>
            <div class="modal-footer">
                <button class="btn-md btn-secondary" @click="resetModal('confirmCancel')">
                    <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                    </svg>
                    <span>Hủy</span>
                </button>
                <button class="btn-md btn-danger" @click="confirmCancel" :disabled="!forms.cancel.note.trim()">
                    <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                    <span>Xác nhận hủy</span>
                </button>
            </div>
        </div>
    </base-modal>

    <base-modal v-if="modals.confirmReject" :isOpen="modals.confirmReject" @close="resetModal('confirmReject')" title="Xác nhận từ chối lịch học" description="Xác nhận từ chối lịch học nếu bạn không muốn tiếp tục" size="small">
        <div class="confirmation-modal">
            <div class="confirmation-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
            </div>
            <h3 class="confirmation-title">Bạn có chắc chắn muốn từ chối lịch học này?</h3>
            <p class="confirmation-message">
                Hành động này không thể hoàn tác. Lịch học sẽ bị từ chối và thời gian sẽ được giải phóng.
            </p>
            <div class="form-group" style="margin-top: 1rem;">
                <base-input
                    type="textarea"
                    v-model="forms.reject.note"
                    placeholder="Nhập lý do từ chối lịch học (bắt buộc)..."
                    :rows="3"
                ></base-input>
            </div>
            <div class="modal-footer">
                <button class="btn-md btn-secondary" @click="resetModal('confirmReject')">
                    <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                    </svg>
                    <span>Hủy</span>
                </button>
                <button class="btn-md btn-danger" @click="confirmReject" :disabled="!forms.reject.note.trim()">
                    <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="m4.9 4.9 14.2 14.2"/>
                    </svg>
                    <span>Xác nhận từ chối</span>
                </button>
            </div>
        </div>
    </base-modal>

    <!-- Refund Modal -->
    <base-modal v-if="modals.refund" :isOpen="modals.refund" @close="resetModal('refund')" title="Xác nhận hoàn tiền" description="Xác nhận hoàn tiền nếu bạn muốn hoàn tiền" size="medium">
        <div class="refund-confirmation-modal">
            <div class="booking-info-compact">
                <div class="info-header">
                    <div class="info-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"></path>
                            <path d="M22 10v6"></path>
                            <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"></path>
                        </svg>
                    </div>
                    <div class="info-main">
                        <h4 class="subject-name">{{ selected.bookingForRefund?.subject?.name }}</h4>
                        <p class="booking-time">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            {{ selected.bookingForRefund?.date }} - {{ selected.bookingForRefund?.time_slot?.name }}
                        </p>
                    </div>
                </div>

                <div class="info-footer">
                    <div class="amount-section">
                        <span class="amount-label">Số tiền hoàn</span>
                        <span class="amount-value">{{ formatCurrency(selected.bookingForRefund?.total_price) }}</span>
                    </div>
                    <div class="payment-method" v-if="selected.bookingForRefund?.payment?.payment_method">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="6" width="18" height="13" rx="2"></rect>
                            <path d="M3 10H20.5"></path>
                            <path d="M7 15H9"></path>
                        </svg>
                        <span>{{ selected.bookingForRefund?.payment?.payment_method?.name }}</span>
                    </div>
                </div>
            </div>

            <div class="refund-notice">
                <div class="notice-header">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <h4>Thông tin hoàn tiền</h4>
                </div>
                <div class="notice-content">
                    <p>Số tiền sẽ được hoàn vào đúng tài khoản mà bạn đã thanh toán trước đó</p>
                    <p>Thời gian xử lý: 1-3 ngày làm việc</p>
                    <p>Bạn sẽ nhận được thông báo khi hoàn tiền thành công</p>
                    <p>Nếu có vấn đề gì, vui lòng liên hệ hỗ trợ</p>
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn-md btn-secondary" @click="resetModal('refund')">
                    <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                    </svg>
                    <span>Hủy</span>
                </button>
                <button class="btn-md btn-success" @click="confirmRefund">
                    <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8|M3 3v5h5|M12 7v5l3 3"></path>
                    </svg>
                    <span>Xác nhận hoàn tiền</span>
                </button>
            </div>
        </div>
    </base-modal>


    <!-- Profile Modal -->
    <base-modal v-if="showProfileModal" :isOpen="showProfileModal" @close="showProfileModal = false" title="Thông tin cơ bản" description="Thông tin cơ bản của người dùng" size="medium">
        <div v-if="selected.profileUser" class="profile-modal-content">
            <div class="profile-header">
                <div class="profile-avatar-large">
                    <img v-if="selected.profileUser.avatar" :src="selected.profileUser.avatar" :alt="selected.profileUser.full_name">
                    <span v-else class="avatar-text-large">{{ getFirstCharacterOfLastName(selected.profileUser.full_name) }}</span>
                </div>
                <div class="profile-info">
                    <h2 class="profile-name">{{ selected.profileUser.full_name }}</h2>
                    <div v-if="selected.profileUser.info_reviews?.average_rating" class="profile-rating">
                        <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        <span class="rating-value">{{ selected.profileUser.info_reviews.average_rating }}</span>
                        <span class="rating-count">({{ selected.profileUser.info_reviews.total_reviews }} đánh giá)</span>
                    </div>
                </div>
            </div>

            <div class="profile-details">
                <div class="detail-section">
                    <h3 class="section-title">Thông tin liên hệ</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <div class="detail-label">
                                <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Email
                            </div>
                            <div class="detail-value">{{ selected.profileUser.email || '-' }}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">
                                <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                Số điện thoại
                            </div>
                            <div class="detail-value">{{ selected.profileUser.phone || '-' }}</div>
                        </div>
                        <div class="detail-item" v-if="selected.profileUser.province">
                            <div class="detail-label">
                                <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Địa chỉ
                            </div>
                            <div class="detail-value">{{ selected.profileUser.province?.name }}</div>
                        </div>
                    </div>
                </div>

                <div class="detail-section" v-if="selected.profileUser.about_you">
                    <h3 class="section-title">Giới thiệu</h3>
                    <p class="bio-text">{{ selected.profileUser.about_you }}</p>
                </div>

                <div class="detail-section" v-if="selected.profileUser.role === 1 && selected.profileUser.user_subjects?.length">
                    <h3 class="section-title">Môn học giảng dạy</h3>
                    <div class="subjects-grid">
                        <div v-for="subject in selected.profileUser.user_subjects" :key="subject.id" class="subject-chip">
                            <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <span>{{ subject.subject?.name }}</span>
                            <span class="subject-exp">{{ subject.years_of_experience }} năm</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn-md btn-secondary" @click="showProfileModal = false">
                    <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                    </svg>
                    Đóng
                </button>
                <button class="btn-md btn-primary" @click="openSendMessageModal(selected.profileUser); showProfileModal = false">
                    <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                    </svg>
                    Nhắn tin
                </button>
            </div>
        </div>
    </base-modal>
</div>
</template>

<style scoped>
@import '~/assets/css/BookingCommon.css';
@import '~/assets/css/lessonInformation.css';
@import '~/assets/css/BookingManager.css';
@import '~/assets/css/ProfileModal.css';
</style>
