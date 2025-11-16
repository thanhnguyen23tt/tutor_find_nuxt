<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Notification />
  </div>
</template>

<script setup>
// Fetch configuration trên server bằng useAsyncData
const configStore = useConfigStore()
const { api } = useApi()
const userStore = useUserStore()

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
        server: true,
        lazy: false
    }
)
</script>

