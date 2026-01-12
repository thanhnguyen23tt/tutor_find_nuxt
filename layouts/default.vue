<script setup async>
const userStore = useUserStore();
const notificationStore = useNotificationStore();
const { api } = useApi();

const isLoading = ref(false);
const showNotificationPreview = ref(false);
const unreadData = computed(() => notificationStore.getUnreadData);
const hiddenNotificationPreview = computed(() => notificationStore.hiddenNotificationPreview);
const isAuthenticated = computed(() => {
	return userStore.isAuthenticated;
});

const totalUnreadCount = computed(() => {
	if (!unreadData.value) return 0;
	return (unreadData.value.messages || 0) +
		(unreadData.value.pending_booking || 0) +
		(unreadData.value.notifications || 0) +
		(unreadData.value.recheduled_bookings || 0);
});

// Notification functions
const fetchUnreadData = async () => {
	try {
		const response = await api.apiGet('unread');
		if (response.success) {
			notificationStore.setUnreadData(response.data);
		}
	} catch (error) {
		console.error('Error fetching unread data:', error);
	}
};

const toggleNotificationPreview = () => {
	showNotificationPreview.value = !showNotificationPreview.value;
	if (showNotificationPreview.value && !unreadData.value) {
		fetchUnreadData();
	}
};

const closeNotificationPreview = () => {
	showNotificationPreview.value = false;
};

onMounted(async () => {
	if (process.client && isAuthenticated.value) {
		fetchUnreadData();
		setInterval(fetchUnreadData, 60000);
	}
});
</script>

<template>
	<div>
		<!-- Notification Preview Modal -->
		<NotificationPreview :show="showNotificationPreview && !hiddenNotificationPreview" :unread-data="unreadData"
			@close="closeNotificationPreview" />

		<!-- Global Notification Button -->
		<div class="notification-hero-button" v-if="!hiddenNotificationPreview && isAuthenticated"
			@click="toggleNotificationPreview">
			<div class="notification-btn-content">
				<div class="notification-btn-icon">
					<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
							d="M15 17h5l-5 5v-5zM11 17H7l4 4v-4zM13 3a9 9 0 919 9v4l2 2v1H0v-1l2-2V12A9 9 0 0113 3z" />
					</svg>
				</div>
				<div class="notification-btn-text">
					<span class="notification-btn-title">Thông báo</span>
					<span v-if="totalUnreadCount > 0" class="notification-btn-count">{{ totalUnreadCount }} mới</span>
					<span v-else class="notification-btn-count">Không có thông báo mới</span>
				</div>
			</div>
			<div v-if="totalUnreadCount > 0" class="notification-btn-badge">{{ totalUnreadCount > 99 ? '99+' :
				totalUnreadCount }}</div>
		</div>

		<div class="layout-main" v-if="!isLoading">
			<LayoutHeader />
			<main>
				<slot />
			</main>
			<LayoutFooter />
		</div>

		<slot v-else />
	</div>
</template>

<style>
@import url('~/assets/css/app.css');

.notification-bell {
	position: fixed;
	top: 20px;
	right: 20px;
	z-index: 1000;
	cursor: pointer;
	background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
	border-radius: 50%;
	width: 56px;
	height: 56px;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
	transition: all 0.3s ease;
}

.notification-bell:hover {
	transform: translateY(-2px);
	box-shadow: 0 8px 30px rgba(99, 102, 241, 0.4);
}

.bell-icon {
	color: white;
	display: flex;
	align-items: center;
	justify-content: center;
}

.bell-badge {
	position: absolute;
	top: -4px;
	right: -4px;
	background: #ef4444;
	color: white;
	border-radius: 50%;
	min-width: 20px;
	height: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 0.75rem;
	font-weight: 600;
	border: 2px solid white;
}

/* Hero Notification Button */
.btn-notification {
	background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
	border: 2px solid #e2e8f0 !important;
	color: #475569 !important;
	position: relative;
	display: flex;
	align-items: center;
	gap: 0.5rem;
	transition: all 0.3s ease;
}

.btn-notification:hover {
	background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%) !important;
	border-color: var(--color-primary) !important;
	color: var(--color-primary) !important;
	transform: translateY(-2px);
	box-shadow: 0 8px 25px rgba(99, 102, 241, 0.2);
}

.hero-notification-badge {
	position: absolute;
	top: -8px;
	right: -8px;
	background: #ef4444;
	color: white;
	border-radius: 50%;
	min-width: 20px;
	height: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 0.75rem;
	font-weight: 600;
	border: 2px solid white;
	z-index: 1;
}

/* Notification Hero Button (Alternative Style) */
.notification-hero-button {
	position: fixed;
	bottom: 2rem;
	right: 1.5rem;
	z-index: 999;
	cursor: pointer;
	background: white;
	border-radius: 16px;
	padding: 1rem 1.25rem;
	box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
	border: 1px solid #e2e8f0;
	transition: all 0.3s ease;
	min-width: 200px;
}

.notification-hero-button:hover {
	transform: translateY(-4px);
	box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
	border-color: var(--color-primary);
}

.notification-btn-content {
	display: flex;
	align-items: center;
	gap: 0.75rem;
}

.notification-btn-icon {
	width: 40px;
	height: 40px;
	border-radius: 12px;
	background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
	color: white;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.notification-btn-text {
	display: flex;
	flex-direction: column;
	gap: 0.125rem;
}

.notification-btn-title {
	font-weight: 600;
	color: #1e293b;
	font-size: 0.95rem;
}

.notification-btn-count {
	font-size: 0.8rem;
	color: #64748b;
}

.notification-btn-badge {
	position: absolute;
	top: -4px;
	right: -4px;
	background: #ef4444;
	color: white;
	border-radius: 50%;
	min-width: 2rem;
	height: 2rem;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 0.66rem;
	font-weight: 500;
	border: 2px solid white;
}

@media (max-width: 1024px) {
	.notification-hero-button {
		bottom: 5rem;
	}
}

/* Responsive Design */
@media (max-width: 768px) {
	.layout-main {
		padding-bottom: 4.5rem;
	}
	.notification-bell {
		width: 48px;
		height: 48px;
		top: 16px;
		right: 16px;
	}

	.notification-hero-button {
		bottom: 5rem;
		right: 1rem;
		padding: 0.875rem 1rem;
		min-width: 150px;
		display: none;
	}

	.notification-btn-icon {
		width: 36px;
		height: 36px;
	}

	.notification-btn-title {
		font-size: 0.9rem;
	}

	.notification-btn-count {
		font-size: 0.75rem;
	}

	.hero-buttons {
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.btn-notification {
		order: 3;
		width: 100%;
		justify-content: center;
	}
}
</style>
