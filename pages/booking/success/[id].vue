<script setup>
import BookingSuccess from '~/components/booking/BookingSuccess.vue'

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
	try {
		const id = route.params.id
		const res = await api.apiGet(`bookings/${id}`)
		return res.data
	} catch (e) {
		throw e
	} finally {
		isLoading.value = false
	}
}

const { data, error } = await useAsyncData('book', loadBooking)

watchEffect(() => {
    if (process.client && error.value) {
        notifyError('Không thể tải thông tin đặt lịch')
    return navigateTo('/')
    }
})
</script>

<template>
<base-loading v-if="isLoading" />
<BookingSuccess v-else-if="data" :booking-data="data" />
</template>
