'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { X, Send, MessageCircle, Trash2, Zap, Clock, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

type ChatMode = 'fast' | 'default' | 'full';

interface AIChatProps {
  isOpen?: boolean;
  onClose?: () => void;
}

function formatMessage(content: string): string {
  return content
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function AIChat({ isOpen = false, onClose }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<ChatMode>('default');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (chatContainerRef.current && !chatContainerRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const formattedUserMessage = formatMessage(inputMessage);
    const newMessages: Message[] = [
      ...messages, 
      { role: 'user', content: formattedUserMessage }
    ];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: newMessages,
          mode: mode 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const formattedResponse = formatMessage(data.message);
        setMessages(prev => [
          ...prev, 
          { role: 'assistant', content: formattedResponse }
        ]);
      } else {
        throw new Error(data.error || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev, 
        { role: 'assistant', content: 'Sorry, something went wrong.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="bg-background rounded-2xl shadow-lg w-full max-w-[95%] sm:max-w-[85%] md:max-w-[75%] lg:max-w-[60%] max-h-[90vh] sm:max-h-[80vh] flex flex-col border-border border overflow-hidden">
        <div className="bg-background p-3 sm:p-4 flex justify-between items-center border-b border-border">
          <div className="flex items-center gap-2 sm:gap-4">
            <h2 className="text-base sm:text-lg font-medium text-foreground flex items-center">
              <MessageCircle className="mr-1 sm:mr-2 text-primary h-4 w-4 sm:h-5 sm:w-5" /> 
              Chat
            </h2>
            <div className="flex gap-0.5 sm:gap-1">
              <Button
                variant={mode === 'fast' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMode('fast')}
                className={`flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1 text-xs sm:text-sm transition-colors ${
                  mode === 'fast' ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'hover:bg-background-secondary'
                }`}
                title="Fast mode - Brief, direct answers"
              >
                <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden sm:inline">Fast</span>
              </Button>
              <Button
                variant={mode === 'default' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMode('default')}
                className={`flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1 text-xs sm:text-sm transition-colors ${
                  mode === 'default' ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'hover:bg-background-secondary'
                }`}
                title="Default mode - Balanced responses"
              >
                <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden sm:inline">Default</span>
              </Button>
              <Button
                variant={mode === 'full' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMode('full')}
                className={`flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1 text-xs sm:text-sm transition-colors ${
                  mode === 'full' ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'hover:bg-background-secondary'
                }`}
                title="Full mode - Detailed, comprehensive answers"
              >
                <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden sm:inline">Full</span>
              </Button>
            </div>
          </div>
          <div className="flex gap-0.5 sm:gap-1">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setMessages([])}
              className="hover:bg-background-secondary rounded-full p-1.5 sm:p-2"
              title="Clear chat"
            >
              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-foreground-secondary" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onClose}
              className="hover:bg-background-secondary rounded-full p-1.5 sm:p-2"
            >
              <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-foreground-secondary" />
            </Button>
          </div>
        </div>

        <div 
          ref={chatContainerRef}
          className="flex-grow overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-background"
        >
          {messages.length === 0 && (
            <div className="text-center text-foreground-secondary text-xs sm:text-sm">
              Start a conversation
            </div>
          )}
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] sm:max-w-[80%] ${
                msg.role === 'user' ? 'chat-message-user' : 'chat-message-assistant'
              }`}>
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="text-xs sm:text-sm leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc ml-3 sm:ml-4 my-1.5 sm:my-2 text-xs sm:text-sm">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal ml-3 sm:ml-4 my-1.5 sm:my-2 text-xs sm:text-sm">{children}</ol>,
                    li: ({ children }) => <li className="mb-0.5 sm:mb-1">{children}</li>,
                    h1: ({ children }) => <h1 className="text-base sm:text-lg font-medium mb-1.5 sm:mb-2">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-sm sm:text-base font-medium mb-1.5 sm:mb-2">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">{children}</h3>,
                    code: ({ children }) => (
                      <code className="bg-background-secondary px-1 sm:px-1.5 py-0.5 rounded-md text-xs sm:text-sm font-mono">{children}</code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-background-secondary p-2 sm:p-3 rounded-lg my-1.5 sm:my-2 overflow-x-auto text-xs sm:text-sm font-mono">
                        {children}
                      </pre>
                    )
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="chat-message-assistant max-w-[85%] sm:max-w-[80%]">
                <p className="text-xs sm:text-sm">Thinking...</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4 border-t border-border bg-background">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="flex-grow chat-input rounded-full px-4 py-2 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="rounded-full px-3 sm:px-4 py-2"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
