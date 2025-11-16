import { useUserStore } from '~/stores/user'
import { useApi } from '~/composables/useApi'
import { useAuthCookie } from '~/composables/useAuthCookie'

export const useAuth = () => {
	const userStore = useUserStore()
	const { api, clearAuth: clearApiAuth } = useApi()
	const authCookie = useAuthCookie()

	// Đồng bộ token cookie với store nếu chưa có
	if (authCookie.hasToken() && !userStore.token) {
		userStore.setToken(authCookie.getToken())
	}

	const clearSession = () => {
		clearApiAuth()
		userStore.clearAuth()
		authCookie.clearAuth()
	}

	const isAuthenticated = () => {
		return authCookie.hasToken()
	}

	const verifyToken = async () => {
		const token = authCookie.getToken()

		if (!token) {
			clearSession()
			return null
		}

		try {
			const response = await api.apiPost('verify-token')
			if (response?.user) {
				userStore.setAuth({
					token: token,
					user: response.user,
				})
				return response.user
			}

			// clearSession()
			return null
		} catch (error) {
			// clearSession()
			return null
		}
	}

	const login = async (payload) => {
		try {
			const response = await api.apiPost('auth/login', payload)
			const token = response?.token

			if (token) {
				userStore.setAuth({
					token: token,
					user: response.user,
				})
			}

			return response
		} catch (error) {
			throw error
		}
	}

	const register = async (payload) => {
		try {
			const response = await api.apiPost('auth/register', payload)
			const token = response?.access_token

			if (token) {
				userStore.setAuth({
					token: token,
					user: response.user,
				})
			}

			return response
		} catch (error) {
			throw error
		}
	}

	const sendOtp = async (payload) => {
		try {
			const response = await api.apiPost('sendOtp', payload)
			return response
		} catch (error) {
			throw error
		}
	}

	const logout = () => {
		clearSession()
	}

	return {
		isAuthenticated,
		verifyToken,
		login,
		register,
		sendOtp,
		logout,
	}
}
