
import { useAuthCookie } from '~/composables/useAuthCookie'

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
	failedQueue.forEach(prom => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token);
		}
	});
	failedQueue = [];
};

export const useApi = () => {
	const config = useRuntimeConfig();
	const BASE_URL = config.public.apiUrl;
	const authCookie = useAuthCookie();

	// Get auth token from storage
	const getAuthToken = () => {
		return useCookie('token').value;
	};

	// Custom fetch wrapper to handle refresh token logic
	const customFetch = async (url, options = {}) => {
		try {
			return await $fetch(url, options);
		} catch (error) {
			if (error.response?.status === 401) {
				// If the failed request was already a refresh attempt, don't retry
				if (url.includes('/api/refreshToken')) {
					throw error;
				}

				if (isRefreshing) {
					return new Promise((resolve, reject) => {
						failedQueue.push({ resolve, reject });
					}).then(token => {
						options.headers = options.headers || {};
						options.headers['Authorization'] = `Bearer ${token}`;
						return customFetch(url, options);
					});
				}

				isRefreshing = true;

				try {
					// Call refresh endpoint (Nuxt server route)
					const refreshResponse = await $fetch('/api/refreshToken', {
						method: 'POST'
					});

					const newToken = refreshResponse.access_token || refreshResponse.token;

					if (newToken) {
						// Update client-side state
						authCookie.setToken(newToken.token);
						
						// Process queue
						processQueue(null, newToken.token);

						// Retry the original request with the new token
						options.headers = options.headers || {};
						options.headers['Authorization'] = `Bearer ${newToken.token}`;
						return customFetch(url, options);
					} else {
						throw new Error('Refresh failed: No token returned');
					}
				} catch (refreshError) {
					processQueue(refreshError, null);
					authCookie.clearAuth();
					
					if (process.client) {
						return navigateTo('/auth/login');
					}
					throw refreshError;
				} finally {
					isRefreshing = false;
				}
			}
			
			// Handle other errors
			if (error?.data) {
				throw error.data;
			} else if (error?.response?._data) {
				throw error.response._data;
			}
			throw error;
		}
	};

	// Helper to create fetch options
	const createFetchOptions = (method, data = null, customHeaders = {}) => {
		const token = getAuthToken();
		const headers = {
			'Accept': 'application/json',
			...customHeaders
		};

		if (token) {
			headers['Authorization'] = `Bearer ${token}`;
		}

		const options = {
			baseURL: BASE_URL,
			method,
			headers,
		};

		if (data) {
			options.body = data;
		}

		return options;
	};

	// Handle response (pass-through for now)
	const handleResponse = (response) => {
		return response;
	};

	// API methods
	const api = {
		/**
		 * GET request to /api/{url}
		 */
		async apiGet(url, params = {}) {
			const options = createFetchOptions('GET');
			options.params = params;
			const response = await customFetch(`/api/${url}`, options);
			return handleResponse(response);
		},

		/**
		 * POST request to /api/{url}
		 */
		async apiPost(url, data = {}) {
			const options = createFetchOptions('POST', data);
			const response = await customFetch(`/api/${url}`, options);
			return handleResponse(response);
		},

		/**
		 * PUT request to /api/{url}
		 */
		async apiPut(url, data = {}) {
			const options = createFetchOptions('PUT', data);
			const response = await customFetch(`/api/${url}`, options);
			return handleResponse(response);
		},

		/**
		 * DELETE request to /api/{url}
		 */
		async apiDelete(url) {
			const options = createFetchOptions('DELETE');
			const response = await customFetch(`/api/${url}`, options);
			return handleResponse(response);
		},

		/**
		 * POST FormData to /api/{url}
		 */
		async apiPostFormData(url, formData) {
			// Don't set Content-Type for FormData, let browser handle it
			const options = createFetchOptions('POST', formData);
			const response = await customFetch(`/api/${url}`, options);
			return handleResponse(response);
		},

		/**
		 * PUT FormData to /api/{url}
		 */
		async apiPutFormData(url, formData) {
			const options = createFetchOptions('PUT', formData);
			const response = await customFetch(`/api/${url}`, options);
			return handleResponse(response);
		},

		/**
		 * Direct GET request (without /api prefix)
		 */
		async get(url, params = {}) {
			const options = createFetchOptions('GET');
			options.baseURL = ''; // Reset baseURL for direct URL
			options.params = params;
			const response = await customFetch(url, options);
			return handleResponse(response);
		},

		/**
		 * Direct POST request (without /api prefix)
		 */
		async post(url, data = {}) {
			const options = createFetchOptions('POST', data);
			options.baseURL = ''; // Reset baseURL for direct URL
			const response = await customFetch(url, options);
			return handleResponse(response);
		},
	};

	/**
	 * Set or remove authentication token
	 * This manually updates the token in cookie
	 */
	const setAuthToken = (token) => {
		authCookie.setToken(token || null);
	};

	/**
	 * Clear authentication
	 */
	const clearAuth = () => {
		authCookie.clearAuth();
	};

	/**
	 * Get current token
	 */
	const getToken = () => {
		return getAuthToken();
	};

	return { api, setAuthToken, clearAuth, getToken };
};
