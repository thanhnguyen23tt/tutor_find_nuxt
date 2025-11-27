<script setup>
definePageMeta({
	middleware: [
		'auth', 
		() => {
		useLayoutStore().setHiddenFooter(true)
		}
	]
})

import { ref, computed, onMounted, watch, watchEffect } from 'vue';

const router = useRouter();
const route = useRoute();
const { api } = useApi();
const { success, error: notifyError, warning: notifyWarning, info: notifyInfo } = useNotification();
const userStore = useUserStore();
const { canStartClassroom, getParticipantsClass, getStatusClass, formatDateTime, diffDateTimeText, getFirstCharacterOfLastName } = useHelper();

// Reactive data
const search = ref('');
const status = ref('all');
const currentPage = ref(1);
const classrooms = ref([]);
const dataPaginate = ref({});
const statusMap = ref({});
const showDetailModal = ref(false);
const selectedClassroom = ref(null);
const showProfileModal = ref(false);
const selectedProfileUser = ref(null);
const isLoading = ref(false);
const userData = computed(() => userStore.getUserData);

// Computed
const tabs = computed(() => {
	const arr = [];
    const statusCounts = {};
    classrooms.value.forEach(classroom => {
        statusCounts[classroom.status] = (statusCounts[classroom.status] || 0) + 1;
    });

    for (const key in statusMap.value) {
        arr.push({
            value: key,
            label: statusMap.value[key],
            count: statusCounts[key] || 0
        });
    }
    return arr;
});

const filteredClassrooms = computed(() => {
    let filtered = classrooms.value;
    // Filter by status
    if (status.value !== 'all') {
        filtered = filtered.filter(classroom => classroom.status === status.value);
    }

    // Filter by search
    if (search.value.trim()) {
        const searchTerm = search.value.toLowerCase();
        filtered = filtered.filter(classroom =>
            classroom.topic?.toLowerCase().includes(searchTerm) ||
            classroom.booking?.request_code?.toLowerCase().includes(searchTerm) ||
            classroom.booking?.student?.full_name?.toLowerCase().includes(searchTerm) ||
            classroom.booking?.tutor?.full_name?.toLowerCase().includes(searchTerm)
        );
    }

    return filtered;
});

const processClassroomResponse = (response) => {
    classrooms.value = (response?.data || []).map(item => ({
        ...item,
    }));
    dataPaginate.value = response?.meta || {};
    statusMap.value = response?.list_status || {};
};

const fetchClassrooms = async (page = 1, paramsOverride = {}) => {
    const params = { page };
    const statusValue = paramsOverride.status ?? status.value;
    const searchValue = paramsOverride.search ?? search.value;

    if (statusValue && statusValue !== 'all') {
        params.status = statusValue;
    }
    if (searchValue && searchValue.trim()) {
        params.search = searchValue.trim();
    }

    const response = await api.apiGet('classrooms', params);
    if (!response?.success) {
        throw new Error(response?.message || 'Tải danh sách lớp học thất bại');
    }
    return response;
};

const {
    data: initialClassroomsResponse,
    pending: isInitialLoading,
    error: initialClassroomsError,
} = await useAsyncData('classroom-manager-initial', async () => {
    return await fetchClassrooms(1, { status: 'all', search: '' });
});

if (initialClassroomsResponse.value) {
    processClassroomResponse(initialClassroomsResponse.value);
}

watchEffect(() => {
    if (process.client && initialClassroomsError.value) {
        notifyError(initialClassroomsError.value.message || 'Không thể tải danh sách lớp học');
    }
});

const isPageLoading = computed(() => isLoading.value || isInitialLoading.value);

const initEcho = async () => {
    try {
        if (process.client && window?.Echo && userData.value?.uid) {
            window.Echo.private(`classroom.${userData.value.uid}`)
                .listen('.created', (e) => {
                    changePage(currentPage.value);
                })
                .listen('.updated', (e) => {
                    if (e.classroom_id) {
                        const classroomId = e.classroom_id;
                        const index = classrooms.value.findIndex(item => item.id === classroomId);

                        if (index !== -1) {
                            classrooms.value[index] = {
                                ...classrooms.value[index],
                                participants_count: e.participants_count,
                            };
                        }
                    }
                })
                .listen('.started', (e) => {
                    if (e.classroom_id) {
                        const classroomId = e.classroom_id;
                        const index = classrooms.value.findIndex(item => item.id === classroomId);

                        if (index !== -1) {
                            classrooms.value[index] = {
                                ...classrooms.value[index],
                                status: e.status,
								status_text: e.status_text,
                            };
                        }
                    }
                })
                .listen('.ended', (e) => {
                    if (e.classroom_id) {
                        const classroomId = e.classroom_id;
                        const index = classrooms.value.findIndex(item => item.id === classroomId);

                        if (index !== -1) {
                            classrooms.value[index] = {
                                ...classrooms.value[index],
                                status: e.status,
								status_text: e.status_text,
                            };
                        }
                    }
                });
        }
    } catch (e) {
        console.error('Echo listen classroom.created failed', e)
    }
};

// Methods
const changePage = async (page) => {
    isLoading.value = true;
    try {
        currentPage.value = page;
        const response = await fetchClassrooms(page);
        processClassroomResponse(response);
    } catch (e) {
        notifyError(e?.message || 'Có lỗi xảy ra khi tải danh sách lớp học');
    } finally {
        isLoading.value = false;
    }
};

const startClassroom = async (classroom) => {
    // Kiểm tra thời gian và hết hạn trước khi gọi API
    if (classroom?.time_info?.is_missed) {
        notifyWarning('Buổi học đã lỡ, không thể bắt đầu');
        return;
    }
    if (!canStartClassroom(classroom)) {
        notifyWarning(classroom.time_info?.time_status_text || 'Chưa đến giờ học');
        return;
    }

    try {
        // Gọi API để bắt đầu lớp học
        const res = await api.apiPost(`classrooms/${classroom.id}/start`);
        if (res?.success) {
            success(res?.message || 'Bắt đầu lớp học thành công!');

            changePage(currentPage.value);
        } else {
            notifyError(res?.message || 'Không thể bắt đầu lớp học');
        }
    } catch (e) {
        notifyError('Có lỗi xảy ra khi bắt đầu lớp học');
    }

    if (process.client) {
        const routeData = router.resolve({ name: 'classroom', params: { id: classroom.id } });
    	window.open(routeData.href, "_blank");
    }
};

const joinClassroom = (classroom) => {
    // Kiểm tra thời gian trước khi tham gia
    if (classroom?.time_info?.is_missed) {
        notifyWarning('Buổi học đã lỡ, không thể tham gia');
        return;
    }
    if (!canStartClassroom(classroom)) {
        notifyWarning(classroom.time_info?.time_status_text || 'Chưa đến giờ học');
        return;
    }

    if (process.client) {
        const routeData = router.resolve({ name: 'classroom', params: { id: classroom.id } });
    	window.open(routeData.href, "_blank");
    }
};

// openWebrtc removed; navigation via router

const retryClassroom = async (classroomId) => {
    try {
        const res = await api.apiPost(`classrooms/${classroomId}/retry`);
        if (res?.success) {
            success(res?.message || 'Thử lại tạo lớp học thành công!');
            changePage(currentPage.value);
        } else {
            notifyError(res?.message || 'Không thể thử lại tạo lớp học');
        }
    } catch (e) {
        notifyError('Có lỗi xảy ra khi thử lại tạo lớp học');
    }
};

const shareClassroom = async (classroom) => {
    try {
        if (!process.client) return;
        const classroomUrl = `${window.location.origin}/classroom/${classroom.id}`;

        if (navigator.share) {
            await navigator.share({
                title: `Lớp học: ${classroom.topic || 'Chưa có chủ đề'}`,
                text: `Tham gia lớp học ${classroom.topic || 'Chưa có chủ đề'} - Mã booking: ${classroom.booking?.request_code}`,
                url: classroomUrl
            });
        } else {
            // Fallback: copy to clipboard
            await copyClassroomLink(classroom);
        }
    } catch (e) {
        if (e.name !== 'AbortError') {
            notifyError('Không thể chia sẻ lớp học');
        }
    }
};

const copyClassroomLink = async (classroom) => {
    try {
        if (!process.client || !navigator?.clipboard) {
            notifyWarning('Không thể sao chép link trên thiết bị này');
            return;
        }
        const classroomUrl = `${window.location.origin}/classroom/${classroom.id}`;
        await navigator.clipboard.writeText(classroomUrl);
        success('Đã sao chép link lớp học!');
    } catch (e) {
        notifyError('Không thể sao chép link');
    }
};

const openClassroomDetail = async (classroom) => {
    try {
        // Fetch detailed classroom data including participants
        const response = await api.apiGet(`classrooms/${classroom.id}`);
        if (response?.success) {
            selectedClassroom.value = response.data;
        } else {
            selectedClassroom.value = classroom;
        }
        showDetailModal.value = true;
    } catch (e) {
        console.error('Failed to load classroom details:', e);
        selectedClassroom.value = classroom;
        showDetailModal.value = true;
    }
};

const handleBookingIdFromQuery = async () => {
    const bookingId = route.query.booking_id;
    if (bookingId) {
        try {
            const classroom = classrooms.value.find(c => c.booking.id == bookingId);
            if (classroom) {
                openClassroomDetail(classroom);
                router.replace({ query: {} });
            } else {
                notifyInfo('Đang tìm kiếm lớp học cho booking này...');
            }
        } catch (error) {
            notifyError('Không thể tìm thấy lớp học cho booking này');
        }
    }
};

const openProfileModal = (user) => {
    if (!user) return;
    selectedProfileUser.value = user;
    showProfileModal.value = true;
};

// Lifecycle
onMounted(async () => {
    await initEcho();
    await handleBookingIdFromQuery();
});
</script>

<template>
<!-- Loading overlay -->
<base-loading v-if="isPageLoading" />

<BasePageError v-else-if="initialClassroomsError" :message="initialClassroomsError.message || 'Không thể tải danh sách lớp học'" />

<div class="classroom-manager-page" v-else>
    <div class="container">
        <div class="page-header">
            <div class="header-content">
                <h1 class="title-header">Quản lý lớp học</h1>
                <p class="desc">Tạo và quản lý các lớp học trực tuyến</p>
            </div>
        </div>

        <!-- Filter và Search -->
        <div class="classroom-manager-toolbar">
            <base-input v-model="search" placeholder="Tìm kiếm theo chủ đề, mã booking hoặc tên học viên..."></base-input>
        </div>

        <!-- Status Tabs -->
        <base-status-tabs v-model="status" :tabs="tabs" />

        <!-- Empty State -->
        <div v-if="filteredClassrooms.length === 0" class="empty-list">
            <svg class="empty-icon" xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            <p>Chưa có lớp học nào</p>
        </div>

        <!-- Classroom List -->
        <div class="classroom-card" v-else>
            <div v-for="classroom in filteredClassrooms" :key="classroom.id" class="classroom-card-wrapper" @click="openClassroomDetail(classroom)">
                <div class="classroom-card-left">
                    <div class="classroom-avatar">
                        <svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                            <line x1="8" y1="21" x2="16" y2="21"></line>
                            <line x1="12" y1="17" x2="12" y2="21"></line>
                        </svg>
                    </div>

                    <div class="content">
                        <div class="classroom-title">
                            <span>{{ classroom.topic || 'Chưa có chủ đề' }}</span>
                        </div>
                        <div class="classroom-code">Mã booking: {{ classroom.booking?.request_code }}</div>
                        <div class="classroom-duration">
                            <svg class="icon-sm" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                            {{ classroom.scheduled_duration }} phút
                        </div>
                        <div class="classroom-participants" v-if="classroom.status !== 'ended'">
                            <svg class="icon-sm" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            <span :class="getParticipantsClass(classroom)">
                                {{ classroom.participants_count || 0 }}/{{ classroom.max_participants || 2 }}
                            </span>
                        </div>
                        <span class="status-badge">{{ classroom.status_text }}</span>
                    </div>
                </div>

                <div class="classroom-card-center">
                    <div class="classroom-info">
                        <div class="info-row">
                            <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M4 21v-2a4 4 0 0 1 3-3.87"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            <span><span>Giáo viên:</span> {{ classroom.booking?.tutor?.full_name }}</span>
                        </div>
                        <div class="info-row">
                            <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            <span><span>Học viên:</span> {{ classroom.booking?.user?.full_name }}</span>
                        </div>
                        <div class="info-row">
                            <svg class="icon-sm" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <rect x="3" y="4" width="18" height="18" rx="2" />
                                <path d="M16 2v4" />
                                <path d="M8 2v4" />
                                <path d="M3 10h18" />
                            </svg>
                            <span><span>Thời gian:</span> {{ formatDateTime(classroom.scheduled_start_time) }}</span>
                        </div>
                        <div v-if="classroom.time_info" class="info-row time-status">
                            <svg class="icon-sm" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                            <span>{{ classroom.time_info.time_status_text }}</span>
                        </div>
                        <div class="info-row" v-if="classroom.agenda">
                            <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"></path>
                                <path d="M14 2v6h6"></path>
                                <path d="M16 13H8"></path>
                                <path d="M16 17H8"></path>
                                <path d="M10 9H8"></path>
                            </svg>
                            <span><span>Chi tiết:</span> {{ classroom.agenda }}</span>
                        </div>
                    </div>
                </div>

                <div class="classroom-card-right">
                    <div class="action-group" @click.stop v-if="classroom.status !== 'ended'">
                        <template v-if="classroom.status === 'waiting'">
                            <button
                                class="action-btn btn-primary"
                                :disabled="!canStartClassroom(classroom)"
                                @click.stop="startClassroom(classroom)"
                            >
                                <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                </svg>
                                <span class="btn-text">Bắt đầu</span>
                            </button>
                        </template>
                        <template v-else-if="classroom.status === 'started'">
                            <button
                                class="action-btn btn-secondary"
                                :disabled="!canStartClassroom(classroom)"
                                @click.stop="classroom.status === 'started' ? joinClassroom(classroom) : startClassroom(classroom)"
                            >
                                <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                                    <polyline points="10,17 15,12 10,7"></polyline>
                                    <line x1="15" y1="12" x2="3" y2="12"></line>
                                </svg>
                                <span class="btn-text">Tham gia</span>
                            </button>
                        </template>
                        <template v-else-if="classroom.status === 'cancelled'">
                            <button class="action-btn btn-secondary" disabled>
                                <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <path d="m4.9 4.9 14.2 14.2"></path>
                                </svg>
                                <span class="btn-text">Đã hủy</span>
                            </button>
                        </template>
                        <template v-else-if="classroom.status === 'error'">
                            <button class="action-btn btn-danger" @click.stop="retryClassroom(classroom.id)">
                                <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                                    <path d="M21 3v5h-5"></path>
                                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                                    <path d="M3 21v-5h5"></path>
                                </svg>
                                <span class="btn-text">Thử lại</span>
                            </button>
                        </template>
                    </div>
                        <!-- More Menu -->
                        <div class="more-menu-container" @click.stop>
                            <base-more-menu>
                                <template #activator="{ toggle }">
                                    <div class="more-btn" @click.stop="toggle">
                                        <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <circle cx="12" cy="12" r="1"></circle>
                                            <circle cx="19" cy="12" r="1"></circle>
                                            <circle cx="5" cy="12" r="1"></circle>
                                        </svg>
                                    </div>
                                </template>
                            <template #default="{ close }">
                                <button class="more-menu-item" @click="shareClassroom(classroom); close()">
                                    <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                                        <polyline points="16,6 12,2 8,6"></polyline>
                                        <line x1="12" y1="2" x2="12" y2="15"></line>
                                    </svg>
                                    Chia sẻ
                                </button>
                                <button class="more-menu-item" @click="copyClassroomLink(classroom); close()">
                                    <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                    </svg>
                                    Sao chép link
                                </button>
                            </template>
                        </base-more-menu>
                    </div>
                </div>
            </div>
        </div>

        <base-pagination :meta="dataPaginate" :current-page="currentPage" @changePage="changePage"></base-pagination>
    </div>

    <!-- Classroom Detail Modal -->
    <base-modal v-if="showDetailModal" :isOpen="showDetailModal" :header="false" @close="showDetailModal = false" size="medium">
        <div v-if="selectedClassroom" class="classroom-detail-content">
            <!-- Header Section -->
            <div class="detail-header">
                <div class="classroom-avatar-large">
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon-max" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><g style="transform: none; transform-origin: 4px 20px 0px; transform-box: fill-box;"><g style="transform: none; transform-origin: 3px 11px 0px; transform-box: fill-box;"><path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z"></path><path d="m6.2 5.3 3.1 3.9"></path><path d="m12.4 3.4 3.1 4"></path></g><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"></path></g></svg>
                </div>
                <div class="header-info">
                    <h2 class="classroom-title-large">{{ selectedClassroom.topic || 'Chưa có chủ đề' }}</h2>
                    <div class="classroom-meta">
                        <span class="status-badge-large" :class="getStatusClass(selectedClassroom.status)">
                            {{ selectedClassroom.status_text }}
                        </span>
                        <span class="classroom-code-large">Mã booking: {{ selectedClassroom.booking?.request_code }}</span>
                    </div>
                </div>
            </div>

            <!-- Main Content -->
            <div class="detail-content">
                <!-- Basic Information -->
                <div class="detail-section">
                    <h3 class="section-title">Thông tin cơ bản</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">
                                <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                                Thời lượng dự kiến
                            </div>
                            <div class="info-value">{{ selectedClassroom.scheduled_duration }} phút</div>
                        </div>
                        <div v-if="selectedClassroom.actual_duration" class="info-item">
                            <div class="info-label">
                                <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                                Thời lượng thực tế
                            </div>
                            <div class="info-value">{{ selectedClassroom.actual_duration }} phút</div>
                        </div>
                        <div class="info-item" v-if="selectedClassroom.status !== 'ended'">
                            <div class="info-label">
                                <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                                Số lượng tham gia
                            </div>
                            <div class="info-value" :class="getParticipantsClass(selectedClassroom)">
                                {{ selectedClassroom.participants_count || 0 }}/{{ selectedClassroom.max_participants || 2 }}
                            </div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">
                                <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" />
                                    <path d="M16 2v4" />
                                    <path d="M8 2v4" />
                                    <path d="M3 10h18" />
                                </svg>
                                Thời gian bắt đầu dự kiến
                            </div>
                            <div class="info-value">{{ formatDateTime(selectedClassroom.scheduled_start_time) }}</div>
                        </div>
                        <div v-if="selectedClassroom.actual_start_time" class="info-item">
                            <div class="info-label">
                                <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" />
                                    <path d="M16 2v4" />
                                    <path d="M8 2v4" />
                                    <path d="M3 10h18" />
                                </svg>
                                Thời gian bắt đầu thực tế
                            </div>
                            <div class="info-value">{{ formatDateTime(selectedClassroom.actual_start_time) }}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">
                                <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" />
                                    <path d="M16 2v4" />
                                    <path d="M8 2v4" />
                                    <path d="M3 10h18" />
                                </svg>
                                Thời gian kết thúc dự kiến
                            </div>
                            <div class="info-value">{{ formatDateTime(selectedClassroom.scheduled_end_time) }}</div>
                        </div>
                        <div v-if="selectedClassroom.actual_end_time" class="info-item">
                            <div class="info-label">
                                <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" />
                                    <path d="M16 2v4" />
                                    <path d="M8 2v4" />
                                    <path d="M3 10h18" />
                                </svg>
                                Thời gian kết thúc thực tế
                            </div>
                            <div class="info-value">{{ formatDateTime(selectedClassroom.actual_end_time) }}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">
                                <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" />
                                    <path d="M16 2v4" />
                                    <path d="M8 2v4" />
                                    <path d="M3 10h18" />
                                </svg>
                                Ngày tạo
                            </div>
                            <div class="info-value">{{ formatDateTime(selectedClassroom.created_at) }}</div>
                        </div>
                    </div>
                </div>

                <!-- Participants Information -->
                <div class="detail-section">
                    <h3 class="section-title">Thông tin người tham gia</h3>

                    <!-- Expected Participants -->
                    <div class="expected-participants">
                        <div class="participants-info">
                            <div class="participant-card participant-clickable" @click="openProfileModal(selectedClassroom.booking?.tutor)">
                                <div class="participant-avatar">
                                    <img v-if="selectedClassroom.booking?.tutor?.avatar" :src="selectedClassroom.booking?.tutor?.avatar" :alt="selectedClassroom.booking?.tutor?.full_name">
                                    <svg v-else class="icon-md" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M20 21v-2a4 4 0 0 0-3-3.87"></path>
                                        <path d="M4 21v-2a4 4 0 0 1 3-3.87"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                </div>
                                <div class="participant-details">
                                    <div class="participant-name">{{ selectedClassroom.booking?.tutor?.full_name }}</div>
                                    <div class="participant-role">Giáo viên</div>
                                </div>
                            </div>
                            <div class="participant-card participant-clickable" @click="openProfileModal(selectedClassroom.booking?.user)">
                                <div class="participant-avatar">
                                    <img v-if="selectedClassroom.booking?.user?.avatar" :src="selectedClassroom.booking?.user?.avatar" :alt="selectedClassroom.booking?.user?.full_name">
                                    <svg v-else class="icon-md" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="9" cy="7" r="4"></circle>
                                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                    </svg>
                                </div>
                                <div class="participant-details">
                                    <div class="participant-name">{{ selectedClassroom.booking?.user?.full_name }}</div>
                                    <div class="participant-role">Học viên</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Actual Participants -->
                    <div v-if="selectedClassroom.participants && selectedClassroom.participants.length > 0" class="actual-participants">
                        <h4 class="subsection-title">Người đã tham gia</h4>
                        <div class="participants-info">
                            <div v-for="participant in selectedClassroom.participants" :key="participant.user_id" class="participant-card actual-participant">
                                <div class="participant-avatar" :class="{ 'online': participant.is_online }">
                                    <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M20 21v-2a4 4 0 0 0-3-3.87"></path>
                                        <path d="M4 21v-2a4 4 0 0 1 3-3.87"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                    <div v-if="participant.is_online" class="online-indicator"></div>
                                </div>
                                <div class="participant-details">
                                    <div class="participant-name">{{ participant.user_name }}</div>
                                    <div class="participant-role">
                                        {{ participant.role_name }}
                                    </div>
                                    <div class="participant-times">
                                        <div class="time-info">
                                            <span class="time-label">Tham gia:</span>
                                            <span class="time-value">{{ diffDateTimeText(participant.last_activity_at, participant.first_joined_at) }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- No participants message -->
                    <div v-else class="no-participants">
                        <div class="no-participants-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        </div>
                        <p class="no-participants-text">Chưa có ai tham gia lớp học</p>
                    </div>
                </div>

                <!-- Subject Information -->
                <div class="detail-section">
                    <h3 class="section-title">Thông tin môn học</h3>
                    <div class="subject-info">
                        <div class="subject-item">
                            <div class="subject-label">Môn học</div>
                            <div class="subject-value">{{ selectedClassroom.booking?.subject?.name }}</div>
                        </div>
                        <div class="subject-item">
                            <div class="subject-label">Cấp độ</div>
                            <div class="subject-value">{{ selectedClassroom.booking?.education_level?.name }}</div>
                        </div>
                    </div>
                </div>

                <!-- Agenda -->
                <div v-if="selectedClassroom.agenda" class="detail-section">
                    <h3 class="section-title">Chi tiết lớp học</h3>
                    <div class="agenda-content">
                        {{ selectedClassroom.agenda }}
                    </div>
                </div>

                <!-- Error Message -->
                <div v-if="selectedClassroom.error_message" class="detail-section">
                    <h3 class="section-title">Thông báo lỗi</h3>
                    <div class="error-message">
                        <div class="error-icon">
                            <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="m4.9 4.9 14.2 14.2"></path>
                            </svg>
                        </div>
                        <div class="error-content">
                            {{ selectedClassroom.error_message }}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal Footer -->
            <div class="modal-footer">
                <button class="btn-md btn-secondary" @click="showDetailModal = false">
                    <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                    </svg>
                    Đóng
                </button>
                <button v-if="selectedClassroom.status === 'waiting'"
                        class="btn-md btn-primary"
                        :disabled="!canStartClassroom(selectedClassroom)"
                        @click="startClassroom(selectedClassroom)">
                    <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    Bắt đầu lớp học
                </button>
                <button v-else-if="selectedClassroom.status === 'started'"
                        class="btn-md btn-secondary"
                        :disabled="!canStartClassroom(selectedClassroom)"
                        @click="joinClassroom(selectedClassroom)">
                    <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                        <polyline points="10,17 15,12 10,7"></polyline>
                        <line x1="15" y1="12" x2="3" y2="12"></line>
                    </svg>
                    Tham gia lớp học
                </button>
            </div>
        </div>
    </base-modal>

    <!-- Profile Modal -->
    <base-modal v-if="showProfileModal" :isOpen="showProfileModal" @close="showProfileModal = false" title="Thông tin cơ bản" size="medium">
        <div v-if="selectedProfileUser" class="profile-modal-content">
            <div class="profile-header">
                <div class="profile-avatar-large">
                    <img v-if="selectedProfileUser.avatar" :src="selectedProfileUser.avatar" :alt="selectedProfileUser.full_name">
                    <span v-else class="avatar-text-large">{{ getFirstCharacterOfLastName(selectedProfileUser.full_name) }}</span>
                </div>
                <div class="profile-info">
                    <h2 class="profile-name">{{ selectedProfileUser.full_name }}</h2>
                    <span class="profile-role">{{ selectedProfileUser.role_name }}</span>
                    <div v-if="selectedProfileUser.info_reviews?.average_rating" class="profile-rating">
                        <svg class="icon-md" fill="#f9ce69" stroke="#f9ce69" viewBox="0 0 24 24">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        <span class="rating-value">{{ selectedProfileUser.info_reviews.average_rating }}</span>
                        <span class="rating-count">({{ selectedProfileUser.info_reviews.total_reviews }} đánh giá)</span>
                    </div>
                </div>
            </div>

            <div class="profile-details">
                <div class="detail-section">
                    <h3 class="section-title">Thông tin liên hệ</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <div class="detail-label">
                                <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Email
                            </div>
                            <div class="detail-value">{{ selectedProfileUser.email || '-' }}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">
                                <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                Số điện thoại
                            </div>
                            <div class="detail-value">{{ selectedProfileUser.phone || '-' }}</div>
                        </div>
                        <div class="detail-item" v-if="selectedProfileUser.address">
                            <div class="detail-label">
                                <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Địa chỉ
                            </div>
                            <div class="detail-value">{{ selectedProfileUser.address }}</div>
                        </div>
                    </div>
                </div>

                <div class="detail-section" v-if="selectedProfileUser.bio">
                    <h3 class="section-title">Giới thiệu</h3>
                    <p class="bio-text">{{ selectedProfileUser.bio }}</p>
                </div>

                <div class="detail-section" v-if="selectedProfileUser.role === 1 && selectedProfileUser.user_subjects?.length">
                    <h3 class="section-title">Môn học giảng dạy</h3>
                    <div class="subjects-grid">
                        <div v-for="subject in selectedProfileUser.user_subjects" :key="subject.id" class="subject-chip">
                            <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <span>{{ subject.subject?.name }}</span>
                            <span class="subject-exp">{{ subject.years_of_experience }} năm</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn-md btn-secondary" @click="showProfileModal = false">
                    <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                    </svg>
                    Đóng
                </button>
            </div>
        </div>
    </base-modal>
</div>
</template>

<style scoped>
.classroom-manager-page {
    padding: 2rem 0;
}

.container {
    margin: 0 auto;
}

.page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.header-content {
    flex: 1;
}

.title-header {
    font-weight: 700;
    font-size: var(--font-size-heading-3);
    margin: 0;
}

.desc {
    color: var(--gray-500);
    margin: 0.5rem 0 0 0;
}

.classroom-manager-toolbar {
    display: flex;
    gap: 1rem;
    margin-bottom: 0.5rem;
}

.filter-btn {
    white-space: nowrap;
}


.empty-list {
    text-align: center;
    padding: 5rem 3rem 3rem;
    color: var(--gray-500);
}

.empty-icon {
    margin-bottom: 1rem;
}

.empty-list p {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
}

.classroom-card {
    display: grid;
    gap: 1.5rem;
    margin-top: 1rem;
}

.classroom-card-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 1.75rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative;
}

.classroom-card-wrapper::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-light) 50%);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.classroom-card-wrapper:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
    border-color: #cbd5e1;
}

.classroom-card-wrapper:hover::before {
    opacity: 1;
}

.classroom-card-left {
    display: flex;
    gap: 1.1rem;
    flex: 1;
}

.classroom-avatar {
    min-width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    border: 3px solid #ffffff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-primary);
    transition: all 0.3s ease;
}

.classroom-card-wrapper:hover .classroom-avatar {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.content {
    display: grid;
    gap: 0.2rem;
    font-size: 0.97rem;
}

.classroom-title {
    font-weight: 700;
    font-size: var(--font-size-medium);
    color: #222;
    display: flex;
    align-items: center;
    gap: 0.8rem;
}

.status-badge {
    width: max-content;
    padding: 0.25rem 0.75rem;
    border-radius: 2rem;
    font-size: var(--font-size-mini);
    font-weight: 600;
    background: linear-gradient(135deg, var(--gray-50) 0%, var(--gray-100) 100%);
    border: 1px solid var(--gray-200);
    color: var(--gray-700);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
}

.status-badge:hover {
    background: linear-gradient(135deg, var(--gray-100) 0%, var(--gray-200) 100%);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status-error {
    background: #fef2f2;
    color: #dc2626;
    border: 1px solid #f87171;
}

.classroom-code {
    color: var(--gray-600);
    font-size: var(--font-size-small);
}

.classroom-duration {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    color: var(--gray-600);
    font-size: var(--font-size-small);
}

.classroom-participants {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    color: var(--gray-600);
    font-size: var(--font-size-small);
}

.participants-available {
    color: #dc2626;
    font-weight: 500;
}

.participants-full {
    color: #059669;
    font-weight: 500;
}

/* Time status styles */

.classroom-card-center {
    flex: 1.5;
    font-size: 0.97rem;
}

.classroom-info {
    display: grid;
    gap: 0.5rem;
}

.info-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    line-height: 1.4;
}

.info-row svg {
    flex-shrink: 0;
    color: #6b7280;
}

.classroom-card-right {
    height: 100%;
    position: relative;
    min-width: 200px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    gap: 0.5rem;
}

/* Action styles now handled by global .action-group in app.css */

.more-menu-container {
    position: absolute;
    top: 0;
    right: 0;
}

.more-btn {
    cursor: pointer;
}

/* More menu styles are provided by BaseMoreMenu.vue */

/* Classroom Detail Modal Styles */

.detail-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    margin-bottom: 2rem;
}

.classroom-avatar-large {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: #f3f4f6;
    border: 2px solid #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6b7280;
    flex-shrink: 0;
}

.header-info {
    flex: 1;
}

.classroom-title-large {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 0.5rem 0;
}

.classroom-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
}

.status-badge-large {
    padding: 0.1rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    color: #374151;
}

.status-badge-large.status-waiting {
    background: #fef3c7;
    color: #92400e;
    border-color: #f59e0b;
}

.status-badge-large.status-scheduled {
    background: #dbeafe;
    color: #1e40af;
    border-color: #3b82f6;
}

.status-badge-large.status-started {
    background: #dcfce7;
    color: #166534;
    border-color: #22c55e;
}

.status-badge-large.status-ended {
    background: #f3f4f6;
    color: #6b7280;
    border-color: #9ca3af;
}

.status-badge-large.status-cancelled {
    background: #fee2e2;
    color: #991b1b;
    border-color: #ef4444;
}

.status-badge-large.status-error {
    background: #fef2f2;
    color: #dc2626;
    border-color: #f87171;
}

.classroom-code-large {
    color: #6b7280;
    font-size: 0.875rem;
}

.detail-content {
    display: grid;
    gap: 2rem;
}

.detail-section {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1.5rem;
}

.section-title {
    font-size: var(--font-size-medium);
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 1rem 0;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e5e7eb;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.info-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #6b7280;
}

.info-value {
    font-size: var(--font-size-base);
    color: #1f2937;
    font-weight: 500;
}

.participants-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.participant-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
}

.participant-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6b7280;
    flex-shrink: 0;
    overflow: hidden;
}

.participant-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.participant-clickable {
    cursor: pointer;
    transition: all 0.2s ease;
}

.participant-clickable:hover {
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.participant-details {
    flex: 1;
}

.participant-name {
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.25rem;
}

.participant-role {
    font-size: 0.875rem;
    color: #6b7280;
}

/* New participant styles */
.subsection-title {
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
    margin: 0 0 1rem 0;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e5e7eb;
}

.expected-participants {
    margin-bottom: 2rem;
}

.actual-participants {
    margin-top: 1rem;
}

.actual-participant {
    border-left: 4px solid #10b981;
    background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
}

.participant-avatar.online {
    position: relative;
    border: 2px solid #10b981;
}

.online-indicator {
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 12px;
    height: 12px;
    background: #10b981;
    border: 2px solid white;
    border-radius: 50%;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
    }
    70% {
        box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
    }
}

.participant-times {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid #e5e7eb;
}

.time-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
}

.time-info:last-child {
    margin-bottom: 0;
}

.time-label {
    color: #6b7280;
    font-weight: 500;
}

.time-value {
    color: #1f2937;
    font-weight: 600;
}

.no-participants {
    text-align: center;
    padding: 2rem 1rem;
    color: #6b7280;
}

.no-participants-icon {
    margin-bottom: 1rem;
    display: flex;
    justify-content: center;
}

.no-participants-text {
    margin: 0;
    font-size: 0.875rem;
    font-style: italic;
}

.subject-info {
    display: grid;
}

.subject-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
}

.subject-item:last-child {
    border-bottom: none;
}

.subject-label {
    font-weight: 500;
    color: #6b7280;
    font-size: var(--font-size-base);
}

.subject-value {
    color: #1f2937;
    font-weight: 500;
    font-size: var(--font-size-small);
}

.agenda-content {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 1rem;
    color: #374151;
    line-height: 1.6;
    white-space: pre-wrap;
}

.error-message {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 6px;
    padding: 1rem;
}

.error-icon {
    color: #dc2626;
    flex-shrink: 0;
    margin-top: 0.125rem;
}

.error-content {
    color: #991b1b;
    font-size: 0.875rem;
    line-height: 1.5;
    flex: 1;
}

/* Create Classroom Modal Styles */
.create-classroom-form {
    display: grid;
    gap: 2rem;
}

.form-section {
    display: grid;
    gap: 1rem;
}

.booking-info-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1rem;
    display: grid;
    gap: 0.5rem;
}

.booking-info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.25rem 0;
    font-size: var(--font-size-small);
}

.booking-info-row .label {
    font-weight: 500;
    color: #374151;
}

.booking-info-row .value {
    color: #6b7280;
}

.method-row {
    display: grid;
    gap: 0.4rem;
}

.method-label {
    font-weight: 500;
    color: #374151;
}

.method-options {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.method-option {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: var(--font-size-small);
}

/* Responsive */
@media (max-width: 1024px) {
    .page-header {
        flex-direction: column;
        align-items: flex-start;
    }


    .classroom-card-wrapper {
        flex-direction: column;
        align-items: flex-start;
        gap: 1.5rem;
    }

    .classroom-card-center {
        width: 100%;
    }

    .classroom-card-right {
        width: 100%;
        align-items: flex-start;
    }

    .classroom-card-wrapper:hover {
        transform: none;
    }

    .more-menu-container {
        top: -1rem;
    }

    .detail-header {
        flex-direction: column;
        text-align: center;
    }

    .classroom-meta {
        justify-content: center;
    }

    .info-grid {
        grid-template-columns: 1fr;
    }

    .participants-info {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 480px) {
    .classroom-card-wrapper {
        border-radius: 12px;
        padding: 1.5rem;
    }
}

/* Profile Modal Styles */
.profile-modal-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.profile-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 2px solid #e5e7eb;
}

.profile-avatar-large {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    border: 4px solid white;
    overflow: hidden;
}

.profile-avatar-large img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-text-large {
    font-size: 2.5rem;
    font-weight: 700;
    color: white;
}

.profile-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.profile-name {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
}

.profile-role {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    color: #1e40af;
    border-radius: 1rem;
    font-size: 0.875rem;
    font-weight: 600;
    width: fit-content;
}

.profile-rating {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
}

.rating-value {
    font-size: 1.125rem;
    font-weight: 700;
    color: #f59e0b;
}

.rating-count {
    font-size: 0.875rem;
    color: #6b7280;
}

.profile-details {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.detail-section {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1.5rem;
}

.section-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 1rem 0;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #e5e7eb;
}

.detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
}

.detail-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.detail-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.detail-value {
    font-size: var(--font-size-base);
    color: #1f2937;
    font-weight: 500;
    padding-left: 1.75rem;
}

.bio-text {
    color: #374151;
    line-height: 1.6;
    white-space: pre-wrap;
    margin: 0;
}

.subject-chip {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    transition: all 0.2s ease;
}

.subject-chip:hover {
    border-color: var(--color-primary);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.subject-exp {
    margin-left: auto;
    padding: 0.25rem 0.5rem;
    background: #dbeafe;
    color: #1e40af;
    border-radius: 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
}

@media (max-width: 768px) {
    .profile-header {
        flex-direction: column;
        text-align: center;
    }

    .profile-avatar-large {
        width: 80px;
        height: 80px;
    }

    .avatar-text-large {
        font-size: 2rem;
    }

    .profile-name {
        font-size: 1.5rem;
    }

    .profile-rating {
        justify-content: center;
    }

    .detail-grid {
        grid-template-columns: 1fr;
    }
}
</style>
