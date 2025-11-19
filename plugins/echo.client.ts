import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

export default defineNuxtPlugin(() => {
	if (process.client && typeof window !== 'undefined') {
		const config = useRuntimeConfig();

		// Set up Pusher
		(window as any).Pusher = Pusher;

		const xsrfCookie = useCookie('XSRF-TOKEN');
		const csrfToken = xsrfCookie.value ? decodeURIComponent(xsrfCookie.value) : '';

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
					'X-XSRF-TOKEN': csrfToken,
				},
			},
		});
	}
});

