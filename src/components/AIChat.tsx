'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { X, Send, MessageCircle, Clock, Zap, Sparkles, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useChatContext, Message } from '@/context/chat-context';
import { ChatHistory } from './ChatHistory';
import { ScrollArea } from './ui/scroll-area';

type ChatMode = 'fast' | 'default' | 'full' | 'friend';

interface AIChatProps {
  isOpen: boolean;
  onClose?: () => void;
}

// Message formatting utility
const formatMessage = (content: string): string => {
  return content
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

// Markdown components
const markdownComponents = {
  p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p {...props} className="text-xs sm:text-sm leading-relaxed">{children}</p>
  ),
  ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul {...props} className="list-disc ml-3 sm:ml-4 my-1.5 sm:my-2 text-xs sm:text-sm">{children}</ul>
  ),
  ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol {...props} className="list-decimal ml-3 sm:ml-4 my-1.5 sm:my-2 text-xs sm:text-sm">{children}</ol>
  ),
  li: ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li {...props} className="mb-0.5 sm:mb-1">{children}</li>
  ),
  code: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <code {...props} className="bg-muted px-1 py-0.5 rounded text-xs sm:text-sm">{children}</code>
  ),
  pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre {...props} className="bg-muted p-2 rounded-md overflow-x-auto">
      {children}
    </pre>
  ),
};

export function AIChat({ isOpen, onClose }: AIChatProps) {
  const { messages, setMessages, saveCurrentSession, setActiveSessionId } = useChatContext();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<ChatMode>('default');
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const newMessages: Message[] = [
      ...messages,
      { role: 'user' as const, content: input }
    ];

    try {
      setMessages(newMessages);
      setInput('');
      setIsLoading(true);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages,
          mode
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      const formattedResponse = data.message;

      const updatedMessages: Message[] = [
        ...newMessages,
        { role: 'assistant' as const, content: formattedResponse }
      ];

      setMessages(updatedMessages);
      saveCurrentSession();
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages([
        ...messages,
        { role: 'assistant' as const, content: 'Sorry, something went wrong. Please try again.' }
      ]);
      saveCurrentSession();
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    if (messages.length > 0 && messages.some(m => m.role === 'user')) {
      saveCurrentSession(); // Save the current chat if it has user messages
    }
    setMessages([]); // Clear the chat window
    setActiveSessionId(null); // Reset the active session
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Focus input when chat opens
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    const chatContainer = document.querySelector('.chat-messages');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      {/* Fixed background layer for mobile only */}
      <div className={`sm:hidden fixed inset-0 bg-background ${isOpen ? 'block' : 'hidden'}`} />
      <div className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center sm:p-6 ${isOpen ? 'block' : 'hidden'}`}>
        <div className="bg-background sm:rounded-2xl shadow-lg w-full h-full sm:max-w-[85%] md:max-w-[75%] lg:max-w-[60%] sm:h-[80vh] flex flex-col border-border sm:border overflow-hidden">
          {/* Header */}
          <div className="bg-background p-3 sm:p-4 flex justify-between items-center border-b border-border shrink-0">
            <div className="flex items-center gap-2 sm:gap-4">
              <h2 
                className="text-base sm:text-lg font-medium text-foreground flex items-center cursor-pointer hover:text-primary transition-colors"
                onClick={onClose}
              >
                <MessageCircle className="mr-1 sm:mr-2 text-primary h-4 w-4 sm:h-5 sm:w-5" /> 
                Chat
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="text-muted-foreground hover:text-foreground"
                title="Toggle chat history"
              >
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">History</span>
              </Button>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="flex gap-0.5 sm:gap-1 mr-2">
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
                  title="Default mode - More detailed responses"
                >
                  <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span className="hidden sm:inline">Default</span>
                </Button>
                <Button
                  variant={mode === 'full' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setMode('full')}
                  className={`flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1 text-xs sm:text-sm transition-colors ${
                    mode === 'full' ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'hover:bg-background-secondary'
                  }`}
                  title="Full mode - Comprehensive, detailed explanations"
                >
                  <BookOpen className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span className="hidden sm:inline">Full</span>
                </Button>
                <Button
                  variant={mode === 'friend' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setMode('friend')}
                  className={`flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1 text-xs sm:text-sm transition-colors ${
                    mode === 'friend' ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'hover:bg-background-secondary'
                  }`}
                  title="Friend mode - Friendly, casual responses"
                >
                  <MessageCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span className="hidden sm:inline">Friend</span>
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNewChat}
                className="text-muted-foreground hover:text-foreground"
                title="Start a new chat"
              >
                <span className="sm:inline">New Chat</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Main chat area */}
          <div className="flex-1 flex min-h-0">
            {/* Chat history sidebar */}
            {showHistory && (
              <div className="w-full sm:w-[40%] md:w-[35%] lg:w-[30%] xl:w-[25%] border-r border-border shrink-0">
              <ChatHistory onSelectChat={() => setShowHistory(false)} />
            </div>
            )}
            
            <div className="flex-1 flex flex-col min-h-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto overscroll-y-contain touch-pan-y [-webkit-overflow-scrolling:touch]">
                <div className="p-4 space-y-4">
                  {messages.map((message, index) => (
                    <div 
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <ReactMarkdown components={markdownComponents}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] p-3 rounded-lg bg-muted">
                        <p className="text-xs sm:text-sm">Thinking...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Input area */}
              <div className="p-4 border-t border-border shrink-0">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="flex-1 bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={isLoading || !input.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
