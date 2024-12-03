'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ChatMessage, ChatSession, saveChatSession, getChatSessions, getChatSession, deleteChatSession, clearChatHistory } from '@/lib/chatStorage';

interface ChatContextType {
  messages: ChatMessage[];
  setMessages: (messages: ChatMessage[]) => void;
  activeSessionId: string | null;
  setActiveSessionId: (id: string | null) => void;
  sessions: ChatSession[];
  loadSession: (sessionId: string) => void;
  saveCurrentSession: () => string;
  deleteSession: (sessionId: string) => void;
  clearHistory: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  // Load sessions on mount
  useEffect(() => {
    setSessions(getChatSessions());
  }, []);

  const loadSession = (sessionId: string) => {
    const session = getChatSession(sessionId);
    if (session) {
      setMessages(session.messages);
      setActiveSessionId(sessionId);
    }
  };

  const saveCurrentSession = () => {
    // Don't save if there are no messages or no user messages
    if (messages.length === 0 || !messages.some(m => m.role === 'user')) {
      return activeSessionId || '';
    }

    const sessionId = saveChatSession(messages, activeSessionId);
    setSessions(getChatSessions()); // Refresh the sessions list
    setActiveSessionId(sessionId);
    return sessionId;
  };

  const deleteSession = (sessionId: string) => {
    deleteChatSession(sessionId);
    setSessions(getChatSessions());
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
      setMessages([]);
    }
  };

  const clearHistory = () => {
    clearChatHistory();
    setSessions([]);
    setActiveSessionId(null);
    setMessages([]);
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        activeSessionId,
        setActiveSessionId,
        sessions,
        loadSession,
        saveCurrentSession,
        deleteSession,
        clearHistory,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};
