import { NextResponse } from 'next/server';

import SYSTEM_PROMPT, { PromptType } from '@/constants/prompt-system';
import { TavilySearchResults } from '@langchain/community/tools/tavily_search';
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { MessagesAnnotation, StateGraph } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';

const memoryStore = new Map<string, any>();

const getOrCreateAgent = ({ sessionId, promptType }: { sessionId: string; promptType: PromptType }) => {
  if (memoryStore.has(promptType)) {
    return memoryStore.get(promptType);
  }

  const tools = [new TavilySearchResults({ maxResults: 10 })];
  const toolNode = new ToolNode(tools);

  const model = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o-mini',
    temperature: 0.2
  }).bindTools(tools);

  function shouldContinue({ messages }: typeof MessagesAnnotation.State) {
    const lastMessage = messages[messages.length - 1] as AIMessage;

    if (lastMessage.tool_calls?.length) {
      return 'tools';
    }

    return '__end__';
  }

  async function callModel(state: typeof MessagesAnnotation.State) {
    if (state.messages.length > 0 && !state.messages.some((msg) => msg instanceof SystemMessage)) {
      const promptTypeKey = promptType.toUpperCase() as PromptType;

      state.messages.unshift(new SystemMessage(SYSTEM_PROMPT[promptTypeKey]));
    }

    const response = await model.invoke(state.messages);

    return { messages: [response] };
  }

  const workflow = new StateGraph(MessagesAnnotation)
    .addNode('agent', callModel)
    .addEdge('__start__', 'agent')
    .addNode('tools', toolNode)
    .addEdge('tools', 'agent')
    .addConditionalEdges('agent', shouldContinue);

  const app = workflow.compile();

  memoryStore.set(promptType, app);

  return app;
};

export async function POST(req: Request) {
  try {
    const { messages, sessionId = 'default', promptType } = await req.json();
    console.log('promptType', promptType);
    const agent = getOrCreateAgent({ sessionId, promptType });

    const transformedMessages = messages
      .map((msg: any) => {
        if (msg.role === 'user') {
          return new HumanMessage(msg.content);
        }

        return msg;
      })
      .filter((msg: any) => msg !== undefined);

    const finalState = await agent.invoke({
      messages: transformedMessages
    });

    const lastMessage = finalState.messages[finalState.messages.length - 1];

    const responseMessage = {
      role: 'assistant',
      content: lastMessage.content
    };

    if (responseMessage.content) {
      responseMessage.content = responseMessage.content
        .replace(/\\"/g, '"')
        .replace(/\\n/g, '')
        .replace(/<html>|<\/html>|<body>|<\/body>/g, '');
    }

    return NextResponse.json({ message: responseMessage });
  } catch (error) {
    console.error("Erreur lors de l'appel à LangGraph:", error);

    return NextResponse.json({ error: 'Erreur lors du traitement de la demande' }, { status: 500 });
  }
}
