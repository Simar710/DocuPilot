'use client';

import { ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, User, FileText } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface ChatMessageItemProps {
  message: ChatMessage;
}

export function ChatMessageItem({ message }: ChatMessageItemProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex items-start gap-4 p-4', isUser ? 'justify-end' : '')}>
      {!isUser && (
        <Avatar className="h-8 w-8">
            <AvatarFallback><Bot/></AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-xl rounded-lg p-3 text-sm',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {!isUser && message.citations && message.citations.length > 0 && (
             <Accordion type="single" collapsible className="w-full mt-2">
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-xs hover:no-underline">
                        Sources ({message.citations.length})
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-2 mt-2">
                            {message.citations.map((citation, index) => (
                                <div key={index} className="p-2 bg-background/50 rounded-md border text-xs">
                                    <p className="line-clamp-3">
                                       ...{citation.text}...
                                    </p>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        )}
      </div>
      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback><User/></AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
