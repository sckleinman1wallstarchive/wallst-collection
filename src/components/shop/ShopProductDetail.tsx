import { useState } from 'react';
import { PublicInventoryItem } from '@/hooks/usePublicInventory';
import { useShopCartStore } from '@/stores/shopCartStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, ShoppingCart, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ShopProductDetailProps {
  item: PublicInventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShopProductDetail({ item, open, onOpenChange }: ShopProductDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const addItem = useShopCartStore(state => state.addItem);

  if (!item) return null;

  const images = item.imageUrls.length > 0 ? item.imageUrls : (item.imageUrl ? [item.imageUrl] : []);
  const hasMultipleImages = images.length > 1;

  const handleAddToCart = () => {
    addItem(item);
    setJustAdded(true);
    toast.success('Added to cart');
    setTimeout(() => setJustAdded(false), 2000);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">{item.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary/20">
              {images.length > 0 ? (
                <>
                  <img
                    src={images[currentImageIndex]}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  {hasMultipleImages && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No image available
                </div>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {hasMultipleImages && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                      idx === currentImageIndex ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            {item.brand && (
              <p className="text-sm text-muted-foreground uppercase tracking-wide">{item.brand}</p>
            )}
            <h2 className="text-2xl font-bold">{item.name}</h2>
            
            <div className="flex items-center gap-3">
              {item.askingPrice ? (
                <span className="text-3xl font-bold">${item.askingPrice.toFixed(2)}</span>
              ) : (
                <span className="text-lg text-muted-foreground">Price TBD</span>
              )}
              {item.size && (
                <Badge variant="secondary" className="text-sm">Size: {item.size}</Badge>
              )}
            </div>

            {item.brandCategory && (
              <Badge variant="outline">{item.brandCategory}</Badge>
            )}

            <Button 
              onClick={handleAddToCart} 
              className="w-full" 
              size="lg"
              disabled={!item.askingPrice}
            >
              {justAdded ? (
                <>
                  <Check className="mr-2 h-5 w-5" />
                  Added!
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </>
              )}
            </Button>

            {!item.askingPrice && (
              <p className="text-sm text-muted-foreground text-center">
                Contact us for pricing
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
