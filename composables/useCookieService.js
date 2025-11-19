/**
 * Cookie Service Composable
 * Provides cookie management functionality for Nuxt 3 components
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
const getCookie = (key, options = {}) => {
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
const setCookie = (key, value, options = {}) => {
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
const removeCookie = (key) => {
	const cookie = useCookie(key);
	cookie.value = null;
};

export const useCookieService = () => {
	return {
		getCookie,
		setCookie,
		removeCookie,
	};
};

