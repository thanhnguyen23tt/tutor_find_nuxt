<script setup>
import {
    computed,
    watch,
    ref
} from 'vue';

const props = defineProps({
    modelValue: {
        type: [String, Number],
        default: ''
    },
    type: {
        type: String,
        default: 'text'
    },
    placeholder: {
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
    unit: {
        type: String,
        default: ''
    },
    error: {
        type: String,
        default: ''
    },
    min: {
        type: [Number, String],
        default: null
    },
    max: {
        type: [Number, String],
        default: null
    },
    step: {
        type: [Number, String],
        default: null
    },
    disabled: {
        type: Boolean,
        default: false
    },
    size: {
        type: String,
        default: 'large'
    },
    rows: {
        type: Number,
        default: 4
    }
});

const emit = defineEmits(['update:modelValue']);

const showPassword = ref(false);
const internalError = ref('');
const isTouched = ref(false);

const hasUnit = computed(() => !!props.unit || props.type === 'password');
const hasLabel = computed(() => !!props.label);
const hasError = computed(() => {
    // Nếu có error từ props thì ưu tiên hiển thị error đó
    if (props.error) return true;
    // Nếu có required và đã touched thì validate
    if (props.required && isTouched.value) {
        return !props.modelValue || props.modelValue === '';
    }
    return false;
});
const errorMessage = computed(() => {
    // Ưu tiên error message từ props
    if (props.error) return props.error;
    // Nếu required và rỗng thì hiển thị message mặc định
    if (props.required && isTouched.value && (!props.modelValue || props.modelValue === '')) {
        return 'Trường này là bắt buộc';
    }
    return '';
});
const isPasswordType = computed(() => props.type === 'password');
const inputType = computed(() => {
    if (props.type === 'password') {
        return showPassword.value ? 'text' : 'password';
    }
    return props.type;
});

const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value;
};

const updateValue = (event) => {
    isTouched.value = true;
    emit('update:modelValue', event.target.value);
};

const handleBlur = () => {
    isTouched.value = true;
};
</script>

<template>
<div class="form-group">
    <div v-if="hasLabel" class="label-group" :class="{
            'label-small': size === 'small',
            'label-base': size === 'base',
            'label-medium': size === 'medium',
            'label-large': size === 'large',
            'label-xl': size === 'xl'
        }">
        <label>{{ label }}</label>
        <span v-if="required" class="required">*</span>
    </div>

    <div class="input-wrapper" :class="{
      'with-icon': $slots.icon,
      'with-unit': hasUnit,
      'has-error': hasError
    }">
        <template v-if="$slots.icon">
            <div class="icon">
                <slot name="icon" />
            </div>
        </template>

        <template v-if="type === 'textarea'">
            <textarea :value="modelValue" :placeholder="placeholder" :rows="rows" :required="required" :min="min" :max="max" :disabled="disabled" @input="updateValue"></textarea>
        </template>
        <template v-else>
            <input :type="inputType" :value="modelValue" :placeholder="placeholder" :required="required" :min="min" :max="max" :step="step" :disabled="disabled" :class="{
                'input-small': size === 'small',
                'input-base': size === 'base',
                'input-medium': size === 'medium',
                'input-large': size === 'large',
                'input-xl': size === 'xl'
            }" @input="updateValue">
        </template>

        <template v-if="isPasswordType">
            <button type="button" class="password-toggle" @click="togglePasswordVisibility">
                <svg v-if="!showPassword" class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
            </button>
        </template>
        <template v-else-if="unit">
            <span class="unit">{{ unit }}</span>
        </template>
    </div>

    <span v-if="hasError" class="error-message">{{ errorMessage }}</span>
</div>
</template>

<style scoped>
.form-group {
    width: 100%;
    position: relative;
}

.label-group {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 0.5rem;
}

.label-small {
    font-size: var(--font-size-small);
}
.label-base {
    font-size: var(--font-size-base);
}
.label-medium {
    font-size: var(--font-size-base);
}
.label-large {
    font-size: var(--font-size-medium);
}

.label-group label {
    display: block;
    font-weight: 500;
    color: #1f2937;
    display: flex;
    align-items: center;
    font-size: var(--font-size-base);
    letter-spacing: -0.01em;
}

.required {
    color: #ef4444;
    font-weight: 700;
    line-height: normal;
}

.input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.input-wrapper.with-icon input,
.input-wrapper.with-icon textarea {
    padding-left: 2.7rem;
}

.input-wrapper.with-unit input,
.input-wrapper.with-unit textarea {
    padding-right: 4rem;
}

input[type="password"],
input[type="text"].password-input {
    padding-right: 3.5rem;
}

.input-wrapper.has-error input,
.input-wrapper.has-error textarea {
    border-color: #ef4444;
    background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1), 0 4px 12px rgba(239, 68, 68, 0.15);
    animation: shake 0.4s ease;
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-4px); }
    75% { transform: translateX(4px); }
}

.icon {
    position: absolute;
    transform: translateY(-50%);
    top: 48%;
    left: 1rem;
    color: #9ca3af;
    line-height: 1;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
}

input, textarea {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 14px;
    /* transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); */
    font-weight: 500;
    font-family: "Gill Sans", sans-serif;
    background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
    color: #374151;
    font-size: var(--font-size-small);
    line-height: 1.5;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    position: relative;
}

textarea {
    resize: vertical;
    min-height: 120px;
    line-height: 1.6;
}

/* Custom scrollbar for textarea */
textarea::-webkit-scrollbar {
    width: 8px;
}

textarea::-webkit-scrollbar-track {
    background: rgba(243, 244, 246, 0.5);
    border-radius: 12px;
}

textarea::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    border-radius: 12px;
    transition: background 0.2s ease;
}

textarea::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 100%);
}

.input-small {
    padding: 0.5rem 0.75rem;
    height: 2.75rem;
    font-size: var(--font-size-small);
}

.input-base {
    padding: 0.65rem 0.75rem;
    height: 2.75rem;
    font-size: var(--font-size-small);
}

.input-medium {
    padding: 0.75rem 1rem;
    height: 3.1rem;
    font-size: var(--font-size-base);
}

.input-large {
    padding: 1rem 1.4rem;
    height: 3.5rem;
    font-size: var(--font-size-base);
}

.input-xl {
    padding: 1.25rem 1.6rem;
    height: 4rem;
    font-size: var(--font-size-base);
}

input:hover, textarea:hover {
    border-color: #d1d5db;
    background: #ffffff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
}

input:focus, textarea:focus {
    outline: none;
    border-color: var(--color-primary);
    background: #ffffff;
    box-shadow: 0 0 0 4px rgba(7, 27, 102, 0.12), 0 8px 16px rgba(7, 27, 102, 0.1);
    /* transform: translateY(-2px); */
}

input:hover + .icon,
textarea:hover + .icon,
.input-wrapper:hover .icon {
    color: #6b7280;
}

input:focus + .icon,
textarea:focus + .icon,
.input-wrapper:focus-within .icon {
    color: var(--color-primary);
    transform: translateY(-50%) scale(1.1);
}

input:disabled, textarea:disabled {
    background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
    border-color: #e5e7eb;
    color: #9ca3af;
    cursor: not-allowed;
    transform: none;
    opacity: 0.7;
    box-shadow: none;
}

input:disabled + .icon,
textarea:disabled + .icon {
    color: #d1d5db;
    opacity: 0.5;
}

.password-toggle {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 3;
    border-radius: 6px;
}

.password-toggle:hover {
    color: var(--color-primary);
    background: rgba(0, 0, 0, 0.05);
}

.password-toggle:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.2);
}

.password-toggle svg {
    transition: transform 0.2s ease;
}

.password-toggle:hover svg {
    transform: scale(1.1);
}

.unit {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280;
    font-size: var(--font-size-small);
    font-weight: 600;
    background: linear-gradient(135deg, rgba(249, 250, 251, 0.95) 0%, rgba(243, 244, 246, 0.95) 100%);
    padding: 0.35rem 0.65rem;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    z-index: 2;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(4px);
    transition: all 0.2s ease;
}

.input-wrapper:focus-within .unit {
    border-color: var(--color-primary);
    color: var(--color-primary);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 250, 251, 0.98) 100%);
}

.error-message {
    color: #ef4444;
    font-size: var(--font-size-small);
    font-weight: 500;
    margin-top: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.35rem;
    animation: fadeInUp 0.3s ease;
}

.error-message::before {
    content: '⚠';
    font-size: 0.875rem;
    animation: iconPulse 0.6s ease infinite;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(-4px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes iconPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
}

/* Enhanced focus states with animations */
@keyframes inputFocus {
    from {
        box-shadow: 0 0 0 0 rgba(7, 27, 102, 0.1);
    }
    to {
        box-shadow: 0 0 0 3px rgba(7, 27, 102, 0.1);
    }
}

input:focus, textarea:focus {
    animation: inputFocus 0.2s ease-out;
}

/* Placeholder styling */
input::placeholder, textarea::placeholder {
    color: #9ca3af;
    font-weight: 400;
    opacity: 1;
    transition: all 0.3s ease;
}

input:focus::placeholder, textarea:focus::placeholder {
    color: #d1d5db;
    transform: translateX(4px);
}

/* Responsive styles */
@media (max-width: 868px) {
    input, textarea {
        border-radius: 12px;
        font-size: var(--font-size-small);
    }

    .password-toggle {
        padding: 0.4rem;
        border-radius: 6px;
    }

    .unit {
        padding: 0.3rem 0.5rem;
        font-size: 0.75rem;
    }
}
</style>
