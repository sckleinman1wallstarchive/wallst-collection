import { PublicInventoryItem } from '@/hooks/usePublicInventory';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ShopProductCardProps {
  item: PublicInventoryItem;
  onClick: () => void;
}

export function ShopProductCard({ item, onClick }: ShopProductCardProps) {
  const imageUrl = item.imageUrl || item.imageUrls[0];
  const price = item.askingPrice;

  return (
    <Card 
      className="overflow-hidden cursor-pointer group transition-all hover:shadow-lg"
      onClick={onClick}
    >
      <div className="aspect-square overflow-hidden bg-secondary/20">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
      </div>
      <CardContent className="p-3 space-y-1">
        {item.brand && (
          <p className="text-xs text-muted-foreground uppercase tracking-wide">{item.brand}</p>
        )}
        <h3 className="font-medium text-sm line-clamp-2">{item.name}</h3>
        <div className="flex items-center justify-between gap-2">
          {price ? (
            <span className="font-semibold">${price.toFixed(2)}</span>
          ) : (
            <span className="text-muted-foreground text-sm">Price TBD</span>
          )}
          {item.size && (
            <Badge variant="secondary" className="text-xs">{item.size}</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
