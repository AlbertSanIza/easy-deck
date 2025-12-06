import { v } from 'convex/values'
import { api } from './_generated/api'
import { action } from './_generated/server'

// This action will handle AI chat interactions with Google Slides context
export const chat = action({
    args: {
        deckId: v.id('decks'),
        message: v.string(),
        slideId: v.optional(v.id('slides'))
    },
    handler: async (ctx, args): Promise<{ response: string; needsGoogleAuth: boolean; canExecute: boolean }> => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            throw new Error('Not authenticated')
        }

        // Get deck information
        const deck = await ctx.runQuery(api.decks.get, { deckId: args.deckId })
        if (!deck) {
            throw new Error('Deck not found')
        }

        // Get slides if available (for future AI context)
        // const slides = await ctx.runQuery(api.slides.list, { deckId: args.deckId })

        // Get Google token
        const token = await ctx.runQuery(api.googleSlides.getToken)
        if (!token || token.expiresAt < Date.now()) {
            throw new Error('Google authentication required. Please connect your Google account.')
        }

        // Build context about the deck (for future AI integration)
        // const context = `You are an AI assistant helping to create and manage Google Slides presentations.
        //
        // Deck Information:
        // - Title: ${deck.title}
        // ${deck.description ? `- Description: ${deck.description}` : ''}
        // ${deck.googleSlidesId ? `- Google Slides ID: ${deck.googleSlidesId}` : '- Not yet connected to Google Slides'}
        //
        // ${slides && slides.length > 0 ? `Current Slides (${slides.length}):\n${slides.map((s: { title?: string; slideIndex: number; content?: string }, i: number) => `  ${i + 1}. ${s.title || `Slide ${s.slideIndex + 1}`}${s.content ? ` - ${s.content}` : ''}`).join('\n')}` : 'No slides yet.'}
        //
        // ${args.slideId ? `\nUser is asking about a specific slide (ID: ${args.slideId}).` : '\nUser is asking about the entire deck.'}
        //
        // User's request: ${args.message}
        //
        // Instructions:
        // 1. Understand what the user wants to do with the presentation
        // 2. If they want to create/modify slides, provide specific Google Slides API requests
        // 3. Be helpful and suggest improvements
        // 4. If the deck is not connected to Google Slides, remind them to connect first
        //
        // Respond in a helpful, conversational way. If you need to make changes to the slides, provide the specific API requests needed.`

        // For now, we'll use a simple response
        // In production, you'd integrate with OpenAI or another AI provider
        // This is a placeholder that shows the structure

        // TODO: Integrate with actual AI provider (OpenAI, Anthropic, etc.)
        // For now, return a helpful message
        return {
            response: `I understand you want to: ${args.message}

${!deck.googleSlidesId ? '⚠️ First, please connect your deck to Google Slides using the "Connect to Google Slides" button.' : ''}

I can help you:
- Create new slides
- Modify existing slide content
- Update text, images, and layouts
- Reorganize slides
- Apply themes and styles

${deck.googleSlidesId ? 'Your deck is connected! I can make changes directly.' : 'Once connected, I can make changes directly to your Google Slides presentation.'}

What would you like me to do specifically?`,
            needsGoogleAuth: !deck.googleSlidesId,
            canExecute: !!deck.googleSlidesId
        }
    }
})

// Execute AI-generated changes to Google Slides
export const executeSlidesUpdate = action({
    args: {
        deckId: v.id('decks'),
        requests: v.array(v.any()) // Google Slides API requests
    },
    handler: async (ctx, args): Promise<unknown> => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            throw new Error('Not authenticated')
        }

        const deck = await ctx.runQuery(api.decks.get, { deckId: args.deckId })
        if (!deck || !deck.googleSlidesId) {
            throw new Error('Deck not found or not connected to Google Slides')
        }

        // Execute the batch update
        return await ctx.runAction(api.googleSlides.updateSlide, {
            presentationId: deck.googleSlidesId,
            slideId: '', // Not needed for batch update
            requests: args.requests
        })
    }
})
