/**
 * Cookie Service - Centralized cookie management
 * Provides consistent cookie operations across the application
 */

const DEFAULT_COOKIE_OPTIONS = {
	sameSite: "lax",
	secure: true,
	httpOnly: false, // FE needs to read
	path: "/"
};

/**
 * Get a cookie value
 * @param {string} key - Cookie key
 * @param {object} options - Cookie options
 * @returns {any} Cookie value
 */
export const getCookie = (key, options = {}) => {
	const cookie = useCookie(key, {
		...DEFAULT_COOKIE_OPTIONS,
		...options,
		default: () => null,
	});
	return cookie.value;
};

/**
 * Set a cookie value
 * @param {string} key - Cookie key
 * @param {any} value - Cookie value
 * @param {object} options - Cookie options
 */
export const setCookie = (key, value, options = {}) => {
	const cookie = useCookie(key, {
		...DEFAULT_COOKIE_OPTIONS,
		...options,
	});
	cookie.value = value;
};

/**
 * Remove a cookie
 * @param {string} key - Cookie key
 */
export const removeCookie = (key) => {
	const cookie = useCookie(key);
	cookie.value = null;
};

/**
 * Get authentication token from cookie
 * @returns {string|null} Token value or null
 */
export const getToken = () => {
	return getCookie('token');
};

/**
 * Set authentication token in cookie
 * @param {string} token - Token value
 */
export const setToken = (token) => {
	setCookie('token', token || null);
};

/**
 * Remove authentication token from cookie
 */
export const removeToken = () => {
	removeCookie('token');
};

/**
 * Check if user is authenticated (has token)
 * @returns {boolean} True if token exists
 */
export const hasToken = () => {
	return !!getToken();
};

