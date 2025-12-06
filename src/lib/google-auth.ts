/**
 * Google OAuth 2.0 Client-side Authentication
 *
 * This handles the OAuth flow for Google Slides API access.
 * The user will be redirected to Google's consent screen, and
 * we'll receive an access token that we can use for API calls.
 */

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const GOOGLE_SCOPES = ['https://www.googleapis.com/auth/presentations', 'https://www.googleapis.com/auth/presentations.readonly'].join(' ')

export function initiateGoogleAuth(): void {
    if (!GOOGLE_CLIENT_ID) {
        throw new Error('Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in your environment variables.')
    }

    const redirectUri = `${window.location.origin}/auth/google/callback`
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('response_type', 'token')
    authUrl.searchParams.set('scope', GOOGLE_SCOPES)
    authUrl.searchParams.set('include_granted_scopes', 'true')
    authUrl.searchParams.set('state', 'google_slides_auth')

    window.location.href = authUrl.toString()
}

export function handleGoogleAuthCallback(): { accessToken: string; expiresIn: number } | null {
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)

    const accessToken = params.get('access_token')
    const expiresIn = params.get('expires_in')
    const error = params.get('error')

    if (error) {
        throw new Error(`OAuth error: ${error}`)
    }

    if (accessToken && expiresIn) {
        // Calculate expiration time (expiresIn is in seconds)
        const expiresAt = Date.now() + parseInt(expiresIn) * 1000

        // Clean up the URL
        window.history.replaceState({}, document.title, window.location.pathname)

        return {
            accessToken,
            expiresIn: expiresAt
        }
    }

    return null
}
