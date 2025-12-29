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
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function DocsPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('highlight');
  
  const [value, loading, error] = useCollection(
    user ? query(collection(db, 'documents'), where('userId', '==', user.uid), orderBy('createdAt', 'desc')) : null
  );

  const documents = value?.docs.map((doc) => ({ id: doc.id, ...doc.data() } as DocuPilotDocument));
  
  const highlightedDocRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlightId && !loading && documents) {
      const element = document.getElementById(`doc-${highlightId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightId, loading, documents]);

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
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
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

      {!loading && !error && documents && <DocumentList documents={documents} highlightId={highlightId} />}
    </div>
  );
}
