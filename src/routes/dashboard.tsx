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
