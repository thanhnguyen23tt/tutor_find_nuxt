<template>
<div class="section-card schedule-section">
    <div class="header-wrapper">
        <div class="header-left">
            <div class="icon-wrapper">
                <svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M8 2v4"></path>
                    <path d="M16 2v4"></path>
                    <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                    <path d="M3 10h18"></path>
                </svg>
            </div>
            <div class="title-wrapper">
                <span class="title-main">Lịch trình hàng tuần</span>
                <span class="sub-title">Quản lý thời gian biểu giảng dạy của bạn</span>
            </div>
        </div>
        <div class="header-right">
            <button class="btn-md btn-secondary" @click="showAddTimeSlotModal = true">
                <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 5v14"></path>
                    <path d="M5 12h14"></path>
                </svg>
                <span>Thêm khung giờ</span>
            </button>
        </div>
    </div>
    <div class="main-content">
        <!-- Availability Legend -->
        <div class="schedule-legend">
            <div class="legend-item">
                <span class="legend-dot available"></span>
                <span class="legend-text">Còn trống</span>
            </div>
            <div class="legend-item">
                <span class="legend-dot busy"></span>
                <span class="legend-text">Đã đặt</span>
            </div>
        </div>

        <!-- Unified Schedule List -->
        <div class="schedule-list">
            <div 
                v-for="day in weekDayOptions" 
                :key="day.id" 
                class="schedule-card"
            >
                <div class="card-header" :class="{ 'is-empty': getDayRanges(day.id).length === 0 }">
                    <div class="header-left">
                        <div class="day-avatar">
                            <span>{{ getDayAbbreviation(day.name) }}</span>
                        </div>
                        <div class="header-info">
                            <span class="day-title" :class="{ 'text-muted': getDayRanges(day.id).length === 0 }">{{ day.name }}</span>
                            <span class="slot-count">{{ getDayRanges(day.id).length }} khung giờ</span>
                        </div>
                    </div>
                    <button class="btn-add-circle" @click="onAddSlotForDay(day)">
                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                </div>

                <div class="card-body">
                    <div v-if="getDayRanges(day.id).length > 0" class="time-slots-grid">
                        <div 
                            v-for="slot in getDayRanges(day.id)" 
                            :key="slot.id" 
                            class="time-slot-pill cursor-pointer"
                            @click="handleEditRange(slot)"
                        >
                            <span class="time-text">{{ formatTimeDisplay(slot.start_time) }} - {{ formatTimeDisplay(slot.end_time) }}</span>
                            <button class="btn-remove-slot" @click.stop="handleDeleteRange(slot)">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div v-else class="empty-slots">
                        <span>Chưa có khung giờ</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

    <!-- Modal thêm khung giờ -->
    <base-modal
        :is-open="showAddTimeSlotModal"
        title="Thêm khung giờ"
		description="Thêm các khoảng thời gian bạn có thể dạy hoặc học"
        size="medium"
        @close="closeAddModal"
    >
        <div class="modal-content">
            <base-select
                v-model="newTimeSlot.day_of_week_code"
                :options="weekDayOptions"
                label="Ngày trong tuần"
                placeholder="Chọn ngày trong tuần"
                required="true"
            />

            <!-- Danh sách ranges đã thêm -->
            <div v-if="newTimeSlot.ranges.length > 0" class="ranges-list">
                <div class="ranges-header">
                    <span class="ranges-title">Các khung giờ đã chọn ({{ newTimeSlot.ranges.length }})</span>
                </div>
                <div class="range-items">
                    <div v-for="(range, index) in newTimeSlot.ranges" :key="index" class="range-item">
                        <div class="range-time">
                            <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            <span>{{ formatTimeDisplay(range.start_time) }} - {{ formatTimeDisplay(range.end_time) }}</span>
                        </div>
                        <button type="button" class="btn-remove" @click="removeRange(index)">
                            <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 6 6 18"></path>
                                <path d="m6 6 12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Form thêm range mới -->
            <div class="add-range-form">
                <div class="form-label">Thêm khoảng thời gian</div>
                <div class="time-range-inputs">
                    <base-select
                        v-model="currentRange.start_time"
                        :options="availableStartTimes"
                        label="Từ giờ"
                        placeholder="Chọn giờ bắt đầu"
                        widthFull="true"
                    />
                    <div class="range-separator">
                        <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M5 12h14"></path>
                            <path d="m12 5 7 7-7 7"></path>
                        </svg>
                    </div>
                    <base-select
                        v-model="currentRange.end_time"
                        :options="availableEndTimes"
                        label="Đến giờ"
                        placeholder="Chọn giờ kết thúc"
                        widthFull="true"
                        :disabled="!currentRange.start_time"
                    />
                </div>
                <button 
                    type="button" 
                    class="btn-md btn-secondary btn-add-range" 
                    @click="addRange"
                    :disabled="!canAddRange"
                >
                    <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M5 12h14"></path>
                        <path d="M12 5v14"></path>
                    </svg>
                    <span>Thêm khoảng giờ này</span>
                </button>
            </div>

            <div class="modal-footer">
                <button class="btn-md btn-secondary" @click="closeAddModal">
                    <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                    </svg>
                    <span>Hủy</span>
                </button>
                <button :class="['btn-md', 'btn-primary', { 'btn-loading': isSubmitting }]" @click="addTimeSlot" :disabled="!canSubmitNew || isSubmitting">
                    <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                    <span>{{ isSubmitting ? 'Đang lưu...' : `Lưu ${newTimeSlot.ranges.length || ''} khung giờ` }}</span>
                </button>
            </div>
        </div>
    </base-modal>
    <!-- Modal xác nhận xóa -->
    <base-modal
        :is-open="showDeleteConfirmModal"
        title="Xác nhận xóa"
        size="medium"
        @close="showDeleteConfirmModal = false"
    >
        <div class="modal-content">
            <div class="selected-time-slot">
                <div class="time-slot-preview">
                    <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M8 2v4"></path>
                        <path d="M16 2v4"></path>
                        <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                        <path d="M3 10h18"></path>
                    </svg>
                    <span>Thứ {{ selectedTimeSlot.day_of_week_code }}</span>
                    <i class="far fa-clock"></i>
                    <span>{{ selectedTimeSlot.time_slot_name }}</span>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-md btn-secondary" @click="showDeleteConfirmModal = false">
                    <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                    </svg>
                    <span>Hủy</span>
                </button>
                <button :class="['btn-md', 'btn-danger', { 'btn-loading': isDeleting }]" @click="confirmDelete" :disabled="isDeleting">
                    <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        <line x1="10" x2="10" y1="11" y2="17"></line>
                        <line x1="14" x2="14" y1="11" y2="17"></line>
                    </svg>
                    <span>{{ isDeleting ? 'Đang xóa...' : 'Xóa' }}</span>
                </button>
            </div>
        </div>
    </base-modal>
    <!-- Modal chỉnh sửa khung giờ -->
    <base-modal
        :is-open="showEditTimeSlotModal"
        title="Chỉnh sửa khung giờ"
        size="medium"
        @close="showEditTimeSlotModal = false"
    >
        <div class="modal-content">
            <base-select
                v-model="selectedTimeSlot.day_of_week_code"
                :options="weekDayOptions"
                placeholder="Chọn ngày trong tuần"
                label="Ngày trong tuần"
                required="true"
            />
            
            <div class="time-range-inputs" style="margin-top: 1rem;">
                <base-select
                    v-model="selectedTimeSlot.start_time"
                    :options="availableStartTimes"
                    label="Từ giờ"
                    placeholder="Chọn giờ bắt đầu"
                    widthFull="true"
                />
                <div class="range-separator">
                    <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M5 12h14"></path>
                        <path d="m12 5 7 7-7 7"></path>
                    </svg>
                </div>
                <base-select
                    v-model="selectedTimeSlot.end_time"
                    :options="editAvailableEndTimes"
                    label="Đến giờ"
                    placeholder="Chọn giờ kết thúc"
                    widthFull="true"
                    :disabled="!selectedTimeSlot.start_time"
                />
            </div>

            <div class="modal-footer">
                <button class="btn-md btn-secondary" @click="showEditTimeSlotModal = false">
                    <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                    </svg>
                    <span>Hủy</span>
                </button>
                <button :class="['btn-md', 'btn-primary', { 'btn-loading': isUpdating }]" @click="updateTimeSlot" :disabled="isUpdating">
                    <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17,21 17,13 7,13 7,21"></polyline>
                        <polyline points="7,3 7,8 15,8"></polyline>
                    </svg>
                    <span>{{ isUpdating ? 'Đang cập nhật...' : 'Cập nhật' }}</span>
                </button>
            </div>
        </div>
    </base-modal>
</template>

<script setup>
import { ref, computed, watch, reactive } from 'vue';

// ============================================
// SETUP
// ============================================
const router = useRouter();
const { api } = useApi();
const { success, error: notifyError } = useNotification();
const configStore = useConfigStore();

const props = defineProps({
    userDataDetail: {
        type: Object,
        default: () => ({})
    }
});

const emit = defineEmits(['update-data']);

// ============================================
// STATE
// ============================================
const scheduleSlots = ref(props.userDataDetail.user_weekly_time_slots || []);
const isSubmitting = ref(false);
const isUpdating = ref(false);
const isDeleting = ref(false);
const selectedMobileDayId = ref(null);

// Modal states
const modals = reactive({
    add: false,
    edit: false,
    delete: false
});

// Form data for ranges
const newTimeSlot = ref({
    day_of_week_code: '',
    ranges: []
});

// Current range being edited
const currentRange = ref({
    start_time: '',
    end_time: ''
});

const selectedTimeSlot = ref({
    id: null,
    day_of_week_code: '',
    time_slot_id: '',
    dayName: '',
    time_slot_name: ''
});

// ============================================
// COMPUTED
// ============================================
const weekDayOptions = computed(() => configStore.configuration?.day_of_weeks || []);
// Generate time slots (every hour)
const timeSlotOptions = computed(() => {
    const slots = [];
    for (let h = 0; h < 24; h++) {
        const timeStr = `${String(h).padStart(2, '0')}:00`;
        const nameStr = timeStr;
        slots.push({ id: timeStr, name: nameStr, time: timeStr });
    }
    // Add 24:00 for end time selection
    slots.push({ id: '24:00', name: '24:00', time: '24:00' });
    return slots;
});

// Initialize mobile day selection
watch(weekDayOptions, (days) => {
    if (days?.length && !selectedMobileDayId.value) {
        selectedMobileDayId.value = days[0].id;
    }
}, { immediate: true });

// Available start times (all time slots)
const availableStartTimes = computed(() => {
    return timeSlotOptions.value.map(slot => ({
        id: slot.time,
        name: slot.name
    }));
});

// Available end times (must be after start time)
const availableEndTimes = computed(() => {
    if (!currentRange.value.start_time) return [];
    
    return timeSlotOptions.value
        .filter(slot => slot.time > currentRange.value.start_time)
        .map(slot => ({
            id: slot.time,
            name: slot.name
        }));
});

// Available end times for edit modal
const editAvailableEndTimes = computed(() => {
    if (!selectedTimeSlot.value.start_time) return [];
    
    return timeSlotOptions.value
        .filter(slot => slot.time > selectedTimeSlot.value.start_time)
        .map(slot => ({
            id: slot.time,
            name: slot.name
        }));
});

// Check if current range can be added
const canAddRange = computed(() => {
    return currentRange.value.start_time && 
           currentRange.value.end_time && 
           currentRange.value.start_time < currentRange.value.end_time;
});

// Check if form can be submitted
const canSubmitNew = computed(() =>
    newTimeSlot.value.day_of_week_code !== null &&
    newTimeSlot.value.ranges.length > 0
);

// ============================================
// HELPER FUNCTIONS
// ============================================
const updateUserData = (slots) => {
    scheduleSlots.value = slots;
    emit('update-data', {
        ...props.userDataDetail,
        user_weekly_time_slots: slots
    });
};

const findSlot = (dayId, slotId) => {
    return scheduleSlots.value.find(
        s => s.day_of_week_code == dayId && s.time_slot_id == slotId
    );
};

// Get all ranges for a specific day
const getDayRanges = (dayId) => {
    return scheduleSlots.value.filter(slot => slot.day_of_week_code == dayId);
};

const resetNewTimeSlot = () => {
    newTimeSlot.value = {
        day_of_week_code: '',
        ranges: []
    };
    currentRange.value = {
        start_time: '',
        end_time: ''
    };
};

// Format time for display
const formatTimeDisplay = (timeStr) => {
    return timeStr || '';
};

// Add a new range to the list
const addRange = () => {
    if (!canAddRange.value) return;

    // Check for overlapping ranges
    const hasOverlap = newTimeSlot.value.ranges.some(range => {
        return (
            (currentRange.value.start_time >= range.start_time && currentRange.value.start_time < range.end_time) ||
            (currentRange.value.end_time > range.start_time && currentRange.value.end_time <= range.end_time) ||
            (currentRange.value.start_time <= range.start_time && currentRange.value.end_time >= range.end_time)
        );
    });

    if (hasOverlap) {
        notifyError('Khoảng thời gian này trùng với khoảng thời gian đã chọn!');
        return;
    }

    newTimeSlot.value.ranges.push({
        start_time: currentRange.value.start_time,
        end_time: currentRange.value.end_time
    });

    // Reset current range
    currentRange.value = {
        start_time: '',
        end_time: ''
    };
};

// Remove a range from the list
const removeRange = (index) => {
    newTimeSlot.value.ranges.splice(index, 1);
};

// Close add modal and reset
const closeAddModal = () => {
    modals.add = false;
    resetNewTimeSlot();
};

const getDayAbbreviation = (name) => {
    if (!name) return '';
    const map = {
        'Thứ Hai': 'T2',
        'Thứ Ba': 'T3',
        'Thứ Tư': 'T4',
        'Thứ Năm': 'T5',
        'Thứ Sáu': 'T6',
        'Thứ Bảy': 'T7',
        'Chủ Nhật': 'CN'
    };
    return map[name] || name.substring(0, 2);
};

// View booking by ID
const viewBookingById = (bookingId) => {
    if (bookingId) {
        const routeData = router.resolve({ name: 'classroom/manager', query: { booking_id: bookingId } });
        window.open(routeData.href, "_blank");
    }
};

// ============================================
// CRUD OPERATIONS
// ============================================
const addTimeSlot = async () => {
    if (!canSubmitNew.value) return;

    isSubmitting.value = true;
    try {
        const payload = {
            day_of_week_code: newTimeSlot.value.day_of_week_code,
            ranges: newTimeSlot.value.ranges
        };

        const response = await api.apiPost('me/schedule', payload);

        if (response?.data) {
            const listSlots = props.userDataDetail.user_weekly_time_slots || [];
            // Add new slots to scheduleSlots
            const newSlots = [...listSlots, ...response.data];

            updateUserData(newSlots);
            success('Thêm khung giờ thành công!');
        }

        modals.add = false;
        resetNewTimeSlot();
    } catch (error) {
        notifyError(error?.message || 'Thêm khung giờ thất bại!');
        console.error('Failed to add time slot:', error);
    } finally {
        isSubmitting.value = false;
    }
};

const updateTimeSlot = async () => {
    if (!selectedTimeSlot.value.id) return;

   isUpdating.value = true;
    try {
        const response = await api.apiPut(
            `me/schedule/${selectedTimeSlot.value.id}`,
            {
                day_of_week_code: selectedTimeSlot.value.day_of_week_code,
                start_time: selectedTimeSlot.value.start_time,
                end_time: selectedTimeSlot.value.end_time
            }
        );

        if (response?.data) {
            const updated = response.data;

            const newSlots = scheduleSlots.value.map(slot => {
                if (slot.id === selectedTimeSlot.value.id) {
                    return {
                        ...slot,
                        day_of_week_code: selectedTimeSlot.value.day_of_week_code,
                        start_time: selectedTimeSlot.value.start_time,
                        end_time: selectedTimeSlot.value.end_time
                    };
                }
                return slot;
            });

            updateUserData(newSlots);
            success('Cập nhật khung giờ thành công!');
        }

        modals.edit = false;
    } catch (error) {
        notifyError(error?.response?.data?.message || 'Cập nhật khung giờ thất bại!');
        console.error('Failed to update time slot:', error);
    } finally {
        isUpdating.value = false;
    }
};

const deleteTimeSlot = async (id) => {
    isDeleting.value = true;
    try {
        await api.apiDelete(`me/schedule/${id}`);

        const newSlots = scheduleSlots.value.filter(slot => slot.id !== id);
        updateUserData(newSlots);

        success('Xóa khung giờ thành công!');
    } catch (error) {
        notifyError(error?.message || 'Xóa khung giờ thất bại!');
        console.error('Failed to delete time slot:', error);
    } finally {
        isDeleting.value = false;
    }
};

// ============================================
// UI HANDLERS
// ============================================
const onAddSlotForDay = (day) => {
    if (!day) return;
    newTimeSlot.value.day_of_week_code = day.id;
    modals.add = true;
};

const handleEditRange = (slot) => {
    if (!slot) return;

    selectedTimeSlot.value = {
        id: slot.id,
        day_of_week_code: slot.day_of_week_code,
        start_time: slot.start_time,
        end_time: slot.end_time,
        time_slot_name: `${formatTimeDisplay(slot.start_time)} - ${formatTimeDisplay(slot.end_time)}`
    };

    modals.edit = true;
};

const handleDeleteRange = (slot) => {
    if (!slot) return;

    const dayName = weekDayOptions.value.find(
        day => day.id === slot.day_of_week_code
    )?.name;

    selectedTimeSlot.value = {
        id: slot.id,
        day_of_week_code: slot.day_of_week_code,
        dayName,
        time_slot_name: `${formatTimeDisplay(slot.start_time)} - ${formatTimeDisplay(slot.end_time)}`
    };

    modals.delete = true;
};

const confirmDelete = () => {
    deleteTimeSlot(selectedTimeSlot.value.id);
    modals.delete = false;
};

// ============================================
// ALIASES (for template compatibility)
// ============================================
const showAddTimeSlotModal = computed({
    get: () => modals.add,
    set: (val) => modals.add = val
});

const showEditTimeSlotModal = computed({
    get: () => modals.edit,
    set: (val) => modals.edit = val
});

const showDeleteConfirmModal = computed({
    get: () => modals.delete,
    set: (val) => modals.delete = val
});

const selectedTimeSlotId = computed(() => selectedTimeSlot.value.id);
</script>

<style scoped>
@import url('~/assets/css/profileNew.css');

.schedule-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-top: 1rem;
}

.schedule-card {
    background: #ffffff;
    border-top: 1px solid #f2f4f7;
    padding: 1.5rem 0;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.day-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
}

.day-avatar span {
    font-weight: 700;
    font-size: var(--font-size-heading-6);
}

.card-header.is-empty .day-avatar {
    background: #e2e8f0; /* Gray background for empty state */
    color: #64748b;
}

.card-header.is-empty .btn-add-circle {
   /* Optional: make the button pop more or less on empty? Keeping it consistent for now */
}

.text-muted {
    color: #94a3b8 !important;
}

.header-info {
    display: flex;
    flex-direction: column;
}

.day-title {
    font-size: var(--font-size-heading-6);
    font-weight: 600;
    color: var(--color-primary);
}

.slot-count {
    font-size: var(--font-size-small);
    color: var(--gray-600);
}

.btn-add-circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #001C55;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-add-circle:hover {
    background: #e9ecef;
    color: #00123A;
}

.time-slots-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
}

.time-slot-pill {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    background-color: #EFF6FF;
    border-radius: 12px;
    border: 1px solid transparent;
    transition: all 0.2s ease;
}

.time-slot-pill.cursor-pointer {
    cursor: pointer;
}

.time-slot-pill:hover {
    border-color: #dbeafe;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.time-text {
    font-weight: 600;
    color: #001C55;
    font-size: 0.9375rem;
}

.btn-remove-slot {
    background: transparent;
    border: none;
    cursor: pointer;
    color: #64748b;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
    border-radius: 4px;
    transition: all 0.2s;
}

.btn-remove-slot:hover {
    color: #ef4444;
    background-color: rgba(239, 68, 68, 0.1);
}

.empty-slots {
    padding: 1rem;
    text-align: center;
    color: #9ca3af;
    font-style: italic;
    background: #f9fafb;
    border-radius: 8px;
    border: 1px dashed #e5e7eb;
}

@media (max-width: 640px) {
    .time-slots-grid {
        grid-template-columns: 1fr;
    }
    
    .schedule-card {
        padding: 1rem;
    }
    
    .day-avatar {
        width: 40px;
        height: 40px;
    }
    
    .day-avatar span {
        font-size: 1rem;
    }
}


/* Enhanced Mobile Schedule */
.schedule-mobile {
    display: none;
    gap: 1rem;
}

.schedule-mobile .mobile-day-tabs {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    padding: 1rem 0.5rem;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
    backdrop-filter: blur(12px);
    border-radius: 16px;
    margin-bottom: 0.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.3);
}

.schedule-mobile .mobile-day-tabs::-webkit-scrollbar {
    height: 4px;
}

.schedule-mobile .mobile-day-tabs::-webkit-scrollbar-track {
    background: transparent;
}

.schedule-mobile .mobile-day-tabs::-webkit-scrollbar-thumb {
    background: var(--color-primary);
    border-radius: 2px;
}

.schedule-mobile .day-tab {
    border: 2px solid #e2e8f0;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border-radius: 12px;
    padding: 0.75rem 1rem;
    font-weight: 600;
    color: #64748b;
    font-size: var(--font-size-small);
    white-space: nowrap;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    min-width: fit-content;
}

.schedule-mobile .day-tab::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s ease;
}

.schedule-mobile .day-tab:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: var(--color-primary-light);
}

.schedule-mobile .day-tab.active {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    color: white;
    border-color: var(--color-primary);
    box-shadow: 0 4px 12px rgba(7, 27, 102, 0.3);
}

.schedule-mobile .day-tab.active::before {
    transform: scaleX(1);
}

.schedule-mobile .mobile-time-list {
    display: grid;
    gap: 0.75rem;
    padding: 0.5rem 0;
}

.schedule-mobile .mobile-time-row {
    display: grid;
    grid-template-columns: 120px 1fr;
    align-items: center;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border: 1px solid rgba(226, 232, 240, 0.8);
    border-radius: 16px;
    padding: 1rem 1.25rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.schedule-mobile .mobile-time-row::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.schedule-mobile .mobile-time-row:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    border-color: var(--color-primary-light);
}

.schedule-mobile .mobile-time-row:hover::before {
    opacity: 1;
}

.schedule-mobile .mobile-time-label {
    color: #374151;
    font-weight: 700;
    font-size: var(--font-size-base);
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.schedule-mobile .mobile-time-label::before {
    content: '🕐';
    font-size: 1rem;
}

.schedule-mobile .mobile-time-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
}

.schedule-mobile .mobile-time-actions > div {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border: 2px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.schedule-mobile .mobile-time-actions > div:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-color: var(--color-primary);
}

.schedule-mobile .mobile-time-actions > div svg {
    color: #6b7280;
    transition: color 0.3s ease;
}

.schedule-mobile .mobile-time-actions > div:hover svg {
    color: var(--color-primary);
}

/* Mobile status indicator */
.mobile-status-indicator {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    margin-right: 0.5rem;
}

.mobile-status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}

.mobile-status-dot.dot-available {
    background: linear-gradient(135deg, #10b981, #059669);
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.mobile-status-dot.dot-busy {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}

.mobile-status-text {
    font-size: 0.75rem;
    font-weight: 600;
}

.mobile-status-indicator .mobile-status-text {
    color: #374151;
    display: none;
}

@media (max-width: 768px) {
    .schedule-by-days { display: none; }
    .schedule-mobile { display: flex; flex-direction: column; gap: 0.5rem; }
}

/* Day-based schedule layout */
.schedule-by-days {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-top: 1rem;
}

.day-column {
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.day-column:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.day-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem;
    background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
    color: var(--gray-900);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.day-header-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.day-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.day-name {
    font-size: var(--font-size-base);
    font-weight: 700;
    color: var(--gray-900);
}

.day-count {
    font-size: var(--font-size-mini);
    color: var(--gray-600);
}

.btn-add-day {
    padding: 0;
	border: none;
    color: black;
    transition: all 0.2s ease;
	background: transparent;
}

.btn-add-day:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
}

.day-ranges {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    min-height: 150px;
    max-height: 600px;
    overflow-y: auto;
}

.day-ranges::-webkit-scrollbar {
    width: 6px;
}

.day-ranges::-webkit-scrollbar-track {
    background: #f8fafc;
    border-radius: 3px;
}

.day-ranges::-webkit-scrollbar-thumb {
    background: var(--color-primary);
    border-radius: 3px;
}

.range-card {
    position: relative;
    padding: 1rem;
    background: white;
    border: 1px solid #e2e8f0;
    border-left: 4px solid var(--color-primary);
    border-radius: 12px;
    transition: all 0.3s ease;
    cursor: pointer;
}

.range-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateX(4px);
}

.range-available {
    border-left-color: #10b981 !important;
    background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%) !important;
}

.range-busy {
    border-left-color: #ef4444 !important;
    background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%) !important;
}

.range-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
}

.range-time-display {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.range-time-display svg {
    color: var(--color-primary);
}

.time-text {
    font-size: var(--font-size-base);
    font-weight: 500;
    color: #374151;
}

.range-booking {
    margin-top: 0.5rem;
    padding: 0.5rem;
    background: rgba(7, 27, 102, 0.05);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.range-booking:hover {
    background: rgba(7, 27, 102, 0.1);
}

.booking-code {
    font-size: var(--font-size-small);
    font-weight: 600;
    color: var(--color-primary);
}

.range-actions {
    opacity: 0;
    position: absolute;
    top: 50%;
	transform: translateY(-50%);
    right: 0.5rem;
    display: flex;
    gap: 0.5rem;
    transition: opacity 0.3s ease;
}

.range-card:hover .range-actions {
    opacity: 1;
}

.action-btn {
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(8px);
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    color: #6b7280;
    transition: all 0.2s ease;
    cursor: pointer;
}

.action-btn:hover {
    background: white;
    transform: scale(1.1);
}

.edit-btn:hover {
    color: var(--color-primary);
    border-color: var(--color-primary);
}

.delete-btn:hover {
    color: #ef4444;
    border-color: #ef4444;
}

.empty-day {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 3rem 1rem;
    color: #9ca3af;
    text-align: center;
}

.empty-day svg {
    opacity: 0.5;
}

.empty-day span {
    font-size: var(--font-size-small);
    font-style: italic;
}

/* Mobile schedule */
.schedule-mobile {
    display: none;
}

.mobile-ranges-container {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    overflow: hidden;
}

.mobile-day-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    color: white;
}

.mobile-day-title {
    font-size: var(--font-size-large);
    font-weight: 700;
}

.mobile-ranges-list {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.mobile-range-card {
    padding: 1rem;
    background: white;
    border: 1px solid #e2e8f0;
    border-left: 4px solid var(--color-primary);
    border-radius: 12px;
    transition: all 0.3s ease;
}

.mobile-range-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
}

.mobile-range-actions {
    display: flex;
    gap: 0.5rem;
}

.action-btn-mobile {
    padding: 0.5rem;
    background: transparent;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    color: #6b7280;
    transition: all 0.2s ease;
}

.action-btn-mobile:hover {
    background: #f8fafc;
    transform: scale(1.1);
}

.mobile-range-time {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
}

.mobile-range-time svg {
    color: var(--color-primary);
}

.mobile-range-time span {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: #374151;
}

.mobile-range-booking {
    margin-top: 0.5rem;
    padding: 0.5rem;
    background: rgba(7, 27, 102, 0.05);
    border-radius: 6px;
    text-align: center;
}

.mobile-range-booking span {
    font-size: var(--font-size-small);
    font-weight: 600;
    color: var(--color-primary);
}

.mobile-empty-day {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 3rem 1rem;
    color: #9ca3af;
    text-align: center;
}

.mobile-empty-day svg {
    opacity: 0.5;
}

.mobile-empty-day span {
    font-size: var(--font-size-small);
    font-style: italic;
}
/* Time multi-select enhancements */
.time-multi-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
}

.time-multi-controls .actions {
    display: flex;
    align-items: center;
    gap: 0.4rem;
}

.time-multi-select {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.5rem;
}

.time-multi-select .time-chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    color: #374151;
    cursor: pointer;
    user-select: none;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-weight: 500;
    font-size: var(--font-size-small);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    position: relative;
    overflow: hidden;
}

.time-multi-select .time-chip::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(7, 27, 102, 0.05) 0%, rgba(7, 27, 102, 0.02) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.time-multi-select .time-chip:hover {
    border-color: var(--color-primary-light);
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.time-multi-select .time-chip:hover::before {
    opacity: 1;
}

.time-multi-select .time-chip.selected {
    border-color: var(--color-primary);
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    color: white;
    font-weight: 600;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(7, 27, 102, 0.25);
}

.time-multi-select .time-chip.selected::before {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
    opacity: 1;
}

.time-multi-select .time-chip.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
    border-color: #d1d5db;
    color: #9ca3af;
}

.time-multi-select .chip-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.main-content {
    overflow: auto;
}

/* Schedule Legend */
.schedule-legend {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
    border-radius: 12px;
    border: 1px solid #e2e8f0;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 0.625rem;
}

.legend-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
}

.legend-dot.available {
    background: linear-gradient(135deg, #10b981, #059669);
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}

.legend-dot.busy {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
}

.legend-text {
    font-size: 0.875rem;
    font-weight: 600;
    color: #475569;
}

.schedule-main {
    width: 100%;
    height: 500px;
    overflow: auto;
    --time-width: 9.7em;
    --time-height: 8.7em;
}

.schedule-grid .list-days,
.schedule-grid .list-time {
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: calc(var(--time-width) - 1rem) repeat(7, var(--time-width));
    min-width: max-content;
}

.schedule-grid .list-days .time-header {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: var(--font-size-base) !important;
}

.schedule-grid .list-days .day {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--gray-600);
    background: #f9fafb;
    border-right: 1px solid var(--gray-200);
    border-top: 1px solid var(--gray-200);
}

.schedule-grid .list-days .day {
    border-right: 1px solid var(--gray-200);
    border-right-color: var(--gray-200);
    border-right-width: 1px;
    padding: 1rem;
}

.schedule-grid .list-days .day:first-child {
    border-top-left-radius: 8px;
}

.schedule-grid .list-days .day:last-child {
    border-top-right-radius: 8px;
}

.schedule-grid .list-days .day:not(.time-header) span:first-child {
    font-size: var(--font-size-base);
    color: black;
    font-weight: 600;
}

.schedule-grid .list-days .day:not(.time-header) span:last-child {
    font-size: var(--font-size-mini);
    color: var(--gray-600);
}

.schedule-grid .list-time {
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    animation-duration: 200ms;
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
}

.schedule-grid .list-time:hover {
    background: #f9fafb80;
}

.schedule-grid .list-time:hover .add-new {
    opacity: 1;
}

.schedule-grid .time-header {
    background: #f9fafb80;
    border-left: 1px solid var(--gray-200);
}

.schedule-grid .list-time .time {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-right: 1px solid var(--gray-200);
    border-top: 1px solid var(--gray-200);
    font-size: 0.8rem;
    padding: 1rem;
    color: black;
}

.schedule-grid .list-time .add-new {
    border: 2px dashed #d1d5db;
    border-radius: 12px;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    padding: 0.75rem;
    color: #9ca3af;
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    position: relative;
    overflow: hidden;
}

.schedule-grid .list-time .add-new::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(7, 27, 102, 0.05) 0%, rgba(7, 27, 102, 0.02) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.schedule-grid .list-time .add-new:hover {
    border-color: var(--color-primary);
    border-style: solid;
    background: linear-gradient(135deg, rgba(7, 27, 102, 0.08) 0%, rgba(7, 27, 102, 0.04) 100%);
    color: var(--color-primary);
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(7, 27, 102, 0.15);
}

.schedule-grid .list-time .add-new:hover::before {
    opacity: 1;
}

.schedule-grid .list-time .content-card {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    border: 2px solid rgba(226, 232, 240, 0.8);
    border-left-color: var(--color-primary);
    border-left-width: 4px;
    border-radius: 12px;
    padding: 0.75rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(7, 27, 102, 0.05) 0%, rgba(7, 27, 102, 0.02) 100%);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.schedule-grid .list-time .content-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    border-color: var(--color-primary-light);
}

.schedule-grid .list-time .content-card:not(.free-time) {
    border: 2px solid rgba(226, 232, 240, 0.8);
    border-left-color: var(--color-primary);
    border-left-width: 4px;
    background: linear-gradient(135deg, rgba(7, 27, 102, 0.05) 0%, rgba(7, 27, 102, 0.02) 100%);
}

.schedule-grid .list-time .free-time {
    border: 2px dashed #d1d5db;
    background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
    border-left-width: 2px;
}

.schedule-grid .list-time .free-time:hover {
    border-style: solid;
    border-color: var(--color-primary-light);
    background: linear-gradient(135deg, rgba(7, 27, 102, 0.08) 0%, rgba(7, 27, 102, 0.04) 100%);
}

.schedule-grid .list-time .free-time .content-detail {
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    color: #374151;
    font-size: var(--font-size-small);
}

/* Time availability status styles */
.time-status-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}

.dot-available {
    background: linear-gradient(135deg, #10b981, #059669);
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.dot-busy {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}

.status-text {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: capitalize;
}

.time-available .status-text {
    color: #065f46;
}

.time-busy .status-text {
    color: #991b1b;
}

.time-available {
    border-left-color: #10b981 !important;
    background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%) !important;
}

.time-busy {
    border-left-color: #ef4444 !important;
    background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%) !important;
    opacity: 0.9;
}

.time-available:hover {
    border-color: #34d399 !important;
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3) !important;
}

.time-busy:hover {
    border-color: #f87171 !important;
    box-shadow: 0 8px 25px rgba(239, 68, 68, 0.25) !important;
    opacity: 1;
}

.schedule-grid .list-time .content-card .subject-wrapper {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-weight: 600;
    color: var(--color-primary);
}

.schedule-grid .list-time .content-card .subject-name, .user-name {
    display: inline-block;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.schedule-grid .list-time .content-card .content-detail {
    color: var(--gray-700);
    font-size: var(--font-size-mini);
    display: flex;
    flex-wrap: wrap;
    gap: 0.2rem;
}

.schedule-grid .list-time .content-card .icon-wrapper {
    background: var(--color-primary-transparent);
    border-radius: 2rem;
    min-width: 1.5rem;
    min-height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-primary);
}

.current-week {
    padding: 1rem 0;
    border: 1px solid var(--gray-100);
    border-radius: 0.4rem;
    padding: 1rem;
}

.current-week-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 8px;
}

.current-week-header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.current-week-header-left-title {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    line-height: 1;
}

.current-week-header-left-title .current-week-title {
    font-size: var(--font-size-medium);
    font-weight: bold;
}

.current-week-header-left-title .sub-title {
    font-size: var(--font-size-base);
    color: var(--gray-600);
}

.status-wrapper {
    font-size: var(--font-size-mini);
    color: var(--color-primary);
    background: var(--blue-50);
    border: 1px solid var(--blue-200);
    border-radius: 2rem;
    padding: 0.2rem 1rem;
    font-weight: 600;
}

.slot-actions {
    opacity: 0;
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.schedule-grid .list-time .content-card:hover .slot-actions {
    opacity: 1;
}

.slot-actions button {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(8px);
    padding: 0.375rem;
    border-radius: 8px;
    border: 1px solid rgba(226, 232, 240, 0.6);
    color: #6b7280;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.slot-actions button:hover {
    background: white;
    color: var(--color-primary);
    border-color: var(--color-primary);
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(7, 27, 102, 0.2);
}

.slot-actions button:active {
    transform: scale(0.95);
}

.selected-time-slot {
    border: 1px solid var(--gray-200);
    border-left-color: var(--color-primary);
    border-left-width: 4px;
    border-radius: 10px;
    padding: 1rem;
}

.time-slot-preview {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #374151;
    font-size: var(--font-size-base);
}

/* .select-day {
    display: grid;
    gap: 0.7rem;
}
.select-day_header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.select-day_header-right {
    font-size: var(--font-size-heading-6);
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.4rem;
}
.select-day_header-left {
    font-size: var(--font-size-small);
    color: var(--gray-500);
}
.select-day-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
}
.select-day-grid .day-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1rem 1rem;
    border: 1px solid var(--gray-200);
    border-radius: 0.6rem;
    cursor: pointer;
}
.select-day-grid .day-item.selected {
    background: var(--color-primary);
}
.select-day-grid .day-item.selected .title {
    color: white !important;
}
.select-day-grid .day-item.selected .sub-title {
    color: var(--gray-300) !important;
}

.select-day-grid .day-item .title {
    font-size: var(--font-size-small);
    color: var(--gray-700);
}
.select-day-grid .day-item .sub-title{
    font-size: var(--font-size-mini);
    color: var(--gray-500);
} */

/* Range-based time slot selection styles */
.ranges-list {
    padding: 1rem;
    background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
    border: 1px solid #e2e8f0;
    border-radius: 12px;
}

.ranges-header {
    margin-bottom: 0.75rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #e2e8f0;
}

.ranges-title {
    font-size: var(--font-size-base);
    font-weight: 500;
    color: #374151;
}

.range-items {
    display: grid;
    gap: 0.5rem;
}

.range-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    background: white;
    border: 1px solid #e2e8f0;
    border-left: 4px solid var(--color-primary);
    border-radius: 8px;
    transition: all 0.2s ease;
}

.range-time {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: var(--font-size-base);
    font-weight: 500;
    color: #374151;
}

.range-time svg {
    color: var(--color-primary);
}

.btn-remove {
	padding: 0;
	border: none;
	background: transparent;
	color: var(--color-primary);
	transition: all 0.2s ease;
	cursor: pointer;
}

.btn-remove:hover {
	color: var(--color-primary-dark);
}

.add-range-form {
    padding: 1.25rem;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border: 2px dashed #cbd5e1;
    border-radius: 12px;
    transition: all 0.3s ease;
}

.add-range-form:hover {
    border-color: var(--color-primary);
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.add-range-form .form-label {
    font-size: var(--font-size-base);
    font-weight: 500;
    color: #374151;
    margin-bottom: 1rem;
}

.time-range-inputs {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 1rem;
    align-items: end;
    margin-bottom: 1rem;
}

.range-separator {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-bottom: 0.5rem;
    color: var(--color-primary);
}

.btn-add-range {
    width: 100%;
    justify-content: center;
}

@media (max-width: 768px) {
    .time-range-inputs {
        grid-template-columns: 1fr;
        gap: 0.75rem;
    }
    
    .range-separator {
        display: none;
    }
}

</style>
