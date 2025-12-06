import { createFileRoute, Link } from '@tanstack/react-router'
import { useAction, useConvexAuth, useMutation, useQuery } from 'convex/react'
import { ExternalLinkIcon, LinkIcon, LoaderIcon, PlusIcon, RefreshCwIcon } from 'lucide-react'
import { useState } from 'react'

import { DeckChat } from '@/components/DeckChat'
import { TopBar } from '@/components/TobBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { initiateGoogleAuth } from '@/lib/google-auth'
import { extractGoogleSlidesID } from '@/lib/utils'

export const Route = createFileRoute('/dashboard/$id')({
    component: RouteComponent
})

function RouteComponent() {
    const { isAuthenticated } = useConvexAuth()
    const { id }: { id: Id<'decks'> } = Route.useParams()

    const deck = useQuery(api.decks.get, isAuthenticated ? { deckId: id } : 'skip')
    const slides = useQuery(api.slides.list, isAuthenticated && deck ? { deckId: id } : 'skip')
    const googleToken = useQuery(api.googleSlides.getToken)

    const updateDeck = useMutation(api.decks.update)
    const createPresentation = useAction(api.googleSlides.createPresentation)
    const linkPresentation = useAction(api.googleSlides.linkExistingPresentation)
    const syncSlides = useAction(api.googleSlides.syncSlides)

    const [isCreating, setIsCreating] = useState(false)
    const [isLinking, setIsLinking] = useState(false)
    const [isSyncing, setIsSyncing] = useState(false)
    const [showLinkInput, setShowLinkInput] = useState(false)
    const [linkUrl, setLinkUrl] = useState('')

    const isGoogleConnected = googleToken && googleToken.expiresAt > Date.now()
    const previewUrl = deck?.googleSlidesId ? `https://docs.google.com/presentation/d/${deck.googleSlidesId}/preview` : null

    const handleCreatePresentation = async () => {
        if (!deck) return

        if (!isGoogleConnected) {
            initiateGoogleAuth()
            return
        }

        setIsCreating(true)
        try {
            const presentation = await createPresentation({ title: deck.name })
            await updateDeck({ deckId: id, googleSlidesId: presentation.presentationId })
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error'
            alert(`Failed to create presentation: ${message}`)
        } finally {
            setIsCreating(false)
        }
    }

    const handleLinkPresentation = async () => {
        if (!deck || !linkUrl.trim()) return

        const presentationId = extractGoogleSlidesID(linkUrl)
        if (!presentationId) {
            alert('Invalid Google Slides URL or ID')
            return
        }

        if (!isGoogleConnected) {
            initiateGoogleAuth()
            return
        }

        setIsLinking(true)
        try {
            const presentation = await linkPresentation({ presentationId })
            await updateDeck({ deckId: id, googleSlidesId: presentationId, title: presentation.title })
            await syncSlides({ deckId: id, presentationId })
            setShowLinkInput(false)
            setLinkUrl('')
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error'
            alert(`Failed to link presentation: ${message}`)
        } finally {
            setIsLinking(false)
        }
    }

    const handleSync = async () => {
        if (!deck?.googleSlidesId) return

        setIsSyncing(true)
        try {
            await syncSlides({ deckId: id, presentationId: deck.googleSlidesId })
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error'
            alert(`Failed to sync: ${message}`)
        } finally {
            setIsSyncing(false)
        }
    }

    if (!deck) {
        return (
            <div className="flex h-screen items-center justify-center">
                <LoaderIcon className="size-6 animate-spin" />
            </div>
        )
    }

    return (
        <div className="fixed inset-0 grid grid-rows-[auto_1fr]">
            <TopBar className="justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" asChild>
                        <Link to="/dashboard">Home</Link>
                    </Button>
                    <h1 className="text-2xl font-semibold">{deck.name}</h1>
                </div>
                <div className="flex items-center gap-2">
                    {deck.googleSlidesId ? (
                        <>
                            <Button variant="outline" onClick={handleSync} disabled={isSyncing}>
                                <RefreshCwIcon className={isSyncing ? 'animate-spin' : ''} />
                                Sync
                            </Button>
                            <Button variant="outline" asChild>
                                <a
                                    href={`https://docs.google.com/presentation/d/${deck.googleSlidesId}/edit`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <ExternalLinkIcon />
                                    Open in Google Slides
                                </a>
                            </Button>
                        </>
                    ) : showLinkInput ? (
                        <>
                            <Input
                                placeholder="Paste Google Slides URL..."
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleLinkPresentation()
                                    if (e.key === 'Escape') {
                                        setShowLinkInput(false)
                                        setLinkUrl('')
                                    }
                                }}
                                className="w-64"
                                autoFocus
                            />
                            <Button onClick={handleLinkPresentation} disabled={isLinking || !linkUrl.trim()}>
                                {isLinking ? <LoaderIcon className="animate-spin" /> : 'Link'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowLinkInput(false)
                                    setLinkUrl('')
                                }}
                            >
                                Cancel
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button onClick={handleCreatePresentation} disabled={isCreating}>
                                {isCreating ? <LoaderIcon className="animate-spin" /> : <PlusIcon />}
                                Create Presentation
                            </Button>
                            <Button variant="outline" onClick={() => setShowLinkInput(true)}>
                                <LinkIcon />
                                Link Existing
                            </Button>
                        </>
                    )}
                </div>
            </TopBar>

            <div className="grid grid-cols-[2fr_3fr] overflow-hidden">
                <div className="flex flex-col border-r">
                    {/* Slides List */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Slides</h2>
                        {slides && slides.length > 0 ? (
                            <div className="space-y-2">
                                {slides.map((slide, index) => (
                                    <div key={slide._id} className="rounded-lg border bg-card p-3 text-sm">
                                        <div className="font-medium">Slide {index + 1}</div>
                                        {slide.title && <div className="mt-1 truncate text-muted-foreground">{slide.title}</div>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground">
                                {deck.googleSlidesId ? 'No slides synced yet. Click Sync to import slides.' : 'Connect to Google Slides to get started.'}
                            </div>
                        )}
                    </div>

                    {/* Chat */}
                    <div className="h-80 border-t">
                        <DeckChat deckId={id} />
                    </div>
                </div>

                {/* Preview */}
                <div className="flex flex-col">
                    {previewUrl ? (
                        <iframe src={previewUrl} className="h-full w-full" title="Google Slides Preview" />
                    ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-muted/30">
                            <p className="text-muted-foreground">Connect to Google Slides to see preview</p>
                            <Button onClick={handleCreatePresentation} disabled={isCreating}>
                                {isCreating ? <LoaderIcon className="animate-spin" /> : <PlusIcon />}
                                Create Presentation
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
