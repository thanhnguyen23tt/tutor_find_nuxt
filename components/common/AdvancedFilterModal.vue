<template>
	<base-modal title="Bộ lọc tìm kiếm" description="Tìm kiếm theo địa điểm, môn học, cấp độ, giá, thời gian, và nhiều hơn nữa" :is-open="isOpen" @close="$emit('close')">
		<div class="advanced-filter-content">
			<div class="filter-scroll-container">
				
				<!-- 1. Location Section -->
				<div class="filter-card" :class="{ 'is-active': activeSection == 'location' }">
					<div class="card-header" @click="toggleSection('location')">
                        <div class="header-left">
                            <div class="icon-wrapper">
                                <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            </div>
						    <span class="card-title">Địa điểm</span>
                        </div>
						<span class="card-value">{{ selectedCityName || 'Tất cả' }}</span>
					</div>
					
					<transition name="expand">
						<div class="card-body" v-if="activeSection == 'location'">
							<div class="search-input-wrapper">
								<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
								<input 
									type="text" 
									placeholder="Tìm kiếm tỉnh/thành phố..." 
									v-model="locationSearch"
									class="custom-input"
								/>
							</div>

							<!-- Unified List Container -->
							<div class="selection-list">
								<!-- 'All' Option -->
								<div 
									class="selection-item" 
									:class="{ active: !localFilters.provinces_id }"
									@click="selectCity(null)"
									v-if="!locationSearch"
								>
                                    <div class="item-icon map-icon">
                                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
                                    </div>
									<div class="item-content-wrapper">
                                        <span class="item-text">Tất cả địa điểm</span>
                                    </div>
									<div class="radio-indicator"></div>
								</div>
								
								<div 
									v-for="city in visibleCities" 
									:key="city.id" 
									class="selection-item"
									:class="{ active: localFilters.provinces_id == city.id }"
									@click="selectCity(city.id)"
								>
                                    <div class="item-icon location-icon">
                                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                    </div>
									<div class="item-content-wrapper">
                                        <span class="item-text">{{ city.name }}</span>
                                    </div>
									<div class="radio-indicator"></div>
								</div>

                                <div v-if="visibleCities.length == 0 && locationSearch" class="empty-state">
                                    Không tìm thấy kết quả
                                </div>
							</div>
						</div>
					</transition>
				</div>

				<!-- 2. Subject & Level Section -->
				<div class="filter-card" :class="{ 'is-active': activeSection == 'subject' }">
					<div class="card-header" @click="toggleSection('subject')">
                        <div class="header-left">
                            <div class="icon-wrapper">
                                <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                            </div>
						    <span class="card-title">Môn học & Cấp độ</span>
                        </div>
						<span class="card-action">{{ subjectSummary }}</span>
					</div>
					
					<transition name="expand">
						<div class="card-body" v-if="activeSection == 'subject'">
							<!-- Education Level Chips -->
							<div class="sub-section">
								<h4 class="sub-title">Trình độ học vấn</h4>
								<div class="chip-list">
									<div 
										class="chip" 
										v-for="level in educationLevelOptions" 
										:key="level.id"
										:class="{ active: localFilters.education_level_id == level.id }"
										@click="selectLevel(level.id)"
									>
										{{ level.name }}
									</div>
								</div>
							</div>

                            <div class="modal-divider"></div>

							<!-- Subject Search -->
							<div class="sub-section">
								<h4 class="sub-title">Môn học</h4>
								<div class="search-input-wrapper">
									<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
									<input 
										type="text" 
										placeholder="Tìm kiếm môn học..." 
										v-model="subjectSearch"
										class="custom-input"
									/>
								</div>
							</div>

							<!-- Unified Subject List -->
							<div class="selection-list">
								<div 
									class="selection-item"
									v-for="subject in visibleSubjects"
									:key="subject.id"
									@click="toggleSubject(subject.id)"
									:class="{ active: isSubjectSelected(subject.id) }"
								>
                                    <div class="item-icon">
                                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 1-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                                    </div>
									<div class="item-content-wrapper">
                                        <span class="item-text">{{ subject.name }}</span>
                                    </div>
									<div class="checkbox-indicator">
                                        <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
								</div>

                                <div v-if="visibleSubjects.length == 0 && subjectSearch" class="empty-state">
                                    Không tìm thấy môn học
                                </div>
							</div>
						</div>
					</transition>
				</div>

				<!-- 3. Experience Section -->
				<div class="filter-card" :class="{ 'is-active': activeSection == 'experience' }">
					<div class="card-header" @click="toggleSection('experience')">
                        <div class="header-left">
                            <div class="icon-wrapper">
                                <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                            </div>
						    <span class="card-title">Kinh nghiệm</span>
                        </div>
						<span class="card-value">{{ getExperienceLabel(localFilters.experience) }}</span>
					</div>
					<transition name="expand">
						<div class="card-body" v-if="activeSection == 'experience'">
							<div class="selection-list">
								<div 
									class="selection-item"
									:class="{ active: !localFilters.experience }"
									@click="localFilters.experience = ''"
								>
                                    <div class="item-icon">
                                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                    </div>
									<div class="item-content-wrapper">
                                        <span class="item-text">Tất cả kinh nghiệm</span>
                                    </div>
									<div class="radio-indicator"></div>
								</div>
								<div 
									v-for="exp in experienceOptions"
									:key="exp.id"
									class="selection-item"
									:class="{ active: localFilters.experience == exp.id }"
									@click="localFilters.experience = exp.id"
								>
                                    <div class="item-icon">
                                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                    </div>
									<div class="item-content-wrapper">
                                        <span class="item-text">{{ exp.name }}</span>
                                    </div>
									<div class="radio-indicator"></div>
								</div>
							</div>
						</div>
					</transition>
				</div>

				<!-- 4. Tuition Section -->
				<div class="filter-card" :class="{ 'is-active': activeSection == 'price' }">
					<div class="card-header" @click="toggleSection('price')">
                        <div class="header-left">
                            <div class="icon-wrapper">
                                <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                            </div>
						    <span class="card-title">Học phí</span>
                        </div>
						<span class="card-value">Dưới {{ formatPrice(localFilters.max_price) }}</span>
					</div>
					<transition name="expand">
						<div class="card-body centered-body" v-if="activeSection == 'price'">
							
							<div class="circular-slider" ref="sliderContainer" @mousedown="startDrag" @touchstart="startDrag">
								<svg width="240" height="240" viewBox="0 0 240 240">
									<!-- Track -->
									<path d="M 49.3,190.7 A 100,100 0 1,1 190.7,190.7" fill="none" stroke="var(--color-primary)" stroke-width="16" stroke-linecap="round"/>
									<!-- Progress -->
									<path 
										d="M 49.3,190.7 A 100,100 0 1,1 190.7,190.7" 
										fill="none" 
										stroke="var(--color-primary)" 
										stroke-width="16" 
										stroke-linecap="round"
										:stroke-dasharray="circumference"
										:stroke-dashoffset="dashOffset"
									/>
								</svg>
								
								<!-- Knob -->
								<div class="slider-knob" :style="knobStyle"></div>

								<!-- Center Text -->
								<div class="circle-content">
									<div class="price-large">{{ formatPriceShort(localFilters.max_price) }}</div>
									<div class="price-unit">mỗi buổi</div>
								</div>
							</div>

							<div class="slider-footer-text">
								Kéo để điều chỉnh: {{ formatPrice(localFilters.max_price) }}
							</div>
						</div>
					</transition>
				</div>

				<!-- 5. Rating Section -->
				<div class="filter-card" :class="{ 'is-active': activeSection == 'rating' }">
					<div class="card-header" @click="toggleSection('rating')">
                        <div class="header-left">
                            <div class="icon-wrapper">
                                <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                            </div>
    						<span class="card-title">Đánh giá</span>
                        </div>
						<span class="card-value">{{ localFilters.rating ? localFilters.rating + '.0+' : 'Tất cả' }}</span>
					</div>
					<transition name="expand">
						<div class="card-body" v-if="activeSection == 'rating'">
							<div class="selection-list">
								<div class="selection-item" :class="{ active: !localFilters.rating }" @click="localFilters.rating = 0">
                                    <div class="item-icon">
                                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                                    </div>
									<div class="item-content-wrapper">
                                        <span class="item-text">Tất cả đánh giá</span>
                                    </div>
									<div class="radio-indicator"></div>
								</div>
								
								<div class="selection-item" :class="{ active: localFilters.rating == 3 }" @click="localFilters.rating = 3">
                                    <div class="item-icon">
                                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none" style="color: #f59e0b;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                    </div>
                                    <div class="item-content-wrapper">
                                        <div class="rating-row-content">
                                            <span class="item-text">3 sao trở lên</span>
                                            <div class="stars-display">
                                                <svg v-for="i in 3" :key="i" class="star-fill" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                                <svg v-for="i in 2" :key="i+3" class="star-empty" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#e5e7eb" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                            </div>
                                        </div>
                                    </div>
									<div class="radio-indicator"></div>
                                </div>

								<div class="selection-item" :class="{ active: localFilters.rating == 4 }" @click="localFilters.rating = 4">
                                     <div class="item-icon">
                                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none" style="color: #f59e0b;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                    </div>
                                     <div class="item-content-wrapper">
                                        <div class="rating-row-content">
                                            <span class="item-text">4 sao trở lên</span>
                                            <div class="stars-display">
                                                <svg v-for="i in 4" :key="i" class="star-fill" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                                <svg class="star-empty" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#e5e7eb" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                            </div>
                                        </div>
                                    </div>
									<div class="radio-indicator"></div>
                                </div>

								<div class="selection-item" :class="{ active: localFilters.rating == 5 }" @click="localFilters.rating = 5">
                                    <div class="item-icon">
                                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none" style="color: #f59e0b;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                    </div>
                                    <div class="item-content-wrapper">
                                        <div class="rating-row-content">
                                            <span class="item-text">Tuyệt vời (5 sao)</span>
                                            <div class="stars-display">
                                                <svg v-for="i in 5" :key="i" class="star-fill" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                            </div>
                                        </div>
                                    </div>
									<div class="radio-indicator"></div>
                                </div>
							</div>
						</div>
					</transition>
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
import { useHelper } from '@/composables/useHelper';

const props = defineProps({
	isOpen: { type: Boolean, default: false },
	filters: { type: Object, required: true },
	cityOptions: { type: Array, default: () => [] },
	subjectOptions: { type: Array, default: () => [] },
	educationLevelOptions: { type: Array, default: () => [] },
	experienceOptions: { type: Array, default: () => [] }
});

const emit = defineEmits(['close', 'update:filters', 'apply', 'reset']);
const { formatCurrency } = useHelper();

const localFilters = ref({ ...props.filters });

// --- Section Management ---
const activeSection = ref(null); // 'location' by default? or null
const toggleSection = (section) => {
	activeSection.value = activeSection.value == section ? null : section;
};

// --- Sync Filters ---
watch(() => props.filters, (newFilters) => {
	console.log('newFilters', newFilters);
	if (JSON.stringify(newFilters) !== JSON.stringify(localFilters.value)) {
		localFilters.value = { ...newFilters };
        if (!localFilters.value.subject_ids) {
            localFilters.value.subject_ids = []; 
        }
		if (!localFilters.value.min_price) localFilters.value.min_price = 50000;
		if (!localFilters.value.max_price) localFilters.value.max_price = 1000000;
	}
}, { deep: true, immediate: true });

watch(() => props.isOpen, (val) => {
    if (val) {
        localFilters.value = { ...props.filters };
        if (!localFilters.value.subject_ids) {
            localFilters.value.subject_ids = []; 
        }
        if (!localFilters.value.min_price) localFilters.value.min_price = 50000;
        if (!localFilters.value.max_price) localFilters.value.max_price = 1000000;
    }
});

watch(localFilters, (newFilters) => {
	if (JSON.stringify(newFilters) !== JSON.stringify(props.filters)) {
		emit('update:filters', newFilters);
	}
}, { deep: true });

// --- Selection Logic ---
const locationSearch = ref('');
const subjectSearch = ref('');

const selectedCityName = computed(() => {
	const city = props.cityOptions.find(c => c.id == localFilters.value.provinces_id);
	return city ? city.name : '';
});

const subjectSummary = computed(() => {
    const ids = localFilters.value.subject_ids || [];
    if (ids.length == 0) return 'Chọn';
    if (ids.length == 1) {
        const sub = props.subjectOptions.find(s => s.id == ids[0]);
        return sub ? sub.name : '1 môn học';
    }
    return `${ids.length} môn học`;
});

// Generic logic for Top 5
const getVisibleOptions = (options, search) => {
    if (!search) return options.slice(0, 5);
    const query = search.toLowerCase();
    return options.filter(o => o.name.toLowerCase().includes(query));
};

const visibleCities = computed(() => getVisibleOptions(props.cityOptions, locationSearch.value));
const visibleSubjects = computed(() => getVisibleOptions(props.subjectOptions, subjectSearch.value));

const selectCity = (id) => {
	localFilters.value.provinces_id = id;
};

const selectLevel = (id) => {
	localFilters.value.education_level_id = localFilters.value.education_level_id == id ? null : id;
};

const isSubjectSelected = (id) => {
    return localFilters.value.subject_ids && localFilters.value.subject_ids.find(s => s == id);
};

const toggleSubject = (id) => {
    if (!localFilters.value.subject_ids) localFilters.value.subject_ids = [];
    
    const idx = localFilters.value.subject_ids.indexOf(id);
    if (idx > -1) {
        localFilters.value.subject_ids.splice(idx, 1);
    } else {
        localFilters.value.subject_ids.push(id);
    }
};

const getExperienceLabel = (id) => {
	if (!id) return 'Tất cả';
	const exp = props.experienceOptions.find(e => e.id == id);
	return exp ? exp.name : 'Đã chọn';
};

const formatPrice = (value) => formatCurrency(value || 0);

const formatPriceShort = (value) => {
	if (!value) return '0';
	if (value >= 1000000) return (value / 1000000).toFixed(1).replace('.0', '') + 'tr';
	if (value >= 1000) return (value / 1000).toFixed(0) + 'k';
	return value;
};

// --- Circular Slider Logic (Same as before) ---
const minPriceVal = 50000;
const maxPriceLimit = 2000000;
const sliderContainer = ref(null);
const dragging = ref(false);

const r = 100;
const cx = 120;
const cy = 120; 
const startDeg = 135;
const endDeg = 405; 
const totalSweep = endDeg - startDeg;
const circumference = (2 * Math.PI * r) * (totalSweep / 360); 

const priceToPercentage = (price) => {
	let p = (price - minPriceVal) / (maxPriceLimit - minPriceVal);
	if (p < 0) p = 0;
	if (p > 1) p = 1;
	return p;
};

const percentageToPrice = (p) => {
	let price = minPriceVal + p * (maxPriceLimit - minPriceVal);
	return Math.round(price / 50000) * 50000; 
};

const dashOffset = computed(() => {
	const p = priceToPercentage(localFilters.value.max_price || 500000);
	return circumference * (1 - p);
});

const knobStyle = computed(() => {
	const p = priceToPercentage(localFilters.value.max_price || 500000);
    const currentDeg = startDeg + p * totalSweep;
    const rad = currentDeg * (Math.PI / 180);
    const x = cx + r * Math.cos(rad);
    const y = cy + r * Math.sin(rad);
	return { left: `${x}px`, top: `${y}px` };
});

const handleMove = (clientX, clientY) => {
	if (!sliderContainer.value) return;
	const rect = sliderContainer.value.getBoundingClientRect();
	const centerX = rect.left + rect.width / 2;
	const centerY = rect.top + rect.height / 2;
    
	const dx = clientX - centerX;
	const dy = clientY - centerY;
	let angle = Math.atan2(dy, dx) * (180 / Math.PI);
	if (angle < 0) angle += 360;
	let relativeAngle = angle - startDeg; 
	if (relativeAngle < 0) relativeAngle += 360;
    if (relativeAngle > totalSweep) {
        if (relativeAngle < totalSweep + (360 - totalSweep)/2) relativeAngle = totalSweep;
        else relativeAngle = 0;
    }
    const p = relativeAngle / totalSweep;
    localFilters.value.max_price = percentageToPrice(p);
};

const startDrag = (e) => {
	dragging.value = true;
	const clientX = e.touches ? e.touches[0].clientX : e.clientX;
	const clientY = e.touches ? e.touches[0].clientY : e.clientY;
	handleMove(clientX, clientY);
	window.addEventListener('mousemove', onDrag);
	window.addEventListener('mouseup', stopDrag);
	window.addEventListener('touchmove', onDrag);
	window.addEventListener('touchend', stopDrag);
};

const onDrag = (e) => {
	if (!dragging.value) return;
	const clientX = e.touches ? e.touches[0].clientX : e.clientX;
	const clientY = e.touches ? e.touches[0].clientY : e.clientY;
	handleMove(clientX, clientY);
};

const stopDrag = () => {
	dragging.value = false;
	window.removeEventListener('mousemove', onDrag);
	window.removeEventListener('mouseup', stopDrag);
	window.removeEventListener('touchmove', onDrag);
	window.removeEventListener('touchend', stopDrag);
};
const handleReset = () => emit('reset');
const handleApply = () => emit('apply');
</script>

<style scoped>
/* Main Container */
.advanced-filter-content {
    background: #fdfdfd;
	padding: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
}

/* Header */
.modal-header-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
	margin-bottom: 1rem;
}

.modal-header-title h2 {
    font-size: 1.5rem;
    font-weight: 800;
    color: #1a1a1a;
    letter-spacing: -0.02em;
    margin: 0;
}

.close-btn-header {
    background: transparent;
    border: none;
    color: #525252;
    cursor: pointer;
    padding: 4px;
    border-radius: 50%;
    transition: background 0.2s;
}

.close-btn-header:hover {
    background: #f3f4f6;
    color: var(--color-primary);
}

/* Scroll Area */
.filter-scroll-container {
    overflow-y: auto;
    flex: 1;
}

/* Cards */
.filter-card {
	background: #fff;
	border: 1px solid #e5e5e5;
	border-radius: 16px;
	margin-bottom: 1.25rem;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.filter-card:hover {
    border-color: #d4d4d4;
    box-shadow: 0 4px 12px rgba(0,0,0,0.02);
}

.card-header {
	padding: 1.25rem 1.5rem;
	display: flex;
	justify-content: space-between;
	align-items: center;
	cursor: pointer;
	background: #fff;
    user-select: none;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.icon-wrapper {
    width: 2.5rem;
    height: 2.5rem;
    background: #f5f5f5;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #333;
    transition: all 0.3s ease;
}


.card-title {
	font-weight: 500;
	color: #171717;
	font-size: 1rem;
}

.card-action, .card-value {
    font-size: 0.9rem;
    font-weight: 600;
    color: #525252;
}

.card-body {
	padding: 1.5rem;
	border-top: 1px solid #f5f5f5;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Expand Animation */
.expand-enter-active, .expand-leave-active {
	transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
	max-height: 500px;
	opacity: 1;
    overflow: hidden;
}
.expand-enter-from, .expand-leave-to {
	max-height: 0;
	opacity: 0;
}

/* Divider */
.modal-divider {
    height: 1px;
    background: #f5f5f5;
    margin: 1.5rem 0;
}

/* Search Input */
.search-input-wrapper {
	position: relative;
	margin-bottom: 1rem;
}

.custom-input {
	width: 100%;
	padding: 0.875rem 1rem 0.875rem 2.75rem;
	background: #f9f9f9;
	border: 1px solid transparent;
	border-radius: 12px;
	font-size: 0.95rem;
	outline: none;
	transition: all 0.2s;
    color: #1a1a1a;
    font-weight: 500;
}

.custom-input:focus {
	background: #fff;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(0,0,0,0.05);
}

.search-icon {
	position: absolute;
	left: 1rem;
	top: 50%;
	transform: translateY(-50%);
	color: #a3a3a3;
}

/* Unified Selection List */
.selection-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.selection-item {
    display: flex;
    align-items: center;
    gap: 1rem; /* Gap between icon and content */
    padding: 0.75rem 1rem;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid transparent;
}

.selection-item:hover {
    background: #f9f9f9;
}

.item-content-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
}

/* Icons */
.item-icon {
    width: 40px;
    height: 40px;
    background: #f5f5f5;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #525252;
    flex-shrink: 0;
}

.item-icon.map-icon {
    background: #eef2ff;
    color: var(--color-primary);
}

.selection-item.active .item-text {
    font-weight: 600;
    color: var(--color-primary);
}

/* Indicators */
/* Radio Style */
.radio-indicator {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid #d4d4d4;
    position: relative;
    transition: all 0.2s;
}

.selection-item.active .radio-indicator {
    border-color: var(--color-primary);
    background: var(--color-primary);
}

.selection-item.active .radio-indicator::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    background: #fff;
    border-radius: 50%;
}

/* Checkbox Style */
.checkbox-indicator {
    width: 1.2rem;
    height: 1.2rem;
    border: 2px solid #d4d4d4;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: transparent;
    transition: all 0.2s;
}

.selection-item.active .checkbox-indicator {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: #fff;
}

/* Sub-sections */
.sub-title {
	font-size: 0.8rem;
	font-weight: 700;
	color: #a3a3a3;
	text-transform: uppercase;
	letter-spacing: 0.05em;
	margin-bottom: 0.75rem;
}

/* Chips */
.chip-list {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;
}

.chip {
	padding: 0.5rem 1.1rem;
	background: #f5f5f5;
	border-radius: 100px; /* Pill */
	font-size: 0.9rem;
	color: #525252;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s;
    border: 1px solid transparent;
    display: flex;
    align-items: center;
    gap: 6px;
}

.chip:hover {
	background: #e5e5e5;
}

.chip.active {
	background: var(--color-primary);
	color: #fff;
	box-shadow: 0 4px 10px rgba(0,0,0,0.15);
}

/* Circular Slider */
.circular-slider {
	position: relative;
	width: 240px;
	height: 240px;
	margin: 1rem auto 0;
	cursor: grab;
	touch-action: none;
    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.05));
}

.circular-slider:active {
	cursor: grabbing;
}

.circle-content {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	text-align: center;
	display: flex;
	flex-direction: column;
	align-items: center;
	pointer-events: none;
}

.price-large { 
    font-size: 2.75rem;
	font-weight: 800;
	color: var(--color-primary);
	line-height: 1;
    letter-spacing: -0.03em;
}

.price-unit {
	color: #737373;
	font-weight: 500;
	font-size: 0.9rem;
	margin-top: 0.25rem;
}

.slider-knob {
	position: absolute;
	width: 32px; /* Bigger touch area */
	height: 32px;
	background: #fff;
	border-radius: 50%;
	box-shadow: 0 4px 8px rgba(0,0,0,0.2);
	transform: translate(-50%, -50%);
	z-index: 10;
    z-index: 10;
	cursor: grab;
	border: 3px solid var(--color-primary);
}


/* Rating Styles */
.rating-row-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.stars-display {
    display: flex;
    gap: 2px;
}

.centered-body {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.slider-footer-text {
	font-weight: 500;
	color: #404040;
    font-size: 0.95rem;
    opacity: 0.8;
}

/* Star Icons */
.star-icon {
    margin-bottom: 2px;
}

/* Footer Action */
.modal-footer-action {
	padding: 1rem 0;
	display: flex;
	justify-content: space-between;
	align-items: center;
    border-top: 1px solid #f5f5f5;
    background: #fff;
}

.btn-reset {
	background: none;
	border: none;
	color: #737373;
	font-weight: 600;
	cursor: pointer;
    font-size: 0.95rem;
    transition: color 0.2s;
    padding: 0.5rem 1rem;
}

.btn-reset:hover {
    color: var(--color-primary);
}

.btn-apply {
	background: var(--color-primary);
	color: #fff;
	padding: 1rem 2rem;
	border-radius: 14px;
	border: none;
	font-weight: 700;
    font-size: 1rem;
	cursor: pointer;
	box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    transition: all 0.2s;
}

.btn-apply:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(0,0,0,0.15);
}

.btn-apply:active {
    transform: translateY(0);
}

/* Empty State */
.empty-state {
    padding: 2rem;
    text-align: center;
    color: #a3a3a3;
    font-weight: 500;
}

@media (max-width: 640px) {
    .modal-header-title h2 {
        font-size: 1.25rem;
    }
	.advanced-filter-content {
		padding: 0;
	}
    .filter-scroll-container {
        padding: 1rem;
    }
    .modal-footer-action {
        padding: 1rem;
    }
	.price-large {
		font-size: 2.25rem;
	}
}
</style>
