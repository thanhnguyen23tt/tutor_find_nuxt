<template>
    <base-modal :isOpen="isOpen" title="Đánh giá gia sư" @close="$emit('close')" size="medium" :header="existingReview ? false : true" :paddingBody="existingReview ? false : true">
        <div class="review-modal">
            <!-- Existing Review Display -->
            <div v-if="existingReview" class="existing-review">
                <div class="review-card">
                    <div class="review-header">
                        <div class="header-content">
                            <div class="review-icon">
                                <svg class="check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <div>
                                <h3>Đánh giá của bạn</h3>
                                <p class="review-date">{{ existingReview.created_at ? formatDateTime(existingReview.created_at) : '' }}</p>
                            </div>
                            <button class="close-button btn-no-bg" @click="$emit('close')">
                                <svg class="icon-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div class="rating-display">
                        <div class="stars-container">
                            <div class="stars">
                                <svg
                                    v-for="i in 5"
                                    :key="i"
                                    class="star-icon"
                                    :class="{ 'filled': i <= existingReview.rating }"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                            </div>
                            <div class="rating-info">
                                <span class="rating-score">{{ existingReview.rating }}/5</span>
                                <span class="rating-text">{{ getRatingText(existingReview.rating) }}</span>
                            </div>
                        </div>
                    </div>

                    <div v-if="existingReview.comment" class="comment-section">
                        <div class="comment-header">
                            <svg class="comment-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                            </svg>
                            <h4>Nhận xét của bạn</h4>
                        </div>
                        <div class="comment-content">{{ existingReview.comment }}</div>
                    </div>
                </div>
            </div>

            <!-- Review Form -->
            <div v-else class="review-form">
                <div class="form-header">
                    <div class="form-icon">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                        </svg>
                    </div>
                    <div>
                        <h3>Chia sẻ trải nghiệm của bạn</h3>
                        <p>Đánh giá của bạn sẽ giúp gia sư cải thiện chất lượng dạy học</p>
                    </div>
                </div>

                <div class="rating-section">
                    <label class="section-label">
                        <svg class="label-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                        </svg>
                        Đánh giá chất lượng dạy học
                        <span class="required">*</span>
                    </label>

                    <div class="rating-input-container">
                        <div class="rating-input">
                            <button
                                v-for="i in 5"
                                :key="i"
                                class="star-button"
                                :class="{ 'active': i <= selectedRating }"
                                @click="selectedRating = i"
                                @mouseenter="hoveredRating = i"
                                @mouseleave="hoveredRating = 0"
                            >
                                <svg
                                    class="star-icon"
                                    :class="{ 'filled': i <= (hoveredRating || selectedRating) }"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                            </button>
                        </div>
                        <div class="rating-feedback">
                            <span v-if="selectedRating > 0" class="rating-score">{{ selectedRating }}/5</span>
                            <span class="rating-text" :class="{ 'visible': selectedRating > 0 }">
                                {{ getRatingText(selectedRating) }}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="comment-section-form">
                    <label class="section-label">
                        <svg class="label-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                        </svg>
                        Nhận xét chi tiết
                        <span class="optional">(Tùy chọn)</span>
                    </label>
                    <base-input
                        type="textarea"
                        v-model="reviewComment"
                        placeholder="Chia sẻ trải nghiệm học tập của bạn với gia sư này..."
                        :rows="4"
                        class="comment-textarea"
                    ></base-input>
                </div>

                <div class="modal-footer">
                    <button class="btn-lg btn-secondary" @click="$emit('close')">
                        <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                        Hủy
                    </button>
                    <button
                        class="btn-lg btn-primary"
                        :class="{ 'loading': isSubmitting, 'disabled': !canSubmit }"
                        @click="submitReview"
                        :disabled="!canSubmit || isSubmitting"
                    >
                        <svg v-if="isSubmitting" class="icon-md loading-icon" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <svg v-else class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                        </svg>
                        {{ isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá' }}
                    </button>
                </div>
            </div>
        </div>
    </base-modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const { api } = useApi();
const { success, error: notifyError } = useNotification();
const { formatDateTime } = useHelper();

const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false
    },
    booking: {
        type: Object,
        default: null
    },
    existingReview: {
        type: Object,
        default: null
    }
});

const emit = defineEmits(['close', 'reviewSubmitted']);

const selectedRating = ref(0);
const hoveredRating = ref(0);
const reviewComment = ref('');
const isSubmitting = ref(false);

const canSubmit = computed(() => {
    return selectedRating.value > 0;
});

const getRatingText = (rating) => {
    const texts = {
        1: 'Rất không hài lòng',
        2: 'Không hài lòng',
        3: 'Bình thường',
        4: 'Hài lòng',
        5: 'Rất hài lòng'
    };
    return texts[rating] || '';
};

const submitReview = async () => {
    if (!canSubmit.value || isSubmitting.value) return;

    isSubmitting.value = true;

    try {
        const payload = {
            booking_id: props.booking.id,
            rating: selectedRating.value,
            comment: reviewComment.value.trim() || null
        };

        const response = await api.apiPost('reviews', payload);

        if (response.success) {
            success('Cảm ơn bạn đã đánh giá!');
            emit('reviewSubmitted', response.data);
            emit('close');
        } else {
            notifyError(response.message || 'Có lỗi xảy ra khi gửi đánh giá');
        }
    } catch (error) {
        console.error('Error submitting review:', error);
        notifyError('Có lỗi xảy ra khi gửi đánh giá');
    } finally {
        isSubmitting.value = false;
    }
};

// Reset form when modal opens
watch(() => props.isOpen, (newVal) => {
    if (newVal && !props.existingReview) {
        selectedRating.value = 0;
        hoveredRating.value = 0;
        reviewComment.value = '';
    }
});
</script>

<style scoped>
@import url("~/assets/css/ReviewModal.css");
</style>
