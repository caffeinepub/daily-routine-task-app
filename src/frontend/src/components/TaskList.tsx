import { useState, useEffect } from 'react';
import { useGetAllTasks, useCompleteTask, useGetNotificationsEnabled, useToggleProcrastination } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Flame, Clock, Edit, Trash2, Hourglass } from 'lucide-react';
import TaskDialog from './TaskDialog';
import { toast } from 'sonner';
import type { Task } from '../backend';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDeleteTask } from '../hooks/useQueries';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function TaskList() {
  const { data: tasks = [], isLoading } = useGetAllTasks();
  const { data: notificationsEnabled = false } = useGetNotificationsEnabled();
  const { mutate: completeTask } = useCompleteTask();
  const { mutate: deleteTask } = useDeleteTask();
  const { mutate: toggleProcrastination } = useToggleProcrastination();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [scheduledNotifications, setScheduledNotifications] = useState<Set<string>>(new Set());

  // Schedule notifications for tasks with reminder times
  useEffect(() => {
    if (!notificationsEnabled || !tasks.length) return;

    const newScheduled = new Set<string>();

    tasks.forEach(task => {
      if (task.reminderTime && !task.completed) {
        const taskKey = task.id.toString();
        const reminderTime = Number(task.reminderTime) / 1_000_000; // Convert to milliseconds
        const now = Date.now();
        const timeUntilReminder = reminderTime - now;

        // Schedule notification if it's in the future and not already scheduled
        if (timeUntilReminder > 0 && !scheduledNotifications.has(taskKey)) {
          newScheduled.add(taskKey);

          const timeoutId = setTimeout(() => {
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Task Reminder', {
                body: task.title,
                icon: '/assets/generated/notification-bell.dim_64x64.png',
                tag: taskKey,
              });
            } else {
              toast.info(`Reminder: ${task.title}`, {
                description: task.description || undefined,
              });
            }
          }, timeUntilReminder);

          // Clean up timeout when component unmounts or task changes
          return () => clearTimeout(timeoutId);
        }
      }
    });

    setScheduledNotifications(prev => new Set([...prev, ...newScheduled]));
  }, [tasks, notificationsEnabled, scheduledNotifications]);

  const handleComplete = (taskId: bigint, completed: boolean) => {
    if (!completed) {
      completeTask(taskId);
    }
  };

  const handleProcrastinate = (taskId: bigint) => {
    toggleProcrastination(taskId);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleDelete = (task: Task) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id);
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingTask(null);
  };

  // Separate tasks into regular and procrastinated
  const regularTasks = tasks.filter(t => !t.procrastinated);
  const procrastinatedTasks = tasks.filter(t => t.procrastinated);

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const renderTask = (task: Task) => (
    <Card key={task.id.toString()} className={`${task.completed ? 'opacity-60' : ''} ${task.procrastinated ? 'bg-muted/50 border-muted' : ''} transition-all`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => handleComplete(task.id, task.completed)}
            className="mt-1"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {task.procrastinated && (
                    <img 
                      src="/assets/generated/procrastination-hourglass-transparent.dim_32x32.png" 
                      alt="Procrastinated" 
                      className="h-5 w-5 opacity-70"
                    />
                  )}
                  <h3 className={`font-semibold ${task.completed ? 'line-through text-muted-foreground' : ''} ${task.procrastinated ? 'text-muted-foreground' : ''}`}>
                    {task.title}
                  </h3>
                </div>
                {task.description && (
                  <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={task.procrastinated ? "secondary" : "ghost"}
                        size="icon"
                        onClick={() => handleProcrastinate(task.id)}
                        className={`h-8 w-8 rounded-full transition-all hover:scale-105 ${task.procrastinated ? 'bg-muted hover:bg-muted/80' : ''}`}
                      >
                        <Hourglass className={`h-4 w-4 ${task.procrastinated ? 'animate-pulse' : ''}`} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Procrastinate this task 😅</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(task)}
                  className="h-8 w-8"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(task)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {task.reminderTime && (
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(Number(task.reminderTime) / 1_000_000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Badge>
              )}
              <Badge variant="secondary" className="gap-1">
                <Flame className="h-3 w-3" />
                Streak: 0
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Stats Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Today's Progress</CardTitle>
              <CardDescription>Keep up the great work!</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{completionPercentage}%</div>
              <div className="text-sm text-muted-foreground">{completedCount} of {totalCount}</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Add Task Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Tasks</h2>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 p-4 rounded-full bg-muted">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
            <p className="text-muted-foreground mb-4">Create your first task to start building your routine</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Regular Tasks */}
          {regularTasks.length > 0 && (
            <div className="space-y-3">
              {regularTasks.map(task => renderTask(task))}
            </div>
          )}

          {/* Procrastinated Tasks Section */}
          {procrastinatedTasks.length > 0 && (
            <div className="space-y-3 mt-8">
              <div className="flex items-center gap-2">
                <img 
                  src="/assets/generated/procrastination-hourglass-transparent.dim_32x32.png" 
                  alt="Procrastinated" 
                  className="h-6 w-6 opacity-70"
                />
                <h3 className="text-lg font-semibold text-muted-foreground">Procrastinated Tasks</h3>
                <Badge variant="secondary">{procrastinatedTasks.length}</Badge>
              </div>
              {procrastinatedTasks.map(task => renderTask(task))}
            </div>
          )}
        </>
      )}

      <TaskDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        task={editingTask}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{taskToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

