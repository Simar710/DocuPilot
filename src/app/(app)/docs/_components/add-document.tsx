
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, UploadCloud } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { addDoc, collection, serverTimestamp, doc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { generateDocumentSummary } from '@/ai/flows/generate-document-summary';
import { extractActionItems } from '@/ai/flows/extract-action-items-from-document';
import { getUploadUrl } from '@/lib/s3-actions';

const MAX_PASTE_CHARS = 100000;
const MAX_FILE_SIZE_MB = 1;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_FILE_CHARS = 200000;

const formSchema = z.object({
  name: z.string().min(1, 'Document name is required.'),
  content: z
    .string()
    .min(50, 'Content must be at least 50 characters.')
    .max(MAX_PASTE_CHARS, `Pasted content cannot exceed ${MAX_PASTE_CHARS.toLocaleString()} characters.`),
});

interface AddDocumentProps {
    docCount: number;
    maxDocs: number;
}

export function AddDocument({ docCount, maxDocs }: AddDocumentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', content: '' },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: `Please upload a file smaller than ${MAX_FILE_SIZE_MB} MB.`,
        });
        return;
      }

      if (file.type === 'text/plain') {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (content.length > MAX_FILE_CHARS) {
             toast({
                variant: 'destructive',
                title: 'Document too long',
                description: `File content cannot exceed ${MAX_FILE_CHARS.toLocaleString()} characters.`,
             });
             return;
          }
          form.setValue('content', content, { shouldValidate: true });
          form.setValue('name', file.name.replace('.txt', ''));
          toast({
            title: 'File ready',
            description: `${file.name} will be uploaded to S3 and processed.`,
          });
        };
        reader.readAsText(file);
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid file type',
          description: 'Please upload a .txt file.',
        });
      }
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({ variant: 'destructive', title: 'You must be logged in' });
      return;
    }
    
    if (docCount >= maxDocs) {
        toast({
            variant: 'destructive',
            title: 'Document limit reached',
            description: `You cannot have more than ${maxDocs} documents. Please delete one to add another.`,
        });
        setIsOpen(false);
        return;
    }

    setIsLoading(true);
    try {
      let s3Key = null;

      // 1. ARCHITECTURAL PATTERN: Upload raw file to S3 via Pre-signed URL
      if (selectedFile) {
        try {
          const { url, key } = await getUploadUrl(selectedFile.name, selectedFile.type);
          await fetch(url, {
            method: 'PUT',
            body: selectedFile,
            headers: { 'Content-Type': selectedFile.type },
          });
          s3Key = key;
        } catch (s3Error) {
          console.warn('S3 Upload skipped (check AWS credentials):', s3Error);
          // We continue anyway for the demo/MVP to work via Firestore
        }
      }

      // 2. Create the document metadata in Firestore
      const docRef = await addDoc(collection(db, 'users', user.uid, 'documents'), {
        userId: user.uid,
        name: values.name,
        content: values.content,
        s3Key: s3Key, // Store the S3 link for "Resume Impact"
        createdAt: serverTimestamp(),
        summary: 'Generating summary...',
        actionItems: [],
      });

      // 3. Trigger AI flows
      processDocumentAI(docRef.id, values.content);
      
      toast({
        title: 'Document added!',
        description: s3Key ? 'Stored in S3 and metadata saved to Firestore.' : 'Metadata saved to Firestore.',
      });
      setIsOpen(false);
      form.reset();
      setSelectedFile(null);
    } catch (error: any) {
      console.error('Error adding document:', error);
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: error.message || 'Could not save the document.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function processDocumentAI(documentId: string, content: string) {
    if (!user) return;
    try {
        const [summaryResult, actionItemsResult] = await Promise.all([
            generateDocumentSummary({ documentText: content }),
            extractActionItems({ documentText: content }),
        ]);

        const batch = writeBatch(db);
        const docRef = doc(db, "users", user.uid, "documents", documentId);
        
        batch.update(docRef, { 
            summary: summaryResult.summary,
            actionItems: actionItemsResult.actionItems,
        });

        if (actionItemsResult.actionItems.length > 0) {
            const tasksCollection = collection(db, 'users', user.uid, 'tasks');
            actionItemsResult.actionItems.forEach(item => {
                const taskRef = doc(tasksCollection);
                batch.set(taskRef, {
                    userId: user.uid,
                    content: item,
                    isCompleted: false,
                    createdAt: serverTimestamp(),
                    sourceDocumentId: documentId,
                    sourceDocumentName: form.getValues('name'),
                });
            });
        }
        
        await batch.commit();

    } catch (aiError) {
        console.error("Error processing document with AI:", aiError);
    }
  }
  
  const isAtDocLimit = docCount >= maxDocs;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button disabled={isAtDocLimit} title={isAtDocLimit ? `You have reached the maximum of ${maxDocs} documents` : 'Add a new document'}>
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add a New Document</DialogTitle>
          <DialogDescription>
            Documents are decoupled: raw files go to S3, metadata and AI insights go to Firestore.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs defaultValue="paste">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="paste">Paste Text</TabsTrigger>
                <TabsTrigger value="upload">Upload File (S3)</TabsTrigger>
              </TabsList>
              <TabsContent value="paste" className="py-4">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste your document content here..."
                          className="min-h-[250px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              <TabsContent value="upload" className="py-4">
                 <div className="flex items-center justify-center w-full">
                    <label
                        htmlFor="dropzone-file"
                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80"
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground">
                                <span className="font-semibold">Click to upload</span> to Amazon S3
                            </p>
                            <p className="text-xs text-muted-foreground">.txt file, up to {MAX_FILE_SIZE_MB}MB</p>
                        </div>
                        <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept=".txt" />
                    </label>
                </div>
              </TabsContent>
            </Tabs>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Project Proposal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {selectedFile ? 'Upload to S3 & Save' : 'Save Document'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
