import { useState } from 'react';
import { Plus, X, Upload, Pencil } from 'lucide-react';
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

  // If no item and not in edit mode, don't render anything
  if (!item && !isEditMode) {
    return null;
  }

  // Empty slot in edit mode - show add button
  if (!item) {
    return (
      <div
        className="border-2 border-dashed border-white/30 rounded-lg flex items-center justify-center cursor-pointer hover:border-white/50 transition-colors bg-white/5"
        style={{ minHeight: '200px' }}
        onClick={onSelect}
      >
        <div className="text-center text-white/50">
          <Plus className="h-8 w-8 mx-auto mb-2" />
          <span className="text-sm">Add Grail</span>
        </div>
      </div>
    );
  }

  const imageUrl = item.imageUrls?.[0] || item.imageUrl;

  return (
    <div
      className="relative cursor-pointer group overflow-hidden rounded-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Base Image - natural aspect ratio for staggered look */}
      <div className="relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            className={`w-full h-auto object-cover transition-opacity duration-300 ${
              artImageUrl && isHovered ? 'opacity-0' : 'opacity-100'
            }`}
          />
        ) : (
          <div className="aspect-[3/4] flex items-center justify-center text-muted-foreground bg-secondary/20">
            No image
          </div>
        )}

        {/* Art Overlay - appears on hover, no text, just the art */}
        {artImageUrl && (
          <img
            src={artImageUrl}
            alt="Art"
            className={`absolute inset-0 w-full h-full object-cover grayscale transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}
      </div>

      {/* Edit Mode Controls */}
      {isEditMode && (
        <div className="absolute top-2 right-2 flex gap-1 z-10">
          <Button
            size="icon"
            variant="secondary"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              onArtUpload();
            }}
          >
            {artImageUrl ? <Pencil className="h-3 w-3" /> : <Upload className="h-3 w-3" />}
          </Button>
          <Button
            size="icon"
            variant="destructive"
            className="h-7 w-7"
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
