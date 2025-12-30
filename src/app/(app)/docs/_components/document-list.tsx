'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DocuPilotDocument } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { MessageSquare, ListTodo, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
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
import { deleteDoc, doc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DocumentListProps {
  documents: DocuPilotDocument[];
  highlightId?: string | null;
}

export function DocumentList({ documents, highlightId }: DocumentListProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (documentId: string) => {
    if (!user) return;
    setDeletingId(documentId);

    try {
        const batch = writeBatch(db);

        // 1. Reference to the document to be deleted
        const docRef = doc(db, 'users', user.uid, 'documents', documentId);

        // 2. Find and delete associated tasks
        const tasksQuery = query(
            collection(db, 'users', user.uid, 'tasks'),
            where('sourceDocumentId', '==', documentId)
        );
        const tasksSnapshot = await getDocs(tasksQuery);
        tasksSnapshot.forEach((taskDoc) => {
            batch.delete(taskDoc.ref);
        });
        
        // 3. Find and delete associated chat conversations and their messages
        const conversationsQuery = query(
            collection(db, 'users', user.uid, 'conversations'),
            where('documentId', '==', documentId)
        );
        const conversationsSnapshot = await getDocs(conversationsQuery);
        
        for (const convoDoc of conversationsSnapshot.docs) {
            // Delete the conversation itself
            batch.delete(convoDoc.ref);
            // And delete all messages within it
            const messagesCollection = collection(db, convoDoc.ref.path, 'messages');
            const messagesSnapshot = await getDocs(messagesCollection);
            messagesSnapshot.forEach((messageDoc) => {
                batch.delete(messageDoc.ref);
            });
        }
        
        // Finally, delete the document itself
        batch.delete(docRef);

        // Commit the batch
        await batch.commit();

        toast({
            title: 'Document and data deleted',
            description: 'The document, its tasks, and chat history have been removed.',
        });
    } catch (error: any) {
        console.error('Error deleting document and associated data:', error);
        toast({
            variant: 'destructive',
            title: 'Deletion failed',
            description: 'Could not delete the document. Please try again.',
        });
    } finally {
        setDeletingId(null);
    }
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed rounded-lg">
        <h3 className="text-xl font-semibold">No Documents Yet</h3>
        <p className="text-muted-foreground mt-2">
          Click "Add Document" to upload your first document.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {documents.map((doc) => (
        <Card 
          key={doc.id}
          id={`doc-${doc.id}`}
          className={cn(
            'transition-all',
            highlightId === doc.id && 'ring-2 ring-primary ring-offset-2'
          )}
        >
          <CardHeader>
            <CardTitle>{doc.name}</CardTitle>
            <CardDescription>
              Uploaded{' '}
              {doc.createdAt
                ? formatDistanceToNow(doc.createdAt.toDate(), { addSuffix: true })
                : 'just now'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-20">
                <p className="text-sm text-muted-foreground pr-4">
                {doc.summary || 'Summary is being generated...'}
                </p>
            </ScrollArea>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/chat?docId=${doc.id}`}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Chat
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/tasks">
                  <ListTodo className="mr-2 h-4 w-4" />
                  Tasks ({doc.actionItems?.length || 0})
                </Link>
              </Button>
            </div>
             <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={deletingId === doc.id}>
                    {deletingId === doc.id ? (
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
                    This will permanently delete the document, all its tasks, and its chat history. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(doc.id)}>
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
