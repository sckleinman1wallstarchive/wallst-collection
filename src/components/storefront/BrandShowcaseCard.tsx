import { useState } from 'react';
import { Upload, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BrandShowcaseCardProps {
  brandName: string;
  itemName?: string;
  featuredImageUrl: string | null;
  artImageUrl: string | null;
  isEditMode: boolean;
  onArtUpload: () => void;
  onClick: () => void;
}

export function BrandShowcaseCard({
  brandName,
  itemName,
  featuredImageUrl,
  artImageUrl,
  isEditMode,
  onArtUpload,
  onClick,
}: BrandShowcaseCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative cursor-pointer overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Base Layer - Featured Inventory Image */}
      {featuredImageUrl ? (
        <img
          src={featuredImageUrl}
          alt={brandName}
          className={`w-full h-auto object-cover transition-all duration-500 ${
            isHovered && artImageUrl ? 'opacity-0' : 'opacity-100'
          }`}
        />
      ) : (
        <div className="aspect-[3/4] bg-muted flex items-center justify-center">
          <span className="text-muted-foreground text-sm">No image</span>
        </div>
      )}

      {/* Hover Layer - Art Image (B&W) */}
      {artImageUrl && (
        <img
          src={artImageUrl}
          alt={`${brandName} art`}
          className={`absolute inset-0 w-full h-full object-cover grayscale transition-all duration-500 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Text Overlay - Centered - Shows item name/description on hover */}
      <div
        className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <h3 
          className="text-xl md:text-2xl font-serif tracking-wider text-center px-4 leading-relaxed"
          style={{ color: 'hsl(0, 70%, 50%)' }}
        >
          {itemName || brandName}
        </h3>
      </div>

      {/* Edit Mode Upload Button */}
      {isEditMode && (
        <div className="absolute top-2 right-2 z-10">
          <Button
            size="sm"
            variant="secondary"
            className="gap-1 opacity-80 hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onArtUpload();
            }}
          >
            {artImageUrl ? <Pencil className="h-3 w-3" /> : <Upload className="h-3 w-3" />}
            {artImageUrl ? 'Edit Art' : 'Add Art'}
          </Button>
        </div>
      )}

      {/* Subtle border */}
      <div className="absolute inset-0 border border-border/20 pointer-events-none" />
    </div>
  );
}
