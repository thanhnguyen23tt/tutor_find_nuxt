<script setup>
import { ref, reactive, computed, onMounted } from 'vue';

const props = defineProps({
    userProfileData: {
        type: Object,
        default: () => ({})
    }
});

const emit = defineEmits(['update-profile']);

const { api } = useApi();
const { success, error: notifyError } = useNotification();
const configStore = useConfigStore();

// Form data
const userProfile = ref({});
const gender_options = computed(() => configStore.configuration?.gender_types || []);

// Form sections
const basicInfoForm = reactive({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
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
    provinces_id: null,
    sex: null
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
        name: p.name
    })) || [];
});

const provinceName = computed(() => {
    if (!basicInfoForm.provinces_id) return 'Chưa cung cấp';
    const province = provinceOptions.value.find(p => p.value === basicInfoForm.provinces_id);
    return province ? province.name : 'Chưa cung cấp';
});

const genderLabel = computed(() => {
    if (basicInfoForm.sex === null) return 'Chưa cung cấp';
    const option = gender_options.value.find(opt => opt.id === basicInfoForm.sex);
    return option ? option.name : 'Chưa cung cấp';
});

const modalTitle = computed(() => {
    switch (activeModal.value) {
        case 'first_name': return 'Họ';
        case 'last_name': return 'Tên';
        case 'email': return 'Địa chỉ email';
        case 'phone': return 'Số điện thoại';
        case 'provinces_id': return 'Tỉnh/Thành phố';
        case 'sex': return 'Giới tính';
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
        case 'sex': return 'Chọn giới tính của bạn.';
        default: return '';
    }
});

// Methods
const populateForm = (data) => {
    if (!data) return;
    userProfile.value = data;
    Object.assign(basicInfoForm, {
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone: data.phone || '',
        email: data.email || '',
        sex: data.sex || null,
        about_you: data.about_you || '',
        provinces_id: data.provinces_id || null
    });
};

watch(() => props.userProfileData, (newData) => {
	console.log(newData)
    populateForm(newData);
}, { immediate: true, deep: true });

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
            // Update local state immediately
            basicInfoForm[field] = editingForm[field];
            if (userProfile.value) {
                userProfile.value[field] = editingForm[field];
            }
            // Emit event to refresh parent data
            emit('update-profile');
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

            <!-- Gender -->
            <div class="info-item">
                <div class="info-main">
                    <div class="info-label">Giới tính</div>
                    <div class="info-value">{{ genderLabel }}</div>
                </div>
                <div class="info-action">
                    <button class="btn-link" @click="openModal('sex')">{{ basicInfoForm.sex !== null ? 'Chỉnh sửa' : 'Thêm' }}</button>
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

                <div v-if="activeModal === 'sex'">
                    <base-select
                        v-model="editingForm.sex"
                        label="Giới tính"
                        :options="gender_options"
                        placeholder="Chọn giới tính"
                        :error="errors.sex"
                    />
                </div>

                <div class="modal-footer">
                    <button class="btn-md btn-black" @click="saveChanges" :disabled="isSaving">
                        {{ isSaving ? 'Đang lưu...' : 'Lưu' }}
                    </button>
                </div>
            </div>
        </base-modal>


    </section>
</template>

<style scoped>
.content-header {
    margin-bottom: 24px;
}

.section-title {
    font-size: var(--font-size-medium);
    font-weight: 500;
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
    font-size: var(--font-size-base);
    font-weight: 500;
    color: #222;
    margin-bottom: 4px;
}

.info-value {
    font-size: var(--font-size-small);
    color: #717171;
}

.info-desc {
    font-size: var(--font-size-small);
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
    font-size: var(--font-size-mini);
    font-weight: 500;
    text-decoration: underline;
    cursor: pointer;
    padding: 0;
}

.btn-link:hover {
    color: #717171;
}
</style>
