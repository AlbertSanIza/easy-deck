# Easy Deck

An AI-powered application for creating and modifying Google Slides presentations through natural conversation.

## Features

- 🤖 **AI-Powered Chat Interface**: Interact with an AI assistant to create and modify slides
- 💬 **Real-time Messaging**: Chat interface with message history and persistence
- 🗄️ **Convex Backend**: Serverless database and functions for data management
- 🎨 **Modern UI**: Built with React 19, TanStack Router, and Tailwind CSS
- 📊 **Slide Management**: Create, update, and organize presentation slides

## Tech Stack

- **Frontend**: React 19, TanStack Router, Tailwind CSS
- **Backend**: Convex (serverless database and functions)
- **AI**: Vercel AI SDK
- **Build Tool**: Vite
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- A Convex account (sign up at [convex.dev](https://convex.dev))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/AlbertSanIza/easy-deck.git
cd easy-deck
```

2. Install dependencies:
```bash
npm install
```

3. Set up Convex:
```bash
npx convex dev
```

This will:
- Guide you through creating a Convex account (if needed)
- Create a new Convex project
- Set up your `.env.local` file with `VITE_CONVEX_URL`
- Start the Convex development server

4. In a separate terminal, start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Project Structure

```
src/
├── components/
│   └── ChatInterface.tsx      # Chat UI component
├── convex/
│   ├── schema.ts             # Database schema
│   ├── messages.ts           # Message queries and mutations
│   ├── slides.ts             # Slide queries and mutations
│   ├── ai.ts                 # AI chat action
│   └── _generated/           # Auto-generated Convex types
├── routes/
│   ├── __root.tsx            # Root layout
│   ├── index.tsx             # Home page
│   ├── about.tsx             # About page
│   └── chat.tsx              # Chat interface route
└── lib/
    └── route-tree.gen.ts     # Auto-generated route tree
```

## Usage

1. **Start a Conversation**: Navigate to the `/chat` page
2. **Create Slides**: Ask the AI to create slides for your presentation
3. **Modify Content**: Request changes to existing slides
4. **View History**: See your entire conversation history

Example prompts:
- "Create a title slide for my presentation about AI"
- "Add a slide about the benefits of machine learning"
- "Update the first slide with a better title"

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
- `npx convex dev` - Start Convex development server

### Convex Functions

The app uses Convex for backend functionality:

- **Messages**: Store and retrieve chat messages
- **Slides**: Manage presentation slides
- **AI**: Handle AI chat interactions (actions)

### Future Enhancements

To fully integrate AI capabilities:

1. Add an OpenAI API key to your environment:
```bash
# In your Convex dashboard, add environment variables
OPENAI_API_KEY=your_api_key_here
```

2. Update `src/convex/ai.ts` to call the OpenAI API:
```typescript
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

// In the chat action handler:
const result = await generateText({
  model: openai('gpt-4'),
  messages: chatMessages
})
```

3. Integrate Google Slides API for actual slide creation and modification

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

