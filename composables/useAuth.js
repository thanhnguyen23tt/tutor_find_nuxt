import { useUserStore } from '~/stores/user'
import { useApi } from '~/composables/useApi'
import { useCookieService } from './useCookieService'
export const useAuth = () => {
	const userStore = useUserStore()
	const { api } = useApi()

	const isAuthenticated = () => {
		return !!userStore.getUserData && Object.keys(userStore.getUserData || {}).length > 0
	}

	const ensureCsrfCookie = async () => {
		try {
			await api.get('/sanctum/csrf-cookie')
		} catch (error) {
			throw error
		}
	}

	const verifyToken = async () => {
		try {
			const response = await api.post('auth/verify-token')
			if (response?.user) {
				userStore.setAuth({
					user: response.user,
				})
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
			await ensureCsrfCookie()
			const response = await api.post('auth/login', payload)
			await verifyToken()
			return response
		} catch (error) {
			throw error
		}
	}

	const register = async (payload) => {
		try {
			await ensureCsrfCookie()
			const response = await api.post('auth/register', payload)
			if (response?.user) {
				userStore.setAuth({
					user: response.user,
				})
			} else {
				await verifyToken()
			}
			return response
		} catch (error) {
			throw error
		}
	}

	const sendOtp = async (payload) => {
		try {
			const response = await api.post('sendOtp', payload)
			return response
		} catch (error) {
			throw error
		}
	}

	const logout = async () => {
		try {
			await ensureCsrfCookie()
			await api.post('auth/logout')
		} finally {
			userStore.clearAuth()
		}
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
