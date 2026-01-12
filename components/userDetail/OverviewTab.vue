<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
	user: {
		type: Object,
		required: true
	},
    suggestedTutors: {
        type: Array,
        default: () => []
    }
});

const configStore = useConfigStore();

// ===== COMPUTED: Data validation =====
const hasEducations = computed(() =>
	Array.isArray(props.user?.user_educations) && props.user.user_educations.length > 0
);

const hasExperiences = computed(() =>
	Array.isArray(props.user?.user_experiences) && props.user.user_experiences.length > 0
);

const hasSubjects = computed(() =>
	Array.isArray(props.user?.user_subjects) && props.user.user_subjects.length > 0
);

const hasSchedule = computed(() =>
	Array.isArray(props.user?.user_weekly_time_slots) && props.user.user_weekly_time_slots.length > 0
);

// ===== PRICING SECTION =====
const currentSubject = ref(null);

// Initialize current subject
watch(() => props.user, (newUser) => {
	if (newUser?.user_subjects?.[0]?.subject_id && !currentSubject.value) {
		currentSubject.value = newUser.user_subjects[0].subject_id;
	}
}, { immediate: true });

const subjectTabs = computed(() => {
	if (!hasSubjects.value) return [];
	return props.user.user_subjects.map(subject => ({
		value: subject.subject_id,
		label: subject.subject_name
	}));
});

const currentLevels = computed(() => {
	if (!hasSubjects.value || !currentSubject.value) return [];

	const subject = props.user.user_subjects.find(
		s => s.subject_id === currentSubject.value
	);

	return subject?.user_subject_levels || [];
});

const currentSubjectName = computed(() => {
    const subject = subjectTabs.value.find(s => s.value === currentSubject.value);
    return subject ? subject.label : '';
});

const getLevelInitials = (levelName) => {
    if (!levelName) return '';
    // Take first word or first 2 chars
    return levelName.substring(0, 2).toUpperCase();
};

const formatPrice = (price) => {
	return Number(price || 0).toLocaleString('vi-VN');
};

// ===== SCHEDULE SECTION =====
const weekDayOptions = computed(() => configStore.configuration.day_of_weeks || []);

const selectedMobileDayId = ref(null);

// Initialize selected mobile day
watch(() => weekDayOptions.value, (days) => {
	if (days.length > 0 && !selectedMobileDayId.value) {
		selectedMobileDayId.value = days[0].id;
	}
}, { immediate: true });

// Format time for display (HH:mm:ss -> HH:mm)
const formatTimeDisplay = (timeStr) => {
	if (!timeStr) return '';
	return timeStr.substring(0, 5); // "07:00:00" -> "07:00"
};

// Get ranges for a specific day
const getDayRanges = (dayId) => {
	if (!hasSchedule.value) return [];
	
	const ranges = props.user.user_weekly_time_slots.filter(
		slot => slot.day_of_week_code == dayId
	);

    const slots = [];
    ranges.forEach(range => {
        if (range.time_slots && Array.isArray(range.time_slots)) {
            range.time_slots.forEach(time => {
                slots.push({
                    id: `${range.id}-${time}`,
                    time: time.slice(0, 5)
                });
            });
        }
    });
    
    return slots.sort((a, b) => a.time.localeCompare(b.time));
};

// Mobile schedule helpers
const selectedDayName = computed(() => {
	const day = weekDayOptions.value.find(d => d.id === selectedMobileDayId.value);
	return day?.name || 'Chọn ngày';
});

const selectedDayRanges = computed(() => {
	return getDayRanges(selectedMobileDayId.value);
});

// Schedule expansion
const isScheduleExpanded = ref(false);
const toggleSchedule = () => {
	isScheduleExpanded.value = !isScheduleExpanded.value;
	isMobileScheduleExpanded.value = !isMobileScheduleExpanded.value;
};

// Mobile Schedule expansion
const isMobileScheduleExpanded = ref(false);
const displayedMobileRanges = computed(() => {
    if (isMobileScheduleExpanded.value) {
        return selectedDayRanges.value;
    }
    return selectedDayRanges.value.slice(0, 4);
});

// Reset mobile expansion when day changes
watch(selectedMobileDayId, () => {
    isMobileScheduleExpanded.value = false;
});

// Price card carousel for mobile
const currentPriceIndex = ref(0);

const nextPrice = () => {
	if (currentLevels.value.length > 0) {
		currentPriceIndex.value = (currentPriceIndex.value + 1) % currentLevels.value.length;
	}
};

const prevPrice = () => {
	if (currentLevels.value.length > 0) {
		currentPriceIndex.value = currentPriceIndex.value === 0 
			? currentLevels.value.length - 1 
			: currentPriceIndex.value - 1;
	}
};

// Reset price index when subject changes
watch(currentSubject, () => {
	currentPriceIndex.value = 0;
});

const getEmbedUrl = (url) => {
	if (!url) return '';
	const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
	const match = url.match(regex);
	if (match && match[1]) {
		return `https://www.youtube.com/embed/${match[1]}`;
	}
	return '';
};
</script>

<template>
	<div class="content-section">
		<!-- About Section -->
		<div class="content-card about-card">
			<div class="card-header">
				<div class="section-title-container">
					<h3 class="section-title">Về {{ user.full_name }}</h3>
					<span class="section-title-desc">giới thiệu bản thân</span>
				</div>
			</div>
			<div class="about-content">
				<p class="section-paragraph">{{ user.about_you }}</p>
			</div>
		</div>

		<!-- Education Section -->
		<div class="content-card education-card" v-if="hasEducations">
			<div class="card-header">
				<div class="section-title-container">
					<h3 class="section-title">Học vấn</h3>
					<span class="section-title-desc">học vấn của {{ user.full_name }}</span>
				</div>
			</div>
			<div class="timeline-container">
				<div class="timeline">
					<div class="timeline-item" v-for="edu in user.user_educations" :key="edu.id">
						<div class="timeline-bullet">
							<div class="bullet-inner"></div>
						</div>
						<div class="timeline-content">
							<div class="timeline-card">
								<div class="timeline-year">{{ edu.time }}</div>
								<div class="timeline-title">{{ edu.school_name }}</div>
								<div class="timeline-major" v-if="edu.major">{{ edu.major }}</div>
								<div class="timeline-subtitle" v-if="edu.description">{{ edu.description }}</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Experience Section -->
		<div class="content-card experience-card" v-if="hasExperiences">
			<div class="card-header">
				<div class="section-title-container">
					<h3 class="section-title">Kinh nghiệm làm việc</h3>
					<span class="section-title-desc">kinh nghiệm làm việc của {{ user.full_name }}</span>
				</div>
			</div>
			<div class="timeline-container">
				<div class="timeline">
					<div class="timeline-item" v-for="exp in user.user_experiences" :key="exp.id">
						<div class="timeline-bullet">
							<div class="bullet-inner"></div>
						</div>
						<div class="timeline-content">
							<div class="timeline-card">
								<div class="timeline-year">{{ exp.time }}</div>
								<div class="timeline-title">{{ exp.name }}</div>
								<div class="timeline-major" v-if="exp.position">{{ exp.position }}</div>
								<div class="timeline-subtitle" v-if="exp.description">{{ exp.description }}</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Pricing Section -->
		<div class="content-card pricing-main-card" v-if="hasSubjects">
			<div class="card-header">
				<div class="section-title-container">
					<h3 class="section-title">Bảng giá theo cấp độ</h3>
					<span class="section-title-desc">bảng giá sẽ theo từng cấp độ học</span>
				</div>
			</div>

			<!-- Subject tabs -->
		<base-status-tabs v-if="subjectTabs.length > 1" v-model="currentSubject" :tabs="subjectTabs" />

			<!-- Price cards - List View -->
			<div class="price-list" v-if="currentLevels.length > 0">
				<div class="price-row" v-for="level in currentLevels" :key="level.id">
					<div class="price-row-left">
						<div class="level-avatar">
							{{ getLevelInitials(level.education_level) }}
						</div>
						<div class="level-info-row">
							<span class="level-name">{{ level.education_level }}</span>
							<span class="subject-name">{{ currentSubjectName }}</span>
						</div>
					</div>
					<div class="price-row-right">
						<span class="price-value">{{ formatPrice(level.price) }} đ</span>
					</div>
				</div>
			</div>


		<p class="price-note">
			Tất cả các buổi học đều bao gồm tài liệu học tập cá nhân hóa, bài tập thực hành và theo dõi tiến độ.
		</p>
		</div>

		<!-- Schedule Section -->
		<div class="content-card schedule-card" v-if="hasSchedule">
			<div class="card-header">
				<div class="section-title-container">
					<h3 class="section-title">Lịch hàng tuần</h3>
					<span class="section-title-desc">lịch hàng tuần của {{ user.full_name }}</span>
				</div>
			</div>

			<!-- Legend -->
			<div class="schedule-legend">
				<div class="legend-item">
					<span class="legend-dot available"></span>
					<span class="legend-text">Còn trống</span>
				</div>
				<div class="legend-item">
					<span class="legend-dot busy"></span>
					<span class="legend-text">Đã đặt</span>
				</div>
			</div>

			<!-- Desktop Schedule -->
			<div class="schedule-desktop" :class="{ 'schedule-collapsed': !isScheduleExpanded }">
				<div class="columns">
					<div class="day-column" v-for="day in weekDayOptions" :key="`desktop-day-${day.id}`">
						<div class="day-header">
							<svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
								stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
								<line x1="16" y1="2" x2="16" y2="6"></line>
								<line x1="8" y1="2" x2="8" y2="6"></line>
								<line x1="3" y1="10" x2="21" y2="10"></line>
							</svg>
							<span>{{ day.name }}</span>
						</div>
						<div class="time-list">
							<template v-if="getDayRanges(day.id).length > 0">
								<div v-for="slot in getDayRanges(day.id)" :key="`desktop-range-${day.id}-${slot.id}`"
									class="time-item">
									<span class="time-text">{{ slot.time }}</span>
								</div>
							</template>
							<div v-else class="time-empty">
								<svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
									stroke="currentColor" stroke-width="2" stroke-linecap="round"
									stroke-linejoin="round">
									<circle cx="12" cy="12" r="10"></circle>
									<line x1="15" y1="9" x2="9" y2="15"></line>
									<line x1="9" y1="9" x2="15" y2="15"></line>
								</svg>
								<span>Không có lịch</span>
							</div>
						</div>
					</div>
				</div>
                
                <!-- Gradient Overlay when collapsed -->
                <div class="schedule-overlay" v-if="!isScheduleExpanded"></div>
			</div>

            <!-- Toggle Button -->
            <div class="schedule-actions">
                <button class="btn-toggle-schedule" @click="toggleSchedule">
                    <span>{{ isScheduleExpanded ? 'Thu gọn' : 'Xem thêm' }}</span>
                    <svg class="icon-sm" :class="{ 'rotate-180': isScheduleExpanded }" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </button>
            </div>

			<!-- Mobile Schedule -->
			<div class="schedule-mobile">
				<div class="mobile-day-tabs">
					<button v-for="day in weekDayOptions" :key="`mobile-tab-${day.id}`" class="day-tab" :class="{
						active: day.id === selectedMobileDayId,
						'has-slots': getDayRanges(day.id).length > 0
					}" @click="selectedMobileDayId = day.id">
						<span class="day-name">{{ day.name }}</span>
						<span class="day-count" v-if="getDayRanges(day.id).length > 0">
							{{ getDayRanges(day.id).length }}
						</span>
					</button>
				</div>

				<div class="mobile-time-section">
					<div class="time-section-header">
						<h4>{{ selectedDayName }}</h4>
						<span class="time-count">
							{{ selectedDayRanges.length }} khung giờ khả dụng
						</span>
					</div>

					<div class="mobile-time-list" v-if="selectedDayRanges.length > 0">
						<button v-for="slot in displayedMobileRanges" :key="`mobile-range-${selectedMobileDayId}-${slot.id}`"
							class="mobile-time-chip">
							<span class="time-text">{{ slot.time }}</span>
						</button>

						<div class="mobile-schedule_actions" v-if="selectedDayRanges.length > 4">
							<button class="btn-toggle-schedule" @click="toggleSchedule">
								<span>{{ isMobileScheduleExpanded ? 'Thu gọn' : 'Xem thêm' }}</span>
								<svg class="icon-sm" :class="{ 'rotate-180': isMobileScheduleExpanded }" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<polyline points="6 9 12 15 18 9"></polyline>
								</svg>
							</button>
						</div>
					</div>

					<div v-else class="mobile-empty">
						<div class="empty-content">
							<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24"
								fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
								stroke-linejoin="round">
								<path
									d="M4.5 16.5c-1.5 1.26-2.01429 5.00357-2.01429 5.00357s3.75429-0.50357 5.01429-2.00357c0.71-0.840.7-2.13-0.09-2.91a2.18 2.18 0 0 0-2.91-0.09z">
								</path>
								<path
									d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z">
								</path>
								<path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
								<path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
							</svg>
							<div class="empty-text">Không có khung giờ khả dụng</div>
							<div class="empty-suggestion">Hãy chọn ngày khác để xem lịch trống</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Video Intro Section -->
        <div class="content-card video-card" v-if="user.referral_link">
            <div class="card-header">
                <div class="section-title-container">
                    <h3 class="section-title">Video Giới Thiệu</h3>
                    <span class="section-title-desc">Video giới thiệu về bản thân và phương pháp giảng dạy</span>
                </div>
            </div>
            <div class="video-preview-container">
                <iframe :src="getEmbedUrl(user.referral_link)" width="100%" height="400" frameborder="0" allowfullscreen style="border-radius: 12px;"></iframe>
            </div>
        </div>

        <!-- Suggested Tutors Section -->
        <div class="suggested-card" v-if="suggestedTutors.length > 0">
            <div class="suggested-header">
                <div class="section-title-container">
                    <h3 class="section-title">Gia sư tương tự</h3>
                    <span class="section-title-desc">Các gia sư có thể bạn quan tâm</span>
                </div>
            </div>
            <div class="suggested-tutors-grid">
                <TutorCard 
                    v-for="tutor in suggestedTutors" 
                    :key="tutor.uid" 
                    :tutor="tutor"
                    :disableBooking="tutor.uid === user.uid"
                />
            </div>
        </div>
	</div>
</template>

<style scoped>
@import url('~/assets/css/UserDetail.css');

/* Component-specific styles */

/* About card styling */
.about-card {
	background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
	border: 1px solid #e2e8f0;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1);
}

.about-content {
	background: #f8fafc;
	border-radius: 12px;
	padding: 1rem;
	border-left: 4px solid var(--color-primary);
}

.section-paragraph {
	color: #475569;
	line-height: 1.7;
	margin-bottom: 0;
	font-size: 0.95rem;
}

.teaching-methods {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 16px;
}

.method-item {
	display: flex;
	align-items: center;
	gap: 12px;
}

.method-check {
	background-color: #18181b1a;
	width: 1.5rem;
	height: 1.5rem;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 100%;
}

.method-check svg {
	width: 1rem;
	height: 1rem;
}

.method-text {
	color: #71717a;
}

/* Timeline styles are now in UserDetail.css */

/* Schedule styles */
.weekly-schedule {
	margin-bottom: 2rem;
}

/* Legend */
.schedule-legend {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 2rem;
	margin-bottom: 1.5rem;
	padding: 1rem;
	background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
	border-radius: 12px;
	border: 1px solid #e2e8f0;
}

.legend-item {
	display: flex;
	align-items: center;
	gap: 0.625rem;
}

.legend-dot {
	width: 12px;
	height: 12px;
	border-radius: 50%;
	flex-shrink: 0;
}

.legend-dot.available {
	background: linear-gradient(135deg, #10b981, #059669);
	box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}

.legend-dot.busy {
	background: linear-gradient(135deg, #ef4444, #dc2626);
	box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
}

.legend-text {
	font-size: 0.875rem;
	font-weight: 600;
	color: #475569;
}

/* desktop columns */
.schedule-desktop .columns {
	display: grid;
	grid-template-columns: repeat(7, 1fr);
	gap: 16px;
}

.schedule-desktop .day-column {
	display: flex;
	flex-direction: column;
	gap: 0.875rem;
	background: linear-gradient(135deg, #fafbff 0%, #ffffff 100%);
	border: 1px solid #e2e8f0;
	border-radius: 12px;
	padding: 1rem 0.75rem;
	transition: all 0.3s ease;
}

.schedule-desktop .day-column:hover {
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
	transform: translateY(-2px);
}

.schedule-desktop .day-header {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	font-weight: 600;
	font-size: var(--font-size-base);
	color: #1e293b;
	padding-bottom: 0.75rem;
	border-bottom: 2px solid #e2e8f0;
}

.schedule-desktop .time-list {
	display: flex;
	flex-direction: column;
	align-items: stretch;
	gap: 0.75rem;
}

.schedule-desktop .time-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 0.5rem;
	padding: 0.875rem 0.75rem;
	border-radius: 10px;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	font-weight: 600;
	font-size: var(--font-size-mini);
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
	position: relative;
	cursor: pointer;
	overflow: hidden;
}

.schedule-desktop .time-item::before {
	content: '';
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 3px;
	transition: height 0.3s ease;
}

.schedule-desktop .time-item:hover {
	transform: translateY(-3px) scale(1.02);
	box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.schedule-desktop .time-item-available {
	background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
	border: 1px solid #6ee7b7;
}

.schedule-desktop .time-item-available:hover {
	border-color: #34d399;
	box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
}

.schedule-desktop .time-item-available:hover::before {
	height: 100%;
	opacity: 0.08;
}

.schedule-desktop .time-item-busy {
	background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
	border: 1px solid #fca5a5;
	opacity: 0.85;
}

.schedule-desktop .time-item-busy:hover {
	border-color: #f87171;
	box-shadow: 0 8px 25px rgba(239, 68, 68, 0.25);
	opacity: 1;
}

.schedule-desktop .time-item-busy:hover::before {
	height: 100%;
	opacity: 0.08;
}

.time-icon-wrapper {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	border-radius: 50%;
	flex-shrink: 0;
}

.time-item-available .time-icon-wrapper {
	background: linear-gradient(135deg, #10b981, #059669);
}

.time-item-busy .time-icon-wrapper {
	background: linear-gradient(135deg, #ef4444, #dc2626);
}

.time-icon {
	width: 18px;
	height: 18px;
	color: white;
}

.time-text {
	font-size: var(--font-size-small);
	font-weight: 500;
	text-align: center;
	line-height: 1.2;
}

.time-item-available .time-text {
	color: #065f46;
}

.time-item-busy .time-text {
	color: #991b1b;
}

.schedule-desktop .time-empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	color: #9ca3af;
	text-align: center;
	padding: 1.5rem 0.5rem;
	font-size: 0.8125rem;
	font-weight: 500;
	background: #f9fafb;
	border-radius: 8px;
}

.schedule-desktop .time-empty svg {
	color: #d1d5db;
}

/* Collapsed state */
.schedule-desktop {
    position: relative;
    transition: max-height 0.5s ease-in-out;
}

.schedule-desktop.schedule-collapsed {
    max-height: 400px;
    overflow: hidden;
}

.schedule-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 120px;
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1));
    pointer-events: none;
    z-index: 10;
}

.schedule-actions,
.mobile-schedule_actions {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
}

.btn-toggle-schedule {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: transparent;
    border: none;
    color: var(--color-primary);
    font-weight: 600;
    font-size: var(--font-size-small);
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-toggle-schedule:hover {
    text-decoration: underline;
}

.btn-toggle-schedule svg {
    transition: transform 0.3s ease;
}

.btn-toggle-schedule svg.rotate-180 {
    transform: rotate(180deg);
}

/* remove old grid table styles */

.availability-badge {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	border: none;
	border-radius: 14px;
	padding: 15px 15px;
	color: black;
	background: none;
	font-weight: 600;
	font-size: var(--font-size-mini);
	/* border: 1px solid var(--gray-400); */
}

.availability-badge .icon-dot {
	background: #009966;
	width: 0.8rem;
	height: 0.8rem;
	border-radius: 100%;
}

.availability-badge.free {
	color: #16a34a;
	background: #ebfff2;
}

.availability-badge.busy {
	color: #ef4444;
	background: #ffeef0;
}

/* Mobile schedule styles */

.mobile-time-chip {
	position: relative;
	overflow: hidden;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
	display: flex;
	align-items: center;
	gap: 0.75rem;
	padding: 1rem 1.25rem;
	border-radius: 12px;
	font-weight: 600;
}

.mobile-time-chip::before {
	content: '';
	position: absolute;
	left: 0;
	top: 0;
	height: 100%;
	width: 4px;
	transition: width 0.3s ease;
}

.mobile-time-chip.chip-available {
	background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
	border: 2px solid #6ee7b7;
}

.mobile-time-chip.chip-available::before {
	background: linear-gradient(180deg, #10b981, #059669);
}

.mobile-time-chip.chip-available:active {
	transform: scale(0.97);
	box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
}

.mobile-time-chip.chip-available:active::before {
	width: 100%;
	opacity: 0.1;
}

.mobile-time-chip.chip-available .time-text {
	color: #065f46;
	font-weight: 500;
}

.mobile-time-chip.chip-busy {
	background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
	border: 2px solid #fca5a5;
	opacity: 0.85;
}

.mobile-time-chip.chip-busy::before {
	background: linear-gradient(180deg, #ef4444, #dc2626);
}

.mobile-time-chip.chip-busy:active {
	transform: scale(0.97);
	box-shadow: 0 4px 20px rgba(239, 68, 68, 0.25);
	opacity: 1;
}

.mobile-time-chip.chip-busy:active::before {
	width: 100%;
	opacity: 0.1;
}

.mobile-time-chip.chip-busy .time-text {
	color: #991b1b;
	font-weight: 500;
}

.mobile-time-icon-wrapper {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 36px;
	height: 36px;
	border-radius: 50%;
	flex-shrink: 0;
}

.chip-available .mobile-time-icon-wrapper {
	background: linear-gradient(135deg, #10b981, #059669);
}

.chip-busy .mobile-time-icon-wrapper {
	background: linear-gradient(135deg, #ef4444, #dc2626);
}

.mobile-time-icon-wrapper .time-icon {
	width: 20px;
	height: 20px;
	color: white;
}

.mobile-status-badge {
	margin-left: auto;
	font-size: 0.75rem;
	font-weight: 700;
	padding: 0.375rem 0.75rem;
	border-radius: 8px;
	letter-spacing: 0.5px;
}

.mobile-status-badge.badge-available {
	background: rgba(16, 185, 129, 0.2);
	color: #065f46;
}

.mobile-status-badge.badge-busy {
	background: rgba(239, 68, 68, 0.2);
	color: #991b1b;
}

.mobile-empty .empty-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1rem;
}

.mobile-empty .empty-content svg {
	color: #d1d5db;
}

.booking-schedule h4 {
	font-size: var(--font-size-small);
	font-weight: 600;
	color: #18181b;
	margin-bottom: 1rem;
}

.time-slots h5 {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-size: var(--font-size-small);
	font-weight: 500;
	color: #18181b;
	margin-bottom: 1rem;
}

.time-slots h5 svg {
	color: #71717a;
}

.time-slots-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
	gap: 0.75rem;
	margin-bottom: 1rem;
}

.time-note {
	color: #71717a;
	font-size: var(--font-size-small);
	text-align: center;
}

@media (max-width: 1024px) {}

@media (max-width: 868px) {}

@media (max-width: 640px) {
	.schedule-grid {
		grid-template-columns: 1fr 1fr;
	}

	.time-slots-grid {
		grid-template-columns: 1fr 1fr;
	}
}

/* Video Intro Styles */
.video-card {
    margin-bottom: 2rem;
}

.video-preview-container {
    border-radius: 12px;
    overflow: hidden;
    background-color: #000;
    aspect-ratio: 16/9;
}

.video-preview-container iframe {
    width: 100%;
    height: 100%;
}

/* Suggested Tutors Styles */
.suggested-header {
    margin-bottom: 1.5rem;
}

.suggested-tutors-grid {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    gap: 1.5rem;
    padding-bottom: 1.5rem;
    /* Hide scrollbar */
    scrollbar-width: none;
    -ms-overflow-style: none;
    /* Add padding to ends so first/last items aren't cut off by screen edge */
    padding-right: 1rem; 
    margin-right: -1rem; /* compensate for container padding if needed, or adjust based on layout */
}

.suggested-tutors-grid::-webkit-scrollbar {
    display: none;
}

.suggested-tutors-grid > * {
    /* Desktop: Show ~2.5 items or 3 items depending on width. 
       Let's use a fixed width or flex-basis that looks good with the full card.
       Since TutorCard is quite wide, maybe 300px-350px? 
       Or percentage based ?
    */
    flex: 0 0 350px; 
    min-width: 0;
    scroll-snap-align: start;
}

@media (max-width: 768px) {
    .suggested-tutors-grid {
        gap: 1rem;
        padding-bottom: 1rem;
    }

    .suggested-tutors-grid > * {
        flex: 0 0 85%; /* Peek effect on mobile */
        scroll-snap-align: center;
    }
}
/* Pricing Section List Style */
.price-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1rem;
}

.price-row {
    background: #f9fafb;
    border: 1px solid #f3f4f6;
    border-radius: 16px;
    padding: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: all 0.2s ease;
}

.price-row:hover {
    background: white;
    border-color: #e5e7eb;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.price-row-left {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.level-avatar {
    width: 48px;
    height: 48px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    color: #374151;
    font-size: 1rem;
    flex-shrink: 0;
}

.level-info-row {
    display: flex;
    flex-direction: column;
}

.level-name {
    font-weight: 600;
    color: #111827;
    font-size: 1rem;
}

.subject-name {
    color: #6b7280;
    font-size: 0.875rem;
}

.price-row-right {
    text-align: right;
}

.price-value {
    font-weight: 600;
    color: #4b5563;
    font-size: 1rem;
}

@media (max-width: 640px) {
    .price-row {
        padding: 1rem;
    }
    
    .level-avatar {
        width: 40px;
        height: 40px;
        font-size: 0.9rem;
    }
}
</style>
