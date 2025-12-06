import { useAction } from 'convex/react'
import { Send } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: number
}

interface DeckChatProps {
    deckId: Id<'decks'>
    slideId?: Id<'slides'>
}

export function DeckChat({ deckId, slideId }: DeckChatProps) {
    const chatAction = useAction(api.ai.chat)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: Date.now()
        }

        setMessages((prev) => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        try {
            const result = await chatAction({
                deckId,
                message: userMessage.content,
                slideId
            })

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: result.response,
                timestamp: Date.now()
            }

            setMessages((prev) => [...prev, assistantMessage])
        } catch (error: any) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `Error: ${error.message || 'Something went wrong'}`,
                timestamp: Date.now()
            }
            setMessages((prev) => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex h-full flex-col">
            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {messages.length === 0 ? (
                    <Card>
                        <CardContent className="p-4">
                            <p className="mb-2 text-sm text-muted-foreground">Start a conversation to create or modify your slides. You can:</p>
                            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                                <li>Ask to create new slides with specific content</li>
                                <li>Request modifications to existing slides</li>
                                <li>Get suggestions for improving your presentation</li>
                                <li>Ask questions about your deck structure</li>
                            </ul>
                        </CardContent>
                    </Card>
                ) : (
                    messages.map((message) => (
                        <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <Card className={`max-w-[80%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : ''}`}>
                                <CardContent className="p-3">
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                </CardContent>
                            </Card>
                        </div>
                    ))
                )}
                {isLoading && (
                    <div className="flex justify-start">
                        <Card>
                            <CardContent className="p-3">
                                <p className="text-sm text-muted-foreground">Thinking...</p>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="border-t p-4">
                <div className="flex gap-2">
                    <Textarea
                        placeholder="Ask AI to create or modify slides..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleSend()
                            }
                        }}
                        className="min-h-[60px] resize-none"
                        disabled={isLoading}
                    />
                    <Button onClick={handleSend} disabled={isLoading || !input.trim()} size="icon" className="self-end">
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
