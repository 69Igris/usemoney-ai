import { Groq } from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';
import { FIRE_TOOLS } from '@/lib/ai/tools';
import { buildSystemPrompt } from '@/lib/ai/systemPrompt';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY not configured' },
        { status: 500 }
      );
    }

    const { messages, currentState } = await req.json();

    const systemMessage = {
      role: 'system' as const,
      content: buildSystemPrompt(currentState),
    };

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [systemMessage, ...messages],
      tools: FIRE_TOOLS as never,
      tool_choice: 'auto',
      temperature: 0.3,
      max_tokens: 1024,
    });

    const choice = response.choices[0];
    return NextResponse.json({
      message: choice.message,
      finishReason: choice.finish_reason,
    });
  } catch (err) {
    console.error('Chat API error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
