 import { useQuery } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 
 export interface SoldInventoryItem {
   id: string;
   name: string;
   brand: string | null;
   size: string | null;
   salePrice: number | null;
   askingPrice: number | null;
   imageUrl: string | null;
   imageUrls: string[] | null;
   notes: string | null;
   dateSold: string | null;
  hideFromSoldArchive: boolean | null;
 }
 
 export function useSoldInventory() {
   return useQuery({
     queryKey: ['public-inventory', 'sold'],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('inventory_items')
        .select('id, name, brand, size, sale_price, asking_price, image_url, image_urls, notes, date_sold, hide_from_sold_archive')
         .eq('status', 'sold')
        .neq('hide_from_sold_archive', true)
         .order('date_sold', { ascending: false })
         .limit(100);
 
       if (error) throw error;
 
       return (data || []).map(item => ({
         id: item.id,
         name: item.name,
         brand: item.brand,
         size: item.size,
         salePrice: item.sale_price,
         askingPrice: item.asking_price,
         imageUrl: item.image_url,
         imageUrls: item.image_urls,
         notes: item.notes,
         dateSold: item.date_sold,
        hideFromSoldArchive: item.hide_from_sold_archive,
       })) as SoldInventoryItem[];
     },
   });
 }