export default defineNuxtRouteMiddleware(async (to, from) => {
	const { getToken, getRefreshToken } = useAuthCookie();

	const token = getToken();
	const refreshToken = getRefreshToken();

	if (refreshToken && !token) {
		try {
			await $fetch('/api/refreshToken', { method: 'POST' });
		} catch (error) {
			return navigateTo({
				path: '/auth/login'
			});
		}
	}
});
