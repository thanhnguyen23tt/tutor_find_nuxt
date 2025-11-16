import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
	state: () => {
		return {
			token: '',
			userData: {},
			unreadData: {
				messages: 0,
				pending_booking: 0,
				notifications: 0,
				schedule: 0,
				recheduled_bookings: 0,
			},
			notifications: [],
		};
	},

	getters: {
		// Lấy userData trực tiếp từ state
		getUserData: (state) => state.userData,

		// Lấy token từ state (cookie được sync vào state qua actions)
		getToken: (state) => state.token,

		getNnotifications: (state) => state.notifications,

		getUnreadData: (state) => state.unreadData,

		isAuthenticated(state) {
			if (state.token) return true;
			
			if (process.client) {
				try {
					const { hasToken } = useAuthCookie();
					return hasToken();
				} catch {
					return false;
				}
			}
			return false;
		},
	},

	actions: {
		setUserData(payload) {
			this.userData = payload || {};
		},

		setToken(payload) {
			this.token = payload || '';
			const { setToken } = useAuthCookie();
			setToken(payload || null);
		},

		setAuth(payload) {
			this.setToken(payload.token || ''); 
			this.setUserData(payload.user || {});
		},

		clearAuth() {
			this.setToken('');
			this.setUserData({});
			const { removeToken } = useAuthCookie();
			removeToken();
		},

		setNotifications(payload) {
			this.notifications = payload || [];
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
