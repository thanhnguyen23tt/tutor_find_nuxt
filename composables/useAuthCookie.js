/**
 * Authentication Cookie Composable
 * Handle token, refresh token, login/logout cookie operations
 */

export const useAuthCookie = () => {
	// Dùng cookie service chung
	const cookieService = useCookieService();

	// Keys cố định để không lẫn với cookie khác
	const TOKEN_KEY = 'token';
	const REFRESH_TOKEN_KEY = 'refresh_token';

	/* =============================
	 * TOKEN
	 * ============================= */

	const getToken = () => {
		return cookieService.getCookie(TOKEN_KEY);
	};

	const setToken = (token, options = {}) => {
		cookieService.setCookie(TOKEN_KEY, token, {
			httpOnly: false, // client-side dùng được
			maxAge: 60 * 60 * 24 * 7, // 7 ngày
			...options,
		});
	};

	const removeToken = () => {
		cookieService.removeCookie(TOKEN_KEY);
		cookieService.removeCookie(REFRESH_TOKEN_KEY);
	};

	const hasToken = () => {
		return !!getToken();
	};

	/* =============================
	 * REFRESH TOKEN (optional)
	 * ============================= */

	const getRefreshToken = () => {
		return cookieService.getCookie(REFRESH_TOKEN_KEY);
	};

	const setRefreshToken = (token, options = {}) => {
		cookieService.setCookie(REFRESH_TOKEN_KEY, token, {
			httpOnly: false,
			maxAge: 60 * 60 * 24 * 30, // 30 ngày
			...options,
		});
	};

	const removeRefreshToken = () => {
		cookieService.removeCookie(REFRESH_TOKEN_KEY);
	};

	/* =============================
	 * CLEAR ALL AUTH
	 * ============================= */

	const clearAuth = () => {
		removeToken();
		removeRefreshToken();
	};

	return {
		// access token
		getToken,
		setToken,
		removeToken,
		hasToken,

		// refresh token
		getRefreshToken,
		setRefreshToken,
		removeRefreshToken,

		// clear all auth cookies
		clearAuth,
	};
};
