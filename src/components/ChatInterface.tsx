import { useAction, useQuery } from 'convex/react'
import { useRef, useState, useEffect, type FormEvent } from 'react'
import { api } from '@/convex/_generated/api'

type Message = {
    _id: string
    _creationTime: number
    role: 'user' | 'assistant' | 'system'
    content: string
    createdAt: number
}

export function ChatInterface() {
    const messages = useQuery(api.messages.list) as Message[] | undefined
    const chat = useAction(api.ai.chat)
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const message = input.trim()
        setInput('')
        setIsLoading(true)

        try {
            await chat({ message })
        } catch (error) {
            console.error('Error sending message:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex h-screen flex-col bg-gray-50">
            {/* Header */}
            <div className="border-b bg-white px-6 py-4 shadow-sm">
                <h1 className="text-2xl font-bold text-gray-900">Easy Deck - AI Slide Assistant</h1>
                <p className="text-sm text-gray-600">Chat to create and modify your Google Slides presentation</p>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="mx-auto max-w-3xl space-y-4">
                    {messages?.length === 0 && (
                        <div className="rounded-lg bg-blue-50 p-6 text-center">
                            <h2 className="mb-2 text-lg font-semibold text-blue-900">Welcome to Easy Deck!</h2>
                            <p className="text-blue-700">
                                Start chatting to create and modify your slides. Try saying something like:
                            </p>
                            <ul className="mt-4 space-y-2 text-left text-sm text-blue-600">
                                <li>• "Create a title slide for my presentation about AI"</li>
                                <li>• "Add a slide about the benefits of machine learning"</li>
                                <li>• "Update the first slide with a better title"</li>
                            </ul>
                        </div>
                    )}

                    {messages?.slice().reverse().map((message) => (
                        <div
                            key={message._id}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                                    message.role === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-900 shadow-sm'
                                }`}
                            >
                                <div className="mb-1 text-xs font-semibold opacity-70">
                                    {message.role === 'user' ? 'You' : 'AI Assistant'}
                                </div>
                                <div className="whitespace-pre-wrap">{message.content}</div>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="max-w-[80%] rounded-lg bg-white px-4 py-3 shadow-sm">
                                <div className="flex items-center space-x-2">
                                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 animation-delay-200" />
                                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 animation-delay-400" />
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Form */}
            <div className="border-t bg-white px-6 py-4 shadow-lg">
                <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message here..."
                            disabled={isLoading}
                            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Sending...' : 'Send'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
