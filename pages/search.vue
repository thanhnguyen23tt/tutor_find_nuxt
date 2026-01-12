<template>
<!-- Loading overlay -->
<base-loading v-if="isLoading" />

<div class="search-page" v-if="!isLoading">
    <div class="container">
        <div class="header-wrapper">
            <div class="header-badge">
                <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="7.5,4.21 12,6.81 16.5,4.21"></polyline>
                    <polyline points="7.5,19.79 7.5,14.6 3,12"></polyline>
                    <polyline points="21,12 16.5,14.6 16.5,19.79"></polyline>
                </svg>
                <span>Tìm kiếm thông minh</span>
            </div>
            <h1 class="title">Tìm gia sư phù hợp với bạn</h1>
            <p class="sub-title">Khám phá đội ngũ gia sư chất lượng cao của chúng tôi và tìm người phù hợp nhất với nhu cầu học tập của bạn</p>
        </div>

        <!-- Modern Filter Section -->
        <div class="modern-filter-section">
            <div class="modern-filter-container">
                <!-- Desktop Search Bar -->
                <div class="filter-search-bar desktop-search-bar" ref="searchBarRef">
                    <div class="search-highlight" :style="highlightStyle"></div>
                    
                    <!-- Location Section -->
                    <div class="search-filter-item" :ref="el => setItemRef(el, 'location')" :class="{ 'active': activeDropdown === 'location' }" @click.stop="toggleDropdown('location')">
                        <div class="section-content">
                            <div class="section-label">Địa điểm</div>
                            <div class="section-value" :class="{ 'placeholder': !filters.provinces_id }">
                                {{ getCityName(filters.provinces_id) || 'Tìm kiếm điểm đến' }}
                            </div>
                        </div>
                        <!-- Dropdown -->
                        <div v-if="activeDropdown === 'location'" class="search-dropdown location-dropdown" @click.stop>
                            <div class="dropdown-title">Điểm đến được đề xuất</div>
                            <div class="dropdown-list">
                                <div class="dropdown-item" @click="selectCity('')">
                                    <div class="item-icon map-icon">
                                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
                                    </div>
                                    <div class="item-info">
                                        <div class="item-title">Tất cả địa điểm</div>
                                        <div class="item-desc">Tìm kiếm mọi nơi</div>
                                    </div>
                                </div>
                                <div v-for="city in cityOptions" :key="city.id" class="dropdown-item" @click="selectCity(city.id)">
                                    <div class="item-icon location-icon">
                                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                    </div>
                                    <div class="item-info">
                                        <div class="item-title">{{ city.name }}</div>
                                        <div class="item-desc">Việt Nam</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Subject Section -->
                    <div class="search-filter-item" :ref="el => setItemRef(el, 'subject')" :class="{ 'active': activeDropdown === 'subject' }" @click.stop="toggleDropdown('subject')">
                        <div class="section-content">
                            <div class="section-label">Môn học & Trình độ</div>
                            <div class="section-value" :class="{ 'placeholder': !filters.subject_ids?.length }">
                                {{ getSubjectSummary }}
                            </div>
                        </div>
                        <!-- Dropdown -->
                        <div v-if="activeDropdown === 'subject'" class="search-dropdown subject-dropdown wide-dropdown" @click.stop>
                            <!-- Level Section in Dropdown -->
                            <div class="dropdown-section">
                                <div class="dropdown-title">Trình độ học vấn</div>
                                <div class="chip-list">
                                    <div 
                                        class="chip" 
                                        v-for="level in educationLevelOptions" 
                                        :key="level.id"
                                        :class="{ active: filters.education_level_id == level.id }"
                                        @click="selectLevel(level.id)"
                                    >
                                        {{ level.name }}
                                    </div>
                                </div>
                            </div>
                            
                            <div class="dropdown-divider"></div>

                            <!-- Subject Search & List -->
                            <div class="dropdown-section">
                                <div class="dropdown-title">Môn học</div>
                                <div class="search-input-wrapper">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                    <input 
                                        type="text" 
                                        placeholder="Tìm kiếm môn học..." 
                                        v-model="subjectSearch"
                                        class="custom-input-sm"
                                        @click.stop
                                    />
                                </div>
                                
                                <div class="dropdown-list-scroll">
                                    <div class="dropdown-item" 
                                         v-for="sub in visibleSubjects" 
                                         :key="sub.id" 
                                         @click="toggleSubject(sub.id)"
                                         :class="{ active: isSubjectSelected(sub.id) }"
                                    >
                                        <div class="item-info">
                                            <div class="item-title">{{ sub.name }}</div>
                                        </div>
                                        <div class="checkbox-indicator">
                                            <svg v-if="isSubjectSelected(sub.id)" class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        </div>
                                    </div>
                                    <div v-if="visibleSubjects.length === 0" class="empty-state-sm">
                                        Không tìm thấy
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Experience Section -->
                    <div class="search-filter-item" :ref="el => setItemRef(el, 'experience')" :class="{ 'active': activeDropdown === 'experience' }" @click.stop="toggleDropdown('experience')">
                        <div class="section-content">
                            <div class="section-label">Kinh nghiệm</div>
                            <div class="section-value" :class="{ 'placeholder': !filters.experience }">
                                {{ getExperienceName(filters.experience) || 'Thêm kinh nghiệm' }}
                            </div>
                        </div>
                        <!-- Dropdown -->
                        <div v-if="activeDropdown === 'experience'" class="search-dropdown experience-dropdown" @click.stop>
                            <div class="dropdown-title">Chọn kinh nghiệm</div>
                            <div class="dropdown-list">
                                <div class="dropdown-item" @click="selectExperience('')">
                                    <div class="item-icon">
                                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                    </div>
                                    <div class="item-info">
                                        <div class="item-title">Tất cả kinh nghiệm</div>
                                        <div class="item-desc">Mọi mức kinh nghiệm</div>
                                    </div>
                                </div>
                                <div v-for="exp in experienceOptions" :key="exp.id" class="dropdown-item" @click="selectExperience(exp.id)">
                                    <div class="item-icon">
                                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                    </div>
                                    <div class="item-info">
                                        <div class="item-title">{{ exp.name }}</div>
                                        <div class="item-desc">Kinh nghiệm giảng dạy</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Rating Section -->
                    <div class="search-filter-item" :ref="el => setItemRef(el, 'rating')" :class="{ 'active': activeDropdown === 'rating' }" @click.stop="toggleDropdown('rating')">
                        <div class="section-content">
                            <div class="section-label">Đánh giá</div>
                            <div class="section-value" :class="{ 'placeholder': !filters.rating }">
                                {{ filters.rating ? filters.rating + '.0+' : 'Mọi đánh giá' }}
                            </div>
                        </div>
                        <!-- Dropdown -->
                        <div v-if="activeDropdown === 'rating'" class="search-dropdown rating-dropdown" @click.stop>
                            <div class="dropdown-title">Chọn đánh giá</div>
                            <div class="dropdown-list">
                                <div class="dropdown-item" @click="selectRating(0)" :class="{ active: !filters.rating }">
                                    <div class="item-icon">
                                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                                    </div>
                                    <div class="item-info">
                                        <div class="item-title">Mọi đánh giá</div>
                                        <div class="item-desc">Tất cả</div>
                                    </div>
                                    <div class="checkbox-indicator">
                                        <svg v-if="filters.rating == 0" class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                </div>
                                <div class="dropdown-item" @click="selectRating(3)" :class="{ active: filters.rating == 3 }">
                                    <div class="item-icon">
                                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none" style="color: #f59e0b;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                    </div>
                                    <div class="item-info">
                                        <div class="item-title">3 sao trở lên</div>
                                        <div class="stars-display">
                                            <svg v-for="i in 3" :key="i" class="star-fill" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                            <svg v-for="i in 2" :key="i+3" class="star-empty" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#e5e7eb" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                        </div>
                                    </div>
                                    <div class="checkbox-indicator">
                                        <svg v-if="filters.rating == 3" class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                </div>
                                <div class="dropdown-item" @click="selectRating(4)" :class="{ active: filters.rating == 4 }">
                                    <div class="item-icon">
                                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none" style="color: #f59e0b;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                    </div>
                                    <div class="item-info">
                                        <div class="item-title">4 sao trở lên</div>
                                        <div class="stars-display">
                                            <svg v-for="i in 4" :key="i" class="star-fill" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                            <svg class="star-empty" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#e5e7eb" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                        </div>
                                    </div>
                                    <div class="checkbox-indicator">
                                        <svg v-if="filters.rating == 4" class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                </div>
                                <div class="dropdown-item" @click="selectRating(5)" :class="{ active: filters.rating == 5 }">
                                    <div class="item-icon">
                                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none" style="color: #f59e0b;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                    </div>
                                    <div class="item-info">
                                        <div class="item-title">Tuyệt vời (5 sao)</div>
                                        <div class="stars-display">
                                            <svg v-for="i in 5" :key="i" class="star-fill" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                        </div>
                                    </div>
                                    <div class="checkbox-indicator">
                                        <svg v-if="filters.rating == 5" class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Search Button -->
                    <div class="search-btn-wrapper">
                        <button class="search-btn-circle" @click="refreshSearch">
                            <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </button>
                        <button class="filter-btn-circle" @click="showFilter = true">
                            <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
                        </button>
                    </div>
                </div>

                <!-- Mobile Search Bar -->
                <div class="filter-search-bar mobile-search-bar" @click="showFilter = true">
                    <div class="search-icon-wrapper">
                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </div>
                    <div class="mobile-search-content">
                        <div class="mobile-search-title">Tìm kiếm gia sư</div>
                        <div class="mobile-search-subtitle">
                            {{ getSubjectName(filters.subject_ids?.[0]) || 'Bất kỳ đâu' }} • {{ getCityName(filters.provinces_id) || 'Bất kỳ môn nào' }}
                        </div>
                    </div>
                    <div class="filter-icon-wrapper">
                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="results-page" v-if="!isLoading">
    <div class="container">
        <!-- Search Results -->
        <div class="search-results" v-if="tutors.length > 0">
            <!-- Featured Tutors Section -->
            <div class="featured-section" v-if="featuredTutors.length > 0">
                <div class="section-header">
                    <div class="icon-wrapper">
                        <svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #f59e0b;">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                    </div>
                    <div class="section-title-wrapper">
                        <h2 class="section-title">Gia sư nổi bật</h2>
                        <p class="section-subtitle">Những gia sư được đánh giá cao nhất phù hợp với tìm kiếm của bạn</p>
                    </div>
                </div>
                <div class="tutors-grid">
                    <TutorCardFull
                        v-for="tutor in featuredTutors"
                        :key="tutor.uid"
                        :tutor="tutor"
                        @navigate-to-tutor="handleNavigateToTutor"
                        @redirect-to-booking="handleRedirectToBooking"
                    />
                </div>
            </div>

            <!-- Regular Tutors Section -->
            <div class="regular-section" v-if="regularTutors.length > 0">
                <div class="section-header">
                    <div class="icon-wrapper">
                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #f59e0b;">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                    </div>
                    <div class="section-title-wrapper">
                        <h2 class="section-title">Danh sách gia sư</h2>
                        <p class="section-subtitle">Danh sách gia sư phù hợp với tìm kiếm của bạn</p>
                    </div>
                </div>
                <div class="tutors-grid">
                    <TutorCardFull
                        v-for="tutor in regularTutors"
                        :key="tutor.uid"
                        :tutor="tutor"
                        @navigate-to-tutor="handleNavigateToTutor"
                        @redirect-to-booking="handleRedirectToBooking"
                    />
                </div>
            </div>
        </div>

        <!-- No Data State -->
        <div class="no-results" v-else>
            <div class="no-results-content">
                <h3 class="no-results-title">Không tìm thấy kết quả nào</h3>
                <p class="no-results-desc">
                    Chúng tôi không tìm thấy gia sư nào phù hợp với bộ lọc hiện tại của bạn.
                    <br>Hãy thử thay đổi từ khóa hoặc điều chỉnh bộ lọc.
                </p>
                <button class="btn-sm btn-secondary" @click="resetFilters">
                    Xóa bộ lọc
                </button>
            </div>
        </div>

        <base-pagination :meta="dataPaginate" :current-page="currentPage" @changePage="changePage" />
    </div>
</div>

<AdvancedFilterModal
    :is-open="showFilter"
    v-model:filters="filters"
    :city-options="cityOptions"
    :subject-options="subjectOptions"
    :education-level-options="educationLevelOptions"
    :experience-options="experienceOptions"
    @close="handleFilterClose"
    @reset="resetFilters"
    @apply="handleFilterApply"
/>
</template>

<script setup>
// ==================== CONSTANTS ====================
const DEFAULT_FILTERS = {
    provinces_id: "",
    subject_ids: [],
    education_level_id: "",
    experience: "",
    min_price: 50000,
    max_price: 1000000,
    rating: 0,
    sort: ""
};

const SUBJECT_DISPLAY_LIMIT = 50;

// ==================== COMPOSABLES & STORES ====================
definePageMeta({
    middleware: [() => { useLayoutStore().setHiddenFooter(true); }]
});

const route = useRoute();
const configStore = useConfigStore();
const { api } = useApi();
const config = useRuntimeConfig();

// ==================== HELPER FUNCTIONS ====================
function parseFiltersFromQuery(query) {
    const subjectIds = query.subject 
        ? (Array.isArray(query.subject) 
            ? query.subject.map(i => parseInt(i)).filter(i => !isNaN(i)) 
            : [parseInt(query.subject)].filter(i => !isNaN(i))) 
        : [];

    return {
        provinces_id: query.city || "",
        subject_ids: subjectIds,
        education_level_id: query.level || "",
        experience: query.experience || "",
        min_price: query.minPrice ? parseInt(query.minPrice) : 50000,
        max_price: query.maxPrice ? parseInt(query.maxPrice) : 1000000,
        rating: 0,
        sort: query.sort || ""
    };
}

function buildSearchParams() {
    const params = { page: currentPage.value };
    
    if (filters.value.provinces_id) params.provinces_id = filters.value.provinces_id;
    if (filters.value.subject_ids?.length) params.subject_ids = filters.value.subject_ids;
    if (filters.value.education_level_id) params.education_level_id = filters.value.education_level_id;
    if (filters.value.experience) params.experience = filters.value.experience;
    if (filters.value.min_price) params.min_price = filters.value.min_price;
    if (filters.value.max_price) params.max_price = filters.value.max_price;
    if (filters.value.rating) params.rating = filters.value.rating;
    if (filters.value.sort) params.sort = filters.value.sort;
    
    return params;
}

function buildQueryFromFilters() {
    const query = {};
    
    if (filters.value.provinces_id) query.city = filters.value.provinces_id;
    if (filters.value.subject_ids?.length) query.subject = filters.value.subject_ids;
    if (filters.value.education_level_id) query.level = filters.value.education_level_id;
    if (filters.value.experience) query.experience = filters.value.experience;
    if (filters.value.min_price !== 50000) query.minPrice = filters.value.min_price;
    if (filters.value.max_price !== 1000000) query.maxPrice = filters.value.max_price;
    if (filters.value.sort) query.sort = filters.value.sort;
    
    return query;
}

// ==================== REACTIVE STATE ====================
const filters = ref(parseFiltersFromQuery(route.query));
const showFilter = ref(false);
const currentPage = ref(parseInt(route.query.page) || 1);
const activeDropdown = ref(null);
const subjectSearch = ref('');
const highlightStyle = ref({ opacity: 0 });
const itemRefs = ref({});
const searchBarRef = ref(null);
const isUpdatingFromRoute = ref(false);

// ==================== COMPUTED PROPERTIES ====================
const subjectOptions = computed(() => configStore.configuration?.subjects || []);
const educationLevelOptions = computed(() => configStore.configuration?.education_levels || []);
const experienceOptions = computed(() => configStore.configuration?.experience_action || []);
const cityOptions = computed(() => configStore.configuration?.provinces || []);

const visibleSubjects = computed(() => {
    const subjects = subjectOptions.value;
    if (!subjectSearch.value) return subjects.slice(0, SUBJECT_DISPLAY_LIMIT);
    
    const lower = subjectSearch.value.toLowerCase();
    return subjects.filter(s => s.name.toLowerCase().includes(lower));
});

const getSubjectSummary = computed(() => {
    const ids = filters.value.subject_ids || [];
    if (ids.length === 0) return 'Tất cả';
    if (ids.length === 1) {
        const sub = subjectOptions.value.find(s => s.id === ids[0]);
        return sub?.name || '1 môn học';
    }
    return `${ids.length} môn học`;
});

const selectedSubject = computed(() => {
    if (!filters.value.subject_ids?.length) return null;
    return subjectOptions.value.find(s => s.id === filters.value.subject_ids[0]);
});

const metaTitle = computed(() => {
    return selectedSubject.value 
        ? `Tìm một gia sư ${selectedSubject.value.name} trực tuyến để giúp bạn học`
        : 'Tìm gia sư phù hợp với bạn';
});

const metaDescription = computed(() => {
    return selectedSubject.value
        ? `Tìm gia sư ${selectedSubject.value.name} trực tuyến chất lượng cao. Học ${selectedSubject.value.name} hiệu quả với giáo viên giàu kinh nghiệm, phương pháp dạy hiện đại, linh hoạt thời gian học tập.`
        : 'Khám phá đội ngũ gia sư chất lượng cao của chúng tôi và tìm người phù hợp nhất với nhu cầu học tập của bạn';
});

const metaUrl = computed(() => {
    const baseUrl = config.public.baseUrl || (process.client ? window.location.origin : '');
    const queryString = new URLSearchParams(route.query).toString();
    return `${baseUrl}/search${queryString ? `?${queryString}` : ''}`;
});

// ==================== DATA FETCHING ====================
const { data: searchData, pending: isLoading, refresh: refreshSearch } = await useAsyncData(
    () => `search-tutors-${route.fullPath}`,
    async () => {
        const params = buildSearchParams();
        try {
            const response = await api.apiPost('tutors', params);
            return {
                tutors: response.data || [],
                paginate: response?.meta || {}
            };
        } catch (error) {
            console.error('Error fetching tutors:', error);
            return { tutors: [], paginate: {} };
        }
    },
    {
        server: false,
        lazy: false,
        watch: [() => route.fullPath]
    }
);

const tutors = computed(() => searchData.value?.tutors || []);
const dataPaginate = computed(() => searchData.value?.paginate || {});

const featuredTutors = computed(() => {
    return currentPage.value === 1 && tutors.value.length > 0 
        ? tutors.value.slice(0, 2) 
        : [];
});

const regularTutors = computed(() => {
    return currentPage.value === 1 && tutors.value.length > 0 
        ? tutors.value.slice(2) 
        : tutors.value;
});

// ==================== GETTER FUNCTIONS ====================
const getCityName = (id) => id ? cityOptions.value.find(c => c.id == id)?.name || '' : '';
const getSubjectName = (id) => id ? subjectOptions.value.find(s => s.id == id)?.name || '' : '';
const getExperienceName = (id) => id ? experienceOptions.value.find(e => e.id == id)?.name || '' : '';

// ==================== SELECTION HANDLERS ====================
const selectCity = (id) => {
    filters.value.provinces_id = id;
    activeDropdown.value = null;
};

const selectLevel = (id) => {
    filters.value.education_level_id = filters.value.education_level_id == id ? '' : id;
};

const toggleSubject = (id) => {
    if (!filters.value.subject_ids) filters.value.subject_ids = [];
    const idx = filters.value.subject_ids.indexOf(id);
    if (idx > -1) {
        filters.value.subject_ids.splice(idx, 1);
    } else {
        filters.value.subject_ids.push(id);
    }
};

const isSubjectSelected = (id) => filters.value.subject_ids?.includes(id) || false;

const selectExperience = (id) => {
    filters.value.experience = id;
    activeDropdown.value = null;
};

const selectRating = (rating) => {
    filters.value.rating = rating;
    activeDropdown.value = null;
};

// ==================== UI HANDLERS ====================
const toggleDropdown = (name) => {
    activeDropdown.value = activeDropdown.value === name ? null : name;
};

const setItemRef = (el, key) => {
    if (el) itemRefs.value[key] = el;
};

const updateHighlight = () => {
    if (!activeDropdown.value || !itemRefs.value[activeDropdown.value] || !searchBarRef.value) {
        highlightStyle.value = { opacity: 0 };
        return;
    }
    
    const el = itemRefs.value[activeDropdown.value];
    const barRect = searchBarRef.value.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    
    highlightStyle.value = {
        opacity: 1,
        left: `${elRect.left - barRect.left}px`,
        width: `${elRect.width}px`
    };
};

// ==================== FILTER ACTIONS ====================
const applyFilters = async () => {
    const query = buildQueryFromFilters();
    
    if (JSON.stringify(query) === JSON.stringify(route.query)) return;
    
    await navigateTo({ path: route.path, query });
};

const resetFilters = () => {
    filters.value = { ...DEFAULT_FILTERS };
};

const handleFilterClose = () => {
    showFilter.value = false;
    applyFilters();
};

const handleFilterApply = () => {
    showFilter.value = false;
    applyFilters();
};

// ==================== NAVIGATION ====================
const changePage = async (page) => {
    currentPage.value = page;
    const query = { ...route.query, page: page.toString() };
    await navigateTo({ path: route.path, query });
    await refreshSearch();
};

const handleRedirectToBooking = (uid) => navigateTo(`/booking/${uid}`);
const handleNavigateToTutor = (uid) => navigateTo(`/tutor/${uid}`);

// ==================== WATCHERS ====================
watch(() => route.query, (newQuery) => {
    isUpdatingFromRoute.value = true;
    filters.value = parseFiltersFromQuery(newQuery);
    if (newQuery.page) currentPage.value = parseInt(newQuery.page) || 1;
    
    nextTick(() => {
        isUpdatingFromRoute.value = false;
    });
});

watch(filters, async () => {
    if (isUpdatingFromRoute.value || showFilter.value) return;
    await applyFilters();
}, { deep: true });

watch(activeDropdown, () => {
    nextTick(() => updateHighlight());
});

// ==================== LIFECYCLE ====================
onMounted(() => {
    window.addEventListener('click', () => {
        activeDropdown.value = null;
    });
});

// ==================== SEO ====================
useSeoMeta({
    title: metaTitle,
    description: metaDescription,
    ogTitle: metaTitle,
    ogDescription: metaDescription,
    ogUrl: metaUrl,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: metaTitle,
    twitterDescription: metaDescription,
});

useHead({
    link: [{ rel: 'canonical', href: metaUrl }]
});

</script>

<style scoped>
@import url('~/assets/css/tutorCard.css');
@import url('~/assets/css/search-bar.css');
@import url('~/assets/css/search-page.css');


/* Custom scoped styles for complex dropdowns removed - moved to search-bar.css */
.stars-display {
    display: flex;
    gap: 2px;
    margin-top: 2px;
}
</style>

