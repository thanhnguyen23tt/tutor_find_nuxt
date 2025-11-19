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

        <div class="all-filter filter-desktop">
            <!-- Basic Filters (Always visible) -->
            <div class="filter-row filter-row-flex align-end">
                <div class="filter-group">
                    <label class="filter-label filter-label-bold">
                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        <span>Vị trí & Học vấn & Môn học</span>
                    </label>
                    <div class="filter-row-flex filter-row_wrapper">
                        <div class="filter-group">
                            <base-select v-model="filters.provinces_id" :options="cityOptions" label="Thành phố" placeholder="Tất cả" widthFull="true">
                                <template #icon>
                                    <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </template>
                            </base-select>
                        </div>
                        <div class="filter-group">
                            <base-select v-model="filters.subject" :options="subjectOptions" label="Môn học" placeholder="Tất cả" widthFull="true">
                                <template #icon>
                                    <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </template>
                            </base-select>
                        </div>
                        <div class="filter-group">
                            <base-select v-model="filters.educationLevel" :options="educationLevelOptions" label="Cấp độ" placeholder="Tất cả" widthFull="true">
                                <template #icon>
                                    <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                    </svg>
                                </template>
                            </base-select>
                        </div>
                        <div class="filter-group">
                            <base-select v-model="filters.experience" :options="experienceOptions" label="Kinh nghiệm" placeholder="Tất cả" widthFull="true">
                                <template #icon>
                                    <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </template>
                            </base-select>
                        </div>
                        <button class="btn-filter-toggle" @click="showAdvancedFilters = !showAdvancedFilters">
                            <svg v-if="!showAdvancedFilters" class="icon-md" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="16"></line>
                                <line x1="8" y1="12" x2="16" y2="12"></line>
                            </svg>
                            <svg v-else class="icon-md" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="8" y1="12" x2="16" y2="12"></line>
                            </svg>
                            <span>{{ showAdvancedFilters ? 'Thu gọn' : 'Mở rộng' }}</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Advanced Filters (Collapsible) -->
            <transition name="expand">
                <div v-if="showAdvancedFilters" class="advanced-filters">
                    <div class="separation"></div>

                    <div class="filter-row filter-row-flex align-end">
                        <div class="filter-group filter-group-flex2">
                            <label class="filter-label filter-label-bold">
                                <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                <span>Đánh giá & Mức giá</span>
                            </label>
                            <div class="filter-row-flex filter-row_wrapper">
                                <div class="slider-block">
                                    <div class="slider-info">Đánh giá tối thiểu: {{ filters.rating }} sao</div>
                                    <div class="custom-slider-wrapper">
                                        <input type="range" min="0" max="5" step="0.5" v-model.number="filters.rating" class="custom-slider" />
                                        <div class="slider-labels">
                                            <span>0 sao</span>
                                            <span>2.5 sao</span>
                                            <span>5 sao</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="slider-block">
                                    <div class="slider-info">Mức giá tối đa: {{ formatCurrency(filters.price) }} / giờ</div>
                                    <div class="custom-slider-wrapper">
                                        <input type="range" min="100000" max="500000" step="10000" v-model.number="filters.price" class="custom-slider" />
                                        <div class="slider-labels">
                                            <span>100k</span>
                                            <span>300k</span>
                                            <span>500k</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
        </div>

        <div class="all-filter filter-mobile">
            <div class="filter-row filter-row-flex align-end">
                <div class="filter-group filter-group-flex2">
                    <!-- <label class="filter-label filter-label-bold">
                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                        <span>Học vấn & Môn học</span>
                    </label> -->
                    <div class="filter-row-flex filter-row_wrapper">
                        <div class="filter-group d-flex align-end gap-g-1">
                            <base-select v-model="filters.subject" :options="subjectOptions" placeholder="Tất cả môn học" size="large" widthFull="true">
                                <template #icon>
                                    <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </template>
                            </base-select>
                            <button class="btn-lg btn-secondary" @click="showFilter = true">
                                <svg class="icon-lg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M4 7H20" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M7 12L17 12" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M11 17H13" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Search Results -->
        <div class="search-results" v-if="tutors.length > 0">

            <div class="tutors-grid">
                <TutorCard
                    v-for="tutor in tutors"
                    :key="tutor.uid"
                    :tutor="tutor"
                    @toggle-save="handleToggleSave"
                    @navigate-to-tutor="handleNavigateToTutor"
                    @redirect-to-booking="handleRedirectToBooking"
                />
            </div>
        </div>

        <base-pagination :meta="dataPaginate" :current-page="currentPage" @changePage="changePage"></base-pagination>
    </div>
</div>

<base-modal title="Bộ lọc" :is-open="showFilter" @close="showFilter = false">
    <div class="modal-content">
        <div class="all-filter filter-modal">
            <div class="filter-row filter-row-flex align-end">
                <div class="filter-group">
                    <label class="filter-label filter-label-bold">
                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        <span>Vị trí & Học vấn & Môn họ</span>
                    </label>
                    <div class="filter-row-flex filter-row_wrapper">
                        <div class="filter-group">
                            <base-select v-model="filters.provinces_id" :options="cityOptions" label="Thành phố" placeholder="Tất cả" widthFull="true">
                                <template #icon>
                                    <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </template>
                            </base-select>
                        </div>
                        <div class="filter-group">
                            <base-select v-model="filters.subject" :options="subjectOptions" label="Môn học" placeholder="Tất cả" widthFull="true">
                                <template #icon>
                                    <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </template>
                            </base-select>
                        </div>
                        <div class="filter-group">
                            <base-select v-model="filters.educationLevel" :options="educationLevelOptions" label="Cấp độ" placeholder="Tất cả" widthFull="true">
                                <template #icon>
                                    <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                    </svg>
                                </template>
                            </base-select>
                        </div>
                        <div class="filter-group">
                            <base-select v-model="filters.experience" :options="experienceOptions" label="Kinh nghiệm" placeholder="Tất cả" widthFull="true">
                                <template #icon>
                                    <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </template>
                            </base-select>
                        </div>
                    </div>
                </div>
            </div>

            <div class="separation"></div>

            <div class="filter-row filter-row-flex align-end">
                <div class="filter-group filter-group-flex2">
                    <label class="filter-label filter-label-bold">
                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                        <span>Đánh giá & Mức giá</span>
                    </label>
                    <div class="filter-row-flex filter-row_wrapper">
                        <div class="slider-block">
                            <div class="slider-info">Đánh giá tối thiểu: {{ filters.rating }} sao</div>
                            <div class="custom-slider-wrapper">
                                <input type="range" min="0" max="5" step="0.5" v-model.number="filters.rating" class="custom-slider" />
                                <div class="slider-labels">
                                    <span>0 sao</span>
                                    <span>2.5 sao</span>
                                    <span>5 sao</span>
                                </div>
                            </div>
                        </div>
                        <div class="slider-block">
                            <div class="slider-info">Mức giá tối đa: {{ formatCurrency(filters.price) }} / giờ</div>
                            <div class="custom-slider-wrapper">
                                <input type="range" min="100000" max="500000" step="10000" v-model.number="filters.price" class="custom-slider" />
                                <div class="slider-labels">
                                    <span>100k</span>
                                    <span>300k</span>
                                    <span>500k</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="modal-footer">
            <button class="btn-lg btn-primary w-100" @click="showFilter = false">
                <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
                Hiển thị kết quả
            </button>
        </div>
    </div>
</base-modal>

</template>

<script setup>
definePageMeta({
	middleware: 'auth',
});

const router = useRouter();
const route = useRoute();
const configStore = useConfigStore();
const { api } = useApi();
const { formatCurrency } = useHelper();

// Filter data
const filters = ref({
    provinces_id: route.query.city ?? "",
    subject: route.query.subject ?? "",
    educationLevel: route.query.level ?? "",
    experience: route.query.experience ?? "",
    rating: 0,
    price: 500000,
});

// Search state
const showFilter = ref(false);
const showAdvancedFilters = ref(false);
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

        try {
            const response = await api.apiGet('tutors', params);
            return {
                tutors: response?.data || [],
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

// Options for filters
const subjectOptions = computed(() => {
    const subjects = configStore.configuration?.subjects || [];
    return subjects.map(subject => ({
        id: subject.id,
        name: subject.name
    }));
});

const educationLevelOptions = computed(() => {
    const levels = configStore.configuration?.education_levels || [];
    return levels.map(level => ({
        id: level.id,
        name: level.name
    }));
});

const experienceOptions = computed(() => {
    const experiences = configStore.configuration?.experience_action || [];

    return Object.entries(experiences).map(([key, value]) => ({
        id: key,
        name: value
    }));
});

const cityOptions = computed(() => {
    const provinces = configStore.configuration?.provinces || [];
    return provinces.map(p => ({ id: p.id, name: p.name }));
});

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

const handleToggleSave = (uid) => {
    // Handle toggle save
};

const handleNavigateToTutor = (uid) => {
    navigateTo(`/tutor/${uid}`);
};

// Update filters from query params
watch(() => route.query, (newQuery) => {
    if (newQuery.city) filters.value.provinces_id = newQuery.city;
    if (newQuery.subject) filters.value.subject = newQuery.subject;
    if (newQuery.level) filters.value.educationLevel = newQuery.level;
    if (newQuery.experience) filters.value.experience = newQuery.experience;
    if (newQuery.page) currentPage.value = parseInt(newQuery.page) || 1;
});

// Watch filters and update query params (only on user interaction)
let isInitializing = true;

watch(filters, async () => {
    if (isInitializing) {
        isInitializing = false;
        return;
    }
    
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
    
    await navigateTo({ path: route.path, query });
    await refreshSearch();
}, { deep: true });

// Initialize filters from query params
if (route.query.city) filters.value.provinces_id = route.query.city;
if (route.query.subject) filters.value.subject = route.query.subject;
if (route.query.level) filters.value.educationLevel = route.query.level;
if (route.query.experience) filters.value.experience = route.query.experience;
if (route.query.page) currentPage.value = parseInt(route.query.page) || 1;

// Mark initialization as complete after a tick
nextTick(() => {
    isInitializing = false;
});
</script>

<style scoped>
@import url('~/assets/css/tutorCard.css');

.search-page {
    padding: 2rem 0;
    background: var(--gray-50);
    position: relative;
    min-height: 100vh;
}

.search-page::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 25% 25%, rgba(7, 27, 102, 0.03) 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, rgba(7, 27, 102, 0.02) 0%, transparent 50%);
    pointer-events: none;
}

.search-page .container {
    display: grid;
    gap: 1rem;
    position: relative;
}

.header-wrapper {
    text-align: center;
    margin-bottom: 2.5rem;
    position: relative;
}

.header-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: linear-gradient(135deg, rgba(7, 27, 102, 0.1) 0%, rgba(7, 27, 102, 0.05) 100%);
    border: 1px solid rgba(7, 27, 102, 0.1);
    border-radius: 50px;
    font-size: var(--font-size-small);
    font-weight: 600;
    color: var(--color-primary);
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 12px rgba(7, 27, 102, 0.1);
    margin-bottom: 1.5rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.header-badge:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(7, 27, 102, 0.15);
}

.search-page .title {
    font-size: var(--font-size-heading-2);
    font-weight: 800;
    margin: 0 0 1rem 0;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.search-page .sub-title {
    font-size: var(--font-size-base);
    color: #64748b;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
}

.all-filter {
    display: grid;
    border-radius: 2rem;
    margin-bottom: 1.5rem;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%);
    border: 1px solid rgba(255, 255, 255, 0.4);
    padding: 2.7rem;
    box-shadow:
        0 25px 50px rgba(0, 0, 0, 0.08),
        0 12px 24px rgba(0, 0, 0, 0.04),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(25px) saturate(180%);
    -webkit-backdrop-filter: blur(25px) saturate(180%);
    position: relative;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.all-filter:not(.filter-modal):hover {
    transform: translateY(-2px);
    box-shadow:
        0 32px 64px rgba(0, 0, 0, 0.12),
        0 16px 32px rgba(0, 0, 0, 0.06),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.all-filter:not(.filter-modal)::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    border-radius: 28px 28px 0 0;
}

.all-filter:not(.filter-modal)::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background:
        radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.03) 0%, transparent 50%);
    pointer-events: none;
    animation: float 8s ease-in-out infinite;
}

/* Enhanced form group interactions */
.all-filter .filter-group {
    transition: all 0.3s ease;
}

.all-filter .filter-group:hover {
    transform: translateY(-1px);
}

.all-filter .filter-group:focus-within {
    transform: translateY(-2px);
}

/* Enhanced button styles */
.all-filter button {
    position: relative;
    border-radius: 12px;
    font-weight: 600;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.all-filter button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
}

.all-filter button:hover::before {
    left: 100%;
}

.filter-mobile {
    display: none;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 20px;
    padding: 1.5rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.04);
    backdrop-filter: blur(10px);
    position: relative;
    overflow: hidden;
    margin-bottom: 2rem;
}

.filter-mobile::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    border-radius: 20px 20px 0 0;
}

.filter-row-flex {
    align-items: end;
}

.filter-row-group {
    display: flex;
    justify-content: space-between;
}

.filter-row-group > .filter-row {
    display: flex;
    gap: 1rem;
}

.filter-row {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    position: relative;
}

.filter-group {
    display: grid;
    width: 100%;
    position: relative;
}

.filter-label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.75rem;
    font-size: 15px;
    position: relative;
}

/* .filter-label::before {
    content: '';
    width: 4px;
    height: 4px;
    background: var(--color-primary);
    border-radius: 50%;
    flex-shrink: 0;
} */

.separation {
    height: 2px;
    background: linear-gradient(90deg, transparent 0%, rgba(229, 231, 235, 0.5) 20%, rgba(229, 231, 235, 0.8) 50%, rgba(229, 231, 235, 0.5) 80%, transparent 100%);
    margin: 1.5rem 0;
    position: relative;
}

.separation::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60px;
    height: 2px;
    background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    border-radius: 1px;
}

.filter-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 1.5rem;
    border-top: 1px solid var(--gray-200);
}

/* Enhanced Search Results */
.search-results {
    position: relative;
}

.results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding: 1.3rem 1.8rem;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.results-title {
    font-size: var(--font-size-medium);
    font-weight: 600;
    color: #1f2937;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
}

.results-title::before {
    content: '🎯';
    font-size: 1.2rem;
}

.sort-options {
    min-width: 200px;
}

.custom-slider-wrapper {
    width: 100%;
    position: relative;
}

.custom-slider {
    width: 100%;
    appearance: none;
    height: 8px;
    background: linear-gradient(90deg, #e5e7eb 0%, #d1d5db 100%);
    outline: none;
    border-radius: 6px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    margin-bottom: 0.75rem;
    position: relative;
    cursor: pointer;
}

.custom-slider::-webkit-slider-thumb {
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    cursor: pointer;
    border: 3px solid #fff;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3), 0 2px 6px rgba(0, 0, 0, 0.1);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.custom-slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4), 0 4px 8px rgba(0, 0, 0, 0.15);
}

.custom-slider::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    cursor: pointer;
    border: 3px solid #fff;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3), 0 2px 6px rgba(0, 0, 0, 0.1);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.custom-slider::-moz-range-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4), 0 4px 8px rgba(0, 0, 0, 0.15);
}

.custom-slider::-ms-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    cursor: pointer;
    border: 3px solid #fff;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3), 0 2px 6px rgba(0, 0, 0, 0.1);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.custom-slider:focus {
    outline: none;
    background: linear-gradient(90deg, #d1d5db 0%, #9ca3af 100%);
}

.custom-slider:focus::-webkit-slider-thumb {
    transform: scale(1.15);
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.5), 0 4px 10px rgba(0, 0, 0, 0.2);
}

.slider-labels {
    display: flex;
    justify-content: space-between;
    font-size: var(--font-size-mini);
    color: #6b7280;
    margin-top: 0.25rem;
    font-weight: 500;
}

.filter-label-bold {
    margin-bottom: 0.5rem;
    font-weight: 600;
}
.filter-group-flex2 {
    flex: 2;
}
.slider-block {
    flex: 1;
    padding: 1.5rem;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.8) 100%);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    /* box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08); */
    border-color: rgba(99, 102, 241, 0.2);
}

.slider-block:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
    border-color: rgba(99, 102, 241, 0.2);
}

.slider-block::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    border-radius: 16px 16px 0 0;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.slider-block:hover::before {
    opacity: 1;
}

.slider-info {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.slider-info::before {
    content: '🎯';
    font-size: 1.1rem;
}

.tutor-actions {
    display: flex;
    gap: 0.75rem;
}

@media (max-width: 1024px) {
	.filter-row {
        grid-template-columns: 1fr;
    }

    .filter-row_wrapper {
        display: grid;
        grid-template-columns: 2fr;
    }

    .all-filter {
        padding: 2.5rem;
        border-radius: 24px;
    }

	.filter-modal {
		padding: 0;
		box-shadow: none;
		border: none;
		border-radius: 0;
	}

	.header-wrapper {
		margin-bottom: 1rem;
	}

    .filter-desktop {
        display: none;
    }

    .filter-mobile {
        display: block;
    }

    .slider-block {
        padding: 1.25rem;
    }
}

@media (max-width: 640px) {
    .tutors-section {
        padding: 1rem;
    }

    .tutor-actions {
        flex-direction: column;
    }	

    .filter-row {
        grid-template-columns: 1fr;
    }

    .filter-row_wrapper {
        display: grid;
        grid-template-columns: 2fr;
    }

    .filter-desktop {
        display: none;
    }

    .filter-mobile {
        display: block;
        padding: 1.25rem;
        border-radius: 16px;
    }

    .slider-block {
        padding: 1rem;
    }

    .slider-info {
        font-size: 14px;
    }
}

/* Enhanced animations and effects */
@keyframes float {
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-10px);
    }
}

@keyframes shimmer {
    0% {
        background-position: -200% 0;
    }
    100% {
        background-position: 200% 0;
    }
}

/* Filter Toggle Button */
.filter-toggle-wrapper {
    display: flex;
    justify-content: center;
    margin: 1.5rem 0;
}

.btn-filter-toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.725rem 1.8rem;
    height: 3.5rem;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%);
    border: 1.5px solid rgba(99, 102, 241, 0.2);
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    color: var(--color-primary);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    white-space: nowrap;
}

.btn-filter-toggle::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.1), transparent);
    transition: left 0.5s;
}

.btn-filter-toggle:hover {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%);
    border-color: rgba(99, 102, 241, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.15);
}

.btn-filter-toggle:hover::before {
    left: 100%;
}

.btn-filter-toggle:active {
    transform: translateY(0);
}

.btn-filter-toggle svg {
    transition: transform 0.3s ease;
}

.btn-filter-toggle:hover svg {
    transform: rotate(90deg);
}

/* Advanced Filters Section */
.advanced-filters {
    animation: slideDown 0.4s ease-out;
}

/* Expand Transition */
.expand-enter-active,
.expand-leave-active {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
    max-height: 0;
    opacity: 0;
    transform: translateY(-20px);
}

.expand-enter-to,
.expand-leave-from {
    max-height: 1000px;
    opacity: 1;
    transform: translateY(0);
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Mobile responsive for toggle button */
@media (max-width: 640px) {
    .btn-filter-toggle {
        padding: 0.75rem 1.5rem;
        font-size: 14px;
        gap: 0.5rem;
    }

    .filter-toggle-wrapper {
        margin: 1rem 0;
    }
}
</style>
