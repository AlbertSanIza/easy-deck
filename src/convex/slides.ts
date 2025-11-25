import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query('slides').order('desc').collect()
    }
})

export const get = query({
    args: { id: v.id('slides') },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id)
    }
})

export const create = mutation({
    args: {
        title: v.string(),
        content: v.array(
            v.object({
                type: v.string(),
                text: v.optional(v.string()),
                imageUrl: v.optional(v.string())
            })
        )
    },
    handler: async (ctx, args) => {
        const slideId = await ctx.db.insert('slides', {
            title: args.title,
            content: args.content,
            createdAt: Date.now(),
            updatedAt: Date.now()
        })
        return slideId
    }
})

export const update = mutation({
    args: {
        id: v.id('slides'),
        title: v.optional(v.string()),
        content: v.optional(
            v.array(
                v.object({
                    type: v.string(),
                    text: v.optional(v.string()),
                    imageUrl: v.optional(v.string())
                })
            )
        )
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args
        await ctx.db.patch(id, {
            ...updates,
            updatedAt: Date.now()
        })
        return id
    }
})

export const remove = mutation({
    args: { id: v.id('slides') },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id)
    }
})
