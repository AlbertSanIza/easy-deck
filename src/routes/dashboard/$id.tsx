import { createFileRoute, Link } from '@tanstack/react-router'
import { useConvexAuth, useQuery } from 'convex/react'
import { RefreshCwIcon } from 'lucide-react'

import { TopBar } from '@/components/TobBar'
import { Button } from '@/components/ui/button'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'

export const Route = createFileRoute('/dashboard/$id')({
    component: RouteComponent
})

function RouteComponent() {
    const { isAuthenticated } = useConvexAuth()
    const { id }: { id: Id<'decks'> } = Route.useParams()
    const deck = useQuery(api.decks.get, isAuthenticated ? { deckId: id } : 'skip')

    const previewUrl = deck?.googleSlidesId ? `https://docs.google.com/presentation/d/${deck.googleSlidesId}/preview` : null

    return (
        <div className="fixed inset-0 grid grid-rows-[auto_1fr]">
            <TopBar className="justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" asChild>
                        <Link to="/dashboard">Home</Link>
                    </Button>
                    <h1 className="text-2xl font-semibold">{deck?.name}</h1>
                </div>
                <Button disabled={!deck?.googleSlidesId}>
                    <RefreshCwIcon />
                    Sync
                </Button>
            </TopBar>
            <div className="grid grid-cols-[2fr_3fr] overflow-hidden">
                <div className="flex flex-col border-r">
                    <div className="flex-1">content</div>
                    <div className="border-t p-6">chat</div>
                </div>
                <div className="flex-1">
                    {previewUrl ? (
                        <iframe src={previewUrl} className="h-full w-full" title="Google Slides Preview" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-50 text-gray-500">No preview available</div>
                    )}
                </div>
            </div>
        </div>
    )
}
