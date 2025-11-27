<script setup>
import { computed } from 'vue'

const props = defineProps({
    meta: Object
})

const emit = defineEmits(['changePage'])

// Tính toán các trang cần hiển thị
const visiblePages = computed(() => {
    if (!props.meta) return []

    const current = props.meta.current_page
    const last = props.meta.last_page
    const pages = []

    // Luôn hiển thị ít nhất 3 trang nếu có thể
    if (last <= 5) {
        for (let i = 1; i <= last; i++) {
            pages.push(i)
        }
        return pages
    }

    // Logic cho số trang lớn
    if (current <= 3) {
        pages.push(1, 2, 3, 4)
    } else if (current >= last - 2) {
        pages.push(last - 3, last - 2, last - 1, last)
    } else {
        pages.push(current - 1, current, current + 1)
    }

    return pages
})

const showStartEllipsis = computed(() => {
    return props.meta && visiblePages.value[0] > 1
})

const showEndEllipsis = computed(() => {
    return props.meta && visiblePages.value[visiblePages.value.length - 1] < props.meta.last_page
})
</script>

<template>
    <div class="pagination-wrapper" v-if="meta && meta.total > 0">
        <div class="pagination-container">
            <!-- Previous Button -->
            <button 
                class="nav-btn prev" 
                :disabled="meta.current_page === 1"
                @click="emit('changePage', meta.current_page - 1)"
            >
                <i class="fas fa-chevron-left"></i>
                <span class="nav-text">Trước</span>
            </button>

            <!-- Page Numbers -->
            <div class="page-numbers">
                <!-- First Page -->
                <button 
                    v-if="showStartEllipsis" 
                    class="page-btn"
                    @click="emit('changePage', 1)"
                >1</button>
                
                <span v-if="showStartEllipsis" class="dots">...</span>

                <!-- Visible Pages -->
                <button 
                    v-for="page in visiblePages" 
                    :key="page"
                    :class="['page-btn', { active: page === meta.current_page }]"
                    @click="emit('changePage', page)"
                >
                    {{ page }}
                </button>

                <!-- Last Page -->
                <span v-if="showEndEllipsis" class="dots">...</span>
                
                <button 
                    v-if="showEndEllipsis" 
                    class="page-btn"
                    @click="emit('changePage', meta.last_page)"
                >
                    {{ meta.last_page }}
                </button>
            </div>

            <!-- Next Button -->
            <button 
                class="nav-btn next" 
                :disabled="meta.current_page === meta.last_page"
                @click="emit('changePage', meta.current_page + 1)"
            >
                <span class="nav-text">Sau</span>
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>

        <!-- Info Text -->
        <div class="pagination-info">
            Hiển thị <span>{{ meta.from }}-{{ meta.to }}</span> trên <span>{{ meta.total }}</span> kết quả
        </div>
    </div>
</template>

<style scoped>
.pagination-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
}

.pagination-container {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

/* Navigation Buttons */
.nav-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1.2rem;
    border: none;
    background: transparent;
    color: var(--gray-600);
    font-size: var(--font-size-small);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.nav-btn:hover:not(:disabled) {
    background: var(--gray-50);
    color: var(--color-primary);
}

.nav-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.nav-btn i {
    font-size: 0.8rem;
}

/* Page Numbers */
.page-numbers {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0 0.5rem;
    border-left: 1px solid var(--gray-200);
    border-right: 1px solid var(--gray-200);
}

.page-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    color: var(--gray-600);
    font-size: var(--font-size-small);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.page-btn:hover:not(.active) {
    background: var(--gray-100);
    color: var(--gray-900);
}

.page-btn.active {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(var(--color-primary), 0.3);
}

.dots {
    color: var(--gray-400);
    font-weight: bold;
    padding: 0 0.25rem;
    user-select: none;
}

/* Info Text */
.pagination-info {
    color: var(--gray-500);
    font-size: 0.9rem;
}

.pagination-info span {
    color: var(--gray-900);
}

/* Responsive */
@media (max-width: 640px) {
    .pagination-container {
        width: 100%;
        justify-content: space-between;
        gap: 0.25rem;
        padding: 0.5rem;
    }

    .nav-text {
        display: none;
    }

    .nav-btn {
        padding: 0.6rem;
        background: var(--gray-50);
    }

    .page-numbers {
        border: none;
        padding: 0;
    }

    .page-btn {
        width: 32px;
        height: 32px;
        font-size: 0.9rem;
        border-radius: 8px;
    }
}
</style>
