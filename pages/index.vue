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
							Kết nối với những gia sư xuất sắc nhất để nâng cao kiến thức và đạt được mục tiêu học tập
							của bạn.
						</p>
						<div class="hero-buttons">
							<button class="btn-lg btn-primary" @click="goToSearch">
								Tìm gia sư ngay
								<svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
										d="M9 5l7 7-7 7" />
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
									<svg class="icon-md" viewBox="0 0 24 24" fill="none">
										<path
											d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
											stroke="currentColor" stroke-width="2" stroke-linecap="round"
											stroke-linejoin="round"></path>
									</svg>
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
											<svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24"
												height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
												stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
												<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
												<path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
											</svg>
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

		<!-- Search Section -->
		<section class="search-section">
				<div class="container">
					<div class="search-title-wrapper">
						<div class="search-badge">Đội ngũ chuyên nghiệp</div>
						<h2 class="search-title">Tìm gia sư phù hợp với bạn</h2>
						<p class="search-description">
							Khám phá đội ngũ gia sư chất lượng cao của chúng tôi và tìm người phù hợp nhất với nhu cầu
							học tập của bạn
						</p>
					</div>

					<!-- Modern Search Bar (Desktop) -->
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
							<div v-show="activeDropdown === 'location'" class="search-dropdown location-dropdown" @click.stop>
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
							<div v-show="activeDropdown === 'subject'" class="search-dropdown subject-dropdown" @click.stop>
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
								<div class="section-label">Kinh nghiệm</div>
								<div class="section-value" :class="{ 'placeholder': !filters.experience }">
									{{ getExperienceName(filters.experience) || 'Thêm kinh nghiệm' }}
								</div>
							</div>
							<!-- Dropdown -->
							<div v-if="activeDropdown === 'level'" class="search-dropdown level-dropdown" @click.stop>
								<div class="dropdown-title">Chọn kinh nghiệm</div>
								<div class="dropdown-list">
									<div class="dropdown-item" @click="selectLevel('')">
										<div class="item-icon">
											<svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
										</div>
										<div class="item-info">
											<div class="item-title">Tất cả kinh nghiệm</div>
											<div class="item-desc">Mọi cấp độ</div>
										</div>
									</div>
									<div v-for="lvl in experienceOptions" :key="lvl.id" class="dropdown-item" @click="selectExperience(lvl.id)">
										<div class="item-icon">
											<svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
										</div>
										<div class="item-info">
											<div class="item-title">{{ lvl.name }}</div>
											<div class="item-desc">Kinh nghiệm</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						

						<!-- Search Button -->
						<div class="search-btn-wrapper">
							<button class="search-btn-circle" @click="handleSearch">
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
			</section>

			<!-- Featured Tutors Section -->
			<section class="tutors-section">
				<div class="container">
					<div class="tutors-grid">
						<TutorCard v-for="tutor in tutors" :key="tutor.uid" :tutor="tutor"
							@toggle-save="handleToggleSave" @navigate-to-tutor="handleNavigateToTutor"
							@redirect-to-booking="handleRedirectToBooking" />
					</div>
				</div>
			</section>

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

				<!-- Desktop Reviews -->
				<div class="reviews-grid desktop-reviews">
					<div v-for="review in reviews" :key="review.id" class="review-card">
						<div class="rating">
							<span v-for="star in review.rating" :key="star" class="star">★</span>
						</div>
						<p class="review-text">
							"{{ review.comment }}"
						</p>
						<div class="reviewer-info">
							<div class="reviewer-avatar">
								<img :src="review.reviewer.avatar" alt=""></img>
							</div>
							<div class="reviewer-details">
								<h4 class="reviewer-name">{{ review.reviewer.full_name }}</h4>
								<p class="reviewer-title">Học viên TutorFind</p>
							</div>
						</div>
					</div>
				</div>

				<!-- Mobile Reviews -->
				<div class="mobile-reviews" v-if="reviews.length > 0">
					<div class="review-card">
						<div class="rating">
							<span v-for="star in reviews[currentReviewIndex].rating" :key="star" class="star">★</span>
						</div>
						<p class="review-text">
							"{{ reviews[currentReviewIndex].comment }}"
						</p>
						<div class="reviewer-info">
							<div class="reviewer-avatar">
								<img :src="reviews[currentReviewIndex].reviewer.avatar" alt=""></img>
							</div>
							<div class="reviewer-details">
								<h4 class="reviewer-name">{{ reviews[currentReviewIndex].reviewer.full_name }}</h4>
								<p class="reviewer-title">Học viên TutorFind</p>
							</div>
						</div>
					</div>
					
					<div class="mobile-review-controls">
						<button class="btn-next-review" @click="nextReview">
							<span>Xem đánh giá tiếp theo</span>
							<svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
							</svg>
						</button>
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
									<input type="text" placeholder="Nhập họ và tên của bạn" v-model="form.name"
										required>
								</div>
								<div class="form-group">
									<input type="tel" placeholder="Nhập số điện thoại của bạn" v-model="form.phone"
										required>
								</div>
								<div class="form-group">
									<input type="email" placeholder="Nhập email của bạn" v-model="form.email" required>
								</div>
								<div class="form-group">
									<input type="text" placeholder="Ví dụ: Toán, Tiếng Anh, Vật lý..."
										v-model="form.subjects" required>
								</div>
								<div class="form-group">
									<button type="submit" class="btn-lg btn-white">Gửi thông tin</button>
								</div>
								<div class="form-terms">
									Bằng cách gửi thông tin, bạn đồng ý với <a href="/terms" class="link">Điều khoản
										dịch vụ</a>
									và <a href="/privacy" class="link">Chính sách bảo mật</a> của chúng tôi.
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
					<img :src="'/images/banner/become-teacher-3.jpg'" alt="Become a teacher">
				</div>

				<div class="become-teacher-content">
					<div class="content-badge">
						<svg class="icon-sm" fill="currentColor" viewBox="0 0 24 24">
							<path
								d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
						</svg>
						<span>Cơ hội nghề nghiệp</span>
					</div>

					<h2 class="become-teacher-title">Bạn cũng có thể trở thành gia sư tuyệt vời!</h2>
					<p class="become-teacher-description">
						Chia sẻ kiến thức của bạn, sống với đam mê và trở thành chủ của chính mình
					</p>

					<button class="btn-lg btn-black w-100 border-r-2" @click="goToBecomeTutor">
						<span>Tìm hiểu thêm</span>
						<svg class="icon-xl" fill="currentColor" viewBox="0 0 24 24">
							<path
								d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
						</svg>
					</button>
				</div>
			</div>
		</section>
	</div>
	<AdvancedFilterModal
		:is-open="showFilter"
		v-model:filters="filters"
		:city-options="cityOptions"
		:subject-options="subjectOptions"
		:education-level-options="educationLevelOptions"
		:experience-options="experienceOptions"
		@close="showFilter = false"
		@reset="filters = { provinces_id: '', subject: '', educationLevel: '', experience: '', rating: 0, price: 500000 }"
		@apply="handleSearch"
	/>
</template>

<script setup>
definePageMeta({
	middleware() {
		useLayoutStore().setHiddenFooter(false)
	}
})

const configStore = useConfigStore();
const { api } = useApi();
const config = useRuntimeConfig();

const filters = ref({
    provinces_id: '',
    subject: '',
    educationLevel: '',
    experience: '',
    rating: 0,
    price: 500000
});

const showFilter = ref(false);

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

const selectExperience = (id) => {
    filters.value.experience = id;
    activeDropdown.value = null;
};

const cityOptions = computed(() => configStore.configuration?.provinces || []);
const subjectOptions = computed(() => configStore.configuration?.subjects || []);
const educationLevelOptions = computed(() => configStore.configuration?.education_levels || []);
const experienceOptions = computed(() => configStore.configuration?.experience_action || []);

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

// Close dropdowns when clicking outside
onMounted(() => {
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

// Fetch data trên server bằng useAsyncData với useSsrApi
const { data: homeData, pending: isLoading } = await useAsyncData(
	'home-data',
	async () => {
		try {
			const [tutorsResponse, reviewsResponse] = await Promise.all([
				api.apiGet('tutors').catch(() => ({ data: [] })),
				api.apiGet('reviews/featured').catch(() => ({ data: [] }))
			]);

			return {
				tutors: Array(3).fill().flatMap(() => tutorsResponse.data || []),
				reviews: reviewsResponse.data || []
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

function goToSearch() {
	navigateTo('/search');
}

function handleSearch() {
	const params = {
		city: filters.value.provinces_id,
		subject: filters.value.subject,
		level: filters.value.educationLevel,
		experience: filters.value.experience,
        rating: filters.value.rating > 0 ? filters.value.rating : undefined,
        price: filters.value.price < 500000 ? filters.value.price : undefined
	};

	Object.keys(params).forEach(key => {
		if (!params[key]) delete params[key];
	});
	navigateTo({ path: '/search', query: params });
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

const currentReviewIndex = ref(0);

const nextReview = () => {
	if (reviews.value.length > 0) {
		currentReviewIndex.value = (currentReviewIndex.value + 1) % reviews.value.length;
	}
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
@import url('~/assets/css/tutorCard.css');
@import url('~/assets/css/home.css');
@import url('~/assets/css/search-bar.css');
</style>
