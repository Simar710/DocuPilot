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
import { MessageSquare, ListTodo, Trash2 } from 'lucide-react';
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
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface DocumentListProps {
  documents: DocuPilotDocument[];
  highlightId?: string | null;
}

export function DocumentList({ documents, highlightId }: DocumentListProps) {
  const { toast } = useToast();

  const handleDelete = async (documentId: string) => {
    try {
      await deleteDoc(doc(db, 'documents', documentId));
      toast({
        title: 'Document deleted',
        description: 'The document has been successfully removed.',
      });
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast({
        variant: 'destructive',
        title: 'Deletion failed',
        description: 'Could not delete the document. Please try again.',
      });
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
            <p className="text-sm text-muted-foreground line-clamp-3">
              {doc.summary || 'Summary is being generated...'}
            </p>
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
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the document
                    and all associated tasks.
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
