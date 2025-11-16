export default defineNuxtRouteMiddleware(async (to, from) => {
	const userStore = useUserStore();
	const { verifyToken } = useAuth();
	const { getToken } = useAuthCookie();

	const token = getToken();
	
	if (!token) {
		return navigateTo({
			path: '/auth/login',
			query: { redirect: to.fullPath }
		});
	}

	if (!userStore.userData || Object.keys(userStore.userData).length === 0) {
		try {
			await verifyToken();

			if (!userStore.userData) {
				userStore.clearAuth();
				return navigateTo({ path: '/auth/login', query: { redirect: to.fullPath } });
			}
			userStore.setUserData(userStore.userData);
		} catch (err) {
			userStore.clearAuth();
			return navigateTo({ path: '/auth/login', query: { redirect: to.fullPath } });
		}
	}
});

