import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

// Get all slides for a deck
export const list = query({
    args: { deckId: v.id('decks') },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            throw new Error('Not authenticated')
        }
        const deck = await ctx.db.get(args.deckId)
        if (!deck) {
            throw new Error('Deck not found')
        }
        if (deck.userId !== identity.subject) {
            throw new Error('Unauthorized')
        }
        return await ctx.db
            .query('slides')
            .withIndex('by_deck', (q) => q.eq('deckId', args.deckId))
            .order('asc')
            .collect()
    }
})

// Get a single slide
export const get = query({
    args: { slideId: v.id('slides') },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            throw new Error('Not authenticated')
        }
        const slide = await ctx.db.get(args.slideId)
        if (!slide) {
            throw new Error('Slide not found')
        }
        const deck = await ctx.db.get(slide.deckId)
        if (!deck || deck.userId !== identity.subject) {
            throw new Error('Unauthorized')
        }
        return slide
    }
})

// Create a new slide
export const create = mutation({
    args: {
        deckId: v.id('decks'),
        slideIndex: v.number(),
        googleSlideId: v.optional(v.string()),
        title: v.optional(v.string()),
        content: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            throw new Error('Not authenticated')
        }
        const deck = await ctx.db.get(args.deckId)
        if (!deck) {
            throw new Error('Deck not found')
        }
        if (deck.userId !== identity.subject) {
            throw new Error('Unauthorized')
        }
        const now = Date.now()
        return await ctx.db.insert('slides', {
            deckId: args.deckId,
            slideIndex: args.slideIndex,
            googleSlideId: args.googleSlideId,
            title: args.title,
            content: args.content,
            updatedAt: now
        })
    }
})

// Update a slide
export const update = mutation({
    args: {
        slideId: v.id('slides'),
        title: v.optional(v.string()),
        content: v.optional(v.string()),
        googleSlideId: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            throw new Error('Not authenticated')
        }
        const slide = await ctx.db.get(args.slideId)
        if (!slide) {
            throw new Error('Slide not found')
        }
        const deck = await ctx.db.get(slide.deckId)
        if (!deck || deck.userId !== identity.subject) {
            throw new Error('Unauthorized')
        }
        await ctx.db.patch(args.slideId, {
            ...(args.title !== undefined && { title: args.title }),
            ...(args.content !== undefined && { content: args.content }),
            ...(args.googleSlideId !== undefined && { googleSlideId: args.googleSlideId }),
            updatedAt: Date.now()
        })
    }
})

// Remove a slide
export const remove = mutation({
    args: { slideId: v.id('slides') },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            throw new Error('Not authenticated')
        }
        const slide = await ctx.db.get(args.slideId)
        if (!slide) {
            throw new Error('Slide not found')
        }
        const deck = await ctx.db.get(slide.deckId)
        if (!deck || deck.userId !== identity.subject) {
            throw new Error('Unauthorized')
        }
        await ctx.db.delete(args.slideId)
    }
})
