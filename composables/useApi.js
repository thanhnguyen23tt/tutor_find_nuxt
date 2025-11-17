import axios from 'axios';
import { useAuthCookie } from '~/composables/useAuthCookie'

export const useApi = () => {
	const config = useRuntimeConfig();
	const BASE_URL = config.public.apiUrl;
	const TIMEOUT = 10000;
	const authCookie = useAuthCookie();

	// Get CSRF token
	const getCsrfToken = () => {
		if (process.client) {
			return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
		}
		return null;
	};

	// Get auth token from storage
	const getAuthToken = () => {
		return authCookie.getToken();
	};

	// Create axios instance
	const axiosInstance = axios.create({
		baseURL: BASE_URL,
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json'
		},
		timeout: TIMEOUT,
		withCredentials: true,
	});

	// Request interceptor - always add fresh token before request
	axiosInstance.interceptors.request.use(
		(config) => {
			// Add CSRF token
			const csrfToken = getCsrfToken();
			if (csrfToken) {
				config.headers['X-CSRF-TOKEN'] = csrfToken;
			}

			// Add Authorization token
			const token = getAuthToken();
			if (token) {
				config.headers['Authorization'] = `Bearer ${token}`;
			} else {
				// Remove Authorization header if no token
				delete config.headers['Authorization'];
			}

			return config;
		},
		(error) => {
			return Promise.reject(error);
		}
	);

	// Response interceptor
	axiosInstance.interceptors.response.use(
		(response) => response,
		(error) => {
			// Handle 401 Unauthorized
			if (error.response?.status === 401) {
				removeToken();
			}

			return Promise.reject(handleError(error));
		}
	);

	// Handle response
	const handleResponse = (response) => {
		return response.data;
	};

	// Handle error
	const handleError = (error) => {
		if (error?.data) {
			return error.data;
		} else if (error?.errors) {
			return error.errors;
		}

		return error;
	};

	// API methods
	const api = {
		/**
		 * GET request to /api/{url}
		 */
		async apiGet(url, params = {}) {
			try {
				const response = await axiosInstance.get(`/api/${url}`, { params });
				return handleResponse(response);
			} catch (error) {
				throw handleError(error);
			}
		},

		/**
		 * POST request to /api/{url}
		 */
		async apiPost(url, data = {}) {
			try {
				const response = await axiosInstance.post(`/api/${url}`, data);
				return handleResponse(response);
			} catch (error) {
				throw handleError(error);
			}
		},

		/**
		 * PUT request to /api/{url}
		 */
		async apiPut(url, data = {}) {
			try {
				const response = await axiosInstance.put(`/api/${url}`, data);
				return handleResponse(response);
			} catch (error) {
				throw handleError(error);
			}
		},

		/**
		 * DELETE request to /api/{url}
		 */
		async apiDelete(url) {
			try {
				const response = await axiosInstance.delete(`/api/${url}`);
				return handleResponse(response);
			} catch (error) {
				throw handleError(error);
			}
		},

		/**
		 * POST FormData to /api/{url}
		 */
		async apiPostFormData(url, formData) {
			try {
				const response = await axiosInstance.post(`/api/${url}`, formData, {
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				});
				return handleResponse(response);
			} catch (error) {
				throw handleError(error);
			}
		},

		/**
		 * PUT FormData to /api/{url}
		 */
		async apiPutFormData(url, formData) {
			try {
				const response = await axiosInstance.put(`/api/${url}`, formData, {
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				});
				return handleResponse(response);
			} catch (error) {
				throw handleError(error);
			}
		},

		/**
		 * Direct GET request (without /api prefix)
		 */
		async get(url, params = {}) {
			try {
				const response = await axiosInstance.get(url, { params });
				return handleResponse(response);
			} catch (error) {
				throw handleError(error);
			}
		},

		/**
		 * Direct POST request (without /api prefix)
		 */
		async post(url, data = {}) {
			try {
				const response = await axiosInstance.post(url, data);
				return handleResponse(response);
			} catch (error) {
				throw handleError(error);
			}
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
		authCookie.removeToken();
	};

	/**
	 * Get current token
	 */
	const getToken = () => {
		return getAuthToken();
	};

	return { api, setAuthToken, clearAuth, getToken };
};

