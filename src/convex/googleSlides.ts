import { v } from 'convex/values'
import { api } from './_generated/api'
import { action, mutation, query } from './_generated/server'

// Store Google OAuth token
export const storeToken = mutation({
    args: {
        accessToken: v.string(),
        refreshToken: v.optional(v.string()),
        expiresAt: v.number()
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            throw new Error('Not authenticated')
        }
        const userId = identity.subject
        const now = Date.now()

        // Check if token exists
        const existing = await ctx.db
            .query('googleTokens')
            .withIndex('by_user', (q) => q.eq('userId', userId))
            .first()

        if (existing) {
            await ctx.db.patch(existing._id, {
                accessToken: args.accessToken,
                refreshToken: args.refreshToken,
                expiresAt: args.expiresAt
            })
            return existing._id
        } else {
            return await ctx.db.insert('googleTokens', {
                userId,
                accessToken: args.accessToken,
                refreshToken: args.refreshToken,
                expiresAt: args.expiresAt
            })
        }
    }
})

// Get Google OAuth token
export const getToken = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            return null
        }
        const userId = identity.subject
        return await ctx.db
            .query('googleTokens')
            .withIndex('by_user', (q) => q.eq('userId', userId))
            .first()
    }
})

// Create a new Google Slides presentation
export const createPresentation = action({
    args: {
        title: v.string()
    },
    handler: async (ctx, args): Promise<{ presentationId: string; title?: string }> => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            throw new Error('Not authenticated')
        }

        // Get the access token
        const token = await ctx.runQuery(api.googleSlides.getToken)
        if (!token || token.expiresAt < Date.now()) {
            throw new Error('Google authentication required. Please connect your Google account.')
        }

        // Create the presentation via Google Slides API
        const response: Response = await fetch('https://slides.googleapis.com/v1/presentations', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: args.title
            })
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Failed to create presentation: ${error}`)
        }

        const presentation = (await response.json()) as { presentationId: string; title?: string }
        return presentation
    }
})

// Get presentation details
export const getPresentation = action({
    args: {
        presentationId: v.string()
    },
    handler: async (ctx, args): Promise<{ presentationId: string; title?: string; slides?: unknown[] }> => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            throw new Error('Not authenticated')
        }

        const token = await ctx.runQuery(api.googleSlides.getToken)
        if (!token || token.expiresAt < Date.now()) {
            throw new Error('Google authentication required')
        }

        const response: Response = await fetch(`https://slides.googleapis.com/v1/presentations/${args.presentationId}`, {
            headers: {
                Authorization: `Bearer ${token.accessToken}`
            }
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Failed to get presentation: ${error}`)
        }

        return (await response.json()) as { presentationId: string; title?: string; slides?: unknown[] }
    }
})

// Update slide content
export const updateSlide = action({
    args: {
        presentationId: v.string(),
        slideId: v.string(),
        requests: v.array(v.any()) // Google Slides API requests
    },
    handler: async (ctx, args): Promise<unknown> => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            throw new Error('Not authenticated')
        }

        const token = await ctx.runQuery(api.googleSlides.getToken)
        if (!token || token.expiresAt < Date.now()) {
            throw new Error('Google authentication required')
        }

        const response: Response = await fetch(`https://slides.googleapis.com/v1/presentations/${args.presentationId}:batchUpdate`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                requests: args.requests
            })
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Failed to update slide: ${error}`)
        }

        return await response.json()
    }
})

// Add a new slide
export const addSlide = action({
    args: {
        presentationId: v.string(),
        insertionIndex: v.optional(v.number())
    },
    handler: async (ctx, args): Promise<unknown> => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            throw new Error('Not authenticated')
        }

        const token = await ctx.runQuery(api.googleSlides.getToken)
        if (!token || token.expiresAt < Date.now()) {
            throw new Error('Google authentication required')
        }

        const response: Response = await fetch(`https://slides.googleapis.com/v1/presentations/${args.presentationId}:batchUpdate`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                requests: [
                    {
                        createSlide: {
                            insertionIndex: args.insertionIndex,
                            slideLayoutReference: {
                                predefinedLayout: 'BLANK'
                            }
                        }
                    }
                ]
            })
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Failed to add slide: ${error}`)
        }

        return await response.json()
    }
})

// Link an existing Google Slides presentation
// Validates access and returns presentation details
export const linkExistingPresentation = action({
    args: {
        presentationId: v.string()
    },
    handler: async (ctx, args): Promise<{ presentationId: string; title?: string }> => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            throw new Error('Not authenticated')
        }

        const token = await ctx.runQuery(api.googleSlides.getToken)
        if (!token || token.expiresAt < Date.now()) {
            throw new Error('Google authentication required. Please connect your Google account.')
        }

        // Try to fetch the presentation to validate access
        const response: Response = await fetch(`https://slides.googleapis.com/v1/presentations/${args.presentationId}`, {
            headers: {
                Authorization: `Bearer ${token.accessToken}`
            }
        })

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('You do not have access to this presentation. Please make sure you have edit permissions.')
            } else if (response.status === 404) {
                throw new Error('Presentation not found. Please check the presentation ID or URL.')
            }
            const error = await response.text()
            throw new Error(`Failed to access presentation: ${error}`)
        }

        const presentation = (await response.json()) as { presentationId: string; title?: string }
        return presentation
    }
})

// Sync existing slides from a Google Slides presentation
export const syncSlides = action({
    args: {
        deckId: v.id('decks'),
        presentationId: v.string()
    },
    handler: async (ctx, args): Promise<{ slideCount: number; presentationTitle: string; slideIds: unknown[] }> => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            throw new Error('Not authenticated')
        }

        // Verify deck ownership
        const deck = await ctx.runQuery(api.decks.get, { deckId: args.deckId })
        if (!deck) {
            throw new Error('Deck not found')
        }

        const token = await ctx.runQuery(api.googleSlides.getToken)
        if (!token || token.expiresAt < Date.now()) {
            throw new Error('Google authentication required')
        }

        // Get presentation details
        const response: Response = await fetch(`https://slides.googleapis.com/v1/presentations/${args.presentationId}`, {
            headers: {
                Authorization: `Bearer ${token.accessToken}`
            }
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Failed to fetch presentation: ${error}`)
        }

        const presentation = (await response.json()) as { title: string; slides?: unknown[] }

        // Extract slides information
        const slides = presentation.slides || []

        // Delete existing slides for this deck
        const existingSlides = await ctx.runQuery(api.slides.list, { deckId: args.deckId })
        for (const slide of existingSlides) {
            // Delete slide directly from database
            await ctx.runMutation(api.slides.remove, { slideId: slide._id })
        }

        // Create slide entries for each slide in the presentation
        const slideIds: unknown[] = []
        for (let i = 0; i < slides.length; i++) {
            const slide = slides[i] as {
                objectId?: string
                pageElements?: Array<{ shape?: { text?: { textElements?: Array<{ textRun?: { content?: string } }> } } }>
            }

            // Try to extract text content from the slide
            let content = ''
            const pageElements = slide.pageElements || []
            for (const element of pageElements) {
                if (element.shape && element.shape.text && element.shape.text.textElements) {
                    const textElements = element.shape.text.textElements
                    for (const textEl of textElements) {
                        if (textEl.textRun && textEl.textRun.content) {
                            content += textEl.textRun.content
                        }
                    }
                }
            }

            const slideId = await ctx.runMutation(api.slides.create, {
                deckId: args.deckId,
                slideIndex: i,
                googleSlideId: slide.objectId,
                title: content.substring(0, 100) || `Slide ${i + 1}`, // Use first 100 chars as title
                content: content.substring(0, 500) // Store first 500 chars as content
            })
            slideIds.push(slideId)
        }

        return {
            slideCount: slides.length,
            presentationTitle: presentation.title,
            slideIds
        }
    }
})
