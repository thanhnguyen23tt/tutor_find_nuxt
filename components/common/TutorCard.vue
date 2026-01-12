<script setup>
const props = defineProps({
	tutor: {
		type: Object,
		required: true
	},
	disableBooking: {
		type: Boolean,
		default: false
	}
});

const emit = defineEmits(['remove-saved']);

const { showImage, getFirstCharacterOfLastName, formatCurrency } = useHelper();

const removeSaved = (savedId, tutorName) => {
	emit('remove-saved', savedId, tutorName);
};

const viewTutorProfile = (tutorUid) => {
	return navigateTo(`/tutor/${tutorUid}`);
};

const bookTutor = (tutorUid) => {
	return navigateTo(`/booking/${tutorUid}`);
};
</script>

<template>
	<div class="tutor-card">
		<button v-if="tutor.id" class="remove-btn" @click.stop="removeSaved(tutor.id, tutor.saved_user?.full_name)"
			title="Bỏ yêu thích">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
				<path
					d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
			</svg>
		</button>

		<template v-for="displayTutor in [tutor.saved_user || tutor]" :key="displayTutor.uid">
			<!-- Avatar -->
			<div class="tutor-avatar" @click="viewTutorProfile(displayTutor.uid)">
				<img v-if="displayTutor.avatar" :src="showImage(displayTutor.avatar)" :alt="displayTutor.full_name" />
				<div v-else class="avatar-placeholder">
					{{ getFirstCharacterOfLastName(displayTutor.full_name) }}
				</div>
			</div>

			<!-- Tutor Info -->
			<div class="tutor-info">
				<h3 class="tutor-name" @click="viewTutorProfile(displayTutor.uid)">
					{{ displayTutor.full_name }}
				</h3>

				<!-- Subject handling: saved.vue has 'subject_preview', suggested has 'user_subjects' array -->
				<p class="tutor-subjects">
					<template v-if="displayTutor.subject_preview">
						{{ displayTutor.subject_preview }}
					</template>
					<template v-else-if="displayTutor.user_subjects">
						<span v-for="(sub, index) in displayTutor.user_subjects" :key="sub.id">
							{{ sub.subject_name }}{{ index < displayTutor.user_subjects.length - 1 ? ', ' : '' }}
								</span>
					</template>
				</p>

				<div class="tutor-meta">
					<div class="meta-item">
						<svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
							<path
								d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z" />
						</svg>
						<span>{{ displayTutor.info_reviews?.average_rating || 'N/A' }}</span>
					</div>
					<div class="meta-item">
						<svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
							stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round"
								d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<span>{{ formatCurrency(displayTutor.average_price) }}/h</span>
					</div>
				</div>

				<div class="tutor-location">
					<svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
						stroke="currentColor" stroke-width="2">
						<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
						<circle cx="12" cy="10" r="3"></circle>
					</svg>
					<span>{{ displayTutor.address_preview || 'Chưa cập nhật' }}</span>
				</div>
			</div>

			<!-- Actions -->
			<div class="tutor-actions">
				<button class="btn-secondary btn-sm" @click="viewTutorProfile(displayTutor.uid)">
					<svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
						stroke="currentColor" stroke-width="2">
						<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
						<circle cx="12" cy="12" r="3"></circle>
					</svg>
					<span>Xem</span>
				</button>
				<button class="btn-primary btn-sm" @click="bookTutor(displayTutor.uid)" :disabled="disableBooking">
					<svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
						stroke="currentColor" stroke-width="2">
						<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
						<line x1="16" y1="2" x2="16" y2="6"></line>
						<line x1="8" y1="2" x2="8" y2="6"></line>
						<line x1="3" y1="10" x2="21" y2="10"></line>
					</svg>
					<span>Đặt lịch</span>
				</button>
			</div>
		</template>
	</div>
</template>

<style scoped>
/* Tutor Card Default (Saved Page Style) */
.tutor-card {
	background: rgba(255, 255, 255, 0.95);
	backdrop-filter: blur(20px);
	border-radius: 30px;
	padding: 2rem;
	border: 1px solid #e5e7eb;
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

/* Simple Card Variant (Suggested Tutors Style Override) */
.tutor-card-simple {
	background: white;
	border-radius: 16px;
	padding: 1.5rem;
	gap: 1rem;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
	border: 1px solid #e5e7eb;
}

.tutor-card-simple:hover {
	transform: translateY(-4px);
	box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
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

.tutor-card-simple .tutor-avatar {
	width: 80px;
	height: 80px;
	border: 3px solid white;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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

.tutor-card-simple .avatar-placeholder {
	font-size: 2rem;
}

/* Tutor Info */
.tutor-info {
	text-align: center;
	display: flex;
	flex-direction: column;
	gap: 1rem;
	flex: 1;
	/* Added for simple card flex layout */
}

.tutor-card-simple .tutor-info {
	gap: 0.5rem;
}

.tutor-name {
	font-size: 1.35rem;
	font-weight: 700;
	color: #1f2937;
	margin: 0;
	cursor: pointer;
	transition: color 0.3s ease;
}

.tutor-card-simple .tutor-name {
	font-size: 1.1rem;
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

.tutor-card-simple .tutor-subjects {
	color: #6b7280;
	font-size: 0.9rem;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.tutor-meta {
	display: flex;
	justify-content: center;
	gap: 1.5rem;
	padding: 1rem 0;
	border-top: 1px solid rgba(0, 0, 0, 0.05);
	border-bottom: 1px solid rgba(0, 0, 0, 0.05);
	margin: 0;
}

.tutor-card-simple .tutor-meta {
	gap: 1rem;
	padding: 0.5rem 0;
	border-top: 1px solid #f3f4f6;
	border-bottom: 1px solid #f3f4f6;
	margin: 0.5rem 0;
}

.meta-item {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	color: #64748b;
	font-size: 0.9rem;
}

.tutor-card-simple .meta-item {
	gap: 0.25rem;
	color: #6b7280;
	font-size: 0.85rem;
}

.meta-item svg {
	width: 16px;
	height: 16px;
	color: #fbbf24;
}

.tutor-card-simple .meta-item svg {
	width: 14px;
	height: 14px;
}

.tutor-location {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	color: #64748b;
	font-size: 0.95rem;
}

.tutor-card-simple .tutor-location {
	gap: 0.25rem;
	color: #6b7280;
	font-size: 0.85rem;
}

.tutor-location svg {
	width: 16px;
	height: 16px;
}

.tutor-card-simple .tutor-location svg {
	width: 14px;
	height: 14px;
}

/* Actions */
.tutor-actions {
	display: flex;
	gap: 0.75rem;
	margin-top: auto;
}

.tutor-card-simple .tutor-actions {
	gap: 0.5rem;
}

.tutor-actions button {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	padding: 0.5rem 1rem;
	/* Added padding for simple card */
	border-radius: 8px;
	/* Added radius for simple card */
	font-weight: 600;
	/* Added weight for simple card */
	cursor: pointer;
	transition: all 0.2s;
	border: 1px solid transparent;
	/* Added border for simple card */
}

/* Btn styles */
.btn-secondary {
	background: #f9fafb;
	border-color: #e5e7eb;
	color: #374151;
}

.btn-secondary:hover {
	background: #f3f4f6;
	border-color: #d1d5db;
}

.btn-primary {
	background: var(--color-primary);
	color: white;
}

.btn-primary:hover {
	filter: brightness(1.1);
	box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.3);
}

/* Responsive adjustment if needed */
@media (max-width: 768px) {
	.tutor-actions button>span {
		display: none;
	}
}
</style>
