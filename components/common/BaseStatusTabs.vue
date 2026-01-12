<script setup>
import { defineProps, defineEmits, computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import BaseSelect from './BaseSelect.vue';

const props = defineProps({
    tabs: {
        type: Array,
        required: true,
        default: () => []
    },
    modelValue: {
        type: String,
        default: 'all'
    }
});

const emit = defineEmits(['update:modelValue']);

const tabsContainer = ref(null);
const tabsWrapper = ref(null);
const showLeftArrow = ref(false);
const showRightArrow = ref(false);

const handleTabClick = (tabValue) => {
    emit('update:modelValue', tabValue);
};

const handleSelectChange = (value) => {
    emit('update:modelValue', value);
};

const statusMap = computed(() => {
	const list_tabs = props.tabs.map(tab => ({
        id: tab.value || tab.id,
        name: tab.label || tab.name
    }));

	list_tabs.unshift({
		id: 'all',
		name: 'Tất cả'
	});

    return list_tabs;
});

// Check scroll position and update arrow visibility
const checkScrollPosition = () => {
    if (!tabsContainer.value || !tabsWrapper.value) return;

    const container = tabsContainer.value;
    const wrapper = tabsWrapper.value;

    // Check if content overflows
    const hasOverflow = wrapper.scrollWidth > container.clientWidth;

    if (!hasOverflow) {
        showLeftArrow.value = false;
        showRightArrow.value = false;
        return;
    }

    // Check scroll position
    const scrollLeft = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;

    // Show arrows based on scroll position with small threshold
    showLeftArrow.value = scrollLeft > 5; // Small threshold to account for rounding
    showRightArrow.value = scrollLeft < maxScroll - 5; // Small threshold to account for rounding
};

// Scroll functions
const scrollLeft = () => {
    if (!tabsContainer.value) return;
    const scrollAmount = tabsContainer.value.clientWidth * 0.8;
    tabsContainer.value.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
    });
};

const scrollRight = () => {
    if (!tabsContainer.value) return;
    const scrollAmount = tabsContainer.value.clientWidth * 0.8;
    tabsContainer.value.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
    });
};

// Scroll active tab into view
const scrollToActiveTab = () => {
    if (!tabsContainer.value || !tabsWrapper.value) return;

    const activeButton = tabsWrapper.value?.querySelector('button.active');
    if (activeButton && tabsContainer.value) {
        const container = tabsContainer.value;
        const button = activeButton;

        // Get button position relative to wrapper
        const buttonOffsetLeft = button.offsetLeft;
        const buttonWidth = button.offsetWidth;
        const containerWidth = container.clientWidth;
        const containerScrollLeft = container.scrollLeft;

        // Calculate if button is visible
        const buttonLeft = buttonOffsetLeft;
        const buttonRight = buttonLeft + buttonWidth;
        const visibleLeft = containerScrollLeft;
        const visibleRight = containerScrollLeft + containerWidth;

        // Check if button is outside visible area
        if (buttonLeft < visibleLeft) {
            // Button is to the left, scroll to show it
            container.scrollTo({
                left: Math.max(0, buttonLeft - 10), // 10px padding
                behavior: 'instant' // Use instant instead of smooth for faster response
            });
        } else if (buttonRight > visibleRight) {
            // Button is to the right, scroll to show it
            container.scrollTo({
                left: buttonRight - containerWidth + 10, // 10px padding
                behavior: 'instant' // Use instant instead of smooth for faster response
            });
        }
    }
};

// Watch for modelValue changes to scroll to active tab
watch(() => props.modelValue, () => {
    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
        scrollToActiveTab();
        // Check scroll position after scrolling
        requestAnimationFrame(checkScrollPosition);
    });
});

// Watch for tabs changes
watch(() => props.tabs, () => {
    requestAnimationFrame(() => {
        checkScrollPosition();
        scrollToActiveTab();
    });
}, { deep: true });

// Handle scroll event
const handleScroll = () => {
    checkScrollPosition();
};

// Lifecycle hooks
onMounted(() => {
    requestAnimationFrame(() => {
        checkScrollPosition();
        scrollToActiveTab();

        if (tabsContainer.value) {
            tabsContainer.value.addEventListener('scroll', handleScroll);
        }

        // Check on window resize
        window.addEventListener('resize', checkScrollPosition);
    });
});

onUnmounted(() => {
    if (tabsContainer.value) {
        tabsContainer.value.removeEventListener('scroll', handleScroll);
    }
    window.removeEventListener('resize', checkScrollPosition);
});
</script>

<template>
    <!-- Desktop Tabs View -->
    <div class="base-status-tabs desktop-view">
        <!-- Left Arrow -->
        <button
            v-if="showLeftArrow"
            class="scroll-arrow scroll-arrow-left"
            @click="scrollLeft"
            aria-label="Scroll left"
        >
            <svg class="icon-md" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 12H6M12 6L6 12L12 18"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"/>
            </svg>
        </button>

        <!-- Left Gradient Overlay -->
        <div v-if="showLeftArrow" class="gradient-overlay gradient-overlay-left"></div>

        <!-- Tabs Container with Scroll -->
        <div ref="tabsContainer" class="tabs-container">
            <div ref="tabsWrapper" class="tabs-wrapper">
                <button
                    v-for="tab in statusMap"
                    :key="tab.value || tab.id"
                    :class="{ active: modelValue === tab.value || modelValue === tab.id }"
                    @click="handleTabClick(tab.value || tab.id)"
                >
                    {{ tab.label || tab.name }}
                </button>
            </div>
        </div>

        <!-- Right Gradient Overlay -->
        <div v-if="showRightArrow" class="gradient-overlay gradient-overlay-right"></div>

        <!-- Right Arrow -->
        <button
            v-if="showRightArrow"
            class="scroll-arrow scroll-arrow-right"
            @click="scrollRight"
            aria-label="Scroll right"
        >
        <svg class="icon-md" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                xmlns="http://www.w3.org/2000/svg">
            <path d="M8 12H18M12 6L18 12L12 18"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"/>
            </svg>
        </button>
    </div>

    <!-- Mobile Select View -->
    <div class="mobile-view">
        <BaseSelect
            :model-value="modelValue"
            :options="statusMap"
            :placeholder="'Chọn trạng thái'"
            type="no-search"
            :width-full="true"
            @update:model-value="handleSelectChange"
        />
    </div>
</template>

<style scoped>
/* Desktop View - Tabs */
.desktop-view {
    display: flex;
}

.mobile-view {
    display: none;
}

.base-status-tabs {
    display: flex;
    align-items: center;
    gap: 0;
    background: #f8fafc;
    padding: 6px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    position: relative;
    overflow: visible;
}

.base-status-tabs::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
    opacity: 0.6;
    z-index: 1;
}

/* Scroll Arrows */
.scroll-arrow {
    flex-shrink: 0;
    /* width: 32px;
    height: 40px; */
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: 50;
    padding: 0;
    margin: 0 2px;
}

.scroll-arrow:hover {
    background: #ffffff;
    color: #1e293b;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transform: scale(1.05);
}

.scroll-arrow:active {
    transform: scale(0.95);
}

.scroll-arrow svg {
    pointer-events: none;
}

/* Gradient Overlays */
.gradient-overlay {
    position: absolute;
    top: 6px;
    bottom: 6px;
    width: 30px;
    z-index: 6;
    pointer-events: none;
}

.gradient-overlay-left {
    left: 42px;
    background: linear-gradient(to right, rgba(248, 250, 252, 0.95), rgba(248, 250, 252, 0));
}

.gradient-overlay-right {
    right: 42px;
    background: linear-gradient(to left, rgba(248, 250, 252, 0.95), rgba(248, 250, 252, 0));
}

/* Tabs Container */
.tabs-container {
    flex: 1;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    position: relative;
    /* Hide scrollbar */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
}

.tabs-container::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
}

.tabs-wrapper {
    display: flex;
    gap: 4px;
    min-width: min-content;
}

.base-status-tabs button {
    flex-shrink: 0;
    padding: 0.75rem 1.25rem;
    border: none;
    background: transparent;
    color: #64748b;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease; /* Reduced from 0.3s to 0.15s */
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: var(--font-size-small);
    border-radius: 8px;
    white-space: nowrap;
    position: relative;
}

.base-status-tabs button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    transition: left 0.5s;
}

.base-status-tabs button:hover::before {
    left: 100%;
}

.base-status-tabs button:hover {
    color: #475569;
    background: rgba(255, 255, 255, 0.7);
    transform: translateY(-1px);
}

.base-status-tabs button.active {
    background: linear-gradient(135deg, #ffffff, #f1f5f9);
    color: #1e293b;
    border: 1px solid #cbd5e1;
    box-shadow:
        0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 2px 4px -1px rgba(0, 0, 0, 0.06),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
    transform: translateY(-1px);
}

.base-status-tabs button.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 30px;
    height: 3px;
    background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
    border-radius: 2px;
}

.base-status-tabs button span {
    background: linear-gradient(135deg, #64748b, #94a3b8);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    font-weight: 700;
    font-size: 0.85rem;
    padding: 2px 8px;
    border-radius: 12px;
    background: #e2e8f0;
    color: #64748b;
    min-width: 20px;
    text-align: center;
}

.base-status-tabs button.active span {
    background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
    color: white;
    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}


/* Responsive styles */
@media (max-width: 1024px) {
    .desktop-view {
        display: none;
    }

    .mobile-view {
        display: block;
    }
}

/* Remove or reduce animation for faster tab switching */

</style>
