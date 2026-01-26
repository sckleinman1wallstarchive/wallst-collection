import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CollectionPhoto {
  id: string;
  image_url: string;
  display_order: number;
  created_at: string;
}

export function useCollectionPhotos() {
  const queryClient = useQueryClient();

  const photosQuery = useQuery({
    queryKey: ['collection-photos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collection_photos')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      return data as CollectionPhoto[];
    },
    staleTime: 1000 * 60 * 2,
  });

  const addPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `collection/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('inventory-images')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('inventory-images')
        .getPublicUrl(fileName);

      // Get current max order
      const currentPhotos = photosQuery.data || [];
      const maxOrder = currentPhotos.length > 0 
        ? Math.max(...currentPhotos.map(p => p.display_order)) + 1 
        : 0;

      const { data, error } = await supabase
        .from('collection_photos')
        .insert({
          image_url: publicUrl,
          display_order: maxOrder,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection-photos'] });
      toast.success('Photo added');
    },
    onError: () => {
      toast.error('Failed to add photo');
    },
  });

  const deletePhotoMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('collection_photos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection-photos'] });
      toast.success('Photo removed');
    },
    onError: () => {
      toast.error('Failed to remove photo');
    },
  });

  const reorderPhotosMutation = useMutation({
    mutationFn: async (updates: { id: string; order: number }[]) => {
      for (const { id, order } of updates) {
        const { error } = await supabase
          .from('collection_photos')
          .update({ display_order: order })
          .eq('id', id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection-photos'] });
    },
    onError: () => {
      toast.error('Failed to reorder photos');
    },
  });

  return {
    photos: photosQuery.data || [],
    isLoading: photosQuery.isLoading,
    addPhoto: addPhotoMutation.mutateAsync,
    deletePhoto: deletePhotoMutation.mutate,
    reorderPhotos: reorderPhotosMutation.mutate,
    isUploading: addPhotoMutation.isPending,
  };
}
