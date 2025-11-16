<template>
<!-- Loading overlay -->
<base-loading v-if="isLoading" />

<div class="section-card schedule-section" v-if="!isLoading">
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

        <div class="schedule-main format-scrollbar">
            <div class="schedule-grid">
                <div class="list-days">
                    <div class="day time-header">
                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                    </div>
                    <div class="day" v-for="day in weekDayOptions" :key="day.id">
                        <span>{{ day.name }}</span>
                        <span>{{ day.name }}</span>
                    </div>
                </div>
                <div class="list-time" v-for="slot in timeSlotOptions" :key="slot.id">
                        <div class="time time-header">
                            <span>{{ slot.name }}</span>
                        </div>
                        <div class="time" v-for="day in weekDayOptions" :key="day.id + '-' + slot.id">
                            <template v-if="hasTimeSlot(day, slot)">
                                <div class="content-card" :class="{ 'time-available': getTimeSlotAvailability(day, slot), 'time-busy': !getTimeSlotAvailability(day, slot) }">
                                    <div class="time-status-indicator">
                                        <span class="status-dot" :class="{ 'dot-available': getTimeSlotAvailability(day, slot), 'dot-busy': !getTimeSlotAvailability(day, slot) }"></span>
                                        <span class="status-text">{{ findSlot(day.id, slot.id)?.is_available_text }}</span>
                                    </div>
                                    <div class="content-detail">
                                        <span v-if="!getTimeSlotAvailability(day, slot)" @click.stop="viewBooking(day, slot)">#{{ findSlot(day.id, slot.id)?.request_code }}</span>
                                        <span v-else>{{ getSlotTimeRange(day, slot) }}</span>
                                    </div>
                                    <div class="slot-actions">
                                        <button @click.stop="handleEditTimeSlot(getTimeSlotId(day, slot))">
                                            <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"></path></svg>
                                        </button>
                                        <button @click.stop="handleDeleteTimeSlot(getTimeSlotId(day, slot))">
                                            <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>
                                        </button>
                                    </div>
                                </div>
                            </template>
                            <template v-else>
                                <button class="add-new" @click="onAddSlot(day, slot)">
                                    <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M5 12h14"></path>
                                        <path d="M12 5v14"></path>
                                    </svg>
                                </button>
                            </template>
                        </div>
                    </div>
            </div>
        </div>

        <!-- Mobile layout: day tabs + single-day slots -->
        <div class="schedule-mobile">
            <div class="mobile-day-tabs">
                <button
                    v-for="day in weekDayOptions"
                    :key="'m-' + day.id"
                    class="day-tab"
                    :class="{ active: day.id === selectedMobileDayId }"
                    @click="selectedMobileDayId = day.id"
                >
                    {{ day.name }}
                </button>
            </div>
            <div class="mobile-time-list">
                <div class="mobile-time-row" v-for="slot in timeSlotOptions" :key="'m-time-' + slot.id">
                    <div class="mobile-time-label">{{ slot.name }}</div>
                    <div class="mobile-time-actions">
                        <template v-if="selectedDayObj && hasTimeSlot(selectedDayObj, slot)">
                            <div class="mobile-status-indicator">
                                <span class="mobile-status-dot" :class="{ 'dot-available': getTimeSlotAvailability(selectedDayObj, slot), 'dot-busy': !getTimeSlotAvailability(selectedDayObj, slot) }"></span>
                                <span class="mobile-status-text">{{ getTimeSlotAvailability(selectedDayObj, slot) ? 'Trống' : 'Bận' }}</span>
                            </div>
                            <div @click="handleEditTimeSlot(getTimeSlotId(selectedDayObj, slot))">
                                <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"></path></svg>
                            </div>
                            <div @click="handleDeleteTimeSlot(getTimeSlotId(selectedDayObj, slot))">
                                <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>
                            </div>
                        </template>
                        <template v-else>
                            <div @click="onAddSlot(selectedDayObj, slot)">
                                <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                            </div>
                        </template>
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
        size="medium"
        @close="showAddTimeSlotModal = false"
    >
        <div class="modal-content">
            <base-select
                v-model="newTimeSlot.day_of_week_code"
                :options="weekDayOptions"
                label="Ngày trong tuần"
                placeholder="Chọn ngày trong tuần"
                required="true"
            />

            <div class="form-group-container d-grid">
                <div class="time-multi-controls">
                    <base-input
                        v-model="timeFilter"
                        type="text"
                        class="search-input"
                        placeholder="Lọc khung giờ..."
                    >
                        <template #icon>
                            <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </template>
                    </base-input>
                    <div class="actions">
                        <button type="button" class="btn-md btn-secondary" @click="selectAllFiltered">Chọn tất cả</button>
                    </div>
                </div>

                <div class="time-multi-select">
                    <div
                        v-for="opt in filteredSelectableTimeSlots"
                        :key="opt.id"
                        class="time-chip"
                        :class="{ selected: isSelected(opt.id), disabled: opt.disabled }"
                        @click="!opt.disabled && toggleSelect(opt.id)"
                    >
                        <span class="chip-label">{{ opt.name }}</span>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-md btn-secondary" @click="showAddTimeSlotModal = false">
                    <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                    </svg>
                    <span>Hủy</span>
                </button>
                <button class="btn-md btn-primary" @click="addTimeSlot" :disabled="!canSubmitNew">
                    <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                    <span>Thêm {{ newTimeSlot.time_slot_ids.length || '' }} khung giờ</span>
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
                <button class="btn-md btn-primary" @click="confirmDelete">
                    <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        <line x1="10" x2="10" y1="11" y2="17"></line>
                        <line x1="14" x2="14" y1="11" y2="17"></line>
                    </svg>
                    <span>Xóa</span>
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
            <div class="form-group-container">
            <base-select
                v-model="selectedTimeSlot.time_slot_id"
                :options="timeSlotOptions"
                label="Khung giờ"
                placeholder="Chọn khung giờ"
                widthFull="true"
                required="true"
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
                <button class="btn-md btn-primary" @click="updateTimeSlot">
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

<!--
    <div class="content-card">
        <div class="subject-wrapper">
            <div class="icon-wrapper">
                <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
            </div>
            <span class="subject-name">Toán cao cấp</span>
        </div>
        <div class="content-detail">
            <span class="user-name">Nguyễn tiến thành</span>
            <span>07:00</span> - <span>08:00</span>
        </div>
    </div>
 -->
<!-- End language-section -->
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
const isLoading = ref(false);
const timeFilter = ref('');
const selectedMobileDayId = ref(null);

// Modal states
const modals = reactive({
    add: false,
    edit: false,
    delete: false
});

// Form data
const newTimeSlot = ref({
    day_of_week_code: '',
    time_slot_ids: [],
    repeat_weekly: true
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
const timeSlotOptions = computed(() => configStore.configuration?.time_slots || []);

// Initialize mobile day selection
watch(weekDayOptions, (days) => {
    if (days?.length && !selectedMobileDayId.value) {
        selectedMobileDayId.value = days[0].id;
    }
}, { immediate: true });

const selectedDayObj = computed(() =>
    weekDayOptions.value.find(d => d.id === selectedMobileDayId.value)
);

const selectedDaySlots = computed(() => {
    if (!newTimeSlot.value.day_of_week_code) return [];
    return scheduleSlots.value.filter(
        slot => slot.day_of_week_code == newTimeSlot.value.day_of_week_code
    );
});

const selectableTimeSlots = computed(() => {
    const usedIds = new Set(selectedDaySlots.value.map(s => s.time_slot_id));
    return timeSlotOptions.value.map(slot => ({
        ...slot,
        disabled: usedIds.has(slot.id)
    }));
});

const filteredSelectableTimeSlots = computed(() => {
    const keyword = timeFilter.value.trim().toLowerCase();
    if (!keyword) return selectableTimeSlots.value;

    return selectableTimeSlots.value.filter(slot =>
        (slot.name || '').toLowerCase().includes(keyword)
    );
});

const canSubmitNew = computed(() =>
    !!newTimeSlot.value.day_of_week_code &&
    newTimeSlot.value.time_slot_ids.length > 0
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

const getTimeSlotName = (slotId) => {
    return timeSlotOptions.value.find(t => t.id == slotId)?.name || '';
};

const resetNewTimeSlot = () => {
    newTimeSlot.value = {
        day_of_week_code: '',
        time_slot_ids: [],
        repeat_weekly: true
    };
    timeFilter.value = '';
};

// ============================================
// TIME SLOT CHECKS
// ============================================
const hasTimeSlot = (day, slot) => {
    return !!findSlot(day.id, slot.id);
};

const getTimeSlotId = (day, slot) => {
    return findSlot(day.id, slot.id)?.id || null;
};

const getSlotTimeRange = (day, slot) => {
    const found = findSlot(day.id, slot.id);
    return found?.time_slot_name || getTimeSlotName(found?.time_slot_id) || null;
};

const getTimeSlotAvailability = (day, slot) => {
    const found = findSlot(day.id, slot.id);
    // is_available = null => trống (true)
    // is_available = booking_id => đã đặt (false)
    return found ? (found.is_available == null) : false;
};

// ============================================
// SELECTION HANDLERS
// ============================================
const isSelected = (id) => newTimeSlot.value.time_slot_ids.includes(id);

const toggleSelect = (id) => {
    const ids = newTimeSlot.value.time_slot_ids;
    const index = ids.indexOf(id);

    if (index === -1) {
        ids.push(id);
    } else {
        ids.splice(index, 1);
    }
};

const selectAllFiltered = () => {
    const availableIds = filteredSelectableTimeSlots.value
        .filter(slot => !slot.disabled)
        .map(slot => slot.id);

    const currentSet = new Set(newTimeSlot.value.time_slot_ids);
    availableIds.forEach(id => currentSet.add(id));

    newTimeSlot.value.time_slot_ids = Array.from(currentSet);
};

// ============================================
// CRUD OPERATIONS
// ============================================
const addTimeSlot = async () => {
    if (!canSubmitNew.value) return;

    isLoading.value = true;
    try {
        const payload = {
            day_of_week_code: newTimeSlot.value.day_of_week_code,
            time_slot_ids: newTimeSlot.value.time_slot_ids,
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
        isLoading.value = false;
    }
};

const updateTimeSlot = async () => {
    if (!selectedTimeSlot.value.id) return;

    try {
        const response = await api.apiPut(
            `me/schedule/${selectedTimeSlot.value.id}`,
            {
                day_of_week_code: selectedTimeSlot.value.day_of_week_code,
                time_slot_id: selectedTimeSlot.value.time_slot_id,
            }
        );

        if (response?.data) {
            const updated = response.data;
            const timeSlotName = getTimeSlotName(updated.time_slot_id || updated.data?.time_slot_id);

            const newSlots = scheduleSlots.value.map(slot => {
                if (slot.id === selectedTimeSlot.value.id) {
                    return {
                        ...slot,
                        day_of_week_code: selectedTimeSlot.value.day_of_week_code,
                        time_slot_id: selectedTimeSlot.value.time_slot_id,
                        time_slot_name: timeSlotName || slot.time_slot_name
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
    }
};

const deleteTimeSlot = async (id) => {
    try {
        await api.apiDelete(`me/schedule/${id}`);

        const newSlots = scheduleSlots.value.filter(slot => slot.id !== id);
        updateUserData(newSlots);

        success('Xóa khung giờ thành công!');
    } catch (error) {
        notifyError(error?.message || 'Xóa khung giờ thất bại!');
        console.error('Failed to delete time slot:', error);
    }
};

// ============================================
// UI HANDLERS
// ============================================
const onAddSlot = (day, slot) => {
    newTimeSlot.value = {
        day_of_week_code: day.id,
        time_slot_ids: [slot.id],
        repeat_weekly: true
    };
    modals.add = true;
};

const handleEditTimeSlot = (id) => {
    const slot = scheduleSlots.value.find(s => s.id === id);
    if (!slot) return;

    selectedTimeSlot.value = {
        id: slot.id,
        day_of_week_code: slot.day_of_week_code,
        time_slot_id: slot.time_slot_id,
        time_slot_name: slot.time_slot_name
    };

    modals.edit = true;
};

const handleDeleteTimeSlot = (id) => {
    const slot = scheduleSlots.value.find(s => s.id === id);
    if (!slot) return;

    const dayName = weekDayOptions.value.find(
        day => day.id === slot.day_of_week_code
    )?.name;

    selectedTimeSlot.value = {
        id: slot.id,
        day_of_week_code: slot.day_of_week_code,
        time_slot_id: slot.time_slot_id,
        dayName,
        time_slot_name: slot.time_slot_name
    };

    modals.delete = true;
};

const confirmDelete = () => {
    deleteTimeSlot(selectedTimeSlot.value.id);
    modals.delete = false;
};

const viewBooking = (day, slot) => {
    const weeklySlot = scheduleSlots.value.find(s => s.day_of_week_code == day.id && s.time_slot_id == slot.id);

    if (weeklySlot && weeklySlot.is_available !== null) {
        // is_available chứa booking_id
        const bookingId = weeklySlot.is_available;
        const routeData = router.resolve(({ name: 'classroom-manager', query: { booking_id: bookingId } }));
        window.open(routeData.href, "_blank");
    }
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
    .schedule-main { display: none; }
    .schedule-mobile { display: grid; gap: 0.5rem; }
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
</style>
