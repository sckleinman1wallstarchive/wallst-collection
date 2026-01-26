import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRecentInventory } from '@/hooks/useRecentInventory';
import { PublicInventoryItem } from '@/hooks/usePublicInventory';

interface NewArrivalsSectionProps {
  onViewAll: () => void;
  onItemClick: (item: PublicInventoryItem) => void;
}

export function NewArrivalsSection({ onViewAll, onItemClick }: NewArrivalsSectionProps) {
  const { data: items, isLoading } = useRecentInventory(12);

  if (isLoading) {
    return (
      <section className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-light tracking-wide text-white mb-8 text-center">
            New Arrivals
          </h2>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-white/50" />
          </div>
        </div>
      </section>
    );
  }

  if (!items || items.length === 0) {
    return null;
  }

  // Split into visible (first 8) and grayed (last 4)
  const visibleItems = items.slice(0, 8);
  const grayedItems = items.slice(8, 12);

  return (
    <section className="py-16 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-light tracking-wide text-white mb-8 text-center">
          New Arrivals
        </h2>

        {/* Grid Container */}
        <div className="relative">
          {/* First 8 items - fully visible */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {visibleItems.map((item) => (
              <NewArrivalCard 
                key={item.id} 
                item={item} 
                onClick={() => onItemClick(item)} 
              />
            ))}
          </div>

          {/* Last 4 items - grayed with overlay */}
          {grayedItems.length > 0 && (
            <div className="relative">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {grayedItems.map((item) => (
                  <NewArrivalCard 
                    key={item.id} 
                    item={item} 
                    onClick={() => onItemClick(item)}
                    grayed 
                  />
                ))}
              </div>

              {/* Overlay with View All button */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent flex items-center justify-center">
                <Button
                  onClick={onViewAll}
                  className="bg-white hover:bg-white/90 text-black uppercase tracking-[0.15em] px-10 py-6 text-sm font-medium"
                >
                  View All
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

interface NewArrivalCardProps {
  item: PublicInventoryItem;
  onClick: () => void;
  grayed?: boolean;
}

function NewArrivalCard({ item, onClick, grayed }: NewArrivalCardProps) {
  const imageUrl = item.imageUrls?.[0] || item.imageUrl;
  const price = item.askingPrice;

  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer ${grayed ? 'opacity-60' : ''}`}
    >
      <div className="aspect-square overflow-hidden bg-white/5 rounded-sm mb-2">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/30">
            No image
          </div>
        )}
      </div>
      <p className="text-xs text-white/50 uppercase tracking-wide truncate">
        {item.brand || 'Unknown'}
      </p>
      <h3 className="text-sm text-white font-medium truncate">{item.name}</h3>
      <p className="text-sm text-white/80">
        {price ? `$${price.toFixed(0)}` : 'Price TBD'}
      </p>
    </div>
  );
}
