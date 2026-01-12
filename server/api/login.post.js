export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig()
	const body = await readBody(event)

	try {
		const response = await $fetch(`${config.public.apiUrl}/api/auth/login`, {
			method: 'POST',
			body: body
		})

		if (response?.access_token?.token) {
			const expiresIn = response.access_token.expires_in || 60 * 60 * 24 * 7; 
			
			setCookie(event, 'token', response.access_token.token, {
				maxAge: expiresIn,
				path: '/',
			})

			if (response.refresh_token?.token) {
				setCookie(event, 'refresh_token', response.refresh_token.token, {
					maxAge: response.refresh_token.expires_in || 60 * 60 * 24 * 30, // 30 days fallback
					path: '/',
				})
			}
		}

		return {
			...response,
			token: response.access_token?.token
		}
	} catch (error) {
		// if (error.response) {
		// 	setResponseStatus(event, error.response.status)
		// 	return error.response._data
		// }
		// throw error
		return error;
	}
})