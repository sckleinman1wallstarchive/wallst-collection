 import { Loader2, Archive } from 'lucide-react';
 import { useSoldInventory, SoldInventoryItem } from '@/hooks/useSoldInventory';
 import { SoldProductCard } from './SoldProductCard';
 
 interface SoldItemsViewProps {
   onItemClick: (item: SoldInventoryItem) => void;
 }
 
 export function SoldItemsView({ onItemClick }: SoldItemsViewProps) {
   const { data: soldItems, isLoading } = useSoldInventory();
 
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
             onClick={() => onItemClick(item)}
           />
         ))}
       </div>
     </div>
   );
 }