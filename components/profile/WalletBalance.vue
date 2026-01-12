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

const changePage = (page) => {
	currentPage.value = page;
	loadTransactions();
};

// ============================================
// EMITS & WATCHERS
// ============================================
const emit = defineEmits(['update-data']);

watch(filterPeriod, loadRevenueStats);
watch(() => props.userDataDetail, { deep: true, immediate: true });

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
						<svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
							viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
							stroke-linecap="round" stroke-linejoin="round">
							<path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3 4-3 9-3 9 1.34 9 3z"></path>
							<path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5c0-1.66-4-3-9-3s-9 1.34-9 3z"></path>
						</svg>
					</div>
					<div class="title-wrapper">
						<span class="title-main">Số dư ví</span>
						<span class="sub-title">Quản lý số dư và lịch sử giao dịch của bạn</span>
					</div>
				</div>
			</div>
			<div class="main-content">
				<div class="balance-overview">
					<div class="stats-grid">
						<div class="stat-card">
							<div class="stat-icon count">
								<svg class="icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
									stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<path
										d="M9 11H5a2 2 0 0 0-2 2v3c0 1.1.9 2 2 2h4m0-7v7m0-7h4m-4 0h4m-4 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2">
									</path>
								</svg>
							</div>
							<div class="stat-content">
								<div class="stat-value">{{ formatCurrency(walletStats.formatted_balance) }}</div>
								<div class="stat-label">Số dư hiện tại</div>
							</div>
						</div>

						<div class="stat-card">
							<div class="stat-icon credit">
								<svg class="icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
									stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<path
										d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z">
									</path>
								</svg>
							</div>
							<div class="stat-content">
								<div class="stat-value">{{ formatCurrency(walletStats.total_credits) }}</div>
								<div class="stat-label">Tổng thu nhập</div>
							</div>
						</div>

						<div class="stat-card">
							<div class="stat-icon debit">
								<svg class="icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
									stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<path
										d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z">
									</path>
								</svg>
							</div>
							<div class="stat-content">
								<div class="stat-value">{{ formatCurrency(walletStats.total_debits) }}</div>
								<div class="stat-label">Tổng rút tiền</div>
							</div>
						</div>

						<div class="stat-card">
							<div class="stat-icon pending">
								<svg class="icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
									stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

		<!-- Revenue Stats Section -->
		<div class="section-card revenue-section">
			<div class="header-wrapper">
				<div class="header-left">
					<div class="icon-wrapper">
						<svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
							viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
							stroke-linecap="round" stroke-linejoin="round">
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
						<base-select size="medium" v-model="filterPeriod" :options="periodOptions"
							placeholder="Khoảng thời gian" />
					</div>
				</div>
			</div>
			<div class="main-content">
				<div class="revenue-grid">
					<div class="revenue-card">
						<div class="revenue-header">
							<h4>Thu nhập</h4>
							<span class="revenue-period">{{periodOptions.find(p => p.value === filterPeriod)?.name
								}}</span>
						</div>
						<div class="revenue-amount credit">{{ formatCurrency(revenueStats.formatted_total_credits) }}</div>
					</div>

					<div class="revenue-card">
						<div class="revenue-header">
							<h4>Chi tiêu</h4>
							<span class="revenue-period">{{periodOptions.find(p => p.value === filterPeriod)?.name
								}}</span>
						</div>
						<div class="revenue-amount debit">{{ formatCurrency(revenueStats.formatted_total_debits) }}</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Transaction History Section -->
		<div class="section-card transaction-section">
			<div class="header-wrapper">
				<div class="header-left">
					<div class="icon-wrapper">
						<svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
							viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
							stroke-linecap="round" stroke-linejoin="round">
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
						<base-input size="md" v-model="search" placeholder="Tìm kiếm giao dịch..." class="search-input"></base-input>
						<base-select size="medium" v-model="filterType" :options="filterOptions"
							placeholder="Lọc theo loại" :widthFull="false" />
					</div>
				</div>
			</div>
			<div class="main-content">
				<div v-if="filteredTransactions.length === 0" class="empty-list">
					<div class="empty-icon">
						<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5"
							stroke-linecap="round" stroke-linejoin="round">
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
							<div v-if="transaction.commission_amount && transaction.commission_amount > 0"
								class="commission-breakdown">
								<div class="commission-item">
									<span class="commission-label">
										<svg class="icon-sm" width="14" height="14" viewBox="0 0 24 24" fill="none"
											stroke="currentColor" stroke-width="2" stroke-linecap="round"
											stroke-linejoin="round">
											<polyline points="16 18 22 12 16 6"></polyline>
											<polyline points="8 6 2 12 8 18"></polyline>
										</svg>
										Mã booking:
									</span>
									<span class="commission-value">{{ transaction.reference_id }}</span>
								</div>

								<div class="commission-item">
									<span class="commission-label">
										<svg class="icon-sm" width="14" height="14" viewBox="0 0 24 24" fill="none"
											stroke="currentColor" stroke-width="2">
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
										<svg class="icon-sm" width="14" height="14" viewBox="0 0 24 24" fill="none"
											stroke="currentColor" stroke-width="2">
											<path
												d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z">
											</path>
										</svg>
										Hoa hồng ({{ transaction.commission_rate }}%):
									</span>
									<span class="commission-value deduct">-{{
										formatCurrency(transaction.commission_amount)
										}}</span>
								</div>
								<div class="commission-divider"></div>
								<div class="commission-item commission-final">
									<span class="commission-label">
										<svg class="icon-sm" width="14" height="14" viewBox="0 0 24 24" fill="none"
											stroke="currentColor" stroke-width="2">
											<path
												d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z">
											</path>
										</svg>
										Bạn nhận:
									</span>
									<span class="commission-value final">{{ formatCurrency(transaction.amount) }}</span>
								</div>
							</div>
						</div>
					</div>

					<base-pagination v-if="!isLoading" :meta="dataPaginate" :current-page="currentPage"
						@changePage="changePage" />
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
@import url('~/assets/css/profileNew.css');

@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(10px);
	}

	to {
		opacity: 1;
		transform: translateY(0);
	}
}

@keyframes slideIn {
	from {
		opacity: 0;
		transform: translateX(-20px);
	}

	to {
		opacity: 1;
		transform: translateX(0);
	}
}

@keyframes pulse {

	0%,
	100% {
		opacity: 1;
	}

	50% {
		opacity: 0.8;
	}
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
	padding: 1.3rem;
	display: flex;
	align-items: center;
	gap: 1rem;
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
	width: 2.8rem;
	height: 2.8rem;
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

.stat-icon.credit {
	background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.stat-icon.debit {
	background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.stat-icon.pending {
	background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.stat-icon.count {
	background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

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

.revenue-card:hover::after {
	transform: scaleX(1);
}

.revenue-card:hover {
	transform: translateY(-6px);
	box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
}

.revenue-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.revenue-header h4 {
	font-size: var(--font-size-heading-5);
	font-weight: 600;
	color: #1f2937;
	margin: 0;
}

.revenue-period {
	font-size: var(--font-size-mini);
	color: #6b7280;
	background: #f3f4f6;
	padding: 0.375rem 0.9rem;
	border-radius: 1.5rem;
}

.revenue-amount {
	font-size: var(--font-size-base);
	font-weight: 600;
	transition: all 0.3s ease;
}

.revenue-card:hover .revenue-amount {
	transform: scale(1.05);
}

.revenue-amount.credit {
	color: #10b981;
}

.revenue-amount.debit {
	color: #ef4444;
}

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

.breakdown-item:hover {
	border-color: currentColor;
}

.breakdown-item:last-child {
	border-bottom: none;
}

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

.search-input {
	min-width: 300px;
}

.empty-list {
	text-align: center;
	padding: 4rem 2rem;
	color: #6b7280;
	background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
	border-radius: 16px;
	border: 2px dashed #d1d5db;
}

.empty-icon {
	margin-bottom: 1.5rem;
	display: flex;
	justify-content: center;
	opacity: 0.6;
}

.empty-title {
	font-size: 1.5rem;
	font-weight: 700;
	color: #374151;
	margin: 0 0 0.75rem 0;
}

.empty-desc {
	font-size: var(--font-size-base);
	color: #6b7280;
	margin: 0;
	font-weight: 500;
}

.transaction-list {
	display: grid;
	gap: 1rem;
}

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

.transaction-content:hover .transaction-icon {
	transform: scale(1.1) rotate(-8deg);
}

.transaction-icon.transaction-credit {
	background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.transaction-icon.transaction-debit {
	background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.transaction-icon.transaction-pending {
	background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.transaction-content {
	flex: 1;
	min-width: 0;
}

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

.transaction-amount.transaction-credit {
	color: #10b981;
}

.transaction-amount.transaction-debit {
	color: #ef4444;
}

.transaction-amount.transaction-pending {
	color: #f59e0b;
}

.transaction-meta {
	display: flex;
	align-items: center;
	gap: 1rem;
	font-size: var(--font-size-small);
	color: #6b7280;
	flex-wrap: wrap;
}

.transaction-date {
	font-weight: 500;
}

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

.status-badge svg {
	animation: pulse 2s ease-in-out infinite;
}

.bank-name {
	font-weight: 600;
	color: #374151;
}

.account-holder {
	font-weight: 500;
}

.payment-info-modal {
	display: grid;
	gap: 1.5rem;
}

.info-notice {
	background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
	border: 1px solid #93c5fd;
	border-radius: 10px;
	padding: 1rem;
	display: flex;
	align-items: flex-start;
	gap: 0.75rem;
}

.info-notice svg {
	flex-shrink: 0;
	color: #2563eb;
}

.info-notice p {
	margin: 0;
	color: #1e40af;
	font-size: var(--font-size-small);
	line-height: 1.5;
	font-weight: 500;
}

.payment-info-form {
	display: grid;
	gap: 1.5rem;
}

.form-section {
	display: grid;
	gap: 1rem;
}

.form-section-title {
	font-size: var(--font-size-base);
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

.form-group {
	display: grid;
	gap: 0.5rem;
}

.form-label {
	font-size: var(--font-size-small);
	font-weight: 600;
	color: #374151;
	display: flex;
	align-items: center;
	gap: 0.25rem;
}

.required {
	color: #ef4444;
	font-weight: 700;
}

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

.withdraw-modal {
	display: grid;
	gap: 1.5rem;
}

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

.balance-info-icon img {
	width: 100%;
	height: 100%;
	object-fit: contain;
}

.balance-info-content {
	display: flex;
	flex-direction: column;
	gap: 0.1rem;
}

.balance-info-label {
	font-size: var(--font-size-small);
	color: #6b7280;
	font-weight: 500;
}

.balance-info-value {
	font-size: var(--font-size-base);
	font-weight: 400;
	color: #1f2937;
}

.balance-info-value.primary {
	font-weight: 700;
	color: #667eea;
}

.balance-info-divider {
	width: 1px;
	background: #c7d2fe;
}

.withdraw-form {
	display: grid;
	gap: 1.25rem;
}

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

.withdraw-notice svg {
	flex-shrink: 0;
	color: #f59e0b;
}

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

.withdraw-notice.error svg {
	color: #dc2626;
}

.withdraw-notice.error p {
	color: #991b1b;
}

@media (max-width: 1024px) {
	.stats-grid {
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
	}

	.revenue-grid {
		grid-template-columns: 1fr;
	}

	.form-row {
		grid-template-columns: 1fr;
	}

	.payment-info-grid {
		grid-template-columns: 1fr;
	}
}

@media (max-width: 768px) {
	.wallet-balance-page {
		gap: 1.5rem;
	}

	.stats-grid {
		grid-template-columns: 1fr;
		gap: 1.25rem;
	}

	.revenue-grid {
		grid-template-columns: 1fr;
		gap: 1.5rem;
	}

	.section-actions {
		width: 100%;
		flex-direction: column;
	}

	.search-input {
		min-width: auto;
		width: 100%;
	}

	.transaction-header {
		flex-direction: column;
		align-items: flex-start;
		width: 100%;
	}

	.balance-info-card {
		flex-direction: column;
		gap: 1rem;
	}

	.balance-info-divider {
		width: 100%;
		height: 1px;
	}
}

@media (max-width: 480px) {
	.empty-list {
		padding: 3rem 1.5rem;
	}

	.empty-title {
		font-size: 1.25rem;
	}
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
