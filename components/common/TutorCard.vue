<template>
    <div class="tutor-card" @click="navigateToTutor(tutor.uid)">
        <div class="tutor-card-wrapper">
            <div class="tutor-header-wrapper">
                <img :src="tutor.avatar" alt="" class="tutor-image">

                <div class="tutor-header_detail">
                    <div class="tutor-name">
                        <span>{{ tutor.full_name }}</span>
                        <svg aria-label="Đã xác minh" class="icon-md" fill="rgb(0, 149, 246)" height="12" role="img" viewBox="0 0 40 40" width="12"><title>Đã xác minh</title><path d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z" fill-rule="evenodd"></path></svg>
                    </div>
                    <div class="location-name">
                        <span>{{ tutor.address_preview }}</span>
                    </div>
                </div>

                <button class="btn-like" @click.stop="toggleSave(tutor)" title="Yêu thích" v-if="!tutor.is_saved">
                    <svg xmlns="http://www.w3.org/2000/svg"
                        class="icon-md"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5">
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218
                            25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25
                            2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052
                            5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25
                            0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17
                            15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752
                            0 01-.704 0l-.003-.001z"/>
                    </svg>
                </button>

                <button class="remove-btn" @click.stop="toggleSave(tutor)" title="Yêu thích" v-else>
                    <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"/>
                    </svg>
                </button>
            </div>

            <div class="tutor-info">
                <div class="subject-list">
                    <div class="subject-row">
                        <span v-for="subject in tutor.user_subjects"
                            :key="subject.id"
                            class="subject-tag">
                            {{ subject.subject_name }}
                        </span>
                    </div>

                    <div class="subject-levels">
                        <span v-for="(item, idx) in tutor.user_subject_levels" :key="idx" class="level-tag">
                            {{ item.subject_name }} - {{ item.level_name }}
                        </span>
                    </div>
                </div>

                <div class="info-list">
                    <div class="info-item" v-if="tutor.user_educations && tutor.user_educations.length > 0">
                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"></path><path d="M22 10v6"></path><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"></path></svg>
                        <div class="info-wrapper">
                            <div class="info-title">
                                {{ tutor.user_educations[0].school_name }}
                            </div>
                            <div class="info-subtitle">Kinh nghiệm học tập</div>
                        </div>
                    </div>

                    <div class="info-item" v-if="tutor.user_experiences && tutor.user_experiences.length > 0">
                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                            <rect width="20" height="14" x="2" y="6" rx="2"></rect>
                        </svg>
                        <div class="info-wrapper">
                            <div class="info-title">{{ tutor.user_experiences[0].name }}</div>
                            <div class="info-subtitle">Kinh nghiệm làm việc</div>
                        </div>
                    </div>

                    <div class="info-item">
                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"></path><path d="M11 12 5.12 2.2"></path><path d="m13 12 5.88-9.8"></path><path d="M8 7h8"></path><circle cx="12" cy="17" r="5"></circle><path d="M12 18v-2h-.5"></path></svg>
                        <div class="info-wrapper">
                            <div class="info-title">{{ tutor.user_languages.map(language => language.language).join(', ') }}</div>
                            <div class="info-subtitle">Ngôn ngữ sử dụng</div>
                        </div>
                    </div>
                </div>

                <div class="text-base text-gray-700 about-you">
                    {{ tutor.about_you }}
                </div>
            </div>
        </div>
        <div class="tutor-card-bottom">
            <div class="price-section" @mouseenter="showPriceDetail = tutor.id" @mouseleave="showPriceDetail = null" @click.stop>
                <div class="price-range" style="position: relative;">
                    <span>{{ getPriceRange(tutor.user_subjects || []) }}</span>
                    <div v-if="showPriceDetail === tutor.id" class="price-detail-popup">
                        <div class="popup-title">Học phí theo môn học và cấp độ:</div>
                        <div v-for="(subject, sidx) in tutor.user_subjects" :key="subject.id" class="price-detail-subject">
                            <div class="subject-title">{{ subject.subject_name }}</div>
                            <table class="price-table">
                                <tbody>
                                    <tr v-for="level in subject.user_subject_levels" :key="level.id">
                                        <td class="level-name">{{ level.education_level }}</td>
                                        <td class="level-price">{{ formatCurrency(level.price) }}/giờ</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <i class="fa-solid fa-angle-down icon-md icon-arrow-down"></i>
                </div>
                <div class="rating">
                    <i class="fas fa-star"></i>
                    <span>{{ tutor.info_reviews?.average_rating }}</span>
                    <span class="student-count">({{ tutor.info_reviews?.total_reviews }} học sinh)</span>
                </div>
            </div>
            <div class="tutor-actions">
                <button class="btn-lg btn-primary w-100 border-r-2" @click.stop="redirectToBooking(tutor.uid)">
                    Đặt lịch học
                </button>
                <button class="btn-lg btn-secondary border-r-2" @click.stop="showSendMessageModal = true">
                    <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg>
                </button>
            </div>
        </div>
    </div>

    <SendMessage
        v-if="showSendMessageModal"
        :user="tutor"
        :isOpen="showSendMessageModal"
        @messageSent="handleMessageSent"
        @close="showSendMessageModal = false"
    />
</template>

<script setup>
import { ref } from 'vue';
import SendMessage from '~/components/common/SendMessage.vue';

const { api } = useApi();
const { success, error: notifyError } = useNotification();
const { formatCurrency, getPriceRange } = useHelper();
const showSendMessageModal = ref(false);
const showPriceDetail = ref(null);

const props = defineProps({
    tutor: {
        type: Array,
        required: true
    }
});

const emit = defineEmits(['toggle-save', 'navigate-to-tutor', 'redirect-to-booking']);

const toggleSave = async (tutor) => {
    try {
        const response = await api.apiPost('saved/toggle', {
            tutor_uid: tutor.uid
        });

        if (response.success) {
            tutor.is_saved = response.is_saved;
            success(response.message);
            emit('toggle-save', tutor);
        } else {
            notifyError(response.message || 'Có lỗi xảy ra');
        }
    } catch (error) {
        notifyError('Có lỗi xảy ra');
    }
};

const navigateToTutor = (uid) => {
    emit('navigate-to-tutor', uid);
    navigateTo(`/tutor/${uid}`);
};

const redirectToBooking = (uid) => {
    const bookingUrl = `/booking/${uid}`;
    if (process.client) {
        window.open(bookingUrl, '_blank');
    }
    emit('redirect-to-booking', uid);
};

const handleMessageSent = () => {
    showSendMessageModal.value = false;
    success('Gửi tin nhắn thành công!');
};
</script>

<style scoped>
@import url('~/assets/css/tutorCard.css');
</style>
