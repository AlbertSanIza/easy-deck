import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
    decks: defineTable({
        userId: v.string(),
        name: v.string(),
        googleSlidesId: v.optional(v.string()),
        updatedAt: v.number()
    })
        .index('by_user', ['userId'])
        .index('by_google_slides_id', ['googleSlidesId']),
    slides: defineTable({
        deckId: v.id('decks'),
        slideIndex: v.number(),
        googleSlideId: v.optional(v.string()),
        title: v.optional(v.string()),
        content: v.optional(v.string()),
        updatedAt: v.number()
    })
        .index('by_deck', ['deckId'])
        .index('by_deck_and_index', ['deckId', 'slideIndex']),
    googleTokens: defineTable({
        userId: v.string(),
        accessToken: v.string(),
        refreshToken: v.optional(v.string()),
        expiresAt: v.number()
    }).index('by_user', ['userId'])
})
