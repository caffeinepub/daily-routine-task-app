import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Task, UserProfile } from '../backend';
import { toast } from 'sonner';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetAllTasks() {
  const { actor, isFetching } = useActor();

  return useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTasks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, description, reminderTime }: { title: string; description: string; reminderTime: bigint | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createTask(title, description, reminderTime);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create task: ${error.message}`);
    },
  });
}

export function useUpdateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, title, description, reminderTime }: { taskId: bigint; title: string; description: string; reminderTime: bigint | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTask(taskId, title, description, reminderTime);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update task: ${error.message}`);
    },
  });
}

export function useDeleteTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteTask(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete task: ${error.message}`);
    },
  });
}

export function useCompleteTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.completeTask(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to complete task: ${error.message}`);
    },
  });
}

export function useToggleProcrastination() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleProcrastination(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to toggle procrastination: ${error.message}`);
    },
  });
}

export function useGetAutoReset() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['autoReset'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.getAutoReset();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetAutoReset() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setAutoReset(enabled);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autoReset'] });
      toast.success('Auto-reset preference updated!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update preference: ${error.message}`);
    },
  });
}

export function useGetNotificationsEnabled() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['notificationsEnabled'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.getNotificationsEnabled();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetNotificationsEnabled() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setNotificationsEnabled(enabled);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationsEnabled'] });
      toast.success('Notification preference updated!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update preference: ${error.message}`);
    },
  });
}

