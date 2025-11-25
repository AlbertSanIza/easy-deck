import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
    component: RouteComponent
})

function RouteComponent() {
    return <div className="fixed inset-0 flex items-center justify-center bg-pink-200 text-9xl">Hello, World!</div>
}
