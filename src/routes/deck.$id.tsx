import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Authenticated, useAction, useMutation, useQuery } from 'convex/react'
import { ArrowLeft, ExternalLink, Link as LinkIcon, RefreshCw } from 'lucide-react'
import { useState } from 'react'

import { DeckChat } from '@/components/DeckChat'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { initiateGoogleAuth } from '@/lib/google-auth'
import { extractGoogleSlidesID } from '@/lib/utils'

export const Route = createFileRoute('/deck/$id')({
    component: DeckEditor
})

function DeckEditor() {
    const { id }: { id: Id<'decks'> } = Route.useParams()
    const navigate = useNavigate()
    const deck = useQuery(api.decks.get, { deckId: id })
    const updateDeck = useMutation(api.decks.update)
    const createPresentation = useAction(api.googleSlides.createPresentation)
    const linkPresentation = useAction(api.googleSlides.linkExistingPresentation)
    const syncSlides = useAction(api.googleSlides.syncSlides)
    const getToken = useQuery(api.googleSlides.getToken)
    const [selectedSlideId] = useState<string | null>(null) // Reserved for future per-slide chat feature
    const [isConnecting, setIsConnecting] = useState(false)
    const [isLinking, setIsLinking] = useState(false)
    const [isSyncing, setIsSyncing] = useState(false)
    const [showLinkInput, setShowLinkInput] = useState(false)
    const [linkUrl, setLinkUrl] = useState('')

    const handleConnectGoogle = async () => {
        if (!deck) return

        // Check if user already has a token
        if (getToken && getToken.expiresAt > Date.now()) {
            // User is already authenticated, create presentation
            setIsConnecting(true)
            try {
                const presentation = await createPresentation({ title: deck.name })
                await updateDeck({
                    deckId: deckId,
                    googleSlidesId: presentation.presentationId
                })
            } catch (error: any) {
                alert(`Failed to create presentation: ${error.message}`)
            } finally {
                setIsConnecting(false)
            }
        } else {
            // Need to authenticate first
            try {
                initiateGoogleAuth()
            } catch (error: any) {
                alert(`Failed to initiate authentication: ${error.message}`)
            }
        }
    }

    const handleLinkExisting = async () => {
        if (!deck || !linkUrl.trim()) return
        const presentationId = extractGoogleSlidesID(linkUrl)
        if (!presentationId) {
            alert('Invalid Google Slides URL or ID. Please provide a valid Google Slides presentation URL or ID.')
            return
        }

        setIsLinking(true)
        try {
            if (!getToken || getToken.expiresAt < Date.now()) {
                initiateGoogleAuth()
                return
            }

            // Validate access to the presentation
            const presentation = await linkPresentation({ presentationId })

            // Update deck with the presentation ID
            await updateDeck({
                deckId: deckId,
                googleSlidesId: presentationId,
                title: presentation.title || deck.name
            })

            // Sync slides from the presentation
            await syncSlides({
                deckId: deckId,
                presentationId
            })

            setShowLinkInput(false)
            setLinkUrl('')
        } catch (error: any) {
            alert(`Failed to link presentation: ${error.message}`)
        } finally {
            setIsLinking(false)
        }
    }

    const handleSyncSlides = async () => {
        if (!deck || !deck.googleSlidesId) return

        setIsSyncing(true)
        try {
            await syncSlides({
                deckId: deckId,
                presentationId: deck.googleSlidesId
            })
            alert('Slides synced successfully!')
        } catch (error: any) {
            alert(`Failed to sync slides: ${error.message}`)
        } finally {
            setIsSyncing(false)
        }
    }

    if (!deck) {
        return <div className="container mx-auto p-6">Loading...</div>
    }

    const previewUrl = deck.googleSlidesId ? `https://docs.google.com/presentation/d/${deck.googleSlidesId}/preview` : null

    return (
        <Authenticated>
            <div className="flex h-screen flex-col">
                {/* Header */}
                <div className="border-b bg-background">
                    <div className="container mx-auto flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/dashboard' })}>
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold">{deck.name}</h1>
                                {deck.description && <p className="text-sm text-muted-foreground">{deck.description}</p>}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {deck.googleSlidesId && (
                                <>
                                    <Button variant="outline" onClick={handleSyncSlides} disabled={isSyncing} title="Sync slides from Google Slides">
                                        <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                                        Sync
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <a
                                            href={`https://docs.google.com/presentation/d/${deck.googleSlidesId}/edit`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <ExternalLink className="mr-2 h-4 w-4" />
                                            Open in Google Slides
                                        </a>
                                    </Button>
                                </>
                            )}
                            {!deck.googleSlidesId && (
                                <>
                                    {!showLinkInput ? (
                                        <>
                                            <Button onClick={handleConnectGoogle} disabled={isConnecting}>
                                                {isConnecting ? 'Connecting...' : 'Create New Presentation'}
                                            </Button>
                                            <Button variant="outline" onClick={() => setShowLinkInput(true)}>
                                                <LinkIcon className="mr-2 h-4 w-4" />
                                                Link Existing
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Paste Google Slides URL or ID..."
                                                value={linkUrl}
                                                onChange={(e) => setLinkUrl(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleLinkExisting()
                                                    } else if (e.key === 'Escape') {
                                                        setShowLinkInput(false)
                                                        setLinkUrl('')
                                                    }
                                                }}
                                                className="w-64"
                                                autoFocus
                                            />
                                            <Button onClick={handleLinkExisting} disabled={isLinking || !linkUrl.trim()}>
                                                {isLinking ? 'Linking...' : 'Link'}
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
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Chat Panel */}
                    <div className="flex w-1/2 flex-col border-r bg-background">
                        <div className="border-b p-4">
                            <h2 className="font-semibold">{selectedSlideId ? 'Slide Chat' : 'Deck Chat'}</h2>
                            <p className="text-sm text-muted-foreground">{selectedSlideId ? 'Chat about this specific slide' : 'Chat about the entire deck'}</p>
                        </div>
                        <DeckChat deckId={id} slideId={selectedSlideId as any} />
                    </div>

                    {/* Preview Panel */}
                    <div className="flex w-1/2 flex-col bg-black">
                        <div className="border-b bg-background p-4">
                            <h2 className="font-semibold">Preview</h2>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            {previewUrl ? (
                                <iframe src={previewUrl} className="h-full w-full border-0" title="Google Slides Preview" />
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    <div className="text-center">
                                        <p className="text-muted-foreground">Connect to Google Slides to see preview</p>
                                        <Button onClick={handleConnectGoogle} className="mt-4" disabled={isConnecting}>
                                            {isConnecting ? 'Connecting...' : 'Connect to Google Slides'}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Authenticated>
    )
}
