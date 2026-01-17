import { ShopifyProduct } from '@/lib/shopify';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';

interface ProductCardProps {
  product: ShopifyProduct;
  onClick?: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const addItem = useCartStore(state => state.addItem);
  const isLoading = useCartStore(state => state.isLoading);
  
  const { node } = product;
  const firstImage = node.images.edges[0]?.node;
  const firstVariant = node.variants.edges[0]?.node;
  const price = node.priceRange.minVariantPrice;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!firstVariant) return;
    
    await addItem({
      product,
      variantId: firstVariant.id,
      variantTitle: firstVariant.title,
      price: firstVariant.price,
      quantity: 1,
      selectedOptions: firstVariant.selectedOptions || []
    });
    
    toast.success('Added to cart', {
      description: node.title,
      position: 'top-center'
    });
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer transition-all hover:shadow-lg group"
      onClick={onClick}
    >
      <div className="aspect-square bg-secondary/20 relative overflow-hidden">
        {firstImage ? (
          <img 
            src={firstImage.url} 
            alt={firstImage.altText || node.title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
      </div>
      <CardContent className="p-4 space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">
          {node.options.find(o => o.name.toLowerCase() === 'brand')?.values[0] || 'Unknown Brand'}
        </p>
        <h3 className="font-medium line-clamp-2">{node.title}</h3>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">
            {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
          </span>
          <Button 
            size="sm" 
            onClick={handleAddToCart}
            disabled={isLoading || !firstVariant?.availableForSale}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShoppingCart className="h-4 w-4" />
            )}
          </Button>
        </div>
        {firstVariant && !firstVariant.availableForSale && (
          <p className="text-xs text-destructive">Sold Out</p>
        )}
      </CardContent>
    </Card>
  );
}
