<script setup>
import BookingSuccess from '~/components/booking/BookingSuccess.vue'

definePageMeta({
    layout: 'default',
	middleware: 'auth',
})

const route = useRoute()
const {
    api
} = useApi()
const {
    error: notifyError
} = useNotification()

const loadBooking = async () => {
    const id = route.params.id
    const res = await api.apiGet(`bookings/${id}`)
    return res.data
}

const { data, error } = await useAsyncData('book', loadBooking)

watchEffect(() => {
    if (process.client && error.value) {
        notifyError('Không thể tải thông tin đặt lịch')
        navigateTo('/')
    }
})
</script>

<template>
<base-loading v-if="isLoading" />
<BookingSuccess v-else-if="data" :booking-data="data" />
</template>
