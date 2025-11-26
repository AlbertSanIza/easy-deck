import { SignInButton, UserButton } from '@clerk/clerk-react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Authenticated, AuthLoading, Unauthenticated, useAction, useMutation, useQuery } from 'convex/react'
import { Download, Plus } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { api } from '@/convex/_generated/api'
import { initiateGoogleAuth } from '@/lib/googleAuth'
import { extractPresentationId } from '@/lib/googleSlidesUtils'

export const Route = createFileRoute('/dashboard')({
    component: RouteComponent
})

function RouteComponent() {
    const navigate = useNavigate()
    const [input, setInput] = useState('')
    const createDeck = useMutation(api.decks.create)
    const getToken = useQuery(api.googleSlides.getToken)
    const syncSlides = useAction(api.googleSlides.syncSlides)
    const linkPresentation = useAction(api.googleSlides.linkExistingPresentation)

    return (
        <>
            <AuthLoading>
                <div className="fixed inset-0 flex items-center justify-center">Loading...</div>
            </AuthLoading>
            <Unauthenticated>
                <div className="fixed inset-0 flex items-center justify-center">
                    <Button asChild>
                        <SignInButton />
                    </Button>
                </div>
            </Unauthenticated>
            <Authenticated>
                <div className="flex items-center justify-between gap-6 border-b px-6 py-2">
                    <div>
                        <h1 className="text-3xl font-semibold">My Decks</h1>
                        <div className="text-muted-foreground">Create and manage your Google Slides presentations</div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex gap-3">
                            <Dialog onOpenChange={() => setInput('')}>
                                <DialogTrigger asChild>
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
                                                const presentationId = extractPresentationId(input.trim())
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
                                                    navigate({ to: '/deck/$id', params: { id: deckId } })
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
                                <DialogTrigger asChild>
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
                        <div className="size-7 rounded-full bg-muted-foreground">
                            <UserButton />
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <Decks />
                </div>
            </Authenticated>
        </>
    )
}

function Decks() {
    const decks = useQuery(api.decks.list)
    return decks === undefined ? (
        <div className="text-center text-muted-foreground">Loading decks...</div>
    ) : decks.length === 0 ? (
        <Card>
            <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No decks yet. Create your first deck to get started!</p>
            </CardContent>
        </Card>
    ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {decks.map((deck: { _id: string; name: string; description?: string; googleSlidesId?: string }) => (
                <Link key={deck._id} to="/deck/$id" params={{ id: deck._id }}>
                    <Card className="cursor-pointer transition-shadow hover:shadow-lg">
                        <CardHeader>
                            <CardTitle>{deck.name}</CardTitle>
                            {deck.description && <CardDescription>{deck.description}</CardDescription>}
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground">
                                {deck.googleSlidesId ? <span className="text-green-600">Connected to Google Slides</span> : <span>Not connected</span>}
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    )
}
