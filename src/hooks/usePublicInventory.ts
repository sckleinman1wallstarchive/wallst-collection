import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type ClosetDisplayType = 'nfs' | 'dm';

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
  status: string;
  closetDisplay: ClosetDisplayType;
  notes?: string | null;
}

// Fetch items for Shop All (for-sale status)
export function usePublicInventory() {
  return useQuery({
    queryKey: ['public-inventory', 'for-sale'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('id, name, brand, size, asking_price, image_url, image_urls, category, brand_category, status, closet_display, notes')
        .eq('status', 'for-sale')
        .order('storefront_display_order', { ascending: true });

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
        status: item.status,
        closetDisplay: (item.closet_display as ClosetDisplayType) || 'nfs',
        notes: item.notes,
      })) as PublicInventoryItem[];
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Fetch items for a specific closet (in-closet-parker or in-closet-spencer)
export function useClosetInventory(owner: 'parker' | 'spencer') {
  const status = owner === 'parker' ? 'in-closet-parker' : 'in-closet-spencer';
  
  return useQuery({
    queryKey: ['public-inventory', status],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('id, name, brand, size, asking_price, image_url, image_urls, category, brand_category, status, closet_display, notes')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching closet inventory:', error);
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
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
