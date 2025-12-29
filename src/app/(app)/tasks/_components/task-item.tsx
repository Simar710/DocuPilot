'use client';

import { Task } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const { toast } = useToast();
  const { user } = useAuth();

  const handleCheckedChange = async (checked: boolean) => {
    if (!user) return;
    const taskRef = doc(db, 'users', user.uid, 'tasks', task.id);
    try {
      await updateDoc(taskRef, { isCompleted: checked });
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: 'Could not update the task status.',
      });
    }
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-md border bg-card hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-4">
        <Checkbox
          id={`task-${task.id}`}
          checked={task.isCompleted}
          onCheckedChange={handleCheckedChange}
          aria-label="Mark task as complete"
        />
        <label
          htmlFor={`task-${task.id}`}
          className={`flex-1 cursor-pointer ${
            task.isCompleted ? 'text-muted-foreground line-through' : ''
          }`}
        >
          {task.content}
        </label>
      </div>
      {task.sourceDocumentId && (
         <Button variant="ghost" size="sm" asChild>
            <Link href={`/docs?highlight=${task.sourceDocumentId}`} title={`From: ${task.sourceDocumentName}`}>
                <FileText className="mr-2 h-4 w-4" />
                <span className='hidden sm:inline'>{task.sourceDocumentName}</span>
            </Link>
        </Button>
      )}
    </div>
  );
}
