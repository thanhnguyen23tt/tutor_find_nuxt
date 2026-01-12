import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app';
import { initSocket, getSocket } from '../composables/useSocket';
import { useAuthCookie } from '../composables/useAuthCookie';

export default defineNuxtPlugin(async (nuxtApp) => {
	if (process.client && typeof window !== 'undefined') {
		const config = useRuntimeConfig();
		const authCookie = useAuthCookie();

		// Get token from auth cookie
		const token = authCookie.getToken();

		if (token) {
			try {
				// Initialize Socket.IO connection
				const realtimeUrl = config.public.realtimeUrl;
				
				await initSocket({
					url: realtimeUrl,
					token: token,
					autoConnect: true
				});

				console.log('✅ Socket.IO plugin initialized');

				// Join chat room automatically
				const socket = getSocket();
				if (socket) {
					socket.emit('chat:join');
				}
			} catch (error) {
				console.error('Failed to initialize Socket.IO:', error);
			}
		}
	}
});
