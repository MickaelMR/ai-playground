import { useCallback, useEffect, useState } from 'react';

import { PromptType } from '@/constants/prompt-system';

export type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export const useChat = ({
  promptType = PromptType.COACH,
  langGraph = false
}: {
  promptType?: PromptType;
  langGraph?: boolean;
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const sendMessage = useCallback(
    async (userMessage: string) => {
      if (!userMessage.trim()) return;

      const newUserMessage: Message = { role: 'user', content: userMessage };
      setMessages((prevMessages) => [...prevMessages, newUserMessage]);

      setIsLoading(true);

      try {
        const updatedMessages = [...messages, newUserMessage];

        if (!langGraph) {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ messages: updatedMessages, promptType })
          });

          if (!response.ok) {
            throw new Error('Erreur lors de la communication avec le coach');
          }

          const data = await response.json();
          const assistantMessage: Message = {
            role: 'assistant',
            content: data.message.content
          };

          setMessages((prevMessages) => [...prevMessages, assistantMessage]);
        } else if (langGraph) {
          const response = await fetch('/api/lang-graph-chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ messages: updatedMessages, promptType })
          });

          if (!response.ok) {
            throw new Error('Erreur lors de la communication avec le coach');
          }

          const data = await response.json();
          const assistantMessage: Message = {
            role: 'assistant',
            content: data.message.content
          };

          setMessages((prevMessages) => [...prevMessages, assistantMessage]);
        }
      } catch (error) {
        const errorMessage: Message = {
          role: 'assistant',
          content: "Désolé, j'ai rencontré un problème technique. Veuillez réessayer plus tard."
        };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages]
  );

  useEffect(() => {
    if (!isInitialized && messages.length === 0) {
      setIsInitialized(true);
      sendMessage("Bonjour, Comment peux tu m'aider ?");
    }
  }, [isInitialized, messages.length, sendMessage]);

  const resetChat = () => {
    setMessages([]);
    setIsInitialized(false);
  };

  return {
    messages,
    isLoading,
    sendMessage,
    resetChat
  };
};
