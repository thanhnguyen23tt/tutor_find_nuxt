<template>
	<div class="profile-page-container">
		<!-- Main Profile View -->
		<div class="main-view container">
			<!-- User Card -->
			<div class="user-card">
				<div class="avatar-wrapper">
					<div class="change-image" @click="handleAvatarClick">
						<img :src="avatarPreview || userData?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'" alt="Avatar"
							class="avatar-img" />
						<div class="button-change">
							<svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
								<circle cx="12" cy="13" r="3"></circle>
							</svg>
						</div>
						<input ref="avatarInputRef" type="file" id="avatar-input" accept="image/*" @change="handleAvatarChange" style="display: none;" />
					</div>
				</div>
				<h2 class="user-name">{{ userData?.full_name }}</h2>
				<p class="user-location">{{ userData?.address_preview || 'Chưa cập nhật' }}</p>
			</div>

			<!-- Quick Access Grid -->
			<div class="quick-access-grid">
				<div class="quick-card" @click="navigateTo('/classroom-manager')">
					<span class="new-badge">MỚI</span>
					<div class="quick-card-img">
						<img src="https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-UserProfile/original/797c1df2-a40c-4d93-9550-ca5b213cd01b.png?im_w=240"
						alt="Classroom" />
					</div>
					<h3 class="quick-card-title">Quản lý lớp học</h3>
				</div>

				<div class="quick-card" @click="navigateTo('/booking/manager')">
					<span class="new-badge">MỚI</span>
					<div class="quick-card-img">
						<img src="https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-UserProfile/original/5347d650-16de-4f5a-a38e-79edc988befa.png?im_w=720" alt="Booking">
					</div>
					<h3 class="quick-card-title">Yêu cầu đặt lịch</h3>
				</div>
			</div>

			<!-- Become Tutor Banner -->
			<div class="banner-card" @click="navigateTo('/profile/register-tutor')" v-if="userData?.role !== 1">
				<div class="banner-img">
					<img src="https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-UserProfile/original/ed28537a-fc3c-4253-bb89-a6d927df7e50.png?im_w=720" alt="Info"/>
				</div>
				<div class="banner-content">
					<h3 class="banner-title">Trở thành gia sư</h3>
					<p class="banner-desc">Bắt đầu dạy và kiếm thêm thu nhập thật dễ dàng.</p>
				</div>
			</div>

			<!-- Menu List -->
			<div class="menu-list">
				<div v-for="item in filteredMenuItems" :key="item.id" class="menu-item" @click="handleMenuClick(item)">
					<div class="menu-icon">
						<svg class="icon-md" fill="none" stroke="currentColor"
							:viewBox="item.iconViewBox || '0 0 24 24'" :stroke-width="item.strokeWidth || '1.5'">
							<path v-for="(path, index) in normalizeIcon(item.icon)" :key="index" :d="path.d"
								stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					</div>
					<span class="menu-text">{{ item.name }}</span>
					<div class="menu-arrow">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
							stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
						</svg>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Crop Image Modal -->
	<ImageCropModal :is-open="showCropModal" :image-src="cropImageSrc" title="Chỉnh sửa ảnh đại diện" @confirm="handleCropConfirm" @close="handleCropClose" />
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
import { userMenuItems } from '~/config/header';

const { normalizeIcon } = useHelper();
const userStore = useUserStore();
const { api } = useApi();
const { success, error: notifyError } = useNotification();
const { handleValidationError } = useFormValidation();

const userData = computed(() => userStore.getUserData);

// Avatar upload states
const avatarInputRef = ref(null);
const avatarFile = ref(null);
const avatarPreview = ref(null);
const cropImageSrc = ref(null);
const showCropModal = ref(false);
const isLoading = ref(false);

// Filter menu items to show relevant ones
const filteredMenuItems = computed(() => {
	return userMenuItems.filter(item => item.id !== 1);
});

const handleMenuClick = (item) => {
	if (item.action === 'logout') {
		userStore.clearAuth();
		navigateTo('/auth/login');
		return;
	}
	
	if (item.path) {
		navigateTo(item.path);
	}
};

// Avatar upload handlers
const handleAvatarClick = () => {
	if (avatarInputRef.value) {
		avatarInputRef.value.click();
	}
};

const handleAvatarChange = (event) => {
	const file = event?.target?.files?.[0];
	if (!file) return;

	if (!file.type.startsWith('image/')) {
		notifyError('Vui lòng chọn file ảnh!');
		event.target.value = '';
		return;
	}

	if (file.size > 5 * 1024 * 1024) {
		notifyError('Kích thước ảnh không được vượt quá 5MB!');
		event.target.value = '';
		return;
	}

	const reader = new FileReader();
	reader.onload = (e) => {
		cropImageSrc.value = e.target?.result || null;
		showCropModal.value = true;
	};
	reader.readAsDataURL(file);

	event.target.value = '';
};

const handleCropConfirm = async (croppedBlob) => {
	try {
		const file = new File([croppedBlob], 'avatar.jpg', {
			type: 'image/jpeg'
		});
		avatarFile.value = file;

		const reader = new FileReader();
		reader.onload = (e) => {
			avatarPreview.value = e.target?.result || null;
		};
		reader.readAsDataURL(file);

		showCropModal.value = false;
		await uploadAvatar();
	} catch (error) {
		notifyError('Có lỗi xảy ra khi xử lý ảnh!');
	}
};

const handleCropClose = () => {
	showCropModal.value = false;
	cropImageSrc.value = null;
};

const uploadAvatar = async () => {
	if (!avatarFile.value) return;

	isLoading.value = true;
	try {
		const formData = new FormData();
		formData.append('avatar', avatarFile.value);

		const response = await api.apiPostFormData('me/avatar', formData);

		if (response.data) {
			userStore.setUserData(response.data);
			success('Cập nhật ảnh đại diện thành công!');
			avatarFile.value = null;
		} else {
			notifyError('Cập nhật ảnh đại diện thất bại!');
		}
	} catch (error) {
		handleValidationError(error, 'Có lỗi xảy ra khi tải ảnh lên!');
		avatarPreview.value = null;
		avatarFile.value = null;
	} finally {
		isLoading.value = false;
	}
};

</script>

<style scoped>
.profile-page-container {
	background: #f8fafc;
	padding: 1.5rem 1rem;
}

/* Main View */
.page-title {
	font-size: 2rem;
	font-weight: 800;
	color: #1f2937;
	margin-bottom: 1.5rem;
	padding-left: 0.5rem;
}

.user-card {
	background: #fff;
	border-radius: 24px;
	padding: 2rem 1.5rem;
	text-align: center;
	box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
	margin-bottom: 1.5rem;
}

.avatar-wrapper {
	width: 150px;
	height: 150px;
	border-radius: 50%;
	background: #e0f2fe;
	margin: 0 auto 1rem;
	overflow: hidden;
	display: flex;
	align-items: center;
	justify-content: center;
}

/* Avatar change styles */
.change-image {
	position: relative;
	cursor: pointer;
	transition: all 0.3s ease;
	width: 100%;
	height: 100%;
}

.change-image:hover {
	transform: scale(1.05);
}

.change-image:hover .button-change {
	opacity: 1;
	transform: translate(-50%, -50%) scale(1);
}

.change-image img {
	width: 100%;
	height: 100%;
	object-fit: cover;
	transition: all 0.3s ease;
}

.change-image:hover img {
	filter: brightness(0.7);
}

.button-change {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%) scale(0.8);
	background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
	border-radius: 50%;
	width: 48px;
	height: 48px;
	display: flex;
	align-items: center;
	justify-content: center;
	opacity: 0;
	transition: all 0.3s ease;
	box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
}

.button-change svg {
	color: white;
}

.change-image:active {
	transform: scale(0.98);
}

.avatar-img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.user-name {
	font-size: 1.5rem;
	font-weight: 700;
	color: #1f2937;
	margin-bottom: 0.25rem;
}

.user-location {
	color: #6b7280;
	font-size: 0.9375rem;
}

.quick-access-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 1rem;
	margin-bottom: 1.5rem;
}

.quick-card {
	background: #fff;
	border-radius: 24px;
	padding: 1.5rem 1rem;
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
	position: relative;
	cursor: pointer;
	transition: transform 0.2s;
	min-height: 160px;
	justify-content: center;
}

.quick-card:active {
	transform: scale(0.98);
}

.new-badge {
	position: absolute;
	top: 12px;
	right: 12px;
	background: #1f2937;
	color: #fff;
	font-size: 0.625rem;
	font-weight: 700;
	padding: 2px 6px;
	border-radius: 4px;
	text-transform: uppercase;
}

.quick-card-img {
	width: 120px;
	height: 120px;
	margin-bottom: 1rem;
}

.quick-card-img img {
	width: 100%;
	height: 100%;
	object-fit: contain;
}

.quick-card-title {
	font-size: 1rem;
	font-weight: 700;
	color: #1f2937;
	line-height: 1.3;
}

.banner-card {
	background: #fff;
	border-radius: 20px;
	padding: 1rem;
	display: flex;
	align-items: center;
	gap: 1rem;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
	margin-bottom: 2rem;
	cursor: pointer;
	transition: transform 0.2s;
}

.banner-card:active {
	transform: scale(0.98);
}

.banner-img {
	width: 60px;
	height: 60px;
	flex-shrink: 0;
}

.banner-img img {
	width: 100%;
	height: 100%;
	object-fit: contain;
}

.banner-content {
	flex: 1;
}

.banner-title {
	font-size: 1rem;
	font-weight: 700;
	color: #1f2937;
	margin-bottom: 0.25rem;
}

.banner-desc {
	font-size: 0.8125rem;
	color: #6b7280;
	line-height: 1.4;
	margin: 0;
}

.menu-list {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.menu-item {
	display: flex;
	align-items: center;
	padding: 1rem;
	background: transparent;
	border-radius: 16px;
	cursor: pointer;
	transition: background 0.2s;
}

.menu-item:hover {
	background: #fff;
}

.menu-icon {
	width: 24px;
	height: 24px;
	color: #374151;
	margin-right: 1rem;
}

.menu-icon svg {
	width: 100%;
	height: 100%;
}

.menu-text {
	flex: 1;
	font-size: 1rem;
	font-weight: 500;
	color: #374151;
}

.menu-arrow {
	color: #9ca3af;
	width: 16px;
	height: 16px;
}
</style>
