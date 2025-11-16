export default defineNuxtRouteMiddleware(async (to, from) => {
	const userStore = useUserStore();
	const { verifyToken } = useAuth();

	// Check if user has token
	const token = process.client ? sessionStorage.getItem('token') : null;

	if (token) {
		// Verify token and get user data
		if (!userStore.getUserData || Object.keys(userStore.getUserData).length === 0) {
			const userData = await verifyToken();
			if (userData) {
				// User is authenticated, redirect to home
				return navigateTo('/');
			}
		} else {
			// User is already authenticated, redirect to home
			return navigateTo('/');
		}
	}
});

