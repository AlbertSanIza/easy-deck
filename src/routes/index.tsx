import { createFileRoute, Link } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({
    component: RouteComponent
})

function RouteComponent() {
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 p-6 text-8xl">
            <div>EASY DECK</div>

            <Button asChild>
                <Link to="/dashboard">Get Started!</Link>
            </Button>
        </div>
    )
}
