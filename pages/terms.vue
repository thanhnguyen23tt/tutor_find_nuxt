<script setup>
definePageMeta({
  	layout: false
})

import { ref, onMounted, onUnmounted } from 'vue'

const router = useRouter()
const { api } = useApi()
const { error: notifyError } = useNotification()

const activeSection = ref('terms-conditions')
const lastUpdated = ref('25 tháng 10, 2024')
const loading = ref(false)
const sections = ref([])

const scrollToSection = (sectionId) => {
    if (!process.client) return
    const element = document.getElementById(sectionId)
    if (element) {
        const offset = 100
        const elementPosition = element.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - offset

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        })
    }
}

const handleScroll = () => {
    if (!process.client) return
    const scrollPosition = window.scrollY + 150

    for (let i = sections.value.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections.value[i].id)
        if (section && section.offsetTop <= scrollPosition) {
            activeSection.value = sections.value[i].id
            break
        }
    }
}

const fetchTermsData = async () => {
    loading.value = true
    try {
        const response = await api.apiGet('terms')
        if (response.success && response.data) {
            sections.value = response.data.sections
            // lastUpdated.value = response.data.last_updated
        }
    } catch (error) {
        console.error('Error fetching terms data:', error)
        notifyError('Không thể tải dữ liệu điều khoản')
    } finally {
        loading.value = false
    }
}

const goBack = () => {
    router.back()
}

onMounted(() => {
    fetchTermsData()
    if (process.client) {
    window.addEventListener('scroll', handleScroll)
    }
})

onUnmounted(() => {
    if (process.client) {
    window.removeEventListener('scroll', handleScroll)
    }
})

</script>

<template>
<div class="terms-page">
    <!-- Header Section -->
    <div class="terms-header">
        <div class="terms-container container">
            <h1 class="terms-title">Điều khoản & Điều kiện</h1>
            <p class="terms-subtitle">Cập nhật lần cuối: {{ lastUpdated }}</p>
            <button class="btn-sm btn-white" @click="goBack">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Quay lại
            </button>
        </div>
    </div>

    <!-- Content Section -->
    <div class="terms-content">
        <div class="terms-container container">
            <!-- Sidebar Navigation -->
            <aside class="terms-sidebar">
                <nav class="sidebar-nav">
                    <a
                        v-for="(section, index) in sections"
                        :key="section.id"
                        :href="`#${section.id}`"
                        class="nav-item"
                        :class="{ active: activeSection === section.id }"
                        @click.prevent="scrollToSection(section.id)"
                    >
                        <div class="nav-item-number">{{ index + 1 }}</div>
                        <div class="nav-item-content">
                            <span class="nav-item-title">{{ section.title }}</span>
                            <div class="nav-item-indicator"></div>
                        </div>
                    </a>
                </nav>
            </aside>

            <!-- Main Content -->
            <main class="terms-main">
                <!-- Loading State -->
                <div v-if="loading" class="loading-container">
                    <div class="spinner"></div>
                    <p>Đang tải dữ liệu...</p>
                    </div>

                <!-- Dynamic Sections -->
                <template v-else>
                    <section
                        v-for="section in sections"
                        :key="section.id"
                        :id="section.id"
                        class="content-section"
                    >
                        <h2 class="section-title">{{ section.title }}</h2>
                        <div class="section-content" v-html="section.content"></div>
                </section>

                <!-- Contact Section -->
                <section class="contact-section">
                    <div class="contact-card">
                        <svg class="contact-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <h3>Bạn có câu hỏi?</h3>
                        <p>Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn 24/7</p>
                        <NuxtLink to="/help" class="contact-btn">
                            Liên hệ hỗ trợ
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M5 12h14"></path>
                                <path d="m12 5 7 7-7 7"></path>
                            </svg>
                        </NuxtLink>
                    </div>
                </section>
                </template>
            </main>
        </div>
    </div>
</div>
</template>

<style scoped>
.terms-page {
    min-height: 100vh;
    background: #f8f9fa;
}

/* Header */
.terms-header {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    padding: 80px 0 60px;
    color: white;
}

.terms-container {
    margin: 0 auto;
    padding: 0 24px;
}

.terms-title {
    font-size: var(--font-size-heading-4);
    font-weight: 700;
    margin-bottom: 16px;
    line-height: 1.2;
}

.terms-subtitle {
    font-size: var(--font-size-base);
    opacity: 0.9;
}

/* Content Layout */
.terms-content {
    padding: 60px 0;
}

.terms-content .terms-container {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 48px;
    align-items: start;
}

/* Sidebar */
.terms-sidebar {
    position: sticky;
    top: 100px;
}

.sidebar-nav {
    background: white;
    border-radius: 16px;
    padding: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    color: #64748b;
    text-decoration: none;
    border-radius: 10px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 6px;
    position: relative;
    overflow: hidden;
}

.nav-item::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--color-primary);
    transform: scaleY(0);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-item:hover {
    background: #f8fafc;
    color: var(--color-primary);
    transform: translateX(4px);
}

.nav-item:hover::before {
    transform: scaleY(1);
}

.nav-item.active {
    background: linear-gradient(90deg, #eef2ff 0%, #f8fafc 100%);
    color: var(--color-primary);
    font-weight: 600;
}

.nav-item.active::before {
    transform: scaleY(1);
}

.nav-item.active .nav-item-indicator {
    transform: scaleX(1);
}

.nav-item-number {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: #f1f5f9;
    color: #94a3b8;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 13px;
    flex-shrink: 0;
    transition: all 0.3s;
}

.nav-item:hover .nav-item-number {
    background: #eef2ff;
    color: var(--color-primary);
}

.nav-item.active .nav-item-number {
    background: var(--color-primary);
    color: white;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.nav-item-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.nav-item-title {
    line-height: 1.4;
    display: block;
}

.nav-item-indicator {
    height: 2px;
    background: linear-gradient(90deg, var(--color-primary) 0%, transparent 100%);
    border-radius: 2px;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Main Content */
.terms-main {
    background: white;
    border-radius: 16px;
    padding: 48px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* Loading State */
.loading-container {
    text-align: center;
    padding: 4rem 2rem;
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
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.loading-container p {
    color: #6b7280;
    font-size: 1rem;
}

.content-section {
    margin-bottom: 64px;
    scroll-margin-top: 100px;
}

.content-section:last-of-type {
    margin-bottom: 0;
}

.section-title {
    font-size: var(--font-size-heading-4);
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 3px solid #667eea;
}

.section-content {
    color: #475569;
    line-height: 1.8;
}

.section-content :deep(h3) {
    font-size: var(--font-size-medium);
    font-weight: 600;
    color: #334155;
    margin-top: 32px;
    margin-bottom: 16px;
}

.section-content :deep(h4) {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: #334155;
    margin-top: 24px;
    margin-bottom: 12px;
}

:deep(.section-content p) {
    margin-bottom: 16px;
}

:deep(.section-content ul),
:deep(.section-content ol) {
    margin-left: 24px;
    margin-bottom: 16px;
}

:deep(.section-content li) {
    margin-bottom: 8px;
}

:deep(.section-content strong) {
    color: #1e293b;
    font-weight: 600;
}

:deep(.section-content a) {
    color: var(--color-primary);
    text-decoration: none;
}

:deep(.section-content a:hover) {
    text-decoration: underline;
}

/* Contact Section */
.contact-section {
    margin-top: 64px;
    padding-top: 48px;
    border-top: 2px solid #e2e8f0;
}

.contact-card {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    color: white;
    padding: 48px;
    border-radius: 16px;
    text-align: center;
}

.contact-icon {
    margin: 0 auto 24px;
}

.contact-card h3 {
    font-size: var(--font-size-heading-4);
    font-weight: 700;
    margin-bottom: 12px;
}

.contact-card p {
    font-size: var(--font-size-base);
    opacity: 0.9;
    margin-bottom: 24px;
}

.contact-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: white;
    color: var(--color-primary);
    padding: 12px 32px;
    border-radius: 8px;
    font-weight: 600;
    text-decoration: none;
    transition: transform 0.2s;
}

.contact-btn:hover {
    transform: translateY(-2px);
}

/* Info Box */
:deep(.info-box),
:deep(.warning-box) {
    display: flex;
    gap: 16px;
    padding: 20px;
    border-radius: 12px;
    margin: 24px 0;
}

:deep(.info-box) {
    background: #eff6ff;
    border-left: 4px solid var(--color-primary);
}

:deep(.warning-box) {
    background: #fff7ed;
    border-left: 4px solid #f59e0b;
}

:deep(.info-icon),
:deep(.warning-icon) {
    flex-shrink: 0;
    color: var(--color-primary);
}

:deep(.warning-icon) {
    color: #f59e0b;
}

/* Feature Grid */
:deep(.feature-grid) {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 24px;
    margin: 24px 0;
}

:deep(.feature-card) {
    padding: 24px;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
}

:deep(.feature-icon) {
    width: 48px;
    height: 48px;
    background: #eef2ff;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
}

:deep(.feature-icon svg) {
    color: var(--color-primary);
}

:deep(.feature-card h4) {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 8px;
}

:deep(.feature-card p) {
    font-size: var(--font-size-small);
    color: #64748b;
    margin: 0;
}

/* Search Tags */
:deep(.search-tags) {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin: 24px 0;
}

:deep(.tag) {
    padding: 8px 16px;
    background: #eef2ff;
    color: var(--color-primary);
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
}

/* Verification Steps */
:deep(.verification-steps) {
    margin: 32px 0;
}

:deep(.step) {
    display: flex;
    align-items:center;
    gap: 20px;
    margin-bottom: 24px;
}

:deep(.step-number) {
    width: 40px;
    height: 40px;
    background: var(--color-primary);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    flex-shrink: 0;
    line-height: 1.2;
}

:deep(.step-content h4) {
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
}

:deep(.step-content p) {
    font-size: 14px;
    color: #64748b;
    margin: 0;
}

/* Refund Policy */
:deep(.refund-policy) {
    background: #f8fafc;
    border-radius: 12px;
    padding: 24px;
    margin: 24px 0;
}

:deep(.policy-item) {
    display: flex;
    gap: 16px;
    align-items: start;
    margin-bottom: 16px;
}

:deep(.policy-item:last-child) {
    margin-bottom: 0;
}

:deep(.policy-icon) {
    flex-shrink: 0;
    margin-top: 2px;
}

:deep(.policy-icon.success) {
    color: #10b981;
}

:deep(.policy-icon.warning) {
    color: #f59e0b;
}

:deep(.policy-icon.error) {
    color: #ef4444;
}

/* Lesson Flow */
:deep(.lesson-flow) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 32px 0;
    padding: 32px;
    background: #f8fafc;
    border-radius: 12px;
    overflow-x: auto;
}

:deep(.flow-step) {
    text-align: center;
    flex: 1;
}

:deep(.flow-icon) {
    width: 56px;
    height: 56px;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

:deep(.flow-icon svg) {
    color: #667eea;
}

:deep(.flow-step h4) {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 8px;
}

:deep(.flow-step p) {
    font-size: var(--font-size-small);
    color: #64748b;
    margin: 0;
}

:deep(.flow-arrow) {
    font-size: var(--font-size-heading-4);
    color: #cbd5e1;
    margin: 0 16px;
}

/* Responsive */
@media (max-width: 1024px) {
    .terms-content .terms-container {
        grid-template-columns: 1fr;
    }

    .terms-sidebar {
        position: static;
        margin-bottom: 32px;
    }

    .sidebar-nav {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 8px;
    }

    .nav-item {
        margin-bottom: 0;
    }

    .nav-item:hover {
        transform: translateX(0);
        transform: translateY(-2px);
    }
}

@media (max-width: 768px) {
    .terms-header {
        padding: 60px 0 40px;
    }


    .terms-main {
        padding: 32px 24px;
    }

    :deep(.lesson-flow) {
        flex-direction: column;
        gap: 24px;
    }

    :deep(.flow-arrow) {
        transform: rotate(90deg);
        margin: 0;
    }

    .contact-card {
        padding: 32px 24px;
    }
}
</style>
