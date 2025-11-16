<script setup>
const props = defineProps({
    userDataDetail: {
        type: Object,
        required: true,
    },
});

const emit = defineEmits(['update-data']);

const {
    api
} = useApi();
const {
    success,
    error: notifyError
} = useNotification();
const configStore = useConfigStore();
const userStore = useUserStore();
const {
    genderOptions
} = useConfig();
const {
    formErrors,
    handleValidationError,
    clearError,
    clearAllErrors
} = useFormValidation();

const form = ref({
    first_name: '',
    last_name: '',
    sex: '',
    birth_year: '',
    phone: '',
    email: '',
    about_you: '',
    cccd: '',
    referral_link: '',
    provinces_id: '',
});

const showProfileDescriptionModal = ref(false);
const showPersonalInfoModal = ref(false);
const showAddressModal = ref(false);
const showCCCDModal = ref(false);
const showVideoModal = ref(false);
const showCropModal = ref(false);
const isLoading = ref(false);
const avatarFile = ref(null);
const avatarPreview = ref(null);
const cropImageSrc = ref(null);
const avatarInputRef = ref(null);

const provinceOptions = computed(() => configStore.configuration?.provinces || []);

const loadUserProfile = () => {
    const userData = props.userDataDetail || {};
    form.value = {
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        sex: userData.sex ?? '',
        birth_year: '',
        phone: userData.phone || '',
        email: userData.email || '',
        cccd: userData.cccd || '',
        referral_link: userData.referral_link || '',
        about_you: userData.about_you || '',
        provinces_id: userData.provinces_id || '',
    };
};

const saveProfile = async () => {
    isLoading.value = true;
    clearAllErrors();

    try {
        const formData = new FormData();
        formData.append('first_name', form.value.first_name);
        formData.append('last_name', form.value.last_name);
        formData.append('phone', form.value.phone);
        formData.append('email', form.value.email);
        formData.append('cccd', form.value.cccd);
        formData.append('referral_link', form.value.referral_link);
        formData.append('sex', form.value.sex ? 1 : 0);
        formData.append('about_you', form.value.about_you);
        formData.append('provinces_id', form.value.provinces_id);

        const response = await api.apiPostFormData('me/profile-info', formData);
        if (response.data) {
            emit('update-data', response.data);
            success('Cập nhật hồ sơ thành công!');
            showPersonalInfoModal.value = false;
            showAddressModal.value = false;
            showCCCDModal.value = false;
            showVideoModal.value = false;
        } else {
            notifyError('Cập nhật hồ sơ thất bại!');
        }
    } catch (error) {
        handleValidationError(error, 'Có lỗi xảy ra khi lưu hồ sơ!');
    } finally {
        isLoading.value = false;
    }
};

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
            emit('update-data', response.data);
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

watch(
    () => props.userDataDetail,
    () => {
        loadUserProfile();
        avatarPreview.value = null;
    }, {
        immediate: true,
        deep: true
    },
);

const youtubeEmbedUrl = computed(() => {
    if (!form.value.referral_link) return '';
    const regex = '/(?:youtube\\.com\\/(?:[^\\/]+\\/.+\\/|(?:v|e(?:mbed)?)\\/|.*[?&]v=)|youtu\\.be\\/)([\\w-]{11})/';
    const match = form.value.referral_link.match(regex);
    if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
    }
    return '';
});

const getCompletionStatus = (completed) => {
    if (completed === true) return 'Đã hoàn thiện';
    if (completed === false) return 'Chưa hoàn thiện';
    return '';
};

const getCompletionLabel = (field) => field?.label || '';

const isPersonalInfoValid = computed(() => {
    return (
        !!form.value.first_name &&
        !!form.value.last_name &&
        form.value.sex !== '' &&
        !!form.value.phone &&
        !!form.value.email
    );
});

const isProfileDescriptionValid = computed(() => {
    return !!form.value.about_you && form.value.about_you.trim().length > 0;
});

const isVideoIntroValid = computed(() => {
    return !!form.value.referral_link && form.value.referral_link.trim().length > 0;
});
</script>

<template>
<!-- Loading overlay -->
<base-loading v-if="isLoading" />

<div class="profile-wrapper" v-if="!isLoading">
    <div class="profile-sidebar">
        <div class="profile-info section-card">
            <div class="avatar-main main-content">
                <div class="change-image" @click="handleAvatarClick">
                    <img :src="avatarPreview || userDataDetail.avatar" alt="Avatar">
                    <div class="button-change">
                        <svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
                            <circle cx="12" cy="13" r="3"></circle>
                        </svg>
                    </div>
                    <input ref="avatarInputRef" type="file" id="avatar-input" accept="image/*" @change="handleAvatarChange" style="display: none;" />
                </div>
                <div class="content">
                    <span class="full-name">{{ userDataDetail.full_name }}</span>
                    <div class="profile-status">
                        {{ userDataDetail.profile_status_text }}
                    </div>
                    <div class="evaluate">
                        <div class="stars">
                            <svg class="icon-lg" v-for="i in 5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#f9ce69" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: rgb(249, 206, 105);">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                        </div>
                        <span>4.8</span>
                        <span>(100)</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="section-card profile-completion-card">
            <div class="header-wrapper">
                <div class="header-left">
                    <div class="title-wrapper">
                        <span class="title-main">
                            <div class="icon-wrapper">
                                <svg class="icon-xl" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <circle cx="12" cy="12" r="6"></circle>
                                    <circle cx="12" cy="12" r="2"></circle>
                                </svg>
                            </div>
                            Mức độ hoàn thiện hồ sơ
                        </span>
                        <span class="sub-title">Để hồ sơ của bạn xuất hiện với học sinh, vui lòng hoàn tất các thông tin cần thiết</span>
                    </div>
                </div>
            </div>
            <div class="main-content">
                <div class="completion-progress-wrapper">
                    <div class="completion-circle">
                        <svg width="120" height="120">
                            <circle cx="60" cy="60" r="54" stroke="#e5e7eb" stroke-width="12" fill="none" />
                            <circle cx="60" cy="60" r="54" :stroke="userDataDetail.profile_completion?.percent === 100 ? '#097ed7' : '#6366f1'" stroke-width="12" fill="none" :stroke-dasharray="339.292" :stroke-dashoffset="339.292 - (userDataDetail.profile_completion?.percent || 0) / 100 * 339.292" stroke-linecap="round" transform="rotate(-90 60 60)" />
                            <defs>
                                <linearGradient id="gradient" x1="0" y1="0" x2="120" y2="0" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#6366f1" />
                                    <stop offset="1" stop-color="#a5b4fc" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div class="percent-text">
                            {{ userDataDetail.profile_completion?.percent || 0 }}%
                        </div>
                    </div>
                    <div class="completion-status">
                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="m9 12 2 2 4-4"></path>
                        </svg>
                        <span>{{ Object.values(userDataDetail.profile_completion?.details || {}).filter(field => field.completed).length }}/{{ Object.keys(userDataDetail.profile_completion?.details || {}).length }} mục đã hoàn thiện</span>
                    </div>
                </div>
                <div class="label-completion-details">Chi tiết hoàn thiện:</div>
                <div class="completion-details-grid">
                    <div v-for="(field, key) in userDataDetail.profile_completion?.details" :key="key" class="completion-detail-card" :class="{ completed: field.completed }" :title="field.description">
                        <div class="icon">
                            <template v-if="field.icon === 'user'">
                                <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </template>
                            <template v-else-if="field.icon === 'book'">
                                <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                                </svg>
                            </template>
                            <template v-else-if="field.icon === 'graduation-cap'">
                                <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"></path>
                                    <path d="M22 10v6"></path>
                                    <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"></path>
                                </svg>
                            </template>
                            <template v-else-if="field.icon === 'briefcase'">
                                <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                                    <rect width="20" height="14" x="2" y="6" rx="2"></rect>
                                </svg>
                            </template>
                            <template v-else-if="field.icon === 'calendar'">
                                <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M8 2v4"></path>
                                    <path d="M16 2v4"></path>
                                    <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                                    <path d="M3 10h18"></path>
                                </svg>
                            </template>
                            <template v-else-if="field.icon === 'package'">
                                <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="m7.5 4.27 9 5.15"></path>
                                    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
                                    <path d="m3.3 7 8.7 5 8.7-5"></path>
                                    <path d="M12 22V12"></path>
                                </svg>
                            </template>
                        </div>
                        <div class="content">
                            <div class="label">{{ getCompletionLabel(field) }}</div>
                            <div class="status" :class="{ done: field.completed }">
                                {{ getCompletionStatus(field.completed) }}
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="userDataDetail.profile_completion?.percent === 100" class="completion-success-box">
                    <div class="icon">
                        <svg class="icon-lg" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M9 12l2 2 4-4" /></svg>
                    </div>
                    <div class="content">
                        <span>Xuất sắc!</span>
                        <span>Hồ sơ của bạn đã được hoàn thiện 100%</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="section-all">
        <div class="section-card heading-card" @click="showProfileDescriptionModal = true">
            <div class="header-wrapper">
                <div class="header-left">
                    <div class="icon-wrapper">
                        <svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                            <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                            <path d="M10 9H8"></path>
                            <path d="M16 13H8"></path>
                            <path d="M16 17H8"></path>
                        </svg>
                    </div>
                    <div class="title-wrapper">
                        <span class="title-main">Giới thiệu bản thân</span>
                        <span class="sub-title">Thông tin này sẽ được đưa vào hồ sơ công khai của bạn</span>
                    </div>
                </div>
            </div>
            <div class="section-content_preview">
                <span>{{ form.about_you ? form.about_you.substring(0, 40) + (form.about_you.length > 40 ? '...' : '') : 'Vui lòng click vào để chỉnh sửa các thông tin' }}</span>
                <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                </svg>
            </div>
        </div>

        <div class="section-card infomation-user" @click="showPersonalInfoModal = true">
            <div class="header-wrapper">
                <div class="header-left">
                    <div class="icon-wrapper">
                        <svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </div>
                    <div class="title-wrapper">
                        <span class="title-main">Thông Tin Cá Nhân</span>
                        <span class="sub-title">Tối ưu hồ sơ để thu hút sự lựa chọn từ học sinh</span>
                    </div>
                </div>
            </div>
            <div class="section-content_preview">
                <span>{{ form.first_name || form.last_name ? (form.first_name + ' ' + form.last_name) : 'Vui lòng click để nhập thông tin cá nhân' }}</span>
                <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                </svg>
            </div>
        </div>
        <base-modal :is-open="showPersonalInfoModal" title="Thông Tin Cá Nhân" @close="showPersonalInfoModal = false">
            <div class="form-grid">
                <div class="form-group">
                    <base-input v-model="form.first_name" required="true" label="Họ" placeholder="Nguyễn" :error="formErrors.first_name" @update:modelValue="clearError('first_name')">
                        <template #icon>
                            <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </template>
                    </base-input>
                </div>
                <div class="form-group">
                    <base-input v-model="form.last_name" required="true" label="Tên" placeholder="Văn A" :error="formErrors.last_name" @update:modelValue="clearError('last_name')">
                        <template #icon>
                            <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </template>
                    </base-input>
                </div>
                <div class="form-group">
                    <base-select v-model="form.sex" required="true" :options="genderOptions" label="Giới tính" placeholder="Chọn giới tính" :error="formErrors.sex" @update:modelValue="clearError('sex')">
                        <template #icon>
                            <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </template>
                    </base-select>
                </div>
                <div class="form-group">
                    <base-input v-model="form.phone" required="true" label="Số điện thoại" placeholder="0123456789" :error="formErrors.phone" @update:modelValue="clearError('phone')">
                        <template #icon>
                            <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                        </template>
                    </base-input>
                </div>
                <div class="form-group">
                    <base-input v-model="form.email" required="true" label="Email" placeholder="example@email.com" type="email" :error="formErrors.email" @update:modelValue="clearError('email')">
                        <template #icon>
                            <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </template>
                    </base-input>
                </div>
                <div class="form-group">
                    <base-input v-model="form.cccd" label="Số CCCD" placeholder="001234567890" :error="formErrors.cccd" @update:modelValue="clearError('cccd')">
                        <template #icon>
                            <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                            </svg>
                        </template>
                    </base-input>
                </div>
                <div class="form-group">
                    <base-select v-model="form.provinces_id" :options="provinceOptions" label="Tỉnh/Thành phố" placeholder="Chọn tỉnh/thành phố" :error="formErrors.provinces_id" @update:modelValue="clearError('provinces_id')">
                        <template #icon>
                            <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </template>
                    </base-select>
                </div>

            </div>
            <div class="note-group">
                <div class="note-wrapper">
                    <div class="note-wrapper_header">
                        <i class="feather feather-check">
                            <svg class="icon-mini" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </i>
                        <span>Nên làm</span>
                    </div>
                    <span>Ghi rõ địa chỉ (khu vực dạy), có thể kèm hình thức linh hoạt → Ví dụ: Nhận dạy tại Q.3, Q.10 (TP.HCM)</span>
                </div>

                <div class="note-wrapper">
                    <div class="note-wrapper_header">
                        <i class="feather feather-x">
                            <svg class="icon-mini" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </i>
                        <span>Không nên làm</span>
                    </div>
                    <span>Ghi mơ hồ, không rõ khu vực: “ở gần trung tâm”, “ở xa thì tùy”. Viết thiếu nghiêm túc: “dạy đâu cũng được miễn có tiền”, “nhà ở đâu thì dạy đó”</span>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-md btn-primary" @click="saveProfile" :disabled="!isPersonalInfoValid">
                    <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17,21 17,13 7,13 7,21"></polyline>
                        <polyline points="7,3 7,8 15,8"></polyline>
                    </svg>
                    <span>Lưu thay đổi</span>
                </button>
            </div>
        </base-modal>

        <div class="section-card video-intro" @click="showVideoModal = true">
            <div class="header-wrapper">
                <div class="header-left">
                    <div class="icon-wrapper">
                        <svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"></path>
                            <rect x="2" y="6" width="14" height="12" rx="2"></rect>
                        </svg>
                    </div>
                    <div class="title-wrapper">
                        <span class="title-main">Video Giới Thiệu</span>
                        <span class="sub-title">Link video YouTube giới thiệu bản thân</span>
                    </div>
                </div>
            </div>
            <div class="section-content_preview">
                <span>{{ form.referral_link ? form.referral_link : 'Vui lòng click để nhập link video' }}</span>
                <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                </svg>
            </div>
        </div>
        <base-modal :is-open="showVideoModal" title="Video Giới Thiệu" @close="showVideoModal = false">
            <div class="main-content">
                <div class="form-group full-width">
                    <base-input v-model="form.referral_link" label="Link YouTube *" placeholder="https://www.youtube.com/watch?v=..." :error="formErrors.referral_link" @update:modelValue="clearError('referral_link')">
                        <template #icon>
                            <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        </template>
                    </base-input>
                </div>
                <div v-if="youtubeEmbedUrl" class="youtube-preview">
                    <iframe :src="youtubeEmbedUrl" width="100%" height="315" frameborder="0" allowfullscreen></iframe>
                </div>
            </div>
            <div class="note-group">
                <div class="note-wrapper">
                    <div class="note-wrapper_header">
                        <i class="feather feather-check">
                            <svg class="icon-mini" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </i>
                        <span>Nên làm</span>
                    </div>
                    <span>Video nên dài 2-5 phút, giới thiệu về bản thân, kinh nghiệm và phương pháp giảng dạy, cam kết với học sinh và phụ huynh</span>
                </div>

                <div class="note-wrapper">
                    <div class="note-wrapper_header">
                        <i class="feather feather-x">
                            <svg class="icon-mini" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </i>
                        <span>Không nên làm</span>
                    </div>
                    <span>Video quá dài giới thiệu lan man về những thứ không liên quan ví dụ: nơi ở, học phí...</span>
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn-md btn-primary" @click="saveProfile" :disabled="!isVideoIntroValid">
                    <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17,21 17,13 7,13 7,21"></polyline>
                        <polyline points="7,3 7,8 15,8"></polyline>
                    </svg>
                    <span>Lưu thay đổi</span>
                </button>
            </div>
        </base-modal>

        <base-modal :is-open="showProfileDescriptionModal" title="Giới thiệu bản thân" @close="showProfileDescriptionModal = false">
            <div class="form-grid">
                <div class="form-group">
                    <base-input v-model="form.about_you" type="textarea" rows="6" required="true" label="Giới thiệu bản thân" placeholder="Xin chào tôi tên là..." :error="formErrors.about_you"></base-input>
                    <div class="tips">
                        <span class="tips_header">Mẹo</span>
                        <span>Tiêu đề của bạn chính là tiêu đề cho quảng cáo! Hãy sử dụng nó để làm nổi bật kinh nghiệm và điểm khác biệt của bạn! Bạn không cần phải nêu rõ địa điểm và giá cả vì những thông tin này sẽ được đề cập ở nơi khác. Bạn là gia sư, vì vậy hãy kiểm tra chính tả và ngữ pháp, đồng thời tránh sử dụng từ viết tắt!</span>
                    </div>
                    <div class="note-group">
                        <div class="note-wrapper">
                            <div class="note-wrapper_header">
                                <i class="feather feather-check">
                                    <svg class="icon-mini" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </i>
                                <span>Nên làm</span>
                            </div>
                            <span>Tốt nghiệp học viện âm nhạc và là ca sĩ, giảng dạy thanh nhạc và guitar cho mọi trình độ. Phương pháp giảng dạy thoải mái!</span>
                        </div>

                        <div class="note-wrapper">
                            <div class="note-wrapper_header">
                                <i class="feather feather-x">
                                    <svg class="icon-mini" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </i>
                                <span>Không nên làm</span>
                            </div>
                            <span>Dạy hát và guitar ở New York với giá 40 đô la một giờ.</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn-md btn-primary" @click="saveProfile" :disabled="!isProfileDescriptionValid">
                    <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17,21 17,13 7,13 7,21"></polyline>
                        <polyline points="7,3 7,8 15,8"></polyline>
                    </svg>
                    <span>Lưu thay đổi</span>
                </button>
            </div>
        </base-modal>

        <!-- Crop Image Modal -->
        <ImageCropModal :is-open="showCropModal" :image-src="cropImageSrc" title="Chỉnh sửa ảnh đại diện" @confirm="handleCropConfirm" @close="handleCropClose" />

    </div>
</div>
</template>

<style scoped>
@import url('~/assets/css/profileNew.css');
@import url('~/assets/css/lessonInformation.css');

.note-group {
    display: flex;
    align-items: start;
    gap: 2rem;
}

.note-wrapper,
.tips {
    display: grid;
    gap: 0.2rem;
    margin-top: 1.5rem;
    font-size: var(--font-size-small);
    border-radius: 8px;
    line-height: 1.5;
    flex: 1;
}

.note-wrapper_header,
.tips_header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    font-size: var(--font-size-base);
}

.feather {
    width: 1rem;
    height: 1rem;
    border-radius: 100%;
    color: #f7f7f7;
    display: flex;
    align-items: center;
    justify-content: center;
}

.feather-check {
    width: 1rem;
    height: 1rem;
    border-radius: 100%;
    background-color: #5bca8d;
    color: #f7f7f7;
    display: flex;
    align-items: center;
    justify-content: center;
}

.feather-x {
    background: #ff3636;
}

/* Disabled button styles */
.btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: #9ca3af;
    border-color: #9ca3af;
}

.btn-primary:disabled:hover {
    background-color: #9ca3af;
    border-color: #9ca3af;
}

/* Enhanced avatar upload styles */
.change-image {
    position: relative;
    cursor: pointer;
    transition: all 0.3s ease;
}

.change-image:hover {
    transform: scale(1.05);
}

.change-image:hover .button-change {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
}

.change-image img {
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
    background: linear-gradient(135deg, #3b82f6, #2563eb);
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

.session-list {
    border: none;
    padding: 1rem 0;
}
</style>
