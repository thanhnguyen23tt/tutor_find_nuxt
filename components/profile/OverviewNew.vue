<template>
<!-- Loading overlay -->
<base-loading v-if="isLoading" />

<!-- education-section -->
<div class="section-card education-section" v-if="!isLoading">
    <div class="header-wrapper">
        <div class="header-left">
            <div class="icon-wrapper">
                <svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"></path>
                    <path d="M22 10v6"></path>
                    <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"></path>
                </svg>
            </div>
            <div class="title-wrapper">
                <span class="title-main">Học vấn</span>
                <span class="sub-title">Tối ưu hồ sơ để thu hút sự lựa chọn từ học sinh</span>
            </div>
        </div>
        <div class="header-right">
            <button class="btn-sm btn-secondary" @click="showAddEducationModal = true">
                <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                </svg>
                <span>Thêm mới</span>
            </button>
        </div>
    </div>
    <div class="main-content">
        <div class="education-list">
            <div class="education-card" v-for="edu in userDataDetail.user_educations" :key="edu.id" @click="showEditEducation(edu)">
                <div class="education-header">
                    <div class="education-left">
                        <div class="icon-wrapper">
                            <svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"></path>
                                <path d="M22 10v6"></path>
                                <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"></path>
                            </svg>
                        </div>
                        <div class="title-wrapper">
                            <span class="title-main">{{ edu.school_name }}</span>
                            <span class="sub-title">{{ edu.major }}</span>
                        </div>
                    </div>
                    <div class="education-right actions-card">
                        <button class="btn-no-bg" @click.stop="showEditEducation(edu)">
                            <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"></path></svg>
                        </button>
                        <button class="btn-no-bg" @click.stop="deleteEducation(edu.id)">
                            <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>
                        </button>
                    </div>
                </div>
                <div class="desc">{{ edu.description }}</div>
                <div class="education-content">
                    <div class="time">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-md"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path></svg>
                        <span>{{ edu.time }}</span>
                    </div>
                    <div class="star">
                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 2l3 6 6 1-4.5 4.5 1 6-5.5-3-5.5 3 1-6L2 9l6-1z"></path>
                        </svg>
                        <span>3.8/4.0</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="add-new-item" @click="showAddEducationModal = true" v-if="userDataDetail.user_educations?.length == 0">
            <div class="icon-wrapper">
                <svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                </svg>
            </div>
            <span class="title">Thêm học vấn mới</span>
            <span class="sub-title">Mở rộng khả năng dạy của bạn</span>
        </div>
    </div>
</div>
<!-- End education -->

<!-- experience-section -->
<div class="section-card experience-section">
    <div class="header-wrapper">
        <div class="header-left">
            <div class="icon-wrapper">
                <svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path><rect width="20" height="14" x="2" y="6" rx="2"></rect></svg>
            </div>
            <div class="title-wrapper">
                <span class="title-main">Kinh nghiệm</span>
                <span class="sub-title">Tối ưu hồ sơ để thu hút sự lựa chọn từ học sinh</span>
            </div>
        </div>
        <div class="header-right">
            <button class="btn-sm btn-secondary" @click="showAddExperienceModal = true">
                <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                </svg>
                <span>Thêm mới</span>
            </button>
        </div>
    </div>
    <div class="main-content">
        <div class="experience-list">
            <div class="experience-card" v-for="exp in userDataDetail.user_experiences" :key="exp.id" @click="showEditExperience(exp)">
                <div class="experience-header">
                    <div class="experience-left">
                        <div class="icon-wrapper">
                            <svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path><rect width="20" height="14" x="2" y="6" rx="2"></rect></svg>
                        </div>
                        <div class="title-wrapper">
                            <span class="title-main">{{ exp.name }}</span>
                            <span class="sub-title">{{ exp.position }}</span>
                        </div>
                    </div>
                    <div class="experience-right actions-card">
                        <button class="btn-no-bg" @click.stop="showEditExperience(exp)">
                            <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"></path></svg>
                        </button>
                        <button class="btn-no-bg" @click.stop="deleteExperience(exp.id)">
                            <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>
                        </button>
                    </div>
                </div>
                <div class="desc">{{ exp.description }}</div>
                <div class="experience-content">
                    <div class="time">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-md"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path></svg>
                        <span>{{ exp.time }}</span>
                    </div>
                    <!-- Có thể thêm các trường khác nếu có -->
                </div>
            </div>
        </div>

        <div class="add-new-item" @click="showAddExperienceModal = true" v-if="userDataDetail.user_experiences?.length == 0">
            <div class="icon-wrapper">
                <svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                </svg>
            </div>
            <span class="title">Thêm kinh nghiệm mới</span>
            <span class="sub-title">Mở rộng khả năng dạy của bạn</span>
        </div>
    </div>
</div>
<!-- End experience -->

<div class="section-card subject-section">
    <div class="header-wrapper">
        <div class="header-left">
            <div class="icon-wrapper">
                <svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
            </div>
            <div class="title-wrapper">
                <span class="title-main">Môn học giảng dạy</span>
                <span class="sub-title">Tối ưu hồ sơ để thu hút sự lựa chọn từ học sinh</span>
            </div>
        </div>
        <div class="header-right">
            <button class="btn-sm btn-secondary" @click="showCreateSubjectModal()">
                <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                </svg>
                <span>Thêm mới</span>
            </button>
        </div>
    </div>
    <div class="main-content">
        <div class="subject-list">
            <div class="subject-card" v-for="subject in userDataDetail.user_subjects" :key="subject.id" @click="showEditSubject(subject)">
                <div class="subject-header">
                    <div class="subject-header_right">
                        <span class="name">{{ subject.name }}</span>
                        <span class="experience">{{ subject.years_of_experience }} năm kinh nghiệm</span>
                    </div>
                    <div class="actions actions-card">
                        <button class="btn-no-bg" @click.stop="showEditSubject(subject)">
                            <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"></path></svg>
                        </button>
                        <button class="btn-no-bg" @click.stop="deleteSubject(subject.id)">
                            <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>
                        </button>
                    </div>
                </div>
                <div class="level-wrapper">
                    <div class="level">
                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>{{ subject.level }}</span>
                    </div>
                    <div class="compare">
                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: rgb(249, 206, 105);">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        <span>{{ subject.years_of_experience }}/10</span>
                    </div>
                </div>
                <div class="ruler-wrapper">
                    <div class="ruler-header">
                        <span>Mức độ thành thạo</span>
                        <span class="percent">{{ subject.progress }}%</span>
                    </div>
                    <div class="ruler-center">
                        <div class="rounded-full">
                            <div class="ruler" :style="{ width: subject.progress + '%' }"></div>
                        </div>
                        <div class="rounded" :style="{ left: `calc(${subject.progress}% - 6px)` }"></div>
                    </div>
                    <div class="ruler-footer">
                        <span>Mới bắt đầu</span>
                        <span>Thành thạo</span>
                    </div>
                </div>
                <!-- <div class="information-detail-gird">
                    <div class="information-item">
                        <span>4</span>
                        <span>Đánh giá</span>
                    </div>
                    <div class="information-item">
                        <span>4</span>
                        <span>Năm kinh nghiệm</span>
                    </div>
                    <div class="information-item">
                        <span>4</span>
                        <span>Học sinh</span>
                    </div>
                </div> -->
            </div>
        </div>
        <div class="add-new-item" @click="showCreateSubjectModal = true" v-if="userDataDetail.user_subjects?.length == 0">
            <div class="icon-wrapper">
                <svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                </svg>
            </div>
            <span class="title">Thêm môn học mới</span>
            <span class="sub-title">Mở rộng khả năng dạy của bạn</span>
        </div>
    </div>
</div>
<!-- End subject-taught -->

<!-- language-section -->
<div class="section-card language-section">
    <div class="header-wrapper">
        <div class="header-left">
            <div class="icon-wrapper">
                <svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
            </div>
            <div class="title-wrapper">
                <span class="title-main">Ngôn ngữ</span>
                <span class="sub-title">Tối ưu hồ sơ để thu hút sự lựa chọn từ học sinh</span>
            </div>
        </div>
        <div class="header-right">
            <button class="btn-sm btn-secondary" @click="showAddLanguageModal = true">
                <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                </svg>
                <span>Thêm mới</span>
            </button>
        </div>
    </div>
    <div class="main-content">
        <div class="language-list">
            <div class="language-card" v-for="lang in userDataDetail.user_languages" :key="lang.id" @click="handleEditLanguage(lang)">
                <div class="language-header">
                    <div class="language-header_right">
                        <span class="name">{{ lang.language }}</span>
                        <span class="experience">{{ lang.is_native ? 'Ngôn ngữ mẹ đẻ' : lang.level }}</span>
                    </div>
                    <div class="actions actions-card">
                        <button class="btn-no-bg" @click.stop="handleEditLanguage(lang)">
                            <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"></path></svg>
                        </button>
                        <button class="btn-no-bg" @click.stop="handleDeleteLanguage(lang.id)">
                            <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>
                        </button>
                    </div>
                </div>
                <div class="level-wrapper">
                    <div class="level">
                        <svg class="icon-md" style="color: var(--color-primary)" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"></path><circle cx="12" cy="8" r="6"></circle></svg>
                        <span>{{ lang.level }}</span>
                    </div>
                    <div class="compare" v-if="lang.is_native">
                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg>
                        <span>Ngôn ngữ mẹ đẻ</span>
                    </div>
                </div>
                <div class="ruler-wrapper">
                    <div class="ruler-header">
                        <span>Trình độ thành thạo</span>
                        <span class="percent">{{ lang.percent ? lang.percent + '%' : '' }}</span>
                    </div>
                    <div class="ruler-center">
                        <div class="rounded-full">
                            <div class="ruler" :style="{ width: (lang.percent || 60) + '%' }"></div>
                        </div>
                        <div class="rounded" :style="{ left: `calc(${lang.percent || 60}% - 6px)` }"></div>
                    </div>
                    <div class="ruler-footer">
                        <span>A1 (Cơ bản)</span>
                        <span>C2 (Thành thạo)</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="add-new-item" @click="showAddLanguageModal()" v-if="userDataDetail.user_languages?.length == 0">
            <div class="icon-wrapper">
                <svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                </svg>
            </div>
            <span class="title">Thêm ngôn ngữ mới</span>
            <span class="sub-title">Mở rộng khả năng dạy của bạn</span>
        </div>
    </div>
</div>

<!-- Modal: Thêm học vấn -->
<base-modal :is-open="showAddEducationModal" title="Thêm học vấn" size="medium" @close="showAddEducationModal = false">
    <div class="modal-content">
        <base-input

            v-model="newEducation.school_name"
            label="Tên trường/viện"
            placeholder="Nhập tên trường"
            :error="formErrors.school_name"
        >
            <template #icon>
                <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            </template>
        </base-input>
        <base-input

            v-model="newEducation.major"
            label="Bằng cấp/Chuyên ngành"
            placeholder="Nhập ngành học"
            :error="formErrors.major"
        >
            <template #icon>
                <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
            </template>
        </base-input>
        <base-input

            v-model="newEducation.time"
            label="Thời gian"
            placeholder="VD: 2020-2024"
            :error="formErrors.time"
        >
            <template #icon>
                <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </template>
        </base-input>
        <base-input

            v-model="newEducation.description"
            label="Mô tả chi tiết"
            placeholder="Nhập mô tả"
            type="textarea"
            rows="4"
            :error="formErrors.description"
        />

        <div class="form-group file-group">
            <label class="file-label-top text-base">Ảnh bằng cấp *</label>
            <div class="up-file-wrapper">
                <div v-if="educationCertificatePreview" class="preview-image">
                    <img :src="educationCertificatePreview" alt="Preview bằng cấp">
                    <div class="actions-wrapper">
                        <div class="actions">
                            <button type="button" @click.prevent="triggerFile('educationCertificate')">
                                <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
                            </button>
                            <button type="button" @click.prevent="removeFile('certificate')">
                                <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M18 6 6 18"></path>
                                    <path d="m6 6 12 12"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                <div v-else class="up-file">
                    <div class="icon-wrapper" @click="triggerFile('educationCertificate')">
                        <svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M5 12h14"></path>
                            <path d="M12 5v14"></path>
                        </svg>
                    </div>
                    <div class="content">
                        <span class="title">Tải lên ảnh bằng cấp</span>
                        <span class="sub-title">Kéo thả file hoặc <a href="#" @click.prevent="triggerFile('educationCertificate')">chọn file</a></span>
                        <span class="desc">PNG, JPG tối đa 10MB</span>
                    </div>
                </div>
                <input type="file" id="educationCertificate" accept="image/*" @change="onFileChange($event, 'certificate')" style="display:none;" />
            </div>
        </div>

        <div class="modal-footer">
            <button class="btn-md btn-secondary" @click="showAddEducationModal = false">
                <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                </svg>
                <span>Hủy</span>
            </button>
            <button class="btn-md btn-primary" @click="addNewEducation" :disabled="!isValidAddEducationInput">
                <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                </svg>
                <span>Thêm</span>
            </button>
        </div>
    </div>
</base-modal>

<!-- Modal: Sửa học vấn -->
<base-modal :is-open="showEditEducationModal" title="Chỉnh sửa học vấn" size="medium" @close="showEditEducationModal = false">
    <div class="modal-content">
        <base-input

            v-model="userDataAction.education.school_name"
            label="Tên trường/viện"
            placeholder="Nhập tên trường"
        >
            <template #icon>
                <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            </template>
        </base-input>
        <base-input

            v-model="userDataAction.education.major"
            label="Bằng cấp/Chuyên ngành"
            placeholder="Nhập ngành học"
            :error="formErrors.major"
        >
            <template #icon>
                <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
            </template>
        </base-input>
        <base-input

            v-model="userDataAction.education.time"
            label="Thời gian"
            placeholder="VD: 2020-2024"
            :error="formErrors.time"
        >
            <template #icon>
                <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </template>
        </base-input>
        <base-input

            v-model="userDataAction.education.description"
            label="Mô tả chi tiết"
            placeholder="Nhập mô tả"
            type="textarea"
            rows="4"
            :error="formErrors.description"
        ></base-input>

        <div class="form-group file-group">
            <label class="file-label-top text-base">Ảnh bằng cấp *</label>
            <div class="up-file-wrapper">
                <div v-if="editEducationCertificatePreview" class="preview-image">
                    <img :src="editEducationCertificatePreview" alt="Preview bằng cấp">
                    <div class="actions-wrapper">
                        <div class="actions">
                            <button type="button" @click.prevent="triggerFile('editEducationCertificate')">
                                <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
                            </button>
                            <button type="button" @click.prevent="removeFile('edit_certificate')">
                                <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M18 6 6 18"></path>
                                    <path d="m6 6 12 12"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                <div v-else class="up-file">
                    <div class="icon-wrapper" @click="triggerFile('editEducationCertificate')">
                        <svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M5 12h14"></path>
                            <path d="M12 5v14"></path>
                        </svg>
                    </div>
                    <div class="content">
                        <span class="title">Tải lên ảnh bằng cấp</span>
                        <span class="sub-title">Kéo thả file hoặc <a href="#" @click.prevent="triggerFile('editEducationCertificate')">chọn file</a></span>
                        <span class="desc">PNG, JPG tối đa 10MB</span>
                    </div>
                </div>
                <input type="file" id="editEducationCertificate" accept="image/*" @change="onFileChange($event, 'edit_certificate')" style="display:none;" />
            </div>
        </div>

        <div class="modal-footer">
            <button class="btn-md btn-secondary" @click="showEditEducationModal = false">
                <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                </svg>
                <span>Hủy</span>
            </button>
            <button class="btn-md btn-primary" @click="updateEducation" :disabled="!isValidEditEducationInput">
                <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17,21 17,13 7,13 7,21"></polyline>
                    <polyline points="7,3 7,8 15,8"></polyline>
                </svg>
                <span>Lưu thay đổi</span>
            </button>
        </div>
    </div>
</base-modal>

<!-- Modal: Thêm kinh nghiệm -->
<base-modal :is-open="showAddExperienceModal" title="Thêm kinh nghiệm" size="medium" @close="showAddExperienceModal = false">
    <div class="modal-content">
        <base-input

            v-model="newExperience.name"
            label="Tên tổ chức/trường học"
            placeholder="Nhập tên tổ chức"
            :error="formErrors.name"
        >
            <template #icon>
                <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            </template>
        </base-input>
        <base-input

            v-model="newExperience.position"
            label="Vị trí công việc"
            placeholder="Nhập vị trí công việc"
            :error="formErrors.position"
        >
            <template #icon>
                <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            </template>
        </base-input>
        <base-input

            v-model="newExperience.time"
            label="Thời gian"
            placeholder="VD: 2020-2024"
            :error="formErrors.time"
        >
            <template #icon>
                <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </template>
        </base-input>
        <base-input

            v-model="newExperience.description"
            label="Mô tả chi tiết"
            placeholder="Nhập mô tả"
            type="textarea"
            rows="4"
            :error="formErrors.description"
        ></base-input>
        <div class="modal-footer">
            <button class="btn-md btn-secondary" @click="showAddExperienceModal = false">
                <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                </svg>
                <span>Hủy</span>
            </button>
            <button class="btn-md btn-primary" @click="addNewExperience" :disabled="!isValidAddExperienceInput">
                <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                </svg>
                <span>Thêm</span>
            </button>
        </div>
    </div>
</base-modal>

<!-- Modal: Sửa kinh nghiệm -->
<base-modal :is-open="showEditExperienceModal" title="Chỉnh sửa kinh nghiệm" size="medium" @close="showEditExperienceModal = false">
    <div class="modal-content">
        <base-input

            v-model="userDataAction.experience.name"
            label="Tên trường/viện"
            placeholder="Nhập tên trường"
            :error="formErrors.name"
        >
            <template #icon>
                <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            </template>
        </base-input>
        <base-input

            v-model="userDataAction.experience.position"
            label="Vị trí công việc"
            placeholder="Nhập vị trí công việc"
            :error="formErrors.position"
        >
            <template #icon>
                <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            </template>
        </base-input>
        <base-input

            v-model="userDataAction.experience.time"
            label="Thời gian"
            placeholder="VD: 2020-2024"
            :error="formErrors.time"
        >
            <template #icon>
                <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </template>
        </base-input>
        <base-input

            v-model="userDataAction.experience.description"
            label="Mô tả chi tiết"
            placeholder="Nhập mô tả"
            type="textarea"
            rows="4"
            :error="formErrors.description"
        ></base-input>
        <div class="modal-footer">
            <button class="btn-md btn-secondary" @click="showEditExperienceModal = false">
                <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                </svg>
                <span>Hủy</span>
            </button>
            <button class="btn-md btn-primary" @click="updateExperience" :disabled="!isValidEditExperienceInput">
                <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17,21 17,13 7,13 7,21"></polyline>
                    <polyline points="7,3 7,8 15,8"></polyline>
                </svg>
                <span>Lưu thay đổi</span>
            </button>
        </div>
    </div>
</base-modal>

<!-- Modal: Thêm môn học -->
<base-modal :is-open="showAddSubjectModal" title="Thêm môn học" size="medium" @close="showAddSubjectModal = false">
    <div class="modal-content">
        <base-select

            v-model="newSubject.id"
            :options="listSubjects"
            label="Chọn môn học"
            type="search"
            placeholder="Chọn môn học"
            search-placeholder="Tìm kiếm môn học..."
            :error="formErrors.subject_id"
        >
            <template #icon>
                <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            </template>
        </base-select>
        <base-input

            v-model="newSubject.years_of_experience"
            type="number"
            label="Số năm kinh nghiệm"
            placeholder="Nhập số năm kinh nghiệm"
            unit="năm"
            :min="0"
            :step="0.5"
            required
            :error="formErrors.years_of_experience"
        >
            <template #icon>
                <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </template>
        </base-input>

        <div class="level-group">
            <label>Cấp độ dạy và học phí</label>
            <div class="level-list">
                <div class="level-item" v-for="level in educationLevels" :key="level.id">
                    <div class="level-left">
                        <div class="level-icon" :class="level.class">
                            <img class="icon-md" :src="level.image" :alt="level.name">
                        </div>
                        <input type="checkbox" :value="level.id" v-model="selectedLevelsOfSubject" @change="toggleLevelSelection(level)">
                        <div class="level-name">{{ level.name }}</div>
                    </div>
                    <base-input
                         v-model="level.price" type="number" placeholder="Nhập học phí" unit="đ/giờ" :min="0" :step="1" :disabled="!selectedLevelsOfSubject.includes(level.id)">
                        <template #icon>
                            <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </template>
                    </base-input>
                </div>
            </div>
        </div>

        <div class="modal-footer">
            <button class="btn-md btn-secondary" @click="showAddSubjectModal = false">
                <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                </svg>
                <span>Hủy</span>
            </button>
            <button class="btn-md btn-primary" @click="addNewSubject" :disabled="!isValidAddSubjectInput || isLoading">
                <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                </svg>
                <span>Thêm</span>
            </button>
        </div>
    </div>
</base-modal>

<!-- Modal: Chỉnh sửa môn học -->
<base-modal :is-open="showEditSubjectModal" title="Chỉnh sửa môn học" size="medium" @close="showEditSubjectModal = false">
    <div class="modal-content">
        <base-select  v-model="userDataAction.subject.subject_id" :options="listSubjects" label="Chọn môn học" type="search" placeholder="Chọn môn học" search-placeholder="Tìm kiếm môn học...">
            <template #icon>
                <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            </template>
        </base-select>
        <base-input
             v-model="userDataAction.subject.years_of_experience" type="number" label="Số năm kinh nghiệm" placeholder="Nhập số năm kinh nghiệm" unit="năm" :min="0" :step="0.5" required>
            <template #icon>
                <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </template>
        </base-input>

        <div class="level-group">
            <label>Cấp độ dạy và học phí</label>
            <div class="level-list">
                <div class="level-item" v-for="level in educationLevels" :key="level.id">
                    <div class="level-left">
                        <div class="level-icon" :class="level.class">
                            <img class="icon-md" :src="level.image" :alt="level.name">
                        </div>
                        <input type="checkbox" :value="level.id" v-model="selectedLevelsOfSubject" @change="toggleLevelSelection(level)">
                        <div class="level-name">{{ level.name }}</div>
                    </div>
                    <base-input
                         v-model="level.price" type="number" placeholder="Nhập học phí" unit="đ/giờ" :min="0" :step="1" :disabled="!selectedLevelsOfSubject.includes(level.id)">
                        <template #icon>
                            <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </template>
                    </base-input>
                </div>
            </div>
        </div>

        <div class="modal-footer">
            <button class="btn-md btn-secondary" @click="showEditSubjectModal = false">
                <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                </svg>
                <span>Hủy</span>
            </button>
            <button class="btn-md btn-primary" @click="updateSubject" :disabled="!isValidEditSubjectInput">
                <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17,21 17,13 7,13 7,21"></polyline>
                    <polyline points="7,3 7,8 15,8"></polyline>
                </svg>
                <span>Cập nhật</span>
            </button>
        </div>
    </div>
</base-modal>

<!-- Modal: Thêm ngôn ngữ -->
<base-modal :is-open="showAddLanguageModal" title="Thêm ngôn ngữ" size="medium" @close="showAddLanguageModal = false">
    <div class="modal-content">
        <base-select  v-model="newLanguage.language_id" :options="languageOptions" label="Ngôn ngữ" placeholder="Chọn ngôn ngữ">
            <template #icon>
                <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
            </template>
        </base-select>
        <base-select  v-model="newLanguage.level_language_id" :options="levelOptions" label="Trình độ" placeholder="Chọn trình độ">
            <template #icon>
                <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
            </template>
        </base-select>
        <div class="form-group">
            <label class="checkbox-label">
                <input type="checkbox" v-model="newLanguage.is_native">
                Đây là ngôn ngữ bản ngữ của tôi
            </label>
        </div>
        <div class="modal-footer">
            <button class="btn-md btn-secondary" @click="showAddLanguageModal = false">
                <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                </svg>
                <span>Hủy</span>
            </button>
            <button class="btn-md btn-primary" @click="addNewLanguage" :disabled="!isValidAddLanguageInput || isLoading">
                <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                </svg>
                <span>Thêm</span>
            </button>
        </div>
    </div>
</base-modal>

<!-- Modal: Sửa ngôn ngữ -->
<base-modal :is-open="showEditLanguageModal" title="Chỉnh sửa ngôn ngữ" size="medium" @close="showEditLanguageModal = false">
    <div class="modal-content">
        <base-select  v-model="selectedLanguage.language_id" :options="languageOptions" label="Ngôn ngữ" placeholder="Chọn ngôn ngữ">
            <template #icon>
                <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
            </template>
        </base-select>
        <base-select  v-model="selectedLanguage.level_language_id" :options="levelOptions" label="Trình độ" placeholder="Chọn trình độ">
            <template #icon>
                <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
            </template>
        </base-select>
        <div class="form-group">
            <label class="checkbox-label">
                <input type="checkbox" v-model="selectedLanguage.is_native">
                Đây là ngôn ngữ bản ngữ của tôi
            </label>
        </div>
        <div class="modal-footer">
            <button class="btn-md btn-secondary" @click="showEditLanguageModal = false">
                <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                </svg>
                <span>Hủy</span>
            </button>
            <button class="btn-md btn-primary" @click="updateLanguage" :disabled="!isValidEditLanguageInput || isLoading">
                <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17,21 17,13 7,13 7,21"></polyline>
                    <polyline points="7,3 7,8 15,8"></polyline>
                </svg>
                <span>Cập nhật</span>
            </button>
        </div>
    </div>
</base-modal>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { useFormValidation } from '@/composables/useFormValidation';

// ============================================
// SETUP
// ============================================
const { api } = useApi();
const { success, error: notifyError } = useNotification();
const configStore = useConfigStore();

// Form validation composable
const { formErrors, handleValidationError, clearError, clearAllErrors } = useFormValidation();

const props = defineProps({
    userDataDetail: {
        type: Object,
        default: () => ({})
    }
});

const emit = defineEmits(['update-data']);

// ============================================
// COMPUTED
// ============================================
const educationLevels = ref([]);

watch(
  () => configStore.configuration?.education_levels,
  (levels) => {
    educationLevels.value = Array.isArray(levels)
      ? levels.map((level) => ({ ...level }))
      : [];
  },
  { immediate: true, deep: true },
);

const selectedLanguage = ref({
  language_id: '',
  level_language_id: '',
  is_native: false,
});

const subjectsConfig = computed(() => configStore.configuration?.subjects || []);
const languagesConfig = computed(() => configStore.configuration?.languages || []);
const levelOptions = computed(() => configStore.configuration?.level_languages || []);
const userSubjects = computed(() => props.userDataDetail?.user_subjects || []);

const listSubjects = computed(() => {
  const addedIds = (props.userDataDetail.user_subjects || []).map((s) => s.subject_id);
    const editingId = showEditSubjectModal.value ? userDataAction.subject.subject_id : null;

  return subjectsConfig.value.map((subject) => ({
        id: subject.id,
        name: subject.name,
    disabled: addedIds.includes(subject.id) && subject.id !== editingId,
    }));
});

const languageOptions = computed(() => {
  const addedIds = (props.userDataDetail.user_languages || []).map((l) => l.language_id);
    const editingId = showEditLanguageModal.value ? selectedLanguage.value.language_id : null;

  return languagesConfig.value.map((lang) => ({
        id: lang.id,
        name: lang.name,
    disabled: addedIds.includes(lang.id) && lang.id !== editingId,
    }));
});

const isValidAddSubjectInput = computed(() => {
    return newSubject.id &&
        newSubject.years_of_experience &&
        selectedLevelsOfSubject.value.length > 0 &&
        selectedLevelsOfSubject.value.every(levelId => {
            const level = educationLevels.value.find(l => l.id === levelId);
            return level && level.price > 0;
        });
});

const isValidEditSubjectInput = computed(() => {
    return userDataAction.subject.years_of_experience &&
        selectedLevelsOfSubject.value.length > 0 &&
        selectedLevelsOfSubject.value.every(levelId => {
            const level = educationLevels.value.find(l => l.id === levelId);
            return level && level.price > 0;
        });
});

// ============================================
// STATE
// ============================================
const isLoading = ref(false);

// Modal states
const modals = reactive({
    addEducation: false,
    editEducation: false,
    addExperience: false,
    editExperience: false,
    addSubject: false,
    editSubject: false,
    addLanguage: false,
    editLanguage: false
});

// Aliases for backward compatibility
const showAddEducationModal = computed({
    get: () => modals.addEducation,
    set: (val) => modals.addEducation = val
});
const showEditEducationModal = computed({
    get: () => modals.editEducation,
    set: (val) => modals.editEducation = val
});
const showAddExperienceModal = computed({
    get: () => modals.addExperience,
    set: (val) => modals.addExperience = val
});
const showEditExperienceModal = computed({
    get: () => modals.editExperience,
    set: (val) => modals.editExperience = val
});
const showAddSubjectModal = computed({
    get: () => modals.addSubject,
    set: (val) => modals.addSubject = val
});
const showEditSubjectModal = computed({
    get: () => modals.editSubject,
    set: (val) => modals.editSubject = val
});
const showAddLanguageModal = computed({
    get: () => modals.addLanguage,
    set: (val) => modals.addLanguage = val
});
const showEditLanguageModal = computed({
    get: () => modals.editLanguage,
    set: (val) => modals.editLanguage = val
});

// File previews
const educationCertificatePreview = ref(null);
const editEducationCertificatePreview = ref(null);


// Subject related
const selectedLevelsOfSubject = ref([]);
const selectedLanguageId = ref(null);

// Form data
const newEducation = reactive({
    school_name: '',
    major: '',
    time: '',
    description: '',
    certificate: null
});

const newExperience = reactive({
    name: '',
    position: '',
    time: '',
    description: ''
});


const newSubject = reactive({
    id: '',
    name: '',
    years_of_experience: '',
    levels: []
});

const newLanguage = ref({
    language_id: '',
    level_language_id: '',
    is_native: false
});

const userDataAction = reactive({
    education: {
        id: '',
        school_name: '',
        major: '',
        time: '',
        description: '',
        certificate: null
    },
    experience: {
        name: '',
        position: '',
        time: '',
        description: ''
    },
    subject: {
        name: '',
        years_of_experience: '',
        levels: []
    }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

// Ensure array helper
const ensureArray = (data) => {
    if (!data) return [];
    return Array.isArray(data) ? data : Object.values(data);
};

// Update helper
const updateUserData = async (key, updater) => {
    isLoading.value = true;
    try {
        emit('update-data', {
            ...props.userDataDetail,
            [key]: updater(props.userDataDetail[key] || [])
        });
    } finally {
        isLoading.value = false;
    }
};

// API wrapper
const apiCall = async (method, url, data, successMsg, errorMsg) => {
    try {
    const apiMethod = api[method];
    if (!apiMethod) {
      throw new Error(`API method ${method} is not defined`);
    }

    const hasPayload = !(data === undefined || data === null);
    const response = hasPayload ? await apiMethod(url, data) : await apiMethod(url);

    if (successMsg) {
      success(successMsg);
    }
    clearAllErrors();
        return response;
    } catch (error) {
        handleValidationError(error, errorMsg);
    if (errorMsg) {
      notifyError(errorMsg);
    }
        throw error;
    }
};

// File handling
const validateFile = (file) => {
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
    notifyError('File quá lớn. Vui lòng chọn file nhỏ hơn 10MB.');
        return false;
    }
    if (!file.type.startsWith('image/')) {
    notifyError('Vui lòng chọn file ảnh hợp lệ.');
        return false;
    }
    return true;
};

const createPreview = (file) => (file ? URL.createObjectURL(file) : null);

const revokePreview = (preview) => {
    if (preview) URL.revokeObjectURL(preview);
};

// ============================================
// EDUCATION HANDLERS
// ============================================
const showEditEducation = (data) => {
    Object.assign(userDataAction.education, data);
    editEducationCertificatePreview.value = data.certificate || null;
    modals.editEducation = true;
};

const addNewEducation = async () => {
    const formData = new FormData();
    Object.entries(newEducation).forEach(([key, value]) => {
        if (value) formData.append(key, value);
    });

    const response = await apiCall(
        'apiPostFormData',
        'me/education',
        formData,
        'Thêm học vấn thành công!',
        'Thêm học vấn thất bại!'
    );

    updateUserData('user_educations', (items) => [...items, response.data]);
    modals.addEducation = false;
    Object.assign(newEducation, { school_name: '', major: '', time: '', description: '', certificate: null });
    revokePreview(educationCertificatePreview.value);
    educationCertificatePreview.value = null;
};

const updateEducation = async () => {
    isLoading.value = true;
    try {
        const formData = new FormData();
        Object.entries(userDataAction.education).forEach(([key, value]) => {
            if (value) formData.append(key, value);
        });

        const response = await apiCall(
            'apiPostFormData',
            'me/update-education',
            formData,
            'Cập nhật học vấn thành công!',
            'Cập nhật học vấn thất bại!'
        );

        updateUserData('user_educations', (items) =>
            items.map(item => item.id === response.data.id ? response.data : item)
        );

        modals.editEducation = false;
        revokePreview(editEducationCertificatePreview.value);
        editEducationCertificatePreview.value = null;
    } finally {
        isLoading.value = false;
    }
};

const deleteEducation = async (id) => {
    isLoading.value = true;
    try {
        await apiCall('apiDelete', `me/education/${id}`, null, 'Xóa học vấn thành công!', 'Xóa học vấn thất bại!');
        updateUserData('user_educations', (items) => items.filter(item => item.id !== id));
    } finally {
        isLoading.value = false;
    }
};

// ============================================
// EXPERIENCE HANDLERS
// ============================================
const showEditExperience = (data) => {
    Object.assign(userDataAction.experience, data);
    modals.editExperience = true;
};

const addNewExperience = async () => {
    const response = await apiCall(
        'apiPost',
        'me/experience',
        newExperience,
        'Thêm kinh nghiệm thành công!',
        'Thêm kinh nghiệm thất bại!'
    );

    updateUserData('user_experiences', (items) => [...items, response.data]);
    modals.addExperience = false;
    Object.assign(newExperience, { name: '', position: '', time: '', description: '' });
};

const updateExperience = async () => {
    const response = await apiCall(
        'apiPut',
        'me/experience',
        userDataAction.experience,
        'Cập nhật kinh nghiệm thành công!',
        'Cập nhật kinh nghiệm thất bại!'
    );

    updateUserData('user_experiences', (items) =>
        items.map(item => item.id === response.data.id ? response.data : item)
    );
    modals.editExperience = false;
};

const deleteExperience = async (id) => {
    isLoading.value = true;
    try {
        await apiCall('apiDelete', `me/experience/${id}`, null, 'Xóa kinh nghiệm thành công!', 'Xóa kinh nghiệm thất bại!');
        updateUserData('user_experiences', (items) => items.filter(item => item.id !== id));
    } finally {
        isLoading.value = false;
    }
};


// ============================================
// SUBJECT HANDLERS
// ============================================
const showCreateSubjectModal = () => {
    newSubject.id = '';
    newSubject.name = '';
    newSubject.years_of_experience = '';
    selectedLevelsOfSubject.value = [];
    educationLevels.value.forEach(level => level.price = '');
    modals.addSubject = true;
};

const showEditSubject = (data) => {
    Object.assign(userDataAction.subject, data);
    selectedLevelsOfSubject.value = [];
    educationLevels.value.forEach(level => level.price = '');

    if (data.user_subject_levels?.length > 0) {
        data.user_subject_levels.forEach(levelData => {
            selectedLevelsOfSubject.value.push(levelData.level_id);
            const level = educationLevels.value.find(l => l.id === levelData.level_id);
            if (level) level.price = levelData.price;
        });
    }
    modals.editSubject = true;
};

const toggleLevelSelection = (level) => {
    if (!selectedLevelsOfSubject.value.includes(level.id)) {
        level.price = '';
    }
};

const addNewSubject = async () => {
    const levels = selectedLevelsOfSubject.value.map(levelId => ({
        level_id: levelId,
        price: educationLevels.value.find(l => l.id === levelId).price
    }));

    const response = await apiCall(
        'apiPost',
        'me/subject',
        { subject_id: newSubject.id, years_of_experience: newSubject.years_of_experience, levels },
        'Thêm môn học thành công!',
        'Thêm môn học thất bại!'
    );

    updateUserData('user_subjects', (items) => [...items, response.data]);
    modals.addSubject = false;
    Object.assign(newSubject, { id: '', name: '', years_of_experience: '', levels: [] });
    selectedLevelsOfSubject.value = [];
};

const updateSubject = async () => {
    const levels = selectedLevelsOfSubject.value.map(levelId => ({
        level_id: levelId,
        price: educationLevels.value.find(l => l.id === levelId).price
    }));

    const response = await apiCall(
        'apiPut',
        'me/subject',
        {
            user_subject_id: userDataAction.subject.id,
            subject_id: userDataAction.subject.subject_id,
            years_of_experience: userDataAction.subject.years_of_experience,
            levels
        },
        'Cập nhật môn học thành công!',
        'Cập nhật môn học thất bại!'
    );

    updateUserData('user_subjects', (items) =>
        items.map(item => item.id === response.data.id ? response.data : item)
    );
    modals.editSubject = false;
};

const deleteSubject = async (id) => {
    await apiCall('apiDelete', `me/subject/${id}`, null, 'Xóa môn học thành công!', 'Xóa môn học thất bại!');
    updateUserData('user_subjects', (items) => items.filter(item => item.id !== id));
};

// ============================================
// LANGUAGE HANDLERS
// ============================================
const handleEditLanguage = (language) => {
    selectedLanguageId.value = language.id;
    selectedLanguage.value = {
        id: language.id,
        language_id: language.language_id,
        level_language_id: language.level_language_id,
        is_native: language.is_native
    };
    modals.editLanguage = true;
};

const addNewLanguage = async () => {
    const response = await apiCall(
        'apiPost',
        'me/languages',
        newLanguage.value,
        'Thêm ngôn ngữ thành công!',
        'Thêm ngôn ngữ thất bại!'
    );

    updateUserData('user_languages', (items) => [...items, response.data]);
    modals.addLanguage = false;
    newLanguage.value = { language_id: '', level_language_id: '', is_native: false };
};

const updateLanguage = async () => {
    const response = await apiCall(
        'apiPut',
        `me/languages/${selectedLanguageId.value}`,
        selectedLanguage.value,
        'Cập nhật ngôn ngữ thành công!',
        'Cập nhật ngôn ngữ thất bại!'
    );

    updateUserData('user_languages', (items) =>
        items.map(item => item.id === selectedLanguageId.value ? response.data : item)
    );
    modals.editLanguage = false;
};

const handleDeleteLanguage = async (id) => {
    await apiCall('apiDelete', `me/languages/${id}`, null, 'Xóa ngôn ngữ thành công!', 'Xóa ngôn ngữ thất bại!');
    updateUserData('user_languages', (items) => items.filter(item => item.id !== id));
};

// ============================================
// VALIDATION
// ============================================
const isValidAddEducationInput = computed(() => {
    return newEducation.school_name &&
        newEducation.major &&
        newEducation.time &&
        newEducation.description;
});

const isValidEditEducationInput = computed(() => {
    return userDataAction.education.school_name &&
        userDataAction.education.major &&
        userDataAction.education.time &&
        userDataAction.education.description;
});

const isValidAddExperienceInput = computed(() => {
    return newExperience.name &&
        newExperience.position &&
        newExperience.time &&
        newExperience.description;
});

const isValidEditExperienceInput = computed(() => {
    return userDataAction.experience.name &&
        userDataAction.experience.position &&
        userDataAction.experience.time &&
        userDataAction.experience.description;
});

const isValidAddLanguageInput = computed(() => {
    return newLanguage.value.language_id &&
        newLanguage.value.level_language_id;
});

const isValidEditLanguageInput = computed(() => {
    return selectedLanguage.value.language_id &&
        selectedLanguage.value.level_language_id;
});

// ============================================
// FILE UPLOAD HANDLERS
// ============================================
const onFileChange = (event, key) => {
    const file = event.target.files[0];
    if (!file || !validateFile(file)) {
        event.target.value = '';
        return;
    }

    if (key === 'certificate') {
        newEducation.certificate = file;
        revokePreview(educationCertificatePreview.value);
        educationCertificatePreview.value = createPreview(file);
    } else if (key === 'edit_certificate') {
        userDataAction.education.certificate = file;
        revokePreview(editEducationCertificatePreview.value);
        editEducationCertificatePreview.value = createPreview(file);
    }
    success('Đã chọn ảnh bằng cấp');
};

const triggerFile = (id) => {
    const input = document.getElementById(id);
    if (input) {
        input.value = '';
        input.click();
    }
};

const removeFile = (key) => {
    if (key === 'certificate') {
        newEducation.certificate = null;
        revokePreview(educationCertificatePreview.value);
        educationCertificatePreview.value = null;
    } else if (key === 'edit_certificate') {
        userDataAction.education.certificate = null;
        revokePreview(editEducationCertificatePreview.value);
        editEducationCertificatePreview.value = null;
    }
};

// Cleanup watchers
watch(() => newEducation.certificate, (file) => {
    if (!file && educationCertificatePreview.value) {
        revokePreview(educationCertificatePreview.value);
        educationCertificatePreview.value = null;
    }
});

watch(() => userDataAction.education.certificate, (file) => {
    if (!file && editEducationCertificatePreview.value) {
        revokePreview(editEducationCertificatePreview.value);
        editEducationCertificatePreview.value = null;
    }
});
</script>

<style scoped>
@import url('~/assets/css/profileNew.css');

.education-list {
    display: grid;
    gap: 1rem;
}

.education-card,
.experience-card {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    border: 1px solid var(--gray-200);
    border-left-color: var(--color-primary);
    border-left-width: 4px;
    border-radius: 10px;
    padding: 1rem 1.3rem;
    transition: all 0.3s ease;
    cursor: pointer;
}
.experience-card {
    border-left-color: var(--yellow-500);
}

.education-header,
.experience-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.education-card:hover,
.experience-card:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.education-card .desc,
.experience-card .desc {
    font-size: var(--font-size-heading-6);
    color: var(--gray-500);
}

.education-left,
.experience-left {
    display: flex;
    align-items: center;
    gap: 0.7rem;
}
.education-left .icon-wrapper,
.experience-left .icon-wrapper {
    background: var(--color-primary-transparent);
    border-radius: 2rem;
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-primary);
}

.education-left .title-wrapper,
.experience-left .title-wrapper {
    display: grid;
    line-height: 1.4;
}
.education-left .title-wrapper .title-main,
.experience-left .title-wrapper .title-main {
    font-weight: 600;
    font-size: var(--font-size-heading-6);
}
.education-left .title-wrapper .sub-title,
.experience-left .title-wrapper .sub-title {
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--color-primary);
}

.education-content,
.experience-content {
    display: flex;
    font-size: var(--font-size-base);
    gap: 1.2rem;
}

.education-content .time,
.experience-content .time {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    color: var(--gray-500);
}

.education-content .star,
.experience-content .star {
    display: flex;
    align-items: center;
    gap: 0.3rem;
}

.education-content .star svg,
.experience-content .star svg {
    color: var(--yellow-500);
}

.education-content .status,
.experience-content .status {
    background: var(--color-primary-transparent);
    border: 1px solid var(--color-primary-light);
    padding: 0.1rem 0.7rem;
    border-radius: 2rem;
    color: var(--color-primary);
    font-size: var(--font-size-small) !important;
}


/* package */
/* Package Styles */
.packages-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-top: 1rem;
}

.package-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 1rem 1.3rem;
    transition: all 0.3s ease;
    border-left-color: var(--color-primary);
    border-left-width: 4px;
}

.package-card:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transform: translateY(-2px);
}

.package-subject-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.package-subject-header h3 {
    font-size: var(--font-size-heading-6);
    margin: 0;
}

.package-subject-header .icon {
    width: 1rem;
    height: 1rem;
}

.package-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.8rem;
}

.package-title {
    display: flex;
    align-items: center;
    gap: 0.7rem;
}

.package-title .icon-wrapper {
    background: var(--color-primary-transparent);
    border-radius: 2rem;
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-primary);
}

.package-title .title-wrapper {
    line-height: 1.6;
}

.package-title h5 {
    margin: 0;
    font-weight: 600;
    font-size: var(--font-size-heading-6);
}

.package-title .subject-name {
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--color-primary);
}

.package-content {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
}

.package-description {
    margin: 0;
    color: var(--gray-500);
    font-size: var(--font-size-base);
    line-height: 1.5;
}

.package-info {
    display: flex;
    gap: 1rem;
}

.package-info .info-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #374151;
    font-weight: 500;
    font-size: var(--font-size-small);
}

.package-info .info-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6B7280;
}

.package-features {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding-top: 1rem;
    border-top: 1px solid #E5E7EB;
}

.feature-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: var(--font-size-small);
    color: #374151;
}

.feature-item svg {
    color: #10B981;
    flex-shrink: 0;
}

.features-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin: 0.5rem 0;
}

.feature-input {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.feature-input input {
    flex: 1;
}

.feature-toggle {
    color: var(--color-primary);
    font-size: var(--font-size-small);
    cursor: pointer;
    margin-top: 0.5rem;
}

.feature-toggle:hover {
    text-decoration: underline;
}

.subject-package-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.package-group-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
}

.package-navigation {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.package-pagination {
    font-size: var(--font-size-small);
    color: #6B7280;
}

.package-navigation .navigation-buttons {
    display: flex;
    gap: 0.5rem;
}

.package-navigation .nav-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.7rem;
    height: 1.7rem;
    border: 1px solid #E5E7EB;
    border-radius: 2rem;
    background: white;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s;
}

.package-navigation .nav-button:hover:not(:disabled) {
    border-color: #D1D5DB;
    background: #F9FAFB;
}

.package-navigation .nav-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.actions-card {
    /* opacity: 0; */
    display: flex;
    gap: 0.75rem;
    transition: all 0.3s ease;
}

.price-hint {
    font-size: var(--font-size-mini);
    color: var(--gray-500);
    margin-top: 4px;
}

/* Level Group Styles */
.level-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
    margin-top: 8px;
}

.level-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 1.2rem;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
}

.level-item:hover {
    border-color: #111827;
}

.level-item.active {
    /* background: #F3F4F6; */
    border-color: #8d8d8d;
}

.level-name {
    font-size: var(--font-size-small);
    font-weight: 500;
}

.modal-edit {
    display: grid;
    gap: 1rem;
}

.level-group {
    display: grid;
    gap: 0.5rem;
}

.level-group label {
    font-weight: 600;
}

.level-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 8px;
}

.level-left {
    display: flex;
    align-items: center;
    gap: 12px;
}

.level-left input {
    width: 1rem;
    height: 1rem;
}

.level-icon {
    width: 40px;
    height: 40px;
    background: #e3e3e5;
    border-radius: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.level-name {
    font-size: var(--font-size-small);
    font-weight: 500;
    width: 80px;
}

.level-check {
    width: 1.5rem;
    height: 1.5rem;
    color: #111827;
}

.level-hint {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
    font-size: var(--font-size-small);
    color: #6B7280;
}

.selected-count {
    font-weight: 500;
    color: #111827;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    user-select: none;
    font-weight: 500;
}

.checkbox-label input[type="checkbox"] {
    width: 1rem;
    height: 1rem;
}

/* File upload styles */
.file-group {
    margin-bottom: 0;
}
.file-label-top {
    font-weight: 500;
    font-size: var(--font-size-small);
    margin-bottom: 0.5rem;
    color: #222;
}
.up-file-wrapper {
    width: 100%;
    position: relative;
}
.up-file {
    width: 100%;
    min-height: 160px;
    border: 2px dashed #d1d5db;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    position: relative;
    cursor: pointer;
    padding: 1.2rem 0.5rem;
    transition: all 0.3s ease;
}
.up-file:hover {
    border-color: #9ca3af;
    background: #f9fafb;
}
.up-file .icon-wrapper {
    width: 3rem;
    height: 3rem;
    background: var(--color-primary-transparent);
    border-radius: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-primary);
    cursor: pointer;
}
.up-file .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    text-align: center;
}
.up-file .content .title {
    font-weight: 600;
    font-size: var(--font-size-base);
    color: #374151;
}
.up-file .content .sub-title {
    font-size: var(--font-size-small);
    color: #6b7280;
}
.up-file .content .sub-title a {
    color: var(--color-primary);
    text-decoration: underline;
}
.up-file .content .desc {
    font-size: var(--font-size-mini);
    color: #9ca3af;
}
.actions-wrapper {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 2;
}
.actions {
    display: flex;
    gap: 0.5rem;
}
.actions button {
    width: 2rem;
    height: 2rem;
    background: #ffffffe6;
    border: none;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #374151;
}
.actions button:hover {
    background: #ffffff;
    transform: scale(1.1);
}
input[type="file"] {
    display: none;
}
</style>
