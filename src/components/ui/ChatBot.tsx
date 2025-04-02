'use client';

import { LucideMessageSquare, LucideRefreshCw, LucideSend, LucideX } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import { Message, useChat } from '@/hooks/useChat';
import { cn } from '@/lib/utils';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from '@/registry/new-york-v4/ui/sheet';

const ChatBot = ({
  promptType = 'coach',
  title = 'Coach Carter 🏀',
  langGraph = false
}: {
  promptType?: 'coach' | 'doctor';
  title?: string;
  className?: string;
  langGraph?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, sendMessage, resetChat } = useChat({ promptType, langGraph });

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
            {/* Messages */}
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
              <Input
                placeholder='Écrivez votre message ici...'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className='flex-1'
              />
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
