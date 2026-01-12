<script setup>
definePageMeta({
  	layout: false
})

import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router';
const router = useRouter();
const config = useRuntimeConfig();

const activeSection = ref('getting-started')
const lastUpdated = ref(new Date().toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' }))
const loading = ref(false)

const sections = ref([
    {
        id: 'getting-started',
        title: 'Bắt đầu với TutorFind'
    },
    {
        id: 'for-students',
        title: 'Hướng dẫn cho Học sinh'
    },
    {
        id: 'for-tutors',
        title: 'Hướng dẫn cho Gia sư'
    },
    {
        id: 'booking-process',
        title: 'Quy trình đặt lịch học'
    },
    {
        id: 'payment-guide',
        title: 'Hướng dẫn thanh toán'
    },
    {
        id: 'classroom-guide',
        title: 'Sử dụng lớp học trực tuyến'
    },
    {
        id: 'faq',
        title: 'Câu hỏi thường gặp'
    }
])

const scrollToSection = (sectionId) => {
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
    const scrollPosition = window.scrollY + 150

    for (let i = sections.value.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections.value[i].id)
        if (section && section.offsetTop <= scrollPosition) {
            activeSection.value = sections.value[i].id
            break
        }
    }
}

onMounted(() => {
    window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
})

const goBack = () => {
    router.go(-1)
}

// SEO Meta
const metaTitle = 'Hướng dẫn sử dụng - TutorFind';
const metaDescription = 'Hướng dẫn chi tiết cách sử dụng TutorFind cho học sinh và gia sư. Tìm hiểu cách đăng ký, đặt lịch học, thanh toán và sử dụng lớp học trực tuyến.';
const metaUrl = computed(() => {
    const baseUrl = config.public.baseUrl || (process.client ? window.location.origin : '');
    return `${baseUrl}/guide`;
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

</script>

<template>
<div class="guide-page">
    <!-- Header Section -->
    <div class="guide-header">
        <div class="guide-container container">
            <h1 class="guide-title">Hướng dẫn sử dụng</h1>
            <p class="guide-subtitle">Cập nhật lần cuối: {{ lastUpdated }}</p>
            <button class="btn-sm btn-white" @click="goBack">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Quay lại
            </button>
        </div>
    </div>

    <!-- Content Section -->
    <div class="guide-content">
        <div class="guide-container container">
            <!-- Sidebar Navigation -->
            <aside class="guide-sidebar">
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
            <main class="guide-main">
                <!-- Getting Started -->
                <section id="getting-started" class="content-section">
                    <h2 class="section-title">Bắt đầu với TutorFind</h2>
                    <div class="section-content">
                        <p>Chào mừng bạn đến với <strong>TutorFind</strong> - nền tảng kết nối gia sư và học sinh trực tuyến hàng đầu Việt Nam!</p>

                        <h3>Giới thiệu về TutorFind</h3>
                        <p>TutorFind là nền tảng giáo dục trực tuyến cho phép:</p>
                        <ul>
                            <li><strong>Học sinh:</strong> Tìm kiếm và đặt lịch học với gia sư chất lượng cao</li>
                            <li><strong>Gia sư:</strong> Tạo hồ sơ, quản lý lịch dạy và nhận thanh toán trực tuyến</li>
                        </ul>

                        <div class="info-box">
                            <svg class="info-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                            <div>
                                <strong>Mẹo:</strong> Bạn có thể đăng ký bằng email, số điện thoại hoặc tài khoản Google/Facebook để bắt đầu nhanh chóng.
                            </div>
                        </div>

                        <h3>Lợi ích khi sử dụng TutorFind</h3>
                        <div class="feature-grid">
                            <div class="feature-card">
                                <div class="feature-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                    </svg>
                                </div>
                                <h4>Học mọi lúc mọi nơi</h4>
                                <p>Linh hoạt về thời gian và địa điểm học tập</p>
                            </div>
                            <div class="feature-card">
                                <div class="feature-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="9" cy="7" r="4"></circle>
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                    </svg>
                                </div>
                                <h4>1000+ Gia sư chất lượng</h4>
                                <p>Đội ngũ gia sư được kiểm tra và đánh giá</p>
                            </div>
                            <div class="feature-card">
                                <div class="feature-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                    </svg>
                                </div>
                                <h4>Thanh toán an toàn</h4>
                                <p>Hỗ trợ nhiều phương thức thanh toán</p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- For Students -->
                <section id="for-students" class="content-section">
                    <h2 class="section-title">Hướng dẫn cho Học sinh</h2>
                    <div class="section-content">
                        <h3>Bước 1: Đăng ký và đăng nhập</h3>
                        <div class="verification-steps">
                            <div class="step">
                                <div class="step-number">1</div>
                                <div class="step-content">
                                    <h4>Truy cập trang Đăng ký</h4>
                                    <p>Nhấp vào nút "Đăng ký" ở góc phải màn hình hoặc truy cập <NuxtLink to="/register">/register</NuxtLink></p>
                                </div>
                            </div>
                            <div class="step">
                                <div class="step-number">2</div>
                                <div class="step-content">
                                    <h4>Chọn vai trò Học sinh</h4>
                                    <p>Chọn "Học sinh" khi đăng ký để tìm kiếm gia sư</p>
                                </div>
                            </div>
                            <div class="step">
                                <div class="step-number">3</div>
                                <div class="step-content">
                                    <h4>Điền thông tin cá nhân</h4>
                                    <p>Nhập họ tên, email, số điện thoại và mật khẩu. Chọn trình độ học vấn của bạn.</p>
                                </div>
                            </div>
                            <div class="step">
                                <div class="step-number">4</div>
                                <div class="step-content">
                                    <h4>Xác nhận và hoàn tất</h4>
                                    <p>Đồng ý với điều khoản sử dụng và nhấp "Đăng ký". Bạn sẽ được chuyển đến trang chủ.</p>
                                </div>
                            </div>
                        </div>

                        <div class="info-box">
                            <svg class="info-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                            <div>
                                <strong>Lưu ý:</strong> Bạn cũng có thể đăng nhập nhanh bằng tài khoản Google hoặc Facebook để tiết kiệm thời gian.
                            </div>
                        </div>

                        <h3>Bước 2: Tìm kiếm gia sư</h3>
                        <p>Để tìm gia sư phù hợp với nhu cầu của bạn:</p>
                        <ol>
                            <li><strong>Truy cập trang Tìm kiếm:</strong> Nhấp vào "Tìm gia sư" trên thanh menu hoặc truy cập <NuxtLink to="/search">/search</NuxtLink></li>
                            <li><strong>Sử dụng bộ lọc:</strong>
                                <ul>
                                    <li>Chọn <strong>Tỉnh/Thành phố</strong> nơi bạn muốn học</li>
                                    <li>Chọn <strong>Môn học</strong> cần học</li>
                                    <li>Chọn <strong>Trình độ</strong> (Tiểu học, THCS, THPT, Đại học...)</li>
                                    <li>Chọn <strong>Kinh nghiệm</strong> của gia sư (Mới bắt đầu, Trung bình, Nhiều kinh nghiệm...)</li>
                                </ul>
                            </li>
                            <li><strong>Xem kết quả:</strong> Danh sách gia sư phù hợp sẽ hiển thị với thông tin chi tiết</li>
                            <li><strong>Xem chi tiết:</strong> Nhấp vào thẻ gia sư để xem đầy đủ thông tin, đánh giá và giá cả</li>
                        </ol>

                        <h3>Bước 3: Đặt lịch học</h3>
                        <p>Sau khi chọn được gia sư phù hợp:</p>
                        <div class="lesson-flow">
                            <div class="flow-step">
                                <div class="flow-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                    </svg>
                                </div>
                                <h4>Chọn ngày</h4>
                                <p>Chọn ngày học phù hợp trong lịch</p>
                            </div>
                            <div class="flow-arrow">→</div>
                            <div class="flow-step">
                                <div class="flow-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 6 12 12 16 14"></polyline>
                                    </svg>
                                </div>
                                <h4>Chọn giờ</h4>
                                <p>Chọn khung giờ học trong ngày</p>
                            </div>
                            <div class="flow-arrow">→</div>
                            <div class="flow-step">
                                <div class="flow-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                    </svg>
                                </div>
                                <h4>Điền thông tin</h4>
                                <p>Chọn môn học, trình độ và ghi chú</p>
                            </div>
                            <div class="flow-arrow">→</div>
                            <div class="flow-step">
                                <div class="flow-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <line x1="12" y1="1" x2="12" y2="23"></line>
                                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                    </svg>
                                </div>
                                <h4>Thanh toán</h4>
                                <p>Chọn phương thức thanh toán và hoàn tất</p>
                            </div>
                        </div>

                        <h3>Bước 4: Tham gia lớp học</h3>
                        <ol>
                            <li>Sau khi đặt lịch thành công, bạn sẽ nhận được thông báo xác nhận</li>
                            <li>Vào ngày giờ đã đặt, truy cập <strong>Quản lý đặt lịch</strong> để vào lớp học</li>
                            <li>Nhấp nút <strong>"Vào lớp học"</strong> để tham gia phòng học trực tuyến</li>
                            <li>Sử dụng tính năng video call, chia sẻ màn hình và chat trong lớp học</li>
                        </ol>
                    </div>
                </section>

                <!-- For Tutors -->
                <section id="for-tutors" class="content-section">
                    <h2 class="section-title">Hướng dẫn cho Gia sư</h2>
                    <div class="section-content">
                        <h3>Bước 1: Đăng ký và chọn vai trò Gia sư</h3>
                        <ol>
                            <li>Đăng ký tài khoản mới hoặc đăng nhập bằng Google/Facebook</li>
                            <li>Chọn vai trò <strong>"Gia sư"</strong> khi đăng ký hoặc trong trang chọn vai trò</li>
                            <li>Hoàn tất đăng ký và bạn sẽ được chuyển đến trang quản lý hồ sơ</li>
                        </ol>

                        <h3>Bước 2: Hoàn thiện hồ sơ gia sư</h3>
                        <p>Để nhận được nhiều yêu cầu từ học sinh, bạn cần hoàn thiện hồ sơ:</p>
                        <div class="verification-steps">
                            <div class="step">
                                <div class="step-number">1</div>
                                <div class="step-content">
                                    <h4>Thông tin cơ bản</h4>
                                    <p>Thêm ảnh đại diện, Giới thiệu bản thân, địa chỉ liên hệ</p>
                                </div>
                            </div>
                            <div class="step">
                                <div class="step-number">2</div>
                                <div class="step-content">
                                    <h4>Học vấn</h4>
                                    <p>Thêm bằng cấp, trường học và năm tốt nghiệp</p>
                                </div>
                            </div>
                            <div class="step">
                                <div class="step-number">3</div>
                                <div class="step-content">
                                    <h4>Kinh nghiệm giảng dạy</h4>
                                    <p>Thêm các kinh nghiệm giảng dạy, nơi làm việc và thời gian</p>
                                </div>
                            </div>
                            <div class="step">
                                <div class="step-number">4</div>
                                <div class="step-content">
                                    <h4>Môn dạy</h4>
                                    <p>Chọn các môn học bạn có thể dạy và trình độ phù hợp</p>
                                </div>
                            </div>
                            <div class="step">
                                <div class="step-number">6</div>
                                <div class="step-content">
                                    <h4>Lịch dạy</h4>
                                    <p>Thiết lập lịch dạy hàng tuần để học sinh có thể đặt lịch</p>
                                </div>
                            </div>
                        </div>

                        <div class="warning-box">
                            <svg class="warning-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                <line x1="12" y1="9" x2="12" y2="13"></line>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                            <div>
                                <strong>Quan trọng:</strong> Hồ sơ càng đầy đủ, bạn càng có nhiều cơ hội được học sinh lựa chọn. Hãy dành thời gian để hoàn thiện tất cả các phần.
                            </div>
                        </div>

                        <h3>Bước 3: Quản lý yêu cầu đặt lịch</h3>
                        <p>Khi có học sinh đặt lịch với bạn:</p>
                        <ol>
                            <li>Bạn sẽ nhận được thông báo về yêu cầu đặt lịch mới</li>
                            <li>Truy cập <strong>Quản lý đặt lịch</strong> để xem chi tiết</li>
                            <li>Xem thông tin học sinh, môn học, thời gian và ghi chú</li>
                            <li>Xác nhận hoặc từ chối yêu cầu (nếu có)</li>
                        </ol>

                        <h3>Bước 4: Tiến hành lớp học</h3>
                        <ol>
                            <li>Vào đúng giờ đã hẹn, truy cập lớp học từ trang quản lý</li>
                            <li>Nhấp <strong>"Bắt đầu lớp học"</strong> để tạo phòng học trực tuyến</li>
                            <li>Sử dụng video call, chia sẻ màn hình và bảng trắng để giảng dạy</li>
                            <li>Kết thúc lớp học khi hoàn tất</li>
                        </ol>

                        <h3>Bước 5: Quản lý thanh toán</h3>
                        <ol>
                            <li>Truy cập <strong>Ví</strong> trong trang quản lý để xem số dư</li>
                            <li>Xem lịch sử giao dịch và thanh toán đã nhận</li>
                            <li>Cập nhật thông tin ngân hàng để nhận tiền</li>
                            <li>Yêu cầu rút tiền khi số dư đủ điều kiện</li>
                        </ol>
                    </div>
                </section>

                <!-- Booking Process -->
                <section id="booking-process" class="content-section">
                    <h2 class="section-title">Quy trình đặt lịch học</h2>
                    <div class="section-content">
                        <h3>Tổng quan quy trình</h3>
                        <p>Quy trình đặt lịch học trên TutorFind được thiết kế đơn giản và nhanh chóng:</p>

                        <div class="lesson-flow">
                            <div class="flow-step">
                                <div class="flow-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <path d="m21 21-4.35-4.35"></path>
                                    </svg>
                                </div>
                                <h4>Tìm gia sư</h4>
                                <p>Tìm kiếm và chọn gia sư phù hợp</p>
                            </div>
                            <div class="flow-arrow">→</div>
                            <div class="flow-step">
                                <div class="flow-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                    </svg>
                                </div>
                                <h4>Chọn thời gian</h4>
                                <p>Chọn ngày và giờ học</p>
                            </div>
                            <div class="flow-arrow">→</div>
                            <div class="flow-step">
                                <div class="flow-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <line x1="12" y1="1" x2="12" y2="23"></line>
                                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                    </svg>
                                </div>
                                <h4>Thanh toán</h4>
                                <p>Chọn phương thức và thanh toán</p>
                            </div>
                            <div class="flow-arrow">→</div>
                            <div class="flow-step">
                                <div class="flow-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                    </svg>
                                </div>
                                <h4>Xác nhận</h4>
                                <p>Nhận thông báo xác nhận</p>
                            </div>
                        </div>

                        <h3>Chi tiết từng bước</h3>
                        <h4>1. Chọn gia sư</h4>
                        <ul>
                            <li>Truy cập trang <NuxtLink to="/search">Tìm kiếm</NuxtLink></li>
                            <li>Sử dụng bộ lọc để tìm gia sư phù hợp</li>
                            <li>Xem chi tiết hồ sơ, đánh giá và giá cả</li>
                            <li>Nhấp "Đặt lịch học" trên trang chi tiết gia sư</li>
                        </ul>

                        <h4>2. Điền thông tin đặt lịch</h4>
                        <ul>
                            <li><strong>Chọn ngày:</strong> Chọn ngày học từ lịch có sẵn của gia sư</li>
                            <li><strong>Chọn giờ:</strong> Chọn khung giờ phù hợp trong ngày</li>
                            <li><strong>Chọn môn học:</strong> Chọn môn cần học từ danh sách môn gia sư dạy</li>
                            <li><strong>Chọn trình độ:</strong> Chọn trình độ học vấn của bạn</li>
                            <li><strong>Chọn loại buổi học:</strong> Chọn buổi học đơn lẻ hoặc gói học</li>
                            <li><strong>Thời lượng:</strong> Chọn số giờ học (1-3 giờ)</li>
                            <li><strong>Ghi chú:</strong> Thêm ghi chú nếu cần (tùy chọn)</li>
                        </ul>

                        <h4>3. Xác nhận và thanh toán</h4>
                        <ul>
                            <li>Xem lại thông tin đặt lịch và tổng tiền</li>
                            <li>Chọn phương thức thanh toán (VNPay, MoMo, ZaloPay)</li>
                            <li>Nhấp "Xác nhận và thanh toán"</li>
                            <li>Chuyển đến trang thanh toán của cổng thanh toán</li>
                            <li>Hoàn tất thanh toán</li>
                            <li>Quay lại trang TutorFind để xem xác nhận</li>
                        </ul>
                    </div>
                </section>

                <!-- Payment Guide -->
                <section id="payment-guide" class="content-section">
                    <h2 class="section-title">Hướng dẫn thanh toán</h2>
                    <div class="section-content">
                        <h3>Các phương thức thanh toán</h3>
                        <p>TutorFind hỗ trợ các phương thức thanh toán phổ biến tại Việt Nam:</p>

                        <div class="feature-grid">
                            <div class="feature-card">
                                <div class="feature-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                        <line x1="1" y1="10" x2="23" y2="10"></line>
                                    </svg>
                                </div>
                                <h4>VNPay</h4>
                                <p>Thanh toán qua thẻ ngân hàng, ví điện tử VNPay</p>
                            </div>
                            <div class="feature-card">
                                <div class="feature-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                        <line x1="1" y1="10" x2="23" y2="10"></line>
                                    </svg>
                                </div>
                                <h4>MoMo</h4>
                                <p>Thanh toán nhanh chóng qua ví MoMo</p>
                            </div>
                            <div class="feature-card">
                                <div class="feature-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                        <line x1="1" y1="10" x2="23" y2="10"></line>
                                    </svg>
                                </div>
                                <h4>ZaloPay</h4>
                                <p>Thanh toán tiện lợi qua ví ZaloPay</p>
                            </div>
                        </div>

                        <h3>Quy trình thanh toán</h3>
                        <div class="verification-steps">
                            <div class="step">
                                <div class="step-number">1</div>
                                <div class="step-content">
                                    <h4>Chọn phương thức</h4>
                                    <p>Chọn một trong các phương thức thanh toán khi đặt lịch</p>
                                </div>
                            </div>
                            <div class="step">
                                <div class="step-number">2</div>
                                <div class="step-content">
                                    <h4>Chuyển hướng</h4>
                                    <p>Hệ thống sẽ chuyển bạn đến trang thanh toán của cổng thanh toán</p>
                                </div>
                            </div>
                            <div class="step">
                                <div class="step-number">3</div>
                                <div class="step-content">
                                    <h4>Xác nhận thanh toán</h4>
                                    <p>Nhập thông tin thanh toán và xác nhận trên cổng thanh toán</p>
                                </div>
                            </div>
                            <div class="step">
                                <div class="step-number">4</div>
                                <div class="step-content">
                                    <h4>Hoàn tất</h4>
                                    <p>Nhận xác nhận và quay lại TutorFind để xem đặt lịch</p>
                                </div>
                            </div>
                        </div>

                        <div class="info-box">
                            <svg class="info-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                            <div>
                                <strong>Lưu ý:</strong> Thanh toán được xử lý an toàn qua các cổng thanh toán uy tín. TutorFind không lưu trữ thông tin thẻ ngân hàng của bạn.
                            </div>
                        </div>

                        <h3>Chính sách hoàn tiền</h3>
                        <div class="refund-policy">
                            <div class="policy-item">
                                <svg class="policy-icon success" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                <div>
                                    <strong>Hoàn tiền 100%</strong> nếu gia sư hủy buổi học trước 24 giờ
                                </div>
                            </div>
                            <div class="policy-item">
                                <svg class="policy-icon success" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                <div>
                                    <strong>Hoàn tiền 50%</strong> nếu học sinh hủy buổi học trước 24 giờ
                                </div>
                            </div>
                            <div class="policy-item">
                                <svg class="policy-icon warning" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                                <div>
                                    <strong>Không hoàn tiền</strong> nếu hủy trong vòng 24 giờ trước buổi học
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Classroom Guide -->
                <section id="classroom-guide" class="content-section">
                    <h2 class="section-title">Sử dụng lớp học trực tuyến</h2>
                    <div class="section-content">
                        <h3>Giới thiệu lớp học trực tuyến</h3>
                        <p>Lớp học trực tuyến của TutorFind sử dụng công nghệ WebRTC để mang đến trải nghiệm học tập tốt nhất:</p>
                        <ul>
                            <li>Video call chất lượng cao</li>
                            <li>Chia sẻ màn hình</li>
                            <li>Bảng trắng tương tác</li>
                            <li>Chat trực tuyến</li>
                        </ul>

                        <h3>Hướng dẫn tham gia lớp học (Học sinh)</h3>
                        <div class="verification-steps">
                            <div class="step">
                                <div class="step-number">1</div>
                                <div class="step-content">
                                    <h4>Truy cập lớp học</h4>
                                    <p>Vào đúng giờ đã hẹn, truy cập trang <strong>Quản lý đặt lịch</strong></p>
                                </div>
                            </div>
                            <div class="step">
                                <div class="step-number">2</div>
                                <div class="step-content">
                                    <h4>Vào lớp học</h4>
                                    <p>Nhấp nút <strong>"Vào lớp học"</strong> trên đặt lịch tương ứng</p>
                                </div>
                            </div>
                            <div class="step">
                                <div class="step-number">3</div>
                                <div class="step-content">
                                    <h4>Cho phép quyền</h4>
                                    <p>Cho phép quyền truy cập camera và microphone khi trình duyệt yêu cầu</p>
                                </div>
                            </div>
                            <div class="step">
                                <div class="step-number">4</div>
                                <div class="step-content">
                                    <h4>Bắt đầu học</h4>
                                    <p>Sử dụng các tính năng video, chia sẻ màn hình và chat để học tập</p>
                                </div>
                            </div>
                        </div>

                        <h3>Hướng dẫn tạo lớp học (Gia sư)</h3>
                        <div class="verification-steps">
                            <div class="step">
                                <div class="step-number">1</div>
                                <div class="step-content">
                                    <h4>Truy cập quản lý</h4>
                                    <p>Vào đúng giờ đã hẹn, truy cập trang <strong>Quản lý đặt lịch</strong></p>
                                </div>
                            </div>
                            <div class="step">
                                <div class="step-number">2</div>
                                <div class="step-content">
                                    <h4>Bắt đầu lớp học</h4>
                                    <p>Nhấp nút <strong>"Bắt đầu lớp học"</strong> để tạo phòng học</p>
                                </div>
                            </div>
                            <div class="step">
                                <div class="step-number">3</div>
                                <div class="step-content">
                                    <h4>Kiểm tra thiết bị</h4>
                                    <p>Kiểm tra camera, microphone và kết nối internet</p>
                                </div>
                            </div>
                            <div class="step">
                                <div class="step-number">4</div>
                                <div class="step-content">
                                    <h4>Giảng dạy</h4>
                                    <p>Sử dụng video, chia sẻ màn hình, bảng trắng để giảng dạy</p>
                                </div>
                            </div>
                            <div class="step">
                                <div class="step-number">5</div>
                                <div class="step-content">
                                    <h4>Kết thúc</h4>
                                    <p>Nhấp <strong>"Kết thúc lớp học"</strong> khi hoàn tất</p>
                                </div>
                            </div>
                        </div>

                        <h3>Các tính năng trong lớp học</h3>
                        <div class="feature-grid">
                            <div class="feature-card">
                                <div class="feature-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                        <circle cx="12" cy="13" r="4"></circle>
                                    </svg>
                                </div>
                                <h4>Video Call</h4>
                                <p>Giao tiếp trực tiếp với chất lượng cao</p>
                            </div>
                            <div class="feature-card">
                                <div class="feature-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                                        <line x1="8" y1="21" x2="16" y2="21"></line>
                                        <line x1="12" y1="17" x2="12" y2="21"></line>
                                    </svg>
                                </div>
                                <h4>Chia sẻ màn hình</h4>
                                <p>Chia sẻ màn hình để trình bày bài học</p>
                            </div>
                            <div class="feature-card">
                                <div class="feature-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                    </svg>
                                </div>
                                <h4>Chat</h4>
                                <p>Nhắn tin trong quá trình học</p>
                            </div>
                        </div>

                        <div class="warning-box">
                            <svg class="warning-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                <line x1="12" y1="9" x2="12" y2="13"></line>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                            <div>
                                <strong>Lưu ý:</strong> Để có trải nghiệm tốt nhất, hãy đảm bảo kết nối internet ổn định và sử dụng trình duyệt Chrome hoặc Edge mới nhất.
                            </div>
                        </div>
                    </div>
                </section>

                <!-- FAQ -->
                <section id="faq" class="content-section">
                    <h2 class="section-title">Câu hỏi thường gặp</h2>
                    <div class="section-content">
                        <h3>Câu hỏi chung</h3>

                        <h4>Làm thế nào để đăng ký tài khoản?</h4>
                        <p>Bạn có thể đăng ký bằng cách:</p>
                        <ul>
                            <li>Truy cập trang <NuxtLink to="/register">Đăng ký</NuxtLink></li>
                            <li>Điền thông tin cá nhân và chọn vai trò</li>
                            <li>Hoặc đăng nhập nhanh bằng Google/Facebook</li>
                        </ul>

                        <h4>Tôi có thể đổi vai trò sau khi đăng ký không?</h4>
                        <p>Hiện tại, bạn cần chọn vai trò khi đăng ký. Nếu muốn đổi vai trò, vui lòng liên hệ hỗ trợ.</p>

                        <h4>Phí sử dụng dịch vụ là bao nhiêu?</h4>
                        <p>Đăng ký và tạo tài khoản trên TutorFind là hoàn toàn miễn phí. Bạn chỉ phải trả học phí khi đặt lịch học với gia sư.</p>

                        <h3>Câu hỏi về đặt lịch</h3>

                        <h4>Tôi có thể hủy buổi học không?</h4>
                        <p>Có, bạn có thể hủy buổi học trong <strong>Quản lý đặt lịch</strong>. Tuy nhiên, chính sách hoàn tiền phụ thuộc vào thời gian hủy:</p>
                        <ul>
                            <li>Hủy trước 24 giờ: Hoàn tiền 50%</li>
                            <li>Hủy trong vòng 24 giờ: Không hoàn tiền</li>
                        </ul>

                        <h4>Làm thế nào để biết gia sư đã chấp nhận đặt lịch?</h4>
                        <p>Bạn sẽ nhận được thông báo qua email và trên trang web khi gia sư xác nhận đặt lịch của bạn.</p>

                        <h4>Tôi có thể đặt nhiều buổi học cùng lúc không?</h4>
                        <p>Có, bạn có thể đặt nhiều buổi học với cùng hoặc khác gia sư. Tuy nhiên, hãy đảm bảo thời gian không bị trùng nhau.</p>

                        <h3>Câu hỏi về thanh toán</h3>

                        <h4>Các phương thức thanh toán nào được hỗ trợ?</h4>
                        <p>TutorFind hỗ trợ thanh toán qua VNPay, MoMo và ZaloPay.</p>

                        <h4>Tôi đã thanh toán nhưng không nhận được xác nhận, phải làm sao?</h4>
                        <p>Hãy kiểm tra email hoặc liên hệ hỗ trợ với mã giao dịch để được giải quyết nhanh chóng.</p>

                        <h4>Khi nào gia sư nhận được thanh toán?</h4>
                        <p>Gia sư sẽ nhận được thanh toán sau khi hoàn tất buổi học và học sinh xác nhận.</p>

                        <h3>Câu hỏi về lớp học</h3>

                        <h4>Tôi không thể vào lớp học, phải làm sao?</h4>
                        <p>Hãy thử:</p>
                        <ul>
                            <li>Kiểm tra kết nối internet</li>
                            <li>Làm mới trang (F5)</li>
                            <li>Cho phép quyền camera và microphone</li>
                            <li>Thử trình duyệt khác (Chrome, Edge)</li>
                        </ul>

                        <h4>Lớp học kéo dài bao lâu?</h4>
                        <p>Thời lượng lớp học phụ thuộc vào gói bạn đã chọn khi đặt lịch, thường từ 1-3 giờ.</p>

                        <h4>Tôi có thể ghi lại buổi học không?</h4>
                        <p>Hiện tại tính năng ghi lại buổi học chưa được hỗ trợ. Chúng tôi đang nỗ lực phát triển tính năng này.</p>
                    </div>
                </section>

                <!-- Contact Section -->
                <section class="contact-section">
                    <div class="contact-card">
                        <svg class="contact-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <h3>Bạn cần hỗ trợ thêm?</h3>
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
            </main>
        </div>
    </div>
</div>
</template>

<style scoped>
.guide-page {
    min-height: 100vh;
    background: #f8f9fa;
}

/* Header */
.guide-header {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    padding: 80px 0 60px;
    color: white;
}

.guide-container {
    margin: 0 auto;
    padding: 0 24px;
}

.guide-title {
    font-size: var(--font-size-heading-4);
    font-weight: 700;
    margin-bottom: 16px;
    line-height: 1.2;
}

.guide-subtitle {
    font-size: var(--font-size-base);
    opacity: 0.9;
}

/* Content Layout */
.guide-content {
    padding: 60px 0;
}

.guide-content .guide-container {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 48px;
    align-items: start;
}

/* Sidebar */
.guide-sidebar {
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
.guide-main {
    background: white;
    border-radius: 16px;
    padding: 48px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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

.section-content h3 {
    font-size: var(--font-size-medium);
    font-weight: 600;
    color: #334155;
    margin-top: 32px;
    margin-bottom: 16px;
}

.section-content h4 {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: #334155;
    margin-top: 24px;
    margin-bottom: 12px;
}

.section-content p {
    margin-bottom: 16px;
}

.section-content ul,
.section-content ol {
    margin-left: 24px;
    margin-bottom: 16px;
}

.section-content li {
    margin-bottom: 8px;
}

.section-content strong {
    color: #1e293b;
    font-weight: 600;
}

.section-content a {
    color: var(--color-primary);
    text-decoration: none;
}

.section-content a:hover {
    text-decoration: underline;
}

/* Info Box */
.info-box,
.warning-box {
    display: flex;
    gap: 16px;
    padding: 20px;
    border-radius: 12px;
    margin: 24px 0;
}

.info-box {
    background: #eff6ff;
    border-left: 4px solid var(--color-primary);
}

.warning-box {
    background: #fff7ed;
    border-left: 4px solid #f59e0b;
}

.info-icon,
.warning-icon {
    flex-shrink: 0;
    color: var(--color-primary);
}

.warning-icon {
    color: #f59e0b;
}

/* Feature Grid */
.feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 24px;
    margin: 24px 0;
}

.feature-card {
    padding: 24px;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
}

.feature-icon {
    width: 48px;
    height: 48px;
    background: #eef2ff;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
}

.feature-icon svg {
    color: var(--color-primary);
}

.feature-card h4 {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 8px;
}

.feature-card p {
    font-size: var(--font-size-small);
    color: #64748b;
    margin: 0;
}

/* Verification Steps */
.verification-steps {
    margin: 32px 0;
}

.step {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 24px;
}

.step-number {
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

.step-content h4 {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: #1e293b;
}

.step-content p {
    font-size: 14px;
    color: #64748b;
    margin: 0;
}

/* Lesson Flow */
.lesson-flow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 32px 0;
    padding: 32px;
    background: #f8fafc;
    border-radius: 12px;
    overflow-x: auto;
}

.flow-step {
    text-align: center;
    flex: 1;
}

.flow-icon {
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

.flow-icon svg {
    color: #667eea;
}

.flow-step h4 {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 8px;
}

.flow-step p {
    font-size: var(--font-size-small);
    color: #64748b;
    margin: 0;
}

.flow-arrow {
    font-size: var(--font-size-heading-4);
    color: #cbd5e1;
    margin: 0 16px;
}

/* Refund Policy */
.refund-policy {
    background: #f8fafc;
    border-radius: 12px;
    padding: 24px;
    margin: 24px 0;
}

.policy-item {
    display: flex;
    gap: 16px;
    align-items: start;
    margin-bottom: 16px;
}

.policy-item:last-child {
    margin-bottom: 0;
}

.policy-icon {
    flex-shrink: 0;
    margin-top: 2px;
}

.policy-icon.success {
    color: #10b981;
}

.policy-icon.warning {
    color: #f59e0b;
}

.policy-icon.error {
    color: #ef4444;
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

/* Responsive */
@media (max-width: 1024px) {
    .guide-content .guide-container {
        grid-template-columns: 1fr;
    }

    .guide-sidebar {
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
    .guide-header {
        padding: 60px 0 40px;
    }

    .guide-main {
        padding: 32px 24px;
    }

    .lesson-flow {
        flex-direction: column;
        gap: 24px;
    }

    .flow-arrow {
        transform: rotate(90deg);
        margin: 0;
    }

    .contact-card {
        padding: 32px 24px;
    }
}
</style>

