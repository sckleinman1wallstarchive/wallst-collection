import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PostingPlatform {
  id: string;
  platform_name: string;
  artwork_url: string | null;
  display_order: number;
  created_at: string;
}

export interface PostingTrackerItem {
  id: string;
  tracker_id: string;
  inventory_item_id: string;
  posted_at: string;
  created_at: string;
}

export function usePostingTracker() {
  const queryClient = useQueryClient();

  const { data: platforms = [], isLoading: platformsLoading } = useQuery({
    queryKey: ['posting-tracker-platforms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posting_tracker')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as PostingPlatform[];
    },
  });

  const { data: trackerItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['posting-tracker-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posting_tracker_items')
        .select('*');
      if (error) throw error;
      return data as PostingTrackerItem[];
    },
  });

  const getItemsForPlatform = (platformId: string) => {
    return trackerItems.filter((item) => item.tracker_id === platformId);
  };

  const addPlatform = useMutation({
    mutationFn: async (platformName: string) => {
      const maxOrder = platforms.reduce((max, p) => Math.max(max, p.display_order), -1);
      const { data, error } = await supabase
        .from('posting_tracker')
        .insert({ platform_name: platformName, display_order: maxOrder + 1 })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posting-tracker-platforms'] });
      toast.success('Platform added');
    },
    onError: () => toast.error('Failed to add platform'),
  });

  const updatePlatform = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PostingPlatform> }) => {
      const { error } = await supabase
        .from('posting_tracker')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posting-tracker-platforms'] });
    },
    onError: () => toast.error('Failed to update platform'),
  });

  const deletePlatform = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('posting_tracker')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posting-tracker-platforms'] });
      queryClient.invalidateQueries({ queryKey: ['posting-tracker-items'] });
      toast.success('Platform removed');
    },
    onError: () => toast.error('Failed to remove platform'),
  });

  const addItemsToPlatform = useMutation({
    mutationFn: async ({ trackerId, itemIds }: { trackerId: string; itemIds: string[] }) => {
      const rows = itemIds.map((id) => ({
        tracker_id: trackerId,
        inventory_item_id: id,
      }));
      const { error } = await supabase
        .from('posting_tracker_items')
        .upsert(rows, { onConflict: 'tracker_id,inventory_item_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posting-tracker-items'] });
      toast.success('Items added');
    },
    onError: () => toast.error('Failed to add items'),
  });

  const removeItemFromPlatform = useMutation({
    mutationFn: async ({ trackerId, itemId }: { trackerId: string; itemId: string }) => {
      const { error } = await supabase
        .from('posting_tracker_items')
        .delete()
        .eq('tracker_id', trackerId)
        .eq('inventory_item_id', itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posting-tracker-items'] });
    },
    onError: () => toast.error('Failed to remove item'),
  });

  return {
    platforms,
    trackerItems,
    isLoading: platformsLoading || itemsLoading,
    getItemsForPlatform,
    addPlatform: addPlatform.mutateAsync,
    updatePlatform: updatePlatform.mutateAsync,
    deletePlatform: deletePlatform.mutateAsync,
    addItemsToPlatform: addItemsToPlatform.mutateAsync,
    removeItemFromPlatform: removeItemFromPlatform.mutateAsync,
  };
}
