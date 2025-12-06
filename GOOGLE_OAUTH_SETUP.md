# Google OAuth Setup Guide

## Error: "access_denied" or "App is in testing mode"

This error occurs when your Google Cloud project is in **Testing** mode and your email isn't added as a test user.

## Solution: Add Test Users

### Step 1: Go to Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** > **OAuth consent screen**

### Step 2: Add Test Users

1. Scroll down to the **Test users** section
2. Click **+ ADD USERS**
3. Add your email address (the one you're using to sign in)
4. Click **ADD**
5. Save the changes

### Step 3: Try Again

1. Clear your browser cache/cookies for Google accounts
2. Try signing in again
3. You should now see a warning about the app not being verified (this is normal for testing)
4. Click **Continue** to proceed

## Alternative: Publish Your App (For Production)

If you want to make the app available to all users without adding them individually:

### Option 1: Publish for Internal Use (Recommended for Development)

1. In **OAuth consent screen**, change **User type** to **Internal**
2. This only works if you're using a Google Workspace account
3. All users in your organization can access it

### Option 2: Publish for External Use

1. Complete the OAuth consent screen configuration:
    - App name
    - User support email
    - Developer contact information
    - App logo (optional)
    - App domain (optional)
    - Authorized domains

2. Add scopes:
    - `https://www.googleapis.com/auth/presentations`
    - `https://www.googleapis.com/auth/presentations.readonly`

3. Submit for verification (if using sensitive scopes):
    - Google may require verification for certain scopes
    - This process can take several days

4. Once verified, click **PUBLISH APP**

## Quick Fix for Development

For immediate testing, the easiest solution is:

1. **Add yourself as a test user** (see Step 2 above)
2. **Add any other testers** who need access
3. This works immediately without verification

## Important Notes

- **Test users** can access the app immediately
- **External users** (not in test list) will see the error you encountered
- For production apps, you'll need to complete verification
- The verification process is required for apps that:
    - Use sensitive scopes
    - Are accessed by users outside your organization
    - Need to be publicly available

## Troubleshooting

### Still seeing the error after adding test users?

1. **Wait a few minutes** - Changes can take a moment to propagate
2. **Sign out completely** from your Google account
3. **Clear browser cache** and cookies
4. **Try in an incognito/private window**
5. **Check the email** - Make sure you're using the exact email you added

### Error persists?

- Verify you're using the correct Google Cloud project
- Check that the OAuth client ID matches in your `.env` file
- Ensure the redirect URI is correctly configured:
    - `http://localhost:5173/auth/google/callback` (for development)
    - Your production domain + `/auth/google/callback` (for production)

## Redirect URI Configuration

Make sure these redirect URIs are added in your OAuth 2.0 Client:

1. Go to **APIs & Services** > **Credentials**
2. Click on your OAuth 2.0 Client ID
3. Under **Authorized redirect URIs**, add:
    - `http://localhost:5173/auth/google/callback` (development)
    - `https://yourdomain.com/auth/google/callback` (production)

## Next Steps

Once you've added test users:

1. The app will work for those users immediately
2. You can continue development and testing
3. When ready for production, follow the publishing steps above
