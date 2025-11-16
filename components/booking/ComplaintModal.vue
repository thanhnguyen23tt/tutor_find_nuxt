<template>
    <base-modal
        :isOpen="isOpen"
        :title="existingComplaint ? 'Xem khiếu nại' : 'Gửi khiếu nại'"
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
                                v-for="key in Object.keys(listStatusComplaint)"
                                :key="key"
                                class="board-step"
                                :class="{ active: existingComplaint.status === key }"
                            >
                                <div class="icon-circle" :class="{ active: existingComplaint.status === key }">
                                    <template v-if="key==='rejected'">
                                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                                    </template>
                                    <template v-else-if="key==='under_review'">
                                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg>
                                    </template>
                                    <template v-else>
                                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>
                                    </template>
                                </div>
                                <div class="step-text">
                                    <div class="step-title">{{ listStatusComplaint?.[key] || key }}</div>
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
                    >
                        <template #icon>
                            <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </template>
                    </base-select>
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
import { ref, computed, watch } from 'vue';

const { api } = useApi();
const { success, error: notifyError } = useNotification();
const { formatDate } = useHelper();

const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false
    },
    booking: {
        type: Object,
        default: null
    },
    listStatusComplaint: {
        type: Object,
        default: () => ({})
    },
    listComplaintTypes: {
        type: Object,
        default: () => ({})
    }
});

const emit = defineEmits(['close', 'complaintSubmitted']);

const complaintType = ref('');
const description = ref('');
const isSubmitting = ref(false);
const existingComplaint = computed(() => props.booking?.user_booking_complaint);

const optionComplaintTypes = computed(() =>
    Object.entries(props.listComplaintTypes || {}).map(([key, value]) => {
        return {
            value: key,
            name: value
        }
    })
);

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
.complaint-modal {
    padding: 0;
    max-width: 100%;
}

/* Existing Complaint Styles */
.existing-complaint {
    display: flex;
    flex-direction: column;
}

.complaint-view {
    display: grid;
    gap: 1.7rem;
}

.status-board {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #fff;
    padding: 1rem;
}

.board-title {
    font-weight: 500;
    margin-bottom: 1.5rem;
}

.board-steps {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1rem;
}

.board-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
    color: #6b7280;
    text-align: center;
}

.board-step .step-title {
    font-weight: 500;
    font-size: var(--font-size-base);
}

.board-step .step-desc {
    font-size: var(--font-size-mini);
}

.icon-circle {
    width: 3.1rem;
    height: 3.1rem;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--gray-300);
    color: var(--gray-500);
    background: var(--gray-100);
}

.icon-circle.active {
    background: var(--color-primary);
    color: white;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
}

.card {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #fff;
    padding: 1.3rem;
}

.card-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
    margin-bottom: 0.6rem;
}

.card-row {
    display: flex;
    justify-content: space-between;
    padding: 0.35rem 0;
    font-size: var(--font-size-small);
}

.card-row span:last-child {
    color: var(--gray-500);
}

.detail-card {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #fff;
    padding: 1rem;
}

.detail-title {
    font-weight: 500;
    margin-bottom: 0.6rem;
}

.detail-content {
    color: #374151;
    font-size: var(--font-size-small);
}

/* Complaint containers use shadow instead of border */
.complaint-card {
    border: none !important;
    box-shadow: 0 0 1px rgba(0, 0, 0, 0.1), 0 0 4px rgba(0, 0, 0, 0.1);
}

/* Complaint Form Styles */
.complaint-form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.form-header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
    border-radius: 16px;
    border: 1px solid #fecaca;
}

.form-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.form-icon svg {
    width: 24px;
    height: 24px;
    color: white;
}

.form-header h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.4rem;
    font-weight: 700;
    color: #1e293b;
}

.form-header p {
    margin: 0;
    color: #64748b;
    font-size: 0.95rem;
    line-height: 1.5;
}

.form-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
    background: white;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.section-label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 600;
    color: #374151;
    font-size: 1rem;
    margin: 0;
}

.label-icon {
    width: 20px;
    height: 20px;
    color: #ef4444;
}

.required {
    color: #ef4444;
    font-weight: 700;
}

.description-textarea {
    margin-top: 0.5rem;
}

.loading-icon {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

/* Mobile Responsive */
@media (max-width: 768px) {
    .form-header {
        padding: 1.25rem;
        flex-direction: column;
        text-align: center;
        gap: 1rem;
    }

    .form-header h3 {
        font-size: 1.25rem;
    }

    .form-section {
        padding: 1.25rem;
    }

    .info-grid {
        grid-template-columns: 1fr;
    }

    .board-steps {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 480px) {
    .complaint-modal {
        padding: 0;
    }

    .board-steps {
        grid-template-columns: 1fr;
    }
}
</style>

