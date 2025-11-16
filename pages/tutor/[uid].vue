<script setup>
definePageMeta({
	middleware: 'auth',
});

import { ref, onMounted, onUnmounted, computed, watch } from 'vue';

import OverviewTab from '~/components/userDetail/OverviewTab.vue';
import ReviewsTab from '~/components/userDetail/ReviewsTab.vue';
import SendMessage from '~/components/common/SendMessage.vue';

const route = useRoute();
const { api } = useApi();
const { getPriceRange } = useHelper();
const { success, error: notifyError, info: notifyInfo, warning: notifyWarning } = useNotification();
const notificationStore = useNotificationStore();
const config = useRuntimeConfig()

const activeTab = ref('overview');
const showSendMessageModal = ref(false);
const selectedUser = ref(null);
const isSaved = ref(false);
const isSaving = ref(false);

const tabs = [
    { id: 'overview', name: 'Giới thiệu', icon: 'fa-regular fa-user' },
    { id: 'reviews', name: 'Đánh giá', icon: 'fa-regular fa-comment' },
];

// Fetch data trên server bằng useAsyncData
const { data: userData, pending: isLoading } = await useAsyncData(
    `tutor-${route.params.uid}`,
    async () => {
        try {
            const response = await api.apiGet(`tutor/${route.params.uid}`);
			console.log(response, 'thành')
            return response?.data ?? response ?? {};
        } catch (error) {
            console.error('Error fetching user:', error);
            return {};
        }
    },
    {
        // Chỉ fetch trên server, client sẽ dùng data đã có
        server: true,
        lazy: false,
    }
);

const redirectToBooking = () => {
    return navigateTo(`/booking/${route.params.uid}`);
};

const openSendMessageModal = () => {
    selectedUser.value = userData.value;
    showSendMessageModal.value = true;
};

const handleMessageSent = () => {
    showSendMessageModal.value = false;
    success('Gửi tin nhắn thành công!');
};

const checkSavedStatus = async () => {
    isSaved.value = userData.value?.is_saved ? true : false;
};

const toggleSave = async () => {
    if (isSaving.value) return;

    isSaving.value = true;
    try {
        const response = await api.apiPost('saved/toggle', {
            tutor_uid: userData.value.uid
        });

        if (response.success) {
            isSaved.value = response.is_saved;
            success(response.message);
        }
    } catch (error) {
        notifyError('Có lỗi xảy ra');
    } finally {
        isSaving.value = false;
    }
};

const metas = computed(() => {
	const baseUrl = config.public.baseUrl || (process.client ? window.location.origin : '')
    return {
        title: userData.value?.title_meta || 'Chi tiết gia sư - TutorFind',
        description: userData.value?.about_you || userData.value?.description_meta || '',
        url: `${baseUrl}/tutor/${userData.value?.uid || ''}`,
        image: userData.value?.avatar 
    }
});

	// Sử dụng useSeoMeta để SEO được render trên server
useSeoMeta({
    title: metas.value.title,
    description: metas.value.description,
    ogTitle: metas.value.title,
    ogDescription: metas.value.description,
    ogUrl: metas.value.url,
    ogImage: metas.value.image,
    ogImageSecureUrl: metas.value.image,
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageAlt: metas.value.title,
    twitterCard: 'summary_large_image',
    twitterTitle: metas.value.title,
    twitterDescription: metas.value.description,
    twitterImage: metas.value.image,
});

// Canonical link riêng
useHead({
    link: [
        {
            rel: 'canonical',
            href: metas.value.url
        }
    ]
});

onMounted(async () => {
    notificationStore.setHiddenFooter(true);
    await checkSavedStatus();
});

onUnmounted(() => {
    notificationStore.setHiddenFooter(false);
});
</script>

<template>
<base-loading v-if="isLoading" />

<div class="user-detail-header_mobile" v-if="userData && !isLoading">
    <div class="container">
        <div class="avatar-wrapper_mobile">
            <img :src="userData.avatar" :alt="userData.full_name" />
        </div>
        <h1 class="user-name_mobile">
            <span>{{ userData.full_name }}</span>
            <svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <g id="Stars 3">
                <path id="Vector" fill-rule="evenodd" clip-rule="evenodd" d="M14.1027 3.76073C13.3007 3.50073 12.6673 2.86873 12.408 2.06806C12.3193 1.79339 11.8627 1.79339 11.774 2.06806C11.5147 2.86873 10.8813 3.50073 10.0793 3.76073C9.942 3.80539 9.84866 3.93339 9.84866 4.07806C9.84866 4.22206 9.942 4.35006 10.0793 4.39473C10.88 4.65406 11.5133 5.28939 11.774 6.09406C11.818 6.23139 11.9467 6.32473 12.0907 6.32473C12.2353 6.32473 12.364 6.23139 12.408 6.09406C12.6687 5.28939 13.302 4.65406 14.1027 4.39473C14.24 4.35006 14.3333 4.22206 14.3333 4.07806C14.3333 3.93339 14.24 3.80539 14.1027 3.76073Z" fill="#5D5DEC"/>
                <path id="Vector_2" fill-rule="evenodd" clip-rule="evenodd" d="M11.716 8.26755L8.56066 7.24288L7.53666 4.08818C7.44866 3.81485 7.20466 3.63818 6.91666 3.63818C6.62799 3.63818 6.38466 3.81485 6.29599 4.08818L5.28066 7.24088L2.11932 8.26688C1.84866 8.35288 1.66666 8.60222 1.66666 8.88822C1.66666 9.17355 1.84866 9.42288 2.11799 9.50822L5.27066 10.5275L6.29599 13.6876C6.38466 13.9609 6.62799 14.1382 6.91666 14.1382C7.20466 14.1382 7.44866 13.9609 7.53666 13.6876L8.55332 10.5349L11.714 9.50888C11.9847 9.42288 12.1673 9.17355 12.1673 8.88822C12.1673 8.60222 11.9847 8.35288 11.716 8.26755Z" fill="#5D5DEC"/>
                </g>
            </svg>
        </h1>

        <span class="user-address_mobile">{{ userData.address_preview }}</span>

        <!-- Description section for mobile -->
        <div class="description-section_mobile" v-if="userData.about_you">
            <p class="description-text">{{ userData.about_you }}</p>
        </div>

        <div class="action-group header-actions_mobile">
            <button class="action-btn" :class="isSaved ? 'btn-favorite-active' : 'btn-secondary'" @click="toggleSave" :disabled="isSaving">
                <svg v-if="isSaving" class="btn-icon animate-spin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-else class="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" :fill="isSaved ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"/>
                </svg>
                <span class="btn-text">{{ isSaved ? 'Đã lưu' : 'Yêu thích' }}</span>
            </button>
            <button class="action-btn btn-secondary">
                <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"></line><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"></line></svg>
                <span class="btn-text">Chia sẻ</span>
            </button>
        </div>

        <div class="user-detail-content">
            <div class="language-tags">
                <span class="language-tag">
                    <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
                    {{ userData.language_preview }}
                </span>
            </div>

            <div class="subject-tags">
                <span class="subject-tag" v-for="item in userData.user_subjects" :key="item.id">{{ item.subject_name }}</span>
            </div>

            <div class="information-detail-gird">
                <div class="information-item">
                    <span>
                        <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                        {{ userData.info_reviews.average_rating }}
                    </span>
                    <span>{{ userData.info_reviews.total_reviews }} Đánh giá</span>
                </div>
                <div class="information-item">
                    <span>
                        <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                            <path d="M12 17h.01"></path>
                        </svg>
                        {{ getPriceRange(userData.user_subjects) }}
                    </span>
                    <span>Trên giờ</span>
                </div>
                <div class="information-item">
                    <span>
                        <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M12 6v6l4 2"></path>
                        </svg>
                        5h
                    </span>
                    <span>Thời gian trả lời</span>
                </div>
            </div>
        </div>
    </div>

    <div class="user-contact">
        <div class="user-contact_info">
            <div class="user-contact_avatar">
                <img :src="userData.avatar" :alt="userData.full_name" />
            </div>
            <div class="user-contact_info_detail">
                <div class="user-contact_details">
                    <div class="user-contact_review">
                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#f9ce69" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: rgb(249, 206, 105);"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                        <span>{{ userData.info_reviews.average_rating }}</span>
                        (<span class="text-small gray-500">{{ userData.info_reviews.total_reviews }} Đánh giá</span>)
                    </div>
                    <div class="user-contact_price">
                        <span>{{ getPriceRange(userData.user_subjects) }}</span>
                    </div>
                </div>
                <button class="user-contact_heart" @click="toggleSave" :disabled="isSaving">
                    <svg v-if="isSaving" class="icon-md animate-spin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <svg v-else class="icon-md" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" :fill="isSaved ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"/>
                    </svg>
                </button>
            </div>
        </div>
        <div class="action-group mobile-contact-actions">
            <button class="action-btn btn-secondary border-r-2" @click="openSendMessageModal">
                <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg>
                <span class="btn-text">Nhắn tin</span>
            </button>
            <button class="action-btn btn-primary border-r-2" @click="redirectToBooking()">
                <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" data-preply-ds-component="SvgTokyoUIIcon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="white"><path fill-rule="evenodd" d="m14 10 1-8L2 14h9l-1 8 12-12z" clip-rule="evenodd"></path></svg>
                <span class="btn-text">Đặt lịch</span>
            </button>
        </div>
    </div>
</div>

<div class="user-detail-page" v-if="userData && !isLoading">
    <div class="container">
        <div class="user-detail-header_desktop">
            <div class="user-detail-header">
                <div class="header-avatar-block">
                    <div class="avatar-wrapper">
                        <img :src="userData.avatar" :alt="userData.full_name" />
                    </div>
                </div>
                <div class="header-main-block">
                    <div>
                        <h1 class="user-name">{{ userData.full_name }}</h1>
                        <div class="user-title">{{ userData.subject_preview }}</div>

                        <!-- Description section for desktop -->
                        <div class="description-section" v-if="userData.about_you">
                            <p class="description-text">{{ userData.about_you }}</p>
                        </div>
                    </div>

                    <div class="user-stats-row-v2">
                        <div class="stat-item">
                            <div class="stat-group">
                                <div class="stat-icon">
                                    <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#f9ce69" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: rgb(249, 206, 105);"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                </div>
                                <div class="stat-value">{{ userData.info_reviews.average_rating }}</div>
                            </div>
                            <div class="stat-label">{{ userData.info_reviews.total_reviews }} Reviews</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-group">
                                <div class="stat-icon">
                                    <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
                                </div>
                                <div class="stat-value">{{ userData.language_preview }}</div>
                            </div>
                            <div class="stat-label">Ngôn ngữ</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-group">
                                <div class="stat-icon"><img class="icon-md" src="/images/location.svg" alt="Location" /></div>
                                <div class="stat-value">{{ userData.address_preview }}</div>
                            </div>
                            <div class="stat-label">Địa chỉ</div>
                        </div>
                    </div>

                    <div class="subject-tags">
                        <span class="subject-tag" v-for="item in userData.user_subjects" :key="item.id">{{ item.subject_name }}</span>
                    </div>
                </div>

                <div class="action-group header-actions">
                    <button class="action-btn" :class="isSaved ? 'btn-favorite-active' : 'btn-secondary'" @click="toggleSave" :disabled="isSaving">
                        <svg v-if="isSaving" class="btn-icon animate-spin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <svg v-else class="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" :fill="isSaved ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"/>
                        </svg>
                        <span class="btn-text">{{ isSaved ? 'Đã lưu' : 'Yêu thích' }}</span>
                    </button>
                    <button class="action-btn btn-secondary">
                        <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"></line><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"></line></svg>
                        <span class="btn-text">Chia sẻ</span>
                    </button>
                </div>
            </div>

            <div class="price-bar">
                <div class="price-info">
                    <span class="price-label">Học phí:</span>
                    <span class="price-value">{{ getPriceRange(userData.user_subjects) }}</span>
                    <span class="price-unit">VND/giờ</span>
                </div>
                <div class="action-group price-actions">
                    <button class="action-btn btn-secondary border-r-2" @click="openSendMessageModal">
                        <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg>
                        <span class="btn-text">Nhắn tin</span>
                    </button>
                    <button class="action-btn btn-primary border-r-2" @click="redirectToBooking()">
                        <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" data-preply-ds-component="SvgTokyoUIIcon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="white"><path fill-rule="evenodd" d="m14 10 1-8L2 14h9l-1 8 12-12z" clip-rule="evenodd"></path></svg>
                        <span class="btn-text">Đặt lịch</span>
                    </button>
                </div>
            </div>
        </div>

        <div class="user-detail-main-v2">
            <div class="type-selector">
                <button
                    v-for="tab in tabs"
                    :key="tab.id"
                    :class="['type-button', { active: activeTab === tab.id }]"
                    @click="activeTab = tab.id"
                >
                    {{ tab.name }}
                </button>
            </div>

            <div class="tab-content">
                <OverviewTab v-if="activeTab === 'overview'" :user="userData" />
                <ReviewsTab v-if="activeTab === 'reviews'" :user="userData" />
            </div>
        </div>
    </div>

    <SendMessage
        v-if="showSendMessageModal"
        :user="selectedUser"	
        :isOpen="showSendMessageModal"
        @messageSent="handleMessageSent"
        @close="showSendMessageModal = false"
    />
</div>
</template>

<style scoped>
@import url('~/assets/css/UserDetail.css');

/* Favorite Button Styles */
.btn-favorite-active {
    background: linear-gradient(135deg, #ef4444, #dc2626) !important;
    color: white !important;
    border-color: #dc2626 !important;
}

.btn-favorite-active:hover {
    background: linear-gradient(135deg, #dc2626, #b91c1c) !important;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4) !important;
}

.btn-favorite-active .btn-icon {
    color: white !important;
}

.animate-spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.user-contact_heart {
    background: none;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 0.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.user-contact_heart:hover {
    background: rgba(239, 68, 68, 0.1);
    transform: scale(1.1);
}

.user-contact_heart svg {
    transition: all 0.3s ease;
}

.user-contact_heart:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>
