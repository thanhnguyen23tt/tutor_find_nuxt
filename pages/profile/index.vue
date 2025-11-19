<script setup>
import ProfileInfoNew from '~/components/profile/ProfileInfoNew.vue'
import OverviewNew from '~/components/profile/OverviewNew.vue'
import ScheduleNew from '~/components/profile/ScheduleNew.vue'
import WalletBalance from '~/components/profile/WalletBalance.vue'

definePageMeta({
    layout: 'default',
    middleware: 'auth',
});

const notificationStore = useNotificationStore();
const {
    api
} = useApi();

const activeTab = ref('profile');

const tabs = [{
        id: 'profile',
        name: 'Hồ sơ',
        icon: 'profile'
    },
    {
        id: 'overview',
        name: 'Tổng quan',
        icon: 'overview'
    },
    {
        id: 'schedule',
        name: 'Lịch trình',
        icon: 'schedule'
    },
    {
        id: 'wallet',
        name: 'Doanh thu',
        icon: 'wallet'
    },
];

const REQUIRED_PERSONAL_INFO_FIELDS = [
    'first_name',
    'last_name',
    'sex',
    'phone',
    'email',
    'provinces_id',
    'districts_id',
    'wards_id',
    'address',
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

    const existingFieldsInfo = userData.profile_completion?.fields_info;
    const fieldsInfoArray = Array.isArray(existingFieldsInfo) ?
        existingFieldsInfo :
        existingFieldsInfo && typeof existingFieldsInfo === 'object' ?
        Object.values(existingFieldsInfo) :
        [];

    const details = fieldsInfoArray.reduce((acc, field) => {
        if (field?.key) {
            acc[field.key] = {
                ...field,
                completed: completionStatus[field.key] ?? false,
            };
        }
        return acc;
    }, {});

    const incompleteFields = Object.keys(completionStatus)
        .filter((key) => !completionStatus[key])
        .map((key) => details[key]?.label ?? key);

    const result = {
        percent,
        completed,
    };

    if (Object.keys(details).length) {
        result.details = details;
    }

    if (incompleteFields.length) {
        result.incomplete_fields = incompleteFields;
    }

    return result;
};

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

const isLoading = computed(() => isPending.value);

const updateUserData = (newData) => {
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

const updateProfileData = (newData) => {
    updateUserData(newData);
};

onMounted(() => {
    notificationStore.setHiddenFooter(true);
});

onUnmounted(() => {
    notificationStore.setHiddenFooter(false);
});
</script>

<template>
<base-loading v-if="isLoading" />

<div class="profile-container">
    <!-- Left Sidebar -->
    <div class="container">
        <div class="nav-tabs">
            <div class="nav-tabs-wrapper">
                <button v-for="tab in tabs" :key="tab.id" :class="['tab', { active: activeTab === tab.id }]" @click="activeTab = tab.id">
                    <!-- Hiển thị icon SVG dựa trên tab.id -->
                    <span class="icon">
                        <svg v-if="tab.id === 'profile'" class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>

                        <svg v-else-if="tab.id === 'overview'" class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 3v18h18"></path>
                            <path d="M18 17V9"></path>
                            <path d="M13 17V5"></path>
                            <path d="M8 17v-3"></path>
                        </svg>

                        <svg v-else-if="tab.id === 'schedule'" class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M8 2v4"></path>
                            <path d="M16 2v4"></path>
                            <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                            <path d="M3 10h18"></path>
                        </svg>

                        <svg v-else-if="tab.id === 'wallet'" class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
                            <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
                            <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"></path>
                        </svg>

                        <svg v-else class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                    </span>
                    <span>{{ tab.name }}</span>
                </button>
            </div>
        </div>
    </div>
    <div class="container">
        <div class="page-content">

            <ProfileInfoNew v-if="activeTab === 'profile'" @update-data="updateProfileData" :user-data-detail="userDataDetail" />
            <OverviewNew v-if="activeTab === 'overview'" @update-data="updateProfileData" :user-data-detail="userDataDetail" />
            <ScheduleNew v-if="activeTab === 'schedule'" @update-data="updateProfileData" :user-data-detail="userDataDetail" />
            <WalletBalance v-if="activeTab === 'wallet'" @update-data="updateProfileData" :user-data-detail="userDataDetail" />
        </div>
    </div>
</div>
</template>

<style scoped>
@import url('~/assets/css/profileNew.css');
</style>
