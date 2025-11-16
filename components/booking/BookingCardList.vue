<!-- BookingCardList.vue -->
<template>
<div class="booking-card">
    <div v-for="booking in bookings" :key="booking.id" @click="$emit('openLogsModal', booking.user_booking_logs)">
        <div class="booking-card-wrapper" :class="getWrapperClass(booking)">
            <!-- Left section -->
            <div class="booking-card-left">
                <img v-if="booking.user.avatar" :src="booking.user.avatar" alt="User avatar" class="avatar avatar-clickable" @click.stop="$emit('openProfileModal', booking.user)">
                <div v-else class="avatar avatar-clickable" @click.stop="$emit('openProfileModal', booking.user)">{{ getFirstCharacterOfLastName(booking.user.full_name) }}</div>

                <div class="content">
                    <div class="tutor-name">
                        <span>{{ booking.user?.full_name }}</span>
                        <span v-if="booking.user?.info_reviews?.average_rating" class="star">
                            <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f9ce69" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                            {{ booking.user?.info_reviews?.average_rating }}
                        </span>
                    </div>
                    <div class="booking-code">Mã: {{ booking.request_code }}</div>
                    <div class="booking-date">
                        <svg class="icon-md" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <path d="M16 2v4" />
                            <path d="M8 2v4" />
                            <path d="M3 10h18" />
                        </svg>
                        {{ booking.date }}
                    </div>
                    <div class="booking-time">
                        <svg class="icon-md" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <div>
                            <span>{{ booking.start_time_text }} - {{ booking.end_time_text }} ({{ formatDuration(booking.duration) }})</span>
                        </div>
                    </div>
                    <button class="status-btn" :class="booking.statusClass">{{ booking.statusText }}</button>
                </div>
            </div>

            <!-- Center section -->
            <div class="booking-card-center">
                <div class="booking-card-center_content">
                    <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                    </svg>
                    <span>{{ booking.subject?.name }} - {{ booking.education_level?.name }}</span>
                </div>

                <div v-if="booking.tutor_session" class="booking-card-center_content">
                    <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="4" width="18" height="16" rx="2" />
                        <path d="M7 8h10" />
                    </svg>
                    <span>Loại buổi học: {{ booking.tutor_session?.name }}</span>
                </div>

                <div v-if="booking.payment?.payment_method" class="booking-card-center_content">
                    <svg class="icon-md" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="6" width="18" height="13" rx="2" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></rect>
                        <path d="M3 10H20.5" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                        <path d="M7 15H9" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                    </svg>
                    <span>{{ booking.payment?.payment_method?.name }} - {{ booking.payment?.payment_method?.description }}</span>
                </div>

                <div v-if="isTimeVisible(booking.status)" class="booking-card-center_content time-text">
                    <svg class="icon-md" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{{ booking.time_text }}</span>
                </div>

                <!-- Display reason for rejected/cancelled -->
                <template v-if="[props.statusBooking.rejected, props.statusBooking.cancelled].includes(booking.status) && getReasonFromLogs(booking)">
                    <div class="booking-card-center_content reason-text">
                        <div class="relative">
                            <svg xmlns="http://www.w3.org/2000/svg" class="icon-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 12H7" style="transform: none; transform-origin: 50% 50%; transform-box: fill-box;"></path><path d="M19 18H5"></path><path d="M21 6H3"></path></svg>
                        </div>
                        <span>Lý do: {{ getReasonFromLogs(booking) }}</span>
                    </div>
                </template>

                <!-- Reschedule Info -->
                <template v-if="booking.user_booking_reschedule && booking.status == props.statusBooking.request_rescheduled">
                    <div class="booking-card-center_content">
                        <svg class="icon-md" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>Cũ: {{ booking.date }} ({{ booking.time_slot?.name }} - {{ booking.end_time_text }})</span>
                    </div>
                    <div class="booking-card-center_content">
                        <svg class="icon-md" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>Mới: {{ booking.user_booking_reschedule?.new_date }} ({{ booking.user_booking_reschedule?.new_time_slot?.name }} - {{ booking.user_booking_reschedule?.end_time_new }})</span>
                    </div>
                    <div class="booking-card-center_content">
                        <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke-linecap="round" stroke-linejoin="round"></path>
                        </svg>
                        <span>Người đề xuất: {{ booking.user_booking_reschedule?.user?.full_name }}</span>
                    </div>
                    <div class="booking-card-center_content">
                        <div class="relative">
                            <svg xmlns="http://www.w3.org/2000/svg" class="icon-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 12H7" style="transform: none; transform-origin: 50% 50%; transform-box: fill-box;"></path><path d="M19 18H5"></path><path d="M21 6H3"></path></svg>
                        </div>
                        <span>Lý do: {{ booking.user_booking_reschedule?.note }}</span>
                    </div>
                </template>
            </div>

            <!-- Right section -->
            <div class="booking-card-right">
                <div class="payment-status">{{ booking.payment?.statusText }}</div>
                <div class="total-price">{{ formatCurrency(booking.total_price) }}</div>
                <div class="price-per-hour">{{ formatCurrency(booking.hourly_rate) }}/giờ</div>

                <div class="action-group" @click.stop>
                    <!-- Primary Action -->
                    <button v-if="getActionButton(booking, 'primary')" class="action-btn" :class="getActionButton(booking, 'primary').class" :disabled="getActionButton(booking, 'primary').disabled" @click="getActionButton(booking, 'primary').handler">
                        <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path v-if="getActionButton(booking, 'primary').icon === 'star'" :d="ICONS.star" />
                            <path
                            v-for="(d, i) in ICONS[getActionButton(booking, 'primary').icon].split('|')"
                            :key="i"
                            :d="d"
                            />
                        </svg>
                        <span class="btn-text">{{ getActionButton(booking, 'primary').label }}</span>
                    </button>

                    <!-- Secondary Action -->
                    <button v-if="getActionButton(booking, 'secondary')" class="action-btn" :class="getActionButton(booking, 'secondary').class" @click="getActionButton(booking, 'secondary').handler">
                        <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path
                            v-for="(d, i) in ICONS[getActionButton(booking, 'secondary').icon].split('|')"
                            :key="i"
                            :d="d"
                            />
                        </svg>
                        <span class="btn-text">{{ getActionButton(booking, 'secondary').label }}</span>
                    </button>

                    <!-- Quick Buttons -->
                    <button v-if="shouldShow(booking, 'reject')" class="action-btn btn-secondary" @click="$emit('openRejectConfirmation', booking)">
                        <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <path d="m4.9 4.9 14.2 14.2" />
                        </svg>
                        <span class="btn-text">Từ chối</span>
                    </button>

                    <button v-if="shouldShow(booking, 'cancel')" class="action-btn btn-secondary" @click="$emit('openCancelConfirmation', booking)">
                        <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <path d="m4.9 4.9 14.2 14.2" />
                        </svg>
                        <span class="btn-text">Hủy lịch học</span>
                    </button>

                    <button v-if="shouldShow(booking, 'reschedule')" class="action-btn btn-secondary" @click="$emit('openRescheduleModal', booking)">
                        <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <span class="btn-text">Chuyển lịch</span>
                    </button>

                    <button class="action-btn btn-secondary" @click="$emit('openSendMessageModal', booking.user)">
                        <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                        </svg>
                        <span class="btn-text">Tin nhắn</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
</template>



<script setup>
import {
    defineProps,
    defineEmits
} from 'vue'

const { formatDuration, formatCurrency, getFirstCharacterOfLastName } = useHelper()

const props = defineProps({
    bookings: Array,
    statusBooking: Object,
    isTutor: Boolean,
    actionConfig: Object,
    userData: Object
})

defineEmits(['openLogsModal', 'openRejectConfirmation', 'openCancelConfirmation', 'openRescheduleModal', 'openSendMessageModal', 'openProfileModal'])

const ICONS = {
    check: 'M20 6 9 17l-5-5',
    classroom:
    'M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49|M14.084 14.158a3 3 0 0 1-4.242-4.242|M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143|m2 2 20 20',
    star: 'M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z',
    alert: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z|M12 9v4|M12 17h.01',
    cancel: 'M18 6L6 18|M6 6L18 18',
    x: 'M18 6 6 18|M6 6 12 12',
    message: 'M7.9 20A9 9 0 1 0 4 16.1L2 22Z',
    reject: 'M18 6 6 18|M6 6 12 12',
    reschedule: 'M3 4h18a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
    refund: 'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8|M3 3v5h5'
}

const getWrapperClass = (booking) => ({
    'warning': booking.status === props.statusBooking.request_rescheduled,
    'success': booking.status === props.statusBooking.completed
})

const isTimeVisible = (status) => {
    return [props.statusBooking.confirmed].includes(status)
}

const getActionButton = (booking, type = 'primary') => {
    const config = props.actionConfig[booking.status]
    if (!config) return null

    const btnConfig = typeof config[type] === 'function' ? config[type](booking) : config[type]
    if (!btnConfig) return null

    return {
        label: typeof btnConfig.label === 'function' ? btnConfig.label(booking) : btnConfig.label,
        icon: btnConfig.icon,
        class: btnConfig.class,
        disabled: btnConfig.disabled || false,
        handler: () => btnConfig.handler?.(booking)
    }
}

const shouldShow = (booking, action) => {
    const config = props.actionConfig[booking.status]
    if (!config) return false

    if (action === 'reject') {
        const showReject = config.showReject
        return typeof showReject === 'function' ? showReject(booking) : showReject
    }
    if (action === 'cancel') {
        return config.showCancelled || false
    }
    if (action === 'reschedule') {
        const showReschedule = config.showReschedule
        return typeof showReschedule === 'function' ? showReschedule(booking) : showReschedule
    }
    return false
}

const getReasonFromLogs = (booking) => {
    if (!booking.user_booking_logs || booking.user_booking_logs.length === 0) return null

    // Find the latest log with the same status as booking's current status and has a note
    const relevantLog = booking.user_booking_logs
        .filter(log => log.status === booking.status && log.note)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]

    return relevantLog?.note || null
}
</script>


<style scoped>
@import '~/assets/css/BookingManager.css';

.avatar-clickable {
    cursor: pointer;
    transition: all 0.3s ease;
}

.avatar-clickable:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
</style>
