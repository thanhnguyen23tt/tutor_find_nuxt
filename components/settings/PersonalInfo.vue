<script setup>
import { ref, reactive, computed, onMounted } from 'vue';

const { api } = useApi();
const { success, error: notifyError } = useNotification();
const configStore = useConfigStore();

// Form data
const userProfile = ref({});
const isLoading = ref(false);

// Form sections
const basicInfoForm = reactive({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    cccd: '',
    sex: null,
    about_you: '',
    provinces_id: null
});

// Modal & Editing Logic
const activeModal = ref(null);
const editingForm = reactive({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    provinces_id: null
});
const isSaving = ref(false);
const errors = ref({});

// Computed
const maskedEmail = computed(() => {
    const email = basicInfoForm.email;
    if (!email) return 'Chưa cung cấp';
    const [name, domain] = email.split('@');
    if (!name || !domain) return email;
    const maskedName = name.length > 2 ? name[0] + '***' + name[name.length - 1] : name;
    return `${maskedName}@${domain}`;
});

const provinceOptions = computed(() => {
    return configStore.configuration?.provinces?.map(p => ({
        value: p.id,
        label: p.name
    })) || [];
});

const provinceName = computed(() => {
    if (!basicInfoForm.provinces_id) return 'Chưa cung cấp';
    const province = provinceOptions.value.find(p => p.value === basicInfoForm.provinces_id);
    return province ? province.label : 'Chưa cung cấp';
});

const modalTitle = computed(() => {
    switch (activeModal.value) {
        case 'first_name': return 'Họ';
        case 'last_name': return 'Tên';
        case 'email': return 'Địa chỉ email';
        case 'phone': return 'Số điện thoại';
        case 'provinces_id': return 'Tỉnh/Thành phố';
        default: return '';
    }
});

const modalDescription = computed(() => {
    switch (activeModal.value) {
        case 'first_name': return 'Nhập họ của bạn như trên giấy tờ tùy thân.';
        case 'last_name': return 'Nhập tên của bạn như trên giấy tờ tùy thân.';
        case 'email': return 'Sử dụng địa chỉ email để đăng nhập và nhận thông báo.';
        case 'phone': return 'Thêm số điện thoại để khách đã xác nhận có thể liên hệ với bạn.';
        case 'provinces_id': return 'Chọn tỉnh/thành phố nơi bạn đang sinh sống.';
        default: return '';
    }
});

// Methods
const loadUserProfile = async () => {
    isLoading.value = true;
    try {
        const response = await api.apiGet('me/setting');
        if (response.success !== false) {
            userProfile.value = response.data;

            // Populate forms with user data
            Object.assign(basicInfoForm, {
                first_name: response.data.first_name || '',
                last_name: response.data.last_name || '',
                phone: response.data.phone || '',
                email: response.data.email || '',
                cccd: response.data.cccd || '',
                sex: response.data.sex || null,
                about_you: response.data.about_you || '',
                provinces_id: response.data.provinces_id || null
            });
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
        notifyError('Không thể tải thông tin hồ sơ');
    } finally {
        isLoading.value = false;
    }
};

const openModal = (field) => {
    activeModal.value = field;
    errors.value = {};
    editingForm[field] = basicInfoForm[field];
};

const closeModal = () => {
    activeModal.value = null;
    errors.value = {};
};

const saveChanges = async () => {
    if (!activeModal.value) return;

    isSaving.value = true;
    errors.value = {};

    try {
        const field = activeModal.value;
        const payload = {
            ...basicInfoForm,
            [field]: editingForm[field]
        };

        const response = await api.apiPut('me/setting', payload);

        if (response.success !== false) {
            success('Cập nhật thành công!');
            basicInfoForm[field] = editingForm[field];
            if (userProfile.value) {
                userProfile.value[field] = editingForm[field];
            }
            closeModal();
        } else {
            if (response.errors) {
                errors.value = response.errors;
            }
            notifyError(response.message || 'Cập nhật thất bại');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        if (error?.errors) {
            errors.value = error.errors;
        }
        notifyError(error?.message || 'Có lỗi xảy ra');
    } finally {
        isSaving.value = false;
    }
};

onMounted(() => {
    loadUserProfile();
});
</script>

<template>
    <section class="settings-content">
        <div class="content-header">
            <h2 class="section-title">Thông tin cá nhân</h2>
        </div>

        <div class="info-list">
            <!-- Legal Name (First Name) -->
            <div class="info-item">
                <div class="info-main">
                    <div class="info-label">Họ</div>
                    <div class="info-value">{{ basicInfoForm.first_name }}</div>
                </div>
                <div class="info-action">
                    <button class="btn-link" @click="openModal('first_name')">Chỉnh sửa</button>
                </div>
            </div>

            <!-- Preferred Name (Last Name) -->
            <div class="info-item">
                <div class="info-main">
                    <div class="info-label">Tên</div>
                    <div class="info-value">{{ basicInfoForm.last_name }}</div>
                </div>
                <div class="info-action">
                    <button class="btn-link" @click="openModal('last_name')">Chỉnh sửa</button>
                </div>
            </div>

            <!-- Email -->
            <div class="info-item">
                <div class="info-main">
                    <div class="info-label">Địa chỉ email</div>
                    <div class="info-value">{{ maskedEmail }}</div>
                </div>
                <div class="info-action">
                    <button class="btn-link" @click="openModal('email')">Chỉnh sửa</button>
                </div>
            </div>

            <!-- Phone -->
            <div class="info-item">
                <div class="info-main">
                    <div class="info-label">Số điện thoại</div>
                    <div class="info-value" v-if="basicInfoForm.phone">{{ basicInfoForm.phone }}</div>
                    <div class="info-desc">
                        Thêm số điện thoại để khách đã xác nhận có thể liên hệ với bạn. Bạn có thể
                        thêm các số điện thoại khác và chọn mục đích sử dụng tương ứng.
                    </div>
                </div>
                <div class="info-action">
                    <button class="btn-link" @click="openModal('phone')">{{ basicInfoForm.phone ? 'Chỉnh sửa' : 'Thêm' }}</button>
                </div>
            </div>

            <!-- Province/City -->
            <div class="info-item">
                <div class="info-main">
                    <div class="info-label">Tỉnh/Thành phố</div>
                    <div class="info-value">{{ provinceName }}</div>
                </div>
                <div class="info-action">
                    <button class="btn-link" @click="openModal('provinces_id')">{{ basicInfoForm.provinces_id ? 'Chỉnh sửa' : 'Thêm' }}</button>
                </div>
            </div>

            <!-- Identity Verification -->
            <div class="info-item">
                <div class="info-main">
                    <div class="info-label">Xác minh danh tính</div>
                    <div class="info-value">Chưa bắt đầu</div>
                </div>
                <div class="info-action">
                    <button class="btn-link">Bắt đầu</button>
                </div>
            </div>
        </div>

        <!-- Edit Modal -->
        <base-modal :is-open="!!activeModal" :title="modalTitle" :description="modalDescription" @close="closeModal" size="base">
            <div class="modal-form">
                <div v-if="activeModal === 'first_name'">
                    <base-input v-model="editingForm.first_name" label="Họ" placeholder="Nhập họ của bạn"
                        :error="errors.first_name" />
                </div>

                <div v-if="activeModal === 'last_name'">
                    <base-input v-model="editingForm.last_name" label="Tên" placeholder="Nhập tên của bạn"
                        :error="errors.last_name" />
                </div>

                <div v-if="activeModal === 'email'">
                    <base-input v-model="editingForm.email" label="Email" type="email" placeholder="Nhập email mới"
                        :error="errors.email" />
                </div>

                <div v-if="activeModal === 'phone'">
                    <base-input v-model="editingForm.phone" label="Số điện thoại" placeholder="Nhập số điện thoại"
                        :error="errors.phone" />
                </div>

                <div v-if="activeModal === 'provinces_id'">
                    <base-select
                        v-model="editingForm.provinces_id"
                        label="Tỉnh/Thành phố"
                        :options="provinceOptions"
                        placeholder="Chọn tỉnh/thành phố"
                        :error="errors.provinces_id"
                    />
                </div>

                <div class="modal-footer">
                    <button class="btn-lg btn-black" @click="saveChanges" :disabled="isSaving">
                        {{ isSaving ? 'Đang lưu...' : 'Lưu' }}
                    </button>
                </div>
            </div>
        </base-modal>
    </section>
</template>

<style scoped>
.settings-content {
    padding-top: 8px;
}

.content-header {
    margin-bottom: 24px;
}

.section-title {
    font-size: 24px;
    font-weight: 600;
    color: #222;
    margin: 0;
}

.info-list {
    display: flex;
    flex-direction: column;
}

.info-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 24px 0;
    border-bottom: 1px solid #ebebeb;
}

.info-item:first-child {
    padding-top: 0;
}

.info-main {
    flex: 1;
    padding-right: 24px;
}

.info-label {
    font-size: 16px;
    font-weight: 600;
    color: #222;
    margin-bottom: 4px;
}

.info-value {
    font-size: 14px;
    color: #717171;
}

.info-desc {
    font-size: 14px;
    color: #717171;
    margin-top: 4px;
    line-height: 1.4;
}

.info-action {
    flex-shrink: 0;
}

.btn-link {
    background: none;
    border: none;
    color: #222;
    font-size: 14px;
    font-weight: 600;
    text-decoration: underline;
    cursor: pointer;
    padding: 0;
}

.btn-link:hover {
    color: #717171;
}

/* Modal Styles */
.modal-form {
    padding: 1rem 0;
}

.btn-save {
    background: #222;
    color: white;
    border: none;
    padding: 14px 24px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 16px;
    cursor: pointer;
    transition: background 0.2s;
    width: 100%;
}

.btn-save:hover {
    background: #000;
}

.btn-save:disabled {
    background: #dddddd;
    cursor: not-allowed;
}
</style>
