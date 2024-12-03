export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  timestamp: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const STORAGE_KEY = 'chatSessions';

export function saveChatSession(messages: ChatMessage[], existingSessionId?: string | null): string {
  const sessions = getChatSessions();
  const timestamp = Date.now();

  // Don't save if there are no user messages
  if (!messages.some(m => m.role === 'user')) {
    return existingSessionId || '';
  }

  // Create new session
  const newSession: ChatSession = {
    id: existingSessionId || generateSessionId(),
    messages,
    timestamp
  };

  // If updating existing session, remove the old one
  const updatedSessions = existingSessionId 
    ? sessions.filter(s => s.id !== existingSessionId)
    : sessions;

  // Add new session at the start
  updatedSessions.unshift(newSession);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
  return newSession.id;
}

export function getChatSessions(): ChatSession[] {
  const sessionsJson = localStorage.getItem(STORAGE_KEY);
  if (!sessionsJson) return [];
  try {
    const sessions = JSON.parse(sessionsJson);
    return Array.isArray(sessions) ? sessions : [];
  } catch {
    return [];
  }
}

export function getChatSession(id: string): ChatSession | null {
  const sessions = getChatSessions();
  return sessions.find(s => s.id === id) || null;
}

export function deleteChatSession(sessionId: string): void {
  const sessions = getChatSessions();
  const updatedSessions = sessions.filter(session => session.id !== sessionId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
}

export function clearChatHistory(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
}

function generateSessionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
