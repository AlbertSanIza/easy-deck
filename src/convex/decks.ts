import { v } from 'convex/values'

import { mutation, query } from './_generated/server'

export const list = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            throw new Error('Not authenticated')
        }
        return await ctx.db
            .query('decks')
            .withIndex('by_user', (q) => q.eq('userId', identity.subject))
            .collect()
    }
})

