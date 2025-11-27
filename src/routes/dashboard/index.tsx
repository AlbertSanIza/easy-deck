import { UserButton } from '@clerk/clerk-react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useAction, useConvexAuth, useMutation, useQuery } from 'convex/react'
import { Download, Plus } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/convex/_generated/api'
import { initiateGoogleAuth } from '@/lib/google-auth'
import { extractGoogleSlidesID } from '@/lib/utils'

export const Route = createFileRoute('/dashboard/')({
    component: RouteComponent
})

function RouteComponent() {
    const navigate = useNavigate()
    const [input, setInput] = useState('')
    const { isAuthenticated } = useConvexAuth()
    const createDeck = useMutation(api.decks.create)
    const getToken = useQuery(api.googleSlides.getToken)
    const syncSlides = useAction(api.googleSlides.syncSlides)
    const linkPresentation = useAction(api.googleSlides.linkExistingPresentation)

    return (
        <>
            <div className="sticky top-0 border-b bg-white px-6 py-2">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-semibold">My Decks</h1>
                        <div className="text-muted-foreground">Create and manage your Google Slides presentations</div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex gap-3">
                            <Dialog onOpenChange={() => setInput('')}>
                                <DialogTrigger disabled={!isAuthenticated} asChild>
                                    <Button variant="outline">
                                        <Download className="size-4" />
                                        Import
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Import Existing Google Slides Deck</DialogTitle>
                                        <DialogDescription>
                                            Paste a Google Slides URL or presentation ID to import an existing deck. Make sure you have edit access to the
                                            presentation. The deck will be synced with your Google Slides presentation.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <Input
                                        placeholder="https://docs.google.com/presentation/d/... or presentation ID"
                                        value={input}
                                        onChange={(event) => setInput(event.target.value)}
                                        autoFocus
                                    />
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline">Cancel</Button>
                                        </DialogClose>
                                        <Button
                                            onClick={async () => {
                                                const presentationId = extractGoogleSlidesID(input)
                                                if (!presentationId) {
                                                    alert('Invalid Google Slides URL or ID. Please provide a valid Google Slides presentation URL or ID.')
                                                    return
                                                }
                                                try {
                                                    if (!getToken || getToken.expiresAt < Date.now()) {
                                                        initiateGoogleAuth()
                                                        return
                                                    }
                                                    const presentation = await linkPresentation({ presentationId })
                                                    const deckId = await createDeck({
                                                        name: presentation.title || 'Imported Deck',
                                                        googleSlidesId: presentationId
                                                    })
                                                    await syncSlides({ deckId, presentationId })
                                                    navigate({ to: '/dashboard/$id', params: { id: deckId } })
                                                } catch (error: unknown) {
                                                    const msg = error instanceof Error ? error.message : 'Unknown error'
                                                    alert(`Failed to import deck: ${msg}`)
                                                }
                                            }}
                                            disabled={!input.trim()}
                                        >
                                            Import
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                            <Dialog onOpenChange={() => setInput('')}>
                                <DialogTrigger disabled={!isAuthenticated} asChild>
                                    <Button>
                                        <Plus className="size-4" />
                                        New Deck
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Create New Deck</DialogTitle>
                                        <DialogDescription>Enter a title for your new presentation deck</DialogDescription>
                                    </DialogHeader>
                                    <Input placeholder="Deck title..." value={input} onChange={(event) => setInput(event.target.value)} autoFocus />
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline">Cancel</Button>
                                        </DialogClose>
                                        <DialogClose asChild>
                                            <Button disabled={!input.trim()} onClick={() => createDeck({ name: input.trim() })}>
                                                Create
                                            </Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <div className="size-7 rounded-full bg-gray-200">
                            <UserButton />
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-6">
                <Decks />
            </div>
        </>
    )
}

function Decks() {
    const { isAuthenticated } = useConvexAuth()
    const decks = useQuery(api.decks.list, isAuthenticated ? undefined : 'skip')

    return (
        <div className="mx-auto max-w-7xl">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {decks === undefined && Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-18.5 shadow-sm" />)}
                {decks?.length === 0 && <div className="text-center text-muted-foreground">No decks found. Create or import a deck to get started.</div>}
                {decks?.map((deck: { _id: string; name: string; description?: string; googleSlidesId?: string }) => (
                    <Link to="/dashboard/$id" key={deck._id} params={{ id: deck._id }}>
                        <Card className="cursor-pointer transition-shadow hover:shadow-md">
                            <CardHeader>
                                <CardTitle>{deck.name}</CardTitle>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
