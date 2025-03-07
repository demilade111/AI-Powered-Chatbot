# AI Customer Support Chatbot

A modern AI-powered customer support chatbot built with React, Node.js, and OpenAI's GPT API. This project demonstrates the integration of AI capabilities into a web application for automated customer support.

## Features

- Real-time chat interface with AI responses
- Session-based chat history
- Modern, minimal UI design using Chakra UI
- TypeScript support for better development experience
- Scalable architecture with separate frontend and backend

## Tech Stack

- Frontend:

  - React with TypeScript
  - Vite for build tooling
  - Chakra UI for components
  - Axios for API calls
  - UUID for session management

- Backend:
  - Node.js with Express
  - TypeScript
  - OpenAI GPT API integration
  - CORS for cross-origin support

## Setup

1. Clone the repository
2. Install dependencies:

   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. Configure environment variables:

   ```bash
   # In the server directory
   cp .env.example .env
   # Edit .env and add your OpenAI API key
   ```

4. Start the development servers:

   ```bash
   # Start backend server (from server directory)
   npm run dev

   # Start frontend development server (from client directory)
   npm run dev
   ```

5. Open http://localhost:5173 in your browser

## Project Structure

```
.
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.tsx       # Main application component
│   │   └── theme.ts      # Chakra UI theme configuration
│   └── package.json
├── server/                # Backend Node.js application
│   ├── src/
│   │   ├── index.ts      # Express server setup
│   │   └── types.ts      # TypeScript type definitions
│   └── package.json
└── README.md
```

## Contributing

Feel free to submit issues and enhancement requests.
