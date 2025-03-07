import type { VercelRequest, VercelResponse } from '@vercel/node';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import cors from 'cors';
import { ChatMessage } from '../src/types';

dotenv.config();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Store chat history in memory (in production, use a database)
const chatHistory = new Map<string, ChatMessage[]>();

// CORS middleware
const corsMiddleware = cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST'],
  credentials: true
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Apply CORS
  await new Promise((resolve, reject) => {
    corsMiddleware(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    return res.status(200).json({
      message: aiResponse,
      history: history,
    });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    return res.status(500).json({ 
      error: "Failed to process the request",
      message: error.message || 'Unknown error occurred'
    });
  }
} 