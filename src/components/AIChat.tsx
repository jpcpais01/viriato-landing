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
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-lg w-full max-w-[60%] max-h-[80vh] flex flex-col border-border border overflow-hidden">
        <div className="bg-background p-4 flex justify-between items-center border-b border-border">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-medium text-foreground flex items-center">
              <MessageCircle className="mr-2 text-primary h-5 w-5" /> 
              Chat
            </h2>
            <div className="flex gap-1">
              <Button
                variant={mode === 'fast' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMode('fast')}
                className={`flex items-center gap-1 px-2 py-1 text-sm transition-colors ${
                  mode === 'fast' ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'hover:bg-background-secondary'
                }`}
                title="Fast mode - Brief, direct answers"
              >
                <Zap className="h-3.5 w-3.5" />
                Fast
              </Button>
              <Button
                variant={mode === 'default' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMode('default')}
                className={`flex items-center gap-1 px-2 py-1 text-sm transition-colors ${
                  mode === 'default' ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'hover:bg-background-secondary'
                }`}
                title="Default mode - Balanced responses"
              >
                <Clock className="h-3.5 w-3.5" />
                Default
              </Button>
              <Button
                variant={mode === 'full' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMode('full')}
                className={`flex items-center gap-1 px-2 py-1 text-sm transition-colors ${
                  mode === 'full' ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'hover:bg-background-secondary'
                }`}
                title="Full mode - Detailed, comprehensive answers"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Full
              </Button>
            </div>
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setMessages([])}
              className="hover:bg-background-secondary rounded-full p-2"
              title="Clear chat"
            >
              <Trash2 className="h-4 w-4 text-foreground-secondary" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onClose}
              className="hover:bg-background-secondary rounded-full p-2"
            >
              <X className="h-4 w-4 text-foreground-secondary" />
            </Button>
          </div>
        </div>

        <div 
          ref={chatContainerRef}
          className="flex-grow overflow-y-auto p-4 space-y-4 bg-background"
        >
          {messages.length === 0 && (
            <div className="text-center text-foreground-secondary text-sm">
              Start a conversation
            </div>
          )}
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${
                msg.role === 'user' ? 'chat-message-user' : 'chat-message-assistant'
              }`}>
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="text-sm leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc ml-4 my-2 text-sm">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal ml-4 my-2 text-sm">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    h1: ({ children }) => <h1 className="text-lg font-medium mb-2">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-base font-medium mb-2">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-sm font-medium mb-2">{children}</h3>,
                    code: ({ children }) => (
                      <code className="bg-background-secondary px-1.5 py-0.5 rounded-md text-sm font-mono">{children}</code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-background-secondary p-3 rounded-lg my-2 overflow-x-auto text-sm font-mono">
                        {children}
                      </pre>
                    ),
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="text-center text-foreground-secondary text-sm">
              Thinking...
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border bg-background">
          <div className="flex gap-2">
            <input 
              ref={inputRef}
              type="text" 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..." 
              className="flex-grow p-2.5 rounded-xl chat-input text-sm transition-all focus:ring-2 focus:ring-primary/20"
            />
            <Button 
              onClick={sendMessage} 
              disabled={!inputMessage.trim() || isLoading}
              className="bg-primary hover:bg-primary-hover text-white rounded-xl px-4"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
