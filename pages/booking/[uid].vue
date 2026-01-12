<template>
<div>
    <!-- Loading overlay -->
    <base-loading v-if="loading" />

    <BasePageError v-else-if="tutorInfoError || !tutorInfo" message="Không tìm thấy gia sư" />

    <RealBooking v-else :tutor-info="tutorInfo" />
</div>
</template>

<script setup async>
import RealBooking from '~/components/booking/RealBooking.vue'
definePageMeta({
  middleware: [
		() => {
		useLayoutStore().setHiddenFooter(true)
		}
	]
});
const route = useRoute()
const {
    api
} = useApi()
const {
    error: notifyError
} = useNotification()

const {
    data: tutorInfo,
    pending: loading,
    error: tutorInfoError,
} = await useAsyncData(
    () => `booking-tutor-${route.params.uid}`,
    async () => {
        const tutorUid = route.params.uid
        if (!tutorUid) {
            throw new Error('Không tìm thấy gia sư')
        }
        const tutor = await api.apiGet(`tutor/${tutorUid}`)
		console.log(tutor)
        if (!tutor) {
            throw new Error('Không tìm thấy gia sư')
        }
        return tutor?.data ?? tutor ?? {}
    }
)

// watchEffect(() => {
//     if (process.client && tutorInfoError.value) {
//         notifyError('Không thể tải thông tin gia sư')
//     return navigateTo('/')
//     }
// })
</script>
