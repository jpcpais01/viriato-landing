'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getChatSessions, saveChatSession, deleteChatSession, clearChatHistory } from '../lib/chatStorage';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatContextType {
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  sessions: Array<{ id: string; messages: Message[]; timestamp: number }>;
  setSessions: (sessions: Array<{ id: string; messages: Message[]; timestamp: number }>) => void;
  activeSessionId: string | null;
  setActiveSessionId: (id: string | null) => void;
  saveCurrentSession: () => void;
  loadSession: (id: string) => void;
  deleteSession: (id: string) => void;
  clearHistory: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<Array<{ id: string; messages: Message[]; timestamp: number }>>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Load sessions on mount
  useEffect(() => {
    const loadedSessions = getChatSessions();
    setSessions(loadedSessions);
  }, []);

  const saveCurrentSession = useCallback(() => {
    if (messages.length === 0 || !messages.some(m => m.role === 'user')) return;
    
    const sessionId = saveChatSession(messages, activeSessionId);
    setActiveSessionId(sessionId);
    
    // Refresh sessions list
    const updatedSessions = getChatSessions();
    setSessions(updatedSessions);
  }, [messages, activeSessionId]);

  const loadSession = useCallback((id: string) => {
    const session = sessions.find(s => s.id === id);
    if (session) {
      setMessages(session.messages);
      setActiveSessionId(id);
    }
  }, [sessions]);

  const deleteSession = useCallback((id: string) => {
    deleteChatSession(id);
    if (id === activeSessionId) {
      setMessages([]);
      setActiveSessionId(null);
    }
    // Refresh sessions list
    const updatedSessions = getChatSessions();
    setSessions(updatedSessions);
  }, [activeSessionId]);

  const clearHistory = useCallback(() => {
    clearChatHistory();
    setMessages([]);
    setActiveSessionId(null);
    setSessions([]);
  }, []);

  const contextValue = useMemo(() => ({ 
    isChatOpen, 
    setIsChatOpen, 
    messages, 
    setMessages,
    sessions,
    setSessions,
    activeSessionId,
    setActiveSessionId,
    saveCurrentSession,
    loadSession,
    deleteSession,
    clearHistory
  }), [
    isChatOpen, 
    messages, 
    sessions, 
    activeSessionId, 
    saveCurrentSession,
    loadSession,
    deleteSession,
    clearHistory
  ]);

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
