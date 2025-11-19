import axios from 'axios';
import { useCookie } from 'nuxt/app';
export const useApi = () => {
	const config = useRuntimeConfig();
	const BASE_URL = config.public.apiUrl;
	const TIMEOUT = 10000;

	const axiosInstance = axios.create({
		baseURL: BASE_URL,
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'X-Requested-With': 'XMLHttpRequest',
		},
		timeout: 10000,
		withCredentials: true,
	})

	axiosInstance.defaults.xsrfCookieName = 'XSRF-TOKEN'
	axiosInstance.defaults.xsrfHeaderName = 'X-XSRF-TOKEN'
	axios.defaults.withCredentials = true;

	//  THÊM INTERCEPTOR ĐỌC XSRF-TOKEN (đây là chìa khóa!)
	axiosInstance.interceptors.request.use((config) => {
		// Chỉ xử lý cookie ở client-side
		if (typeof window !== 'undefined' && typeof document !== 'undefined') {
			// Lấy token từ cookie thủ công
			const cookies = document.cookie.split('; ')
			const xsrfCookie = cookies.find(row => row.startsWith('XSRF-TOKEN='))

			if (xsrfCookie) {
				const token = xsrfCookie.split('=')[1]
				if (token) {
					config.headers['X-XSRF-TOKEN'] = decodeURIComponent(token)
					console.log('✅ XSRF-TOKEN được gắn vào request:', token.substring(0, 20) + '...')
				}
			} else {
				console.warn('⚠️ Không tìm thấy XSRF-TOKEN trong cookies')
				console.log('Available cookies:', document.cookie)
			}
		}
		return config
	})


	// Response interceptor
	axiosInstance.interceptors.response.use(
		(response) => {
			return response;
		},
		(error) => {
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

	return { api };
};

