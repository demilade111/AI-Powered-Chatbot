import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import { ChatMessage } from "./types";
import app from './app';

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is not set in environment variables");
  process.exit(1);
}

const port = process.env.PORT || 5000;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configure CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Store chat history in memory (in production, use a database)
const chatHistory = new Map<string, ChatMessage[]>();

app.post("/api/chat", async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Get or initialize chat history for this session
    let history = chatHistory.get(sessionId) || [];

    // Add user message to history
    history.push({ role: "user", content: message });

    // Prepare messages for OpenAI
    const messages = history.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Get response from OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful customer support assistant. Provide clear, concise, and accurate responses.",
        },
        ...messages,
      ],
    });

    const aiResponse = completion.choices[0].message.content;

    if (!aiResponse) {
      throw new Error('No response from OpenAI');
    }

    // Add AI response to history
    history.push({
      role: "assistant",
      content: aiResponse
    });

    // Update chat history
    chatHistory.set(sessionId, history);

    res.json({
      message: aiResponse,
      history: history,
    });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ 
      error: "Failed to process the request",
      message: error.message || 'Unknown error occurred'
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`CORS origin: ${process.env.CORS_ORIGIN || '*'}`);
});

// Export the Express API
export default app;
