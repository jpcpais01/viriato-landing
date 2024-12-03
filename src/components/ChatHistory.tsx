'use client';

import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Trash2 } from 'lucide-react';
import { useChatContext } from '@/context/chat-context';
import { formatDistanceToNow } from 'date-fns';

interface ChatHistoryProps {
  onSelectChat?: () => void;
}

export function ChatHistory({ onSelectChat }: ChatHistoryProps) {
  const { sessions, loadSession, deleteSession, clearHistory, activeSessionId } = useChatContext();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (sessions.length === 0) {
    return null;
  }

  const handleDelete = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    deleteSession(sessionId);
  };

  const handleLoadSession = (sessionId: string) => {
    loadSession(sessionId);
    if (isMobile && onSelectChat) {
      onSelectChat();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-center items-center px-4 pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={clearHistory}
          className="h-8 px-2 text-muted-foreground hover:text-foreground"
          title="Clear all chat history"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Clear History
        </Button>
      </div>
      <ScrollArea className="flex-1 w-full rounded-md border p-4">
        <div className="space-y-2">
          {sessions.map((session) => {
            const firstMessage = session.messages.find(m => m.role === 'user')?.content || 'New Chat';
            const preview = firstMessage.length > 50 ? `${firstMessage.substring(0, 50)}...` : firstMessage;
            
            return (
              <div key={session.id} className="group relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleDelete(e, session.id)}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </Button>
                <Button
                  variant={activeSessionId === session.id ? "secondary" : "ghost"}
                  className="w-full justify-start pl-8"
                  onClick={() => handleLoadSession(session.id)}
                >
                  <div className="flex flex-col items-start w-full overflow-hidden">
                    <span className="font-medium break-words whitespace-normal text-left w-full line-clamp-2">{preview}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(session.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                </Button>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
