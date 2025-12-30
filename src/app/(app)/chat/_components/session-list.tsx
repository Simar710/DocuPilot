'use client';

import { ChatSession } from '@/lib/types';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileWarning, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SessionListProps {
  sessions: ChatSession[];
  isLoading: boolean;
  error: Error | null;
  onSelectSession: (session: ChatSession) => void;
}

export function SessionList({
  sessions,
  isLoading,
  error,
  onSelectSession,
}: SessionListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <FileWarning className="h-4 w-4" />
        <AlertTitle>Error loading conversations</AlertTitle>
        <AlertDescription>
          Could not load your chat history. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (sessions.length === 0) {
    return (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="text-xl font-semibold mt-4">No Conversations Yet</h3>
            <p className="text-muted-foreground mt-2">
                Click "New Chat" to start a conversation with one of your documents.
            </p>
        </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-1">
      {sessions.map((session) => (
        <Card
          key={session.id}
          className="cursor-pointer hover:ring-2 hover:ring-primary transition-all"
          onClick={() => onSelectSession(session)}
        >
          <CardHeader>
            <CardTitle className="line-clamp-1">{session.documentName}</CardTitle>
            <CardDescription className="line-clamp-1 text-xs">
                {session.firstMessage}
            </CardDescription>
             <p className="text-xs text-muted-foreground pt-2">
                Last updated{' '}
                {session.updatedAt
                    ? formatDistanceToNow(session.updatedAt.toDate(), { addSuffix: true })
                    : 'just now'}
            </p>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
