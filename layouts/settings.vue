<script setup>
const router = useRouter();

const goHome = () => {
	router.push('/profile');
};
</script>

<template>
	<div class="settings-page">
		<!-- Header -->
		<header class="settings-header">
			<div class="header-container container">
				<div class="logo" @click="goHome">
					<Logo />
				</div>
				<button class="btn-done" @click="goHome">Hoàn tất</button>
			</div>
		</header>

		<!-- Slot chứa nội dung chi tiết từ page -->
		<slot />
	</div>
</template>

<style scoped>
.settings-page {
	min-height: 100vh;
	background: #fff;
	color: #222;
}

/* Header */
.settings-header {
	height: 80px;
	border-bottom: 1px solid #ebebeb;
	display: flex;
	align-items: center;
	position: sticky;
	top: 0;
	background: #fff;
	z-index: 100;
}

.header-container {
	width: 100%;
	margin: 0 auto;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.logo {
	cursor: pointer;
	color: #ff385c;
}

.btn-done {
	background: #f7f7f7;
	border: 1px solid transparent;
	border-radius: 24px;
	color: #222;
	cursor: pointer;
	font-size: 14px;
	font-weight: 600;
	padding: 10px 20px;
	transition: all 0.2s;
}

.btn-done:hover {
	background: #f1f1f1;
	border-color: #000;
}
</style>
