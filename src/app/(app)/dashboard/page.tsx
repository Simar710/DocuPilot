'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  FileText,
  MessageSquare,
  ListTodo,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth";
import { collection, query, where } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { user } = useAuth();

  const [docsSnapshot, docsLoading] = useCollection(
    user ? query(collection(db, 'users', user.uid, 'documents')) : null
  );

  const [tasksSnapshot, tasksLoading] = useCollection(
    user ? query(collection(db, 'users', user.uid, 'tasks'), where('isCompleted', '==', false)) : null
  );
  
  const [sessionsSnapshot, sessionsLoading] = useCollection(
    user ? query(collection(db, 'users', user.uid, 'conversations')) : null
  );

  const stats = {
    documents: docsSnapshot?.size ?? 0,
    tasks: tasksSnapshot?.size ?? 0,
    conversations: sessionsSnapshot?.size ?? 0,
  }

  const isLoading = docsLoading || tasksLoading || sessionsLoading;

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Documents
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-1/4"/> : <div className="text-2xl font-bold">{stats.documents}</div>}
            <p className="text-xs text-muted-foreground">
              Manage your uploaded documents
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Open Tasks
            </CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-1/4"/> : <div className="text-2xl font-bold">{stats.tasks}</div>}
            <p className="text-xs text-muted-foreground">
              Action items from your documents
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conversations
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-1/4"/> : <div className="text-2xl font-bold">{stats.conversations}</div>}
            <p className="text-xs text-muted-foreground">
              Chats with your documents
            </p>
          </CardContent>
        </Card>
      </div>
       <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Welcome to DocuPilot!</CardTitle>
            <CardDescription>
              Your intelligent document assistant. Get started by uploading a document.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Use the menu on the left to navigate:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-muted-foreground">
                <li><span className="font-semibold text-foreground">Documents:</span> Upload new .txt files or paste text content.</li>
                <li><span className="font-semibold text-foreground">Chat:</span> Start a conversation with your documents to ask questions and get insights.</li>
                <li><span className="font-semibold text-foreground">Tasks:</span> View and manage action items extracted from your documents.</li>
            </ul>
          </CardContent>
        </Card>
    </div>
  )
}
