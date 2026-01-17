import { useState } from 'react';
import { ShopifyProduct } from '@/lib/shopify';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';

interface ProductDetailDialogProps {
  product: ShopifyProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailDialog({ product, open, onOpenChange }: ProductDetailDialogProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const addItem = useCartStore(state => state.addItem);
  const isLoading = useCartStore(state => state.isLoading);

  if (!product) return null;

  const { node } = product;
  const images = node.images.edges;
  const variants = node.variants.edges;
  
  const selectedVariant = variants.find(v => v.node.id === selectedVariantId)?.node || variants[0]?.node;

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    
    await addItem({
      product,
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: 1,
      selectedOptions: selectedVariant.selectedOptions || []
    });
    
    toast.success('Added to cart', {
      description: node.title,
      position: 'top-center'
    });
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[85vw] max-h-[90vh] overflow-y-auto p-8">
        <DialogHeader>
          <DialogTitle>{node.title}</DialogTitle>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-secondary/20 rounded-lg relative overflow-hidden">
              {images.length > 0 ? (
                <>
                  <img 
                    src={images[currentImageIndex]?.node.url} 
                    alt={images[currentImageIndex]?.node.altText || node.title}
                    className="w-full h-full object-cover"
                  />
                  {images.length > 1 && (
                    <>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border-2 transition-colors ${
                      idx === currentImageIndex ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img 
                      src={img.node.url} 
                      alt={img.node.altText || `Image ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div className="space-y-4">
            <div>
              <span className="text-2xl font-bold">
                {selectedVariant?.price.currencyCode} {parseFloat(selectedVariant?.price.amount || '0').toFixed(2)}
              </span>
            </div>
            
            {variants.length > 1 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Variant</label>
                <Select 
                  value={selectedVariantId || variants[0]?.node.id} 
                  onValueChange={setSelectedVariantId}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {variants.map(({ node: variant }) => (
                      <SelectItem key={variant.id} value={variant.id}>
                        {variant.title} - {variant.price.currencyCode} {parseFloat(variant.price.amount).toFixed(2)}
                        {!variant.availableForSale && ' (Sold Out)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {node.description && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <p className="text-sm text-muted-foreground">{node.description}</p>
              </div>
            )}
            
            {selectedVariant && !selectedVariant.availableForSale ? (
              <Badge variant="destructive">Sold Out</Badge>
            ) : (
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleAddToCart}
                disabled={isLoading || !selectedVariant?.availableForSale}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ShoppingCart className="h-4 w-4 mr-2" />
                )}
                Add to Cart
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
