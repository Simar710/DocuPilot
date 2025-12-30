'use client';

import { ChatSession } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileWarning, MessageSquare, Loader2, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

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
  const { user } = useAuth();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (sessionId: string) => {
    if (!user) return;
    setDeletingId(sessionId);
    try {
      const batch = writeBatch(db);
      
      const sessionRef = doc(db, 'users', user.uid, 'conversations', sessionId);
      const messagesCollection = collection(sessionRef, 'messages');
      const messagesSnapshot = await getDocs(messagesCollection);
      
      messagesSnapshot.forEach(messageDoc => {
        batch.delete(messageDoc.ref);
      });
      
      batch.delete(sessionRef);
      
      await batch.commit();

      toast({
        title: 'Conversation deleted',
        description: 'The chat history has been removed.',
      });

    } catch (error) {
       console.error('Error deleting conversation:', error);
       toast({
         variant: 'destructive',
         title: 'Deletion failed',
         description: 'Could not delete the conversation. Please try again.',
       });
    } finally {
      setDeletingId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
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
          className="flex flex-col justify-between"
        >
          <div className="cursor-pointer hover:bg-muted/50 rounded-t-lg" onClick={() => onSelectSession(session)}>
            <CardHeader>
              <CardTitle className="line-clamp-1">{session.documentName}</CardTitle>
              <CardDescription className="line-clamp-1 text-xs">
                  {session.firstMessage}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                  Last updated{' '}
                  {session.updatedAt
                      ? formatDistanceToNow(session.updatedAt.toDate(), { addSuffix: true })
                      : 'just now'}
              </p>
            </CardContent>
          </div>
          <CardFooter className="py-3 px-6 border-t flex justify-end">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" disabled={deletingId === session.id}>
                      {deletingId === session.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                          <Trash2 className="mr-2 h-4 w-4" />
                      )}
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this conversation and all of its messages. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(session.id)} className='bg-destructive hover:bg-destructive/90'>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
