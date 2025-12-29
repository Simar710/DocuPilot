'use client';

import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { Task } from '@/lib/types';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { TaskList } from './_components/task-list';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ListTodo } from 'lucide-react';

export default function TasksPage() {
  const { user } = useAuth();
  const [value, loading, error] = useCollection(
    user ? query(collection(db, 'tasks'), where('userId', '==', user.uid), orderBy('createdAt', 'desc')) : null
  );

  const tasks = value?.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Task));

  return (
    <div className="space-y-6">
       <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">
            Here are the action items extracted from your documents.
          </p>
        </div>

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <ListTodo className="h-4 w-4" />
          <AlertTitle>Error loading tasks</AlertTitle>
          <AlertDescription>
            There was a problem fetching your tasks. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {!loading && !error && tasks && <TaskList tasks={tasks} />}
    </div>
  );
}
