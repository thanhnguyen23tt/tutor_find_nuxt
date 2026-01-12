<template>
	<div class="container">
		<base-loading v-if="isPending" />
		<BasePageError v-else-if="!userDataDetail" message="Không thể tải thông tin hồ sơ" />
		<div class="revenue-page" v-else>
			<div class="header">
				<button class="back-btn" @click="navigateTo('/profile')">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
						stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
					</svg>
				</button>
				<h2 class="title">Doanh thu</h2>
				<div class="w-10"></div>
			</div>

			<WalletBalance :userDataDetail="userDataDetail" @update-data="updateProfileData" />
		</div>
	</div>
</template>

<script setup>
definePageMeta({
	middleware: [
		'auth', 
		() => {
		useLayoutStore().setHiddenFooter(true)
		}
	]
})

import WalletBalance from '~/components/profile/WalletBalance.vue';

const { api } = useApi();

// Fetch user data
const {
	data: fetchedProfile,
	pending: isPending,
} = await useAsyncData('profile-revenue', async () => {
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

const updateProfileData = (newData) => {
	userDataDetail.value = {
		...userDataDetail.value,
		...newData,
	};
};
</script>

<style scoped>
.revenue-page {
	margin: 2rem 0;
}

.header {
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

.title {
	font-size: 1.25rem;
	font-weight: 500;
	color: #1f2937;
}

.w-10 {
	width: 40px;
}
</style>
