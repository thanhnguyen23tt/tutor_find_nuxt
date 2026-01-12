export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig();
	const query = getQuery(event);

	// Get token and user from query params (sent from backend)
	const token = query.access_token;
	const error = query.error;

	if (error) {
		// Redirect to login with error
		return {
			error: error
		}
	}

	if (!token) {
		// Missing token, redirect to login
		return {
			error: 'missing_token'
		}
	}

	try {
		// Set cookie for the token
		setCookie(event, 'token', token, {
			maxAge: response.expires_in || 60 * 60 * 24 * 7, // 1 week
			path: '/',
		});
		
		// Return success response with token and user data
		// This will be handled by the client-side callback page
		return {
			success: true
		}
	} catch (error) {
		console.error('Facebook callback error:', error);
		return {
			error: 'auth_failed'
		}
	}
});
