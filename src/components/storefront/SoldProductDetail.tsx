 import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
 import { Badge } from '@/components/ui/badge';
 import { SoldInventoryItem } from '@/hooks/useSoldInventory';
 import { useState } from 'react';
 import { ImageLightbox } from './ImageLightbox';
 
 interface SoldProductDetailProps {
   item: SoldInventoryItem | null;
   open: boolean;
   onOpenChange: (open: boolean) => void;
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
   return parts.join('\n');
 };
 
 export function SoldProductDetail({ item, open, onOpenChange }: SoldProductDetailProps) {
   const [lightboxOpen, setLightboxOpen] = useState(false);
   const [lightboxIndex, setLightboxIndex] = useState(0);
 
   if (!item) return null;
 
   const images = item.imageUrls?.length ? item.imageUrls : (item.imageUrl ? [item.imageUrl] : []);
   const description = generateDescription(item);
 
   const handleImageClick = (index: number) => {
     setLightboxIndex(index);
     setLightboxOpen(true);
   };
 
   return (
     <>
       <Sheet open={open} onOpenChange={onOpenChange}>
         <SheetContent 
           side="right" 
           className="w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl p-0 bg-black text-white border-white/10 h-[90vh] my-auto overflow-y-auto"
         >
           <SheetTitle className="sr-only">{item.name}</SheetTitle>
           
           <div className="p-6 space-y-6">
             {/* SOLD Badge */}
             <Badge variant="destructive" className="bg-red-600 text-white font-semibold text-sm">
               SOLD
             </Badge>
 
             {/* Main Image */}
             {images.length > 0 && (
               <div 
                 className="aspect-square bg-zinc-900 rounded-lg overflow-hidden cursor-zoom-in relative"
                 onClick={() => handleImageClick(0)}
               >
                 <img
                   src={images[0]}
                   alt={item.name}
                   className="w-full h-full object-cover opacity-80 grayscale-[20%]"
                 />
               </div>
             )}
 
             {/* Thumbnail Gallery */}
             {images.length > 1 && (
               <div className="grid grid-cols-4 gap-2">
                 {images.slice(1).map((url, idx) => (
                   <div
                     key={idx}
                     className="aspect-square bg-zinc-900 rounded overflow-hidden cursor-pointer opacity-70"
                     onClick={() => handleImageClick(idx + 1)}
                   >
                     <img src={url} alt="" className="w-full h-full object-cover" />
                   </div>
                 ))}
               </div>
             )}
 
             {/* Product Info */}
             <div className="space-y-4">
               <div>
                 <h2 className="text-2xl font-semibold">{item.name}</h2>
                 {item.brand && (
                   <p className="text-white/60 mt-1">{item.brand}</p>
                 )}
               </div>
 
               <div className="flex items-center gap-4">
                 <span className="text-2xl font-bold">
                   {item.salePrice ? formatCurrency(item.salePrice) : 'N/A'}
                 </span>
                 {item.size && (
                   <Badge variant="outline" className="text-white border-white/30">
                     Size: {item.size}
                   </Badge>
                 )}
               </div>
 
               {/* Description */}
               <div className="pt-4 border-t border-white/10">
                 <h3 className="text-sm font-medium text-white/60 mb-2">Description</h3>
                 <p className="text-white whitespace-pre-line">{description}</p>
               </div>
             </div>
           </div>
         </SheetContent>
       </Sheet>
 
       <ImageLightbox
         images={images}
         initialIndex={lightboxIndex}
         open={lightboxOpen}
         onClose={() => setLightboxOpen(false)}
       />
     </>
   );
 }