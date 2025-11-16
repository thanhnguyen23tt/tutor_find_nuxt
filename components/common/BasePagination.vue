<script setup>
import { computed } from 'vue'

const props = defineProps({
    meta: Object
})

const emit = defineEmits(['changePage'])

// Tính toán các trang cần hiển thị (tối đa 3 trang)
const visiblePages = computed(() => {
    if (!props.meta) return []

    const current = props.meta.current_page
    const last = props.meta.last_page
    const pages = []

    // Nếu tổng số trang <= 3, hiển thị tất cả
    if (last <= 2) {
        for (let i = 1; i <= last; i++) {
            pages.push(i)
        }
        return pages
    }

    // Nếu đang ở trang đầu
    if (current === 1) {
        pages.push(1, 2)
    }
    // Nếu đang ở trang cuối
    else if (current === last) {
        pages.push(last - 2, last - 1, last)
    }
    // Nếu đang ở giữa
    else {
        pages.push(current - 1, current, current + 1)
    }

    return pages
})

// Kiểm tra xem có cần hiển thị dấu "..." không
const showStartEllipsis = computed(() => {
    return props.meta && visiblePages.value[0] > 1
})

const showEndEllipsis = computed(() => {
    return props.meta && visiblePages.value[visiblePages.value.length - 1] < props.meta.last_page
})
</script>

<template>
    <!-- Desktop/Tablet version -->
    <div class="pagination-bar pagination-desktop" v-if="meta">
        <div class="pagination-left">
            <div class="pagination-info">
                Hiển thị {{ meta.from }} - {{ meta.to }} trên {{ meta.total }}
            </div>
            <div class="action">
                <button class="btn-lg btn-secondary" :disabled="meta.current_page === 1" @click="emit('changePage', meta.current_page - 1)">
                    Trang trước
                </button>
                <button class="btn-lg btn-secondary" :disabled="meta.current_page === meta.last_page" @click="emit('changePage', meta.current_page + 1)">
                    Trang sau
                </button>
            </div>
        </div>
        <div class="pagination-controls">
            <div class="pagination-pages">
                <!-- Nút trang đầu nếu cần -->
                <button
                    v-if="showStartEllipsis"
                    class="btn-lg btn-secondary"
                    @click="emit('changePage', 1)"
                >
                    1
                </button>
                <span v-if="showStartEllipsis" class="ellipsis">...</span>

                <!-- Các trang hiển thị -->
                <button
                    v-for="page in visiblePages"
                    :key="page"
                    :class="['btn-lg', page === meta.current_page ? 'btn-primary' : 'btn-secondary']"
                    @click="emit('changePage', page)"
                >
                    {{ page }}
                </button>

                <!-- Nút trang cuối nếu cần -->
                <span v-if="showEndEllipsis" class="ellipsis">...</span>
                <button
                    v-if="showEndEllipsis"
                    class="btn-lg btn-secondary"
                    @click="emit('changePage', meta.last_page)"
                >
                    {{ meta.last_page }}
                </button>
            </div>
        </div>
        <div class="pagination-right">
            <div class="pagination-summary">
                Trang {{ meta.current_page }} trên {{ meta.last_page }}
            </div>
            <div class="action">
                <button class="btn-lg btn-secondary" :disabled="meta.current_page === 1" @click="emit('changePage', 1)">
                    Trang đầu
                </button>
                <button class="btn-lg btn-secondary" :disabled="meta.current_page === meta.last_page" @click="emit('changePage', meta.last_page)">
                    Trang cuối
                </button>
            </div>
        </div>
    </div>

    <!-- Mobile version -->
    <div class="pagination-bar pagination-mobile" v-if="meta">
        <div class="pagination-mobile-header">
            <div class="pagination-info">
                Hiển thị {{ meta.from }} - {{ meta.to }} trên {{ meta.total }}
            </div>
            <div class="pagination-summary">
                Trang {{ meta.current_page }}/{{ meta.last_page }}
            </div>
        </div>

        <div class="pagination-mobile-controls">
            <button
                class="btn-md btn-secondary pagination-nav-btn"
                :disabled="meta.current_page === 1"
                @click="emit('changePage', meta.current_page - 1)"
            >
                <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <div class="pagination-pages">
                <!-- Nút trang đầu nếu cần -->
                <button
                    v-if="showStartEllipsis"
                    class="btn-md btn-secondary pagination-page-btn"
                    @click="emit('changePage', 1)"
                >
                    1
                </button>
                <span v-if="showStartEllipsis" class="ellipsis">...</span>

                <!-- Các trang hiển thị -->
                <button
                    v-for="page in visiblePages"
                    :key="page"
                    :class="['btn-md', 'pagination-page-btn', page === meta.current_page ? 'btn-primary' : 'btn-secondary']"
                    @click="emit('changePage', page)"
                >
                    {{ page }}
                </button>

                <!-- Nút trang cuối nếu cần -->
                <span v-if="showEndEllipsis" class="ellipsis">...</span>
                <button
                    v-if="showEndEllipsis"
                    class="btn-md btn-secondary pagination-page-btn"
                    @click="emit('changePage', meta.last_page)"
                >
                    {{ meta.last_page }}
                </button>
            </div>

            <button
                class="btn-md btn-secondary pagination-nav-btn"
                :disabled="meta.current_page === meta.last_page"
                @click="emit('changePage', meta.current_page + 1)"
            >
                <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    </div>
</template>

<style scoped>
.pagination-bar {
    display: flex;
    align-items: end;
    justify-content: space-between;
    margin-top: 1.8rem;
    gap: 1.5rem;
}

.pagination-info,
.pagination-summary {
    color: #6b7280;
    font-size: var(--font-size-small);
}

.pagination-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: var(--font-size-small);
}

.pagination-pages {
    display: flex;
    gap: 0.2rem;
    align-items: center;
}

.ellipsis {
    padding: 0 0.5rem;
    color: #6b7280;
    font-weight: bold;
    user-select: none;
}

.pagination-right .action,
.pagination-left .action {
    display: flex;
    gap: 0.5rem;
}

.pagination-right {
    display: flex;
    flex-direction: column;
    align-items: end;
    gap: 0.5rem;
}

.pagination-left {
    display: flex;
    flex-direction: column;
    align-items: start;
    gap: 0.5rem;
}

/* Ẩn/hiện từng phiên bản theo kích thước màn hình */
.pagination-desktop { display: flex; }
.pagination-mobile { display: none; }

/* Mobile Pagination Styles */
.pagination-mobile-header {
    display: flex;
    gap: 0.3rem;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding: 0.75rem 1rem;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-radius: 12px;
    border: 1px solid #e2e8f0;
}

.pagination-mobile-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 0.5rem;
    background: white;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    width: 80%;
}


.pagination-pages {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.ellipsis {
    padding: 0 0.25rem;
    color: #9ca3af;
    font-weight: 600;
    font-size: var(--font-size-small);
}

@media (max-width: 768px) {
    .pagination-desktop {
        display: none !important;
    }

    .pagination-mobile {
        display: flex !important;
        flex-direction: column;
        gap: 0;
        margin-top: 1.5rem;
    }

    .pagination-bar {
        /* justify-content: stretch; */
        justify-content: center;
        align-items: center;
    }

    .pagination-info,
    .pagination-summary {
        font-size: var(--font-size-small);
        color: #6b7280;
    }

    .pagination-summary {
        font-weight: 600;
        color: var(--color-primary);
    }

    .pagination-mobile-controls .pagination-nav-btn {
		display: none;
        padding: 0.625rem 0.8rem;
    }
}
</style>
