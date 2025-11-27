import { createFileRoute } from '@tanstack/react-router'
import { useConvexAuth, useQuery } from 'convex/react'

import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'

export const Route = createFileRoute('/dashboard/$id')({
    component: RouteComponent
})

function RouteComponent() {
    const { isAuthenticated } = useConvexAuth()
    const { id }: { id: Id<'decks'> } = Route.useParams()
    const deck = useQuery(api.decks.get, isAuthenticated ? { deckId: id } : 'skip')

    return (
        <div className="fixed inset-0 grid grid-rows-[auto_1fr]">
            <div className="border-b px-6 py-2">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
                    <h1 className="text-2xl font-semibold">{deck?.name || 'Loading...'}</h1>
                </div>
            </div>
            <div>
                <pre>{JSON.stringify(deck, null, 2)}</pre>
            </div>
        </div>
    )
}
