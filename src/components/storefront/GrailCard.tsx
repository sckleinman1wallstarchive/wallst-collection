import { useState } from 'react';
import { Plus, Upload, Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublicInventoryItem } from '@/hooks/usePublicInventory';

interface GrailCardProps {
  item: PublicInventoryItem | null;
  artImageUrl: string | null;
  position: number;
  size: 'small' | 'medium' | 'large';
  isEditMode: boolean;
  onSelect: () => void;
  onArtUpload: () => void;
  onRemove: () => void;
  onClick: () => void;
}

export function GrailCard({
  item,
  artImageUrl,
  position,
  size,
  isEditMode,
  onSelect,
  onArtUpload,
  onRemove,
  onClick,
}: GrailCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const imageUrl = item?.imageUrls?.[0] || item?.imageUrl;

  // Empty slot - only show in edit mode
  if (!item) {
    if (!isEditMode) return null;
    
    return (
      <div
        className="relative aspect-[3/4] border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer hover:border-muted-foreground/60 transition-colors bg-black/20"
        onClick={onSelect}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Plus className="h-8 w-8" />
          <span className="text-sm">Add Grail</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative cursor-pointer overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Base Image */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={item.name}
          className={`w-full h-auto object-cover transition-all duration-500 ${
            isHovered && artImageUrl ? 'opacity-0' : 'opacity-100'
          }`}
        />
      ) : (
        <div className="aspect-[3/4] bg-muted flex items-center justify-center">
          <span className="text-muted-foreground text-sm">No image</span>
        </div>
      )}

      {/* Hover Art Layer (B&W) */}
      {artImageUrl && (
        <img
          src={artImageUrl}
          alt={`${item.name} art`}
          className={`absolute inset-0 w-full h-full object-cover grayscale transition-all duration-500 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Item Name on Hover - Centered */}
      <div
        className={`absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <h3 
          className="text-lg md:text-xl font-serif tracking-wide text-center px-4"
          style={{ color: 'hsl(0, 70%, 50%)' }}
        >
          {item.name}
        </h3>
      </div>

      {/* Edit Mode Controls */}
      {isEditMode && (
        <div className="absolute top-2 right-2 z-10 flex gap-1">
          <Button
            size="sm"
            variant="secondary"
            className="h-7 w-7 p-0 opacity-80 hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onArtUpload();
            }}
          >
            {artImageUrl ? <Pencil className="h-3 w-3" /> : <Upload className="h-3 w-3" />}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="h-7 w-7 p-0 opacity-80 hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
