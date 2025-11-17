<script setup>
import { ref, computed, onMounted, watch } from 'vue';

// ============================================
// SETUP
// ============================================
const { api } = useApi();
const { success, error: notifyError } = useNotification();
const { formatCurrency } = useHelper();
const userStore = useUserStore();

const props = defineProps({
    userDataDetail: { type: Object, default: () => ({}) }
});

// ============================================
// STATE
// ============================================
const isLoading = ref(false);
const currentPage = ref(1);
const search = ref('');
const filterType = ref('all');
const filterPeriod = ref('month');

const dataPaginate = ref({
    total: 0,
    per_page: 10,
    current_page: 1,
    last_page: 1,
    from: 1,
    to: 10
});

const walletStats = ref({
    balance: 0,
    formatted_balance: 0,
    total_credits: 0,
    total_debits: 0,
    pending_withdrawals: 0,
    transaction_count: 0
});

const transactions = ref([]);
const revenueStats = ref({});

const modals = ref({ withdraw: false, paymentInfo: false });

const forms = ref({
    withdraw: { amount: '', note: '' },
    paymentInfo: { phone: '', bank_account: '', bank_name: '', account_holder: '' }
});

// ============================================
// COMPUTED
// ============================================
const userData = computed(() => userStore.getUserData);

const paymentInfo = computed(() => ({
    phone: props.userDataDetail?.phone || '',
    bank_account: props.userDataDetail?.bank_account || '',
    bank_name: props.userDataDetail?.bank_name || '',
    account_holder: props.userDataDetail?.account_holder || ''
}));

const filterOptions = computed(() => [
    { value: 'all', name: 'Tất cả giao dịch' },
    { value: 'credit', name: 'Thu nhập' },
    { value: 'debit', name: 'Chi tiêu' },
    { value: 'pending', name: 'Đang xử lý' }
]);

const periodOptions = computed(() => [
    { value: 'day', name: 'Hôm nay' },
    { value: 'week', name: 'Tuần này' },
    { value: 'month', name: 'Tháng này' },
    { value: 'year', name: 'Năm nay' }
]);

const filteredTransactions = computed(() => {
    let filtered = transactions.value;

    if (filterType.value !== 'all') {
        filtered = filtered.filter(t => t.type === filterType.value);
    }

    if (search.value.trim()) {
        const searchTerm = search.value.toLowerCase();
        filtered = filtered.filter(t =>
            t.note.toLowerCase().includes(searchTerm) ||
            t.transaction_id.toLowerCase().includes(searchTerm)
        );
    }

    return filtered;
});

const canWithdraw = computed(() => {
    const amount = parseInt(forms.value.withdraw.amount) || 0;
    return walletStats.value.balance >= 10000 &&
           amount >= 10000 &&
           amount <= walletStats.value.balance &&
           paymentInfo.value.phone;
});

// ============================================
// CONSTANTS
// ============================================
const ICON_PATHS = {
    credit: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    debit: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z',
    pending: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'
};

const TRANSACTION_CLASSES = {
    credit: 'transaction-credit',
    debit: 'transaction-debit',
    pending: 'transaction-pending'
};

// ============================================
// HELPER FUNCTIONS
// ============================================
const getTransactionIcon = (type, status) => {
    if (type === 'credit') return ICON_PATHS.credit;
    if (type === 'debit' && status === 'pending') return ICON_PATHS.pending;
    return ICON_PATHS.debit;
};

const getTransactionClass = (type, status) => {
    if (type === 'credit') return TRANSACTION_CLASSES.credit;
    return status === 'pending' ? TRANSACTION_CLASSES.pending : TRANSACTION_CLASSES.debit;
};

const getStatusClass = (status) => {
    const map = { completed: 'status-completed', pending: 'status-pending', failed: 'status-failed' };
    return map[status] || 'status-default';
};

const formatAmount = (amount, type) => {
  const formatted = formatCurrency(amount);
    return type === 'credit' ? `+${formatted}` : `-${formatted}`;
};

const validateMomoPhone = (phone) => {
    const trimmed = phone.trim();
    return /^0\d{9}$/.test(trimmed) || /^\+84\d{9}$/.test(trimmed);
};

const resetModal = (type) => {
    modals.value[type] = false;
    forms.value[type] = type === 'withdraw'
        ? { amount: '', note: '' }
        : { phone: '', bank_account: '', bank_name: '', account_holder: '' };
};

const loadPaymentInfoData = () => {
    forms.value.paymentInfo = { ...paymentInfo.value };
};

// ============================================
// API CALLS
// ============================================
const loadWalletStats = async () => {
    try {
    const res = await api.apiGet('wallet/balance');
        if (res.success) walletStats.value = res.data;
    } catch (e) {
    notifyError('Không thể tải thông tin ví');
    }
};

const loadTransactions = async () => {
    isLoading.value = true;
    try {
    const res = await api.apiGet('wallet/transactions', {
            per_page: 10,
            page: currentPage.value,
        });
        if (res.success) {
            transactions.value = res.data;
            dataPaginate.value = res.meta;
    }
    } catch (e) {
    notifyError('Không thể tải lịch sử giao dịch');
    } finally {
        isLoading.value = false;
    }
};

const loadRevenueStats = async () => {
    try {
    const res = await api.apiGet('wallet/revenue-stats', { period: filterPeriod.value });
        if (res.success) revenueStats.value = res.data;
    } catch (e) {
    notifyError('Không thể tải thống kê doanh thu');
    }
};

// ============================================
// MODAL HANDLERS
// ============================================
const openModal = (type) => {
    if (type === 'paymentInfo') loadPaymentInfoData();
    modals.value[type] = true;
};

// ============================================
// FORM SUBMISSION
// ============================================
const submitPaymentInfo = async () => {
    const phone = forms.value.paymentInfo.phone;
    if (phone && !validateMomoPhone(phone)) {
        notifyError('Số điện thoại không hợp lệ (VD: 0325752074 hoặc +84325752074)');
        return;
    }

    try {
        const res = await api.apiPost('me/payment-info', forms.value.paymentInfo);
        if (res.success) {
            success('Cập nhật thông tin thanh toán thành công');
            resetModal('paymentInfo');
            emit('update-data', res.data);
        } else {
            notifyError(res.message || 'Có lỗi xảy ra');
        }
    } catch (e) {
        notifyError('Có lỗi xảy ra khi cập nhật thông tin');
    }
};

const submitWithdraw = async () => {
    const amount = parseInt(forms.value.withdraw.amount) || 0;

    if (amount < 10000) {
        notifyError('Số tiền chuyển tối thiểu là 10,000 VND');
        return;
    }

    if (amount > walletStats.value.balance) {
        notifyError('Số dư ví không đủ');
        return;
    }

    if (!paymentInfo.value.phone) {
        notifyError('Vui lòng cập nhật số điện thoại MoMo trong phần thông tin thanh toán trước');
        return;
    }

    try {
        const res = await api.apiPost('momo/transfer', {
            amount,
            note: forms.value.withdraw.note || 'Chuyển tiền từ ví qua MoMo'
        });

        if (res.success) {
            success(res.message || 'Chuyển tiền thành công');
            resetModal('withdraw');
            await Promise.all([loadWalletStats(), loadTransactions()]);
        } else {
            notifyError(res.message);
        }
    } catch (e) {
        notifyError('Có lỗi xảy ra khi chuyển tiền');
    }
};

const changePage = (page) => {
    currentPage.value = page;
    loadTransactions();
};

// ============================================
// EMITS & WATCHERS
// ============================================
const emit = defineEmits(['update-data']);

watch(filterPeriod, loadRevenueStats);
watch(() => props.userDataDetail, loadPaymentInfoData, { deep: true, immediate: true });

onMounted(() => {
    loadWalletStats();
    loadTransactions();
    loadRevenueStats();
});
</script>

<template>
<base-loading v-if="isLoading" />

<div class="wallet-balance-page" v-if="!isLoading">
    <!-- Wallet Balance Section -->
    <div class="section-card wallet-section">
        <div class="header-wrapper">
            <div class="header-left">
                <div class="icon-wrapper">
                    <svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3 4-3 9-3 9 1.34 9 3z"></path>
                        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5c0-1.66-4-3-9-3s-9 1.34-9 3z"></path>
                    </svg>
                </div>
                <div class="title-wrapper">
                    <span class="title-main">Số dư ví</span>
                    <span class="sub-title">Quản lý số dư và lịch sử giao dịch của bạn</span>
                </div>
            </div>
            <div class="header-right">
                <button class="btn-md btn-primary" @click="openModal('withdraw')">
                    <span>Chuyển tiền qua MoMo</span>
                </button>
            </div>
        </div>
        <div class="main-content">
            <div class="balance-overview">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon count">
                            <svg class="icon-xl" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M9 11H5a2 2 0 0 0-2 2v3c0 1.1.9 2 2 2h4m0-7v7m0-7h4m-4 0h4m-4 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">{{ formatCurrency(walletStats.formatted_balance) }}</div>
                            <div class="stat-label">Số dư hiện tại</div>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon credit">
                            <svg class="icon-xl" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                            </svg>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">{{ formatCurrency(walletStats.total_credits) }}</div>
                            <div class="stat-label">Tổng thu nhập</div>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon debit">
                            <svg class="icon-xl" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"></path>
                            </svg>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">{{ formatCurrency(walletStats.total_debits) }}</div>
                            <div class="stat-label">Tổng rút tiền</div>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon pending">
                            <svg class="icon-xl" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M12 6v6l4 2"></path>
                            </svg>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">{{ formatCurrency(walletStats.pending_withdrawals) }}</div>
                            <div class="stat-label">Đang xử lý</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Payment Info Section -->
    <div class="section-card payment-info-section">
        <div class="header-wrapper">
            <div class="header-left">
                <div class="icon-wrapper">
                    <svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                        <line x1="1" y1="10" x2="23" y2="10"></line>
                    </svg>
                </div>
                <div class="title-wrapper">
                    <span class="title-main">Thông tin chuyển khoản</span>
                    <span class="sub-title">Cập nhật thông tin để nhận tiền nhanh chóng</span>
                </div>
            </div>
            <div class="header-right">
                <button class="btn-md btn-secondary" @click="openModal('paymentInfo')">
                    <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    <span>Cập nhật</span>
                </button>
            </div>
        </div>
        <div class="main-content">
            <div class="payment-info-grid">
                <div class="payment-info-card">
                    <div class="payment-info-icon momo">
                        <img class="icon-xl" src="\images\payment\momo-logo.png" alt="MoMo" />
                    </div>
                    <div class="payment-info-content">
                        <div class="payment-info-label">Số điện thoại MoMo</div>
                        <div class="payment-info-value">{{ paymentInfo.phone || 'Chưa cập nhật' }}</div>
                        <div v-if="!paymentInfo.phone" class="payment-info-hint">Cập nhật để nhận tiền qua MoMo</div>
                    </div>
                </div>

                <div class="payment-info-card">
                    <div class="payment-info-icon bank">
                        <img class="icon-xl" src="\images\payment\atm.png" alt="Bank" />
                    </div>
                    <div class="payment-info-content">
                        <div class="payment-info-label">Tài khoản ngân hàng</div>
                        <div class="payment-info-value">{{ paymentInfo.bank_account || 'Chưa cập nhật' }}</div>
                        <div v-if="paymentInfo.bank_name" class="payment-info-detail">
                            <span class="bank-name">{{ paymentInfo.bank_name }}</span>
                            <span class="separator">•</span>
                            <span class="account-holder">{{ paymentInfo.account_holder }}</span>
                        </div>
                        <div v-if="!paymentInfo.bank_account" class="payment-info-hint">Cập nhật để nhận tiền qua ngân hàng</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Revenue Stats Section -->
    <div class="section-card revenue-section">
        <div class="header-wrapper">
            <div class="header-left">
                <div class="icon-wrapper">
                    <svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 3v18h18"></path>
                        <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path>
                    </svg>
                </div>
                <div class="title-wrapper">
                    <span class="title-main">Thống kê doanh thu</span>
                    <span class="sub-title">Phân tích thu chi theo thời gian</span>
                </div>
            </div>
            <div class="header-right">
                <div class="period-selector">
                    <base-select size="medium" v-model="filterPeriod" :options="periodOptions" placeholder="Khoảng thời gian" :widthFull="false" />
                </div>
            </div>
        </div>
        <div class="main-content">
            <div class="revenue-grid">
                <div class="revenue-card">
                    <div class="revenue-header">
                        <h4>Thu nhập</h4>
                        <span class="revenue-period">{{ periodOptions.find(p => p.value === filterPeriod)?.name }}</span>
                    </div>
                    <div class="revenue-amount credit">{{ revenueStats.formatted_total_credits }}</div>
                </div>

                <div class="revenue-card">
                    <div class="revenue-header">
                        <h4>Chi tiêu</h4>
                        <span class="revenue-period">{{ periodOptions.find(p => p.value === filterPeriod)?.name }}</span>
                    </div>
                    <div class="revenue-amount debit">{{ revenueStats.formatted_total_debits }}</div>
                </div>
            </div>
        </div>
    </div>

    <!-- Transaction History Section -->
    <div class="section-card transaction-section">
        <div class="header-wrapper">
            <div class="header-left">
                <div class="icon-wrapper">
                    <svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14,2 14,8 20,8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10,9 9,9 8,9"></polyline>
                    </svg>
                </div>
                <div class="title-wrapper">
                    <span class="title-main">Lịch sử giao dịch</span>
                    <span class="sub-title">Theo dõi tất cả các giao dịch của bạn</span>
                </div>
            </div>
            <div class="header-right">
                <div class="section-actions">
                    <base-input size="md" v-model="search" placeholder="Tìm kiếm giao dịch..." class="search-input">
                        <template #icon>
                            <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </template>
                    </base-input>
                    <base-select size="medium" v-model="filterType" :options="filterOptions" placeholder="Lọc theo loại" :widthFull="false" />
                </div>
            </div>
        </div>
        <div class="main-content">
            <div v-if="filteredTransactions.length === 0" class="empty-list">
                <div class="empty-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 6v6l4 2"></path>
                    </svg>
                </div>
                <h3 class="empty-title">Chưa có giao dịch nào</h3>
                <p class="empty-desc">Lịch sử giao dịch sẽ hiển thị tại đây</p>
            </div>

            <div v-else class="transaction-list">
                <div v-for="transaction in filteredTransactions" :key="transaction.id" class="transaction-card">
                    <div class="transaction-content">
                        <div v-if="transaction.commission_amount && transaction.commission_amount > 0" class="commission-breakdown">
                            <div class="commission-item">
                                <span class="commission-label">
                                    <svg class="icon-sm" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="16 18 22 12 16 6"></polyline>
                                    <polyline points="8 6 2 12 8 18"></polyline>
                                    </svg>
                                    Mã booking:
                                </span>
                                <span class="commission-value">{{ transaction.reference_id }}</span>
                            </div>

                            <div class="commission-item">
                                <span class="commission-label">
                                    <svg class="icon-sm" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="12" y1="16" x2="12" y2="12"></line>
                                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                    </svg>
                                    Số tiền gốc:
                                </span>
                                <span class="commission-value">{{ formatCurrency(transaction.gross_amount) }}</span>
                            </div>
                            <div class="commission-item commission-deduct">
                                <span class="commission-label">
                                    <svg class="icon-sm" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"></path>
                                    </svg>
                                    Hoa hồng ({{ transaction.commission_rate }}%):
                                </span>
                                <span class="commission-value deduct">-{{ formatCurrency(transaction.commission_amount) }}</span>
                            </div>
                            <div class="commission-divider"></div>
                            <div class="commission-item commission-final">
                                <span class="commission-label">
                                    <svg class="icon-sm" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                                    </svg>
                                    Bạn nhận:
                                </span>
                                <span class="commission-value final">{{ formatCurrency(transaction.amount) }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <base-pagination v-if="!isLoading" :meta="dataPaginate" :current-page="currentPage" @changePage="changePage" />
            </div>
        </div>
    </div>

    <!-- Transfer MoMo Modal -->
    <base-modal v-if="modals.withdraw" :isOpen="modals.withdraw" @close="resetModal('withdraw')" title="Chuyển tiền qua MoMo" size="medium">
        <div class="withdraw-modal">
            <div class="balance-info-card">
                <div class="balance-info-item">
                    <div class="balance-info-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3 4-3 9-3 9 1.34 9 3z"></path>
                            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5c0-1.66-4-3-9-3s-9 1.34-9 3z"></path>
                        </svg>
                    </div>
                    <div class="balance-info-content">
                        <span class="balance-info-label">Số dư hiện tại</span>
                        <span class="balance-info-value primary">{{ formatCurrency(walletStats.formatted_balance) }}</span>
                    </div>
                </div>
                <div class="balance-info-divider"></div>
                <div class="balance-info-item">
                    <div class="balance-info-icon momo">
                        <img class="icon-xl" src="\images\payment\momo-logo.png" alt="MoMo" />
                    </div>
                    <div class="balance-info-content">
                        <span class="balance-info-label">Số MoMo nhận tiền</span>
                        <span class="balance-info-value">{{ paymentInfo.phone || 'Chưa cập nhật' }}</span>
                    </div>
                </div>
            </div>

            <div class="withdraw-form">
                <div class="form-group">
                    <label class="form-label"><span>Số tiền chuyển</span><span class="required">*</span></label>
                    <div class="input-with-suffix">
                        <base-input size="md" v-model="forms.withdraw.amount" type="number" placeholder="Tối thiểu 10,000" :min="10000" :max="walletStats.balance">
                            <template #icon>
                                <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </template>
                        </base-input>
                        <span class="input-suffix">VND</span>
                    </div>
                    <span class="form-hint">Số tiền chuyển tối thiểu: 10,000 VND</span>
                </div>

                <div class="form-group">
                    <label class="form-label">Ghi chú</label>
                    <base-input size="md" v-model="forms.withdraw.note" type="textarea" placeholder="Ghi chú thêm (tùy chọn)" :rows="3"></base-input>
                </div>

                <div v-if="!paymentInfo.phone" class="withdraw-notice error">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                    <p>Bạn chưa cập nhật số điện thoại MoMo. Vui lòng cập nhật trong phần <strong>Thông tin thanh toán</strong> trước khi chuyển tiền.</p>
                </div>
            </div>

            <div class="withdraw-notice">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p>Tiền sẽ được chuyển trực tiếp vào tài khoản MoMo của bạn. Thời gian xử lý thường từ vài phút đến vài giờ.</p>
            </div>

            <div class="modal-footer">
                <button class="btn-md btn-secondary" @click="resetModal('withdraw')">Hủy</button>
                <button class="btn-md btn-primary" @click="submitWithdraw" :disabled="!canWithdraw">
                    Xác nhận chuyển tiền
                </button>
            </div>
        </div>
    </base-modal>

    <!-- Payment Info Modal -->
    <base-modal v-if="modals.paymentInfo" :isOpen="modals.paymentInfo" @close="resetModal('paymentInfo')" title="Thông tin thanh toán" size="medium">
        <div class="payment-info-modal">
            <div class="payment-info-form">
                <div class="form-section">
                    <div class="form-group">
                        <label class="form-label">Số điện thoại MoMo</label>
                        <base-input size="md" v-model="forms.paymentInfo.phone" placeholder="VD: 0325752074 hoặc +84325752074" type="tel">
                            <template #icon>
                                <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </template>
                        </base-input>
                        <span class="form-hint">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                            Số điện thoại đã đăng ký MoMo để nhận tiền
                        </span>
                    </div>
                </div>

                <div class="form-divider"></div>

                <div class="form-section">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Tên ngân hàng</label>
                            <base-input size="md" v-model="forms.paymentInfo.bank_name" placeholder="VD: Vietcombank">
                                <template #icon>
                                    <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </template>
                            </base-input>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Số tài khoản</label>
                            <base-input size="md" v-model="forms.paymentInfo.bank_account" placeholder="Nhập số tài khoản">
                                <template #icon>
                                    <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </template>
                            </base-input>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Tên chủ tài khoản</label>
                        <base-input size="md" v-model="forms.paymentInfo.account_holder" placeholder="Nhập tên chủ tài khoản">
                            <template #icon>
                                <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </template>
                        </base-input>
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn-md btn-secondary" @click="resetModal('paymentInfo')">Hủy</button>
                <button class="btn-md btn-primary" @click="submitPaymentInfo">Lưu thông tin</button>
            </div>
        </div>
    </base-modal>
</div>
</template>

<style scoped>
@import url('~/assets/css/profileNew.css');

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
}

.wallet-balance-page {
    display: grid;
    gap: 2rem;
    animation: fadeIn 0.5s ease-out;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
}

.stat-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1.25rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.stat-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(180deg, transparent 0%, currentColor 50%, transparent 100%);
    opacity: 0;
    transition: opacity 0.4s ease;
}

.stat-card:hover::before {
    opacity: 1;
}

.stat-card:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.stat-icon {
    width: 3.3rem;
    height: 3.3rem;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
}

.stat-card:hover .stat-icon {
    transform: scale(1.1) rotate(-8deg);
}

.stat-icon.credit { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
.stat-icon.debit { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
.stat-icon.pending { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
.stat-icon.count { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); }

.stat-value {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: #1f2937;
    line-height: 1;
    margin-bottom: 0.5rem;
}

.stat-label {
    font-size: var(--font-size-small);
    color: #6b7280;
    font-weight: 600;
    letter-spacing: 0.05em;
}

.revenue-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.revenue-card {
	display: grid;
	gap: 1rem;
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.revenue-card::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: currentColor;
    transform: scaleX(0);
    transition: transform 0.4s;
}

.revenue-card:hover::after { transform: scaleX(1); }
.revenue-card:hover { transform: translateY(-6px); box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15); }

.revenue-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.revenue-header h4 {
    font-size: var(--font-size-base);
    font-weight: 700;
    color: #1f2937;
    margin: 0;
}

.revenue-period {
    font-size: var(--font-size-small);
    color: #6b7280;
    background: #f3f4f6;
    padding: 0.375rem 0.9rem;
    border-radius: 1.5rem;
    font-weight: 600;
}

.revenue-amount {
    font-size: var(--font-size-heading-5);
    font-weight: 800;
    transition: all 0.3s ease;
}

.revenue-card:hover .revenue-amount { transform: scale(1.05); }

.revenue-amount.credit { color: #10b981; }
.revenue-amount.debit { color: #ef4444; }

.revenue-breakdown {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.breakdown-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #f3f4f6;
    padding-bottom: 0.75rem;
    transition: all 0.3s ease;
}

.breakdown-item:hover { border-color: currentColor; }
.breakdown-item:last-child { border-bottom: none; }

.category {
    font-size: var(--font-size-small);
    color: #6b7280;
    font-weight: 600;
}

.amount {
    font-weight: 700;
    color: #1f2937;
}

.section-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.search-input { min-width: 300px; }

.empty-list {
    text-align: center;
    padding: 4rem 2rem;
    color: #6b7280;
    background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
    border-radius: 16px;
    border: 2px dashed #d1d5db;
}

.empty-icon { margin-bottom: 1.5rem; display: flex; justify-content: center; opacity: 0.6; }
.empty-title { font-size: 1.5rem; font-weight: 700; color: #374151; margin: 0 0 0.75rem 0; }
.empty-desc { font-size: 1rem; color: #6b7280; margin: 0; font-weight: 500; }

.transaction-list { display: grid; gap: 1rem; }

.transaction-icon {
    width: 50px;
    height: 50px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;
}

.transaction-content:hover .transaction-icon { transform: scale(1.1) rotate(-8deg); }

.transaction-icon.transaction-credit { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
.transaction-icon.transaction-debit { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
.transaction-icon.transaction-pending { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }

.transaction-content { flex: 1; min-width: 0; }

.transaction-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
}

.transaction-title {
    font-size: 0.9375rem;
    font-weight: 500;
    color: #1f2937;
    margin: 0;
}

.transaction-amount {
    font-size: 0.9375rem;
    font-weight: 600;
    transition: all 0.3s ease;
    flex-shrink: 0;
}

.transaction-amount.transaction-credit { color: #10b981; }
.transaction-amount.transaction-debit { color: #ef4444; }
.transaction-amount.transaction-pending { color: #f59e0b; }

.transaction-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: var(--font-size-small);
    color: #6b7280;
    flex-wrap: wrap;
}

.transaction-date { font-weight: 500; }

.transaction-title-wrapper {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.25rem 0.625rem;
    border-radius: 1rem;
    font-size: var(--font-size-small);
    font-weight: 600;
    text-transform: uppercase;
}

.status-badge.status-pending {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    color: #92400e;
    border: 1px solid #fbbf24;
}

.status-badge svg { animation: pulse 2s ease-in-out infinite; }

.payment-info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
}

.payment-info-card {
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 16px;
    padding: 1.75rem;
    display: flex;
    align-items: flex-start;
    gap: 1.25rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.payment-info-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: currentColor;
    transform: scaleY(0);
    transition: transform 0.4s;
}

.payment-info-card:hover::before { transform: scaleY(1); }
.payment-info-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12); }

.payment-info-icon {
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;
}

.payment-info-card:hover .payment-info-icon { transform: scale(1.1) rotate(-8deg); }

.payment-info-icon.momo img,
.payment-info-icon.bank img {
    width: 80%;
    height: 80%;
    object-fit: contain;
}

.payment-info-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
}

.payment-info-label {
    font-size: var(--font-size-small);
    color: #6b7280;
    font-weight: 600;
}

.payment-info-value {
    font-size: var(--font-size-small);
    font-weight: 600;
    color: #1f2937;
    word-break: break-all;
}

.payment-info-hint {
    font-size: var(--font-size-small);
    color: #9ca3af;
    font-style: italic;
}

.payment-info-detail {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: var(--font-size-small);
    color: #6b7280;
}

.bank-name { font-weight: 600; color: #374151; }
.account-holder { font-weight: 500; }

.payment-info-modal { display: grid; gap: 1.5rem; }

.info-notice {
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    border: 1px solid #93c5fd;
    border-radius: 10px;
    padding: 1rem;
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
}

.info-notice svg { flex-shrink: 0; color: #2563eb; }
.info-notice p { margin: 0; color: #1e40af; font-size: var(--font-size-small); line-height: 1.5; font-weight: 500; }

.payment-info-form { display: grid; gap: 1.5rem; }

.form-section { display: grid; gap: 1rem; }

.form-section-title {
    font-size: 1rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid #f3f4f6;
}

.form-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, #e5e7eb 50%, transparent 100%);
}

.form-group { display: grid; gap: 0.5rem; }

.form-label {
    font-size: var(--font-size-small);
    font-weight: 600;
    color: #374151;
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.required { color: #ef4444; font-weight: 700; }

.form-hint {
    font-size: var(--font-size-small);
    color: #6b7280;
    font-weight: 400;
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.withdraw-modal { display: grid; gap: 1.5rem; }

.balance-info-card {
    display: flex;
    gap: 1.5rem;
    border: 1px solid var(--gray-200);
    border-radius: 12px;
    padding: 1rem;
}

.balance-info-item {
    flex: 1;
    display: flex;
    align-items: center;
    gap: var(--font-size-small);
}

.balance-info-icon {
    width: 40px;
    height: 40px;
    background: white;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #667eea;
    flex-shrink: 0;
}

.balance-info-icon img { width: 100%; height: 100%; object-fit: contain; }

.balance-info-content { display: flex; flex-direction: column; gap: 0.1rem; }

.balance-info-label {
    font-size: var(--font-size-small);
    color: #6b7280;
    font-weight: 500;
}

.balance-info-value {
    font-size: 1rem;
    font-weight: 400;
    color: #1f2937;
}

.balance-info-value.primary { font-weight: 700; color: #667eea; }

.balance-info-divider { width: 1px; background: #c7d2fe; }

.withdraw-form { display: grid; gap: 1.25rem; }

.input-with-suffix {
    position: relative;
}

.input-suffix {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: var(--font-size-small);
    font-weight: 600;
    color: #6b7280;
    pointer-events: none;
}

.withdraw-notice {
    background: #fef3c7;
    border: 1px solid #fde68a;
    border-radius: 10px;
    padding: 1rem;
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
}

.withdraw-notice svg { flex-shrink: 0; color: #f59e0b; }

.withdraw-notice p {
    margin: 0;
    color: #92400e;
    font-size: 0.8125rem;
    line-height: 1.5;
    font-weight: 400;
}

.withdraw-notice.error {
    background: #fee2e2;
    border: 1px solid #fca5a5;
}

.withdraw-notice.error svg { color: #dc2626; }
.withdraw-notice.error p { color: #991b1b; }

@media (max-width: 1024px) {
    .stats-grid { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
    .revenue-grid { grid-template-columns: 1fr; }
    .form-row { grid-template-columns: 1fr; }
    .payment-info-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
    .wallet-balance-page { gap: 1.5rem; }
    .stats-grid { grid-template-columns: 1fr; gap: 1.25rem; }
    .revenue-grid { grid-template-columns: 1fr; gap: 1.5rem; }
    .section-actions { width: 100%; flex-direction: column; }
    .search-input { min-width: auto; width: 100%; }
    .transaction-header { flex-direction: column; align-items: flex-start; width: 100%; }
    .balance-info-card { flex-direction: column; gap: 1rem; }
    .balance-info-divider { width: 100%; height: 1px; }
}

@media (max-width: 480px) {
    .empty-list { padding: 3rem 1.5rem; }
    .empty-title { font-size: 1.25rem; }
}

/* Commission Breakdown Styles */
.commission-breakdown {
    margin-top: 1rem;
    padding: 1rem;
    background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    display: grid;
    gap: 0.625rem;
}

.commission-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: var(--font-size-small);
    transition: all 0.3s ease;
}

.commission-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #6b7280;
    font-weight: 500;
}

.commission-label svg {
    flex-shrink: 0;
    color: #9ca3af;
}

.commission-value {
    font-weight: 600;
    color: #1f2937;
}

.commission-item.commission-deduct .commission-label {
    color: #dc2626;
}

.commission-item.commission-deduct .commission-label svg {
    color: #dc2626;
}

.commission-value.deduct {
    color: #dc2626;
    font-weight: 700;
}

.commission-item.commission-final {
    padding-top: 0.625rem;
}

.commission-item.commission-final .commission-label {
    color: #059669;
    font-weight: 600;
}

.commission-item.commission-final .commission-label svg {
    color: #10b981;
}

.commission-value.final {
    color: #059669;
    font-weight: 700;
    font-size: 0.9375rem;
}

.commission-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, #d1d5db 50%, transparent 100%);
    margin: 0.25rem 0;
}

.transaction-id {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.625rem;
    background: #f3f4f6;
    border-radius: 0.5rem;
    font-size: 0.75rem;
    font-weight: 500;
    color: #6b7280;
}

.transaction-id svg {
    flex-shrink: 0;
}

/* Hover effects for commission breakdown */
.commission-item:hover {
    transform: translateX(2px);
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .commission-breakdown {
        padding: var(--font-size-small);
        gap: 0.5rem;
    }

    .commission-item {
        font-size: 0.8125rem;
    }

    .commission-label svg {
        width: 12px;
        height: 12px;
    }

    .transaction-id {
        font-size: 0.6875rem;
        padding: 0.1875rem 0.5rem;
    }
}

</style>
