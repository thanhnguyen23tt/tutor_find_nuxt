# OAuth Login Flow

## Flow Diagram

### Google/Facebook Login Flow:

```
1. User clicks "Login with Google/Facebook" button
   └─> Frontend: pages/auth/login.vue
       └─> Redirects to: {apiBaseUrl}/api/auth/google (OR /api/auth/facebook)

2. Backend handles OAuth
   └─> Backend Laravel: routes/api.php -> AuthController@redirectToGoogle
       └─> Redirects to Google/Facebook OAuth
       
3. User authorizes on Google/Facebook
   └─> Google/Facebook redirects back to backend callback URL
   
4. Backend processes OAuth callback
   └─> Backend Laravel: AuthController@handleGoogleCallback
       └─> Creates/finds user
       └─> Generates token
       └─> Redirects to: {frontendUrl}/api/auth/google/callback?token={token}
       
5. Nuxt server API handles callback
   └─> Server: server/api/auth/google/callback.get.js
       └─> Sets cookie with token
       └─> Fetches user data from backend
       └─> Redirects to: /auth/google/callback?success=true
       
6. Frontend callback page processes
   └─> Frontend: pages/auth/google/callback.vue
       └─> Calls useAuth().verifyToken()
       └─> Sets user data in store
       └─> Redirects to home page
```

## Files Involved

### Frontend
- `pages/auth/login.vue` - Login page with OAuth buttons
- `pages/auth/google/callback.vue` - Google OAuth callback handler
- `pages/auth/facebook/callback.vue` - Facebook OAuth callback handler
- `composables/useAuth.js` - Authentication composable
- `stores/user.js` - User store

### Server API
- `server/api/auth/google/callback.get.js` - Google OAuth server handler
- `server/api/auth/facebook/callback.get.js` - Facebook OAuth server handler
- `server/api/login.post.js` - Regular login handler (for reference)

## Key Points

1. **Cookie Management**: Server API sets the token cookie (httpOnly for security)
2. **User Data**: Fetched using token after OAuth callback
3. **Error Handling**: Errors are passed via query params and displayed to user
4. **Consistent Flow**: OAuth login uses same flow as regular login (useAuth composable)

## Configuration Required

### Backend (.env)
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URL=http://localhost:8000/api/auth/google/callback

FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret
FACEBOOK_REDIRECT_URL=http://localhost:8000/api/auth/facebook/callback
```

### Frontend (.env)
```env
NUXT_PUBLIC_API_URL=http://localhost:8000
NUXT_PUBLIC_API_BASE_URL=http://localhost:8000
NUXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Backend Requirements

Backend must redirect to Nuxt server API endpoint after successful OAuth:

```php
// In AuthController
public function handleGoogleCallback(Request $request)
{
    // ... OAuth processing ...
    
    $token = $user->createToken('oauth-token')->plainTextToken;
    $frontendUrl = config('app.frontend_url'); // e.g., http://localhost:3000
    
    return redirect("{$frontendUrl}/api/auth/google/callback?token={$token}");
}
```
