<script setup>
definePageMeta({
  	layout: false
})
import { ref, onMounted, onUnmounted } from 'vue'

const router = useRouter()
const { api } = useApi()
const { error: notifyError } = useNotification()

const activeSection = ref('introduction')
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

const fetchPrivacyData = async () => {
    loading.value = true
    try {
        const response = await api.apiGet('privacy')
        if (response.success && response.data) {
            sections.value = response.data.sections
            lastUpdated.value = response.data.last_updated
        }
    } catch (error) {
        console.error('Error fetching privacy data:', error)
        notifyError('Không thể tải dữ liệu chính sách bảo mật')
    } finally {
        loading.value = false
    }
}

const goBack = () => {
    router.back()
}

onMounted(() => {
    fetchPrivacyData()
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
<div class="privacy-page">
    <!-- Header Section -->
    <div class="privacy-header">
        <div class="privacy-container container">
            <div class="header-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <span>Bảo mật & Quyền riêng tư</span>
            </div>
            <h1 class="privacy-title">Chính sách bảo mật</h1>
            <p class="privacy-subtitle">Chúng tôi cam kết bảo vệ thông tin cá nhân và quyền riêng tư của bạn</p>
            <p class="privacy-date">Cập nhật lần cuối: {{ lastUpdated }}</p>
            <button class="btn-sm btn-white" @click="goBack">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Quay lại
            </button>
        </div>
    </div>

    <!-- Content Section -->
    <div class="privacy-content">
        <div class="privacy-container container">
            <!-- Sidebar Navigation -->
            <aside class="privacy-sidebar">
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
            <main class="privacy-main">
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

                <!-- Final CTA Section -->
                <section class="cta-section">
                    <div class="cta-card">
                        <svg class="cta-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                            <path d="M9 12l2 2 4-4"></path>
                        </svg>
                        <h3>An tâm với sự bảo mật</h3>
                        <p>Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn bằng các công nghệ bảo mật hàng đầu</p>
                        <div class="cta-buttons">
                            <NuxtLink to="/terms" class="cta-btn secondary">
                                Điều khoản sử dụng
                            </NuxtLink>
                            <NuxtLink to="/help" class="cta-btn primary">
                                Trung tâm hỗ trợ
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M5 12h14"></path>
                                    <path d="m12 5 7 7-7 7"></path>
                                </svg>
                            </NuxtLink>
                        </div>
                    </div>
                </section>
                </template>
            </main>
        </div>
    </div>
</div>
</template>

<style scoped>
.privacy-page {
    min-height: 100vh;
    background: #f8f9fa;
}

/* Header */
.privacy-header {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    padding: 80px 0 60px;
    color: white;
}

.privacy-container {
    margin: 0 auto;
    padding: 0 24px;
}

.header-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.2);
    padding: 8px 16px;
    border-radius: 20px;
    font-size: var(--font-size-small);
    font-weight: 500;
    margin-bottom: 24px;
    backdrop-filter: blur(10px);
}

.privacy-title {
    font-size: var(--font-size-heading-3);
    font-weight: 700;
    margin-bottom: 16px;
    line-height: 1.2;
}

.privacy-subtitle {
    font-size: var(--font-size-medium);
    opacity: 0.95;
    margin-bottom: 12px;
    line-height: 1.5;
}

.privacy-date {
    font-size: var(--font-size-small);
    opacity: 0.85;
}

/* Content Layout */
.privacy-content {
    padding: 4rem 0;
}

.privacy-content .privacy-container {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 48px;
    align-items: start;
}

/* Sidebar */
.privacy-sidebar {
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
    gap: 1rem;
    padding: 1rem 1.5rem;
    color: #64748b;
    text-decoration: none;
    border-radius: 10px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: var(--font-size-small);
    font-weight: 500;
    margin-bottom: 0.5rem;
    position: relative;
    overflow: hidden;
}

.nav-item::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 0.25rem;
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
    font-size: var(--font-size-small);
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
.privacy-main {
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
    font-size: var(--font-size-small);
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
    border-bottom: 3px solid var(--color-primary);
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
    font-size: var(--font-size-small);
    font-weight: 600;
    color: #334155;
    margin-bottom: 8px;
}

.section-content :deep(p) {
    margin-bottom: 16px;
}

.section-content :deep(ul),
.section-content :deep(ol) {
    margin-left: 24px;
    margin-bottom: 16px;
}

.section-content :deep(li) {
    margin-bottom: 8px;
}

.section-content :deep(strong) {
    color: #1e293b;
    font-weight: 600;
}

.section-content :deep(a) {
    color: var(--color-primary);
    text-decoration: none;
}

.section-content :deep(a:hover) {
    text-decoration: underline;
}

/* Highlight Box */
:deep(.highlight-box) {
    display: flex;
    gap: 20px;
    padding: 24px;
    background: linear-gradient(135deg, #eef2ff 0%, #f8fafc 100%);
    border-radius: 12px;
    border-left: 4px solid var(--color-primary);
    margin: 24px 0;
}

:deep(.highlight-icon) {
    flex-shrink: 0;
    color: var(--color-primary);
}

:deep(.highlight-box h4) {
    font-size: var(--font-size-medium);
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 8px;
}

:deep(.highlight-box p) {
    margin: 0;
    color: #475569;
}

/* Info Grid */
:deep(.info-grid) {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin: 24px 0;
}

:deep(.info-card) {
    padding: 24px;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
}

:deep(.info-icon) {
    width: 48px;
    height: 48px;
    background: #eef2ff;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
}

:deep(.info-icon svg) {
    color: var(--color-primary);
}

:deep(.info-card ul) {
    margin: 12px 0 0 0;
    padding: 0;
    list-style: none;
}

:deep(.info-card li) {
    padding: 6px 0;
    color: #64748b;
    font-size: var(--font-size-small);
}

/* Auto Info List */
:deep(.auto-info-list) {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin: 24px 0;
}

:deep(.auto-info-item) {
    display: flex;
    align-items: start;
    gap: 16px;
    padding: 16px;
    background: #f8fafc;
    border-radius: 10px;
}

:deep(.auto-info-item svg) {
    flex-shrink: 0;
    color: var(--color-primary);
    margin-top: 2px;
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

/* Usage Grid */
:deep(.usage-grid) {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
    margin: 32px 0;
}

:deep(.usage-card) {
    padding: 28px 24px;
    background: #f8fafc;
    border-radius: 12px;
    border: 2px solid #e2e8f0;
    transition: all 0.3s;
}

:deep(.usage-card:hover) {
    border-color: var(--color-primary);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
    transform: translateY(-4px);
}

:deep(.usage-number) {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    color: white;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: var(--font-size-medium);
    margin-bottom: 16px;
}

:deep(.usage-card h4) {
    font-size: var(--font-size-medium);
    margin-bottom: 12px;
}

:deep(.usage-card p) {
    font-size: var(--font-size-small);
    color: #64748b;
    margin: 0;
}

/* Partner List */
:deep(.partner-list) {
    display: grid;
    gap: 20px;
    margin: 24px 0;
}

:deep(.partner-item) {
    display: flex;
    gap: 16px;
    padding: 20px;
    background: #f8fafc;
    border-radius: 12px;
    border-left: 3px solid var(--color-primary);
}

:deep(.partner-item svg) {
    flex-shrink: 0;
    color: var(--color-primary);
    margin-top: 4px;
}

:deep(.partner-item strong) {
    display: block;
    margin-bottom: 4px;
}

:deep(.partner-item p) {
    margin: 0;
    font-size: var(--font-size-small);
    color: #64748b;
}

/* Security Grid */
:deep(.security-grid) {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
    margin: 32px 0;
}

:deep(.security-card) {
    padding: 32px 24px;
    background: #f8fafc;
    border-radius: 16px;
    text-align: center;
    border: 2px solid #e2e8f0;
    transition: all 0.3s;
}

:deep(.security-card:hover) {
    border-color: var(--color-primary);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.15);
    transform: translateY(-6px);
}

:deep(.security-icon) {
    width: 80px;
    height: 80px;
    background: white;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

:deep(.security-icon svg) {
    color: var(--color-primary);
}

:deep(.security-card h4) {
    font-size: var(--font-size-medium);
    margin-bottom: 12px;
}

:deep(.security-card p) {
    font-size: var(--font-size-small);
    color: #64748b;
    margin: 0;
}

/* Rights List */
:deep(.rights-list) {
    display: grid;
    gap: 20px;
    margin: 32px 0;
}

:deep(.right-item) {
    display: flex;
    gap: 20px;
    padding: 24px;
    background: #f8fafc;
    border-radius: 12px;
    transition: all 0.3s;
}

:deep(.right-item:hover) {
    background: #eef2ff;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

:deep(.right-icon) {
    width: 56px;
    height: 56px;
    background: white;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border: 2px solid #e2e8f0;
}

:deep(.right-icon svg) {
    color: var(--color-primary);
}

:deep(.right-content h4) {
    font-size: var(--font-size-medium);
    margin-bottom: 8px;
}

:deep(.right-content p) {
    font-size: var(--font-size-small);
    color: #64748b;
    margin: 0;
}

/* Cookie Types */
:deep(.cookie-types) {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 20px;
    margin: 24px 0;
}

:deep(.cookie-type) {
    padding: 24px;
    background: #f8fafc;
    border-radius: 12px;
    border: 2px solid #e2e8f0;
}

:deep(.cookie-badge) {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: var(--font-size-small);
    font-weight: 600;
    text-transform: uppercase;
    margin-bottom: 12px;
}

:deep(.cookie-badge.essential) {
    background: #fee2e2;
    color: #dc2626;
}

:deep(.cookie-badge.functional) {
    background: #dbeafe;
    color: #2563eb;
}

:deep(.cookie-badge.performance) {
    background: #d1fae5;
    color: #059669;
}

:deep(.cookie-badge.marketing) {
    background: #fef3c7;
    color: #d97706;
}

:deep(.cookie-type h4) {
    margin-bottom: 8px;
}

:deep(.cookie-type p) {
    font-size: var(--font-size-small);
    color: #64748b;
    margin-bottom: 12px;
}

:deep(.cookie-duration) {
    font-size: var(--font-size-small);
    color: #94a3b8;
    font-style: italic;
}

/* Retention Timeline */
:deep(.retention-timeline) {
    margin: 32px 0;
    position: relative;
    padding-left: 40px;
}

:deep(.retention-timeline::before) {
    content: '';
    position: absolute;
    left: 15px;
    top: 12px;
    bottom: 12px;
    width: 2px;
    background: linear-gradient(180deg, var(--color-primary) 0%, transparent 100%);
}

:deep(.timeline-item) {
    position: relative;
    margin-bottom: 32px;
}

:deep(.timeline-dot) {
    position: absolute;
    left: -32px;
    top: 4px;
    width: 12px;
    height: 12px;
    background: var(--color-primary);
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

:deep(.timeline-content h4) {
    margin-bottom: 8px;
}

:deep(.timeline-content p) {
    font-size: var(--font-size-small);
    color: #64748b;
    margin: 0;
}

/* Notification Methods */
:deep(.notification-methods) {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin: 24px 0;
}

:deep(.method-item) {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    background: #f8fafc;
    border-radius: 10px;
}

:deep(.method-item svg) {
    flex-shrink: 0;
    color: var(--color-primary);
}

/* Contact Grid */
:deep(.contact-grid) {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 24px;
    margin: 32px 0;
}

:deep(.contact-card) {
    padding: 32px 24px;
    background: #f8fafc;
    border-radius: 16px;
    text-align: center;
    border: 2px solid #e2e8f0;
    transition: all 0.3s;
}

:deep(.contact-card:hover) {
    border-color: var(--color-primary);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.15);
    transform: translateY(-4px);
}

:deep(.contact-icon) {
    width: 64px;
    height: 64px;
    background: white;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

:deep(.contact-icon svg) {
    color: var(--color-primary);
}

:deep(.contact-card h4) {
    font-size: var(--font-size-medium);
    margin-bottom: 12px;
}

:deep(.contact-card a) {
    display: block;
    font-size: var(--font-size-small);
    font-weight: 600;
    color: var(--color-primary);
    margin-bottom: 8px;
    text-decoration: none;
}

:deep(.contact-card a:hover) {
    text-decoration: underline;
}

:deep(.contact-note) {
    font-size: var(--font-size-small);
    color: #94a3b8;
    margin: 0;
}

/* CTA Section */
:deep(.cta-section) {
    margin-top: 64px;
    padding-top: 48px;
    border-top: 2px solid #e2e8f0;
}

:deep(.cta-card) {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    color: white;
    padding: 56px 48px;
    border-radius: 20px;
    text-align: center;
    box-shadow: 0 12px 32px rgba(102, 126, 234, 0.25);
}

:deep(.cta-icon) {
    margin: 0 auto 24px;
}

:deep(.cta-card h3) {
    font-size: var(--font-size-heading-3);
    font-weight: 700;
    margin-bottom: 16px;
}

:deep(.cta-card p) {
    font-size: var(--font-size-medium);
    opacity: 0.95;
    margin-bottom: 32px;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
}

:deep(.cta-buttons) {
    display: flex;
    gap: 16px;
    justify-content: center;
    flex-wrap: wrap;
}

:deep(.cta-btn) {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 14px 32px;
    border-radius: 10px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.3s;
    font-size: var(--font-size-small);
}

:deep(.cta-btn.primary) {
    background: white;
    color: var(--color-primary);
}

:deep(.cta-btn.primary:hover) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(255, 255, 255, 0.3);
}

:deep(.cta-btn.secondary) {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 2px solid white;
    backdrop-filter: blur(10px);
}

:deep(.cta-btn.secondary:hover) {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 1024px) {
    :deep(.privacy-content .privacy-container) {
        grid-template-columns: 1fr;
    }

    :deep(.privacy-sidebar) {
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
    :deep(.privacy-header) {
        padding: 60px 0 40px;
    }

    :deep(.privacy-main) {
        padding: 32px 24px;
    }

    :deep(.info-grid),
    :deep(.usage-grid),
    :deep(.security-grid),
    :deep(.cookie-types),
    :deep(.contact-grid) {
        grid-template-columns: 1fr;
    }

    :deep(.cta-card) {
        padding: 40px 24px;
    }

    :deep(.cta-card h3) {
        font-size: 24px;
    }

    :deep(.cta-buttons) {
        flex-direction: column;
    }

    :deep(.cta-btn) {
        width: 100%;
        justify-content: center;
    }
}
</style>
