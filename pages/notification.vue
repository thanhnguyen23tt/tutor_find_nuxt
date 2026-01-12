<script setup>
definePageMeta({
	middleware: [
		'auth', 
		() => {
		useLayoutStore().setHiddenFooter(true)
		}
	]
})
import { notification_type_icons } from '~/config';

const { api } = useApi();
const { success, error: notifyError } = useNotification();
const { formatDate } = useHelper();

const isLoading = ref(false);
const notifications = ref({
	data: [],
	meta: null,
	countNotRead: 0,
});
const activeTab = ref('all');
const tabs = computed(() => [
    {
        value: 'unread',
        label: 'Chưa đọc',
        count: notifications.value.countNotRead
    },
    {
        value: 'read',
        label: 'Đã đọc'
    },
]);

// Tính toán giá trị is_read dựa vào tab đang chọn
const currentIsRead = computed(() => {
    switch (activeTab.value) {
        case 'unread':
            return 0;
        case 'read':
            return 1;
        default:
            return null;
    }
});

// Gọi API
const fetchNotifications = async (page = 1) => {
    const params = {
        page
    };
    if (currentIsRead.value !== null) {
        params.is_read = currentIsRead.value;
    }

    try {
		isLoading.value = true;
		const response = await api.apiGet('notifications', params);

		notifications.value = {
			data: response.data || [],
			meta: response.meta || null,
			countNotRead: response.count_not_read || 0,
		};
    } catch (error) {
        notifyError('Không thể tải danh sách thông báo');
    } finally {
		isLoading.value = false;
	}
};

// Xử lý chuyển trang
const handleChangePage = (page) => {
    fetchNotifications(page);
};

// Đánh dấu tất cả là đã đọc
const markAllAsRead = async () => {
    try {
        await api.apiPost('notifications/mark-all-read');
    await fetchNotifications(notifications.value.meta?.current_page || 1);
        success('Đã đánh dấu tất cả là đã đọc!');
    } catch (error) {
        notifyError('Không thể cập nhật trạng thái thông báo');
    }
};

// Đánh dấu 1 thông báo là đã đọc
const markNotificationAsRead = async (id) => {
    try {
        await api.apiPost(`notifications/${id}/mark-read`);
    await fetchNotifications(notifications.value.meta?.current_page || 1);
    } catch (error) {
        notifyError('Không thể đánh dấu thông báo này');
    }
};

// Tự động fetch khi tab thay đổi
watch(activeTab, () => fetchNotifications(1));

// Khởi động lần đầu
onMounted(() => fetchNotifications());

// Get notification icon based on type
const getNotificationIcon = (notification) => {
    const type = notification.type || 'schedule'; // default to schedule
    return notification_type_icons[type] || notification_type_icons.schedule;
};
</script>

<template>
	
<base-loading v-if="isLoading" />

<div class="notification-page" v-else>
    <div class="container">
        <div class="nav-tabs">
            <base-status-tabs v-model="activeTab" :tabs="tabs" />
            <button class="btn-md btn-secondary w-max mark-all_read" @click="markAllAsRead" v-if="notifications.countNotRead > 0">
                <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6 7 17l-5-5"></path>
                    <path d="m22 10-7.5 7.5L13 16"></path>
                </svg>
                Đánh dấu tất cả là đã đọc ({{ notifications.countNotRead }})
            </button>
        </div>

        <div class="content-main">
            <div v-if="!notifications.data || notifications.data.length === 0" class="notification-empty">
                <svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10 2h4"/>
                    <path d="M12 14v-4"/>
                    <path d="M4.93 4.93 3.51 3.51"/>
                    <path d="M19.07 4.93 20.49 3.51"/>
                    <path d="M22 12h-2"/>
                    <path d="M4 12H2"/>
                    <path d="M19.07 19.07 20.49 20.49"/>
                    <path d="M4.93 19.07 3.51 20.49"/>
                    <circle cx="12" cy="12" r="6"/>
                </svg>
                <div class="notification-empty-title">Chưa có thông báo</div>
                <div class="notification-empty-sub">Khi có cập nhật mới, thông báo sẽ hiển thị tại đây.</div>
            </div>
            <div v-else class="notification-list">
                <div v-for="notification in notifications.data" :key="notification.id" class="notification-card" :class="{ 'is-read': notification.is_read }" @click="markNotificationAsRead(notification.id)">
                    <div class="notification-header">
                        <div class="notification-left">
                            <div class="icon-wrapper">
                                <svg
                                    class="icon-lg"
                                    :viewBox="getNotificationIcon(notification).viewBox"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <path :d="getNotificationIcon(notification).path" />
                                </svg>
                            </div>
                            <div class="title-wrapper">
                                <span class="title-main">{{ notification.name }}</span>
                                <span class="sub-title">{{ notification.type_label }}</span>
                                <span v-if="notification.is_read" class="dot-unread"></span>
                            </div>
                        </div>
                        <div class="notification-right">
                            <div class="notification-status" :class="{ 'is-read': notification.is_read }"></div>
                        </div>
                    </div>
                    <div class="desc">{{ notification.description }}</div>
                    <div class="notification-content">
                        <div class="time">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-md">
                                <path d="M8 2v4"></path>
                                <path d="M16 2v4"></path>
                                <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                                <path d="M3 10h18"></path>
                            </svg>
                            <span>{{ formatDate(notification.created_at) }}</span>
                        </div>
                        <div class="user" v-if="notification.user">
                            <div class="user_avatar"></div>
                            <span class="user_name">{{ notification.user.full_name }}</span>
                        </div>
                    </div>
                </div>
            </div>
            <base-pagination v-if="notifications.meta" :meta="notifications.meta" @changePage="handleChangePage" />
        </div>
    </div>
</div>
</template>

<style scoped>
.notification-page {
    padding: 2rem 0;
    min-height: 100vh;
    position: relative;
}
.notification-page .container {
    display: grid;
    gap: 2rem;
    position: relative;
    z-index: 1;
    margin: 0 auto;
    padding: 0 1rem;
}

.nav-tabs {
    border: none;
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    padding: 1.5rem;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
}


.notification-list {
    display: grid;
    gap: 1.5rem;
}

.notification-card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-left: 4px solid var(--color-primary);
    border-radius: 16px;
    padding: 1.5rem 2rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    position: relative;
    overflow: hidden;
}

.notification-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, var(--color-primary-transparent), transparent);
    transition: left 0.5s;
}

.notification-card:hover::before {
    left: 100%;
}

.notification-card.is-read {
    border-left-color: #94a3b8;
    opacity: 0.8;
}

.notification-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    border-left-color: var(--color-primary-light);
}

.notification-card.is-read:hover {
    border-left-color: var(--color-primary);
}

.notification-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.notification-card .desc {
    font-size: var(--font-size-heading-6);
    color: var(--gray-500);
}

.notification-left {
    display: flex;
    align-items: center;
    gap: 0.7rem;
}

.notification-left .icon-wrapper {
    background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
    border-radius: 2rem;
    min-width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    transition: all 0.3s ease;
}

.notification-card:hover .notification-left .icon-wrapper {
    transform: scale(1.1);
    box-shadow: 0 6px 20px var(--color-primary-light);
}

.notification-left .title-wrapper {
    display: grid;
    line-height: 1.4;
}

.notification-left .title-wrapper .title-main {
    font-weight: 700;
    font-size: var(--font-size-heading-6);
    background: linear-gradient(135deg, #1f2937, #374151);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
}

.notification-left .title-wrapper .sub-title {
    font-size: var(--font-size-small);
    font-weight: 600;
    color: var(--color-primary);
    background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
}

.notification-card.is-read .sub-title {
    color: #94a3b8;
    background: #94a3b8;
    -webkit-background-clip: text;
    background-clip: text;
}

.notification-content {
    display: flex;
    font-size: var(--font-size-base);
    gap: 1.2rem;
    color: var(--gray-500);
}

.notification-content .time {
    display: flex;
    align-items: center;
    gap: 0.3rem;
}

.notification-content .user {
    display: flex;
    align-items: center;
    gap: 0.3rem;
}

.notification-content .user .user_avatar {
    width: 1rem;
    height: 1rem;
    border-radius: 100%;
    background: var(--gray-200);
}

.notification-content .status {
    background: var(--color-primary-transparent);
    border: 1px solid var(--color-primary-light);
    padding: 0.1rem 0.7rem;
    border-radius: 2rem;
    color: var(--color-primary);
    font-size: var(--font-size-small) !important;
}

.notification-status {
    width: 1rem;
    height: 1rem;
    background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
    border-radius: 100%;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
    transition: all 0.3s ease;
}

.notification-card:hover .notification-status {
    transform: scale(1.2);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.6);
}

.notification-status.is-read {
    background: #94a3b8;
    box-shadow: 0 2px 8px rgba(148, 163, 184, 0.3);
}

/* Animation for notification cards */
@keyframes slideInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.notification-card {
    animation: slideInUp 0.6s ease-out;
}

.notification-card:nth-child(1) { animation-delay: 0s; }
.notification-card:nth-child(2) { animation-delay: 0.1s; }
.notification-card:nth-child(3) { animation-delay: 0.2s; }
.notification-card:nth-child(4) { animation-delay: 0.3s; }
.notification-card:nth-child(5) { animation-delay: 0.4s; }

.notification-empty {
    display: grid;
    place-items: center;
    gap: 0.5rem;
    padding: 3rem 1rem;
    color: var(--gray-500);
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
}

.notification-empty-title {
    font-weight: 700;
    color: #1f2937;
}

.notification-empty-sub {
    font-size: var(--font-size-small);
}

@media (max-width: 768px) {
    .notification-page {
        padding: 1rem 0;
    }

    .notification-page .container {
        padding: 0 0.5rem;
    }

    .nav-tabs {
        display: grid;
        gap: 1rem;
        padding: 1rem;
    }

    .mark-all_read {
        width: 100% !important;
    }

    .notification-card {
        padding: 1rem 1.5rem;
    }

    .nav-tabs {
        justify-content:unset;
    }
}
</style>
