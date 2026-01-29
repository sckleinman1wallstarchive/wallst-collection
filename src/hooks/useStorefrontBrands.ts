import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StorefrontBrand {
  id: string;
  brand_name: string;
  featured_item_id: string | null;
  art_image_url: string | null;
  display_order: number;
  size_preset?: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  featured_image_url?: string | null;
}

export function useStorefrontBrands() {
  const queryClient = useQueryClient();

  const brandsQuery = useQuery({
    queryKey: ['storefront-brands'],
    queryFn: async () => {
      // Get brands with their featured item's first image
      const { data: brands, error } = await supabase
        .from('storefront_brands')
        .select('*')
        .order('display_order');
      
      if (error) throw error;

      // Get featured images for each brand
      const brandsWithImages: StorefrontBrand[] = await Promise.all(
        (brands || []).map(async (brand) => {
          if (!brand.featured_item_id) {
            return { ...brand, featured_image_url: null };
          }
          
          const { data: item } = await supabase
            .from('inventory_items')
            .select('image_urls, image_url')
            .eq('id', brand.featured_item_id)
            .single();
          
          const featuredUrl = item?.image_urls?.[0] || item?.image_url || null;
          return { ...brand, featured_image_url: featuredUrl };
        })
      );

      return brandsWithImages;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const addBrandMutation = useMutation({
    mutationFn: async ({ brandName, featuredItemId }: { brandName: string; featuredItemId?: string }) => {
      const { data, error } = await supabase
        .from('storefront_brands')
        .insert({
          brand_name: brandName,
          featured_item_id: featuredItemId || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storefront-brands'] });
      toast.success('Brand added');
    },
    onError: (error: any) => {
      if (error?.code === '23505') {
        toast.error('Brand already exists');
      } else {
        toast.error('Failed to add brand');
      }
    },
  });

  const updateBrandMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<StorefrontBrand> }) => {
      const { error } = await supabase
        .from('storefront_brands')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storefront-brands'] });
    },
    onError: () => {
      toast.error('Failed to update brand');
    },
  });

  const deleteBrandMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('storefront_brands')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storefront-brands'] });
      toast.success('Brand removed');
    },
    onError: () => {
      toast.error('Failed to remove brand');
    },
  });

  const reorderBrandsMutation = useMutation({
    mutationFn: async (updates: { id: string; order: number }[]) => {
      for (const { id, order } of updates) {
        const { error } = await supabase
          .from('storefront_brands')
          .update({ display_order: order })
          .eq('id', id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storefront-brands'] });
    },
    onError: () => {
      toast.error('Failed to reorder brands');
    },
  });

  const uploadArtImage = async (brandId: string, file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `brands/${brandId}-${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('inventory-images')
      .upload(fileName, file);
    
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('inventory-images')
      .getPublicUrl(fileName);

    await updateBrandMutation.mutateAsync({ id: brandId, updates: { art_image_url: publicUrl } });
    return publicUrl;
  };

  // Fetch assigned item IDs for a brand
  const fetchBrandItemIds = async (brandId: string): Promise<string[]> => {
    const { data, error } = await supabase
      .from('storefront_brand_items')
      .select('inventory_item_id')
      .eq('brand_id', brandId)
      .order('display_order');
    
    if (error) return [];
    return (data || []).map(row => row.inventory_item_id);
  };

  return {
    brands: brandsQuery.data || [],
    isLoading: brandsQuery.isLoading,
    addBrand: addBrandMutation.mutate,
    updateBrand: updateBrandMutation.mutate,
    deleteBrand: deleteBrandMutation.mutate,
    reorderBrands: reorderBrandsMutation.mutate,
    uploadArtImage,
    fetchBrandItemIds,
  };
}
