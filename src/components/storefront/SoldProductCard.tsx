 import { Badge } from '@/components/ui/badge';
 import { SoldInventoryItem } from '@/hooks/useSoldInventory';
 
 interface SoldProductCardProps {
   item: SoldInventoryItem;
   onClick: () => void;
 }
 
 const formatCurrency = (amount: number) => {
   return new Intl.NumberFormat('en-US', {
     style: 'currency',
     currency: 'USD',
     minimumFractionDigits: 0,
   }).format(amount);
 };
 
 const generateDescription = (item: SoldInventoryItem) => {
   if (item.notes) return item.notes;
   
   const parts: string[] = [];
   parts.push(item.name);
   if (item.size) parts.push(`Size: ${item.size}`);
   parts.push('Send Offers/Trades');
   parts.push('IG: Wall Street Archive');
   return parts.join(' • ');
 };
 
 export function SoldProductCard({ item, onClick }: SoldProductCardProps) {
   const imageUrl = item.imageUrls?.[0] || item.imageUrl;
   const description = generateDescription(item);
 
   return (
     <div
       onClick={onClick}
       className="group cursor-pointer bg-zinc-900 rounded-lg overflow-hidden border border-white/10 hover:border-white/20 transition-all relative"
     >
       {/* SOLD Badge Overlay */}
       <div className="absolute top-3 left-3 z-10">
         <Badge variant="destructive" className="bg-red-600 text-white font-semibold">
           SOLD
         </Badge>
       </div>
 
       {/* Image */}
       <div className="aspect-square bg-zinc-800 relative overflow-hidden">
         {imageUrl ? (
           <img
             src={imageUrl}
             alt={item.name}
             className="w-full h-full object-cover opacity-70 grayscale-[30%]"
           />
         ) : (
           <div className="w-full h-full flex items-center justify-center text-white/30">
             No Image
           </div>
         )}
       </div>
 
       {/* Content */}
       <div className="p-4 space-y-2">
         <h3 className="font-medium text-white truncate">{item.name}</h3>
         
         <p className="text-white/60 text-sm line-clamp-2">{description}</p>
 
         <div className="flex items-center justify-between pt-2">
           <span className="text-lg font-semibold text-white">
             {item.salePrice ? formatCurrency(item.salePrice) : 'N/A'}
           </span>
           {item.size && (
             <span className="text-sm text-white/60">Size: {item.size}</span>
           )}
         </div>
       </div>
     </div>
   );
 }