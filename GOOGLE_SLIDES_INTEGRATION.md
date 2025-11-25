# Google Slides Integration Guide

This guide explains how to integrate Google Slides API with Easy Deck.

## Overview

Easy Deck can create and modify Google Slides presentations through the Google Slides API. The integration allows:
- Creating new presentations
- Adding slides to presentations
- Updating slide content
- Managing slide layouts and formatting

## Prerequisites

1. A Google Cloud Platform account
2. Convex configured and running
3. Basic understanding of OAuth 2.0

## Step 1: Set Up Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the Google Slides API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google Slides API"
   - Click "Enable"

## Step 2: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Configure the consent screen if prompted
4. Select "Web application" as the application type
5. Add authorized redirect URIs:
   - For development: `http://localhost:5173/auth/callback`
   - For production: `https://your-domain.com/auth/callback`
6. Save the Client ID and Client Secret

## Step 3: Add Credentials to Convex

Add these to your Convex environment variables:

```bash
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback
```

## Step 4: Install Google API Client

```bash
npm install googleapis
```

## Step 5: Implement Authentication

Create `src/convex/google-auth.ts`:

```typescript
import { action } from './_generated/server'
import { v } from 'convex/values'
import { google } from 'googleapis'

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
)

export const getAuthUrl = action({
    args: {},
    handler: async () => {
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/presentations']
        })
        return { authUrl }
    }
})

export const handleCallback = action({
    args: { code: v.string() },
    handler: async (ctx, args) => {
        const { tokens } = await oauth2Client.getToken(args.code)
        oauth2Client.setCredentials(tokens)
        
        // Store tokens securely (implement your storage logic)
        // For production, encrypt tokens before storing
        
        return { success: true }
    }
})
```

## Step 6: Implement Slides Creation

Create `src/convex/google-slides.ts`:

```typescript
import { action } from './_generated/server'
import { v } from 'convex/values'
import { google } from 'googleapis'
import { api } from './_generated/api'

export const createPresentation = action({
    args: {
        title: v.string()
    },
    handler: async (ctx, args) => {
        // Get stored OAuth tokens (implement your retrieval logic)
        const tokens = await getStoredTokens(ctx)
        
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        )
        oauth2Client.setCredentials(tokens)
        
        const slides = google.slides({ version: 'v1', auth: oauth2Client })
        
        const presentation = await slides.presentations.create({
            requestBody: {
                title: args.title
            }
        })
        
        return {
            presentationId: presentation.data.presentationId,
            presentationUrl: `https://docs.google.com/presentation/d/${presentation.data.presentationId}/edit`
        }
    }
})

export const addSlide = action({
    args: {
        presentationId: v.string(),
        title: v.string(),
        content: v.array(v.object({
            type: v.string(),
            text: v.optional(v.string())
        }))
    },
    handler: async (ctx, args) => {
        const tokens = await getStoredTokens(ctx)
        
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        )
        oauth2Client.setCredentials(tokens)
        
        const slides = google.slides({ version: 'v1', auth: oauth2Client })
        
        // Create slide
        const slideId = `slide_${Date.now()}`
        
        const requests = [
            // Create slide
            {
                createSlide: {
                    objectId: slideId,
                    slideLayoutReference: {
                        predefinedLayout: 'TITLE_AND_BODY'
                    }
                }
            },
            // Add title
            {
                insertText: {
                    objectId: `${slideId}_title`,
                    text: args.title
                }
            }
        ]
        
        // Add content
        args.content.forEach((item, index) => {
            if (item.type === 'text' && item.text) {
                requests.push({
                    insertText: {
                        objectId: `${slideId}_body_${index}`,
                        text: item.text
                    }
                })
            }
        })
        
        await slides.presentations.batchUpdate({
            presentationId: args.presentationId,
            requestBody: {
                requests
            }
        })
        
        // Store slide in Convex database
        await ctx.runMutation(api.slides.create, {
            title: args.title,
            content: args.content
        })
        
        return { slideId }
    }
})

// Helper function to retrieve stored tokens
async function getStoredTokens(ctx: any) {
    // Implement your token retrieval logic
    // This could be from a Convex table with user authentication
    // For now, this is a placeholder
    throw new Error('Token storage not implemented')
}
```

## Step 7: Update AI Chat to Create Slides

Modify `src/convex/ai.ts` to parse AI responses and create slides:

```typescript
export const chat = action({
    args: { message: v.string() },
    handler: async (ctx, args) => {
        // ... existing code to add message and get context ...
        
        // Call OpenAI with function calling
        const result = await generateText({
            model: openai('gpt-4'),
            messages: chatMessages,
            tools: {
                createSlide: {
                    description: 'Create a new slide in the presentation',
                    parameters: z.object({
                        title: z.string(),
                        content: z.array(z.object({
                            type: z.enum(['text', 'image']),
                            text: z.string().optional()
                        }))
                    })
                }
            }
        })
        
        // Handle tool calls
        if (result.toolCalls) {
            for (const toolCall of result.toolCalls) {
                if (toolCall.toolName === 'createSlide') {
                    // Create slide in Google Slides
                    await ctx.runAction(api.googleSlides.addSlide, {
                        presentationId: 'your_presentation_id',
                        ...toolCall.args
                    })
                }
            }
        }
        
        // ... rest of the code ...
    }
})
```

## Step 8: Add Authentication UI

Create authentication flow in your React app:

```typescript
// src/routes/auth.tsx
export function AuthPage() {
    const getAuthUrl = useAction(api.googleAuth.getAuthUrl)
    
    const handleLogin = async () => {
        const { authUrl } = await getAuthUrl()
        window.location.href = authUrl
    }
    
    return (
        <button onClick={handleLogin}>
            Connect to Google Slides
        </button>
    )
}

// src/routes/auth/callback.tsx
export function CallbackPage() {
    const handleCallback = useAction(api.googleAuth.handleCallback)
    
    useEffect(() => {
        const code = new URLSearchParams(window.location.search).get('code')
        if (code) {
            handleCallback({ code }).then(() => {
                // Redirect to chat page
                window.location.href = '/chat'
            })
        }
    }, [])
    
    return <div>Authenticating...</div>
}
```

## Security Considerations

1. **Token Storage**: Store OAuth tokens securely
   - Encrypt tokens before storing in database
   - Use per-user encryption keys
   - Implement token refresh logic

2. **Scopes**: Request only necessary permissions
   - `https://www.googleapis.com/auth/presentations` for full access
   - Use read-only scope if modifications aren't needed

3. **HTTPS**: Always use HTTPS in production

4. **Rate Limiting**: Implement rate limiting for API calls

## Testing

1. Test authentication flow
2. Create a test presentation
3. Add slides with different content types
4. Verify slides appear correctly in Google Slides

## Common Issues

### "invalid_grant" Error
- Token expired - implement token refresh
- User revoked access - re-authenticate

### "403 Forbidden"
- Check API is enabled in Google Cloud Console
- Verify OAuth scopes are correct

### "404 Not Found"
- Check presentation ID is correct
- Ensure user has access to the presentation

## Next Steps

1. Implement user authentication
2. Add presentation management UI
3. Support images and other content types
4. Add real-time collaboration
5. Implement version history

## Resources

- [Google Slides API Documentation](https://developers.google.com/slides/api)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Slides API Samples](https://developers.google.com/slides/api/samples)
