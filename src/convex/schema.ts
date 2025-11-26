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
})
