<script setup>
definePageMeta({
	layout: 'empty',
	middleware: [
		() => {
		useLayoutStore().setHiddenFooter(true)
		}
	]
});


import { ref, computed, onMounted, onUnmounted } from 'vue';

const router = useRouter();

// Tabs
const currentTab = ref('personal-info');

const tabs = [
	{ id: 'personal-info', label: 'Thông tin cá nhân', icon: 'personal-info' },
	{ id: 'login-security', label: 'Đăng nhập và bảo mật', icon: 'login-security' },
	{ id: 'privacy', label: 'Quyền riêng tư', icon: 'privacy' },
	{ id: 'notifications', label: 'Thông báo', icon: 'notifications' },
	{ id: 'taxes', label: 'Thuế', icon: 'taxes' },
	{ id: 'payments', label: 'Thanh toán', icon: 'payments' },
	{ id: 'global-preferences', label: 'Ngôn ngữ và loại tiền tệ', icon: 'global-preferences' },
];

const goHome = () => {
	router.push('/');
};
</script>

<template>
	<div class="airbnb-settings-page">
		<!-- Header -->
		<header class="settings-header">
			<div class="header-container container">
				<div class="logo" @click="goHome">
					<Logo />
				</div>
				<button class="btn-done" @click="goHome">Hoàn tất</button>
			</div>
		</header>

		<main class="settings-main">
			<div class="main-container container">
				<!-- Sidebar -->
				<aside class="settings-sidebar">
					<h1 class="sidebar-title">Cài đặt tài khoản</h1>
					<nav class="sidebar-nav">
						<a href="#" 
                           v-for="tab in tabs" 
                           :key="tab.id"
                           class="nav-item" 
                           :class="{ active: currentTab === tab.id }"
                           @click.prevent="currentTab = tab.id">
							<div class="nav-icon">
                                <!-- Icons based on tab.icon -->
								<svg v-if="tab.icon === 'personal-info'" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style="display: block; height: 24px; width: 24px; fill: currentcolor;"><path d="m16 19c6.1471 0 11.297 4.2667 12.6514 10h-2.0694c-1.3062-4.6165-5.5473-8-10.582-8s-9.27583 3.3835-10.58203 8h-2.06934c1.35439-5.7333 6.50427-10 12.65137-10zm0-13c3.0376 0 5.5 2.46244 5.5 5.5 0 3.0376-2.4624 5.5-5.5 5.5s-5.5-2.4624-5.5-5.5c0-3.03757 2.4624-5.5 5.5-5.5zm0 2c-1.933 0-3.5 1.567-3.5 3.5s1.567 3.5 3.5 3.5 3.5-1.567 3.5-3.5-1.567-3.5-3.5-3.5z"></path></svg>
                                <svg v-if="tab.icon === 'login-security'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" style="display: block; height: 24px; width: 24px; fill: currentcolor;"><path d="m16 .8.56.37C20.4 3.73 24.2 5 28 5h1v12.5C29 25.57 23.21 31 16 31S3 25.57 3 17.5V5h1c3.8 0 7.6-1.27 11.45-3.83L16 .8zm-1 3a22.2 22.2 0 0 1-9.65 3.15L5 6.97V17.5c0 6.56 4.35 11 10 11.46zm2 0v25.16c5.65-.47 10-4.9 10-11.46V6.97l-.35-.02A22.2 22.2 0 0 1 17 3.8z"></path></svg>
                                <svg v-if="tab.icon === 'privacy'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" style="display: block; height: 24px; width: 24px; fill: currentcolor;"><path d="M16 2a3 3 0 0 1 2.9 2.21c.28-.12.6-.19.92-.2L20 4h.18A3 3 0 0 1 23 6.82v.35c.2-.07.4-.12.61-.14l.22-.02L24 7a3 3 0 0 1 3 2.82v10.81l-.03.1v.1a10 10 0 0 1-9.41 9.15l-.28.02H17a9.99 9.99 0 0 1-8.13-4.18l-.1-.14-.05-.05-.07-.1-1.34-2.17L3.67 16a3 3 0 0 1 5.1-3.15l.1.15.13.23V7a3 3 0 0 1 2.65-2.98l.17-.01L12 4c.39 0 .76.07 1.1.21A3 3 0 0 1 16 2zm0 2a1 1 0 0 0-1 .88V15h-2V7a1 1 0 0 0-2-.12v9.19a7 7 0 0 1 6 6.69V23h-2a5 5 0 0 0-4.78-5H9.43l-2.3-4a1 1 0 0 0-1.36-.37 1 1 0 0 0-.4 1.31l.06.12 3.63 7.33 1.2 1.95.09.1a8 8 0 0 0 14.62-3.74l.02-.25.01-.11V10a1 1 0 0 0-.77-.97L24.12 9 24 9a1 1 0 0 0-1 1v5h-2V7a1 1 0 0 0-.88-1h-.24a1 1 0 0 0-.87.88L19 7v8h-2V5a1 1 0 0 0-1-1z"></path></svg>
                                <svg v-if="tab.icon === 'notifications'" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style="display: block; height: 24px; width: 24px; fill: currentcolor;"><path d="m17 1 .0001009 2.04938529c5.0532743.50177151 8.9998991 4.765307 8.9998991 9.95071081l-.0017211 7.1849039 2.6238637 3.6469846c.1627256.2261823.2758911.48315.3366058.7901878l.0301116.1903853.0097863.1874423c0 1.1045695-.8954305 2-2 2h-7.3324683l.0004887.3333333c0 2.0250441-1.6416226 3.6666667-3.6666667 3.6666667s-3.6666667-1.6416226-3.6666667-3.6666667l-.0001553-.3333333h-7.33182434c-.4191735 0-.82775206-.1317032-1.16801537-.3765037-.89663222-.6450771-1.10055797-1.8948794-.45559816-2.7913486l2.62153872-3.6461477.00082568-7.2004584.00415152-.2798473c.14655887-5.06150988 4.04689595-9.16391295 8.99477955-9.65616465l.0009644-2.04952965zm.666178 26h-3.333l.0001553.3333333c0 .9204746.7461921 1.6666667 1.6666667 1.6666667s1.6666667-.7461921 1.6666667-1.6666667zm-1.666178-22c-4.3303084 0-7.87156533 3.44605088-7.99626742 7.7490961l-.00373258.2509999-.00075209 7.831181-2.99789425 4.168723h21.99692524l-2.999031-4.1697417.0007521-7.8302583c0-4.418278-3.581722-8-8-8z"></path></svg>
                                <svg v-if="tab.icon === 'taxes'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" style="display: block; height: 24px; width: 24px; fill: currentcolor;"><path d="M25 4a2 2 0 0 1 2 1.85V8h2.04c1.04 0 1.88.82 1.96 1.85V26c0 1.05-.8 1.92-1.81 2H6.96a1.98 1.98 0 0 1-1.95-1.85L5 26v-2H3a2 2 0 0 1-2-1.85V6a2 2 0 0 1 1.85-2H3zm2 18a2 2 0 0 1-1.85 2H7v2h22V10h-2zM25 6H3v16h22zm-3 12a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm-8-8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM6 8a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"></path></svg>
                                <svg v-if="tab.icon === 'payments'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" style="display: block; height: 24px; width: 24px; fill: currentcolor;"><path d="M16 1a15 15 0 1 1 0 30 15 15 0 0 1 0-30zm4.4 21h-8.8c.89 4.18 2.63 7 4.4 7 1.77 0 3.51-2.82 4.4-7zM9.55 22H4.46a13.04 13.04 0 0 0 7.48 6.35A17.63 17.63 0 0 1 9.55 22zm17.98 0h-5.08a17.62 17.62 0 0 1-2.39 6.35A13.04 13.04 0 0 0 27.54 22zM9.23 12h-5.6A12.99 12.99 0 0 0 3 16a13 13 0 0 0 .63 4h5.6A33.06 33.06 0 0 1 9 16c0-1.38.08-2.72.24-4zm11.51 0h-9.48a30.45 30.45 0 0 0-.26 4c0 1.4.1 2.74.26 4h9.48c.17-1.26.26-2.6.26-4a30.31 30.31 0 0 0-.26-4zm7.63 0h-5.6a33.25 33.25 0 0 1 0 8h5.6a12.99 12.99 0 0 0 .63-4 13 13 0 0 0-.63-4zM11.94 3.65l-.05.01A13.04 13.04 0 0 0 4.46 10h5.1c.5-2.57 1.32-4.77 2.38-6.35zM16 3h-.13c-1.72.14-3.4 2.92-4.27 7h8.8c-.89-4.18-2.63-7-4.4-7zm4.06.65.04.05a17.74 17.74 0 0 1 2.35 6.3h5.09a13.04 13.04 0 0 0-7.48-6.35z"></path></svg>
                                <svg v-if="tab.icon === 'global-preferences'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" style="display: block; height: 24px; width: 24px; fill: currentcolor;"><path d="M16 1a15 15 0 1 1 0 30 15 15 0 0 1 0-30zm4.4 21h-8.8c.89 4.18 2.63 7 4.4 7 1.77 0 3.51-2.82 4.4-7zM9.55 22H4.46a13.04 13.04 0 0 0 7.48 6.35A17.63 17.63 0 0 1 9.55 22zm17.98 0h-5.08a17.62 17.62 0 0 1-2.39 6.35A13.04 13.04 0 0 0 27.54 22zM9.23 12h-5.6A12.99 12.99 0 0 0 3 16a13 13 0 0 0 .63 4h5.6A33.06 33.06 0 0 1 9 16c0-1.38.08-2.72.24-4zm11.51 0h-9.48a30.45 30.45 0 0 0-.26 4c0 1.4.1 2.74.26 4h9.48c.17-1.26.26-2.6.26-4a30.31 30.31 0 0 0-.26-4zm7.63 0h-5.6a33.25 33.25 0 0 1 0 8h5.6a12.99 12.99 0 0 0 .63-4 13 13 0 0 0-.63-4zM11.94 3.65l-.05.01A13.04 13.04 0 0 0 4.46 10h5.1c.5-2.57 1.32-4.77 2.38-6.35zM16 3h-.13c-1.72.14-3.4 2.92-4.27 7h8.8c-.89-4.18-2.63-7-4.4-7zm4.06.65.04.05a17.74 17.74 0 0 1 2.35 6.3h5.09a13.04 13.04 0 0 0-7.48-6.35z"></path></svg>
							</div>
							<span class="nav-text">{{ tab.label }}</span>
						</a>
					</nav>
				</aside>

				<!-- Content -->
                <div class="settings-content-wrapper">
                    <SettingsPersonalInfo v-if="currentTab === 'personal-info'" />
                    <SettingsLoginSecurity v-if="currentTab === 'login-security'" />
                    <SettingsPrivacy v-if="currentTab === 'privacy'" />
                    <SettingsNotifications v-if="currentTab === 'notifications'" />
                    <SettingsTaxes v-if="currentTab === 'taxes'" />
                    <SettingsPayments v-if="currentTab === 'payments'" />
                    <SettingsGlobalPreferences v-if="currentTab === 'global-preferences'" />
                </div>
			</div>
		</main>
	</div>
</template>

<style scoped>
.airbnb-settings-page {
	min-height: 100vh;
	background: #fff;
	color: #222;
}

/* Header */
.settings-header {
	height: 80px;
	border-bottom: 1px solid #ebebeb;
	display: flex;
	align-items: center;
	position: sticky;
	top: 0;
	background: #fff;
	z-index: 100;
}

.header-container {
	width: 100%;
	margin: 0 auto;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.logo {
	cursor: pointer;
	color: #ff385c;
}

.btn-done {
	background: #f7f7f7;
	border: 1px solid transparent;
	border-radius: 24px;
	color: #222;
	cursor: pointer;
	font-size: 14px;
	font-weight: 600;
	padding: 8px 16px;
	transition: all 0.2s;
}

.btn-done:hover {
	background: #f1f1f1;
	border-color: #000;
}

/* Main Layout */
.settings-main {
	padding-top: 48px;
	padding-bottom: 48px;
}

.main-container {
	margin: 0 auto;
	display: grid;
	grid-template-columns: 300px 1fr;
	gap: 48px;
}

/* Sidebar */
.settings-sidebar {
	display: flex;
	flex-direction: column;
}

.sidebar-title {
	font-size: 32px;
	font-weight: 700;
	margin-bottom: 24px;
	color: #222;
}

.sidebar-nav {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.nav-item {
	display: flex;
	align-items: center;
	padding: 12px 0;
	text-decoration: none;
	color: #717171;
	font-size: 16px;
	font-weight: 400;
	transition: color 0.2s;
    cursor: pointer;
}

.nav-item:hover {
	color: #222;
}

.nav-item.active {
	color: #222;
	font-weight: 600;
}

.nav-icon {
	margin-right: 16px;
	color: inherit;
}

.nav-text {
	flex: 1;
}

/* Content Wrapper */


/* Responsive */
@media (max-width: 768px) {
	.main-container {
		grid-template-columns: 1fr;
		gap: 32px;
	}

	.settings-sidebar {
		display: none;
		/* Or show as a top menu/dropdown */
	}

	.sidebar-title {
		font-size: 24px;
	}
}
</style>
