<template>
<div class="more-menu" ref="menuRoot">
    <slot name="activator" :toggle="toggle" :open="isOpen">
        <button class="btn-sm btn-secondary more-btn" @click.stop="toggle">
            <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="19" cy="12" r="1"></circle>
                <circle cx="5" cy="12" r="1"></circle>
            </svg>
        </button>
    </slot>

    <div v-if="isOpen" class="more-menu-dropdown show">
        <slot :close="close"></slot>
    </div>
</div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const isOpen = ref(false);
const menuRoot = ref(null);

const open = () => { isOpen.value = true; };
const close = () => { isOpen.value = false; };
const toggle = () => { isOpen.value = !isOpen.value; };

const onGlobalClick = (e) => {
    if (!menuRoot.value) return;
    if (!menuRoot.value.contains(e.target)) {
        close();
    }
};

const onKeydown = (e) => {
    if (e.key === 'Escape') close();
};

onMounted(() => {
    document.addEventListener('click', onGlobalClick);
    document.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
    document.removeEventListener('click', onGlobalClick);
    document.removeEventListener('keydown', onKeydown);
});
</script>

<style scoped>
.more-menu {
    position: relative;
    display: inline-block;
}

.more-btn {
    min-width: 40px;
    height: 40px;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
    backdrop-filter: blur(10px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.more-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    transition: left 0.5s ease;
}

.more-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.1);
    border-color: rgba(102, 126, 234, 0.3);
}

.more-btn:hover::before {
    left: 100%;
}

.more-btn:active {
    transform: translateY(0);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
}

.more-btn svg {
    color: #64748b;
    transition: all 0.3s ease;
}

.more-btn:hover svg {
    color: #667eea;
    transform: scale(1.1);
}

.more-menu-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.06);
    z-index: 1000;
    min-width: 180px;
    overflow: hidden;
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
}

.more-menu-dropdown.show {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: auto;
}

.more-menu-dropdown::before {
    content: '';
    position: absolute;
    top: -8px;
    right: 16px;
    width: 16px;
    height: 16px;
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-bottom: none;
    border-right: none;
    transform: rotate(45deg);
    backdrop-filter: blur(20px);
}

.more-menu-item {
    width: 100%;
    padding: 0.875rem 1.25rem;
    border: none;
    background: transparent;
    color: #374151;
    font-size: var(--font-size-small);
    font-weight: 500;
    text-align: left;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.more-menu-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
    transition: left 0.5s ease;
}

.more-menu-item:hover {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
    color: #667eea;
    transform: translateX(4px);
}

.more-menu-item:hover::before {
    left: 100%;
}

.more-menu-item:active {
    transform: translateX(2px);
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}

.more-menu-item:first-child {
    border-bottom: 1px solid rgba(226, 232, 240, 0.5);
}

.more-menu-item:last-child {
    border-bottom: none;
}

.more-menu-item svg {
    width: 16px;
    height: 16px;
    color: #94a3b8;
    transition: all 0.3s ease;
}

.more-menu-item:hover svg {
    color: #667eea;
    transform: scale(1.1);
}

/* Animation for menu items */
.more-menu-item {
    animation: slideInRight 0.3s ease forwards;
    opacity: 0;
    transform: translateX(-20px);
}

.more-menu-item:nth-child(1) { animation-delay: 0.05s; }
.more-menu-item:nth-child(2) { animation-delay: 0.1s; }
.more-menu-item:nth-child(3) { animation-delay: 0.15s; }
.more-menu-item:nth-child(4) { animation-delay: 0.2s; }
.more-menu-item:nth-child(5) { animation-delay: 0.25s; }

@keyframes slideInRight {
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

/* Mobile responsiveness */
@media (max-width: 640px) {
    .more-menu-dropdown {
        right: -8px;
        min-width: 160px;
    }

    .more-menu-dropdown::before {
        right: 24px;
    }

    .more-menu-item {
        padding: 0.75rem 1rem;
        font-size: var(--font-size-mini);
    }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
    .more-btn {
        background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.9) 100%);
        border-color: rgba(71, 85, 105, 0.3);
    }

    .more-btn svg {
        color: #cbd5e1;
    }

    .more-btn:hover svg {
        color: #818cf8;
    }

    .more-menu-dropdown {
        background: rgba(30, 41, 59, 0.95);
        border-color: rgba(71, 85, 105, 0.3);
    }

    .more-menu-dropdown::before {
        background: rgba(30, 41, 59, 0.95);
        border-color: rgba(71, 85, 105, 0.3);
    }

    .more-menu-item {
        color: #e2e8f0;
    }

    .more-menu-item:hover {
        color: #818cf8;
        background: linear-gradient(135deg, rgba(129, 140, 248, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
    }

    .more-menu-item svg {
        color: #64748b;
    }

    .more-menu-item:hover svg {
        color: #818cf8;
    }

    .more-menu-item:first-child {
        border-bottom-color: rgba(71, 85, 105, 0.3);
    }
}
</style>


