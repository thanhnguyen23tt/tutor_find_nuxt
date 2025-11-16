<template>
<div class="pops-container-general">
    <transition-group name="notification-list" tag="div">
        <div v-for="notification in notificationQueue" :key="notification.id" class="pop-wrapper" :class="{ 'active': notification.show, [notification.type]: notification.type }" @click="removeNotification(notification.id)">
            <div class="pop-icon">
                <i :class="getIconClass(notification.type)" class="icon"></i>
            </div>
            <div class="pop-content">
                <span class="title">{{ getTitleByType(notification.type) }}</span>
                <span class="content">{{ notification.message }}</span>
            </div>
            <button class="close-btn" @click.stop="removeNotification(notification.id)">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
    </transition-group>
</div>
</template>

  
  
<script setup>
import { computed } from 'vue';

const notificationStore = useNotificationStore();

const notificationQueue = computed(() => notificationStore.notificationQueue);

// Hàm lấy title theo type
const getTitleByType = (type) => {
    switch (type) {
        case "success":
            return "Thành công";
        case "error":
            return "Thất bại";
        case "warning":
        case "warring":
            return "Lưu ý";
        case "info":
            return "Thông báo";
        default:
            return "Thông báo";
    }
};

// Hàm lấy icon class theo type
const getIconClass = (type) => {
    switch (type) {
        case "success":
            return "fa-solid fa-circle-check";
        case "error":
            return "fa-solid fa-circle-exclamation";
        case "warning":
        case "warring":
            return "fa-solid fa-triangle-exclamation";
        case "info":
            return "fa-solid fa-circle-info";
        default:
            return "fa-solid fa-bell";
    }
};

// Xóa notification
const removeNotification = (id) => {
    notificationStore.removeNotificationFromQueue(id);
};
</script>

<style scoped>
.pops-container-general {
    position: fixed;
    top: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: flex-start;
    z-index: 999999999;
    pointer-events: none;
    transform: translateX(0);
    opacity: 1;
    gap: 0.75rem;
    max-height: calc(100vh - 40px);
    overflow-y: auto;
    overflow-x: visible;
    padding-right: 10px;
}

.pops-container-general::-webkit-scrollbar {
    width: 4px;
}

.pops-container-general::-webkit-scrollbar-track {
    background: transparent;
}

.pops-container-general::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
}

.pops-container-general::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
}

.pop-wrapper {
    pointer-events: all;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    transform: translateX(100%) scale(0.8);
    opacity: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: default;
    padding: 1rem 1.5rem;
    border-radius: 16px;
    gap: 1rem;
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow:
        0 20px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04);
    position: relative;
    overflow: hidden;
    min-width: 300px;
    max-width: 400px;
    margin-bottom: 1rem;
}

.pops-container-general .pop-wrapper:last-child {
    margin-bottom: 0;
}

.pop-wrapper::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.6s;
}

.pop-wrapper:hover::before {
    left: 100%;
}

.pop-wrapper .pop-content {
    display: grid;
    gap: 0.2rem;
    flex: 1;
}

.pop-wrapper .pop-content .title {
    font-weight: 500;
    font-size: 1.1rem;
    line-height: 1.3;
}

.pop-wrapper .pop-content .content {
    font-size: var(--font-size-small);
    line-height: 1.4;
    opacity: 0.9;
}

.pops-container-general .pop-wrapper.active {
    transform: translateX(0) scale(1);
    opacity: 1;
    display: flex;
    align-items: center;
    animation: slideInBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes slideInBounce {
    0% {
        transform: translateX(100%) scale(0.8);
        opacity: 0;
    }

    60% {
        transform: translateX(-10px) scale(1.02);
        opacity: 1;
    }

    100% {
        transform: translateX(0) scale(1);
        opacity: 1;
    }
}

.pops-container-general .pop-wrapper.error.active {
    color: #dc2626;
    background: rgba(254, 242, 242, 0.95);
    border-left: 4px solid #dc2626;
}

.pops-container-general .pop-wrapper.success.active {
    color: #059669;
    background: rgba(236, 253, 245, 0.95);
    border-left: 4px solid #059669;
}

.pops-container-general .pop-wrapper.error .pop-icon {
    background: linear-gradient(135deg, #dc2626, #ef4444);
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.pops-container-general .pop-wrapper.success .pop-icon {
    background: linear-gradient(135deg, #059669, #10b981);
    box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
}

.pops-container-general .pop-wrapper.warning.active {
    color: #d97706;
    background: rgba(255, 251, 235, 0.95);
    border-left: 4px solid #d97706;
}

.pops-container-general .pop-wrapper.info.active {
    color: #2563eb;
    background: rgba(239, 246, 255, 0.95);
    border-left: 4px solid #2563eb;
}

.pops-container-general .pop-wrapper.warning .pop-icon {
    background: linear-gradient(135deg, #d97706, #f59e0b);
    box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
}

.pops-container-general .pop-wrapper.info .pop-icon {
    background: linear-gradient(135deg, #2563eb, #3b82f6);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.pops-container-general .pop-wrapper .pop-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    flex-shrink: 0;
    transition: all 0.3s ease;
    border: 2px solid rgba(255, 255, 255, 0.3);
}

.pops-container-general .pop-wrapper:hover .pop-icon {
    transform: scale(1.1) rotate(5deg);
}

.pops-container-general .pop-wrapper .pop-icon .icon {
    color: white;
    font-size: 1.1rem;
    transition: all 0.3s ease;
}

/* Enhanced mobile responsiveness */
@media (max-width: 768px) {
    .pops-container-general {
		top: auto;
        bottom: 10px;
        right: 10px;
        left: 10px;
        align-items: stretch;
    }

    .pop-wrapper {
        min-width: auto;
        max-width: none;
        padding: 1rem;
    }
}

/* Auto-dismiss animation */
@keyframes fadeOut {
    0% {
        opacity: 1;
        transform: translateX(0) scale(1);
    }

    100% {
        opacity: 0;
        transform: translateX(100%) scale(0.8);
    }
}

.pop-wrapper.dismissing {
    animation: fadeOut 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

/* Close button styles */
.close-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 28px;
    height: 28px;
    border: none;
    background: rgb(0 0 0 / 8%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    opacity: 0.6;
}

.close-btn i {
    font-size: 0.7rem;
    color: inherit;
}

.pop-wrapper {
    position: relative;
    cursor: pointer;
}

/* Transition group animations */
.notification-list-enter-active {
    animation: slideInBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.notification-list-leave-active {
    animation: fadeOut 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.notification-list-move {
    transition: transform 0.3s ease;
}
</style>
