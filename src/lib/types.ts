import type { Timestamp } from 'firebase/firestore';

export interface DocuPilotDocument {
  id: string;
  userId: string;
  name: string;
  content: string;
  summary: string;
  actionItems: string[];
  createdAt: Timestamp;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: Timestamp;
  citations?: {
    startIndex: number;
    endIndex: number;
    text: string;
  }[];
}

export interface ChatSession {
  id: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  firstMessage: string;
  documentId: string;
  documentName: string;
}

export interface Task {
  id: string;
  userId: string;
  content: string;
  isCompleted: boolean;
  createdAt: Timestamp;
  sourceDocumentId?: string;
  sourceDocumentName?: string;
}
