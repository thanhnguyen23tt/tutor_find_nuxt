export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const token = getCookie(event, 'token')

    try {
        if (token) {
            await $fetch(`${config.public.apiUrl}/api/auth/logout`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
        }
    } catch (error) {
        // Ignore backend errors, proceed to clear cookie
    }

    deleteCookie(event, 'token')
    return { success: true }
})
