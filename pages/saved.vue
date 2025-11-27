<script setup>
import { ref, onMounted, computed } from 'vue';

const router = useRouter();
const { api } = useApi();
const { success, error: notifyError } = useNotification();
const { getFirstCharacterOfLastName } = useHelper();
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
    navigateTo(`/tutor/${tutorUid}`);
};

const bookTutor = (tutorUid) => {
    navigateTo(`/booking/${tutorUid}`);
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
            <div v-for="saved in savedTutors" :key="saved.id" class="tutor-card">
                <!-- Remove Button -->
                <button class="remove-btn" @click="removeSaved(saved.id, saved.saved_user?.full_name)" title="Bỏ yêu thích">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"/>
                    </svg>
                </button>

                <!-- Avatar -->
                <div class="tutor-avatar" @click="viewTutorProfile(saved.saved_user?.uid)">
                    <img v-if="saved.saved_user?.avatar" :src="saved.saved_user.avatar" :alt="saved.saved_user?.full_name" />
                    <div v-else class="avatar-placeholder">
                        {{ getFirstCharacterOfLastName(saved.saved_user?.full_name) }}
                    </div>
                </div>

                <!-- Tutor Info -->
                <div class="tutor-info">
                    <h3 class="tutor-name" @click="viewTutorProfile(saved.saved_user?.uid)">
                        {{ saved.saved_user?.full_name }}
                    </h3>
                    <p class="tutor-subjects">{{ saved.saved_user?.subject_preview }}</p>

                    <div class="tutor-meta">
                        <div class="meta-item">
                            <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/>
                            </svg>
                            <span>{{ saved.saved_user?.info_reviews?.average_rating || 'N/A' }}</span>
                        </div>
                        <div class="meta-item">
                            <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            <span>{{ saved.saved_user?.info_reviews?.total_reviews || 0 }} đánh giá</span>
                        </div>
                    </div>

                    <div class="tutor-location">
                        <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span>{{ saved.saved_user?.address_preview || 'Chưa cập nhật' }}</span>
                    </div>
                </div>

                <!-- Actions -->
                <div class="tutor-actions">
                    <button class="btn-secondary btn-sm" @click="viewTutorProfile(saved.saved_user?.uid)">
                        <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        Xem hồ sơ
                    </button>
                    <button class="btn-primary btn-sm" @click="bookTutor(saved.saved_user?.uid)" :disabled="saved.saved_user?.uid === currentUserUid">
                        <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        Đặt lịch
                    </button>
                </div>
            </div>
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

/* Tutor Card */
.tutor-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    position: relative;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.tutor-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

/* Remove Button */
.remove-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 40px;
    height: 40px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 2;
}

.remove-btn svg {
    width: 20px;
    height: 20px;
    color: #ef4444;
    transition: all 0.3s ease;
}

.remove-btn:hover {
    background: #ef4444;
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.remove-btn:hover svg {
    color: white;
}

/* Avatar */
.tutor-avatar {
    width: 100px;
    height: 100px;
    margin: 0 auto;
    border-radius: 50%;
    overflow: hidden;
    border: 4px solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    cursor: pointer;
    transition: all 0.3s ease;
}

.tutor-avatar:hover {
    transform: scale(1.05);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}

.tutor-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
    color: white;
    font-size: 2.5rem;
    font-weight: 700;
}

/* Tutor Info */
.tutor-info {
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.tutor-name {
    font-size: 1.35rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
    cursor: pointer;
    transition: color 0.3s ease;
}

.tutor-name:hover {
    color: var(--color-primary);
}

.tutor-subjects {
    color: #64748b;
    font-size: 0.95rem;
    margin: 0;
    line-height: 1.5;
}

.tutor-meta {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    padding: 1rem 0;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #64748b;
    font-size: 0.9rem;
}

.meta-item svg {
    width: 16px;
    height: 16px;
    color: #fbbf24;
}

.tutor-location {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    color: #64748b;
    font-size: 0.95rem;
}

.tutor-location svg {
    width: 16px;
    height: 16px;
}

.tutor-price {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: rgba(var(--color-primary-rgb, 59, 130, 246), 0.1);
    border-radius: 12px;
    font-weight: 600;
}

.price-label {
    color: #64748b;
    font-size: 0.9rem;
}

.price-value {
    color: var(--color-primary);
    font-size: 1.1rem;
    font-weight: 700;
}

.price-unit {
    color: #64748b;
    font-size: 0.85rem;
}

/* Actions */
.tutor-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: auto;
}

.tutor-actions button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
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

    .tutor-card {
        padding: 1.5rem;
    }

    .tutor-actions {
        flex-direction: column;
    }
}

@media (max-width: 480px) {
    .page-header {
        padding: 1.5rem;
    }

    .page-title {
        font-size: 1.5rem;
    }

    .tutor-card {
        padding: 1.25rem;
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

