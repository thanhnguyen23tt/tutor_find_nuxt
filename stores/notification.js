import { defineStore } from 'pinia';

export const useNotificationStore = defineStore('notification', {
	state: () => ({
		showNotification: {
			show: false,
			message: '',
			type: 'error',
		},
		notificationQueue: [], // Array to hold multiple notifications
		hiddenNotificationPreview: false,
		hiddenFooter: false,
	}),

	getters: {
		getShowNotification: (state) => state.showNotification,
		getNotificationQueue: (state) => state.notificationQueue,
		isNotificationPreviewHidden: (state) => state.hiddenNotificationPreview,
		isFooterHidden: (state) => state.hiddenFooter,
	},

	actions: {
		setShowNotification(payload) {
			this.showNotification = payload;
		},

		addNotificationToQueue(payload) {
			this.notificationQueue.push(payload);
		},

		removeNotificationFromQueue(id) {
			this.notificationQueue = this.notificationQueue.filter(n => n.id !== id);
		},

		setHiddenNotificationPreview(payload) {
			this.hiddenNotificationPreview = payload;
		},

		setHiddenFooter(payload) {
			this.hiddenFooter = payload;
		},
	},
});

