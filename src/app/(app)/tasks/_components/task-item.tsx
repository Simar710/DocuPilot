'use client';

import { useState } from 'react';
import { Task } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { FileText, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

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
  
  const handleDelete = async () => {
      if (!user) return;
      const taskRef = doc(db, 'users', user.uid, 'tasks', task.id);
      try {
          await deleteDoc(taskRef);
          toast({
              title: 'Task deleted',
              description: 'The task has been successfully removed.',
          });
      } catch (error) {
          console.error('Error deleting task:', error);
          toast({
              variant: 'destructive',
              title: 'Deletion failed',
              description: 'Could not delete the task.',
          });
      }
  }

  return (
    <div className="flex items-start justify-between p-3 rounded-md border bg-card hover:bg-muted/50 transition-colors">
      <div className="flex items-start gap-4 flex-1 min-w-0">
        <Checkbox
          id={`task-${task.id}`}
          checked={task.isCompleted}
          onCheckedChange={handleCheckedChange}
          aria-label="Mark task as complete"
          className="mt-1"
        />
        <div 
            className="flex-1 min-w-0 cursor-pointer" 
            onClick={() => setIsExpanded(!isExpanded)}
        >
          <p
            className={cn(
              'font-medium',
              task.isCompleted ? 'text-muted-foreground line-through' : '',
              isExpanded ? 'whitespace-normal' : 'truncate'
            )}
          >
            {task.content}
          </p>
        </div>
      </div>
      <div className="flex items-center ml-4">
        {task.sourceDocumentId && (
           <Button variant="ghost" size="sm" asChild>
              <Link href={`/docs?highlight=${task.sourceDocumentId}`} title={`From: ${task.sourceDocumentName}`}>
                  <FileText className="mr-2 h-4 w-4" />
                  <span className='hidden sm:inline line-clamp-1'>{task.sourceDocumentName}</span>
              </Link>
          </Button>
        )}
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Task?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the task. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
