import { useUserStore } from '~/stores/user'
import { useAuthApi } from '~/composables/useAuthApi'

export const useAuth = () => {
	const userStore = useUserStore()
	const { authApi } = useAuthApi()

	const isAuthenticated = () => {
		return !!userStore.getUserData && Object.keys(userStore.getUserData || {}).length > 0
	}

	const verifyToken = async () => {
		try {
			const authCookie = useAuthCookie()
			const { getToken } = authCookie

			if (!getToken()) {
				return
			}

			const response = await authApi.post('verify-token')
			console.log(response)
			if (response?.user) {
				userStore.setUserData(response.user)
				return response.user
			}
			userStore.clearAuth()
			return null
		} catch (error) {
			userStore.clearAuth()
			throw error
		}
	}

	const login = async (payload) => {
		try {
			const response = await $fetch('/api/login', {
				method: 'POST',
				body: payload
			})
			
			if (response?.user) {
				userStore.setAuth({
					user: response.user,
					token: response.token,
				})
			} else {
				await verifyToken()
			}
			return response
		} catch (error) {
			throw error
		}
	}

	const register = async (payload) => {
		try {
			const response = await $fetch('/api/register', {
				method: 'POST',
				body: payload
			})
			
			if (response?.user) {
				userStore.setAuth({
					user: response.user,
					token: response.token,
				})
			} else {
				await verifyToken()
			}
			return response
		} catch (error) {
			throw error
		}
	}

	const sendRegisterOtp = async (payload) => {
		try {
			const response = await authApi.post('auth/register/otp', payload)
			return response
		} catch (error) {
			throw error
		}
	}

	const verifyRegisterOtp = async (payload) => {
		try {
			const response = await authApi.post('auth/register/verify', payload)
			return response
		} catch (error) {
			throw error
		}
	}

	const logout = async () => {
		try {
			// Call Nuxt server API to clear cookie and call backend logout
			await $fetch('/api/logout', { method: 'POST' })
		} catch (e) {
			console.error('Logout error:', e)
		} finally {
			userStore.clearAuth()
			return navigateTo('/auth/login')
		}
	}

	const sendResetOtp = async (payload) => {
		try {
			const response = await authApi.post('auth/password/reset/otp', payload)
			return response
		} catch (error) {
			throw error
		}
	}

	const verifyResetOtp = async (payload) => {
		try {
			const response = await authApi.post('auth/password/reset/verify', payload)
			return response
		} catch (error) {
			throw error
		}
	}

	const resetPassword = async (payload) => {
		try {
			const response = await authApi.post('auth/password/reset', payload)
			return response
		} catch (error) {
			throw error
		}
	}

	/**
	 * Handle OAuth callback (Google/Facebook)
	 * @param {string} provider - 'google' or 'facebook'
	 * @param {URLSearchParams} queryParams - URL query parameters from backend
	 * @returns {Promise<Object>} User data if successful
	 * @throws {Error} If authentication fails
	 */
	const handleOAuthCallback = async (provider, queryParams) => {
		try {
			// Call server API endpoint to process OAuth callback
			const response = await $fetch(`/api/auth/${provider}/callback`, {
				method: 'GET',
				query: {
					token: queryParams.get('token'),
					error: queryParams.get('error'),
				},
			})

			// Check for errors
			if (response?.error) {
				throw new Error(response.error)
			}

			// If success, verify token and get user data
			if (response?.success) {
				// Token is already set in cookie by server API
				const user = await verifyToken()
				
				if (!user) {
					throw new Error('Failed to verify token')
				}

				return user
			}

			throw new Error('Invalid OAuth response')
		} catch (error) {
			console.error(`${provider} OAuth callback error:`, error)
			userStore.clearAuth()
			throw error
		}
	}

	return {
		isAuthenticated,
		verifyToken,
		login,
		register,
		sendRegisterOtp,
		verifyRegisterOtp,
		sendResetOtp,
		verifyResetOtp,
		resetPassword,
		logout,
		handleOAuthCallback,
	}
}
