<script setup>
import { computed } from 'vue';

const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    unreadData: {
        type: Object,
        default: null
    }
});

const emit = defineEmits(['close']);

const totalUnreadCount = computed(() => {
    if (!props.unreadData) return 0;
    return (props.unreadData.messages || 0) +
           (props.unreadData.pending_booking || 0) +
           (props.unreadData.notifications || 0) +
           (props.unreadData.recheduled_bookings || 0);
});

const hasUnreadNotifications = computed(() => {
    return totalUnreadCount.value > 0;
});

const handleClose = () => {
    emit('close');
};
</script>

<template>
    <!-- Notification Preview Modal -->
    <div v-if="show && unreadData" class="notification-preview-overlay" @click="handleClose">
        <div class="notification-preview-modal" @click.stop>
            <div class="notification-header">
                <h3 class="notification-title">Thông báo</h3>
                <button class="close-btn" @click="handleClose">
                    <svg class="icon-lg" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
            <div class="notification-content">
                <div class="notification-item" v-if="unreadData.pending_booking > 0">
                    <div class="notification-icon bookings">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h6m-6 0l-1 1m7-1l1 1m-1-1v4a2 2 0 01-2 2H9a2 2 0 01-2-2V8"/>
                        </svg>
                    </div>
                    <div class="notification-info">
                        <div class="notification-text">Đặt lịch chờ xử lý</div>
                        <div class="notification-count">{{ unreadData.pending_booking }} yêu cầu đang chờ</div>
                    </div>
                    <div class="notification-badge">{{ unreadData.pending_booking }}</div>
                </div>

                <div class="notification-item" v-if="unreadData.notifications > 0">
                    <div class="notification-icon notifications">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM11 17H7l4 4v-4zM13 3a9 9 0 019 9v4l2 2v1H0v-1l2-2V12A9 9 0 0113 3z"/>
                        </svg>
                    </div>
                    <div class="notification-info">
                        <div class="notification-text">Thông báo hệ thống</div>
                        <div class="notification-count">{{ unreadData.notifications }} thông báo mới</div>
                    </div>
                    <div class="notification-badge">{{ unreadData.notifications }}</div>
                </div>

                <div class="notification-item" v-if="unreadData.recheduled_bookings > 0">
                    <div class="notification-icon reschedule">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                    <div class="notification-info">
                        <div class="notification-text">Lịch học thay đổi</div>
                        <div class="notification-count">{{ unreadData.recheduled_bookings }} lịch học cần xác nhận</div>
                    </div>
                    <div class="notification-badge">{{ unreadData.recheduled_bookings }}</div>
                </div>

                <div v-if="!hasUnreadNotifications" class="no-notifications">
                    <div class="no-notifications-icon">
                        <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                    <div class="no-notifications-text">Không có thông báo mới</div>
                    <div class="no-notifications-desc">Bạn đã xem tất cả thông báo</div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Notification Preview Modal */
.notification-preview-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1001;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
}

.notification-preview-modal {
    background: white;
    border-radius: 20px;
    width: 100%;
    max-width: 480px;
    max-height: 80vh;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
    from {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.notification-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.1rem 2rem;
    border-bottom: 1px solid #e2e8f0;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.notification-title {
    font-size: var(--font-size-medium);
    font-weight: 700;
    color: #1e293b;
    margin: 0;
}

.close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #64748b;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.2s ease;
}

.close-btn:hover {
    background: #f1f5f9;
    color: #1e293b;
}

.notification-content {
    padding: 1rem 0;
    max-height: 400px;
    overflow-y: auto;
}

.notification-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 2rem;
    transition: all 0.2s ease;
    cursor: pointer;
}

.notification-item:hover {
    background: #f8fafc;
}

.notification-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.notification-icon.messages {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;
}

.notification-icon.bookings {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white;
}

.notification-icon.notifications {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
}

.notification-icon.reschedule {
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    color: white;
}

.notification-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.notification-text {
    font-weight: 600;
    color: #1e293b;
    font-size: var(--font-size-small);
}

.notification-count {
    font-size: var(--font-size-mini);
    color: #64748b;
}

.notification-badge {
    background: #ef4444;
    color: white;
    border-radius: 50%;
    min-width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-mini);
    font-weight: 600;
}

.no-notifications {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
    text-align: center;
}

.no-notifications-icon {
    color: #10b981;
    margin-bottom: 1rem;
}

.no-notifications-text {
    font-size: var(--font-size-medium);
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 0.5rem;
}

.no-notifications-desc {
    font-size: var(--font-size-small);
    color: #64748b;
}

/* Responsive Design */
@media (max-width: 768px) {
    .notification-preview-modal {
        margin: 1rem;
        max-width: none;
        /* display: none; */
    }

    .notification-header {
        padding: 1rem 1.5rem;
    }

    .notification-item {
        padding: 0.875rem 1.5rem;
    }

    .notification-icon {
        width: 36px;
        height: 36px;
    }

    .no-notifications {
        padding: 2rem 1.5rem;
    }
}
</style>

