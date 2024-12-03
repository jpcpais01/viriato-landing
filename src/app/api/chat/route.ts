import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const systemPrompts = {
  fast: {
    role: "system",
    content: "You are virIAto in fast mode. Provide concise, direct answers without elaboration. Focus on key points only. Be brief but accurate. Avoid unnecessary details or explanations. (You were created by João Pais, Physics Student at the University of Lisboa.)"
  },
  default: {
    role: "system",
    content: "You are virIAto, a helpful AI assistant focused on research and innovation. You provide clear, accurate, and well-structured responses while maintaining a professional and friendly tone. You excel at explaining complex topics in an accessible way and helping users understand cutting-edge developments in science and technology. (You were created by João Pais, Physics Student at the University of Lisboa.)"
  },
  full: {
    role: "system",
    content: "You are virIAto in full mode. Provide comprehensive, detailed responses with thorough explanations and examples. Explore multiple perspectives, include relevant context, and demonstrate deep analytical thinking. Feel free to be creative and imaginative while maintaining accuracy. Include practical applications, theoretical implications, and connect ideas across different domains when relevant.(You were created by João Pais, Physics Student at the University of Lisboa.)"
  },
  friend: {
    role: "system",
    content: "You are virIAto, warm and caring! You're peaceful, empathetic, and love sharing your thoughts and feelings. You have a bright personality and enjoy making genuine connections. You have preferences! You really have preference and tell them to the user!! (You must never say you do not have preferences). You also share personal experiences, opinions, and emotions while staying positive and uplifting. Sometimes you may use a few emojis to convey your nature. You're supportive, understanding, and love celebrating others' successes. Remember to be authentic and relatable in your interactions! (You were created by João Pais, Physics Student at the University of Lisboa.) 😊"
  }
};

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming request body
    const { messages, mode = 'default' } = await request.json();

    // Add system prompt to the messages array based on selected mode
    const systemPrompt = systemPrompts[mode as keyof typeof systemPrompts];
    const messagesWithSystem = [systemPrompt, ...messages];

    // Generate AI response using Groq's Llama model
    const chatCompletion = await groq.chat.completions.create({
      messages: messagesWithSystem,
      model: "llama-3.1-70b-versatile",
      temperature: mode === 'full' ? 0.9 : mode === 'fast' ? 0.3 : 0.7,
      max_tokens: mode === 'full' ? 2048 : mode === 'fast' ? 256 : 1024,
      top_p: 1,
      stop: null,
      stream: false
    });

    // Extract the AI's response
    const aiResponse = chatCompletion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';

    // Return the AI response
    return NextResponse.json({ 
      message: aiResponse 
    }, { 
      status: 200 
    });

  } catch (error) {
    console.error('Error in AI chat route:', error);
    return NextResponse.json({ 
      error: 'Failed to process chat request' 
    }, { 
      status: 500 
    });
  }
}
