import { useState } from 'react';
import { PublicInventoryItem } from '@/hooks/usePublicInventory';
import { useShopCartStore } from '@/stores/shopCartStore';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface StorefrontProductDetailProps {
  item: PublicInventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StorefrontProductDetail({ item, open, onOpenChange }: StorefrontProductDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const addItem = useShopCartStore(state => state.addItem);
  const isLoading = useShopCartStore(state => state.isLoading);

  if (!item) return null;

  const images = item.imageUrls?.length > 0 ? item.imageUrls : (item.imageUrl ? [item.imageUrl] : []);
  const price = item.askingPrice;

  const handleAddToCart = () => {
    if (!price) return;
    addItem(item);
    setJustAdded(true);
    toast.success('Added to cart', {
      description: item.name,
      position: 'top-center'
    });
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
      <DialogContent className="max-w-4xl p-0 gap-0">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Gallery */}
          <div className="relative bg-muted/20">
            {images.length > 0 ? (
              <>
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={images[currentImageIndex]}
                    alt={item.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                
                {images.length > 1 && (
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
                    
                    {/* Thumbnails */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`w-12 h-12 rounded-md overflow-hidden border-2 transition-all ${
                            idx === currentImageIndex ? 'border-primary' : 'border-transparent opacity-70'
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="aspect-square flex items-center justify-center text-muted-foreground">
                No image available
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-6 flex flex-col">
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide">
                  {item.brand || 'Unknown Brand'}
                </p>
                <h2 className="text-2xl font-semibold mt-1">{item.name}</h2>
              </div>

              <p className="text-3xl font-bold">
                {price ? `$${price.toFixed(2)}` : 'Price TBD'}
              </p>

              <div className="flex gap-2 flex-wrap">
                {item.size && (
                  <Badge variant="secondary">Size: {item.size}</Badge>
                )}
                {item.brandCategory && (
                  <Badge variant="outline">{item.brandCategory}</Badge>
                )}
              </div>
            </div>

            <Button
              size="lg"
              className="w-full mt-6"
              onClick={handleAddToCart}
              disabled={!price || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : justAdded ? (
                <Check className="h-5 w-5 mr-2" />
              ) : (
                <ShoppingCart className="h-5 w-5 mr-2" />
              )}
              {justAdded ? 'Added!' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
