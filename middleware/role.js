const ROLE = {
	STUDENT: 0,
	TUTOR: 1,
	UNDEFINED: 99
};

export default defineNuxtRouteMiddleware(async (to, from) => {
	const userStore = useUserStore();
	const { verifyToken } = useAuth();

	// Check if user has token
	const token = process.client ? sessionStorage.getItem('token') : null;

	if (!token) {
		return navigateTo({
			path: '/auth/login',
			query: { redirect: to.fullPath }
		});
	}

	// Verify token and get user data
	if (!userStore.getUserData || Object.keys(userStore.getUserData).length === 0) {
		const userData = await verifyToken();
		if (!userData) {
			userStore.clearAuth();
			return navigateTo({
				path: '/auth/login',
				query: { redirect: to.fullPath }
			});
		}
	}

	const userData = userStore.getUserData;

	// Check if user has required role
	const requiresRole = to.meta.requiresRole;

	if (requiresRole !== undefined) {
		const hasRequiredRole = requiresRole === ROLE.TUTOR ? userData.is_tutor : !userData.is_tutor;

		if (!hasRequiredRole) {
			return navigateTo('/');
		}
	}

	// Check if user needs to select role
	if (userData.role === ROLE.UNDEFINED && !to.meta.requiresRoleSelection) {
		return navigateTo('/auth/select-role');
	}

	// If user is on role selection page but already has a role, redirect to home
	if (to.meta.requiresRoleSelection && userData.role !== ROLE.UNDEFINED) {
		return navigateTo('/');
	}

	// Prevent self booking
	if (to.meta.preventSelfBooking && to.params.uid === userData.uid) {
		return navigateTo('/');
	}
});

