<template>
    <div class="content-section">
        <div class="content-card reviews-main-card">
            <!-- Review Header -->
            <div class="review-header">
                <div class="header-content">
                    <div class="section-title-container">
                        <h3 class="section-title">Đánh giá từ học viên</h3>
                        <div class="rating-badge section-title-desc">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                            {{ user.info_reviews?.average_rating || 0 }} <span>({{ user.info_reviews?.total_reviews || 0 }} đánh giá)</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Rating Overview -->
            <div class="rating-overview">
                <div class="rating-score-card">
                    <div class="score-circle">
                        <div class="score-number">{{ user.info_reviews?.average_rating || 0 }}</div>
                        <div class="rating-stars">
                            <div v-for="i in 5" :key="i" class="star-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                            </div>
                        </div>
                        <div class="total-reviews">{{ user.info_reviews?.total_reviews || 0 }} đánh giá</div>
                    </div>
                </div>

                <div class="rating-bars">
                    <div v-for="rating in ratingStats" :key="rating.stars" class="rating-bar-item">
                        <div class="stars">{{ rating.stars }}</div>
                        <div class="bar-wrapper">
                            <div class="bar" :style="{ width: rating.percentage + '%' }"></div>
                        </div>
                        <div class="percentage">{{ rating.percentage }}%</div>
                    </div>
                </div>
            </div>

            <!-- Review List -->
            <div class="review-list" v-if="displayedReviews.length > 0">
                <div v-for="review in displayedReviews" :key="review.id" class="review-item">
                    <div class="review-card">
                        <div class="review-author">
                            <div class="author-avatar-wrapper">
                                <img :src="review.avatar" class="author-avatar">
                            </div>
                            <div class="author-info">
                                <div class="author-name">{{ review.name }}</div>
                                <div class="review-date">{{ review.date }}</div>
                            </div>
                            <div class="review-rating">
                                <div class="rating-stars">
                                    <svg v-for="i in review.rating" :key="i" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                </div>
                            </div>
                        </div>
                        <div class="review-content">{{ review.content }}</div>
                        <div class="review-footer">
                            <div class="review-subject">{{ review.subject }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- No Reviews State -->
            <div v-else class="no-reviews">
                <div class="no-reviews-content">
                    <svg class="no-reviews-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    <h3>Chưa có đánh giá nào</h3>
                    <p>Hãy là người đầu tiên đánh giá cho gia sư này!</p>
                </div>
            </div>

            <!-- View All Reviews Button -->
            <button v-if="hasMoreReviews" class="btn-md btn-secondary w-100" @click="openAllReviewsModal">Xem tất cả đánh giá ({{ reviews.length }})</button>
        </div>
    </div>

    <!-- All Reviews Modal -->
    <BaseModal
        :isOpen="isAllReviewsModalOpen"
        @close="closeAllReviewsModal"
        title="Tất cả đánh giá"
        :description="`${reviews.length} đánh giá từ học viên`"
        size="xl"
    >
        <div class="modal-reviews-container">
            <!-- Rating Overview in Modal -->
            <div class="modal-rating-overview">
                <div class="modal-rating-score-card">
                    <div class="modal-score-circle">
                        <div class="modal-score-number">{{ user.info_reviews?.average_rating || 0 }}</div>
                        <div class="modal-rating-stars">
                            <div v-for="i in 5" :key="i" class="star-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                            </div>
                        </div>
                        <div class="modal-total-reviews">{{ user.info_reviews?.total_reviews || 0 }} đánh giá</div>
                    </div>
                </div>

                <div class="modal-rating-bars">
                    <div v-for="rating in ratingStats" :key="rating.stars" class="modal-rating-bar-item">
                        <div class="modal-stars">{{ rating.stars }}</div>
                        <div class="modal-bar-wrapper">
                            <div class="modal-bar" :style="{ width: rating.percentage + '%' }"></div>
                        </div>
                        <div class="modal-percentage">{{ rating.percentage }}%</div>
                    </div>
                </div>
            </div>

            <!-- All Reviews List -->
            <div class="modal-review-list">
                <div v-for="review in reviews" :key="review.id" class="modal-review-item">
                    <div class="modal-review-card">
                        <div class="modal-review-author">
                            <div class="modal-author-avatar-wrapper">
                                <img :src="review.avatar" class="modal-author-avatar">
                            </div>
                            <div class="modal-author-info">
                                <div class="modal-author-name">{{ review.name }}</div>
                                <div class="modal-review-date">{{ review.date }}</div>
                            </div>
                            <div class="modal-review-rating">
                                <div class="modal-rating-stars">
                                    <svg v-for="i in review.rating" :key="i" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                </div>
                            </div>
                        </div>
                        <div class="modal-review-content">{{ review.content }}</div>
                        <div class="modal-review-footer">
                            <div class="modal-review-subject">{{ review.subject }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </BaseModal>
</template>

<script setup>
import { computed, ref } from 'vue';
import BaseModal from '~/components/common/BaseModal.vue';

const props = defineProps({
    user: {
        type: Object,
        required: true
    }
});

// Tính toán rating stats từ dữ liệu thật
const ratingStats = computed(() => {
    if (!props.user.reviews || props.user.reviews.length === 0) {
        return [
            { stars: 5, percentage: 0 },
            { stars: 4, percentage: 0 },
            { stars: 3, percentage: 0 },
            { stars: 2, percentage: 0 },
            { stars: 1, percentage: 0 }
        ];
    }

    const totalReviews = props.user.reviews.length;
    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    // Đếm số lượng review theo từng rating
    props.user.reviews.forEach(review => {
        ratingCounts[review.rating] = (ratingCounts[review.rating] || 0) + 1;
    });

    // Tính phần trăm
    return [5, 4, 3, 2, 1].map(stars => ({
        stars,
        percentage: Math.round((ratingCounts[stars] / totalReviews) * 100)
    }));
});

// Format reviews từ dữ liệu thật
const reviews = computed(() => {
    if (!props.user.reviews) return [];

    return props.user.reviews.map(review => ({
        id: review.id,
        name: review.user?.full_name || 'Anonymous',
        date: new Date(review.created_at).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        rating: review.rating,
        content: review.comment || 'Không có bình luận',
        subject: 'Môn học',
        avatar: review.user?.avatar || '/images/default-avatar.png'
    }));
});

// Chỉ hiển thị 5 reviews đầu tiên
const displayedReviews = computed(() => {
    return reviews.value.slice(0, 5);
});

// Kiểm tra xem có nhiều hơn 5 reviews không
const hasMoreReviews = computed(() => {
    return reviews.value.length > 5;
});

// Modal state
const isAllReviewsModalOpen = ref(false);

const openAllReviewsModal = () => {
    isAllReviewsModalOpen.value = true;
};

const closeAllReviewsModal = () => {
    isAllReviewsModalOpen.value = false;
};
</script>

<style scoped>
@import url('~/assets/css/UserDetail.css');

/* Component-specific styles */
.review-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #f1f5f9;
}

.header-content {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.rating-badge {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: #18181b;
    font-weight: 600;
}

.rating-badge svg {
    color: var(--color-primary);
}

.rating-badge span {
    color: #71717a;
    font-weight: normal;
}

.rating-overview {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 2rem;
    padding: 2rem;
    background: linear-gradient(135deg, var(--gray-100) 0%, var(--gray-200) 100%);
    border-radius: 16px;
    margin-bottom: 2rem;
    border: 1px solid var(--gray-300);
}

.rating-score-card {
    display: flex;
    justify-content: center;
}

.score-circle {
    text-align: center;
    background: white;
    border-radius: 50%;
    width: 150px;
    height: 150px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border: 3px solid var(--color-primary);
}

.score-number {
    font-size: 2rem;
    font-weight: 800;
    color: #1e293b;
    margin-bottom: 0.25rem;
}

.rating-stars {
    display: flex;
    gap: 0.25rem;
    color: var(--color-primary);
    margin-bottom: 0.5rem;
}

.total-reviews {
    color: #71717a;
    font-size: 0.875rem;
}

.rating-bars {
    padding: 0.5rem 0;
    display: grid;
    gap: 1rem;
}

.rating-bar-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.rating-bar-item .stars {
    width: 1rem;
    color: #71717a;
    font-size: 0.875rem;
}

.bar-wrapper {
    flex: 1;
    height: 0.5rem;
    background: var(--gray-300);
    border-radius: 9999px;
    overflow: hidden;
}

.bar {
    height: 100%;
    background: var(--color-primary);
    border-radius: 9999px;
}

.percentage {
    width: 2.5rem;
    color: #71717a;
    font-size: 0.875rem;
    text-align: right;
}


.review-list {
    display: grid;
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.review-item {
    margin: 0;
}

.review-author {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
}

.author-avatar-wrapper {
    position: relative;
}

.author-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid var(--gray-300);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.author-info {
    flex: 1;
}

.author-name {
    font-weight: 600;
    color: #18181b;
    margin-bottom: 0.25rem;
}

.review-date {
    color: #71717a;
    font-size: 0.875rem;
}

.review-rating {
    color: var(--color-primary);
}

.review-content {
    color: #475569;
    line-height: 1.7;
    margin-bottom: 1rem;
    font-size: 0.95rem;
    background: var(--gray-100);
    padding: 1rem;
    border-radius: 12px;
    border-left: 4px solid var(--color-primary);
    font-style: italic;
}

.review-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--gray-300);
}

.review-subject {
    display: inline-flex;
    align-items: center;
    padding: 0.375rem 0.875rem;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    border-radius: 20px;
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.btn-load-more {
    width: 100%;
    padding: 0.75rem;
    background: white;
    border: 1px solid var(--color-primary);
    border-radius: 0.5rem;
    color: #18181b;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-load-more:hover {
    background: var(--color-primary-light);
}

/* No Reviews State */
.no-reviews {
    text-align: center;
    padding: 3rem 2rem;
    background: linear-gradient(135deg, var(--gray-50) 0%, var(--gray-100) 100%);
    border-radius: 16px;
    border: 2px dashed var(--gray-300);
}

.no-reviews-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.no-reviews-icon {
    width: 4rem;
    height: 4rem;
    color: var(--gray-400);
    margin-bottom: 0.5rem;
}

.no-reviews h3 {
    color: var(--gray-600);
    font-size: var(--font-size-large);
    font-weight: 600;
    margin: 0;
}

.no-reviews p {
    color: var(--gray-500);
    font-size: var(--font-size-base);
    margin: 0;
}

@media (max-width: 768px) {
    .rating-overview {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }

    .rating-stats {
        padding-left: 0;
        border-left: none;
        border-top: 1px solid var(--gray-300);
        padding-top: 1.5rem;
    }

    .no-reviews {
        padding: 2rem 1rem;
    }

    .no-reviews-icon {
        width: 3rem;
        height: 3rem;
    }
}

/* Modal Reviews Styles */

.modal-rating-overview {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 2rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, var(--gray-100) 0%, var(--gray-200) 100%);
    border-radius: 12px;
    margin-bottom: 2rem;
    border: 1px solid var(--gray-300);
}

.modal-rating-score-card {
    display: flex;
    justify-content: center;
}

.modal-score-circle {
    text-align: center;
    background: white;
    border-radius: 50%;
    width: 120px;
    height: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border: 3px solid var(--color-primary);
}

.modal-score-number {
    font-size: 1.75rem;
    font-weight: 800;
    color: #1e293b;
    margin-bottom: 0.25rem;
}

.modal-rating-stars {
    display: flex;
    gap: 0.25rem;
    color: var(--color-primary);
    margin-bottom: 0.5rem;
}

.modal-total-reviews {
    color: #71717a;
    font-size: 0.875rem;
}

.modal-rating-bars {
    padding: 0.5rem 0;
    display: grid;
    gap: 1rem;
}

.modal-rating-bar-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.modal-rating-bar-item .modal-stars {
    width: 1rem;
    color: #71717a;
    font-size: 0.875rem;
}

.modal-bar-wrapper {
    flex: 1;
    height: 0.5rem;
    background: var(--gray-300);
    border-radius: 9999px;
    overflow: hidden;
}

.modal-bar {
    height: 100%;
    background: var(--color-primary);
    border-radius: 9999px;
}

.modal-percentage {
    width: 2.5rem;
    color: #71717a;
    font-size: 0.875rem;
    text-align: right;
}

.modal-review-list {
    display: grid;
    gap: 1.5rem;
}

.modal-review-item {
    margin: 0;
}

.modal-review-author {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
}

.modal-author-avatar-wrapper {
    position: relative;
}

.modal-author-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid var(--gray-300);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.modal-author-info {
    flex: 1;
}

.modal-author-name {
    font-weight: 600;
    color: #18181b;
    margin-bottom: 0.25rem;
}

.modal-review-date {
    color: #71717a;
    font-size: 0.875rem;
}

.modal-review-rating {
    color: var(--color-primary);
}

.modal-review-content {
    color: #475569;
    line-height: 1.7;
    margin-bottom: 1rem;
    font-size: 0.95rem;
    background: var(--gray-100);
    padding: 1rem;
    border-radius: 12px;
    border-left: 4px solid var(--color-primary);
    font-style: italic;
}

.modal-review-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--gray-300);
}

.modal-review-subject {
    display: inline-flex;
    align-items: center;
    padding: 0.375rem 0.875rem;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    border-radius: 20px;
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

@media (max-width: 768px) {
    .modal-rating-overview {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }

    .modal-score-circle {
        width: 100px;
        height: 100px;
    }

    .modal-score-number {
        font-size: 1.5rem;
    }
}
</style>
