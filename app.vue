<script setup>
import { onMounted } from 'vue'

// Fetch configuration trên server bằng useAsyncData
const configStore = useConfigStore()
const { api } = useApi()
const { verifyToken } = useAuth()

const { data: configuration } = await useAsyncData(
	'app-configuration',
	async () => {
		try {
			const response = await api.apiGet('configurations')
			configStore.setConfiguration(response)
			return response
		} catch (error) {
			console.error('Error fetching configuration:', error)
			return {}
		}
	},
	{
		server: false,
		lazy: false
	}
)

onMounted(async () => {
	process.client && await verifyToken();
})
</script>

<template>

<div>
	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>
	<Notification />
</div>
</template>
