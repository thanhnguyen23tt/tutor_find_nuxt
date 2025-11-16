<template>
<!-- Loading overlay -->
<base-loading v-if="isLoading" />

<div class="home-container" v-if="!isLoading">
    <!-- Hero Section -->
    <section class="hero-section">
        <div class="container">
            <div class="hero-content">
                <!-- Left Content -->
                <div class="hero-left">
                    <div class="hero-badge">
                        Nền tảng gia sư hàng đầu
                    </div>
                    <h1 class="hero-title">
                        Học tập hiệu quả cùng gia sư chất lượng
                    </h1>
                    <p class="hero-description">
                        Kết nối với những gia sư xuất sắc nhất để nâng cao kiến thức và đạt được mục tiêu học tập của bạn.
                    </p>
                    <div class="hero-buttons">
                        <button class="btn-lg btn-primary" @click="goToSearch">
                            Tìm gia sư ngay
                            <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                        <button class="btn-lg btn-secondary" @click="goToBecomeTutor">
                            Tìm hiểu thêm
                        </button>
                    </div>

                    <!-- Stats -->
                    <div class="hero-stats">
                        <div class="stat-item">
                            <div class="stat-number">500+</div>
                            <div class="stat-label">Gia sư chất lượng</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">10k+</div>
                            <div class="stat-label">Học sinh tin tưởng</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">98%</div>
                            <div class="stat-label">Đánh giá tích cực</div>
                        </div>
                    </div>
                </div>

                <!-- Right Content -->
                <div class="hero-right">
                    <div class="hero-image">
                        <!-- <img src="/images/banner.webp" alt=""> -->

                        <!-- Floating Card - Online Tutors -->
                        <div class="floating-card tutor-card">
                            <div class="avatar-group">
                                <svg class="icon-md" viewBox="0 0 24 24" fill="none"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                            </div>
                            <div class="tutor-info">
                                <div class="tutor-title">1000+ Gia sư</div>
                            </div>
                        </div>

                        <!-- Floating Card - Results -->
                        <div class="floating-card result-card">
                            <!-- <div class="result-icon">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div> -->
                            <div class="result-info">
                                <div class="result-title">
                                    <div class="result-icon">
                                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                                    </div>
                                    <span>Kết quả thực tế</span>
                                </div>
                                <div class="result-stats">
                                    <div>Điểm số tăng</div>
                                    <div>Tự tin học tập hơn</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <div>
        <!-- Search Section -->
        <section class="search-section">
            <div class="container">
                <div class="search-title-wrapper">
                    <div class="search-badge">Đội ngũ chuyên nghiệp</div>
                    <h2 class="search-title">Tìm gia sư phù hợp với bạn</h2>
                    <p class="search-description">
                        Khám phá đội ngũ gia sư chất lượng cao của chúng tôi và tìm người phù hợp nhất với nhu cầu học tập của bạn
                    </p>
                </div>

                <!-- Desktop Search Form -->
                <div class="search-form desktop-search">
                    <div class="search-row">
                        <div class="form-group">
                            <base-select
                                v-model="selectedCity"
                                :options="cities"
                                placeholder="Tất cả thành phố"
                                custom-class="form-control-md"
                                label="Thành phố"
                            >
                                <template #icon>
                                    <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </template>
                            </base-select>
                        </div>
                        <div class="form-group">
                            <base-select
                                v-model="selectedSubject"
                                :options="subjects"
                                placeholder="Tất cả môn học"
                                custom-class="form-control-md"
                                label="Môn học"
                            >
                                <template #icon>
                                    <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </template>
                            </base-select>
                        </div>

                        <div class="form-group">
                            <base-select
                                v-model="selectedLevel"
                                :options="levels"
                                placeholder="Tất cả cấp độ"
                                custom-class="form-control-md"
                                label="Cấp độ"
                            >
                                <template #icon>
                                    <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                    </svg>
                                </template>
                            </base-select>
                        </div>
                    </div>

                    <div class="search-filters">
                        <div class="filter-right">
                            <base-select
                                v-model="selectedExperience"
                                :options="experiences"
                                placeholder="Tất cả kinh nghiệm"
                                custom-class="form-control-md"
                                label="Kinh nghiệm"
                            >
                                <template #icon>
                                    <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </template>
                            </base-select>
                        </div>
                        <button class="btn-lg btn-primary" @click="handleSearch">
                            <div class="relative">
                                <svg xmlns="http://www.w3.org/2000/svg" class="icon-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 21-4.34-4.34"></path><circle cx="11" cy="11" r="8"></circle></svg>
                            </div>
                            <span>Tìm kiếm</span>
                        </button>
                    </div>
                </div>

                <!-- Mobile Search Form -->
                <div class="search-form mobile-search">
                    <div class="mobile-search-main">
                        <div class="form-group">
                            <base-select
                                v-model="selectedSubject"
                                :options="subjects"
                                placeholder="Tất cả môn học"
                                custom-class="form-control-md"
                                label="Môn học"
                            >
                                <template #icon>
                                    <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </template>
                            </base-select>
                        </div>
                    </div>

                    <div class="mobile-search-actions">
                        <button class="btn-lg btn-primary w-100" @click="handleSearch">
                            <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.35-4.35"></path>
                            </svg>
                            Tìm kiếm
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- Featured Tutors Section -->
        <section class="tutors-section">
            <div class="container">
                <!-- <div class="stars-suffix">
                    <span>Learning made fun: 35,857 English tutors for kids</span>
                </div> -->
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
        </section>
    </div>

    <!-- <section class="why-choose-us-section">
        <WhyChooseUsSection />
    </section> -->

    <!-- Student Reviews Section -->
    <section class="reviews-section">
        <div class="container">
            <div class="reviews-section-badge">
                <span>Đánh giá từ khách hàng</span>
            </div>
            <h2 class="reviews-section-title">Phụ huynh và học sinh nói gì về chúng tôi</h2>
            <p class="reviews-section-description">
                Những đánh giá chân thực từ phụ huynh và học sinh đã sử dụng dịch vụ của chúng tôi
            </p>

            <div class="reviews-grid">
                <div v-for="review in reviews" :key="review.id" class="review-card">
                    <div class="rating">
                        <span v-for="star in review.rating" :key="star" class="star">★</span>
                    </div>
                    <p class="review-text">
                        "{{ review.comment }}"
                    </p>
                    <div class="reviewer-info">
                        <div class="reviewer-avatar">
                            <div class="avatar-text">{{ getFirstCharacterOfLastName(review.reviewer.full_name) }}</div>
                        </div>
                        <div class="reviewer-details">
                            <h4 class="reviewer-name">{{ review.reviewer.full_name }}</h4>
                            <p class="reviewer-title">Học viên TutorFind</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="register-section">
        <div class="register-bg-circle circle-1"></div>
        <div class="register-bg-circle circle-2"></div>
        <div class="container">
            <div class="register-content">
                <div class="left-content">
                    <div class="section-badge">Bắt đầu ngay hôm nay</div>
                    <h2 class="section-title">Bắt đầu hành trình học tập của bạn ngay hôm nay</h2>
                    <p class="section-description">
                        Đăng ký ngay để được tư vấn miễn phí và tìm gia sư phù hợp với nhu cầu của bạn
                    </p>
                    <div class="features">
                        <div class="feature-item">
                            <span class="feature-label">24/7</span>
                            <span class="feature-text">Hỗ trợ</span>
                        </div>
                        <div class="feature-item">
                            <span class="feature-label">100%</span>
                            <span class="feature-text">Đảm bảo</span>
                        </div>
                        <div class="feature-item">
                            <span class="feature-label">Sử dụng</span>
                            <span class="feature-text">Miễn phí</span>
                        </div>
                    </div>
                    <button class="btn-lg btn-white">Đăng ký ngay</button>
                </div>
                <div class="right-content">
                    <div class="register-form">
                        <h3 class="form-title">Đăng ký nhận tư vấn miễn phí</h3>
                        <form @submit.prevent="handleSubmit">
                            <div class="form-group">
                                <input type="text" placeholder="Nhập họ và tên của bạn" v-model="form.name" required>
                            </div>
                            <div class="form-group">
                                <input type="tel" placeholder="Nhập số điện thoại của bạn" v-model="form.phone" required>
                            </div>
                            <div class="form-group">
                                <input type="email" placeholder="Nhập email của bạn" v-model="form.email" required>
                            </div>
                            <div class="form-group">
                                <input type="text" placeholder="Ví dụ: Toán, Tiếng Anh, Vật lý..." v-model="form.subjects" required>
                            </div>
                            <div class="form-group">
                                <button type="submit" class="btn-lg btn-white">Gửi thông tin</button>
                            </div>
                            <div class="form-terms">
                                Bằng cách gửi thông tin, bạn đồng ý với <a href="/terms" class="link">Điều khoản dịch vụ</a> và <a href="/privacy" class="link">Chính sách bảo mật</a> của chúng tôi.
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Become Teacher Section -->
    <section class="become-teacher-section">
        <div class="become-teacher-container container">
            <div class="become-teacher-image">
                <img src="/images/banner/become-teacher-3.jpg" alt="Become a teacher">
            </div>

            <div class="become-teacher-content">
                <div class="content-badge">
                    <svg class="icon-sm" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span>Cơ hội nghề nghiệp</span>
                </div>

                <h2 class="become-teacher-title">Bạn cũng có thể trở thành gia sư tuyệt vời!</h2>
                <p class="become-teacher-description">
                    Chia sẻ kiến thức của bạn, sống với đam mê và trở thành chủ của chính mình
                </p>

                <!-- Features List -->
                <div class="teacher-features">
                    <div class="feature-point">
                        <div class="feature-icon">
                            <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <span>Thu nhập hấp dẫn</span>
                    </div>
                    <div class="feature-point">
                        <div class="feature-icon">
                            <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <span>Lịch dạy linh động</span>
                    </div>
                    <div class="feature-point">
                        <div class="feature-icon">
                            <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <span>Hỗ trợ chuyên nghiệp</span>
                    </div>
                    <div class="feature-point">
                        <div class="feature-icon">
                            <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <span>Phát triển sự nghiệp</span>
                    </div>
                </div>

                <button class="btn-xl btn-black w-100 border-r-2" @click="goToBecomeTutor">
                    <span>Tìm hiểu thêm</span>
                    <svg class="icon-xl" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                </button>
            </div>
        </div>
    </section>
</div>
</template>

<script setup>

definePageMeta({
  layout: 'default',
  middleware: 'auth',
});

const configStore = useConfigStore();
const { api } = useApi();
const { getFirstCharacterOfLastName } = useHelper();
const config = useRuntimeConfig();

const selectedCity = ref(null);
const selectedSubject = ref(null);
const selectedLevel = ref(null);
const selectedExperience = ref(null);

// Fetch data trên server bằng useAsyncData
const { data: homeData, pending: isLoading } = await useAsyncData(
    'home-data',
    async () => {
        try {
            const [tutorsResponse, reviewsResponse] = await Promise.all([
                api.apiGet('tutors').catch(() => ({ data: [] })),
                api.apiGet('reviews/featured').catch(() => ({ success: false, data: [] }))
            ]);

            return {
                tutors: Array(3).fill().flatMap(() => tutorsResponse?.data || []),
                reviews: reviewsResponse?.success ? reviewsResponse.data : []
            };
        } catch (error) {
            console.error('Error fetching home data:', error);
            return {
                tutors: [],
                reviews: []
            };
        }
    },
    {
        server: true,
        lazy: false
    }
);

const tutors = computed(() => homeData.value?.tutors || []);
const reviews = computed(() => homeData.value?.reviews || []);

const cities = computed(() => {
    const provinces = configStore.configuration?.provinces || [];
    return [
        { id: '', name: 'Tất cả thành phố' },
        ...provinces.map(p => ({ id: p.id, name: p.name }))
    ];
});

const subjects = computed(() => {
    const subjects = configStore.configuration?.subjects || [];
    return [
        { id: '', name: 'Tất cả môn học' },
        ...subjects.map(s => ({ id: s.id, name: s.name }))
    ];
});

const levels = computed(() => {
    const levels = configStore.configuration?.educationLevels || [];
    return [
        { id: '', name: 'Tất cả cấp độ' },
        ...levels.map(l => ({ id: l.id, name: l.name }))
    ];
});

const experiences = [
    { id: '', name: 'Tất cả' },
    { id: 'new', name: 'Mới (0-2 năm)' },
    { id: 'experienced', name: 'Kinh nghiệm (3-5 năm)' },
    { id: 'expert', name: 'Chuyên gia (5+ năm)' }
];

function handleSearch() {
    const params = {
        city: selectedCity.value,
        subject: selectedSubject.value,
        level: selectedLevel.value,
        experience: selectedExperience.value,
    };

    Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
    });
    navigateTo({ path: '/search', query: params });
}

function goToSearch() {
    navigateTo('/search');
}

function goToBecomeTutor() {
    navigateTo('/become-tutor');
}

const form = reactive({
    name: '',
    phone: '',
    email: '',
    subjects: ''
});

const handleSubmit = () => {
    // Handle form submission
    console.log('Form submitted:', form);
};

// SEO Meta
const metaTitle = 'TutorFind - Nền tảng gia sư hàng đầu Việt Nam';
const metaDescription = 'Kết nối với những gia sư xuất sắc nhất để nâng cao kiến thức và đạt được mục tiêu học tập của bạn. Hơn 500+ gia sư chất lượng, học mọi lúc mọi nơi.';
const metaUrl = computed(() => {
    const baseUrl = config.public.baseUrl || (process.client ? window.location.origin : '');
    return `${baseUrl}/`;
});

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
    link: [
        {
            rel: 'canonical',
            href: metaUrl
        }
    ]
});
</script>

<style>
:root {
    --icon-base-size: 1.2rem;
}
</style>

<style scoped>
@import url('~/assets/css/home.css');
@import url('~/assets/css/tutorCard.css');
</style>
