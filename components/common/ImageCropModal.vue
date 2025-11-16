<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true
    },
    imageSrc: {
        type: String,
        required: true
    },
    title: {
        type: String,
        default: 'Chỉnh sửa ảnh'
    },
    outputWidth: {
        type: Number,
        default: 600
    },
    outputHeight: {
        type: Number,
        default: 600
    },
    containerWidth: {
        type: Number,
        default: 400
    },
    containerHeight: {
        type: Number,
        default: 400
    }
});

const emit = defineEmits(['close', 'confirm', 'error']);

const cropScale = ref(1);
const cropPosition = ref({ x: 0, y: 0 });
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const imageBounds = ref({ maxX: 0, maxY: 0 });

// Initialize scale when image source changes
const initializeScale = () => {
    if (!props.imageSrc) return;

    const img = new Image();
    img.onload = () => {
        const scaleX = props.containerWidth / img.width;
        const scaleY = props.containerHeight / img.height;
        cropScale.value = Math.max(scaleX, scaleY);
        cropPosition.value = { x: 0, y: 0 };

        // Calculate image bounds for dragging constraints
        updateImageBounds(img);
    };
    img.src = props.imageSrc;
};

// Update image bounds when scale changes
const updateImageBounds = (img) => {
    const scaledWidth = img.width * cropScale.value;
    const scaledHeight = img.height * cropScale.value;

    imageBounds.value = {
        maxX: Math.max(0, (scaledWidth - props.containerWidth) / 2),
        maxY: Math.max(0, (scaledHeight - props.containerHeight) / 2)
    };
};

// Watch for image source changes
const imageKey = computed(() => props.imageSrc);
const watchImageSrc = () => {
    if (props.isOpen && props.imageSrc) {
        initializeScale();
    }
};

// Crop image handlers
const handleCropMouseDown = (e) => {
    isDragging.value = true;
    dragStart.value = {
        x: e.clientX - cropPosition.value.x,
        y: e.clientY - cropPosition.value.y
    };
};

const handleCropMouseMove = (e) => {
    if (!isDragging.value) return;

    const newX = e.clientX - dragStart.value.x;
    const newY = e.clientY - dragStart.value.y;

    // Constrain position within boundaries
    cropPosition.value = {
        x: Math.max(-imageBounds.value.maxX, Math.min(imageBounds.value.maxX, newX)),
        y: Math.max(-imageBounds.value.maxY, Math.min(imageBounds.value.maxY, newY))
    };
};

const handleCropMouseUp = () => {
    isDragging.value = false;
};

const handleZoomChange = (delta) => {
    const newScale = Math.max(0.5, Math.min(3, cropScale.value + delta));
    cropScale.value = newScale;

    // Update bounds when scale changes
    if (props.imageSrc) {
        const img = new Image();
        img.onload = () => {
            updateImageBounds(img);
        };
        img.src = props.imageSrc;
    }
};

const getCroppedImage = () => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            // Validate that output dimensions are exactly 600x600
            if (props.outputWidth !== 600 || props.outputHeight !== 600) {
                reject(new Error('Ảnh đầu ra phải có kích thước chính xác 600x600 pixel'));
                return;
            }

            canvas.width = props.outputWidth;
            canvas.height = props.outputHeight;

            const containerWidth = props.containerWidth;
            const containerHeight = props.containerHeight;

            const imgWidth = img.width;
            const imgHeight = img.height;

            const scaledWidth = imgWidth * cropScale.value;
            const scaledHeight = imgHeight * cropScale.value;

            const imgCenterX = containerWidth / 2 + cropPosition.value.x;
            const imgCenterY = containerHeight / 2 + cropPosition.value.y;

            const imgLeft = imgCenterX - scaledWidth / 2;
            const imgTop = imgCenterY - scaledHeight / 2;

            const cropSourceX = (-imgLeft) / cropScale.value;
            const cropSourceY = (-imgTop) / cropScale.value;
            const cropSourceWidth = containerWidth / cropScale.value;
            const cropSourceHeight = containerHeight / cropScale.value;

            const finalSourceX = Math.max(0, Math.min(cropSourceX, imgWidth));
            const finalSourceY = Math.max(0, Math.min(cropSourceY, imgHeight));
            const finalSourceWidth = Math.min(cropSourceWidth, imgWidth - finalSourceX);
            const finalSourceHeight = Math.min(cropSourceHeight, imgHeight - finalSourceY);

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const destX = cropSourceX < 0 ? (-cropSourceX * cropScale.value / containerWidth) * canvas.width : 0;
            const destY = cropSourceY < 0 ? (-cropSourceY * cropScale.value / containerHeight) * canvas.height : 0;
            const destWidth = (finalSourceWidth / cropSourceWidth) * canvas.width;
            const destHeight = (finalSourceHeight / cropSourceHeight) * canvas.height;

            ctx.drawImage(
                img,
                finalSourceX,
                finalSourceY,
                finalSourceWidth,
                finalSourceHeight,
                destX,
                destY,
                destWidth,
                destHeight
            );

            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg', 0.9);
        };

        img.onerror = () => {
            reject(new Error('Không thể tải ảnh'));
        };

        img.src = props.imageSrc;
    });
};

const confirmCrop = async () => {
    try {
        const croppedBlob = await getCroppedImage();
        emit('confirm', croppedBlob);
    } catch (error) {
        console.error('Error cropping image:', error);
        // Emit error event with validation message
        emit('error', error.message);
        emit('close');
    }
};

const handleClose = () => {
    cropScale.value = 1;
    cropPosition.value = { x: 0, y: 0 };
    isDragging.value = false;
    imageBounds.value = { maxX: 0, maxY: 0 };
    emit('close');
};

// Initialize when modal opens
watchImageSrc();
</script>

<template>
    <base-modal :is-open="isOpen" :title="title" @close="handleClose">
        <div class="crop-modal-wrapper">

            <!-- Crop Section -->
            <div class="crop-section">
                <div class="crop-container-wrapper">
                    <div
                        class="crop-container"
                        :style="{
                            width: `${containerWidth}px`,
                            height: `${containerHeight}px`
                        }"
                        @mousedown="handleCropMouseDown"
                        @mousemove="handleCropMouseMove"
                        @mouseup="handleCropMouseUp"
                        @mouseleave="handleCropMouseUp"
                    >
                        <div class="crop-overlay">
                            <img
                                v-if="imageSrc"
                                :src="imageSrc"
                                :key="imageKey"
                                :style="{
                                    transform: `translate(calc(-50% + ${cropPosition.x}px), calc(-50% + ${cropPosition.y}px)) scale(${cropScale})`,
                                    cursor: isDragging ? 'grabbing' : 'grab',
                                    left: '50%',
                                    top: '50%'
                                }"
                                draggable="false"
                                @load="initializeScale"
                            />
                        </div>
                        <div class="crop-guide">
                            <div class="guide-corner top-left"></div>
                            <div class="guide-corner top-right"></div>
                            <div class="guide-corner bottom-left"></div>
                            <div class="guide-corner bottom-right"></div>
                        </div>
                    </div>
                </div>

                <div class="crop-controls">
                    <div class="control-group">
                        <button class="control-btn zoom-out" @click="handleZoomChange(-0.1)" type="button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                        <div class="zoom-display">{{ Math.round(cropScale * 100) }}%</div>
                        <button class="control-btn zoom-in" @click="handleZoomChange(0.1)" type="button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                    </div>
                    <input
                        type="range"
                        v-model.number="cropScale"
                        min="0.5"
                        max="3"
                        step="0.01"
                        class="zoom-slider"
                    />
                </div>
            </div>
        </div>

		<!-- Tips Section -->
		<div class="tips-section">
            <div class="tips">
                <span class="tips_header">Mẹo</span>
                <span>Ảnh của bạn sẽ được sử dụng cho tất cả các bài đăng của bạn. Một bức ảnh chất lượng chuyên nghiệp sẽ giúp bạn xây dựng niềm tin với học sinh tương lai và tối đa hóa số lượng yêu cầu học.</span>
            </div>
            <div class="note-group">
                <div class="note-wrapper">
                    <div class="note-wrapper_header">
                        <i class="feather feather-check">
                            <svg class="icon-mini" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </i>
                        <span>Nên làm</span>
                    </div>
                    <span>Hãy chụp một mình và mỉm cười! Mặt và ánh mắt hướng về phía ống kính. Tối thiểu {{ outputWidth }}x{{ outputHeight }}px, định dạng .PNG hoặc .JPEG</span>
                </div>

                <div class="note-wrapper">
                    <div class="note-wrapper_header">
                        <i class="feather feather-x">
                            <svg class="icon-mini" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </i>
                        <span>Không nên làm</span>
                    </div>
                    <span>Tránh kính râm, logo, ảnh mờ, có pixel hoặc quá tối. Không sử dụng ảnh nhóm hoặc ảnh không rõ mặt.</span>
                </div>
            </div>
        </div>

        <div class="modal-footer">
            <button class="btn-md btn-secondary" @click="handleClose" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                <span>Hủy</span>
            </button>
            <button class="btn-md btn-primary" @click="confirmCrop" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
                <span>Xác nhận</span>
            </button>
        </div>
    </base-modal>
</template>

<style scoped>
/* Main Wrapper */
.crop-modal-wrapper {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 0;
}

/* Tips Section */
.tips-section {
    padding: 0;
}

.note-group {
    display: flex;
    align-items: start;
    gap: 2rem;
    margin-top: 1.5rem;
}

.note-wrapper,
.tips {
    display: grid;
    gap: 0.2rem;
    margin-top: 1.5rem;
    font-size: var(--font-size-small, 0.875rem);
    border-radius: 8px;
    line-height: 1.5;
    flex: 1;
}

.note-wrapper_header,
.tips_header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    font-size: var(--font-size-base, 1rem);
}

.feather {
    width: 1rem;
    height: 1rem;
    border-radius: 100%;
    color: #f7f7f7;
    display: flex;
    align-items: center;
    justify-content: center;
}

.feather-check {
    width: 1rem;
    height: 1rem;
    border-radius: 100%;
    background-color: #5bca8d;
    color: #f7f7f7;
    display: flex;
    align-items: center;
    justify-content: center;
}

.feather-x {
    background: #ff3636;
}

.icon-mini {
    width: 12px;
    height: 12px;
}

/* Crop Section */
.crop-section {
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border-radius: 20px;
    border: 2px solid #e2e8f0;
    padding: 2rem;
    box-shadow: 
        0 10px 25px -5px rgba(0, 0, 0, 0.1),
        0 4px 6px -2px rgba(0, 0, 0, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.crop-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.75rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #f1f5f9;
}

.crop-title {
    font-size: 1.375rem;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
    letter-spacing: -0.02em;
}

.dimension-badge {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.625rem 1rem;
    background: linear-gradient(135deg, var(--color-primary) 0%, #2563eb 50%, #1d4ed8 100%);
    color: white;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 600;
    box-shadow: 
        0 4px 12px rgba(59, 130, 246, 0.3),
        0 0 0 2px rgba(59, 130, 246, 0.1);
    transition: all 0.3s ease;
}

.dimension-badge:hover {
    transform: translateY(-2px);
    box-shadow: 
        0 6px 16px rgba(59, 130, 246, 0.4),
        0 0 0 3px rgba(59, 130, 246, 0.15);
}

.dimension-badge svg {
    width: 18px;
    height: 18px;
}

.crop-container-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;
}

.crop-container {
    position: relative;
    overflow: hidden;
    border-radius: 20px;
    background: repeating-conic-gradient(from 0deg, #ffffff 0%, #f8fafc 25%, #ffffff 50%);
    background-size: 20px 20px;
    border: 4px solid #e2e8f0;
    box-shadow: 
        0 20px 40px -10px rgba(0, 0, 0, 0.15),
        0 8px 16px -4px rgba(0, 0, 0, 0.1),
        inset 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.crop-container:hover {
    border-color: var(--color-primary);
    box-shadow: 
        0 25px 50px -10px rgba(59, 130, 246, 0.25),
        0 10px 20px -5px rgba(59, 130, 246, 0.15),
        inset 0 2px 4px rgba(59, 130, 246, 0.1),
        0 0 0 4px rgba(59, 130, 246, 0.1);
    transform: scale(1.01);
}

.crop-overlay {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
}

.crop-overlay img {
    position: absolute;
    transform-origin: center center;
    max-width: none;
    user-select: none;
    -webkit-user-drag: none;
    width: auto;
    height: auto;
    border-radius: 16px;
    filter: brightness(1.02) contrast(1.02);
    transition: filter 0.3s ease;
}

.crop-container:hover .crop-overlay img {
    filter: brightness(1.05) contrast(1.05);
}

.crop-guide {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    background: 
        linear-gradient(to right, rgba(0, 0, 0, 0.4) 0%, transparent 15%, transparent 85%, rgba(0, 0, 0, 0.4) 100%),
        linear-gradient(to bottom, rgba(0, 0, 0, 0.4) 0%, transparent 15%, transparent 85%, rgba(0, 0, 0, 0.4) 100%);
    border-radius: 20px;
}

.guide-corner {
    position: absolute;
    width: 20px;
    height: 20px;
    border: 2px solid var(--color-primary);
    box-shadow: 
        0 0 0 2px rgba(255, 255, 255, 0.8),
        0 4px 12px rgba(59, 130, 246, 0.4);
    animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}

.guide-corner.top-left {
    top: 8px;
    left: 8px;
    border-right: none;
    border-bottom: none;
    border-radius: 12px 0 0 0;
}

.guide-corner.top-right {
    top: 8px;
    right: 8px;
    border-left: none;
    border-bottom: none;
    border-radius: 0 12px 0 0;
}

.guide-corner.bottom-left {
    bottom: 8px;
    left: 8px;
    border-right: none;
    border-top: none;
    border-radius: 0 0 0 12px;
}

.guide-corner.bottom-right {
    bottom: 8px;
    right: 8px;
    border-left: none;
    border-top: none;
    border-radius: 0 0 12px 0;
}

/* Controls */
.crop-controls {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    align-items: center;
}

.control-group {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    padding: 1rem 1.5rem;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-radius: 16px;
    border: 2px solid #e2e8f0;
    box-shadow: 
        0 4px 12px rgba(0, 0, 0, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.control-btn {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    border: 2px solid #cbd5e1;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    color: #64748b;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.control-btn:hover {
    background: linear-gradient(135deg, var(--color-primary) 0%, #2563eb 100%);
    border-color: var(--color-primary);
    color: white;
    transform: translateY(-2px) scale(1.05);
    box-shadow: 
        0 8px 16px rgba(59, 130, 246, 0.3),
        0 0 0 4px rgba(59, 130, 246, 0.1);
}

.control-btn:active {
    transform: translateY(0) scale(1);
}

.zoom-display {
    font-size: 0.9375rem;
    font-weight: 700;
    color: #1e293b;
    min-width: 60px;
    text-align: center;
    padding: 0.5rem 0.75rem;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border-radius: 10px;
    border: 2px solid #e2e8f0;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
    letter-spacing: -0.02em;
}

.zoom-slider {
    width: 100%;
    max-width: 350px;
    height: 10px;
    border-radius: 5px;
    background: linear-gradient(to right, #e2e8f0 0%, #cbd5e1 50%, var(--color-primary) 100%);
    outline: none;
    -webkit-appearance: none;
    appearance: none;
    cursor: pointer;
    box-shadow: 
        inset 0 2px 4px rgba(0, 0, 0, 0.1),
        0 1px 2px rgba(0, 0, 0, 0.05);
}

.zoom-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border: 4px solid var(--color-primary);
    cursor: pointer;
    box-shadow: 
        0 4px 12px rgba(59, 130, 246, 0.4),
        0 0 0 2px rgba(255, 255, 255, 0.8);
    transition: all 0.3s ease;
}

.zoom-slider::-webkit-slider-thumb:hover {
    transform: scale(1.15);
    box-shadow: 
        0 6px 20px rgba(59, 130, 246, 0.5),
        0 0 0 4px rgba(59, 130, 246, 0.15);
    border-color: #2563eb;
}

.zoom-slider::-moz-range-thumb {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border: 4px solid var(--color-primary);
    cursor: pointer;
    box-shadow: 
        0 4px 12px rgba(59, 130, 246, 0.4),
        0 0 0 2px rgba(255, 255, 255, 0.8);
    transition: all 0.3s ease;
}

.zoom-slider::-moz-range-thumb:hover {
    transform: scale(1.15);
    box-shadow: 
        0 6px 20px rgba(59, 130, 246, 0.5),
        0 0 0 4px rgba(59, 130, 246, 0.15);
    border-color: #2563eb;
}

/* Footer */
/* Responsive */
@media (max-width: 768px) {
    .note-group {
        flex-direction: column;
        gap: 1rem;
    }

    .note-wrapper,
    .tips {
        margin-top: 1rem;
    }

    .crop-section {
        padding: 1.5rem;
    }

    .crop-header {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
    }

    .crop-container-wrapper {
        padding: 0.75rem;
    }

    .crop-controls {
        gap: 1rem;
    }

    .control-group {
        padding: 0.875rem 1.25rem;
        gap: 1rem;
    }
}
</style>

