import { SignInButton } from '@clerk/clerk-react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Authenticated, Unauthenticated } from 'convex/react'

import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({
    component: RouteComponent
})

function RouteComponent() {
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 p-6 text-8xl">
            <div>EASY DECK</div>
            <Unauthenticated>
                <Button asChild>
                    <SignInButton />
                </Button>
            </Unauthenticated>
            <Authenticated>
                <Button asChild>
                    <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
            </Authenticated>
        </div>
    )
}
