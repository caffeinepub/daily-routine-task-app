import { useState, useEffect } from 'react';
import { useCreateTask, useUpdateTask } from '../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Task } from '../backend';

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
}

export default function TaskDialog({ open, onOpenChange, task }: TaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  
  const { mutate: createTask, isPending: isCreating } = useCreateTask();
  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask();

  const isPending = isCreating || isUpdating;

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      if (task.reminderTime) {
        const date = new Date(Number(task.reminderTime) / 1_000_000);
        const timeString = date.toTimeString().slice(0, 5);
        setReminderTime(timeString);
      } else {
        setReminderTime('');
      }
    } else {
      setTitle('');
      setDescription('');
      setReminderTime('');
    }
  }, [task, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let reminderTimeNano: bigint | null = null;
    if (reminderTime) {
      const [hours, minutes] = reminderTime.split(':').map(Number);
      const now = new Date();
      const reminderDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
      reminderTimeNano = BigInt(reminderDate.getTime() * 1_000_000);
    }

    if (task) {
      updateTask(
        { taskId: task.id, title, description, reminderTime: reminderTimeNano },
        {
          onSuccess: () => {
            onOpenChange(false);
          },
        }
      );
    } else {
      createTask(
        { title, description, reminderTime: reminderTimeNano },
        {
          onSuccess: () => {
            onOpenChange(false);
          },
        }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
            <DialogDescription>
              {task ? 'Update your task details below.' : 'Add a new task to your daily routine.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Morning workout"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Add details about your task..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminderTime">Reminder Time</Label>
              <Input
                id="reminderTime"
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Set a time to receive a browser notification
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !title.trim()}>
              {isPending ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
