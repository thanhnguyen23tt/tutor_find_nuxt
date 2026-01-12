<script setup>
import { uploadMethods } from '~/config/index.js';

definePageMeta({
    layout: 'empty',
	middleware: [
		'auth',
		() => {
		useLayoutStore().setHiddenFooter(true)
		}
	]
});

const { api } = useApi();
const { success, error: notifyError } = useNotification();

const props = defineProps({
    existingDocuments: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['close', 'success']);

const existingDocuments = computed(() => props.existingDocuments);
const isLoadingDocuments = ref(false);

const hasExistingDocuments = computed(() => {
    return existingDocuments.value && existingDocuments.value.length > 0;
});

const step = ref(1);
const selectedDocType = ref(null);
const selectedUploadMethod = ref(null);
const frontImage = ref(null);
const backImage = ref(null);
const isUploading = ref(false);

// Webcam state
const isWebcamActive = ref(false);
const currentCaptureSide = ref(null); // 'front' or 'back'

// Step 1: Document Types
const configStore = useConfigStore();
const documentTypes = computed(() => {
    return configStore.configuration?.identity_document_types?.map(doc => ({
        id: doc.id,
        label: doc.name,
        icon: doc.code,
        required_images: doc.required_images
    })) || [];
});

const selectedDoc = computed(() => documentTypes.value.find(d => d.id === selectedDocType.value));

// Step 2: Upload Methods
// Imported from config

const pageTitle = computed(() => {
    switch (step.value) {
        case 1: return 'Hãy thêm giấy tờ tùy thân do chính phủ cấp';
        case 2: return 'Chọn loại giấy tờ tùy thân';
        case 3: return 'Chọn phương thức tải lên';
        case 4: return 'Tải lên ảnh giấy tờ tùy thân';
        default: return 'Xác minh danh tính';
    }
});

const canProceed = computed(() => {
    if (step.value === 1) return true;
    if (step.value === 2) return !!selectedDocType.value;
    if (step.value === 3) return !!selectedUploadMethod.value;
    if (step.value === 4) {
        if (!selectedDoc.value) return false;
        const hasFront = !!frontImage.value;
        const hasBack = !!backImage.value;
        return selectedDoc.value.required_images > 1 ? (hasFront && hasBack) : hasFront;
    }
    return false;
});

// ... webcam functions ...

const handleNext = () => {
    if (step.value < 4) {
        step.value++;
    } else {
        handleSubmit();
    }
};

const handleBack = () => {
    if (step.value > 1) {
        step.value--;
    } else {
        emit('close');
    }
};

const handleFileUpload = (event, side) => {
    const file = event.target.files[0];
    if (!file) return;

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
        if (side === 'front') {
            frontImage.value = { file, preview: e.target.result };
        } else {
            backImage.value = { file, preview: e.target.result };
        }
    };
    reader.readAsDataURL(file);
};

const handleSubmit = async () => {
    isUploading.value = true;
    try {
        const uploadPromises = [];

        // Upload Front Image
        if (frontImage.value) {
            const formData = new FormData();
            formData.append('identity_document_type_id', selectedDocType.value);
            formData.append('image', frontImage.value.file);
            formData.append('side', 'front');
            uploadPromises.push(api.apiPostFormData('me/identity-document', formData));
        }

        // Upload Back Image (if exists)
        if (backImage.value) {
            const formData = new FormData();
            formData.append('identity_document_type_id', selectedDocType.value);
            formData.append('image', backImage.value.file);
            formData.append('side', 'back');
            uploadPromises.push(api.apiPostFormData('me/identity-document', formData));
        }

        const responses = await Promise.all(uploadPromises);
        const newDocuments = responses.map(res => res.data);

        success('Đã gửi thông tin xác minh danh tính thành công!');
        emit('success', newDocuments);
    } catch (error) {
        console.error('Upload failed', error);
        notifyError(error?.message || 'Có lỗi xảy ra khi tải lên tài liệu');
    } finally {
        isUploading.value = false;
    }
};
</script>

<template>
    <div class="identity-verification-page">
        <!-- Display Existing Documents -->
        <div v-if="hasExistingDocuments">
            <h1 class="page-title">Thông tin xác minh danh tính</h1>
            
            <base-loading v-if="isLoadingDocuments" />
            
            <div v-else class="documents-list">
                <div v-for="doc in existingDocuments" :key="doc.id" class="document-card">
                    <div class="document-header">
                        <div class="document-type">
                            <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="4" width="18" height="16" rx="2"></rect>
                                <circle cx="9" cy="10" r="2"></circle>
                                <line x1="15" y1="8" x2="17" y2="8"></line>
                                <line x1="15" y1="12" x2="17" y2="12"></line>
                                <line x1="7" y1="16" x2="17" y2="16"></line>
                            </svg>
                            <div>
                                <h3 class="doc-title">{{ doc.identity_document_type?.name }}</h3>
                                <p class="doc-side">{{ doc.side_label }}</p>
                            </div>
                        </div>
                        <div class="document-status" :class="'status-' + (doc.status || 'pending')">
                            {{ doc.status_label }}
                        </div>
                    </div>
                    <div class="document-image" v-if="doc.image_url">
                        <img :src="doc.image_url" :alt="doc.side_label">
                    </div>
                    <div class="document-info">
                        <div v-if="doc.created_at" class="info-item">
                            <span class="label">Ngày tải lên:</span>
                            <span class="value">{{ new Date(doc.created_at).toLocaleDateString('vi-VN') }}</span>
                        </div>
                        <div v-if="doc.note" class="info-item note">
                            <span class="label">Ghi chú:</span>
                            <span class="value">{{ doc.note }}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="action-footer">
                <button class="btn-md btn-secondary" @click="emit('close')">
                    <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M15 18l-6-6 6-6"></path>
                    </svg>
                    Quay lại
                </button>
            </div>
        </div>

        <!-- Upload Flow (if no existing documents) -->
        <div v-else>
        <h1 class="page-title">{{ pageTitle }}</h1>
        
        <div class="verification-content">
            
            <!-- Step 1: Intro -->
            <div v-if="step === 1" class="step-content intro-step">
                <div class="intro-layout">
                    <div class="intro-main">
                        <div class="step-desc">
                            Chúng tôi cần bạn bổ sung giấy tờ tùy thân chính thức do chính phủ cấp. Bước này giúp xác minh danh tính của bạn.
                        </div>
                        <div class="step-desc">
                            Bạn có thể thêm bằng lái xe, hộ chiếu hoặc chứng minh nhân dân/thẻ căn cước công dân tùy thuộc vào quốc gia quê quán của mình.
                        </div>
                        <button class="btn-md btn-black btn-add-id" @click="handleNext">Thêm giấy tờ tùy thân</button>
                    </div>
                    <div class="intro-sidebar">
                        <div class="privacy-box">
                            <div class="privacy-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" style="display: block; height: 32px; width: 32px; fill: var(--color-primary);"><path d="M16 3a13 13 0 0 0-6.63 24.18l.13.07 1.2-1.6.1-.13A11 11 0 0 1 16 5a11 11 0 0 1 10.87 9.53l.06.24.07.23H29a13 13 0 0 0-13-12zm10.93 14H25a9 9 0 1 0-18 0H5a11 11 0 0 1 21.93 0zM16 10a7 7 0 1 1 0 14 7 7 0 0 1 0-14zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"></path></svg>
                            </div>
                            <h3 class="privacy-title">Quyền riêng tư của bạn</h3>
                            <p class="privacy-text">
                                Chúng tôi muốn đảm bảo sự riêng tư, an toàn và bảo mật cho dữ liệu bạn chia sẻ trong quá trình này. Tìm hiểu thêm trong <a href="#" class="privacy-link">Chính sách quyền riêng tư</a> của chúng tôi.
                            </p>
                            <a href="#" class="privacy-link">Quy trình xác minh danh tính</a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Step 2: Select Document Type -->
            <div v-if="step === 2" class="step-content">
                <div class="step-desc">Chọn một loại giấy tờ tùy thân để thêm vào</div>
                
                <div class="selection-list">
                    <div 
                        v-for="doc in documentTypes" 
                        :key="doc.id"
                        class="selection-item"
                        :class="{ selected: selectedDocType === doc.id }"
                        @click="selectedDocType = doc.id"
                    >
                        <div class="item-icon">
							<svg v-if="doc.icon === 'driver_license'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" style="display: block; height: 24px; width: 24px; fill: currentcolor;"><path d="M26 19a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 18a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm20.7-5 .41 1.12A4.97 4.97 0 0 1 30 18v9a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-2H8v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9c0-1.57.75-2.96 1.89-3.88L4.3 13H2v-2h3v.15L6.82 6.3A2 2 0 0 1 8.69 5h14.62c.83 0 1.58.52 1.87 1.3L27 11.15V11h3v2h-2.3zM6 25H4v2h2v-2zm22 0h-2v2h2v-2zm0-2v-5a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v5h24zm-3-10h.56L23.3 7H8.69l-2.25 6H25zm-15 7h12v-2H10v2z"></path></svg>
                            <svg v-if="doc.icon === 'passport'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                            <svg v-if="doc.icon === 'identity_card'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"></rect><circle cx="9" cy="10" r="2"></circle><line x1="15" y1="8" x2="17" y2="8"></line><line x1="15" y1="12" x2="17" y2="12"></line><line x1="7" y1="16" x2="17" y2="16"></line></svg>
                        </div>
                        <div class="item-label">{{ doc.label }}</div>
                    </div>
                </div>
            </div>

            <!-- Step 3: Select Upload Method -->
            <div v-if="step === 3" class="step-content">
                <div class="step-desc">Bạn muốn thêm giấy tờ tùy thân do chính phủ cấp của mình theo cách nào?</div>
                
                <div class="selection-list">
                    <div 
                        v-for="method in uploadMethods" 
                        :key="method.id"
                        class="selection-item"
                        :class="{ selected: selectedUploadMethod === method.id }"
                        @click="selectedUploadMethod = method.id"
                    >
                        <div class="item-content">
                            <div class="item-label">{{ method.name }}</div>
                            <div v-if="method.desc" class="item-sub">{{ method.desc }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Step 4: Upload Images -->
            <div v-if="step === 4" class="step-content">
                <div class="step-desc">
                    Đảm bảo ảnh của bạn không bị nhòe, mờ và mặt trước giấy tờ tùy thân thể hiện rõ khuôn mặt bạn.
                </div>

                <div class="upload-grid">
                    <!-- Front Image -->
                    <div class="upload-box" @click="selectedUploadMethod === 'webcam' ? startWebcam('front') : $refs.frontInput.click()">
                        <input 
                            type="file" 
                            ref="frontInput" 
                            class="hidden-input" 
                            accept="image/*"
                            @change="(e) => handleFileUpload(e, 'front')"
                            :disabled="selectedUploadMethod === 'webcam'"
                        >
                        <div v-if="frontImage" class="image-preview">
                            <img :src="frontImage.preview" alt="Mặt trước">
                            <button class="remove-btn" @click.stop="frontImage = null">×</button>
                        </div>
                        <div v-else class="upload-placeholder">
                            <svg v-if="selectedUploadMethod === 'webcam'" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"></rect><circle cx="9" cy="10" r="2"></circle><line x1="15" y1="8" x2="17" y2="8"></line><line x1="15" y1="12" x2="17" y2="12"></line><line x1="7" y1="16" x2="17" y2="16"></line></svg>
                            
                            <span>{{ selectedUploadMethod === 'webcam' ? 'Chụp ảnh mặt trước' : 'Tải lên ảnh mặt trước' }}</span>
                            <span class="sub-text" v-if="selectedUploadMethod !== 'webcam'">Chỉ định dạng JPEG hoặc PNG</span>
                        </div>
                    </div>

                    <!-- Back Image -->
                    <div v-if="selectedDoc?.required_images > 1" class="upload-box" @click="selectedUploadMethod === 'webcam' ? startWebcam('back') : $refs.backInput.click()">
                        <input 
                            type="file" 
                            ref="backInput" 
                            class="hidden-input" 
                            accept="image/*"
                            @change="(e) => handleFileUpload(e, 'back')"
                            :disabled="selectedUploadMethod === 'webcam'"
                        >
                        <div v-if="backImage" class="image-preview">
                            <img :src="backImage.preview" alt="Mặt sau">
                            <button class="remove-btn" @click.stop="backImage = null">×</button>
                        </div>
                        <div v-else class="upload-placeholder">
                            <svg v-if="selectedUploadMethod === 'webcam'" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"></rect><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            
                            <span>{{ selectedUploadMethod === 'webcam' ? 'Chụp ảnh mặt sau' : 'Tải lên ảnh mặt sau' }}</span>
                            <span class="sub-text" v-if="selectedUploadMethod !== 'webcam'">Chỉ định dạng JPEG hoặc PNG</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer Actions -->
            <div class="page-footer" v-if="step > 1">
                <button class="btn-link" @click="handleBack">Quay lại</button>
                <button 
                    class="btn-md btn-black" 
                    @click="handleNext" 
                    :disabled="!canProceed || isUploading"
                >
                    {{ isUploading ? 'Đang xử lý...' : 'Tiếp tục' }}
                </button>
            </div>
        </div>

        <!-- Webcam Modal -->
        <base-modal 
            :is-open="isWebcamActive" 
            :header="false" 
            :padding-body="false" 
            :no-close="true"
            size="large"
            @close="stopWebcam"
            class="webcam-base-modal"
        >
            <div class="webcam-modal-content">
                <div class="webcam-header">
                    <button class="close-btn" @click="stopWebcam">×</button>
                    <div class="webcam-title">
                        {{ currentCaptureSide === 'front' ? 'Mặt trước của giấy tờ tùy thân' : 'Mặt sau của giấy tờ tùy thân' }}
                    </div>
                    <div class="webcam-tip">Mẹo</div>
                </div>
                
                <div class="webcam-container">
                    <video ref="videoRef" autoplay playsinline class="webcam-video"></video>
                    <canvas ref="canvasRef" class="hidden-canvas"></canvas>
                    <div ref="frameRef" class="webcam-frame"></div>
                </div>

                <div class="webcam-controls">
                    <div class="webcam-instruction">
                        <div class="instruction-title">
                            {{ currentCaptureSide === 'front' ? 'Mặt trước của giấy tờ tùy thân' : 'Mặt sau của giấy tờ tùy thân' }}
                        </div>
                        <div class="instruction-desc">
                            Đặt giấy tờ tùy thân của bạn vào chính giữa khung hình và chúng tôi sẽ tự động chụp ảnh.
                        </div>
                    </div>
                    <button class="capture-btn" @click="captureImage"></button>
                </div>
            </div>
        </base-modal>
        </div><!-- End v-else (upload flow) -->
    </div>
</template>

<style scoped>
.identity-verification-page {
    width: 100%;
    margin: 0 auto;
}

/* Intro Step */
.intro-layout {
    display: flex;
    gap: 48px;
}

.intro-main {
    flex: 1;
}

.intro-sidebar {
    width: 350px;
    flex-shrink: 0;
}

.btn-add-id {
    margin-top: 32px;
    width: auto;
    padding-left: 32px;
    padding-right: 32px;
}

.privacy-box {
    border: 1px solid #dddddd;
    border-radius: 12px;
    padding: 24px;
}

.privacy-icon {
    margin-bottom: 16px;
    color: #e12d60;
}

.privacy-title {
    font-size: var(--font-size-base);
    font-weight: 600;
    margin-bottom: 8px;
    color: #222;
}

.privacy-text {
    font-size: var(--font-size-small);
    color: #717171;
    margin-bottom: 16px;
    line-height: 1.4;
}

.privacy-link {
    color: #222;
    font-weight: 600;
    text-decoration: underline;
	font-size: var(--font-size-small);
}

@media (max-width: 768px) {
    .intro-layout {
        flex-direction: column-reverse;
    }
    
    .intro-sidebar {
        width: 100%;
    }
    
    .btn-add-id {
        width: 100%;
    }
}

.page-title {
    font-size: var(--font-size-heading-4);
    font-weight: 600;
    margin-bottom: 32px;
    color: #222;
}

.verification-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.step-desc {
    font-size: var(--font-size-medium);
    color: #222;
    margin-bottom: 24px;
    line-height: 1.5;
}

.selection-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.selection-item {
    display: flex;
    align-items: center;
    padding: 24px;
    border: 1px solid #dddddd;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
}

.selection-item:hover {
    border-color: #222;
    background-color: #f7f7f7;
}

.selection-item.selected {
    border-color: #222;
    background-color: #f7f7f7;
    border-width: 1px;
}

.item-icon {
    margin-right: 16px;
    color: #222;
}

.item-label {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: #222;
}

.item-sub {
    font-size: var(--font-size-base);
    color: #717171;
    margin-top: 4px;
}

/* Upload Grid */
.upload-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.upload-box {
    border: 1px dashed #b0b0b0;
    border-radius: 12px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    cursor: pointer;
    min-height: 200px;
    position: relative;
    transition: all 0.2s;
}

.upload-box:hover {
    border-color: #222;
    background-color: #f7f7f7;
}

.upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: #222;
    font-weight: 600;
}

.upload-placeholder .sub-text {
    font-size: var(--font-size-small);
    color: #717171;
    font-weight: 400;
}

.hidden-input {
    display: none;
}

.image-preview {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

.image-preview img {
    max-width: 100%;
    max-height: 180px;
    border-radius: 8px;
    object-fit: contain;
}

.remove-btn {
    position: absolute;
    top: -10px;
    right: -10px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #fff;
    border: 1px solid #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: var(--font-size-base);
    line-height: 1;
}

.page-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #ebebeb;
}

.btn-link {
    background: none;
    border: none;
    color: #222;
    font-size: var(--font-size-base);
    font-weight: 600;
    text-decoration: underline;
    cursor: pointer;
}

@media (max-width: 640px) {
    .upload-grid {
        grid-template-columns: 1fr;
    }
}

/* Webcam Modal Styles */
.webcam-modal-content {
    position: relative;
    height: 750px;
    background-color: #000;
    display: flex;
    flex-direction: column;
    color: white;
    width: 100%;
}

.webcam-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background-color: rgba(0, 0, 0, 0.5);
    top: 0;
    left: 0;
    width: 100%;
    z-index: 10;
}

.close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 32px;
    cursor: pointer;
    line-height: 1;
    padding: 0;
}

.webcam-title {
    font-size: var(--font-size-base);
    font-weight: 600;
}

.webcam-tip {
    font-size: var(--font-size-small);
    font-weight: 600;
    cursor: pointer;
}

.webcam-container {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.webcam-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.hidden-canvas {
    display: none;
}

.webcam-frame {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 85%;
    max-width: 750px;
    aspect-ratio: 1.586; /* ID card ratio */
    border: 2px solid white;
    border-radius: 16px;
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
    pointer-events: none;
}

.webcam-controls {
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    background-color: rgba(0, 0, 0, 0.8);
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: 10;
}

.webcam-instruction {
    text-align: center;
    max-width: 600px;
}

.instruction-title {
    font-size: var(--font-size-base);
    font-weight: 600;
    margin-bottom: 8px;
}

.instruction-desc {
    font-size: var(--font-size-small);
    color: #ccc;
}

.capture-btn {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background-color: white;
    border: 4px solid rgba(255, 255, 255, 0.3);
    background-clip: padding-box;
    cursor: pointer;
    transition: transform 0.1s;
}

.capture-btn:active {
    transform: scale(0.95);
    background-color: #eee;
}

@media (max-width: 640px) {
    .webcam-modal-content {
        height: 550px;
    }
}

/* Existing Documents Display */
.documents-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.document-card {
    background: white;
    border-radius: 16px;
    padding: 1.5rem;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.document-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.document-type {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.document-type svg {
    color: var(--color-primary);
}

.doc-title {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 0.25rem 0;
}

.doc-side {
    font-size: var(--font-size-mini);
    color: #6b7280;
    margin: 0;
}

.document-status {
    padding: 0.25rem 0.6rem;
    border-radius: 20px;
    font-size: var(--font-size-mini);
    font-weight: 500;
}

.status-pending {
    background: #fef3c7;
    color: #92400e;
}

.status-approved {
    background: #d1fae5;
    color: #065f46;
}

.status-rejected {
    background: #fee2e2;
    color: #991b1b;
}

.document-image {
    margin: 1rem 0;
    border-radius: 12px;
    overflow: hidden;
}

.document-image img {
    width: 100%;
    height: auto;
    display: block;
}

.document-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.info-item {
    display: flex;
    gap: 0.5rem;
    font-size: var(--font-size-mini);
}

.info-item .label {
    color: #6b7280;
    font-weight: 500;
}

.info-item .value {
    color: #1f2937;
}

.info-item.note {
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.75rem;
    background: #f8fafc;
    border-radius: 8px;
}

.action-footer {
    display: flex;
    justify-content: flex-start;
    padding-top: 1rem;
    border-top: 1px solid #e2e8f0;
}

</style>
