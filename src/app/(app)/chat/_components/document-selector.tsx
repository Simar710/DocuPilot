'use client';

import { DocuPilotDocument } from '@/lib/types';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileWarning, FileText } from 'lucide-react';

interface DocumentSelectorProps {
  documents: DocuPilotDocument[];
  isLoading: boolean;
  error: Error | null;
  onSelect: (doc: DocuPilotDocument) => void;
}

export function DocumentSelector({
  documents,
  isLoading,
  error,
  onSelect,
}: DocumentSelectorProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        <AlertTitle>Error loading documents</AlertTitle>
        <AlertDescription>
          Could not load your documents. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (documents.length === 0) {
    return (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="text-xl font-semibold mt-4">No Documents to Chat With</h3>
            <p className="text-muted-foreground mt-2">
                Please upload a document on the Docs page to start a conversation.
            </p>
        </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {documents.map((doc) => (
        <Card
          key={doc.id}
          className="cursor-pointer hover:ring-2 hover:ring-primary transition-all"
          onClick={() => onSelect(doc)}
        >
          <CardHeader>
            <CardTitle className="line-clamp-1">{doc.name}</CardTitle>
            <CardDescription className="line-clamp-2">{doc.summary}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
