import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PublicInventoryItem {
  id: string;
  name: string;
  brand: string | null;
  size: string | null;
  askingPrice: number | null;
  imageUrl: string | null;
  imageUrls: string[];
  category: string;
  brandCategory: string | null;
}

export function usePublicInventory() {
  return useQuery({
    queryKey: ['public-inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('id, name, brand, size, asking_price, image_url, image_urls, category, brand_category')
        .eq('status', 'listed')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching public inventory:', error);
        throw error;
      }

      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        brand: item.brand,
        size: item.size,
        askingPrice: item.asking_price ? Number(item.asking_price) : null,
        imageUrl: item.image_url,
        imageUrls: item.image_urls || [],
        category: item.category,
        brandCategory: item.brand_category,
      })) as PublicInventoryItem[];
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
