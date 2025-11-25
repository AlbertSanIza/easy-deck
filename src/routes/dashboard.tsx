import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'

import { api } from '@/convex/_generated/api'

export const Route = createFileRoute('/dashboard')({
    component: RouteComponent
})

function RouteComponent() {
    const tasks = useQuery(api.tasks.get)

    return (
        <>
            <div>
                Hello "/dashboard"!
                {tasks?.map(({ _id, text }) => (
                    <div key={_id}>{text}</div>
                ))}
            </div>
        </>
    )
}
