import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface RemoveBgKey {
  id: string;
  key_name: string;
  api_key: string;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export function useRemoveBgKeys() {
  const queryClient = useQueryClient();

  const { data: keys, isLoading, error } = useQuery({
    queryKey: ['removebg-keys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('removebg_api_keys')
        .select('*')
        .order('priority', { ascending: true });

      if (error) throw error;
      return data as RemoveBgKey[];
    }
  });

  const addKeyMutation = useMutation({
    mutationFn: async ({ keyName, apiKey }: { keyName: string; apiKey: string }) => {
      // Get max priority
      const maxPriority = keys?.reduce((max, k) => Math.max(max, k.priority), -1) ?? -1;
      
      const { data, error } = await supabase
        .from('removebg_api_keys')
        .insert({
          key_name: keyName,
          api_key: apiKey,
          priority: maxPriority + 1,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['removebg-keys'] });
      queryClient.invalidateQueries({ queryKey: ['removebg-usage'] });
      toast.success('API key added successfully');
    },
    onError: (error) => {
      console.error('Error adding key:', error);
      toast.error('Failed to add API key');
    }
  });

  const deleteKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const { error } = await supabase
        .from('removebg_api_keys')
        .delete()
        .eq('id', keyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['removebg-keys'] });
      queryClient.invalidateQueries({ queryKey: ['removebg-usage'] });
      toast.success('API key deleted');
    },
    onError: (error) => {
      console.error('Error deleting key:', error);
      toast.error('Failed to delete API key');
    }
  });

  const updateKeyMutation = useMutation({
    mutationFn: async ({ keyId, updates }: { keyId: string; updates: Partial<RemoveBgKey> }) => {
      const { error } = await supabase
        .from('removebg_api_keys')
        .update(updates)
        .eq('id', keyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['removebg-keys'] });
      toast.success('API key updated');
    },
    onError: (error) => {
      console.error('Error updating key:', error);
      toast.error('Failed to update API key');
    }
  });

  const reorderKeysMutation = useMutation({
    mutationFn: async (orderedKeyIds: string[]) => {
      // Update priorities based on new order
      const updates = orderedKeyIds.map((id, index) => 
        supabase
          .from('removebg_api_keys')
          .update({ priority: index })
          .eq('id', id)
      );
      
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['removebg-keys'] });
      queryClient.invalidateQueries({ queryKey: ['removebg-usage'] });
    },
    onError: (error) => {
      console.error('Error reordering keys:', error);
      toast.error('Failed to reorder keys');
    }
  });

  const setPrimaryKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      if (!keys) return;
      
      // Move the selected key to the front
      const orderedIds = [keyId, ...keys.filter(k => k.id !== keyId).map(k => k.id)];
      
      // Update all priorities
      const updates = orderedIds.map((id, index) => 
        supabase
          .from('removebg_api_keys')
          .update({ priority: index })
          .eq('id', id)
      );
      
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['removebg-keys'] });
      queryClient.invalidateQueries({ queryKey: ['removebg-usage'] });
      toast.success('Primary key updated');
    },
    onError: (error) => {
      console.error('Error setting primary key:', error);
      toast.error('Failed to set primary key');
    }
  });

  return {
    keys: keys || [],
    isLoading,
    error,
    addKey: addKeyMutation.mutate,
    deleteKey: deleteKeyMutation.mutate,
    updateKey: updateKeyMutation.mutate,
    reorderKeys: reorderKeysMutation.mutate,
    setPrimaryKey: setPrimaryKeyMutation.mutate,
    isAdding: addKeyMutation.isPending,
    isDeleting: deleteKeyMutation.isPending,
    isSettingPrimary: setPrimaryKeyMutation.isPending
  };
}
