import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Goal {
  id: string;
  description: string;
  timeframe: string;
  owner: 'Parker' | 'Spencer' | 'WSC';
  is_complete: boolean;
  image_url: string | null;
  art_style: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateGoalInput {
  description: string;
  timeframe: string;
  owner: 'Parker' | 'Spencer' | 'WSC';
  image_url?: string | null;
  art_style?: string | null;
}

export interface UpdateGoalInput {
  id: string;
  description?: string;
  timeframe?: string;
  owner?: 'Parker' | 'Spencer' | 'WSC';
  is_complete?: boolean;
  image_url?: string | null;
  art_style?: string | null;
}

export const useGoals = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: goals = [], isLoading, error } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Goal[];
    },
  });

  const createGoal = useMutation({
    mutationFn: async (input: CreateGoalInput) => {
      // First create the goal
      const { data, error } = await supabase
        .from('goals')
        .insert(input)
        .select()
        .single();
      
      if (error) throw error;

      // If art_style is provided but no image_url, generate an image
      if (input.art_style && !input.image_url) {
        try {
          const response = await supabase.functions.invoke('generate-art-image', {
            body: { artStyle: input.art_style, goalDescription: input.description }
          });

          if (response.data?.imageUrl) {
            // Update the goal with the generated image
            const { data: updatedGoal, error: updateError } = await supabase
              .from('goals')
              .update({ image_url: response.data.imageUrl })
              .eq('id', data.id)
              .select()
              .single();

            if (!updateError && updatedGoal) {
              return updatedGoal;
            }
          }
        } catch (genError) {
          console.error('Image generation failed:', genError);
          // Continue without image - goal was still created
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({ title: 'Goal created', description: 'Your goal has been added.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateGoal = useMutation({
    mutationFn: async ({ id, ...updates }: UpdateGoalInput) => {
      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteGoal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({ title: 'Goal deleted', description: 'Your goal has been removed.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const toggleComplete = useMutation({
    mutationFn: async ({ id, is_complete }: { id: string; is_complete: boolean }) => {
      const { data, error } = await supabase
        .from('goals')
        .update({ is_complete })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({ 
        title: data.is_complete ? 'Goal completed!' : 'Goal reopened',
        description: data.is_complete ? 'Congratulations on achieving your goal!' : 'Goal marked as in progress.'
      });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return {
    goals,
    isLoading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    toggleComplete,
  };
};
