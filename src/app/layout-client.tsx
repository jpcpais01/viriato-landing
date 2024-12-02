"use client";

import { ThemeProvider } from "@/components/theme-provider"
import { AIChat } from '@/components/AIChat'
import { ChatProvider, useChatContext } from '@/context/chat-context'

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isChatOpen, setIsChatOpen } = useChatContext();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <AIChat 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </ThemeProvider>
  );
}

export function LayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <ChatProvider>
      <LayoutContent>{children}</LayoutContent>
    </ChatProvider>
  );
}
