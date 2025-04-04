import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

import SYSTEM_PROMPT, { PromptType } from '@/constants/prompt-system';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  try {
    const { messages, promptType = 'COACH' } = await req.json();

    const promptTypeKey = promptType.toUpperCase() as PromptType;

    const hasSystemMessage = messages.some((message: any) => message.role === 'system');

    const systemPrompt = SYSTEM_PROMPT[promptTypeKey];

    const messagesWithSystem = hasSystemMessage ? messages : [{ role: 'system', content: systemPrompt }, ...messages];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messagesWithSystem,
      temperature: 0.4
    });

    const responseMessage = response.choices[0].message;

    if (responseMessage.content) {
      responseMessage.content = responseMessage.content
        .replace(/\\"/g, '"')
        .replace(/\\n/g, '')
        .replace(/<html>|<\/html>|<body>|<\/body>/g, '');
    }

    return NextResponse.json({ message: responseMessage });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors du traitement de la demande' }, { status: 500 });
  }
}
