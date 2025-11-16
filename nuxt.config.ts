// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	ssr: true,
	compatibilityDate: '2024-04-03',
	devtools: { enabled: true },
	experimental: {
		appManifest: true
	},

	components: [
		'~/components',            // quét thư mục chính
		'~/components/common',     // quét thư mục con chứa TutorCard.vue
	],

	modules: [
		'@pinia/nuxt',
	],

	css: [
		'bootstrap/dist/css/bootstrap.min.css',
		'flag-icon-css/css/flag-icons.min.css',
		'@fortawesome/fontawesome-free/css/all.min.css',
		'~/assets/css/app.css',
	],

	runtimeConfig: {
		// Private keys (only available on server-side)
		// Public keys (exposed to client-side)
		public: {
			apiUrl: process.env.NUXT_PUBLIC_API_URL || process.env.VITE_API_URL,
			apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || process.env.VITE_API_BASE_URL,
			pusherAppKey: process.env.NUXT_PUBLIC_PUSHER_APP_KEY || process.env.VITE_PUSHER_APP_KEY || '',
			pusherAppCluster: process.env.NUXT_PUBLIC_PUSHER_APP_CLUSTER || process.env.VITE_PUSHER_APP_CLUSTER || '',
			pusherHost: process.env.NUXT_PUBLIC_PUSHER_HOST || process.env.VITE_PUSHER_HOST,
			pusherPort: process.env.NUXT_PUBLIC_PUSHER_PORT || process.env.VITE_PUSHER_PORT,
			baseUrl: process.env.VITE_BASE_URL
		},
	},

	// Nuxt auto-imports components, composables, and utilities
	// No need for manual alias configuration for most cases

	vite: {
		resolve: {
			alias: {
				'randombytes': 'randombytes/browser',
				'readable-stream': 'readable-stream',
				'stream': 'readable-stream',
				'simple-peer': 'simple-peer/simplepeer.min.js',
			},
		},
	},

	app: {
		head: {
			title: 'TutorFind',
			meta: [
				{ charset: 'utf-8' },
				{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
			],
			link: [
				{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
			]
		}
	},
})

