import { SignInButton, UserButton } from '@clerk/clerk-react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Authenticated, AuthLoading, Unauthenticated, useAction, useMutation, useQuery } from 'convex/react'
import { Download, Plus } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { api } from '@/convex/_generated/api'
import { initiateGoogleAuth } from '@/lib/googleAuth'
import { extractPresentationId } from '@/lib/googleSlidesUtils'

export const Route = createFileRoute('/dashboard')({
    component: RouteComponent
})

function RouteComponent() {
    const [input, setInput] = useState('')
    const createDeck = useMutation(api.decks.create)

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
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline">Cancel</Button>
                                        </DialogClose>
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
                    <Content />
                </div>
            </Authenticated>
        </>
    )
}

function Content() {
    const tasks = useQuery(api.tasks.get)

    return (
        <div>
            {tasks?.map(({ _id, text }) => (
                <div key={_id}>{text}</div>
            ))}
        </div>
    )
}
