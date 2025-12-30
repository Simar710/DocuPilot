'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MAX_CHAT_MESSAGE_LENGTH = 4000;

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      if (inputValue.length > MAX_CHAT_MESSAGE_LENGTH) {
        toast({
          variant: 'destructive',
          title: 'Message too long',
          description: `Your message cannot exceed ${MAX_CHAT_MESSAGE_LENGTH.toLocaleString()} characters.`,
        });
        return;
      }
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Ask a question about the document..."
        disabled={isLoading}
      />
      <Button type="submit" disabled={isLoading || !inputValue.trim()}>
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        <span className="sr-only">Send Message</span>
      </Button>
    </form>
  );
}
