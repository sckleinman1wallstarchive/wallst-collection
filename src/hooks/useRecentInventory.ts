import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { PublicInventoryItem, ClosetDisplayType } from '@/hooks/usePublicInventory';

// Fetch newest 12 items for New Arrivals section
export function useRecentInventory(limit: number = 12) {
  return useQuery({
    queryKey: ['recent-inventory', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('id, name, brand, size, asking_price, image_url, image_urls, category, brand_category, status, closet_display, notes')
        .eq('status', 'for-sale')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent inventory:', error);
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
        status: item.status,
        closetDisplay: (item.closet_display as ClosetDisplayType) || 'nfs',
        notes: item.notes,
      })) as PublicInventoryItem[];
    },
    staleTime: 1000 * 60 * 2,
  });
}
