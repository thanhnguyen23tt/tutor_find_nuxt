import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
	state: () => {
		return {
			userData: {},
			authReady: false,
			unreadData: {
				messages: 0,
				pending_booking: 0,
				notifications: 0,
				schedule: 0,
				recheduled_bookings: 0,
			},
		};
	},

	getters: {
		// Lấy userData trực tiếp từ state
		getUserData: (state) => state.userData,

		getUnreadData: (state) => state.unreadData,

		isAuthenticated(state) {
			return !!state.userData && Object.keys(state.userData).length > 0;
		},
	},

	actions: {
		setUserData(payload) {
			this.userData = payload || {};
		},

		setAuthReady(status) {
			this.authReady = typeof status === 'boolean' ? status : true;
		},

		setAuth(payload) {
			this.setUserData(payload.user || {});
			this.setAuthReady(true);
		},

		clearAuth() {
			this.setUserData({});
			this.setAuthReady(false);
		},

		setUnreadData(payload) {
			this.unreadData = payload || {
				messages: 0,
				pending_booking: 0,
				notifications: 0,
				schedule: 0,
				recheduled_bookings: 0,
			};
		},
	},
});
