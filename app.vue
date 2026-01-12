<script setup>
import { onMounted } from 'vue'

// Fetch configuration trên server bằng useAsyncData
const configStore = useConfigStore()
const { verifyToken } = useAuth();
const { api } = useApi()
const isLoading = ref(false)

const { data: configuration, pending: isLoadingConfig } = await useAsyncData(
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
	isLoading.value = true
	await verifyToken();
	isLoading.value = false
})
</script>

<template>
	<base-loading v-if="isLoadingConfig || isLoading"></base-loading>

	<div v-else>
		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>
		<Notification />
	</div>
</template>
