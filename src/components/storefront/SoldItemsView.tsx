 import { Loader2, Archive } from 'lucide-react';
 import { useSoldInventory, SoldInventoryItem } from '@/hooks/useSoldInventory';
 import { SoldProductCard } from './SoldProductCard';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
 
 interface SoldItemsViewProps {
   onItemClick: (item: SoldInventoryItem) => void;
  isEditMode?: boolean;
 }
 
export function SoldItemsView({ onItemClick, isEditMode = false }: SoldItemsViewProps) {
   const { data: soldItems, isLoading } = useSoldInventory();
  const queryClient = useQueryClient();

  const handleRemoveFromArchive = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .update({ hide_from_sold_archive: true })
        .eq('id', itemId);

      if (error) throw error;

      toast.success('Removed from sold archive');
      queryClient.invalidateQueries({ queryKey: ['public-inventory', 'sold'] });
    } catch (err) {
      console.error('Error hiding item:', err);
      toast.error('Failed to remove item');
    }
  };
 
   if (isLoading) {
     return (
       <div className="flex items-center justify-center py-12">
         <Loader2 className="h-8 w-8 animate-spin text-white/50" />
       </div>
     );
   }
 
   if (!soldItems || soldItems.length === 0) {
     return (
       <div className="text-center py-12">
         <Archive className="h-12 w-12 text-white/50 mx-auto mb-4" />
         <h3 className="text-lg font-medium mb-2">No Sold Items Yet</h3>
         <p className="text-white/60">
           Previously sold items will appear here as an archive.
         </p>
       </div>
     );
   }
 
   return (
     <div className="space-y-6">
       <p className="text-white/60 text-sm">
         {soldItems.length} items sold
       </p>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {soldItems.map((item) => (
           <SoldProductCard 
             key={item.id} 
             item={item}
          isEditMode={isEditMode}
             onClick={() => onItemClick(item)}
          onRemove={() => handleRemoveFromArchive(item.id)}
           />
         ))}
       </div>
     </div>
   );
 }