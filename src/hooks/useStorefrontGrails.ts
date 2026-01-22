import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PublicInventoryItem } from '@/hooks/usePublicInventory';

export interface StorefrontGrail {
  id: string;
  inventory_item_id: string | null;
  position: number;
  art_image_url: string | null;
  created_at: string;
  updated_at: string;
  // Joined item data
  item?: PublicInventoryItem | null;
}

// Define 8 grail positions with varying sizes for the masonry layout
export const GRAIL_POSITIONS = [
  { position: 1, size: 'large' as const },
  { position: 2, size: 'medium' as const },
  { position: 3, size: 'small' as const },
  { position: 4, size: 'medium' as const },
  { position: 5, size: 'large' as const },
  { position: 6, size: 'small' as const },
  { position: 7, size: 'medium' as const },
  { position: 8, size: 'small' as const },
];

export function useStorefrontGrails() {
  const queryClient = useQueryClient();

  const grailsQuery = useQuery({
    queryKey: ['storefront-grails'],
    queryFn: async () => {
      const { data: grails, error } = await supabase
        .from('storefront_grails')
        .select('*')
        .order('position');
      
      if (error) throw error;

      // Get item data for each grail
      const grailsWithItems: StorefrontGrail[] = await Promise.all(
        (grails || []).map(async (grail) => {
          if (!grail.inventory_item_id) {
            return { ...grail, item: null };
          }
          
          const { data: item } = await supabase
            .from('inventory_items')
            .select('id, name, brand, size, asking_price, image_url, image_urls, category, brand_category, status, closet_display')
            .eq('id', grail.inventory_item_id)
            .single();
          
          if (!item) return { ...grail, item: null };

          const mappedItem: PublicInventoryItem = {
            id: item.id,
            name: item.name,
            brand: item.brand,
            size: item.size,
            askingPrice: item.asking_price ? Number(item.asking_price) : null,
            imageUrl: item.image_url,
            imageUrls: (item.image_urls as string[]) || [],
            category: item.category,
            brandCategory: item.brand_category,
            status: item.status,
            closetDisplay: (item.closet_display as 'nfs' | 'dm') || 'nfs',
          };

          return { ...grail, item: mappedItem };
        })
      );

      return grailsWithItems;
    },
    staleTime: 1000 * 60 * 2,
  });

  const addGrailMutation = useMutation({
    mutationFn: async ({ position, inventoryItemId }: { position: number; inventoryItemId: string }) => {
      // First check if position exists, update if so
      const { data: existing } = await supabase
        .from('storefront_grails')
        .select('id')
        .eq('position', position)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('storefront_grails')
          .update({ inventory_item_id: inventoryItemId })
          .eq('position', position);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('storefront_grails')
          .insert({ position, inventory_item_id: inventoryItemId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storefront-grails'] });
      toast.success('Grail added');
    },
    onError: () => {
      toast.error('Failed to add grail');
    },
  });

  const removeGrailMutation = useMutation({
    mutationFn: async (position: number) => {
      const { error } = await supabase
        .from('storefront_grails')
        .delete()
        .eq('position', position);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storefront-grails'] });
      toast.success('Grail removed');
    },
    onError: () => {
      toast.error('Failed to remove grail');
    },
  });

  const updateArtMutation = useMutation({
    mutationFn: async ({ position, artUrl }: { position: number; artUrl: string }) => {
      const { data: existing } = await supabase
        .from('storefront_grails')
        .select('id')
        .eq('position', position)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('storefront_grails')
          .update({ art_image_url: artUrl })
          .eq('position', position);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storefront-grails'] });
    },
    onError: () => {
      toast.error('Failed to update art');
    },
  });

  const updateSizeMutation = useMutation({
    mutationFn: async ({ position, sizePreset }: { position: number; sizePreset: string }) => {
      const { error } = await supabase
        .from('storefront_grails')
        .update({ size_preset: sizePreset } as any)
        .eq('position', position);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storefront-grails'] });
    },
    onError: () => {
      toast.error('Failed to update size');
    },
  });

  const uploadArtImage = async (position: number, file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `grails/pos${position}-${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('inventory-images')
      .upload(fileName, file);
    
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('inventory-images')
      .getPublicUrl(fileName);

    await updateArtMutation.mutateAsync({ position, artUrl: publicUrl });
    return publicUrl;
  };

  // Map grails to positions
  const grailsByPosition = new Map(
    (grailsQuery.data || []).map((g) => [g.position, g])
  );

  return {
    grails: grailsQuery.data || [],
    grailsByPosition,
    isLoading: grailsQuery.isLoading,
    addGrail: addGrailMutation.mutate,
    removeGrail: removeGrailMutation.mutate,
    uploadArtImage,
    updateGrailSize: updateSizeMutation.mutate,
  };
}
