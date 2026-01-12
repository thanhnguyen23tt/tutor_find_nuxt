<template>
	<div class="conversation-item skeleton-item">
		<div class="avatar-container">
			<div class="avatar skeleton"></div>
		</div>
		<div class="conv-info">
			<div class="conv-header">
				<span class="conv-name skeleton-text skeleton-text-name"></span>
				<span class="conv-date skeleton-text skeleton-text-date"></span>
			</div>
			<div class="conv-preview">
				<span class="conv-last-msg skeleton-text skeleton-text-message"></span>
			</div>
		</div>
	</div>
</template>

<style scoped>
.avatar-container {
	margin-right: 8px;
}

.avatar {
	width: 56px;
	height: 56px;
	border-radius: 50%;
}

.skeleton-item {
	pointer-events: none;
}

.skeleton {
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
	background-size: 200% 100%;
	animation: loading 1.5s infinite;
	border-radius: 50%;
}

.skeleton-text {
	width: 100%;
	display: inline-block;
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
	background-size: 200% 100%;
	animation: loading 1.5s infinite;
	border-radius: 4px;
	height: 20px;
}

.skeleton-text-name {
	width: 70%;
}

.skeleton-text-date {
	width: 30%;
}

.skeleton-text-message {
	width: 100%;
	margin-top: 4px;
}

.conv-info {
	width: 100%;
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
	.skeleton,
	.skeleton-text {
		background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
		background-size: 200% 100%;
	}
}
</style>
