import { useState } from 'react';
 import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
 import { SoldInventoryItem } from '@/hooks/useSoldInventory';
 
 interface SoldProductCardProps {
   item: SoldInventoryItem;
  isEditMode?: boolean;
   onClick: () => void;
  onRemove?: () => void;
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
 
export function SoldProductCard({ item, isEditMode = false, onClick, onRemove }: SoldProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
   const imageUrl = item.imageUrls?.[0] || item.imageUrl;
 
   return (
     <div
       onClick={onClick}
      className="group cursor-pointer rounded-lg overflow-hidden relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
     >
      {/* Image with hover effect */}
      <div className="aspect-square bg-zinc-800 relative overflow-hidden rounded-lg">
         {imageUrl ? (
          <>
            {/* Base image with overlay */}
            <img
              src={imageUrl}
              alt={item.name}
              className={`w-full h-full object-cover transition-all duration-300 ${
                isHovered ? 'opacity-100 grayscale-0' : 'opacity-70 grayscale-[30%]'
              }`}
            />
            {/* Dark overlay with text - fades on hover */}
            <div
              className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${
                isHovered ? 'opacity-0' : 'opacity-100'
              }`}
            >
              {/* SOLD Badge */}
              <div className="absolute top-3 left-3">
                <Badge variant="destructive" className="bg-red-600 text-white font-semibold">
                  SOLD
                </Badge>
              </div>
              {/* Bottom text */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-medium text-white text-sm truncate">{item.name}</h3>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-lg font-semibold text-white">
                    {item.salePrice ? formatCurrency(item.salePrice) : 'N/A'}
                  </span>
                  {item.size && (
                    <span className="text-xs text-white/60">Size: {item.size}</span>
                  )}
                </div>
              </div>
            </div>
          </>
         ) : (
           <div className="w-full h-full flex items-center justify-center text-white/30">
             No Image
           </div>
         )}
       </div>
 
      {/* Edit Mode: Remove button */}
      {isEditMode && onRemove && (
        <Button
          size="icon"
          variant="destructive"
          className="absolute top-2 right-2 h-7 w-7 z-10"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
     </div>
   );
 }