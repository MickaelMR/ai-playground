'use client';

import { LucideMic, LucideRefreshCw, LucideSend, LucideVolume2, LucideX } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import { PromptType } from '@/constants/prompt-system';
import { Message, useChat } from '@/hooks/useChat';
import { cn } from '@/lib/utils';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from '@/registry/new-york-v4/ui/sheet';
import { Textarea } from '@/registry/new-york-v4/ui/textarea';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface SpeechRecognitionEvent {
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

const ChatBot = ({
  promptType = PromptType.COACH,
  title = 'Coach Carter 🏀',
  langGraph = false
}: {
  promptType?: PromptType;
  title?: string;
  className?: string;
  langGraph?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, sendMessage, resetChat } = useChat({ promptType, langGraph });

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (autoSpeak && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        speak(lastMessage.content.replace(/<[^>]*>/g, ''));
      }
    }
  }, [messages, autoSpeak]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    await sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'fr-FR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = async (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);

        await sendMessage(transcript);
        setInput('');
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Erreur de reconnaissance vocale:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      console.error('pas de reconnaissance vocale sur ce browser');
    }
  };

  const MessageBubble = ({ message }: { message: Message }) => {
    const isUser = message.role === 'user';

    return (
      <div className={cn('mb-4 flex', isUser ? 'justify-end' : 'justify-start')}>
        <div
          className={cn(
            'max-w-[80%] rounded-lg px-4 py-2',
            isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
          )}
          dangerouslySetInnerHTML={{ __html: message.content }}
        />
      </div>
    );
  };

  console.log(autoSpeak);

  return (
    <>
      <Button variant='default' className='cursor-pointer' onClick={() => setIsOpen(true)}>
        Chat with {title}
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className='flex w-full flex-col p-0 sm:max-w-[90%] md:max-w-[60%] lg:max-w-[40%]'>
          <SheetHeader className='border-b px-4 py-2'>
            <SheetTitle className='flex items-center justify-between text-lg font-semibold'>
              <span>{title}</span>
              <div className='flex items-center gap-2'>
                <Button
                  variant='ghost'
                  size='icon'
                  title='Activer/Désactiver la synthèse vocale'
                  onClick={() => setAutoSpeak(!autoSpeak)}>
                  <LucideVolume2 className='h-4 w-4' color={autoSpeak ? '#3e9392' : 'white'} />
                </Button>
                <Button variant='ghost' size='icon' title='Réinitialiser la conversation' onClick={resetChat}>
                  <LucideRefreshCw className='h-4 w-4' />
                </Button>
                <SheetClose asChild>
                  <Button variant='ghost' size='icon' title='Fermer'>
                    <LucideX className='h-4 w-4' />
                  </Button>
                </SheetClose>
              </div>
            </SheetTitle>
          </SheetHeader>

          <div
            ref={messagesContainerRef}
            className='flex-1 overflow-y-auto px-4 py-4'
            style={{ height: 'calc(100vh - 140px)' }}>
            {messages.slice(1).map((msg, index) => (
              <MessageBubble key={index} message={msg} />
            ))}

            {isLoading && (
              <div className='mb-4 flex justify-start'>
                <div className='bg-muted text-foreground max-w-[80%] rounded-lg px-4 py-2'>
                  <div className='flex space-x-1'>
                    <div className='bg-foreground/60 h-2 w-2 animate-bounce rounded-full'></div>
                    <div
                      className='bg-foreground/60 h-2 w-2 animate-bounce rounded-full'
                      style={{ animationDelay: '0.2s' }}></div>
                    <div
                      className='bg-foreground/60 h-2 w-2 animate-bounce rounded-full'
                      style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className='bg-background border-t p-4'>
            <form onSubmit={handleSendMessage} className='flex w-full gap-2'>
              <Textarea
                placeholder='Écrivez votre message ici...'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                onKeyDown={handleKeyDown}
                className='flex-1'
              />
              <Button
                type='button'
                onClick={startListening}
                disabled={isLoading || isListening}
                size='icon'
                variant='outline'
                className={cn(isListening && 'bg-red-500 text-white')}>
                <LucideMic className='h-4 w-4' />
              </Button>
              <Button type='submit' disabled={isLoading || !input.trim()} size='icon'>
                <LucideSend className='h-4 w-4' />
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ChatBot;
