<template>
<base-loading v-if="isLoading" />
<div class="help-page">
    <!-- Detail View -->
    <div v-if="currentView == 'detail'" class="detail-view">
        <div class="detail-header">
            <div class="detail-header-container">
                <button class="btn-sm btn-white" @click="goBack">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Trung tâm trợ giúp
                </button>
            </div>
        </div>
        <div class="detail-content-wrapper">
            <div class="detail-content-container">
                <!-- Sidebar Navigation -->
                <aside class="detail-sidebar">
                    <nav class="detail-sidebar-nav">
                        <div v-for="category in filteredCategories" :key="category.id" class="sidebar-category">
                            <div class="sidebar-category-header" @click="toggleSidebarCategory(category.id)">
                                <div class="sidebar-category-icon">
                                    <svg v-html="category.icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"></svg>
                                </div>
                                <span class="sidebar-category-text">{{ category.name }}</span>
                                <svg class="sidebar-chevron" :class="{ rotated: expandedSidebarCategory == category.id }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="6,9 12,15 18,9"></polyline>
                                </svg>
                            </div>
                            <transition name="expand">
                                <div v-if="expandedSidebarCategory == category.id" class="sidebar-subcategories">
                                    <a
                                        v-for="subcategory in category.subcategories"
                                        :key="subcategory.id"
                                        href="#"
                                        class="sidebar-subcategory-item"
                                        :class="{ active: selectedArticle.id == subcategory.id }"
                                        @click.prevent="viewArticle(subcategory)"
                                    >
                                        {{ subcategory.title }}
                                    </a>
                                </div>
                            </transition>
                        </div>
                    </nav>
                </aside>

                <!-- Main Content -->
                <main class="detail-main">
                    <!-- <h1 class="detail-title">{{ selectedArticle.title }}</h1> -->
                    <div class="detail-content" v-html="selectedArticle.content"></div>
                </main>
            </div>
        </div>
    </div>

    <!-- Main View -->
    <div v-else>
        <!-- Header Section with Pink Background -->
        <div class="help-header">
            <div class="help-container">
                <h1 class="help-title">Chúng tôi có thể giúp gì cho bạn?</h1>

                <!-- Search Bar -->
                <div class="search-container">
                    <div class="search-bar">
                        <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                        <input type="text" placeholder="Tìm kiếm trung tâm trợ giúp" class="search-input" v-model="searchQuery" />
                    </div>
                </div>

                <div class="nav-tabs">
                    <div class="nav-tabs-wrapper">
                        <button class="tab" :class="{ active: userType == help_action.student }" @click="userType = help_action.student">
                            <span class="icon">
                                <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </span>
                            <span>Học sinh</span>
                        </button>
                        <button class="tab" :class="{ active: userType == help_action.tutor }" @click="userType = help_action.tutor">
                            <span class="icon">
                                <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                            </span>
                            <span>Gia sư</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Categories Section -->
        <div class="help-content">
            <div class="help-container container">
                <h2 class="categories-title">Thể loại</h2>

                <div v-if="filteredCategories.length > 0" class="categories-container">
                    <div v-for="category in filteredCategories" :key="category.id" class="category-wrapper">
                        <div class="category-item" @click="toggleCategory(category.id)">
                            <div class="category-icon">
                                <svg v-html="category.icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"></svg>
                            </div>
                            <span class="category-text">{{ category.name }}</span>
                            <span class="category-count">({{ category.subcategories?.length }})</span>
                            <svg class="chevron-icon" :class="{ rotated: expandedCategory == category.id }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6,9 12,15 18,9"></polyline>
                            </svg>
                        </div>

                        <!-- Subcategories -->
                        <transition name="expand">
                            <div v-if="expandedCategory == category.id" class="subcategories">
                                <div v-for="subcategory in category.subcategories" :key="subcategory.id" class="subcategory-item" @click.stop="viewArticle(subcategory)">
                                    <div class="relative">
                                        <svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>
                                    </div>
                                    <span class="subcategory-text">{{ subcategory.title }}</span>
                                    <svg class="arrow-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </transition>
                    </div>
                </div>

                <!-- Empty State -->
                <div v-else class="empty-state">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                        <line x1="11" y1="8" x2="11" y2="14"></line>
                        <line x1="8" y1="11" x2="14" y2="11"></line>
                    </svg>
                    <h3>Không tìm thấy kết quả</h3>
                    <p>Thử tìm kiếm với từ khóa khác hoặc xem các chủ đề phổ biến bên dưới</p>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';

const { help_action } = useConfig()
const { api } = useApi()
const { error: notifyError } = useNotification()
const config = useRuntimeConfig()

const userType = ref(help_action.student)
const searchQuery = ref('')
const expandedCategory = ref(null)
const expandedSidebarCategory = ref(null)
const currentView = ref('main')
const selectedArticle = ref({})

// Fetch data trên server bằng useAsyncData
const { data: helpData, pending: isLoading, refresh: refreshHelpData } = await useAsyncData(
    `help-data-${userType.value}`,
    async () => {
        try {
            const response = await api.apiGet(`help?user_type=${userType.value}`);
            if (response.success && response.data) {
                return response.data;
            }
            return [];
        } catch (error) {
            console.error('Error fetching help data:', error);
            notifyError('Không thể tải dữ liệu trợ giúp');
            return [];
        }
    },
    {
        server: true,
        lazy: false,
        watch: [userType]
    }
);

const categories = computed(() => helpData.value || [])

const filteredCategories = computed(() => {
    let filtered = categories.value.filter((category) => {
        if (userType.value == help_action.student) {
            console.log(category)
            return category.student_visible
        } else {
            return category.tutor_visible
        }
    })

    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim()
        filtered = filtered.map(category => {
            // Search in category name and subcategories
            const categoryMatch = category.name.toLowerCase().includes(query)
            const matchedSubcategories = category.subcategories.filter(sub =>
                sub.title.toLowerCase().includes(query) ||
                sub.content.toLowerCase().includes(query)
            )

            if (categoryMatch || matchedSubcategories.length > 0) {
                return {
                    ...category,
                    subcategories: matchedSubcategories.length > 0 ?
                        matchedSubcategories :
                        category.subcategories
                }
            }
            return null
        }).filter(Boolean)
    }

    return filtered
})

const toggleCategory = (categoryId) => {
    expandedCategory.value = expandedCategory.value == categoryId ? null : categoryId
}

const toggleSidebarCategory = (categoryId) => {
    expandedSidebarCategory.value = expandedSidebarCategory.value == categoryId ? null : categoryId
}

const viewArticle = (article) => {
    selectedArticle.value = article
    currentView.value = 'detail'

    // Find and expand the category containing this article
    const parentCategory = categories.value.find(cat =>
        cat.subcategories?.some(sub => sub.id == article.id)
    )
    if (parentCategory) {
        expandedSidebarCategory.value = parentCategory.id
    }

    if (process.client) {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    })
    }
}

const goBack = () => {
    currentView.value = 'main'
    if (process.client) {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    })
    }
}

// SEO Meta
const metaTitle = 'Trung tâm trợ giúp - TutorFind';
const metaDescription = 'Tìm câu trả lời cho các câu hỏi thường gặp về TutorFind. Hướng dẫn sử dụng cho học sinh và gia sư.';
const metaUrl = computed(() => {
    const baseUrl = config.public.baseUrl || (process.client ? window.location.origin : '');
    return `${baseUrl}/help`;
});

useSeoMeta({
    title: metaTitle,
    description: metaDescription,
    ogTitle: metaTitle,
    ogDescription: metaDescription,
    ogUrl: metaUrl,
    ogType: 'website',
    twitterCard: 'summary',
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

watch(userType, () => {
    refreshHelpData();
})
</script>

<style scoped>
.help-page {
    background-color: #ffffff;
}

.help-header {
    background: var(--color-primary-transparent);
    padding: 6rem 0 2rem;
    border-radius: 0 0 2rem 2rem;
}

.help-container {
    margin: 0 auto;
    padding: 0 1rem;
    width: 1000px;
}

.help-title {
    text-align: center;
    font-size: 2rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 2rem;
}

.search-container {
    margin-bottom: 2rem;
}

.search-bar {
    position: relative;
    background: white;
    border-radius: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    padding: 1.2rem 2rem;
    width: 80%;
    margin: 0 auto;
}

.search-icon {
    color: #6b7280;
    margin-right: 0.75rem;
    flex-shrink: 0;
}

.search-input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 1rem;
    color: #1f2937;
}

.search-input::placeholder {
    color: #9ca3af;
}

.nav-tabs {
    width: 100%;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
}

.nav-tabs-wrapper {
    display: flex;
    background: var(--gray-50, #f9fafb);
    border-radius: 2rem;
    width: max-content;
}

.tab {
    flex: 1;
    padding: 1rem 1.5rem;
    border: none;
    background: transparent;
    color: var(--color-primary, #6366f1);
    font-weight: 500;
    font-size: var(--font-size-base);
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin: 0.25rem;
    white-space: nowrap;
    line-height: 1;
}

.tab.active {
    background: var(--color-primary);
    color: white;
    border-radius: 2rem;
}

.icon {
    display: flex;
    align-items: center;
}

.icon-md {
    width: 20px;
    height: 20px;
}

.help-content {
    padding: 2rem 0;
}

.categories-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 1.5rem;
}

.categories-container {
    background: white;
    border-radius: 1.7rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.category-wrapper {
    border-bottom: 1px solid #f3f4f6;
}

.category-wrapper:last-child {
    border-bottom: none;
}

.category-item {
    display: flex;
    align-items: center;
    padding: 1.4rem 1.5rem;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.category-item:hover {
    background-color: #f9fafb;
}

.category-icon {
    margin-right: 1rem;
    color: #6b7280;
    flex-shrink: 0;
    font-weight: 800;
}

.category-text {
    flex: 1;
    font-size: var(--font-size-base);
    color: #1f2937;
    font-weight: 700;
}

.category-count {
    font-size: var(--font-size-small);
    color: #9ca3af;
    font-weight: 500;
    margin-right: 0.5rem;
}

.chevron-icon {
    color: #9ca3af;
    flex-shrink: 0;
    transition: transform 0.3s ease;
}

.chevron-icon.rotated {
    transform: rotate(180deg);
}

/* Subcategories */
.subcategories {
    background-color: #f9fafb;
    padding: 0.5rem 0;
}

.subcategory-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 1.5rem 1rem 2.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.subcategory-item .relative {
    line-height: 1;
}

.subcategory-item:hover {
    background-color: #f3f4f6;
}

.subcategory-item:hover .arrow-icon {
    color: var(--color-primary);
    transform: translateX(4px);
}

.subcategory-text {
    flex: 1;
    font-size: var(--font-size-base);
    color: #374151;
    font-weight: 500;
}

.arrow-icon {
    color: #9ca3af;
    flex-shrink: 0;
    transition: all 0.2s ease;
}

/* Transitions */
.expand-enter-active,
.expand-leave-active {
    transition: all 0.3s ease;
    overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
    opacity: 0;
    max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
    opacity: 1;
    max-height: 1000px;
}

/* Detail View */
.detail-view {
    min-height: 100vh;
    background-color: #f8f9fa;
}

.detail-header {
    background: var(--color-primary-transparent);
    padding: 6rem 0 2rem;
}

.detail-header-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
}

.back-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: white;
    border: none;
    border-radius: 2rem;
    color: var(--color-primary);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.back-button:hover {
    background: #f9fafb;
    transform: translateX(-4px);
}

/* Detail Content Wrapper */
.detail-content-wrapper {
    padding: 60px 0;
}

.detail-content-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 48px;
    align-items: start;
}

/* Detail Sidebar */
.detail-sidebar {
    position: sticky;
    top: 100px;
}

.detail-sidebar-nav {
    background: white;
    border-radius: 16px;
    padding: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.sidebar-category {
    margin-bottom: 0.5rem;
}

.sidebar-category:last-child {
    margin-bottom: 0;
}

.sidebar-category-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    cursor: pointer;
    border-radius: 10px;
    transition: all 0.2s ease;
}

.sidebar-category-header:hover {
    background: #f8fafc;
}

.sidebar-category-icon {
    flex-shrink: 0;
    color: #6b7280;
    display: flex;
    align-items: center;
    justify-content: center;
}

.sidebar-category-text {
    flex: 1;
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
}

.sidebar-chevron {
    flex-shrink: 0;
    color: #9ca3af;
    transition: transform 0.3s ease;
}

.sidebar-chevron.rotated {
    transform: rotate(180deg);
}

.sidebar-subcategories {
    padding: 4px 0 4px 36px;
}

.sidebar-subcategory-item {
    display: block;
    padding: 10px 14px;
    font-size: 13px;
    color: #64748b;
    text-decoration: none;
    border-radius: 8px;
    transition: all 0.2s ease;
    margin-bottom: 2px;
}

.sidebar-subcategory-item:hover {
    background: #f8fafc;
    color: var(--color-primary);
}

.sidebar-subcategory-item.active {
    background: linear-gradient(90deg, #eef2ff 0%, #f8fafc 100%);
    color: var(--color-primary);
    font-weight: 600;
}

/* Detail Main Content */
.detail-main {
    background: white;
    border-radius: 16px;
    padding: 48px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    min-height: 600px;
}

.detail-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 2rem;
    line-height: 1.2;
}

.detail-content {
    font-size: var(--font-size-base);
    line-height: 1.8;
    color: #374151;
}

.detail-content :deep(h2) {
    font-size: var(--font-size-heading-4);
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 1rem;
}

.detail-content :deep(h3) {
    font-size: var(--font-size-heading-5);
    font-weight: 600;
    color: #1f2937;
    margin-top: 2rem;
    margin-bottom: 0.75rem;
}

.detail-content :deep(p) {
    margin-bottom: 1.25rem;
}

.detail-content :deep(ul),
.detail-content :deep(ol) {
    margin-bottom: 1.5rem;
    padding-left: 1.5rem;
}

.detail-content :deep(li) {
    margin-bottom: 0.75rem;
}

.detail-content :deep(strong) {
    color: #1f2937;
    font-weight: 600;
}

.detail-content :deep(.highlight) {
    background-color: #fef3c7;
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
}

.detail-content :deep(.info-box) {
    background-color: #eff6ff;
    border-left: 4px solid var(--color-primary);
    padding: 1rem;
    margin: 1.5rem 0;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
}

.detail-content :deep(.warning-box) {
    background-color: #fef3c7;
    border-left: 4px solid #f59e0b;
    padding: 1rem;
    margin: 1.5rem 0;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
}

/* Feature Grid */
.detail-content :deep(.feature-grid) {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0;
}

.detail-content :deep(.feature-card) {
    padding: 1.5rem;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    text-align: center;
}

.detail-content :deep(.feature-icon) {
    width: 56px;
    height: 56px;
    background: #eef2ff;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
}

.detail-content :deep(.feature-icon svg) {
    color: var(--color-primary);
}

.detail-content :deep(.feature-card h4) {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.5rem;
}

.detail-content :deep(.feature-card p) {
    font-size: var(--font-size-base);
    color: #6b7280;
    margin: 0;
}

/* Step List */
.detail-content :deep(.step-list) {
    margin: 2rem 0;
}

.detail-content :deep(.step-item) {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    align-items: start;
}

.detail-content :deep(.step-number) {
    width: 40px;
    height: 40px;
    background: var(--color-primary);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: var(--font-size-medium);
    flex-shrink: 0;
}

.detail-content :deep(.step-content h4) {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.3rem;
}

.detail-content :deep(.step-content p) {
    font-size: var(--font-size-small);
    color: #6b7280;
    margin: 0;
}

/* Package Grid */
.detail-content :deep(.package-grid) {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0;
}

.detail-content :deep(.package-card) {
    padding: 1.5rem;
    background: #f8fafc;
    border-radius: 12px;
    border: 2px solid #e2e8f0;
    text-align: center;
    transition: all 0.3s;
}

.detail-content :deep(.package-card:hover) {
    border-color: var(--color-primary);
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.detail-content :deep(.package-name) {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.5rem;
}

.detail-content :deep(.package-discount) {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background: var(--color-primary);
    color: white;
    border-radius: 1rem;
    font-size: var(--font-size-small);
    font-weight: 600;
    margin-bottom: 1rem;
}

.detail-content :deep(.package-card p) {
    font-size: var(--font-size-small);
    color: #6b7280;
    margin: 0;
}

/* Income Stats */
.detail-content :deep(.income-stats) {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0;
}

.detail-content :deep(.stat-card) {
    padding: 2rem 1.5rem;
    background: linear-gradient(135deg, #eef2ff 0%, #f8fafc 100%);
    border-radius: 16px;
    border: 2px solid #e2e8f0;
    text-align: center;
}

.detail-content :deep(.stat-card h4) {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: #6b7280;
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.detail-content :deep(.stat-value) {
    font-size: var(--font-size-heading-4);
    font-weight: 700;
    color: var(--color-primary);
    margin-bottom: 0.5rem;
}

.detail-content :deep(.stat-card p) {
    font-size: var(--font-size-small);
    color: #6b7280;
    margin: 0;
}

/* Payment Methods */
.detail-content :deep(.payment-methods) {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0;
}

.detail-content :deep(.payment-card) {
    padding: 1.5rem;
    background: white;
    border-radius: 12px;
    border: 2px solid #e2e8f0;
    text-align: center;
    transition: all 0.3s;
}

.detail-content :deep(.payment-card:hover) {
    border-color: var(--color-primary);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.detail-content :deep(.payment-icon) {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 0.5rem;
}

.detail-content :deep(.payment-icon img) {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.detail-content :deep(.payment-card h4) {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.5rem;
}

.detail-content :deep(.payment-card p) {
    font-size: var(--font-size-small);
    color: #6b7280;
    margin: 0;
}

/* Refund Cases */
.detail-content :deep(.refund-cases) {
    margin: 2rem 0;
}

.detail-content :deep(.refund-item) {
    display: flex;
    gap: 1rem;
    padding: 1.5rem;
    background: #f8fafc;
    border-radius: 12px;
    margin-bottom: 1rem;
    border-left: 4px solid #e2e8f0;
}

.detail-content :deep(.refund-item.success) {
    background: #f0fdf4;
    border-left-color: #10b981;
}

.detail-content :deep(.refund-item.success svg) {
    color: #10b981;
}

.detail-content :deep(.refund-item.warning) {
    background: #fef3c7;
    border-left-color: #f59e0b;
}

.detail-content :deep(.refund-item.warning svg) {
    color: #f59e0b;
}

.detail-content :deep(.refund-item.error) {
    background: #fef2f2;
    border-left-color: #ef4444;
}

.detail-content :deep(.refund-item.error svg) {
    color: #ef4444;
}

.detail-content :deep(.refund-item svg) {
    flex-shrink: 0;
    margin-top: 0.25rem;
}

.detail-content :deep(.refund-item h4) {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.5rem;
}

.detail-content :deep(.refund-item p) {
    font-size: var(--font-size-small);
    color: #6b7280;
    margin: 0;
}

/* Requirements Grid */
.detail-content :deep(.requirements) {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0;
}

.detail-content :deep(.req-item) {
    padding: 1.5rem;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
}

.detail-content :deep(.req-item svg) {
    color: var(--color-primary);
    margin-bottom: 1rem;
}

.detail-content :deep(.req-item h4) {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 1rem;
}

.detail-content :deep(.req-item ul) {
    list-style: none;
    padding: 0;
    margin: 0;
}

.detail-content :deep(.req-item li) {
    padding: 0.5rem 0;
    color: #6b7280;
    border-bottom: 1px solid #e2e8f0;
}

.detail-content :deep(.req-item li:last-child) {
    border-bottom: none;
}

/* Support Channels */
.detail-content :deep(.support-channels) {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0;
}

.detail-content :deep(.channel-card) {
    padding: 2rem 1.5rem;
    background: white;
    border-radius: 16px;
    border: 2px solid #e2e8f0;
    text-align: center;
    transition: all 0.3s;
}

.detail-content :deep(.channel-card:hover) {
    border-color: var(--color-primary);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    transform: translateY(-4px);
}

.detail-content :deep(.channel-card svg) {
    color: var(--color-primary);
    margin: 0 auto 1rem;
}

.detail-content :deep(.channel-card h4) {
    font-size: var(--font-size-heading-5);
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.5rem;
}

.detail-content :deep(.channel-card p) {
    font-size: var(--font-size-small);
    color: #6b7280;
    margin-bottom: 1rem;
}

.detail-content :deep(.time) {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: #eef2ff;
    color: var(--color-primary);
    border-radius: 1rem;
    font-size: var(--font-size-small);
    font-weight: 600;
}

/* FAQ Items */
.detail-content :deep(.faq-item) {
    padding: 1.5rem;
    background: #f8fafc;
    border-radius: 12px;
    border-left: 4px solid var(--color-primary);
    margin-bottom: 1.5rem;
}

.detail-content :deep(.faq-item h4) {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.75rem;
}

.detail-content :deep(.faq-item p) {
    font-size: var(--font-size-small);
    color: #6b7280;
    margin: 0;
    line-height: 1.6;
}

/* Loading State */
.loading-container {
    text-align: center;
    padding: 4rem 2rem;
    background: white;
    border-radius: 1.7rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.spinner {
    width: 50px;
    height: 50px;
    margin: 0 auto 1rem;
    border: 4px solid #f3f4f6;
    border-top: 4px solid var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.loading-container p {
    color: #6b7280;
    font-size: var(--font-size-base);
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: 4rem 2rem;
    background: white;
    border-radius: 1.7rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.empty-state svg {
    color: #d1d5db;
    margin: 0 auto 1.5rem;
}

.empty-state h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.5rem;
}

.empty-state p {
    font-size: 0.95rem;
    color: #6b7280;
    max-width: 400px;
    margin: 0 auto;
}

/* Responsive Design */
@media (max-width: 1024px) {
    .detail-content-container {
        grid-template-columns: 300px 1fr;
        gap: 32px;
    }

    .detail-sidebar {
        top: 80px;
    }

    .detail-main {
        padding: 32px;
    }

    .help-container {
        width: 100%;
    }
}

@media (max-width: 768px) {
    .help-container {
        padding: 3rem 1rem 0 1rem;
    }

    .help-title {
        font-size: 1.5rem;
    }

    .search-container {
        margin-bottom: 1rem;
    }

    .search-bar {
        width: 100%;
        margin: 0 auto;
        border-radius: 1.4rem;
    }

    /* Detail View Responsive */
    .detail-content-container {
        grid-template-columns: 1fr;
        gap: 24px;
        padding: 0 16px;
    }

    .detail-sidebar {
        position: static;
        order: 1;
    }

    .detail-main {
        order: 2;
        padding: 24px;
    }

    .detail-title {
        font-size: var(--font-size-heading-4);
    }

    .detail-content {
        font-size: 1rem;
    }

    .detail-content :deep(h2) {
        font-size: 1.4rem;
    }

    .detail-content :deep(h3) {
        font-size: 1.2rem;
    }

    .detail-content-wrapper {
        padding: 40px 0;
    }
}

@media (max-width: 480px) {
    .help-header {
        padding: 2rem 0 1.5rem;
    }

    .help-title {
        font-size: 1.25rem;
        margin-bottom: 1.5rem;
    }

    .detail-header {
        padding: 1.5rem 0;
    }

    .detail-header-container {
        padding: 0 16px;
    }

    .detail-main {
        padding: 20px;
    }

    .detail-title {
        font-size: 1.5rem;
    }

    .detail-content-wrapper {
        padding: 32px 0;
    }
}
</style>
