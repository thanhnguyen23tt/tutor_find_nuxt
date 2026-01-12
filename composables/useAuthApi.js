
export const useAuthApi = () => {
	const config = useRuntimeConfig()
	const BASE_URL = config.public.apiUrl

	// Get auth token from storage
	const getAuthToken = () => {
		return useCookie('token').value
	}

	// Helper to create fetch options for auth endpoints
	const createAuthFetchOptions = (method, data = null, customHeaders = {}) => {
		const token = getAuthToken()
		const headers = {
			'Accept': 'application/json',
			...customHeaders
		}

		// Only add token for endpoints that need it (like verify-token)
		if (token) {
			headers['Authorization'] = `Bearer ${token}`
		}

		const options = {
			baseURL: BASE_URL,
			method,
			headers,
		}

		if (data) {
			options.body = data
		}

		return options
	}

	// Handle response
	const handleResponse = (response) => {
		return response
	}

	// Auth API methods - no refresh token logic, just direct calls
	const authApi = {
		/**
		 * POST request to /api/{url} for auth endpoints
		 */
		async post(url, data = {}) {
			try {
				const options = createAuthFetchOptions('POST', data)
				const response = await $fetch(`/api/${url}`, options)
				return handleResponse(response)
			} catch (error) {
				// Handle errors without refresh token logic
				if (error?.data) {
					throw error.data
				} else if (error?.response?._data) {
					throw error.response._data
				}
				throw error
			}
		},

		/**
		 * GET request to /api/{url} for auth endpoints
		 */
		async get(url, params = {}) {
			try {
				const options = createAuthFetchOptions('GET')
				options.params = params
				const response = await $fetch(`/api/${url}`, options)
				return handleResponse(response)
			} catch (error) {
				if (error?.data) {
					throw error.data
				} else if (error?.response?._data) {
					throw error.response._data
				}
				throw error
			}
		},
	}

	return { authApi }
}
