'use client';

import { ChatMessage } from '@/lib/types';
import { ChatMessageItem } from './chat-message-item';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare } from 'lucide-react';

interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

export function ChatMessageList({ messages, isLoading }: ChatMessageListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-16 w-3/4" />
        <Skeleton className="h-16 w-3/4 ml-auto" />
      </div>
    );
  }
  
  if (messages.length === 0) {
      return (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground" />
                <h3 className="text-xl font-semibold mt-4">Start the Conversation</h3>
                <p className="text-muted-foreground mt-1">
                    Ask a question below to get started.
                </p>
            </div>
      )
  }

  return (
    <div className="space-y-2">
      {messages.map((msg) => (
        <ChatMessageItem key={msg.id} message={msg} />
      ))}
    </div>
  );
}
