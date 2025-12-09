<template>
	<base-modal :header="false" :is-open="isOpen" @close="$emit('close')">
		<div class="modern-modal-content">
			<!-- Mobile Only Filters (Location, Subject, Level) -->
			<div class="mobile-only-block">
				<div class="filter-section">
					<div class="section-header">
						<h3 class="section-title">Thông tin tìm kiếm</h3>
					</div>
					<div class="mobile-filter-grid">
						<div class="filter-group">
							<base-select v-model="localFilters.provinces_id" :options="cityOptions" label="Thành phố" placeholder="Tất cả" widthFull="true" type="search"></base-select>
						</div>
						<div class="filter-group">
							<base-select v-model="localFilters.subject_id" :options="subjectOptions" label="Môn học" placeholder="Tất cả" widthFull="true" type="search"></base-select>
						</div>
					</div>
					<div class="modal-divider"></div>
				</div>

				<div class="filter-section">
					<div class="section-header">
						<h3 class="section-title">Cấp độ</h3>
						<span class="section-subtitle">Lọc theo cấp độ môn học bạn chọn</span>
					</div>
					<div class="chip-list">
						<div 
							class="chip-item" 
							:class="{ active: !localFilters.educationLevel }"
							@click="localFilters.educationLevel = ''"
						>
							Tất cả
						</div>
						<div 
							v-for="level in educationLevelOptions" 
							:key="level.id"
							class="chip-item"
							:class="{ active: localFilters.educationLevel === level.id }"
							@click="localFilters.educationLevel = level.id"
						>
							{{ level.name }}
						</div>
					</div>
				</div>

				<div class="modal-divider"></div>

				<!-- Experience Section (Visible to all) -->
				<div class="filter-section">
					<div class="section-header">
						<h3 class="section-title">Kinh nghiệm</h3>
						<span class="section-subtitle">Lọc theo kinh nghiệm của gia sư</span>
					</div>
					<div class="filter-group">
						<div class="chip-list">
							<div 
								class="chip-item" 
								:class="{ active: !localFilters.experience }"
								@click="localFilters.experience = ''"
							>
								Tất cả
							</div>
							<div 
								v-for="exp in experienceOptions" 
								:key="exp.id"
								class="chip-item"
								:class="{ active: localFilters.experience === exp.id }"
								@click="localFilters.experience = exp.id"
							>
								{{ exp.name }}
							</div>
						</div>
					</div>
					<div class="modal-divider"></div>
				</div>

			</div>

			<!-- Price Range Section -->
			<div class="filter-section">
				<div class="section-header">
					<h3 class="section-title">Khoảng giá (mỗi giờ)</h3>
					<span class="section-subtitle">
                        {{ formatCurrency(localFilters.minPrice || 50000) }} - {{ formatCurrency(localFilters.maxPrice || 1000000) }}
                    </span>
				</div>
				<div class="price-chart-wrapper">
					<!-- Simple bar chart visualization (decorative) -->
					<div class="price-bars">
						<div class="bar" style="height: 30%"></div>
						<div class="bar" style="height: 50%"></div>
						<div class="bar" style="height: 80%"></div>
						<div class="bar" style="height: 60%"></div>
						<div class="bar" style="height: 40%"></div>
						<div class="bar" style="height: 70%"></div>
						<div class="bar" style="height: 90%"></div>
						<div class="bar" style="height: 50%"></div>
						<div class="bar" style="height: 30%"></div>
						<div class="bar" style="height: 90%"></div>
						<div class="bar" style="height: 50%"></div>
						<div class="bar" style="height: 30%"></div>
					</div>
				</div>
				<div class="custom-slider-wrapper dual-slider">
                    <div class="slider-track-bg"></div>
                    <div class="slider-track-fill" :style="trackStyle"></div>
					<input 
                        type="range" 
                        min="50000" 
                        max="1000000" 
                        step="50000" 
                        v-model.number="localFilters.minPrice" 
                        class="range-input range-min" 
                        @input="validateMinPrice"
                    />
					<input 
                        type="range" 
                        min="50000" 
                        max="1000000" 
                        step="50000" 
                        v-model.number="localFilters.maxPrice" 
                        class="range-input range-max" 
                        @input="validateMaxPrice"
                    />
					<div class="slider-labels">
						<span>50k</span>
						<span>500k</span>
						<span>1tr</span>
					</div>
				</div>
			</div>

			<div class="modal-divider"></div>

			<!-- Rating Section -->
			<div class="filter-section">
				<div class="section-header">
					<h3 class="section-title">Đánh giá</h3>
					<span class="section-subtitle">Lọc theo đánh giá của học viên</span>
				</div>
				<div class="rating-options">
					<div class="rating-option" :class="{ active: localFilters.rating === 0 }" @click="localFilters.rating = 0">
						<span>Tất cả</span>
					</div>
					<div class="rating-option" :class="{ active: localFilters.rating === 3 }" @click="localFilters.rating = 3">
						<span>3.0+</span>
						<svg class="star-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
					</div>
					<div class="rating-option" :class="{ active: localFilters.rating === 4 }" @click="localFilters.rating = 4">
						<span>4.0+</span>
						<svg class="star-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
					</div>
					<div class="rating-option" :class="{ active: localFilters.rating === 5 }" @click="localFilters.rating = 5">
						<span>5.0</span>
						<svg class="star-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
					</div>
				</div>
			</div>

			<div class="modal-divider"></div>

			<!-- Additional Options (Mockup for future) -->
			<div class="filter-section">
				<div class="section-header">
					<h3 class="section-title">Tùy chọn khác</h3>
				</div>
				<div class="checkbox-list">
					<label class="checkbox-item">
						<input type="checkbox" />
						<span class="checkmark"></span>
						<span class="label-text">Gia sư đã xác thực</span>
					</label>
					<label class="checkbox-item">
						<input type="checkbox" />
						<span class="checkmark"></span>
						<span class="label-text">Có video giới thiệu</span>
					</label>
					<label class="checkbox-item">
						<input type="checkbox" />
						<span class="checkmark"></span>
						<span class="label-text">Cho phép học thử</span>
					</label>
				</div>
			</div>

			<div class="modal-footer-action">
				<button class="btn-md btn-no-bg" @click="handleReset">Xóa tất cả</button>
				<button class="btn-md btn-primary" @click="handleApply">Hiển thị kết quả</button>
			</div>
		</div>
	</base-modal>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

const props = defineProps({
	isOpen: {
		type: Boolean,
		default: false
	},
	filters: {
		type: Object,
		required: true
	},
	cityOptions: {
		type: Array,
		default: () => []
	},
	subjectOptions: {
		type: Array,
		default: () => []
	},
	educationLevelOptions: {
		type: Array,
		default: () => []
	},
	experienceOptions: {
		type: Array,
		default: () => []
	}
});

const emit = defineEmits(['close', 'update:filters', 'apply', 'reset']);

const { formatCurrency } = useHelper();

// Create a local copy of filters to avoid mutating prop directly
const localFilters = ref({ ...props.filters });

// Watch for changes in props.filters to update localFilters
watch(() => props.filters, (newFilters) => {
    if (JSON.stringify(newFilters) !== JSON.stringify(localFilters.value)) {
        localFilters.value = { ...newFilters };
    }
}, { deep: true });

// Watch for changes in localFilters to emit update
watch(localFilters, (newFilters) => {
    if (JSON.stringify(newFilters) !== JSON.stringify(props.filters)) {
        emit('update:filters', newFilters);
    }
}, { deep: true });

const handleReset = () => {
	emit('reset');
};

const handleApply = () => {
	emit('apply');
};

// Dual Slider Logic
const min = 50000;
const max = 1000000;
const minGap = 50000;

const validateMinPrice = () => {
    if (!localFilters.value.minPrice || localFilters.value.minPrice < min) localFilters.value.minPrice = min;
    if (localFilters.value.minPrice > localFilters.value.maxPrice - minGap) {
        localFilters.value.minPrice = localFilters.value.maxPrice - minGap;
    }
};

const validateMaxPrice = () => {
    if (!localFilters.value.maxPrice) localFilters.value.maxPrice = max;
    if (localFilters.value.maxPrice < localFilters.value.minPrice + minGap) {
        localFilters.value.maxPrice = localFilters.value.minPrice + minGap;
    }
};

const trackStyle = computed(() => {
    const minVal = localFilters.value.minPrice || 0;
    const maxVal = localFilters.value.maxPrice || max;
    const minPercent = ((minVal - min) / (max - min)) * 100;
    const maxPercent = ((maxVal - min) / (max - min)) * 100;
    
    return {
        left: `${minPercent}%`,
        width: `${maxPercent - minPercent}%`
    };
});

// Initialize min/max if not present
watch(() => props.filters, (newFilters) => {
    if (JSON.stringify(newFilters) !== JSON.stringify(localFilters.value)) {
        localFilters.value = { 
            ...newFilters,
            minPrice: newFilters.minPrice !== undefined ? newFilters.minPrice : 50000,
            maxPrice: newFilters.maxPrice !== undefined ? newFilters.maxPrice : 1000000
        };
    }
}, { deep: true, immediate: true });
</script>

<style scoped>
/* Reuse styles from index.vue/search.vue or ensure they are global/imported */
.filter-section {
    margin-bottom: 2rem;
}

.section-header {
    margin-bottom: 1rem;
}

.section-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 0.25rem 0;
}

.section-subtitle {
    font-size: 0.875rem;
    color: #6b7280;
}

.mobile-filter-grid {
    display: grid;
    gap: 1rem;
}

.modal-divider {
    height: 1px;
    background-color: #e5e7eb;
    margin: 1.5rem 0;
}

/* Price Chart */
.price-chart-wrapper {
    height: 100px;
    display: flex;
    align-items: flex-end;
    margin-bottom: 1rem;
    padding: 0 1rem;
}

.price-bars {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    width: 100%;
    height: 100%;
    gap: 4px;
}

.bar {
    flex: 1;
    background-color: #e5e7eb;
    border-radius: 4px 4px 0 0;
    transition: height 0.3s ease;
}

.bar:hover {
    background-color: #d1d5db;
}

/* Custom Slider */
.custom-slider-wrapper {
    padding: 0 0.5rem;
    position: relative;
    height: 60px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
}

.dual-slider {
    width: 100%;
    /* margin-top is handled by wrapper padding/layout */
}

.slider-track-bg {
    position: absolute;
    width: 100%;
    height: 6px;
    background-color: #e5e7eb;
    border-radius: 3px;
    top: 12px; /* Center vertically in the top portion */
    z-index: 1;
}

.slider-track-fill {
    position: absolute;
    height: 6px;
    background-color: #000;
    border-radius: 3px;
    top: 12px;
    z-index: 2;
}

.range-input {
    position: absolute;
    width: 100%;
    height: 6px;
    top: 1rem;
    left: 0;
    pointer-events: none;
    -webkit-appearance: none;
    appearance: none;
    background: none;
    z-index: 3;
    margin: 0;
    padding: 0;
}

.range-input::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #ffffff;
    border: 2px solid #000000;
    cursor: pointer;
    pointer-events: auto;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    margin-top: -9px; /* (6px - 24px) / 2 = -9px */
}

.range-input::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #ffffff;
    border: 2px solid #000000;
    cursor: pointer;
    pointer-events: auto;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    border: none;
}

.range-input:focus {
    outline: none;
}

.range-input:focus::-webkit-slider-thumb {
    transform: scale(1.1);
}

.slider-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 0.5rem; /* Space from the slider track area */
    font-size: 0.875rem;
    color: #6b7280;
    font-weight: 500;
}

/* Rating Options */
.rating-options {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.rating-option {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 999px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.9rem;
    font-weight: 500;
}

.rating-option:hover {
    border-color: var(--color-primary);
}

.rating-option.active {
    border-color: var(--color-primary);
}

.star-icon {
    margin-bottom: 1px;
}

/* Checkbox List */
.checkbox-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.checkbox-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    user-select: none;
}

.checkbox-item input {
    display: none;
}

.checkmark {
    width: 20px;
    height: 20px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    position: relative;
    transition: all 0.2s;
}

.checkbox-item input:checked ~ .checkmark {
    background-color: #000;
    border-color: #000;
}

.checkmark::after {
    content: "";
    position: absolute;
    display: none;
    left: 6px;
    top: 2px;
    width: 6px;
    height: 11px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
}

.checkbox-item input:checked ~ .checkmark::after {
    display: block;
}

.label-text {
    font-size: 1rem;
    color: #374151;
}

/* Footer Action */
.modal-footer-action {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1rem;
    margin-top: 1rem;
    border-top: 1px solid #e5e7eb;
}

.btn-no-bg {
    background: transparent;
    border: none;
    text-decoration: underline;
    font-weight: 600;
    color: #374151;
}

.btn-no-bg:hover {
    color: #000;
}

/* Chip List Styles */
.chip-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
}

.chip-item {
    padding: 0.5rem 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 999px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.9rem;
    font-weight: 500;
    color: #374151;
    background: #fff;
}

.chip-item:hover {
    border-color: var(--color-primary);
}

.chip-item.active {
    border-color: var(--color-primary);
}

.group-label {
    display: block;
    font-size: 0.9rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.75rem;
}

@media (min-width: 768px) {
    .mobile-only-block {
        display: none;
    }
}
</style>
