import { createFileRoute } from '@tanstack/react-router'
import { ChatInterface } from '@/components/ChatInterface'

export const Route = createFileRoute('/chat')({
    component: RouteComponent
})

function RouteComponent() {
    return <ChatInterface />
}
