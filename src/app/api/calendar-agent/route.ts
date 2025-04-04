import { NextResponse } from 'next/server';

import SYSTEM_PROMPT, { PromptType } from '@/constants/prompt-system';
import { TavilySearchResults } from '@langchain/community/tools/tavily_search';
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { MessagesAnnotation, StateGraph } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';

const memoryStore = new Map<string, any>();

const getOrCreateAgent = ({ sessionId, promptType }: { sessionId: string; promptType: PromptType }) => {
  const cacheKey = `${sessionId}-${promptType}`;
  if (memoryStore.has(cacheKey)) {
    return memoryStore.get(cacheKey);
  }

  const tools = [new TavilySearchResults({ maxResults: 3 })];
  const toolNode = new ToolNode(tools);

  const model = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o-mini',
    temperature: 0.2
  }).bindTools(tools);

  async function weatherLLMNode(state: typeof MessagesAnnotation.State) {
    const lastMessage = state.messages[state.messages.length - 1];
    const content = lastMessage.content.toString();

    const weatherModel = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4o-mini',
      temperature: 0.1
    }).bindTools(tools);

    const weatherSystemPrompt = new SystemMessage(`
      Tu es un assistant météo spécialisé. Ta tâche est d'extraire la ville mentionnée dans le message de l'utilisateur 
      et de fournir des informations météorologiques actuelles pour cette ville.
      
      Tu dois:
      1. Identifier la ville mentionnée dans le message
      2. Simuler une recherche météo pour cette ville
      3. Fournir la température actuelle (en °C)
      4. Indiquer s'il pleut ou non
      5. Format de réponse requis: "{city}|{temperature}|{isRaining}" (exemple: "Paris|22|false")
      
      Si aucune ville n'est mentionnée, utilise Paris comme ville par défaut.
    `);

    const weatherResponse = await weatherModel.invoke([weatherSystemPrompt, new HumanMessage(content)]);

    const responseText = weatherResponse.content.toString();
    const weatherParts = responseText.split('|');

    let weatherData;
    if (weatherParts.length >= 3) {
      const city = weatherParts[0].trim();
      const temperature = parseFloat(weatherParts[1].trim());
      const isRaining = weatherParts[2].trim().toLowerCase() === 'true';
      weatherData = { city, temperature, isRaining };
    } else {
      weatherData = { city: 'Paris', temperature: 20, isRaining: false };
    }

    const formattedResponse = new AIMessage(
      `J'ai consulté la météo pour ${weatherData.city}. 
      Température actuelle: ${weatherData.temperature}°C. 
      Précipitations: ${weatherData.isRaining ? 'Oui' : 'Non'}.`
    );

    return {
      messages: [...state.messages, formattedResponse],
      weatherData: weatherData
    };
  }

  function shouldContinue({ messages }: typeof MessagesAnnotation.State) {
    const lastMessage = messages[messages.length - 1] as AIMessage;
    console.log('lastMessage', lastMessage);

    if (lastMessage.tool_calls?.length) {
      return 'tools';
    }

    const content = lastMessage.content.toString().toLowerCase();
    if (
      content.includes('météo') ||
      content.includes('temps') ||
      content.includes('weather') ||
      content.includes('pluie') ||
      content.includes('soleil') ||
      content.includes('température')
    ) {
      return 'weatherLLM';
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
    .addNode('weatherLLM', weatherLLMNode)
    .addEdge('__start__', 'agent')
    .addEdge('weatherLLM', '__end__')
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
