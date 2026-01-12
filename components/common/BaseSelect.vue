<template>
    <div class="base-select" :class="{ 'is-open': isOpen, 'width-full': widthFull }" ref="selectContainer">
        <div
            class="select-button"
            :class="[customClass, sizeClass, { 'error': showError, 'has-floating-label': !!label, 'with-icon': $slots.icon }]"
            @click="toggleDropdown"
            ref="buttonRef"
        >
            <div class="select-content">
                <div v-if="$slots.icon" class="icon-wrapper">
                    <slot name="icon"></slot>
                </div>
                <span v-if="displayValue" class="selected-value">{{ displayValue }}</span>
                <span v-else class="placeholder-text">{{ placeholder }}</span>
            </div>
            
            <label v-if="label" class="floating-label" :class="{ 'float': isOpen || displayValue || displayValue === 0 || (placeholder && placeholder.trim() !== '') }">
                {{ label }} <span v-if="required" class="required">*</span>
            </label>
            <svg class="icon-md dropdown-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
        </div>
        <div v-if="showError" class="error-message">
            {{ errorMessageComputed }}
        </div>

        <!-- Teleport dropdown to body -->
        <Teleport to="body">
            <div
                v-if="isOpen"
                class="select-dropdown"
                :style="dropdownStyle"
            >
                <div v-if="type === 'search'" class="search-input">
                    <div class="icon-search-wrapper">
                        <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input type="text" v-model="searchQuery" :placeholder="searchPlaceholder" ref="searchInput">
                </div>
                <div class="select-list format-scrollbar">
                    <div v-for="option in filteredOptions"
                         :key="option.id"
                         class="select-option"
                         :class="{ disabled: option.disabled }"
                         @click="!option.disabled && selectOption(option)">
                        <div class="checkbox">
                            <svg v-if="isSelected(option)" class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <span>{{ option.name }}</span>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';

const props = defineProps({
    modelValue: {
        type: [String, Number, Object],
        default: ''
    },
    options: {
        type: Array,
        required: true
    },
    placeholder: {
        type: String,
        default: 'Chọn'
    },
    searchPlaceholder: {
        type: String,
        default: 'Tìm kiếm...'
    },
    type: {
        type: String,
        default: 'no-search',
        validator: (value) => ['search', 'no-search'].includes(value)
    },
    customClass: {
        type: String,
        default: ''
    },
    label: {
        type: String,
        default: ''
    },
    required: {
        type: Boolean,
        default: false
    },
    size: {
        type: String,
        default: 'large',
        validator: (v) => ['small', 'base', 'medium', 'large'].includes(v)
    },
    widthFull: {
        type: Boolean,
        default: true
    },
    error: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const searchQuery = ref('');
const selectContainer = ref(null);
const buttonRef = ref(null);
const searchInput = ref(null);
const dropdownStyle = ref({});
const isTouched = ref(false);

const sizeClass = computed(() => {
    return {
        'select-small': props.size === 'small',
        'select-base': props.size === 'base',
        'select-medium': props.size === 'medium',
        'select-large': props.size === 'large',
    };
});

const displayValue = computed(() => {
    const option = props.options.find(opt => opt.id == props.modelValue || opt.value == props.modelValue);
    return option ? (option.name || option.label) : '';
});

const filteredOptions = computed(() => {
    if (!searchQuery.value || props.type === 'no-search') return props.options;
    return props.options.filter(option => {
        const searchText = (option.name || option.label || '').toLowerCase();
        return searchText.includes(searchQuery.value.toLowerCase());
    });
});

const showError = computed(() => {
    // Nếu có error từ props thì ưu tiên hiển thị error đó
    if (props.error) return true;
    // Nếu có required và đã touched thì validate
    if (props.required && isTouched.value) {
        return props.modelValue === null || props.modelValue === '' || props.modelValue === undefined;
    }
    return false;
});

const errorMessageComputed = computed(() => {
    // Ưu tiên error message từ props
    if (props.error) return props.error;
    // Nếu required và rỗng thì hiển thị message mặc định
    if (props.required && isTouched.value && (props.modelValue === null || props.modelValue === '')) {
        return 'Trường này là bắt buộc';
    }
    return '';
});

const updateDropdownPosition = async () => {
    if (!buttonRef.value) return;

    const rect = buttonRef.value.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const dropdownHeight = 300; // Max height of dropdown

    // Determine if dropdown should open upward or downward
    const openUpward = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

    if (props.widthFull) {
        dropdownStyle.value = {
            position: 'fixed',
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            zIndex: '99999',
            ...(openUpward ? {
                bottom: `${window.innerHeight - rect.top + 8}px`,
                transformOrigin: 'bottom'
            } : {
                top: `${rect.bottom + 8}px`,
                transformOrigin: 'top'
            })
        };
        return;
    }

    // Always render dropdown with max-content width first
    dropdownStyle.value = {
        position: 'fixed',
        left: `${rect.left}px`,
        width: 'max-content',
        maxWidth: '400px',
        zIndex: '99999',
        visibility: 'hidden', // Hide temporarily while calculating
        ...(openUpward ? {
            bottom: `${window.innerHeight - rect.top + 8}px`,
            transformOrigin: 'bottom'
        } : {
            top: `${rect.bottom + 8}px`,
            transformOrigin: 'top'
        })
    };

    // Wait for dropdown to render
    await nextTick();

    // Get actual dropdown width
    const dropdown = document.querySelector('.select-dropdown');
    if (dropdown && selectContainer.value) {
        const dropdownWidth = dropdown.offsetWidth;

        // Update container and button width to match dropdown
        selectContainer.value.style.width = `${dropdownWidth}px`;

        // Update dropdown position with correct left alignment
        const newRect = buttonRef.value.getBoundingClientRect();
        dropdownStyle.value = {
            ...dropdownStyle.value,
            left: `${newRect.left}px`,
            width: `${dropdownWidth}px`,
            visibility: 'visible' // Show it now
        };
    }
};

const toggleDropdown = () => {
    isTouched.value = true;
    isOpen.value = !isOpen.value;
    if (isOpen.value) {
        nextTick(() => {
            updateDropdownPosition();
        });
    }
};

const selectOption = (option) => {
    isTouched.value = true;
    emit('update:modelValue', option.id !== undefined ? option.id : option.value);
    isOpen.value = false;
    searchQuery.value = '';
};

const isSelected = (option) => {
    return props.modelValue === (option.id !== undefined ? option.id : option.value);
};

const handleClickOutside = (event) => {
    if (selectContainer.value && !selectContainer.value.contains(event.target)) {
        if (!event.target.closest('.select-dropdown')) {
            isOpen.value = false;
        }
    }
};

const handleScroll = () => {
    if (isOpen.value) {
        updateDropdownPosition();
    }
};

const handleResize = () => {
    if (isOpen.value) {
        updateDropdownPosition();
    }
};

watch(isOpen, (newVal) => {
    if (newVal) {
        nextTick(() => {
            updateDropdownPosition();
            if (props.type === 'search' && searchInput.value) {
                searchInput.value.focus();
            }
        });
    }
});

const calculateInitialWidth = async () => {
    if (!selectContainer.value || props.widthFull) return;

    // Temporarily open dropdown in hidden state to calculate width
    const wasOpen = isOpen.value;
    
    // Set dropdown position off-screen and hidden
    dropdownStyle.value = {
        position: 'fixed',
        left: '-9999px',
        top: '-9999px',
        width: 'max-content',
        maxWidth: '400px',
        visibility: 'hidden',
        zIndex: '-1'
    };

    // Temporarily open dropdown
    isOpen.value = true;

    // Wait for dropdown to render
    await nextTick();
    await nextTick(); // Double nextTick to ensure teleport completes

    // Get actual dropdown width
    const dropdown = document.querySelector('.select-dropdown');
    if (dropdown) {
        const dropdownWidth = dropdown.offsetWidth;
        
        // Set container width to match dropdown
        selectContainer.value.style.width = `${dropdownWidth}px`;
    }

    // Restore original state
    isOpen.value = wasOpen;
};

onMounted(async () => {
    document.addEventListener('click', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    // Calculate initial width based on dropdown content
    await calculateInitialWidth();
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
    window.removeEventListener('scroll', handleScroll, true);
    window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.width-full {
    width: 100% !important;
}

.required {
    color: #ef4444;
    font-weight: 700;
    line-height: normal;
}

/* Floating Label Styles */
.select-button.has-floating-label {
    padding-top: 1.625rem;
    padding-bottom: 0.625rem;
    min-height: 3.5rem;
}

.floating-label {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280;
    font-size: var(--font-size-base);
    font-weight: 500;
    pointer-events: none;
    transition: all 0.2s ease-out;
    transform-origin: left top;
    z-index: 1;
}

.floating-label.float {
    top: 0.5rem;
    transform: translateY(0) scale(0.85);
}

.select-button.has-floating-label.with-icon .floating-label {
    left: 2.7rem;
}

.base-select {
    position: relative;
}

.select-button {
    width: 100%;
    padding: 0.75rem 1rem;
	padding-right: 2.5rem !important;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    font-size: var(--font-size-base);
    font-weight: 500;
    color: #374151;
    gap: 0.5rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.select-button::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(7, 27, 102, 0.05) 0%, rgba(7, 27, 102, 0.02) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.select-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
}

.icon-wrapper {
    display: flex;
    align-items: center;
    color: #6b7280;
    transition: color 0.2s ease;
}

.select-button:hover .icon-wrapper {
    color: var(--color-primary);
}

.select-button.error .icon-wrapper {
    color: #ef4444;
}

.select-button .dropdown-arrow {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    color: #6b7280;
}

.is-open .select-button .dropdown-arrow {
    transform: rotate(180deg);
    color: var(--color-primary);
}

.select-small {
    padding: 0.5rem;
    height: 2.75rem;
    font-size: var(--font-size-small);
}

.select-base {
    padding: 0.65rem;
    height: 2.75rem;
    font-size: var(--font-size-small);
}

.select-medium {
    padding: 0.75rem;
    height: 3.1rem;
    font-size: var(--font-size-base);
}

.select-large {
    padding: 1rem;
    height: 3.5rem;
    font-size: var(--font-size-base);
}

.select-button:hover {
    background: #ffffff;
    border-color: #d1d5db;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.select-button:hover::before {
    opacity: 1;
}

.select-button.error {
    border-color: #ef4444;
    background-color: #fef2f2;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.error-message {
    color: #ef4444;
    font-size: var(--font-size-small);
    font-weight: 500;
    margin-top: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.error-message::before {
    content: '⚠';
    font-size: 0.875rem;
}

/* Dropdown now uses inline styles from dropdownStyle */
.select-dropdown {
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border: 2px solid #e5e7eb;
    border-radius: 16px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    backdrop-filter: blur(8px);
    animation: dropdownSlideIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
}

@keyframes dropdownSlideIn {
    from {
        opacity: 0;
        transform: translateY(-8px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.search-input {
    position: relative;
    display: flex;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid rgba(226, 232, 240, 0.6);
    background: rgba(255, 255, 255, 0.8);
}

.icon-search-wrapper {
    color: #6b7280;
    margin-right: 0.75rem;
}

.search-input input {
    width: 100%;
    padding: 0.5rem 0;
    border: none;
    outline: none;
    font-size: var(--font-size-base);
    font-weight: 500;
    background: transparent;
    color: #374151;
}

.search-input input::placeholder {
    color: #9ca3af;
    font-weight: 400;
}

.select-list {
    padding: 0.5rem 0;
    max-height: 300px;
    overflow-y: auto;
}

.select-list::-webkit-scrollbar {
    width: 6px;
}

.select-list::-webkit-scrollbar-track {
    background: rgba(243, 244, 246, 0.5);
    border-radius: 12px;
}

.select-list::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    border-radius: 12px;
}

.select-option {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: var(--font-size-base);
    font-weight: 500;
    color: #374151;
    margin: 0 0.5rem;
    border-radius: 8px;
    position: relative;
}

.select-option:hover {
    background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 100%);
    color: white;
    transform: translateX(4px);
}

.select-option.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
}

.checkbox {
    width: 1rem;
    height: 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    background: #ffffff;
}

.select-option:hover .checkbox {
    border-color: rgba(255, 255, 255, 0.6);
    background: rgba(255, 255, 255, 0.9);
}

.checkbox svg {
    color: var(--color-primary);
    opacity: 0;
    transform: scale(0);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.select-option:hover .checkbox svg {
    color: white;
}

/* Show checkmark for selected items */
.select-option .checkbox svg {
    opacity: 1;
    transform: scale(1);
}

@media (max-width: 868px) {
    .label-group label {
        font-size: var(--font-size-small);
    }

    .select-button {
        font-size: var(--font-size-small);
        padding: 0.65rem 0.75rem;
    }

    .select-option {
        font-size: var(--font-size-small);
        padding: 0.65rem 0.75rem;
    }

    .select-dropdown {
        border-radius: 12px;
    }

    .search-input {
        padding: 0.75rem;
    }
}
</style>
