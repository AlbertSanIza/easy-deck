import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query('messages').order('desc').take(100)
    }
})

export const add = mutation({
    args: {
        role: v.union(v.literal('user'), v.literal('assistant'), v.literal('system')),
        content: v.string()
    },
    handler: async (ctx, args) => {
        const messageId = await ctx.db.insert('messages', {
            role: args.role,
            content: args.content,
            createdAt: Date.now()
        })
        return messageId
    }
})

export const clear = mutation({
    args: {},
    handler: async (ctx) => {
        const messages = await ctx.db.query('messages').collect()
        for (const message of messages) {
            await ctx.db.delete(message._id)
        }
    }
})
