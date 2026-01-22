import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Pencil } from 'lucide-react';

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

  // Use art image as base, featured image as fallback
  const displayImage = artImageUrl || featuredImageUrl;

  return (
    <div
      className="relative cursor-pointer overflow-hidden rounded-lg group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Base Image */}
      <div className="relative">
        {displayImage ? (
          <img
            src={displayImage}
            alt={brandName}
            className="w-full h-auto object-cover"
          />
        ) : (
          <div className="aspect-square bg-secondary/20 flex items-center justify-center text-muted-foreground">
            No image
          </div>
        )}

        {/* Red Text Overlay - visible by default, hidden on hover */}
        <div
          className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-300 ${
            isHovered ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div className="text-center px-4">
            <h3 className="text-xl md:text-2xl font-serif text-red-600 tracking-wider">
              {itemName || brandName}
            </h3>
          </div>
        </div>
      </div>

      {/* Edit Mode Controls */}
      {isEditMode && (
        <Button
          size="sm"
          variant="secondary"
          className="absolute top-2 right-2 gap-1 z-10"
          onClick={(e) => {
            e.stopPropagation();
            onArtUpload();
          }}
        >
          {artImageUrl ? <Pencil className="h-3 w-3" /> : <Upload className="h-3 w-3" />}
          {artImageUrl ? 'Edit' : 'Upload'}
        </Button>
      )}
    </div>
  );
}
