import { PublicInventoryItem } from '@/hooks/usePublicInventory';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useShopCartStore } from '@/stores/shopCartStore';
import { toast } from 'sonner';

interface StorefrontProductCardProps {
  item: PublicInventoryItem;
  onClick?: () => void;
}

export function StorefrontProductCard({ item, onClick }: StorefrontProductCardProps) {
  const addItem = useShopCartStore(state => state.addItem);
  
  const firstImage = item.imageUrls?.[0] || item.imageUrl;
  const price = item.askingPrice;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!price) return;
    
    addItem(item);
    toast.success('Added to cart', {
      description: item.name,
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
            src={firstImage} 
            alt={item.name}
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
          {item.brand || 'Unknown Brand'}
        </p>
        <h3 className="font-medium line-clamp-2">{item.name}</h3>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">
            {price ? `$${price.toFixed(2)}` : 'Price TBD'}
          </span>
          <Button 
            size="sm" 
            onClick={handleAddToCart}
            disabled={!price}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
