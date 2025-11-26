import { SignInButton, UserButton } from '@clerk/clerk-react'
import { createFileRoute } from '@tanstack/react-router'
import { Authenticated, AuthLoading, Unauthenticated, useQuery } from 'convex/react'

import { api } from '@/convex/_generated/api'

export const Route = createFileRoute('/dashboard')({
    component: RouteComponent
})

function RouteComponent() {
    return (
        <>
            <main>
                <Unauthenticated>
                    <SignInButton />
                </Unauthenticated>
                <Authenticated>
                    <UserButton />
            <AuthLoading>
                <div className="fixed inset-0 flex items-center justify-center">Loading...</div>
            </AuthLoading>
                    <Content />
                </Authenticated>
                <AuthLoading>
                    <p>LOADING...</p>
                </AuthLoading>
            </main>
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
