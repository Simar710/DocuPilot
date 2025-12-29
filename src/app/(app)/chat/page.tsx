'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { DocuPilotDocument, ChatMessage as ChatMessageType, ChatSession } from '@/lib/types';
import { DocumentSelector } from './_components/document-selector';
import { ChatInput } from './_components/chat-input';
import { ChatMessageList } from './_components/chat-message-list';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MessageSquare, FileWarning } from 'lucide-react';
import { chatWithDocument } from '@/ai/flows/chat-with-document';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

export default function ChatPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedDoc, setSelectedDoc] = useState<DocuPilotDocument | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isResponding, setIsResponding] = useState(false);

  // Fetch documents for the selector
  const [docsSnapshot, docsLoading, docsError] = useCollection(
    user ? query(collection(db, 'documents'), where('userId', '==', user.uid), orderBy('createdAt', 'desc')) : null
  );
  const documents = docsSnapshot?.docs.map(d => ({ id: d.id, ...d.data() } as DocuPilotDocument)) || [];

  // Fetch messages for the active session
  const [messagesSnapshot, messagesLoading, messagesError] = useCollection(
    activeSessionId ? query(collection(db, `chatSessions/${activeSessionId}/messages`), orderBy('createdAt', 'asc')) : null
  );
  const messages = messagesSnapshot?.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessageType)) || [];

  const handleSendMessage = async (content: string) => {
    if (!user || !selectedDoc) return;
    setIsResponding(true);

    let currentSessionId = activeSessionId;
    
    // Create a new session if one doesn't exist
    if (!currentSessionId) {
      const newSessionId = uuidv4();
      const sessionRef = doc(db, 'chatSessions', newSessionId);
      await setDoc(sessionRef, {
        userId: user.uid,
        documentId: selectedDoc.id,
        documentName: selectedDoc.name,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        firstMessage: content,
      });
      setActiveSessionId(newSessionId);
      currentSessionId = newSessionId;
    }

    const messagesCollection = collection(db, `chatSessions/${currentSessionId}/messages`);

    // Add user message to Firestore
    const userMessage: Omit<ChatMessageType, 'id' | 'createdAt'> = { role: 'user', content };
    await addDoc(messagesCollection, { ...userMessage, createdAt: serverTimestamp() });

    try {
      // Call the AI flow
      const result = await chatWithDocument({
        question: content,
        documentText: selectedDoc.content,
      });

      // Add agent response to Firestore
      const agentMessage: Omit<ChatMessageType, 'id' | 'createdAt'> = {
        role: 'assistant',
        content: result.answer,
        citations: result.citations.map(c => ({ name: selectedDoc.name, id: selectedDoc.id })),
      };
      await addDoc(messagesCollection, { ...agentMessage, createdAt: serverTimestamp() });

    } catch (error) {
      console.error('Error chatting with document:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not get a response from the document.',
      });
       const agentMessage: Omit<ChatMessageType, 'id' | 'createdAt'> = {
        role: 'assistant',
        content: "Sorry, I ran into an error trying to answer that.",
      };
      await addDoc(messagesCollection, { ...agentMessage, createdAt: serverTimestamp() });
    } finally {
      setIsResponding(false);
    }
  };
  
  const startNewChat = () => {
      setSelectedDoc(null);
      setActiveSessionId(null);
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] flex-col">
      <div className="flex justify-between items-center mb-4">
         <div>
            <h1 className="text-3xl font-bold">Chat</h1>
            <p className="text-muted-foreground">
                Ask questions and get insights from your documents.
            </p>
        </div>
        {selectedDoc && (
             <button onClick={startNewChat} className="text-sm text-primary hover:underline">
                Start New Chat
            </button>
        )}
      </div>

      {!selectedDoc ? (
        <DocumentSelector
          documents={documents}
          isLoading={docsLoading}
          onSelect={setSelectedDoc}
          error={docsError}
        />
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-3 rounded-lg border bg-muted mb-4">
              <p className="text-sm text-muted-foreground">
                  You are chatting with: <span className="font-semibold text-foreground">{selectedDoc.name}</span>
              </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {messagesError && (
                 <Alert variant="destructive">
                    <FileWarning className="h-4 w-4" />
                    <AlertTitle>Error loading messages</AlertTitle>
                    <AlertDescription>Could not load the conversation. Please try again.</AlertDescription>
                </Alert>
            )}
            {!messagesError && <ChatMessageList messages={messages} isLoading={messagesLoading && messages.length === 0} />}
          </div>
          <div className="mt-4">
            <ChatInput onSendMessage={handleSendMessage} isLoading={isResponding} />
          </div>
        </div>
      )}
    </div>
  );
}
