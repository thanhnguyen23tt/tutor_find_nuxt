<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
	user: {
		type: Object,
		required: true
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

const formatPrice = (price) => {
	return Number(price || 0).toLocaleString('vi-VN');
};

// ===== SCHEDULE SECTION =====
const weekDayOptions = computed(() => configStore.configuration.day_of_weeks || []);
const timeSlotOptions = computed(() => configStore.configuration.time_slots || []);

const selectedMobileDayId = ref(null);

// Initialize selected mobile day
watch(() => weekDayOptions.value, (days) => {
	if (days.length > 0 && !selectedMobileDayId.value) {
		selectedMobileDayId.value = days[0].id;
	}
}, { immediate: true });

// Create schedule map for O(1) lookup
const scheduleMap = computed(() => {
	const map = new Map();

	if (!hasSchedule.value) return map;

	props.user.user_weekly_time_slots.forEach(slot => {
		const key = `${slot.day_of_week_code}_${slot.time_slot_id}`;
		map.set(key, {
			isAvailable: slot.is_available === null || slot.is_available === true,
			bookingId: slot.booking_id
		});
	});

	return map;
});

// Get slots for a specific day with availability info
const getDaySlots = (dayId) => {
	if (!hasSchedule.value) return [];

	const slots = [];

	timeSlotOptions.value.forEach(timeSlot => {
		if (!timeSlot) return;

		const key = `${dayId}_${timeSlot.id}`;
		const scheduleInfo = scheduleMap.value.get(key);

		if (scheduleInfo) {
			slots.push({
				id: timeSlot.id,
				name: timeSlot.name,
				isAvailable: scheduleInfo.isAvailable
			});
		}
	});

	return slots;
};

// Mobile schedule helpers
const selectedDayName = computed(() => {
	const day = weekDayOptions.value.find(d => d.id === selectedMobileDayId.value);
	return day?.name || 'Chọn ngày';
});

const selectedDaySlots = computed(() => {
	return getDaySlots(selectedMobileDayId.value);
});

// Schedule expansion
const isScheduleExpanded = ref(false);
const toggleSchedule = () => {
	isScheduleExpanded.value = !isScheduleExpanded.value;
	isMobileScheduleExpanded.value = !isMobileScheduleExpanded.value;
};

// Mobile Schedule expansion
const isMobileScheduleExpanded = ref(false);
const displayedMobileSlots = computed(() => {
    if (isMobileScheduleExpanded.value) {
        return selectedDaySlots.value;
    }
    return selectedDaySlots.value.slice(0, 8);
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

		<!-- Price cards - Show carousel if tabs exist, otherwise show grid -->
		<template v-if="currentLevels.length > 0">
			<!-- Single card with carousel (when tabs exist) -->
			<div class="price-carousel-container">
				<div class="price-card-modern" :class="{ 'highlight': currentLevels[currentPriceIndex].highlight }">
					<div class="price-card-header">
						<div class="level-icon-wrapper">
							<img class="icon-lg" :src="currentLevels[currentPriceIndex].education_level_image" 
								:alt="currentLevels[currentPriceIndex].education_level" loading="lazy">
						</div>
						<div class="level-info">
							<h4 class="level-title">{{ currentLevels[currentPriceIndex].education_level }}</h4>
							<p class="level-description" v-if="currentLevels[currentPriceIndex].education_level_description">
								{{ currentLevels[currentPriceIndex].education_level_description }}
							</p>
						</div>
					</div>
					<div class="price-section">
						<div class="price-amount">
							{{ formatPrice(currentLevels[currentPriceIndex].price) }} <span class="price-unit">VNĐ/giờ</span>
						</div>
					</div>
					<div class="price-card-action">
						<button class="btn-lg w-100" :class="currentLevels[currentPriceIndex].highlight ? 'btn-primary' : 'btn-secondary'">
							<svg class="icon-md" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
								stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M9 12l2 2 4-4"></path>
								<path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
								<path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
							</svg>
							<span class="btn-text">Chọn {{ currentLevels[currentPriceIndex].education_level }}</span>
						</button>
					</div>
				</div>

				<!-- Carousel controls -->
				<div class="carousel-controls" v-if="currentLevels.length > 1">
					<button class="carousel-btn prev-btn" @click="prevPrice">
						<svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
						</svg>
					</button>
					<div class="carousel-dots">
						<span v-for="(level, index) in currentLevels" :key="index" 
							class="dot" :class="{ active: index === currentPriceIndex }"
							@click="currentPriceIndex = index"></span>
					</div>
					<button class="carousel-btn next-btn" @click="nextPrice">
						<svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
						</svg>
					</button>
				</div>
			</div>

			<!-- Grid view (when no tabs) -->
			<div class="price-cards">
				<div class="price-card-modern" :class="{ 'highlight': level.highlight }" v-for="level in currentLevels"
					:key="level.id">
					<div class="price-card-header">
						<div class="level-icon-wrapper">
							<img class="icon-lg" :src="level.education_level_image" :alt="level.education_level"
								loading="lazy">
						</div>
						<div class="level-info">
							<h4 class="level-title">{{ level.education_level }}</h4>
							<p class="level-description" v-if="level.education_level_description">
								{{ level.education_level_description }}
							</p>
						</div>
					</div>
					<div class="price-section">
						<div class="price-amount">
							{{ formatPrice(level.price) }} <span class="price-unit">VNĐ/giờ</span>
						</div>
					</div>
					<div class="price-card-action">
						<button class="btn-lg w-100" :class="level.highlight ? 'btn-primary' : 'btn-secondary'">
							<svg class="icon-md" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
								stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M9 12l2 2 4-4"></path>
								<path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
								<path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
							</svg>
							<span class="btn-text">Chọn {{ level.education_level }}</span>
						</button>
					</div>
				</div>
			</div>
		</template>

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
							<template v-if="getDaySlots(day.id).length > 0">
								<div v-for="slot in getDaySlots(day.id)" :key="`desktop-slot-${day.id}-${slot.id}`"
									class="time-item" :class="{
										'time-item-available': slot.isAvailable,
										'time-item-busy': !slot.isAvailable
									}">
									<span class="time-text">{{ slot.name }}</span>
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
						'has-slots': getDaySlots(day.id).length > 0
					}" @click="selectedMobileDayId = day.id">
						<span class="day-name">{{ day.name }}</span>
						<span class="day-count" v-if="getDaySlots(day.id).length > 0">
							{{ getDaySlots(day.id).length }}
						</span>
					</button>
				</div>

				<div class="mobile-time-section">
					<div class="time-section-header">
						<h4>{{ selectedDayName }}</h4>
						<span class="time-count">
							{{ selectedDaySlots.length }} khung giờ khả dụng
						</span>
					</div>

					<div class="mobile-time-list" v-if="selectedDaySlots.length > 0">
						<button v-for="slot in displayedMobileSlots" :key="`mobile-slot-${selectedMobileDayId}-${slot.id}`"
							class="mobile-time-chip" :class="{
								'chip-available': slot.isAvailable,
								'chip-busy': !slot.isAvailable
							}">
							<span class="time-text">{{ slot.name }}</span>
						</button>

						<div class="mobile-schedule_actions">
							<button class="btn-toggle-schedule" @click="toggleSchedule">
								<span>{{ isScheduleExpanded ? 'Thu gọn' : 'Xem thêm' }}</span>
								<svg class="icon-sm" :class="{ 'rotate-180': isScheduleExpanded }" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

.schedule-desktop .day-header svg {
	color: #3b82f6;
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


/* pricingtab */
.subject-tabs {
	display: flex;
	gap: 1rem;
	margin-bottom: 2rem;
	padding: 0.25rem;
	background: #f4f4f5;
	border-radius: 0.5rem;
}

.subject-tab {
	padding: 0.5rem 1rem;
	border: none;
	background: transparent;
	color: #71717a;
	font-weight: 500;
	cursor: pointer;
	border-radius: 0.375rem;
}

.subject-tab.active {
	background: white;
	color: #18181b;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.price-cards {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	/* 3 cột cố định */
	gap: 1.5rem;
	margin: 2rem 0;
}


/* Price card styles are now in UserDetail.css */

.price-card-header {
	display: flex;
	align-items: center;
	gap: 1rem;
}

.level-icon-wrapper {
	width: 50px;
	height: 50px;
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
	border: 2px solid #e2e8f0;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.level-info {
	flex: 1;
}

.level-title {
	font-size: 1.125rem;
	font-weight: 700;
	color: #1e293b;
	margin: 0 0 0.25rem 0;
}

.level-description {
	color: #64748b;
	font-size: 0.875rem;
	margin: 0;
	line-height: 1.4;
}

.price-section {
	text-align: center;
	padding: 1rem 0;
	background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
	border-radius: 12px;
	border: 1px solid #e2e8f0;
}

.price-amount {
	font-size: var(--font-size-large);
	font-weight: 800;
	color: var(--color-primary);
	line-height: 1;
}

.price-unit {
	font-size: 0.875rem;
	font-weight: 500;
	color: #64748b;
}

.price-card-action {
	margin-top: auto;
}

.price-note {
	color: #71717a;
	font-size: var(--font-size-small);
	margin-top: 1rem;
}

.package-cards {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	gap: 1.5rem;
}

.package-card {
	padding: 1.5rem;
	border: 1px solid #e4e4e7;
	border-radius: 0.75rem;
	display: flex;
	flex-direction: column;
	gap: 1rem;
	overflow: hidden;
}

.package-card.highlight {
	border-color: #18181b;
}

.package-card button {
	margin-top: auto;
}

.package-header h5 {
	font-weight: 600;
	color: #18181b;
	margin-bottom: 0.2rem;
}

.package-header p {
	color: #71717a;
	font-size: var(--font-size-small);
	margin: 0;
}

.package-price p:first-child {
	font-size: var(--font-size-large);
	font-weight: 700;
	color: #18181b;
	margin: 0;
}

.package-price span {
	font-size: var(--font-size-small);
	font-weight: 400;
	color: #71717a;
}

.package-savings {
	font-size: var(--font-size-small);
	margin: 0;
	border-radius: 1rem;
	display: inline-block;
	color: #71717a;
}

.package-features {
	list-style: none;
	padding: 0;
	margin: 0;
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

.package-features li {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.package-features .features-check {
	background-color: #18181b1a;
	width: 1.5rem;
	height: 1.5rem;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 100%;
}

.package-features li svg {
	width: 1rem;
	height: 1rem;
	flex-shrink: 0;
}

.group-description {
	color: #71717a;
	margin-bottom: 1.5rem;
}

.group-table {
	border: 1px solid #e4e4e7;
	border-radius: 0.75rem;
	overflow: hidden;
}

.group-header {
	display: grid;
	grid-template-columns: 2fr 2fr 2fr 1fr;
	padding: 1rem;
	background: #f4f4f5;
	font-weight: 600;
	color: #18181b;
}

.group-row {
	display: grid;
	grid-template-columns: 2fr 2fr 2fr 1fr;
	padding: 1rem;
	align-items: center;
	border-top: 1px solid #e4e4e7;
}

.savings-badge {
	width: max-content;
	color: #059669;
	font-size: var(--font-size-small);
	padding: 0.3rem 0.5rem;
	background: #ecfdf5;
	border-radius: 1rem;
	display: inline-block;
}

.group-note {
	color: #71717a;
	font-size: var(--font-size-small);
	margin-top: 1rem;
}

.custom-package {
	background: #f4f4f5;
	border: none;
}

.custom-package-content {
	display: flex;
	align-items: center;
	gap: 1.5rem;
}

.custom-package-content svg {
	flex-shrink: 0;
	color: #18181b;
}

.custom-package-text {
	flex: 1;
}

.custom-package-text h4 {
	font-weight: 600;
	color: #18181b;
	margin: 0 0 0.5rem 0;
}

.custom-package-text p {
	color: #71717a;
	margin: 0;
}

.btn-select {
	width: 100%;
	padding: 0.75rem;
	border: 1px solid #e4e4e7;
	border-radius: 0.5rem;
	background: white;
	color: #18181b;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s;
	margin-top: auto;
}

.btn-select:hover {
	background: #f4f4f5;
}

.btn-dark {
	background: #18181b;
	color: white;
	border: none;
}

.btn-dark:hover {
	background: #27272a;
}

.btn-book {
	padding: 0.5rem 1rem;
	border: 1px solid #e4e4e7;
	border-radius: 0.375rem;
	background: white;
	color: #18181b;
	font-weight: 500;
	cursor: pointer;
}

.btn-custom {
	padding: 0.75rem 1.5rem;
	border: none;
	border-radius: 0.5rem;
	background: #18181b;
	color: white;
	font-weight: 500;
	cursor: pointer;
	white-space: nowrap;
}

.highlight {
	position: relative;
}

.highlight::after {
	content: 'Phổ biến';
	position: absolute;
	top: 0.7rem;
	right: -2.8rem;
	background: #18181b;
	color: white;
	font-size: 0.75rem;
	padding: 0.25rem 3rem;
	border-radius: 0.25rem;
	transform: rotate(39deg);
}

@media screen and (max-width: 1024px) {
	.price-cards {
		grid-template-columns: repeat(2, 1fr);
	}
}

@media screen and (max-width: 768px) {
	.price-cards {
		grid-template-columns: repeat(1, 1fr);
	}

	.schedule-actions {
		display: none;
	}
}
</style>
