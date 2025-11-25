import { action } from './_generated/server'
import { v } from 'convex/values'
import { api } from './_generated/api'

export const chat = action({
    args: {
        message: v.string()
    },
    handler: async (ctx, args): Promise<{ response: string }> => {
        // Add user message to database
        await ctx.runMutation(api.messages.add, {
            role: 'user',
            content: args.message
        })

        // Get recent messages for context (for future AI integration)
        // const messages = await ctx.runQuery(api.messages.list)

        // Get current slides for context
        const slides: Array<{ title: string }> = await ctx.runQuery(api.slides.list)

        // Create system prompt with context about slides (for future AI integration)
        // const systemPrompt = `You are an AI assistant that helps users create and modify Google Slides presentations. 
        // You can help create new slides, update existing ones, and provide guidance on presentation design.
        // 
        // Current slides in the presentation:
        // ${slides.length === 0 ? 'No slides yet.' : slides.map((s: { title: string }, i: number) => `${i + 1}. ${s.title}`).join('\n')}
        // 
        // When the user wants to create or modify slides, respond with your intentions and what you will do.
        // For now, explain what changes you would make to the slides based on the user's request.`

        // Prepare messages for AI (reverse order - oldest first)
        // In production, this would be used to call the AI API
        // const chatMessages = [
        //     { role: 'system' as const, content: systemPrompt },
        //     ...messages
        //         .reverse()
        //         .slice(-10)
        //         .map((m: { role: 'user' | 'assistant' | 'system'; content: string }) => ({
        //             role: m.role as 'user' | 'assistant' | 'system',
        //             content: m.content
        //         }))
        // ]

        // For now, create a simple response
        // In production, you would call the AI SDK here with your API key
        // Example: const aiResponse = await generateText({ model: openai('gpt-4'), messages: chatMessages })
        const response: string = `I understand you want to: "${args.message}". 

${slides.length === 0 ? "Let's create your first slide! " : `You currently have ${slides.length} slide(s). `}

To fully integrate AI capabilities, you'll need to:
1. Set up an OpenAI API key in your environment variables
2. Call the AI API from this action
3. Parse the AI response to determine slide operations

For now, I can help you understand what changes would be made based on your request.`

        // Add assistant response to database
        await ctx.runMutation(api.messages.add, {
            role: 'assistant',
            content: response
        })

        return { response }
    }
})
