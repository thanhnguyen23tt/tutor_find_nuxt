<template>
	<div class="message-skeleton-container">
		<div v-for="i in count" :key="i" class="message-row" :class="{ me: i % 3 === 0 }">
			<div v-if="i % 3 !== 0" class="avatar-wrapper">
				<div class="skeleton-avatar"></div>
			</div>
			<div class="message-wrapper">
				<div class="message-meta" v-if="i % 3 !== 0">
					<span class="skeleton-text skeleton-name"></span>
					<span class="skeleton-text skeleton-time"></span>
				</div>
				<div class="msg-bubble skeleton-bubble">
					<div class="skeleton-text skeleton-content" :style="{ width: getRandomWidth() }"></div>
				</div>
				<div class="message-meta-me" v-if="i % 3 === 0">
					<span class="skeleton-text skeleton-time"></span>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
defineProps({
	count: {
		type: Number,
		default: 5
	}
});

const getRandomWidth = () => {
	const widths = ['150px', '200px', '250px', '180px', '220px'];
	return widths[Math.floor(Math.random() * widths.length)];
};
</script>

<style scoped>
.avatar-wrapper {
	margin-right: 8px;
}

.skeleton-avatar {
	width: 36px;
	height: 36px;
	border-radius: 50%;
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
	background-size: 200% 100%;
	animation: loading 1.5s infinite;
}

.skeleton-text {
	display: inline-block;
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
	background-size: 200% 100%;
	animation: loading 1.5s infinite;
	border-radius: 4px;
	height: 14px;
}

.skeleton-name {
	width: 100px;
	margin-right: 8px;
}

.skeleton-time {
	width: 60px;
}

.skeleton-content {
	height: 16px;
}

.skeleton-bubble {
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%) !important;
	background-size: 200% 100% !important;
	animation: loading 1.5s infinite;
	min-height: 40px;
	display: flex;
	align-items: center;
}

@keyframes loading {
	0% {
		background-position: 200% 0;
	}
	100% {
		background-position: -200% 0;
	}
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
	.skeleton-text,
	.skeleton-bubble {
		background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%) !important;
		background-size: 200% 100% !important;
	}
}
</style>
