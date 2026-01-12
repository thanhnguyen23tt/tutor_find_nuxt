<script setup>
definePageMeta({
	middleware: [
		'auth', 
		() => {
		useLayoutStore().setHiddenFooter(true)
		}
	]
})

import TutorCard from '~/components/common/TutorCard.vue';

const { api } = useApi();
const { success, error: notifyError } = useNotification();
const userStore = useUserStore();

const savedTutors = ref([]);
const isLoading = ref(false);
const currentUserUid = computed(() => userStore.getUserData?.uid);

const fetchSavedTutors = async () => {
    isLoading.value = true;
    try {
        const response = await api.apiGet('saved');
        if (response.success) {
            savedTutors.value = response.data;
        }
    } catch (error) {
        console.error('Error fetching saved tutors:', error);
        notifyError('Không thể tải danh sách yêu thích');
    } finally {
        isLoading.value = false;
    }
};

const removeSaved = async (savedId, tutorName) => {
    try {
        const response = await api.apiDelete(`saved/${savedId}`);
        if (response.success) {
            savedTutors.value = savedTutors.value.filter(item => item.id !== savedId);
            success(`Đã xóa ${tutorName} khỏi danh sách yêu thích`);
        }
    } catch (error) {
        console.error('Error removing saved tutor:', error);
        notifyError('Có lỗi xảy ra');
    }
};

const viewTutorProfile = (tutorUid) => {
return navigateTo(`/tutor/${tutorUid}`);
};


onMounted(() => {
    fetchSavedTutors();
});
</script>

<template>
<div class="saved-page">
    <div class="container">
        <!-- Page Header -->
        <div class="page-header">
            <div class="header-content">
                <div class="header-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"/>
                    </svg>
                </div>
                <div>
                    <h1 class="page-title">Gia sư yêu thích</h1>
                    <p class="page-subtitle">
                        {{ savedTutors.length }} gia sư trong danh sách của bạn
                    </p>
                </div>
            </div>
        </div>

        <!-- Loading State -->
        <base-loading v-if="isLoading" />

        <!-- Empty State -->
        <div v-else-if="savedTutors.length === 0" class="empty-state">
            <div class="empty-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
                </svg>
            </div>
            <h3 class="empty-title">Chưa có gia sư yêu thích</h3>
            <p class="empty-text">Bạn chưa lưu gia sư nào vào danh sách yêu thích. Hãy khám phá và tìm gia sư phù hợp với bạn!</p>
            <button class="btn-primary btn-lg" @click="navigateTo('/tutors')">
                <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
                Tìm gia sư
            </button>
        </div>

        <!-- Saved Tutors Grid -->
        <div v-else class="tutors-grid">
            <TutorCard 
                v-for="saved in savedTutors" 
                :key="saved.id" 
                :tutor="saved"
                :disableBooking="saved.saved_user?.uid === currentUserUid"
                @remove-saved="removeSaved"
            />
        </div>
    </div>
</div>
</template>

<style scoped>
.saved-page {
    padding: 2rem 0;
	background: white;
}

.container {
    margin: 0 auto;
    padding: 0 1rem;
}

/* Page Header */
.page-header {
    margin-bottom: 3rem;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    padding: 2.5rem;
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.header-content {
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.header-icon {
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, #ef4444, #dc2626);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 8px 24px rgba(239, 68, 68, 0.3);
}

.header-icon svg {
    width: 32px;
    height: 32px;
    color: white;
}

.page-title {
    font-size: 2rem;
    font-weight: 900;
    background: linear-gradient(135deg, #1f2937, #374151);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    margin: 0 0 0.5rem 0;
}

.page-subtitle {
    color: #64748b;
    font-size: 1.1rem;
    margin: 0;
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: 4rem 2rem;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.empty-icon {
    width: 120px;
    height: 120px;
    margin: 0 auto 2rem;
    background: linear-gradient(135deg, #fef2f2, #fee2e2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.empty-icon svg {
    width: 60px;
    height: 60px;
    color: #ef4444;
}

.empty-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 1rem 0;
}

.empty-text {
    color: #64748b;
    font-size: 1.1rem;
    max-width: 500px;
    margin: 0 auto 2rem;
    line-height: 1.6;
}

/* Tutors Grid */
.tutors-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 2rem;
}



/* Responsive */
@media (max-width: 768px) {
    .saved-page {
        padding: 1rem 0;
    }

    .page-header {
        padding: 2rem 1.5rem;
        margin-bottom: 2rem;
    }

    .header-content {
        flex-direction: column;
        text-align: center;
    }

    .page-title {
        font-size: 1.75rem;
    }

    .tutors-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }
}

@media (max-width: 480px) {
    .page-header {
        padding: 1.5rem;
    }

    .page-title {
        font-size: 1.5rem;
    }

    .header-icon {
        width: 56px;
        height: 56px;
    }

    .header-icon svg {
        width: 28px;
        height: 28px;
    }
}
</style>

