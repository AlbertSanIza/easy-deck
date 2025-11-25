import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
    component: RouteComponent
})

function RouteComponent() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="mx-auto max-w-3xl">
                <Link
                    to="/"
                    className="mb-8 inline-block text-blue-600 hover:text-blue-800"
                >
                    ← Back to Home
                </Link>

                <h1 className="mb-8 text-4xl font-bold text-gray-900">About Easy Deck</h1>

                <div className="space-y-6 rounded-lg bg-white p-8 shadow-lg">
                    <section>
                        <h2 className="mb-3 text-2xl font-semibold text-gray-800">What is Easy Deck?</h2>
                        <p className="text-gray-700">
                            Easy Deck is an AI-powered application that allows you to create and modify Google Slides
                            presentations through natural conversation. Simply chat with the AI assistant about what
                            you want in your presentation, and it will help you create and organize your slides.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-3 text-2xl font-semibold text-gray-800">Features</h2>
                        <ul className="list-disc space-y-2 pl-6 text-gray-700">
                            <li>Create slides through conversational AI</li>
                            <li>Modify existing slides with simple prompts</li>
                            <li>Real-time chat interface</li>
                            <li>Persistent storage with Convex backend</li>
                            <li>Integration with AI SDK for intelligent responses</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="mb-3 text-2xl font-semibold text-gray-800">Technology Stack</h2>
                        <ul className="list-disc space-y-2 pl-6 text-gray-700">
                            <li>
                                <strong>Frontend:</strong> React 19, TanStack Router, Tailwind CSS
                            </li>
                            <li>
                                <strong>Backend:</strong> Convex for database and serverless functions
                            </li>
                            <li>
                                <strong>AI:</strong> Vercel AI SDK for chat functionality
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="mb-3 text-2xl font-semibold text-gray-800">Getting Started</h2>
                        <p className="text-gray-700">
                            To start using Easy Deck, head to the chat interface and begin describing what you'd like
                            in your presentation. The AI will guide you through creating and organizing your slides.
                        </p>
                    </section>

                    <div className="pt-4">
                        <Link
                            to="/chat"
                            className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
                        >
                            Try It Now
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
