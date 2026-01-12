<template>
    <base-modal
        :isOpen="isOpen"
        :title="existingComplaint ? 'Xem khiếu nại' : 'Gửi khiếu nại'"
        description="Gửi khiếu nại nếu bạn muốn khiếu nại về người dùng"
        @close="$emit('close')"
        size="medium"
    >
        <div class="complaint-modal">
            <!-- Existing Complaint Display -->
            <div v-if="existingComplaint" class="existing-complaint">
                <div class="complaint-view">
                    <div class="status-board complaint-card">
                        <div class="board-title">Trạng thái xử lý</div>
                        <div class="board-steps">
                            <div
                                v-for="item in listStatusComplaint"
                                :key="item.id"
                                class="board-step"
                                :class="{ active: existingComplaint.status === item.id }"
                            >
                                <div class="icon-circle" :class="{ active: existingComplaint.status === item.id }">
                                    <template v-if="item.id ==='rejected'">
                                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                                    </template>
                                    <template v-else-if="item.id ==='under_review'">
                                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg>
                                    </template>
                                    <template v-else>
                                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>
                                    </template>
                                </div>
                                <div class="step-text">
                                    <div class="step-title">{{ item.name }}</div>
                                    <div class="step-desc"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="info-grid">
                        <div class="card complaint-card">
                            <div class="card-title">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1f2937" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M4 21v-2a4 4 0 0 1 3-3.87"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                Thông tin cơ bản
                            </div>
                            <div class="card-row"><span>Loại khiếu nại:</span><span class="chip">{{ existingComplaint.complaint_type || existingComplaint.complaint_type_label }}</span></div>
                            <div class="card-row"><span>Người gửi:</span><span>{{ existingComplaint.user?.full_name || existingComplaint.reported_by?.full_name }}</span></div>
                        </div>

                        <div class="card complaint-card">
                            <div class="card-title">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1f2937" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                Thời gian xử lý
                            </div>
                            <div class="card-row"><span>Ngày gửi:</span><span>{{ existingComplaint.created_at ? formatDate(existingComplaint.created_at) : '' }}</span></div>
                            <div class="card-row">
                                <span>Dự kiến hoàn thành:</span>
                                <span class="chip warning-chip">{{ existingComplaint.complaint_expected_date ? formatDate(existingComplaint.complaint_expected_date) : '' }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="detail-card complaint-card">
                        <div class="detail-title">Mô tả chi tiết</div>
                        <div class="detail-content">{{ existingComplaint.description || '-' }}</div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-md btn-secondary" @click="$emit('close')">
                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 6 6 18"></path>
                            <path d="m6 6 12 12"></path>
                        </svg>
                        Đóng
                    </button>
                </div>
            </div>

            <!-- Complaint Form -->
            <div v-else class="complaint-form">
                <div class="form-section">
                    <base-select
                        v-model="complaintType"
                        :options="optionComplaintTypes"
                        label="Loại khiếu nại"
                        :required="true"
                    ></base-select>
                </div>

                <div class="form-section">
                    <label class="section-label">
                        <svg class="label-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                        </svg>
                        Mô tả chi tiết
                        <span class="required">*</span>
                    </label>
                    <base-input
                        type="textarea"
                        v-model="description"
                        placeholder="Vui lòng mô tả chi tiết vấn đề bạn gặp phải..."
                        :rows="5"
                        class="description-textarea"
                    ></base-input>
                </div>

                <div class="modal-footer">
                    <button class="btn-lg btn-secondary" @click="$emit('close')">
                        <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                        Hủy
                    </button>
                    <button
                        class="btn-lg btn-primary"
                        :class="{ 'loading': isSubmitting, 'disabled': !canSubmit }"
                        @click="submitComplaint"
                        :disabled="!canSubmit || isSubmitting"
                    >
                        <svg v-if="isSubmitting" class="icon-md loading-icon" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <svg v-else class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                        </svg>
                        {{ isSubmitting ? 'Đang gửi...' : 'Gửi khiếu nại' }}
                    </button>
                </div>
            </div>
        </div>
    </base-modal>
</template>

<script setup>
const { api } = useApi();
const { success, error: notifyError } = useNotification();
const { formatDate } = useHelper();

const configStore = useConfigStore();

const listStatusComplaint = computed(() => configStore.configuration.booking_complaint_status || {})
const listComplaintTypes = computed(() => configStore.configuration.complaint_types || [])

const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false
    },
    booking: {
        type: Object,
        default: null
    },
});

const emit = defineEmits(['close', 'complaintSubmitted']);

const complaintType = ref('');
const description = ref('');
const isSubmitting = ref(false);
const existingComplaint = computed(() => props.booking?.user_booking_complaint);
const optionComplaintTypes = computed(() => listComplaintTypes.value);

const canSubmit = computed(() =>
    !!complaintType.value && description.value.trim().length > 0
);

const submitComplaint = async () => {
    if (!canSubmit.value || isSubmitting.value || !props.booking) return;

    isSubmitting.value = true;

    try {
        const payload = {
            booking_id: props.booking.id,
            complaint_type: complaintType.value,
            description: description.value.trim(),
            evidence: []
        };

        const response = await api.apiPost('bookings/complaints', payload);

        if (response.success) {
            success(response.message || 'Gửi khiếu nại thành công');
            emit('complaintSubmitted', response.data);
            emit('close');
        } else {
            notifyError(response.message || 'Gửi khiếu nại thất bại');
        }
    } catch (error) {
        console.error('Error submitting complaint:', error);
        notifyError('Có lỗi xảy ra khi gửi khiếu nại');
    } finally {
        isSubmitting.value = false;
    }
};

// Reset form when modal opens
watch(() => props.isOpen, (newVal) => {
    if (newVal && !existingComplaint.value) {
        complaintType.value = '';
        description.value = '';
    }
});
</script>

<style scoped>
@import url("~/assets/css/ComplaintModal.css");
</style>

