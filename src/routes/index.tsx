import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from 'convex/react'

import { api } from '@/convex/_generated/api'

export const Route = createFileRoute('/')({
    component: RouteComponent
})

function RouteComponent() {
    const tasks = useQuery(api.tasks.get)
    const slides = useQuery(api.slides.list)

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div className="max-w-2xl text-center">
                <h1 className="mb-4 text-5xl font-bold text-gray-900">Easy Deck</h1>
                <p className="mb-8 text-xl text-gray-700">
                    Create and modify Google Slides presentations using AI-powered conversation
                </p>

                <div className="mb-8 flex justify-center gap-4">
                    <Link
                        to="/chat"
                        className="rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-colors hover:bg-blue-700"
                    >
                        Start Chatting
                    </Link>
                    <Link
                        to="/about"
                        className="rounded-lg border-2 border-blue-600 bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-lg transition-colors hover:bg-blue-50"
                    >
                        Learn More
                    </Link>
                </div>

                <div className="rounded-lg bg-white p-6 shadow-lg">
                    <h2 className="mb-4 text-lg font-semibold text-gray-800">Current Status</h2>
                    <div className="space-y-2 text-left text-gray-600">
                        <p>📊 Slides: {slides?.length || 0}</p>
                        <p>✅ Tasks: {tasks?.length || 0}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
