import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

export default defineNuxtPlugin(() => {
	if (process.client && typeof window !== 'undefined') {
		const config = useRuntimeConfig();
		const authCookie = useAuthCookie();

		// Set up Pusher
		(window as any).Pusher = Pusher;

		// Get token from auth cookie
		const token = authCookie.getToken() || '';

		// Set up Echo
		(window as any).Echo = new Echo({
			broadcaster: 'pusher',
			key: config.public.pusherAppKey,
			cluster: config.public.pusherAppCluster,
			forceTLS: true,
			disableStats: true,
			enabledTransports: ['ws', 'wss'],
			withCredentials: true,
			authEndpoint: `${config.public.apiUrl}/broadcasting/auth`,
			auth: {
				headers: {
					'Authorization': `Bearer ${token}`,
				},
			},
		});
	}
});

