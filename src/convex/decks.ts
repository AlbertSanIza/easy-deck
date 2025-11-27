import { v } from 'convex/values'

import { mutation, query } from './_generated/server'

export const get = query({
    args: { deckId: v.id('decks') },
    handler: async (ctx, { deckId }) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            return null
        }
        const deck = await ctx.db.get(deckId)
        if (!deck || deck.userId !== identity.subject) {
            return null
        }
        return deck
    }
})

export const list = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            return null
        }
        return await ctx.db
            .query('decks')
            .withIndex('by_user', (q) => q.eq('userId', identity.subject))
            .collect()
    }
})

export const create = mutation({
    args: {
        name: v.string(),
        googleSlidesId: v.optional(v.string())
    },
    handler: async (ctx, { name, googleSlidesId }) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            return null
        }
        const now = Date.now()
        return await ctx.db.insert('decks', { name, googleSlidesId, userId: identity.subject, updatedAt: now })
    }
})

export const update = mutation({
    args: {
        deckId: v.id('decks'),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        googleSlidesId: v.optional(v.string())
    },
    handler: async (ctx, { deckId, title, description, googleSlidesId }) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            return null
        }
        const deck = await ctx.db.get(deckId)
        if (!deck || deck.userId !== identity.subject) {
            return null
        }
        await ctx.db.patch(deckId, {
            ...(title !== undefined && { title }),
            ...(description !== undefined && { description }),
            ...(googleSlidesId !== undefined && { googleSlidesId }),
            updatedAt: Date.now()
        })
    }
})

export const remove = mutation({
    args: { deckId: v.id('decks') },
    handler: async (ctx, { deckId }) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            return null
        }
        const deck = await ctx.db.get(deckId)
        if (!deck || deck.userId !== identity.subject) {
            return null
        }
        const slides = await ctx.db
            .query('slides')
            .withIndex('by_deck', (q) => q.eq('deckId', deckId))
            .collect()
        for (const slide of slides) {
            await ctx.db.delete(slide._id)
        }
        await ctx.db.delete(deckId)
    }
})
