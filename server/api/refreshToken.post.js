export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig()
	const refreshToken = getCookie(event, 'refresh_token')

	if (!refreshToken) {
		throw createError({
			statusCode: 401,
			statusMessage: 'No refresh token found'
		})
	}

	try {
		// Call backend refresh endpoint
		// We send the refresh_token in the body. Adjust if backend expects otherwise.
		const response = await $fetch(`${config.public.apiUrl}/api/auth/refresh`, {
			method: 'POST',
			body: {
				refresh_token: refreshToken
			}
		})

		if (response?.access_token?.token) {
			const expiresIn = response.access_token.expires_in || 60 * 60 * 24 * 7;

			setCookie(event, 'token', response.access_token.token, {
				maxAge: expiresIn,
				path: '/',
			})

			// Update refresh token if returned
			if (response.refresh_token?.token) {
				setCookie(event, 'refresh_token', response.refresh_token.token, {
					maxAge: response.refresh_token.expires_in || 60 * 60 * 24 * 7, // 7 days
					path: '/',
				})
			}

			return {
				...response,
				token: response.access_token?.token
			}
		}

		throw createError({
			statusCode: 401,
			statusMessage: 'Refresh failed'
		})

	} catch (error) {
		// If refresh fails, we should probably clear cookies?
		// The user said "nếu refresh thất bại → logout". 
		// The client will handle the logout (clearing cookies) if this returns 401.
		// But we can also clear them here to be safe.
		deleteCookie(event, 'token')
		deleteCookie(event, 'refresh_token')
		
		throw createError({
			statusCode: 401,
			statusMessage: 'Refresh failed',
			data: error.data
		})
	}
})
