<template>
	<div class="callback-container">
		<div class="loading-spinner">
			<div class="spinner"></div>
			<p>Đang xử lý đăng nhập Google...</p>
		</div>
	</div>
</template>

<script setup>
definePageMeta({
	layout: 'auth',
	middleware: 'guest'
});

const { handleOAuthCallback } = useAuth();
const { error: notifyError } = useNotification();

onMounted(async () => {
	try {
		// Get query params from backend OAuth redirect
		const urlParams = new URLSearchParams(window.location.search);

		// Handle OAuth callback using composable
		const user = await handleOAuthCallback('google', urlParams);

		if (user) {
			// Redirect to home on success
		return navigateTo('/');
		}
	} catch (error) {
		console.error('Google OAuth error:', error);
		notifyError(error.message || 'Đăng nhập Google thất bại. Vui lòng thử lại.');
		
		setTimeout(() => {
		return navigateTo('/auth/login');
		}, 2000);
	}
});
</script>

<style scoped>
.callback-container {
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 100vh;
	background: #fcfcfc;
}

.loading-spinner {
	text-align: center;
}

.spinner {
	width: 50px;
	height: 50px;
	border: 4px solid #f3f4f6;
	border-top: 4px solid #000;
	border-radius: 50%;
	animation: spin 1s linear infinite;
	margin: 0 auto 1rem;
}

@keyframes spin {
	0% {
		transform: rotate(0deg);
	}

	100% {
		transform: rotate(360deg);
	}
}

.loading-spinner p {
	color: #374151;
	font-size: var(--font-size-base);
}
</style>
