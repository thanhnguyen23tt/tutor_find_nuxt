export default defineNuxtRouteMiddleware(async (to, from) => {
	const userStore = useUserStore();
	const { verifyToken } = useAuth();

	if (userStore.isAuthenticated) {
		return;
	}

	try {
		await verifyToken();

		if (!userStore.isAuthenticated) {
			throw new Error('Unauthenticated');
		}
	} catch (err) {
		userStore.clearAuth();
		return navigateTo({
			path: '/auth/login',
			query: { redirect: to.fullPath }
		});
	}
});

