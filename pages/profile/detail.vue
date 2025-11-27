<template>
	<div class="container">
		<base-loading v-if="isPending" />
		<BasePageError v-else-if="!userDataDetail" message="Không thể tải thông tin hồ sơ" />
		<div class="profile-detail" v-else>
			<div class="detail-header">
				<button class="back-btn" @click="navigateTo('/profile')">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
						stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
					</svg>
				</button>
				<h2 class="detail-title">Chi tiết hồ sơ</h2>
				<div class="w-10"></div> <!-- Spacer to balance back button -->
			</div>

			<!-- Profile Completion Section -->
			<div class="completion-section" v-if="userDataDetail">
				<div class="completion-header-row">
					<div class="completion-info">
						<div class="completion-title-wrapper">
							<span class="completion-title">Mức độ hoàn thiện hồ sơ</span>
							<span class="completion-percent" :class="{'text-green': completionStatus.percent === 100}">{{ completionStatus.percent }}%</span>
						</div>
						<div class="progress-bar-bg">
							<div class="progress-bar-fill" :style="{ width: completionStatus.percent + '%' }" :class="{'bg-green': completionStatus.percent === 100}"></div>
						</div>
					</div>
				</div>
				
				<div class="missing-items" v-if="completionStatus.missing.length > 0">
					<p class="missing-title">Các mục cần hoàn thiện để thu hút học viên:</p>
					<div class="missing-grid">
						<div v-for="item in completionStatus.missing" :key="item.key" class="missing-tag">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3">
								<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
							</svg>
							{{ item.label }}
						</div>
					</div>
				</div>
				<div class="completed-msg" v-else>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-green">
						<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span>Hồ sơ của bạn đã hoàn thiện tuyệt vời!</span>
				</div>
			</div>

			<div class="tabs-container">
				<div class="tabs-list">
					<button 
						v-for="tab in tabs" 
						:key="tab.id" 
						:class="['tab-item', { active: activeTab === tab.id }]"
						@click="changeTab(tab.id)"
					>
						<span class="tab-icon" v-html="tab.icon"></span>
						<span class="tab-label">{{ tab.label }}</span>
					</button>
				</div>
			</div>

			<div class="tab-content">
				<!-- Overview Tab -->
				<transition name="fade" mode="out-in">
					<div v-if="activeTab === 'overview'" key="overview">
						<OverviewNew :userDataDetail="userDataDetail" @update-data="updateProfileData" />
					</div>
					
					<!-- Schedule Tab -->
					<div v-else-if="activeTab === 'schedule'" key="schedule">
						<ScheduleNew :userDataDetail="userDataDetail" @update-data="updateProfileData" />
					</div>

				</transition>
			</div>
		</div>
	</div>
</template>

<script setup>
definePageMeta({
	middleware: 'auth',
});
import OverviewNew from '~/components/profile/OverviewNew.vue';
import ScheduleNew from '~/components/profile/ScheduleNew.vue';

const route = useRoute();
const router = useRouter();
const { api } = useApi();

// Fetch user data
const {
	data: fetchedProfile,
	pending: isPending,
} = await useAsyncData('profile-detail', async () => {
	const response = await api.apiGet('me/profile');
	return response?.data ?? response ?? {};
},
	{
		server: false,
		lazy: false,
	}
);

const userDataDetail = ref(fetchedProfile.value ?? {});

watch(fetchedProfile, (value) => {
	if (value) {
		userDataDetail.value = value;
	}
});

const REQUIRED_PERSONAL_INFO_FIELDS = [
	'first_name',
	'last_name',
	'sex',
	'phone',
	'email',
	'provinces_id',
	'about_you',
	'cccd',
	'referral_link',
];

const empty = (value) => {
	if (Array.isArray(value)) {
		return value.length === 0;
	}
	return (
		value === undefined ||
		value === null ||
		value === '' ||
		value === 0 ||
		value === false
	);
};

const isPersonalInfoComplete = (userData = {}) => {
	return REQUIRED_PERSONAL_INFO_FIELDS.every((field) => !empty(userData[field]));
};

const calculateProfileCompletion = (userData = {}) => {
	const completionStatus = {
		personal_info: isPersonalInfoComplete(userData),
		education: Array.isArray(userData.user_educations) && userData.user_educations.length > 0,
		experience: Array.isArray(userData.user_experiences) && userData.user_experiences.length > 0,
		subjects: Array.isArray(userData.user_subjects) && userData.user_subjects.length > 0,
		languages: Array.isArray(userData.user_languages) && userData.user_languages.length > 0,
		schedule: Array.isArray(userData.user_weekly_time_slots) && userData.user_weekly_time_slots.length > 0,
	};

	const totalFields = Object.keys(completionStatus).length;
	const completedFields = Object.values(completionStatus).filter(Boolean).length;
	const percent = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
	const completed = completedFields === totalFields && totalFields > 0;

	// Use details from existing data instead of fields_info
	const existingDetails = userData.profile_completion?.details || {};
	
	const details = {};
	
	// If existingDetails is empty, we might want to define default structure or handle it.
	// Assuming it's populated from API.
	Object.keys(existingDetails).forEach(key => {
		details[key] = {
			...existingDetails[key],
			completed: completionStatus[key] ?? false
		};
	});

	const incompleteFields = Object.keys(completionStatus)
		.filter((key) => !completionStatus[key])
		.map((key) => details[key]?.label ?? key);

	const result = {
		percent,
		completed,
		details,
		incomplete_fields: incompleteFields
	};

	return result;
};

const updateProfileData = (newData) => {
	const updatedData = {
		...userDataDetail.value,
		...newData,
	};

	const completion = calculateProfileCompletion(updatedData);

	userDataDetail.value = {
		...updatedData,
		profile_completion: {
			...(updatedData.profile_completion ?? {}),
			...completion,
		},
	};
};

const activeTab = ref('overview');

const tabs = [
	{ 
		id: 'overview', 
		label: 'Tổng quan',
		icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>'
	},
	{ 
		id: 'schedule', 
		label: 'Lịch trình',
		icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>'
	}
];

// Initialize tab from query param
onMounted(() => {
	if (route.query.tab && tabs.some(t => t.id === route.query.tab)) {
		activeTab.value = route.query.tab;
	}
});

const changeTab = (tabId) => {
	activeTab.value = tabId;
	// Optional: Update URL without reloading
	router.replace({ query: { ...route.query, tab: tabId } });
};

// Profile Completion Logic
const completionStatus = computed(() => {
	const completionData = userDataDetail.value?.profile_completion || {};
	const percent = completionData.percent || 0;
	
	// Get missing items from details object where completed is false
	const details = completionData.details || {};
	const missing = Object.values(details).filter(item => !item.completed);

	return {
		percent,
		missing
	};
});
</script>

<style scoped>
.profile-detail {
	margin: 2rem 0;
}

.detail-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 1.5rem;
	position: sticky;
	top: 0;
	background: #f8fafc;
	z-index: 10;
	padding: 0.7rem 0;
}

.back-btn {
	background: #fff;
	border: 1px solid #e5e7eb;
	width: 40px;
	height: 40px;
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #374151;
	cursor: pointer;
	transition: all 0.2s;
	margin-left: 0.5rem;
}

.back-btn:hover {
	background: #f3f4f6;
	transform: translateX(-2px);
}

.back-btn svg {
	width: 20px;
	height: 20px;
}

.detail-title {
	font-size: 1.25rem;
	font-weight: 500;
	color: #1f2937;
}

.w-10 {
	width: 40px;
}

/* Modern Tabs */
.tabs-container {
	margin-bottom: 2rem;
	position: sticky;
	top: 60px;
	background: #f8fafc;
	z-index: 9;
	padding-bottom: 0.5rem;
}

.tabs-list {
	display: flex;
	background: #f1f5f9;
	padding: 4px;
	border-radius: 16px;
	gap: 0;
	position: relative;
}

.tab-item {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	padding: 1.2rem;
	background: transparent;
	border: none;
	border-radius: 12px;
	font-size: 0.9375rem;
	font-weight: 500;
	color: #64748b;
	cursor: pointer;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	position: relative;
	z-index: 1;
}

.tab-item:hover {
	color: #334155;
}

.tab-item.active {
	background: #fff;
	color: #0f172a;
	font-weight: 600;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.tab-icon {
	display: flex;
	align-items: center;
	justify-content: center;
}

.tab-icon :deep(svg) {
	width: 20px;
	height: 20px;
}

/* Mobile responsiveness for tabs */
@media (max-width: 640px) {
	.tab-label {
		display: none;
	}
	
	/* .tab-item {
		padding: 0.75rem 0.5rem;
	} */
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
	opacity: 0;
	transform: translateY(10px);
}

.fade-leave-to {
	opacity: 0;
	transform: translateY(-10px);
}

/* Completion Section */
.completion-section {
	background: #fff;
	border-radius: 16px;
	padding: 1.5rem;
	margin-bottom: 1.5rem;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
	border: 1px solid #e2e8f0;
}

.completion-header-row {
	margin-bottom: 1rem;
}

.completion-title-wrapper {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 0.5rem;
}

.completion-title {
	font-weight: 600;
	color: #1e293b;
	font-size: 1rem;
}

.completion-percent {
	font-weight: 700;
	color: var(--color-primary);
	font-size: 1rem;
}

.completion-percent.text-green {
	color: #10b981;
}

.progress-bar-bg {
	width: 100%;
	height: 8px;
	background: #f1f5f9;
	border-radius: 4px;
	overflow: hidden;
}

.progress-bar-fill {
	height: 100%;
	background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
	border-radius: 4px;
	transition: width 0.5s ease-out;
}

.progress-bar-fill.bg-green {
	background: linear-gradient(90deg, #10b981, #059669);
}

.missing-items {
	background: #f8fafc;
	padding: 1rem;
	border-radius: 12px;
	border: 1px dashed #cbd5e1;
}

.missing-title {
	font-size: 0.875rem;
	color: #64748b;
	margin-bottom: 0.75rem;
	font-weight: 500;
}

.missing-grid {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
}

.missing-tag {
	display: flex;
	align-items: center;
	gap: 0.25rem;
	background: #fff;
	border: 1px solid #e2e8f0;
	padding: 0.35rem 0.75rem;
	border-radius: 20px;
	font-size: 0.8125rem;
	color: #475569;
	font-weight: 500;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.missing-tag svg {
	color: var(--color-primary);
}

.completed-msg {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 1rem;
	background: #f0fdf4;
	border-radius: 12px;
	color: #166534;
	font-weight: 500;
	font-size: 0.9375rem;
}

.text-green {
	color: #10b981;
}

.w-3 { width: 12px; }
.h-3 { height: 12px; }
.w-5 { width: 20px; }
.h-5 { height: 20px; }
</style>
