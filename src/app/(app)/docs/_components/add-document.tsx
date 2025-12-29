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

const formSchema = z.object({
  name: z.string().min(1, 'Document name is required.'),
  content: z.string().min(50, 'Content must be at least 50 characters.'),
});

export function AddDocument() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', content: '' },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          form.setValue('content', content);
          form.setValue('name', file.name.replace('.txt', ''));
          toast({
            title: 'File content loaded',
            description: `${file.name} is ready to be saved.`,
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

    setIsLoading(true);
    try {
      // 1. Create the initial document in Firestore
      const docRef = await addDoc(collection(db, 'documents'), {
        userId: user.uid,
        name: values.name,
        content: values.content,
        createdAt: serverTimestamp(),
        summary: 'Generating summary...',
        actionItems: [],
      });

      // 2. Trigger AI flows (no need to await them here for better UX)
      processDocumentAI(docRef.id, values.content);
      
      toast({
        title: 'Document uploaded successfully!',
        description: `${values.name} is now being processed.`,
      });
      setIsOpen(false);
      form.reset();
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
    try {
        const [summaryResult, actionItemsResult] = await Promise.all([
            generateDocumentSummary({ documentText: content }),
            extractActionItems({ documentText: content }),
        ]);

        const batch = writeBatch(db);
        const docRef = doc(db, "documents", documentId);
        
        batch.update(docRef, { 
            summary: summaryResult.summary,
            actionItems: actionItemsResult.actionItems,
        });

        // Create tasks for each action item
        if (actionItemsResult.actionItems.length > 0 && user) {
            const tasksCollection = collection(db, 'tasks');
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
        // Optionally update the document to show an error state
        const docRef = doc(db, "documents", documentId);
        await addDoc(collection(db, 'documents'), { summary: 'Failed to process document.' });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add a New Document</DialogTitle>
          <DialogDescription>
            Upload a .txt file or paste content directly to get started.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs defaultValue="paste">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="paste">Paste Text</TabsTrigger>
                <TabsTrigger value="upload">Upload File</TabsTrigger>
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
                                <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">Plain Text (.txt files only)</p>
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
                Save Document
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
