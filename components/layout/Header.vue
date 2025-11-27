<script setup>
import {
	navigationLinks,
	userMenuItems,
	headerActionButtons
} from '~/config/header';
import {
	notification_type_icons,
} from '~/config';

const { api } = useApi();
const userStore = useUserStore();
const notificationStore = useNotificationStore();
const { isAuthenticated } = useAuth();
const { formatDateTime, getFirstCharacterOfLastName, normalizeIcon } = useHelper();

const showDropdown = ref(false);
const showNotifications = ref(false);
const notifications = ref([]);

const userData = computed(() => userStore.getUserData);

const isAuthenticatedCheck = computed(() => {
	return isAuthenticated();
});

const unreadData = computed(() => notificationStore.getUnreadData || {
	notifications: 0,
	messages: 0,
	pending_booking: 0,
	recheduled_bookings: 0
});

const isTutor = computed(() => {
	return userData.value?.is_tutor;
});

const isUser = computed(() => {
	return !userData.value?.is_tutor;
});

const hasAccess = (item) => {
	if (item?.requiresAuth === true && !isAuthenticatedCheck.value) {
		return false;
	}

	if (item?.requiresAuth === false && isAuthenticatedCheck.value) {
		return false;
	}

	return true;
};

const matchesRole = (item) => {
	if (item.is_tutor === true) {
		return isTutor.value;
	}

	if (item.is_user === true) {
		return isUser.value;
	}

	return true;
};

const shouldShowItem = (item) => {
	if (!hasAccess(item)) {
		return false;
	}

	return matchesRole(item);
};



const filteredActionButtons = computed(() => {
	return headerActionButtons.filter(button => shouldShowItem(button));
});

const notificationAction = computed(() => {
	return filteredActionButtons.value.find(action => action.id === 'notification');
});

const baseActionButtons = computed(() => {
	return filteredActionButtons.value.filter(action => action.id !== 'notification');
});

const desktopActionButtons = computed(() => {
	if (isAuthenticatedCheck.value) {
		return baseActionButtons.value.filter(action => action.requiresAuth !== false);
	}

	return baseActionButtons.value.filter(action => action.requiresAuth !== true);
});

const fetchNotifications = async () => {
	try {
		const res = await api.apiGet('notifications');
		notifications.value = res.data || [];
	} catch (e) {
	}
};

const fetchUnreadData = async () => {
	try {
		const response = await api.apiGet('unread');
		if (response.success) {
			userStore.setUnreadData(response.data);
		}
	} catch (error) {
		console.error('Error fetching unread data:', error);
	}
};

const markNotificationAsRead = async (id) => {
	await api.apiPost(`notifications/${id}/mark-read`);
	await fetchNotifications();
};

const openLoginModal = () => {
	navigateTo('/auth/login');
};

const openRegisterModal = () => {
	navigateTo('/auth/register');
};

const closeMenus = () => {
	showDropdown.value = false;
	showNotifications.value = false;
};

const handleAuthAction = (action) => {
	if (action === 'openLoginModal') {
		closeMenus();
		openLoginModal();
		return;
	}

	if (action === 'openRegisterModal') {
		closeMenus();
		openRegisterModal();
	}
};

const toggleDropdown = () => {
	if (showDropdown.value) {
		closeMenus();
		return;
	}

	showNotifications.value = false;
	showDropdown.value = true;

	// Add haptic feedback for mobile
	if (process.client && navigator.vibrate) {
		navigator.vibrate(50);
	}
};

const toggleNotifications = async () => {
	if (showNotifications.value) {
		closeMenus();
		return;
	}

	showDropdown.value = false;
	await fetchNotifications();

	showNotifications.value = true;

	// Add haptic feedback for mobile
	if (process.client && navigator.vibrate) {
		navigator.vibrate(50);
	}
};

const handleLogout = () => {
	userStore.clearAuth();
	navigateTo('/auth/login');
};

const markAllAsRead = async () => {
	try {
		await api.apiPost('notifications/mark-all-read');
		await fetchNotifications();
		await fetchUnreadData();
	} catch (e) {
		console.error('Error marking notifications as read:', e);
	}
};

const handleMenuAction = (action) => {
	if (action === 'logout') {
		handleLogout();
	}

	closeMenus();
};

const handleHeaderAction = (action) => {
	if (action === 'toggleNotifications') {
		toggleNotifications();
	}
};

watch(() => userStore.getUserData, () => {
	// User data is reactive from Pinia store
}, { deep: true });

onMounted(() => {
	// Có thể fetch notifications ở đây nếu cần
});

// Get notification icon based on type
const getNotificationIcon = (notification) => {
	const type = notification.type || 'schedule'; // default to schedule
	return notification_type_icons[type] || notification_type_icons.schedule;
};

// Mobile bottom navigation
const showMoreMenu = ref(false);
const showProfileMenu = ref(false);
const maxVisibleItems = 4; // Including "More" button

const mobileNavItems = computed(() => {
	const items = [];
	
	// 1. Trang chủ
	items.push({
		id: 'home',
		name: 'Trang chủ',
		path: '/',
		icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
		iconViewBox: '0 0 24 24'
	});
	
	// 2. Tìm kiếm
	items.push({
		id: 'search',
		name: 'Tìm kiếm',
		path: '/search',
		icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
		iconViewBox: '0 0 24 24'
	});
	
	// 3. Tin nhắn
	if (isAuthenticatedCheck.value) {
		const messageItem = userMenuItems.find(item => item.id === 5); // Message item
		if (messageItem) {
			items.push({
				id: 'message',
				name: 'Tin nhắn',
				path: messageItem.path,
				icon: messageItem.icon,
				iconViewBox: messageItem.iconViewBox,
				badge: unreadData.value.messages
			});
		}

		items.push({
			id: 'profile',
			name: 'Hồ sơ',
			action: 'toggleProfileMenu',
			icon: ['M16 7a4 4 0 11-8 0 4 4 0 018 0z', 'M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'],
			iconViewBox: '0 0 24 24',
			isProfile: true
		});
	} else {
		items.push({
			id: 'login',
			name: 'Đăng nhập',
			path: '/auth/login',
			icon: ['M16 7a4 4 0 11-8 0 4 4 0 018 0z', 'M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'],
			iconViewBox: '0 0 24 24',
		});
	}
	
	return items;
});

const visibleNavItems = computed(() => {
	if (mobileNavItems.value.length <= maxVisibleItems) {
		return mobileNavItems.value;
	}
	return mobileNavItems.value.slice(0, maxVisibleItems - 1);
});

const moreMenuItems = computed(() => {
	if (mobileNavItems.value.length <= maxVisibleItems) {
		return [];
	}
	
	return mobileNavItems.value.slice(maxVisibleItems - 1);
});

const profileMenuItems = computed(() => {
	const items = [];
	
	// 1. Xem hồ sơ
	items.push({
		id: 'view_profile_custom',
		name: 'Xem hồ sơ',
		path: '/profile',
		icon: ['M16 7a4 4 0 11-8 0 4 4 0 018 0z', 'M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'],
		iconViewBox: '0 0 24 24',
		priority: 0
	});

	// 2. userMenuItems (excluding id 1 to avoid duplicate "Hồ sơ")
	items.push(...userMenuItems.filter(item => shouldShowItem(item) && item.id !== 1));

	// 3. navigationLinks
	const navIcons = {
		1: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
		2: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
		3: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
	};
	
	items.push(...navigationLinks.map(link => ({
		...link,
		icon: navIcons[link.id] || 'M4 6h16M4 12h16M4 18h16',
		iconViewBox: '0 0 24 24'
	})));

	// 4. headerActionButtons
	items.push(...headerActionButtons.filter(item => shouldShowItem(item)));

	// Sort by priority
	return items.sort((a, b) => (a.priority || 999) - (b.priority || 999));
});

const hasMoreItems = computed(() => moreMenuItems.value.length > 0);

const toggleMoreMenu = () => {
	showMoreMenu.value = !showMoreMenu.value;
	
	// Add haptic feedback for mobile
	if (process.client && navigator.vibrate) {
		navigator.vibrate(50);
	}
};

const closeMoreMenu = () => {
	showMoreMenu.value = false;
};

const handleMoreItemClick = (item) => {
	if (item.action) {
		handleMenuAction(item.action);
	}
	closeMoreMenu();
};

const toggleProfileMenu = () => {
	showProfileMenu.value = !showProfileMenu.value;
	showMoreMenu.value = false;
	
	if (process.client && navigator.vibrate) {
		navigator.vibrate(50);
	}
};

const closeProfileMenu = () => {
	showProfileMenu.value = false;
};

const handleMobileNavClick = (item) => {
	if (item.path) {
		navigateTo(item.path);
	} else if (item.action === 'toggleProfileMenu') {
		toggleProfileMenu();
	} else if (item.action) {
		handleMenuAction(item.action);
	}
};

const handleProfileItemClick = (item) => {
	if (item.action) {
		if (item.action === 'toggleNotifications') {
			toggleNotifications();
		} else {
			handleMenuAction(item.action);
		}
	}
	closeProfileMenu();
};
</script>

<template>
	<header class="header">
		<div class="container">
			<div class="header-content">
				<!-- Logo -->
				<Logo />

				<!-- Navigation Menu -->
				<nav class="nav-menu">
					<a v-for="link in navigationLinks" :key="link.id" :href="link.path" class="nav-link"
						@click.prevent="navigateTo(link.path)">
						{{ link.name }}
					</a>
				</nav>

				<!-- User / Mobile Menu -->
				<div class="user-menu">
					<div class="header-action-buttons" v-if="desktopActionButtons.length">
						<template v-for="action in desktopActionButtons" :key="action.id">
							<div v-if="action.type === 'icon'" :class="action.className" :title="action.tooltip">
								<svg :viewBox="action.iconViewBox" :fill="action.fill || 'none'"
									xmlns="http://www.w3.org/2000/svg">
									<template v-for="(item, i) in normalizeIcon(action.icon)" :key="i">
										<path v-if="item.type === 'path'" :d="item.d"
											:stroke="action.stroke || 'currentColor'"
											:stroke-width="action.strokeWidth || '2'"
											:stroke-linecap="action.strokeLinecap || 'round'"
											:stroke-linejoin="action.strokeLinejoin || 'round'" />
										<line v-else-if="item.type === 'line'" :x1="item.x1" :y1="item.y1" :x2="item.x2"
											:y2="item.y2" :stroke="action.stroke || 'currentColor'"
											:stroke-width="action.strokeWidth || '2'"
											:stroke-linecap="action.strokeLinecap || 'round'"
											:stroke-linejoin="action.strokeLinejoin || 'round'" />
									</template>
								</svg>
							</div>

							<a v-else-if="action.type === 'router-link'" :href="action.path" :class="action.className"
								:title="action.tooltip">
								<svg v-if="action.icon" :viewBox="action.iconViewBox" :fill="action.fill || 'none'"
									xmlns="http://www.w3.org/2000/svg">
									<template v-for="(item, i) in normalizeIcon(action.icon)" :key="i">
										<path v-if="item.type === 'path'" :d="item.d"
											:stroke="action.stroke || 'currentColor'"
											:stroke-width="action.strokeWidth || '2'"
											:stroke-linecap="action.strokeLinecap || 'round'"
											:stroke-linejoin="action.strokeLinejoin || 'round'" />
										<line v-else-if="item.type === 'line'" :x1="item.x1" :y1="item.y1" :x2="item.x2"
											:y2="item.y2" :stroke="action.stroke || 'currentColor'"
											:stroke-width="action.strokeWidth || '2'"
											:stroke-linecap="action.strokeLinecap || 'round'"
											:stroke-linejoin="action.strokeLinejoin || 'round'" />
									</template>
								</svg>
								<span v-if="action.label" class="action-label">{{ action.label }}</span>
							</a>

							<button v-else-if="action.type === 'action'" type="button" :class="action.className"
								@click="handleAuthAction(action.action)">
								<span v-if="action.label" class="action-label">{{ action.label }}</span>
							</button>
						</template>
					</div>

					<template v-if="isAuthenticatedCheck">
						<div v-if="notificationAction" :class="notificationAction.className"
							:title="notificationAction.tooltip" @click="handleHeaderAction(notificationAction.action)">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none"
								:viewBox="notificationAction.iconViewBox" stroke="currentColor">
								<path :d="notificationAction.icon" stroke-linecap="round" stroke-linejoin="round"
									:stroke-width="notificationAction.strokeWidth || '1.5'" />
							</svg>
							<span v-if="notificationAction.showBadge && unreadData[notificationAction.badgeKey] > 0"
								class="notification-badge">
								{{ unreadData[notificationAction.badgeKey] }}
							</span>
						</div>

						<div v-if="showNotifications" class="notification-panel show">
							<button class="mobile-close-button" @click="closeMenus">
								<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
										d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
							<div class="notification-header">
								<h3>Thông báo</h3>
								<button @click="markAllAsRead" class="mark-all-read"
									v-if="unreadData.notifications > 0">
									<svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
										viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
										stroke-linecap="round" stroke-linejoin="round">
										<path d="M18 6 7 17l-5-5"></path>
										<path d="m22 10-7.5 7.5L13 16"></path>
									</svg>
									Đánh dấu là đã đọc ({{ unreadData.notifications }})
								</button>
							</div>
							<div v-if="!notifications || notifications.length === 0" class="notification-empty">
								<svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
									viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
									stroke-linecap="round" stroke-linejoin="round">
									<path d="M10 2h4" />
									<path d="M12 14v-4" />
									<path d="M4.93 4.93 3.51 3.51" />
									<path d="M19.07 4.93 20.49 3.51" />
									<path d="M22 12h-2" />
									<path d="M4 12H2" />
									<path d="M19.07 19.07 20.49 20.49" />
									<path d="M4.93 19.07 3.51 20.49" />
									<circle cx="12" cy="12" r="6" />
								</svg>
								<div class="notification-empty-text">Hiện chưa có thông báo</div>
							</div>
							<div v-else class="notification-list format-scrollbar">
								<div v-for="notification in notifications" :key="notification.id"
									:class="['notification-item', { 'unread': !notification.is_read }]"
									@click="markNotificationAsRead(notification.id)">
									<div class="notification-icon">
										<svg
											v-if="!notification.icon"
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
										<img
											v-else
											:src="notification.icon"
											class="icon-lg"
										/>
									</div>
									<div class="notification-content">
										<div class="notification-title">{{ notification.name }}</div>
										<div class="notification-message">{{ notification.description }}</div>
										<div class="notification-time">{{ formatDateTime(notification.created_at) }}
										</div>
										<div class="notification-type">{{ notification.type_label }}
										</div>
									</div>
									<div class="notification-status" :class="{ 'unread': !notification.is_read }"></div>
								</div>
							</div>
							<div class="notification-footer">
								<NuxtLink to="/notification" class="view-all">
									Xem tất cả thông báo
								</NuxtLink>
							</div>
						</div>

						<div class="user-info" @click="navigateTo('/profile')">
							<img v-if="userData?.avatar" :src="userData.avatar" alt="User avatar" class="user-avatar">
							<div v-else class="user-avatar">
								{{ getFirstCharacterOfLastName(userData.full_name) }}
							</div>
						</div>
					</template>
				</div>
			</div>
		</div>
	</header>

	<!-- Mobile Bottom Navigation -->
	<nav class="mobile-bottom-nav">
		<button 
			v-for="item in visibleNavItems" 
			:key="item.id" 
			class="mobile-nav-item"
			:class="{ 'active': (item.path === '/' ? $route.path === '/' : (item.path && $route.path.startsWith(item.path))) || (item.id === 'profile' && showProfileMenu) }"
			@click="handleMobileNavClick(item)"
		>
			<div class="mobile-nav-icon-wrapper">
				<svg 
					v-if="Array.isArray(item.icon)"
					class="mobile-nav-icon" 
					:viewBox="item.iconViewBox" 
					fill="none" 
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path v-for="(path, index) in item.icon" :key="index" :d="path" />
				</svg>
				<svg 
					v-else
					class="mobile-nav-icon" 
					:viewBox="item.iconViewBox" 
					fill="none" 
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path :d="item.icon" />
				</svg>
				<span v-if="item.badge && item.badge > 0" class="mobile-nav-badge">{{ item.badge }}</span>
			</div>
			<span class="mobile-nav-label">{{ item.name }}</span>
		</button>

		<button 
			v-if="hasMoreItems"
			class="mobile-nav-item mobile-nav-more"
			:class="{ 'active': showMoreMenu }"
			@click="toggleMoreMenu"
		>
			<div class="mobile-nav-icon-wrapper">
				<svg 
					class="mobile-nav-icon" 
					viewBox="0 0 24 24" 
					fill="none" 
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<circle cx="12" cy="12" r="1" />
					<circle cx="12" cy="5" r="1" />
					<circle cx="12" cy="19" r="1" />
				</svg>
			</div>
			<span class="mobile-nav-label">Thêm</span>
		</button>
	</nav>

	<!-- More Menu Overlay -->
	<Transition name="more-menu-overlay">
		<div v-if="showMoreMenu" class="more-menu-overlay" @click="closeMoreMenu"></div>
	</Transition>

	<!-- More Menu Panel -->
	<Transition name="more-menu">
		<div v-if="showMoreMenu" class="more-menu-panel">
			<div class="more-menu-header">
				<h3>Thêm</h3>
				<button class="more-menu-close" @click="closeMoreMenu">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			<div class="more-menu-content">
				<template v-for="item in moreMenuItems" :key="item.id">
					<NuxtLink 
						v-if="!item.action" 
						:to="item.path" 
						class="more-menu-item"
						@click="closeMoreMenu"
					>
						<svg 
							v-if="Array.isArray(item.icon)"
							class="more-menu-icon" 
							:viewBox="item.iconViewBox || '0 0 24 24'" 
							fill="none" 
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path v-for="(path, index) in item.icon" :key="index" :d="path" />
						</svg>
						<svg 
							v-else
							class="more-menu-icon" 
							:viewBox="item.iconViewBox || '0 0 24 24'" 
							fill="none" 
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path :d="item.icon" />
						</svg>
						<span class="more-menu-label">{{ item.name }}</span>
					</NuxtLink>

					<button 
						v-else
						class="more-menu-item"
						@click="handleMoreItemClick(item)"
					>
						<svg 
							v-if="Array.isArray(item.icon)"
							class="more-menu-icon" 
							:viewBox="item.iconViewBox || '0 0 24 24'" 
							fill="none" 
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path v-for="(path, index) in item.icon" :key="index" :d="path" />
						</svg>
						<svg 
							v-else
							class="more-menu-icon" 
							:viewBox="item.iconViewBox || '0 0 24 24'" 
							fill="none" 
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
			stroke-linejoin="round"
						>
							<path :d="item.icon" />
						</svg>
						<span class="more-menu-label">{{ item.name }}</span>
					</button>
				</template>
			</div>
		</div>
	</Transition>

	<!-- Profile Menu Overlay -->
	<Transition name="more-menu-overlay">
		<div v-if="showProfileMenu" class="more-menu-overlay" @click="closeProfileMenu"></div>
	</Transition>

	<!-- Profile Menu Panel -->
	<Transition name="more-menu">
		<div v-if="showProfileMenu" class="more-menu-panel">
			<div class="more-menu-header">
				<h3>Menu</h3>
				<button class="more-menu-close" @click="closeProfileMenu">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			<div class="more-menu-content">
				<template v-for="item in profileMenuItems" :key="item.id">
					<NuxtLink 
						v-if="!item.action" 
						:to="item.path" 
						class="more-menu-item"
						@click="closeProfileMenu"
					>
						<svg 
							v-if="Array.isArray(item.icon)"
							class="more-menu-icon" 
							:viewBox="item.iconViewBox || '0 0 24 24'" 
							fill="none" 
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path v-for="(path, index) in item.icon" :key="index" :d="path" />
						</svg>
						<svg 
							v-else
							class="more-menu-icon" 
							:viewBox="item.iconViewBox || '0 0 24 24'" 
							fill="none" 
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path :d="item.icon" />
						</svg>
						<span class="more-menu-label">{{ item.name || item.label || item.tooltip }}</span>
						<span v-if="item.badgeKey && unreadData[item.badgeKey] > 0" class="mobile-nav-badge" style="position: static; margin-left: auto;">
							{{ unreadData[item.badgeKey] }}
						</span>
					</NuxtLink>

					<button 
						v-else
						class="more-menu-item"
						@click="handleProfileItemClick(item)"
					>
						<svg 
							v-if="Array.isArray(item.icon)"
							class="more-menu-icon" 
							:viewBox="item.iconViewBox || '0 0 24 24'" 
							fill="none" 
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path v-for="(path, index) in item.icon" :key="index" :d="path" />
						</svg>
						<svg 
							v-else
							class="more-menu-icon" 
							:viewBox="item.iconViewBox || '0 0 24 24'" 
							fill="none" 
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path :d="item.icon" />
						</svg>
						<span class="more-menu-label">{{ item.name || item.label || item.tooltip }}</span>
						<span v-if="item.badgeKey && unreadData[item.badgeKey] > 0" class="mobile-nav-badge" style="position: static; margin-left: auto;">
							{{ unreadData[item.badgeKey] }}
						</span>
					</button>
				</template>
			</div>
		</div>
	</Transition>
</template>

<style scoped>
.header {
	backdrop-filter: blur(20px);
	border-bottom: 1px solid rgba(226, 232, 240, 1);
	position: sticky;
	top: 0;
	z-index: 100;
	background: white;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@media (max-width: 768px) {
	.header {
		display: none;
	}
}

.header::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 1px;
	background: linear-gradient(90deg, transparent 0%, rgba(102, 126, 234, 0.3) 50%, transparent 100%);
}

.header-content {
	height: var(--height-header);
	display: flex;
	align-items: center;
	justify-content: space-between;
	position: relative;
}

.nav-menu {
	display: flex;
	gap: 2rem;
	align-items: center;
}

.nav-link {
	text-decoration: none;
	font-weight: 500;
	font-size: var(--font-size-small);
	padding: 0.75rem 1.25rem;
	border-radius: 12px;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	position: relative;
	overflow: hidden;
}

.nav-link::before {
	content: '';
	position: absolute;
	top: 0;
	left: -100%;
	width: 100%;
	height: 100%;
	background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
	transition: left 0.5s ease;
}

.nav-link:hover {
	color: var(--color-primary);
	background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.nav-link:hover::before {
	left: 100%;
}

.auth-buttons {
	display: flex;
	gap: 1rem;
	align-items: center;
}

.login-button {
	padding: 0.75rem 1.5rem;
	background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%);
	border: 1px solid rgba(226, 232, 240, 0.5);
	border-radius: 12px;
	color: #64748b;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	backdrop-filter: blur(10px);
	position: relative;
	overflow: hidden;
}

.login-button::before {
	content: '';
	position: absolute;
	top: 0;
	left: -100%;
	width: 100%;
	height: 100%;
	background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
	transition: left 0.5s ease;
}

.login-button:hover {
	color: #667eea;
	border-color: rgba(102, 126, 234, 0.3);
	transform: translateY(-2px);
	box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
}

.login-button:hover::before {
	left: 100%;
}

.register-button {
	padding: 0.75rem 1.5rem;
	background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
	border: none;
	border-radius: 12px;
	color: white;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	position: relative;
	overflow: hidden;
	box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.register-button::before {
	content: '';
	position: absolute;
	top: 0;
	left: -100%;
	width: 100%;
	height: 100%;
	background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
	transition: left 0.5s ease;
}

.register-button:hover {
	transform: translateY(-2px);
	box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-button:hover::before {
	left: 100%;
}

.user-menu {
	position: relative;
	display: flex;
	align-items: center;
	gap: 1rem;
}

.user-menu svg {
	width: 18px;
	height: 18px;
}

.header-action-buttons {
	display: flex;
	align-items: center;
	gap: 1rem;
}

.header-action-buttons .header-cta {
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
}
.menu-action-buttons {
	display: none;
}

.menu-action-item {
	display: flex;
	align-items: center;
	gap: 0.75rem;
}

.menu-action-label {
	font-weight: 600;
	/* color: #374151; */
}

.menu-action-divider {
	margin: 0.5rem 0 0.25rem;
}

.mobile-menu-trigger {
	display: none;
	border: none;
	background: transparent;
	padding: 0.25rem;
	color: #64748b;
	border-radius: 12px;
	transition: all 0.3s ease;
}

.mobile-menu-trigger:active {
	transform: scale(0.96);
}

.mobile-nav-links {
	display: none;
}

.mobile-nav-item {
	font-weight: 600;
}

.menu-auth-buttons {
	display: none;
}

.menu-auth-item {
	justify-content: center;
	font-weight: 600;
}

.user-info {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem;
	cursor: pointer;
	border-radius: 12px;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	color: black;
	position: relative;
	overflow: hidden;
}

.user-info::after {
	content: '';
	position: absolute;
	top: 50%;
	left: 50%;
	width: 0;
	height: 0;
	background: radial-gradient(circle, rgba(102, 126, 234, 0.3) 0%, transparent 70%);
	border-radius: 50%;
	transform: translate(-50%, -50%);
	transition: all 0.6s ease;
	pointer-events: none;
}

.user-info:active::after {
	width: 200px;
	height: 200px;
}

.user-info::before {
	content: '';
	position: absolute;
	top: 0;
	left: -100%;
	width: 100%;
	height: 100%;
	background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
	transition: left 0.5s ease;
}

.user-info:hover {
	color: var(--color-primary);
	background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.user-info:hover::before {
	left: 100%;
}

.user-info svg {
	transition: all 0.3s ease;
}

.user-info:hover svg {
	transform: scale(1.1);
	color: var(--color-primary);
}

.user-avatar {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 2.5rem;
	height: 2.5rem;
	border-radius: 50%;
	object-fit: cover;
	border: 2px solid var(--color-primary-light);
	/* background: linear-gradient(135deg, var(--color-primary-transparent) 0%, var(--color-primary-light) 100%); */
	transition: all 0.3s ease;
	font-weight: 600;
	color: var(--color-primary);
}

.user-info:hover .user-avatar {
	border-color: var(--color-primary-light);
	transform: scale(1.05);
	box-shadow: 0 4px 12px var(--color-primary-light);
}

.user-name {
	font-weight: 600;
	color: #374151;
}

.dropdown-icon {
	width: 16px;
	height: 16px;
	color: #94a3b8;
	transition: all 0.3s ease;
}

.dropdown-menu {
	position: absolute;
	top: calc(100% + 8px);
	right: 0;
	background: rgba(255, 255, 255, 0.95);
	backdrop-filter: blur(20px);
	border: 1px solid rgba(255, 255, 255, 0.2);
	border-radius: 13px;
	box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.06);
	min-width: 220px;
	padding: 0.5rem;
	opacity: 0;
	transform: translateY(-20px) scale(0.8) rotateX(-10deg);
	transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
	pointer-events: none;
	transform-origin: top right;
	animation: dropdownClose 0.3s ease-out forwards;
}

.dropdown-menu.show {
	opacity: 1;
	transform: translateY(0) scale(1) rotateX(0deg);
	pointer-events: auto;
	animation: dropdownOpen 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes dropdownOpen {
	0% {
		opacity: 0;
		transform: translateY(-20px) scale(0.8) rotateX(-10deg);
	}

	50% {
		opacity: 0.8;
		transform: translateY(-5px) scale(0.95) rotateX(-5deg);
	}

	100% {
		opacity: 1;
		transform: translateY(0) scale(1) rotateX(0deg);
	}
}

@keyframes dropdownClose {
	0% {
		opacity: 1;
		transform: translateY(0) scale(1) rotateX(0deg);
	}

	100% {
		opacity: 0;
		transform: translateY(-20px) scale(0.8) rotateX(-10deg);
	}
}

.dropdown-menu::before {
	content: '';
	position: absolute;
	top: -8px;
	right: 16px;
	width: 16px;
	height: 16px;
	background: rgba(255, 255, 255, 0.95);
	border: 1px solid rgba(255, 255, 255, 0.2);
	border-bottom: none;
	border-right: none;
	transform: rotate(45deg);
	backdrop-filter: blur(20px);
}

.dropdown-item {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.875rem 1rem;
	color: #374151;
	text-decoration: none;
	border-radius: 12px;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	position: relative;
	overflow: hidden;
	font-weight: 500;
	opacity: 0;
	transform: translateX(-20px);
	animation: dropdownItemSlideIn 0.3s ease-out forwards;
	font-size: var(--font-size-small);
}

.dropdown-item:nth-child(1) {
	animation-delay: 0.1s;
}

.dropdown-item:nth-child(2) {
	animation-delay: 0.15s;
}

.dropdown-item:nth-child(3) {
	animation-delay: 0.2s;
}

.dropdown-item:nth-child(4) {
	animation-delay: 0.25s;
}

.dropdown-item:nth-child(5) {
	animation-delay: 0.3s;
}

.dropdown-item:nth-child(6) {
	animation-delay: 0.35s;
}

@keyframes dropdownItemSlideIn {
	0% {
		opacity: 0;
		transform: translateX(-20px);
	}

	100% {
		opacity: 1;
		transform: translateX(0);
	}
}

.dropdown-item::before {
	content: '';
	position: absolute;
	top: 0;
	left: -100%;
	width: 100%;
	height: 100%;
	background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
	transition: left 0.5s ease;
}

.dropdown-item:hover {
	background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
	color: var(--color-primary);
	transform: translateX(4px);
}

.dropdown-item:hover::before {
	left: 100%;
}

.dropdown-item svg {
	width: 18px;
	height: 18px;
	transition: all 0.3s ease;
}

.dropdown-item:hover svg {
	color: var(--color-primary);
	transform: scale(1.1);
}

.dropdown-item.active,
.dropdown-item:active {
	background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}

.dropdown-divider {
	margin: 0.5rem 0;
	border: none;
	border-top: 1px solid rgba(226, 232, 240, 0.5);
}

.text-red {
	color: #ef4444;
}

.text-red:hover {
	color: #dc2626;
	background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.05) 100%);
}

@media (max-width: 1024px) {
	.nav-menu {
		display: none;
	}
}

/* Menu Overlay - Similar to BaseModal */

/* Mobile Close Button */
.mobile-close-button {
	display: none;
}

@media (max-width: 1024px) {
	.menu-action-buttons {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.mobile-nav-links {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.menu-auth-buttons {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	@keyframes overlayFadeIn {
		from {
			opacity: 0;
			backdrop-filter: blur(0px);
		}

		to {
			opacity: 1;
			backdrop-filter: blur(8px);
		}
	}

	/* Mobile Close Button */
	.mobile-close-button {
		display: flex;
		position: absolute;
		top: 1.5rem;
		right: 1.5rem;
		background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
		border: 2px solid rgba(226, 232, 240, 0.8);
		color: #64748b;
		cursor: pointer;
		padding: 10px;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		border-radius: 50%;
		width: 40px;
		height: 40px;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		z-index: 10;
	}

	.mobile-close-button:hover {
		background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
		border-color: var(--color-primary);
		color: var(--color-primary);
		transform: scale(1.1) rotate(90deg);
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
	}

	.mobile-close-button:active {
		transform: scale(0.95) rotate(90deg);
	}

	/* Full Screen Dropdown Menu for Mobile */
	.dropdown-menu {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: auto;
		width: 85%;
		max-width: 400px;
		height: 100vh;
		margin: 0;
		border-radius: 0;
		padding: 5rem 1.5rem 2rem 1.5rem;
		background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
		backdrop-filter: blur(20px);
		box-shadow: -10px 0 40px rgba(0, 0, 0, 0.2);
		overflow-y: auto;
		z-index: 100;
		opacity: 0;
		transform: translateX(100%);
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		pointer-events: none;
		animation: none;
	}

	.dropdown-menu.show {
		opacity: 1;
		transform: translateX(0);
		pointer-events: auto;
		animation: slideInFromRight 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
	}

	.dropdown-menu::before {
		display: none;
	}

	@keyframes slideInFromRight {
		0% {
			opacity: 0;
			transform: translateX(100%);
		}

		100% {
			opacity: 1;
			transform: translateX(0);
		}
	}

	/* Dropdown items animation for mobile */
	.dropdown-item {
		opacity: 0;
		transform: translateX(50px);
		animation: slideItemFromRight 0.3s ease-out forwards;
	}

	.dropdown-item:nth-child(1) {
		animation-delay: 0.1s;
	}

	.dropdown-item:nth-child(2) {
		animation-delay: 0.15s;
	}

	.dropdown-item:nth-child(3) {
		animation-delay: 0.2s;
	}

	.dropdown-item:nth-child(4) {
		animation-delay: 0.25s;
	}

	.dropdown-item:nth-child(5) {
		animation-delay: 0.3s;
	}

	.dropdown-item:nth-child(6) {
		animation-delay: 0.35s;
	}

	@keyframes slideItemFromRight {
		0% {
			opacity: 0;
			transform: translateX(50px);
		}

		100% {
			opacity: 1;
			transform: translateX(0);
		}
	}

	.notification-panel {
		position: fixed !important;
		top: 0 !important;
		right: 0 !important;
		bottom: 0 !important;
		left: auto;
		height: 100vh;
		margin: 0;
		border-radius: 0;
		padding: 5rem 0.5rem 2rem 0.5rem;
		background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
		backdrop-filter: blur(20px);
		box-shadow: -10px 0 40px rgba(0, 0, 0, 0.2);
		overflow-y: auto;
		z-index: 110;
		opacity: 0;
		transform: translateX(100%);
		pointer-events: none;
		animation: none;
		width: 100%;
	}

	.notification-panel.show {
		opacity: 1;
		transform: translateX(0);
		pointer-events: auto;
		animation: slideInFromRight 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
	}

	.notification-panel::before {
		display: none;
	}

	.notification-header,
	.notification-list,
	.notification-footer,
	.notification-empty {
		padding-left: 0;
		padding-right: 0;
	}

	.notification-header {
		padding-top: 0.5rem;
	}

	.notification-list {
		max-height: none;
	}
}

@media (max-width: 640px) {
	.logo-text {
		display: none;
	}

	.auth-buttons {
		gap: 8px;
	}

	.login-button,
	.register-button {
		padding: 8px 12px;
		font-size: 14px;
	}

	.dropdown-menu {
		width: 100%;
		max-width: none;
		padding: 5rem 1.25rem 2rem 1.25rem;
	}

	.mobile-close-button {
		top: 1.25rem;
		right: 1.25rem;
	}
}

/* Enhanced Notification Styles */
.notification-button-card {
	position: relative;
	cursor: pointer;
	border-radius: 12px;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	padding: 0.5rem;
	overflow: hidden;
}

.notification-button-card::after {
	content: '';
	position: absolute;
	top: 50%;
	left: 50%;
	width: 0;
	height: 0;
	background: radial-gradient(circle, rgba(102, 126, 234, 0.2) 0%, transparent 70%);
	border-radius: 50%;
	transform: translate(-50%, -50%);
	transition: all 0.6s ease;
	pointer-events: none;
}

.notification-button-card:active::after {
	width: 150px;
	height: 150px;
}

.notification-button-card:hover {
	background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
	transform: translateY(-2px) scale(1.05);
	box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.notification-icon {
	color: #64748b;
	transition: all 0.3s ease;
}

.notification-button-card:hover .notification-icon {
	color: var(--color-primary);
	transform: scale(1.1);
}

.notification-badge {
	position: absolute;
	top: 4px;
	right: 4px;
	background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
	color: white;
	font-size: 0.5rem;
	min-width: 1rem;
	height: 1rem;
	border-radius: 50%;
	border: 1px solid white;
	font-weight: 600;
	display: flex;
	justify-content: center;
	align-items: center;
	box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
	animation: pulse 2s infinite, badgeBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
	transform-origin: center;
}

@keyframes badgeBounce {
	0% {
		transform: scale(0);
	}

	50% {
		transform: scale(1.2);
	}

	100% {
		transform: scale(1);
	}
}

@keyframes pulse {

	0%,
	100% {
		transform: scale(1);
	}

	50% {
		transform: scale(1.1);
	}
}

.notification-panel {
	position: absolute;
	top: calc(100% + 8px);
	right: 0;
	width: 400px;
	background: rgba(255, 255, 255, 0.98);
	backdrop-filter: blur(18px);
	border: 1px solid rgba(255, 255, 255, 0.25);
	border-radius: 18px;
	box-shadow: 0 18px 45px rgba(15, 23, 42, 0.12);
	z-index: 50;
	opacity: 0;
	transform: translateY(-16px) scale(0.96);
	transition: opacity 0.25s ease, transform 0.25s ease;
	pointer-events: none;
	transform-origin: top right;
	animation: notificationSlideUp 0.25s ease-out forwards;
}

.notification-panel.show {
	opacity: 1;
	transform: translateY(0) scale(1);
	pointer-events: auto;
	animation: notificationSlideDown 0.28s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
}

@keyframes notificationSlideDown {
	0% {
		opacity: 0;
		transform: translateY(-16px) scale(0.96);
	}

	100% {
		opacity: 1;
		transform: translateY(0) scale(1);
	}
}

@keyframes notificationSlideUp {
	0% {
		opacity: 1;
		transform: translateY(0) scale(1);
	}

	100% {
		opacity: 0;
		transform: translateY(-16px) scale(0.96);
	}
}

.notification-empty {
	padding: 2rem 1.5rem;
	text-align: center;
	color: #64748b;
}

.notification-empty .icon-md {
	margin-bottom: 0.5rem;
	color: #94a3b8;
}

.notification-empty-text {
	font-weight: 600;
}

.notification-panel::before {
	content: '';
	position: absolute;
	top: -8px;
	right: 20px;
	width: 16px;
	height: 16px;
	background: rgba(255, 255, 255, 0.95);
	border: 1px solid rgba(255, 255, 255, 0.2);
	border-bottom: none;
	border-right: none;
	transform: rotate(45deg);
	backdrop-filter: blur(20px);
}

.notification-header {
	padding: 1.5rem 1.5rem 1rem 1.5rem;
	border-bottom: 1px solid rgba(226, 232, 240, 0.5);
	display: flex;
	justify-content: space-between;
	align-items: center;
	opacity: 0;
	transform: translateY(-10px);
	animation: headerSlideIn 0.4s ease-out 0.2s forwards;
}

@keyframes headerSlideIn {
	0% {
		opacity: 0;
		transform: translateY(-10px);
	}

	100% {
		opacity: 1;
		transform: translateY(0);
	}
}

.notification-header h3 {
	font-size: var(--font-size-medium);
	font-weight: 700;
	background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	margin: 0;
}

.mark-all-read {
	font-size: var(--font-size-mini);
	color: var(--color-primary);
	background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
	border: 1px solid rgba(102, 126, 234, 0.2);
	cursor: pointer;
	padding: 0.5rem 1rem;
	border-radius: 12px;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-weight: 500;
}

.mark-all-read:hover {
	background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.notification-list {
	max-height: 400px;
	overflow-y: auto;
	padding: 0.5rem;
}

.notification-item {
	padding: 1rem;
	display: flex;
	gap: 1rem;
	border-radius: 12px;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	cursor: pointer;
	margin-bottom: 0.5rem;
	position: relative;
	overflow: hidden;
	opacity: 0;
	transform: translateY(20px);
	animation: notificationItemSlideIn 0.4s ease-out forwards;
}

.notification-item:nth-child(1) {
	animation-delay: 0.1s;
}

.notification-item:nth-child(2) {
	animation-delay: 0.15s;
}

.notification-item:nth-child(3) {
	animation-delay: 0.2s;
}

.notification-item:nth-child(4) {
	animation-delay: 0.25s;
}

.notification-item:nth-child(5) {
	animation-delay: 0.3s;
}

.notification-item:nth-child(6) {
	animation-delay: 0.35s;
}

@keyframes notificationItemSlideIn {
	0% {
		opacity: 0;
		transform: translateY(20px);
	}

	100% {
		opacity: 1;
		transform: translateY(0);
	}
}

.notification-item::before {
	content: '';
	position: absolute;
	top: 0;
	left: -100%;
	width: 100%;
	height: 100%;
	background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
	transition: left 0.5s ease;
}

.notification-item.unread {
	background: linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%);
	border: 1px solid rgba(102, 126, 234, 0.1);
}

.notification-item:hover {
	background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
	transform: translateX(4px);
}

.notification-item:hover::before {
	left: 100%;
}

.notification-item .notification-icon {
	background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
	border-radius: 50%;
	width: 3rem;
	height: 3rem;
	display: flex;
	align-items: center;
	justify-content: center;
	color: white;
	border: 2px solid rgba(255, 255, 255, 0.3);
	box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
	transition: all 0.3s ease;
	flex-shrink: 0;
}

.notification-item:hover .notification-icon {
	transform: scale(1.1);
	box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.notification-content {
	flex: 1;
	min-width: 0;
}

.notification-title {
	font-weight: 600;
	color: #1f2937;
	margin-bottom: 0.25rem;
	font-size: 0.875rem;
}

.notification-message {
	color: #6b7280;
	font-size: 0.8125rem;
	margin-bottom: 0.25rem;
	line-height: 1.4;
}

.notification-type {
	font-size: 0.75rem;
	font-weight: 500;
	padding: 0.125rem 0.5rem;
	border-radius: 8px;
	display: inline-block;
	border: 1px solid var(--gray-300);
}

.notification-time {
	color: #9ca3af;
	font-size: 0.75rem;
}

.notification-footer {
	padding: 1rem 1.5rem;
	text-align: center;
	border-top: 1px solid rgba(226, 232, 240, 0.5);
}

.notification-status {
	width: 0.5rem;
	height: 0.5rem;
	background: #d1d5db;
	border-radius: 50%;
	flex-shrink: 0;
	transition: all 0.3s ease;
}

.notification-status.unread {
	background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
	box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.view-all {
	color:black;
	text-decoration: none;
	font-size: var(--font-size-mini);
	font-weight: 600;
	padding: 0.5rem 1rem;
	border-radius: 12px;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	display: inline-block;
}

.view-all:hover {
	background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

/* Mobile Bottom Navigation */
.mobile-bottom-nav {
	display: none;
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background: #fff;
	border-top: 1px solid #e5e7eb;
	padding: 0.5rem 0;
	z-index: 1000;
	box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.mobile-nav-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	flex: 1;
	padding: 0.5rem;
	text-decoration: none;
	color: #6b7280;
	transition: all 0.2s ease;
	border: none;
	background: transparent;
	cursor: pointer;
	position: relative;
}

.mobile-nav-item.active {
	color: #000;
}

.mobile-nav-item.active .mobile-nav-icon-wrapper::before {
	content: '';
	position: absolute;
	top: -0.5rem;
	left: 50%;
	transform: translateX(-50%);
	width: 32px;
	height: 3px;
	background: #000;
	border-radius: 0 0 3px 3px;
}

.mobile-nav-icon-wrapper {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 0.25rem;
}

.mobile-nav-icon {
	width: 24px;
	height: 24px;
}

.mobile-nav-label {
	font-size: 0.75rem;
	font-weight: 500;
	text-align: center;
}

.mobile-nav-badge {
	position: absolute;
	top: -4px;
	right: -4px;
	background: #ef4444;
	color: #fff;
	font-size: 0.625rem;
	font-weight: 600;
	min-width: 16px;
	height: 16px;
	border-radius: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 4px;
}

/* More Menu Overlay */
.more-menu-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	z-index: 1001;
	backdrop-filter: blur(4px);
}

.more-menu-overlay-enter-active,
.more-menu-overlay-leave-active {
	transition: opacity 0.3s ease;
}

.more-menu-overlay-enter-from,
.more-menu-overlay-leave-to {
	opacity: 0;
}

/* More Menu Panel */
.more-menu-panel {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background: #fff;
	border-radius: 20px 20px 0 0;
	z-index: 1002;
	max-height: 70vh;
	display: flex;
	flex-direction: column;
	box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
}

.more-menu-enter-active,
.more-menu-leave-active {
	transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.more-menu-enter-from,
.more-menu-leave-to {
	transform: translateY(100%);
}

.more-menu-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 1.25rem 1.5rem;
	border-bottom: 1px solid #e5e7eb;
}

.more-menu-header h3 {
	font-size: 1.125rem;
	font-weight: 600;
	color: #1f2937;
	margin: 0;
}

.more-menu-close {
	width: 32px;
	height: 32px;
	border-radius: 50%;
	border: none;
	background: #f3f4f6;
	color: #6b7280;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.2s ease;
}

.more-menu-close svg {
	width: 20px;
	height: 20px;
}

.more-menu-close:active {
	transform: scale(0.95);
	background: #e5e7eb;
}

.more-menu-content {
	overflow-y: auto;
	padding: 0.5rem;
	flex: 1;
}

.more-menu-item {
	display: flex;
	align-items: center;
	gap: 1rem;
	padding: 1rem 1.25rem;
	text-decoration: none;
	color: #374151;
	border-radius: 12px;
	transition: all 0.2s ease;
	border: none;
	background: transparent;
	width: 100%;
	text-align: left;
	cursor: pointer;
	font-size: 1rem;
}

.more-menu-item:active {
	background: #f3f4f6;
	transform: scale(0.98);
}

.more-menu-icon {
	width: 24px;
	height: 24px;
	flex-shrink: 0;
}

.more-menu-label {
	font-weight: 500;
	flex: 1;
}

@media (max-width: 768px) {
	.mobile-bottom-nav {
		display: flex;
	}

	/* Add padding to body to account for fixed bottom nav */
	body {
		padding-bottom: env(safe-area-inset-bottom, 0);
	}
}
</style>
