# Easy Deck Setup Guide

This guide will help you set up Easy Deck for development and deployment.

## Prerequisites

- Node.js 18+ or Bun
- Git

## Step-by-Step Setup

### 1. Clone and Install

```bash
git clone https://github.com/AlbertSanIza/easy-deck.git
cd easy-deck
npm install
```

### 2. Set Up Convex

Convex is the backend for Easy Deck. It provides serverless database and functions.

```bash
npx convex dev
```

This command will:
1. Prompt you to log in or create a Convex account
2. Create a new Convex project
3. Generate a `.env.local` file with your `VITE_CONVEX_URL`
4. Push your schema and functions to Convex
5. Start watching for changes

**Important**: Keep this terminal running during development.

### 3. Start Development Server

In a **new terminal window**:

```bash
npm run dev
```

This starts the Vite development server at `http://localhost:5173`.

### 4. Access the Application

Open your browser and navigate to:
- Home: `http://localhost:5173/`
- Chat Interface: `http://localhost:5173/chat`
- About: `http://localhost:5173/about`

## Database Schema

The app uses the following Convex tables:

### Messages
Stores chat conversation history:
- `role`: 'user' | 'assistant' | 'system'
- `content`: string
- `createdAt`: number (timestamp)

### Slides
Stores presentation slides:
- `title`: string
- `content`: array of objects (type, text, imageUrl)
- `createdAt`: number (timestamp)
- `updatedAt`: number (timestamp)

### Tasks (legacy, can be removed)
- `text`: string
- `isCompleted`: boolean

## Convex Functions

### Queries (Read data)
- `api.messages.list` - Get all messages
- `api.slides.list` - Get all slides
- `api.slides.get(id)` - Get a specific slide
- `api.tasks.get` - Get all tasks

### Mutations (Write data)
- `api.messages.add({ role, content })` - Add a message
- `api.messages.clear()` - Clear all messages
- `api.slides.create({ title, content })` - Create a slide
- `api.slides.update({ id, title?, content? })` - Update a slide
- `api.slides.remove({ id })` - Delete a slide

### Actions (External operations)
- `api.ai.chat({ message })` - Send a chat message to the AI

## Adding AI Integration

To enable real AI responses (currently shows placeholder responses):

### Option 1: OpenAI (Recommended)

1. Get an OpenAI API key from [platform.openai.com](https://platform.openai.com)

2. Add it to your Convex environment:
   - Go to your [Convex Dashboard](https://dashboard.convex.dev)
   - Select your project
   - Go to Settings → Environment Variables
   - Add: `OPENAI_API_KEY=sk-...`

3. Update `src/convex/ai.ts`:

```typescript
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

export const chat = action({
    args: { message: v.string() },
    handler: async (ctx, args) => {
        // ... existing code to add user message ...
        
        const messages = await ctx.runQuery(api.messages.list)
        const slides = await ctx.runQuery(api.slides.list)
        
        const systemPrompt = `You are an AI assistant...`
        
        const chatMessages = [
            { role: 'system', content: systemPrompt },
            ...messages.reverse().slice(-10).map(m => ({
                role: m.role,
                content: m.content
            }))
        ]
        
        // Call OpenAI
        const result = await generateText({
            model: openai('gpt-4'),
            messages: chatMessages,
            system: systemPrompt
        })
        
        const response = result.text
        
        // Save assistant response
        await ctx.runMutation(api.messages.add, {
            role: 'assistant',
            content: response
        })
        
        return { response }
    }
})
```

### Option 2: Other AI Providers

The AI SDK supports multiple providers:
- Anthropic (Claude)
- Google (Gemini)
- Mistral
- Cohere

See [AI SDK documentation](https://sdk.vercel.ai/docs) for more details.

## Google Slides Integration

To integrate with actual Google Slides:

1. Set up a Google Cloud project
2. Enable the Google Slides API
3. Create OAuth 2.0 credentials
4. Add the credentials to Convex environment variables
5. Implement slides creation/update using the Google Slides API

Example structure:
```typescript
// In src/convex/google-slides.ts
import { action } from './_generated/server'
import { google } from 'googleapis'

export const createPresentation = action({
    args: { title: v.string() },
    handler: async (ctx, args) => {
        // Authenticate with Google
        // Create presentation
        // Return presentation ID
    }
})
```

## Deployment

### Frontend (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Backend (Convex)

Convex automatically deploys when you push to production:

```bash
npx convex deploy
```

This will:
1. Create a production deployment
2. Give you a production `CONVEX_URL`
3. Update your environment variables

Add the production `VITE_CONVEX_URL` to your Vercel environment variables.

## Troubleshooting

### "No CONVEX_DEPLOYMENT set" error
Run `npx convex dev` to set up Convex.

### "Cannot find module" errors
Run `npm install` to install dependencies.

### TypeScript errors in generated files
Run `npx convex dev` to regenerate Convex types.

### Port already in use
Change the port in `vite.config.ts` or kill the process using the port.

## Development Workflow

1. Make changes to your code
2. Vite hot-reloads the frontend automatically
3. Convex watches and redeploys functions automatically
4. Test changes in the browser
5. Commit and push

## Project Structure

```
easy-deck/
├── src/
│   ├── components/        # React components
│   │   ├── ChatInterface.tsx
│   │   └── SlidesList.tsx
│   ├── convex/           # Backend functions
│   │   ├── schema.ts     # Database schema
│   │   ├── messages.ts   # Message CRUD
│   │   ├── slides.ts     # Slide CRUD
│   │   ├── ai.ts         # AI chat action
│   │   └── _generated/   # Auto-generated types
│   ├── routes/           # TanStack Router pages
│   │   ├── __root.tsx
│   │   ├── index.tsx
│   │   ├── chat.tsx
│   │   └── about.tsx
│   └── lib/              # Utilities
├── public/               # Static assets
└── dist/                 # Build output
```

## Next Steps

1. Test the chat interface
2. Add AI integration with OpenAI
3. Implement Google Slides API integration
4. Add user authentication
5. Deploy to production

## Resources

- [Convex Documentation](https://docs.convex.dev)
- [Vercel AI SDK](https://sdk.vercel.ai)
- [TanStack Router](https://tanstack.com/router)
- [Google Slides API](https://developers.google.com/slides)
