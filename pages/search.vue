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
            <h1 class="title">
                Tìm gia sư phù hợp với bạn
            </h1>
            <p class="sub-title">Khám phá đội ngũ gia sư chất lượng cao của chúng tôi và tìm người phù hợp nhất với nhu cầu học tập của bạn</p>
        </div>

        <!-- Modern Filter Section (New) -->
        <div class="modern-filter-section">
            <div class="modern-filter-container">
                <!-- Main Search Bar -->
                <!-- Desktop Search Bar -->
                <div class="airbnb-search-bar desktop-search-bar" ref="searchBarRef">
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
                            <div class="section-label">Môn học</div>
                            <div class="section-value" :class="{ 'placeholder': !filters.subject }">
                                {{ getSubjectName(filters.subject) || 'Thêm môn học' }}
                            </div>
                        </div>
                        <!-- Dropdown -->
                        <div v-if="activeDropdown === 'subject'" class="search-dropdown subject-dropdown" @click.stop>
                            <div class="dropdown-title">Môn học phổ biến</div>
                            <div class="dropdown-list">
                                <div class="dropdown-item" @click="selectSubject('')">
                                    <div class="item-icon">
                                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                                    </div>
                                    <div class="item-info">
                                        <div class="item-title">Tất cả môn học</div>
                                        <div class="item-desc">Khám phá tất cả</div>
                                    </div>
                                </div>
                                <div v-for="sub in subjectOptions" :key="sub.id" class="dropdown-item" @click="selectSubject(sub.id)">
                                    <div class="item-icon">
                                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 1-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                                    </div>
                                    <div class="item-info">
                                        <div class="item-title">{{ sub.name }}</div>
                                        <div class="item-desc">Môn học</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    

                    <!-- Level Section -->
                    <div class="search-filter-item" :ref="el => setItemRef(el, 'level')" :class="{ 'active': activeDropdown === 'level' }" @click.stop="toggleDropdown('level')">
                        <div class="section-content">
                            <div class="section-label">Trình độ</div>
                            <div class="section-value" :class="{ 'placeholder': !filters.educationLevel }">
                                {{ getLevelName(filters.educationLevel) || 'Thêm trình độ' }}
                            </div>
                        </div>
                        <!-- Dropdown -->
                        <div v-if="activeDropdown === 'level'" class="search-dropdown level-dropdown" @click.stop>
                            <div class="dropdown-title">Chọn trình độ</div>
                            <div class="dropdown-list">
                                <div class="dropdown-item" @click="selectLevel('')">
                                    <div class="item-icon">
                                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                                    </div>
                                    <div class="item-info">
                                        <div class="item-title">Tất cả trình độ</div>
                                        <div class="item-desc">Mọi cấp độ</div>
                                    </div>
                                </div>
                                <div v-for="lvl in educationLevelOptions" :key="lvl.id" class="dropdown-item" @click="selectLevel(lvl.id)">
                                    <div class="item-icon">
                                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                    </div>
                                    <div class="item-info">
                                        <div class="item-title">{{ lvl.name }}</div>
                                        <div class="item-desc">Cấp độ học vấn</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    

                    <!-- Experience Section (New 4th Section) -->
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
                <div class="airbnb-search-bar mobile-search-bar" @click="showFilter = true">
                    <div class="search-icon-wrapper">
                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </div>
                    <div class="mobile-search-content">
                        <div class="mobile-search-title">Tìm kiếm gia sư</div>
                        <div class="mobile-search-subtitle">
                            {{ getSubjectName(filters.subject) || 'Bất kỳ đâu' }} • {{ getCityName(filters.provinces_id) || 'Bất kỳ môn nào' }}
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
                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #f59e0b;">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                    </div>
                    <div class="section-title-wrapper">
                        <h2 class="section-title">Gia sư nổi bật</h2>
						<p class="section-subtitle">Những gia sư được đánh giá cao nhất phù hợp với tìm kiếm của bạn</p>
                    </div>
                </div>
                <div class="tutors-grid">
                    <TutorCard
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
                    <TutorCard
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
                <div class="no-results-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        <line x1="8" y1="11" x2="14" y2="11"></line>
                    </svg>
                </div>
                <h3 class="no-results-title">Không tìm thấy kết quả nào</h3>
                <p class="no-results-desc">
                    Chúng tôi không tìm thấy gia sư nào phù hợp với bộ lọc hiện tại của bạn.
                    <br>Hãy thử thay đổi từ khóa hoặc điều chỉnh bộ lọc.
                </p>
                <button class="btn-lg btn-secondary" @click="filters = { provinces_id: '', subject: '', educationLevel: '', experience: '', rating: 0, price: 500000 }">
                    Xóa bộ lọc
                </button>
            </div>
        </div>

		<base-pagination :meta="dataPaginate" :current-page="currentPage" @changePage="changePage"></base-pagination>
	</div>
</div>

<AdvancedFilterModal
    :is-open="showFilter"
    v-model:filters="filters"
    :city-options="cityOptions"
    :subject-options="subjectOptions"
    :education-level-options="educationLevelOptions"
    :experience-options="experienceOptions"
    @close="showFilter = false; applyFilters()"
    @reset="resetFilters()"
    @apply="showFilter = false; applyFilters()"
/>

</template>

<script setup>
definePageMeta({
	middleware: [
		() => {
		useLayoutStore().setHiddenFooter(true)
		}
	]
})
import { onMounted } from 'vue';

const route = useRoute();
const configStore = useConfigStore();
const { api } = useApi();

// Filter data
const filters = ref({
    provinces_id: route.query.city ?? "",
    subject: route.query.subject ?? "",
    educationLevel: route.query.level ?? "",
    experience: route.query.experience ?? "",
    minPrice: route.query.minPrice ? parseInt(route.query.minPrice) : 50000,
    maxPrice: route.query.maxPrice ? parseInt(route.query.maxPrice) : 1000000,
    rating: 0,
    sort: route.query.sort ?? ""
});

// Search state
const showFilter = ref(false);
const currentPage = ref(parseInt(route.query.page) || 1);
const hasSearched = ref(false);

// Fetch data trên server bằng useAsyncData
const { data: searchData, pending: isLoading, refresh: refreshSearch } = await useAsyncData(
    () => `search-tutors-${route.fullPath}`,
    async () => {
        const params = {
            page: parseInt(route.query.page) || 1
        };

        if (route.query.city) params.provinces_id = route.query.city;
        if (route.query.subject) params.subject_id = route.query.subject;
        if (route.query.level) params.education_level_id = route.query.level;
        if (route.query.experience) params.experience = route.query.experience;
        if (route.query.minPrice) params.min_price = route.query.minPrice;
        if (route.query.maxPrice) params.max_price = route.query.maxPrice;
        if (route.query.sort) params.sort = route.query.sort;

        try {
            const response = await api.apiGet('tutors', params);
            return {
                tutors: response.data || [],
                paginate: response?.meta || {}
            };
        } catch (error) {
            console.error('Error fetching tutors:', error);
            return {
                tutors: [],
                paginate: {}
            };
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

// Split tutors into featured and regular (only on first page)
const featuredTutors = computed(() => {
    if (currentPage.value === 1 && tutors.value.length > 0) {
        return tutors.value.slice(0, 2);
    }
    return [];
});

const regularTutors = computed(() => {
    if (currentPage.value === 1 && tutors.value.length > 0) {
        return tutors.value.slice(0, 2);
    }
    return tutors.value;
});

// Options for filters
const subjectOptions = computed(() => configStore.configuration?.subjects || []);
const educationLevelOptions = computed(() => configStore.configuration?.education_levels || []);
const experienceOptions = computed(() => configStore.configuration?.experience_action || []);
const cityOptions = computed(() => configStore.configuration?.provinces || []);

// Get selected subject for meta tags
const selectedSubject = computed(() => {
    if (!filters.value.subject) return null;
    const subjects = configStore.configuration?.subjects || [];
    return subjects.find(s => s.id == filters.value.subject);
});

// Meta tags for search page
const metaTitle = computed(() => {
    if (selectedSubject.value) {
        return `Tìm một gia sư ${selectedSubject.value.name} trực tuyến để giúp bạn học`;
    }
    return 'Tìm gia sư phù hợp với bạn';
});

const metaDescription = computed(() => {
    if (selectedSubject.value) {
        return `Tìm gia sư ${selectedSubject.value.name} trực tuyến chất lượng cao. Học ${selectedSubject.value.name} hiệu quả với giáo viên giàu kinh nghiệm, phương pháp dạy hiện đại, linh hoạt thời gian học tập.`;
    }
    return 'Khám phá đội ngũ gia sư chất lượng cao của chúng tôi và tìm người phù hợp nhất với nhu cầu học tập của bạn';
});

const config = useRuntimeConfig()
const metaUrl = computed(() => {
    const baseUrl = config.public.baseUrl || (process.client ? window.location.origin : '')
    const queryString = new URLSearchParams(route.query).toString()
    return `${baseUrl}/search${queryString ? `?${queryString}` : ''}`
});

// Use useSeoMeta for better SEO
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

// Canonical link
useHead({
    link: [
        {
            rel: 'canonical',
            href: metaUrl
        }
    ]
});

const changePage = async (page) => {
    currentPage.value = page;
    hasSearched.value = true;
    
    // Update query params
    const query = { ...route.query, page: page.toString() };
    await navigateTo({ path: route.path, query });
    
    // Refresh search data
    await refreshSearch();
}


const handleRedirectToBooking = (uid) => {
    navigateTo(`/booking/${uid}`);
};

const handleNavigateToTutor = (uid) => {
    navigateTo(`/tutor/${uid}`);
};


const isUpdatingFromRoute = ref(false);

watch(() => route.query, (newQuery) => {
    isUpdatingFromRoute.value = true;

    if (newQuery.city != filters.value.provinces_id) filters.value.provinces_id = newQuery.city || "";
    if (newQuery.subject != filters.value.subject) filters.value.subject = newQuery.subject || "";
    if (newQuery.level != filters.value.educationLevel) filters.value.educationLevel = newQuery.level || "";
    if (newQuery.experience != filters.value.experience) filters.value.experience = newQuery.experience || "";
    if (newQuery.page) currentPage.value = parseInt(newQuery.page) || 1;
    
    const newMinPrice = newQuery.minPrice ? parseInt(newQuery.minPrice) : 50000;
    const newMaxPrice = newQuery.maxPrice ? parseInt(newQuery.maxPrice) : 1000000;
    
    if (newMinPrice != filters.value.minPrice) filters.value.minPrice = newMinPrice;
    if (newMaxPrice != filters.value.maxPrice) filters.value.maxPrice = newMaxPrice;
    
    if (newQuery.sort != filters.value.sort) filters.value.sort = newQuery.sort || "";

    nextTick(() => {
        isUpdatingFromRoute.value = false;
    });
});

const applyFilters = async () => {
    const query = { ...route.query };
    delete query.page; // Reset to page 1 when filters change
    
    if (filters.value.provinces_id) query.city = filters.value.provinces_id;
    else delete query.city;
    
    if (filters.value.subject) query.subject = filters.value.subject;
    else delete query.subject;
    
    if (filters.value.educationLevel) query.level = filters.value.educationLevel;
    else delete query.level;
    
    if (filters.value.experience) query.experience = filters.value.experience;
    else delete query.experience;
    
    if (filters.value.minPrice !== undefined && filters.value.minPrice !== 50000) query.minPrice = filters.value.minPrice;
    else delete query.minPrice;

    if (filters.value.maxPrice !== undefined && filters.value.maxPrice !== 1000000) query.maxPrice = filters.value.maxPrice;
    else delete query.maxPrice;

    if (filters.value.sort) query.sort = filters.value.sort;
    else delete query.sort;
    
    if (JSON.stringify(query) === JSON.stringify(route.query)) {
        return;
    }
    
    await navigateTo({ path: route.path, query });
}

const resetFilters = () => {
    filters.value = {
        provinces_id: "",
        subject: "",
        educationLevel: "",
        experience: "",
        minPrice: 50000,
        maxPrice: 1000000,
        rating: 0,
        sort: ""
    };
}

watch(filters, async () => {
    if (isUpdatingFromRoute.value) return;

    // Don't trigger search if filter modal is open
    if (showFilter.value) return;
    
    await applyFilters();
}, { deep: true });

// Initialize filters from query params
if (route.query.city) filters.value.provinces_id = route.query.city;
if (route.query.subject) filters.value.subject = route.query.subject;
if (route.query.level) filters.value.educationLevel = route.query.level;
if (route.query.experience) filters.value.experience = route.query.experience;
if (route.query.page) currentPage.value = parseInt(route.query.page) || 1;
if (route.query.minPrice) filters.value.minPrice = parseInt(route.query.minPrice);
if (route.query.maxPrice) filters.value.maxPrice = parseInt(route.query.maxPrice);
if (route.query.sort) filters.value.sort = route.query.sort;

// Dropdown Logic
const activeDropdown = ref(null);

const toggleDropdown = (name) => {
    if (activeDropdown.value === name) {
        activeDropdown.value = null;
    } else {
        activeDropdown.value = name;
    }
};

const selectCity = (id) => {
    filters.value.provinces_id = id;
    activeDropdown.value = null;
};

const selectSubject = (id) => {
    filters.value.subject = id;
    activeDropdown.value = null;
};

const selectLevel = (id) => {
    filters.value.educationLevel = id;
    activeDropdown.value = null;
};

const getCityName = (id) => {
    if (!id) return '';
    return cityOptions.value.find(c => c.id == id)?.name || '';
};

const getSubjectName = (id) => {
    if (!id) return '';
    return subjectOptions.value.find(s => s.id == id)?.name || '';
};

const getLevelName = (id) => {
    if (!id) return '';
    return educationLevelOptions.value.find(l => l.id == id)?.name || '';
};

const getExperienceName = (id) => {
    if (!id) return '';
    return experienceOptions.value.find(e => e.id == id)?.name || '';
};

const selectExperience = (id) => {
    filters.value.experience = id;
    activeDropdown.value = null;
};
// Mark initialization as complete after a tick
nextTick(() => {
    // Close dropdowns when clicking outside
    window.addEventListener('click', () => {
        activeDropdown.value = null;
    });
});

// Sliding Highlight Logic
const highlightStyle = ref({ opacity: 0 });
const itemRefs = ref({});
const searchBarRef = ref(null);

const setItemRef = (el, key) => {
    if (el) itemRefs.value[key] = el;
};

const updateHighlight = () => {
    if (!activeDropdown.value || !itemRefs.value[activeDropdown.value] || !searchBarRef.value) {
		console.log('thành')
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

watch(activeDropdown, () => {
    nextTick(() => updateHighlight());
});
</script>

<style scoped>
@import url('~/assets/css/tutorCard.css');
@import url('~/assets/css/search-bar.css');
@import url('~/assets/css/search-page.css');
</style>

