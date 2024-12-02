"use client";

import { Button } from "@/components/ui/button"
import { useChatContext } from "@/context/chat-context"
import { ModeToggle } from "@/components/mode-toggle"
import { MessageCircle, ArrowRight } from "lucide-react"

export default function Home() {
  const { setIsChatOpen } = useChatContext();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 gradient-bg">
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      
      <div className="absolute top-6 right-6 flex items-center gap-4">
        <ModeToggle />
      </div>
      
      <div className="text-center space-y-6 max-w-[500px] mx-auto">
        <h1 className="text-4xl font-medium tracking-tight text-foreground">
          vir<span className="text-primary">IA</span>to
        </h1>
        <p className="text-lg text-foreground-secondary">
          The First Portuguese-made AI Assistant
        </p>
        
        <div className="flex justify-center gap-3 pt-4">
          <Button 
            onClick={() => setIsChatOpen(true)} 
            className="bg-primary hover:bg-primary-hover text-white rounded-full px-6 py-5 flex items-center gap-2 transition-all hover:gap-3"
          >
            <MessageCircle className="h-5 w-5" />
            Start Chat
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>

        <p className="text-sm text-foreground-secondary pt-4">
          Experience our advanced AI assistant
        </p>
      </div>

      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className="text-sm text-foreground-secondary">
          2024 virIAto. All rights reserved.
        </p>
      </div>
    </main>
  );
}
