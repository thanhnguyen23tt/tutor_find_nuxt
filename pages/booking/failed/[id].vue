<script setup>
import BookingFailed from '~/components/booking/BookingFailed.vue'

definePageMeta({
	middleware: [
		'auth', 
		() => {
		useLayoutStore().setHiddenFooter(true)
		}
	]
})

const route = useRoute()
const {
    api
} = useApi()
const {
    error: notifyError
} = useNotification()

const isLoading = ref(false)

const loadBooking = async () => {
	isLoading.value = true

    const id = route.params.id
    try {
        const res = await api.apiGet(`bookings/${id}`)
        return res.data
    } catch (e) {
        throw e
    } finally {
        isLoading.value = false
    }
}

const { data, error } = await useAsyncData('book-failed', loadBooking)

watchEffect(() => {
    if (process.client && error.value) {
        notifyError('Không thể tải thông tin đặt lịch')
     return navigateTo('/')
    }
})
</script>

<template>
<base-loading v-if="isLoading" />
<BookingFailed v-else-if="data" :booking-data="data" />
</template>
