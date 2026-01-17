import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface InventoryItem {
  id: string;
  name: string;
  brand: string | null;
  category: string;
  size: string | null;
  imageUrls: string[];
  acquisitionCost: number;
  status: string;
}

interface PersonalCollectionCardProps {
  item: InventoryItem;
}

export function PersonalCollectionCard({ item }: PersonalCollectionCardProps) {
  const firstImage = item.imageUrls?.[0];

  return (
    <Card className="overflow-hidden">
      <div className="aspect-square bg-secondary/20 relative overflow-hidden">
        {firstImage ? (
          <img 
            src={firstImage} 
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
        <Badge 
          variant="secondary" 
          className="absolute top-2 right-2"
        >
          Not For Sale
        </Badge>
      </div>
      <CardContent className="p-4 space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">
          {item.brand || 'Unknown Brand'}
        </p>
        <h3 className="font-medium line-clamp-2">{item.name}</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {item.size && <span>Size: {item.size}</span>}
          <span className="capitalize">{item.category}</span>
        </div>
      </CardContent>
    </Card>
  );
}
