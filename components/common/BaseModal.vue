<template>
	<div v-if="isOpen" class="modal-overlay" @click="noClose ? null : emit('close')">
		<div class="modal-container" :class="sizeClass" @click.stop>
			<div class="modal-content-wrapper format-scrollbar">
				<div class="modal-header" v-if="header">
					<button class="close-button" @click="emit('close')" v-if="!noClose">
						<svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
								d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
					<div class="modal-title-container">
						<h2 class="modal-title" v-if="title">{{ title }}</h2>
						<p v-if="description" class="modal-description">{{ description }}</p>
					</div>
				</div>
				<!-- <div class="separation"></div> -->
				<div class="modal-content" :class="{ 'padding-body': paddingBody }">
					<slot></slot>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import {
	computed
} from 'vue';

const props = defineProps({
	isOpen: {
		type: Boolean,
		required: true
	},
	title: {
		type: String,
		required: true
	},
	description: {
		type: String,
		default: ''
	},
	size: {
		type: String,
		default: 'medium'
	},
	header: {
		type: Boolean,
		default: true
	},
	paddingBody: {
		type: Boolean,
		default: true
	},
	noClose: {
		type: Boolean,
		default: false
	}
});

const emit = defineEmits(['close']);

const sizeClass = computed(() => {
	return {
		'max-w-sm': props.size === 'small',
		'max-w-md': props.size === 'medium',
		'max-w-lg': props.size === 'large',
		'max-w-xl': props.size === 'xl'
	};
});
</script>

<style scoped>
.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.4) 100%);
	backdrop-filter: blur(8px);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
	animation: overlayFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-container {
	background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
	border-radius: 24px;
	width: 100%;
	max-width: 480px;
	margin: 16px;
	overflow: hidden;
	box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 12px 24px -8px rgba(0, 0, 0, 0.15);
	border: 1px solid rgba(255, 255, 255, 0.2);
	animation: modalSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	position: relative;
}

/* .modal-container::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 4px;
	background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
	border-radius: 24px 24px 0 0;
} */

.modal-content-wrapper {
	max-height: 90vh;
	overflow-y: auto;
}

.modal-header,
.modal-content.padding-body {
	padding: 1.7rem 2rem;
}

.modal-header {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	position: relative;
	background: #ffffff;
	border-bottom: none;
	padding-bottom: 0.5rem;
}

.modal-title-container {
	text-align: left;
	width: 100%;
	margin-top: 1rem;
}

.modal-title {
	font-size: var(--font-size-heading-4);
	line-height: 1.3;
	font-weight: 600;
	color: #1e293b;
	margin: 0;
}

.modal-description {
	font-size: var(--font-size-base);
	color: #64748b;
	text-align: left;
	font-weight: 400;
	line-height: 1.5;
	margin: 0;
}

.close-button {
	background: transparent;
	border: none;
	color: #1e293b;
	cursor: pointer;
	padding: 0;
	transition: all 0.2s ease;
	position: relative;
	border-radius: 50%;
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: none;
	margin-left: -8px; /* Align with padding */
}

.close-button:hover {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    transform: scale(1.1) rotate(90deg);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.close-button:active {
    transform: scale(0.95) rotate(90deg);
}

.max-w-sm {
	max-width: 520px !important;
}

.max-w-md {
	max-width: 680px !important;
}

.max-w-lg {
	max-width: 820px !important;
}

.max-w-xl {
	max-width: 980px !important;
}

.separation {
	margin: 1.5rem 0;
	height: 1px;
	background: linear-gradient(90deg, transparent 0%, rgba(226, 232, 240, 0.8) 50%, transparent 100%);
}

@media (max-width: 868px) {
	.modal-title {
		font-size: var(--font-size-heading-5);
	}

	.modal-container {
		padding: 0;
		margin: 8px;
		max-height: calc(100vh - 16px);
		border-radius: 20px;
	}

	.modal-header,
	.modal-content.padding-body {
		padding: 1.5rem;
	}
}

@media (max-width: 640px) {
	.modal-container {
		padding: 0;
		margin: 0;
		max-height: 100vh;
		width: 100%;
		height: 100%;
		border-radius: 0;
	}

	.modal-container::before {
		border-radius: 0;
	}

	.modal-header,
	.modal-content.padding-body {
		padding: 1.25rem;
	}

	.modal-title {
		font-size: var(--font-size-heading-5);
	}
}

@keyframes overlayFadeIn {
	from {
		opacity: 0;
		backdrop-filter: blur(0px);
	}

	to {
		opacity: 1;
		backdrop-filter: blur(8px);
	}
}

@keyframes modalSlideIn {
	from {
		transform: translateY(-40px) scale(0.95);
		opacity: 0;
	}

	to {
		transform: translateY(0) scale(1);
		opacity: 1;
	}
}

/* Thêm hiệu ứng cho nội dung modal */
.modal-content {
	animation: contentFadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both;
	/* background: white; */
}

@keyframes contentFadeIn {
	from {
		opacity: 0;
		transform: translateY(20px);
	}

	to {
		opacity: 1;
		transform: translateY(0);
	}
}
</style>
