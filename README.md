This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Voice UI with AI-Powered Actions

A modern voice-controlled user interface that combines traditional voice commands with AI-powered natural language processing using Groq.

### Features

- **Traditional Voice Commands**: Use predefined voice commands with `data-voice` attributes
- **AI-Powered Natural Language**: Speak naturally and let AI figure out the actions
- **Hybrid Approach**: Falls back to traditional commands if AI processing fails
- **Real-time DOM Context**: AI understands the current page structure dynamically

### AI Setup

To enable AI-powered voice commands:

1. Get a Groq API key from [console.groq.com](https://console.groq.com)
2. Copy `.env.local.example` to `.env.local`
3. Add your API key: `GROQ_API_KEY=your_api_key_here`

### Example AI Commands

Try these natural language commands:
- "Send a message that says Hi Mom"
- "Give it 1 star and leave bad feedback" 
- "Toggle notifications and play music"
- "Hide content and mute audio"

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
