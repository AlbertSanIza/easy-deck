import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'

import { api } from '@/convex/_generated/api'

export const Route = createFileRoute('/')({
    component: RouteComponent
})

function RouteComponent() {
    const tasks = useQuery(api.tasks.get)

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-pink-200 text-9xl">
            <div>Hello, World!</div>
            <div>
                {tasks?.map(({ _id, text }) => (
                    <div key={_id}>{text}</div>
                ))}
            </div>
        </div>
    )
}
