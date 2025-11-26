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
                            <Button variant="outline">Import</Button>
                            <Button>New Deck</Button>
                        </div>
                        <UserButton />
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
