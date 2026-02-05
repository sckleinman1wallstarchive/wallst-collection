 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 
export type TaskOwner = 'spencer' | 'parker' | 'both';
 export type TaskStatus = 'todo' | 'in-progress' | 'done';
 export type TaskPriority = 'low' | 'medium' | 'high';
 
 export interface Task {
   id: string;
   title: string;
   description: string | null;
   owner: TaskOwner;
   status: TaskStatus;
   dueDate: string;
   priority: TaskPriority;
   category: string | null;
   createdAt: string;
   completedAt: string | null;
   updatedAt: string;
 }
 
 interface DbTask {
   id: string;
   title: string;
   description: string | null;
   owner: TaskOwner;
   status: TaskStatus;
   due_date: string;
   priority: TaskPriority;
   category: string | null;
   created_at: string;
   completed_at: string | null;
   updated_at: string;
 }
 
 const mapDbToTask = (db: DbTask): Task => ({
   id: db.id,
   title: db.title,
   description: db.description,
   owner: db.owner,
   status: db.status,
   dueDate: db.due_date,
   priority: db.priority,
   category: db.category,
   createdAt: db.created_at,
   completedAt: db.completed_at,
   updatedAt: db.updated_at,
 });
 
 export function useTasks() {
   const queryClient = useQueryClient();
 
   const { data: tasks = [], isLoading } = useQuery({
     queryKey: ['tasks'],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('tasks')
         .select('*')
         .order('due_date', { ascending: true });
 
       if (error) throw error;
       return (data as DbTask[]).map(mapDbToTask);
     },
   });
 
   const addTaskMutation = useMutation({
     mutationFn: async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>) => {
       const { data, error } = await supabase
         .from('tasks')
         .insert({
           title: task.title,
           description: task.description,
           owner: task.owner,
           status: task.status,
           due_date: task.dueDate,
           priority: task.priority,
           category: task.category,
         })
         .select()
         .single();
 
       if (error) throw error;
       return mapDbToTask(data as DbTask);
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['tasks'] });
     },
   });
 
   const updateTaskMutation = useMutation({
     mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
       const dbUpdates: Record<string, unknown> = {};
       if (updates.title !== undefined) dbUpdates.title = updates.title;
       if (updates.description !== undefined) dbUpdates.description = updates.description;
       if (updates.owner !== undefined) dbUpdates.owner = updates.owner;
       if (updates.status !== undefined) dbUpdates.status = updates.status;
       if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
       if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
       if (updates.category !== undefined) dbUpdates.category = updates.category;
       if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt;
 
       const { error } = await supabase
         .from('tasks')
         .update(dbUpdates)
         .eq('id', id);
 
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['tasks'] });
     },
   });
 
   const deleteTaskMutation = useMutation({
     mutationFn: async (id: string) => {
       const { error } = await supabase
         .from('tasks')
         .delete()
         .eq('id', id);
 
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['tasks'] });
     },
   });
 
   const toggleTaskStatus = async (id: string, currentStatus: TaskStatus) => {
     const newStatus: TaskStatus = currentStatus === 'done' ? 'todo' : 'done';
     const completedAt = newStatus === 'done' ? new Date().toISOString() : null;
     await updateTaskMutation.mutateAsync({ id, updates: { status: newStatus, completedAt } });
   };
 
   const getTasksForDate = (date: string) => {
     return tasks.filter(task => task.dueDate === date);
   };
 
   const getTasksByOwner = (owner: TaskOwner) => {
     return tasks.filter(task => task.owner === owner);
   };
 
   return {
     tasks,
     isLoading,
     addTask: addTaskMutation.mutateAsync,
     updateTask: updateTaskMutation.mutateAsync,
     deleteTask: deleteTaskMutation.mutateAsync,
     toggleTaskStatus,
     getTasksForDate,
     getTasksByOwner,
   };
 }