// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	// Trigger restart
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
		public: {
			apiUrl: process.env.API_URL || process.env.API_URL,
			baseUrl: process.env.BASE_URL,
			realtimeUrl: process.env.REALTIME_URL || process.env.VITE_REALTIME_URL,
			
			apiBaseUrl: process.env.API_URL || process.env.VITE_API_BASE_URL,
			pusherAppKey: process.env.PUSHER_APP_KEY || process.env.VITE_PUSHER_APP_KEY || '',
			pusherAppCluster: process.env.PUSHER_APP_CLUSTER || process.env.VITE_PUSHER_APP_CLUSTER || '',
			pusherHost: process.env.PUSHER_HOST || process.env.VITE_PUSHER_HOST,
			pusherPort: process.env.PUSHER_PORT || process.env.VITE_PUSHER_PORT,

			reverbAppId: process.env.REVERB_APP_ID || process.env.VITE_REVERB_APP_ID,
			reverbAppKey: process.env.REVERB_APP_KEY || process.env.VITE_REVERB_APP_KEY,
			reverbAppSecret: process.env.REVERB_APP_SECRET || process.env.VITE_REVERB_APP_SECRET,
			reverbHost: process.env.REVERB_HOST || process.env.VITE_REVERB_HOST,
			reverbPort: process.env.REVERB_PORT || process.env.VITE_REVERB_PORT,
			reverbScheme: process.env.REVERB_SCHEME || process.env.VITE_REVERB_SCHEME,
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

