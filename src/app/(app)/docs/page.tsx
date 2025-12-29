'use client';

import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { DocuPilotDocument } from '@/lib/types';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { AddDocument } from './_components/add-document';
import { DocumentList } from './_components/document-list';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileWarning } from 'lucide-react';

export default function DocsPage() {
  const { user } = useAuth();
  const [value, loading, error] = useCollection(
    user ? query(collection(db, 'documents'), where('userId', '==', user.uid), orderBy('createdAt', 'desc')) : null
  );

  const documents = value?.docs.map((doc) => ({ id: doc.id, ...doc.data() } as DocuPilotDocument));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-muted-foreground">
            Upload new documents or manage existing ones.
          </p>
        </div>
        <AddDocument />
      </div>

      {loading && (
        <div className="grid gap-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
            <FileWarning className="h-4 w-4" />
          <AlertTitle>Error loading documents</AlertTitle>
          <AlertDescription>
            There was a problem fetching your documents. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {!loading && !error && documents && <DocumentList documents={documents} />}
    </div>
  );
}
