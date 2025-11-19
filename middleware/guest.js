export default defineNuxtRouteMiddleware(async (to, from) => {
	const userStore = useUserStore();
	const { verifyToken } = useAuth();

	if (userStore.isAuthenticated) {
		return navigateTo('/');
	}

	const userData = await verifyToken().catch(() => null);
	if (userData) {
		return navigateTo('/');
	}
});

