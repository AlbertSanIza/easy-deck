import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
    tasks: defineTable({
        text: v.string(),
        isCompleted: v.boolean()
    }),
    messages: defineTable({
        role: v.union(v.literal('user'), v.literal('assistant'), v.literal('system')),
        content: v.string(),
        createdAt: v.number()
    }),
    slides: defineTable({
        title: v.string(),
        content: v.array(
            v.object({
                type: v.string(),
                text: v.optional(v.string()),
                imageUrl: v.optional(v.string())
            })
        ),
        createdAt: v.number(),
        updatedAt: v.number()
    })
})
