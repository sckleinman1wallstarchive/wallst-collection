import { useState } from 'react';
import { Plus, X, Upload, Pencil, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublicInventoryItem } from '@/hooks/usePublicInventory';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type SizePreset = 'auto' | 'portrait' | 'square' | 'wide' | 'tall';

interface GrailCardProps {
  item: PublicInventoryItem | null;
  artImageUrl: string | null;
  position: number;
  size: 'small' | 'medium' | 'large';
  sizePreset?: SizePreset;
  isEditMode: boolean;
  onSelect: () => void;
  onArtUpload: () => void;
  onRemove: () => void;
  onSizeChange?: (size: SizePreset) => void;
  onClick: () => void;
}

const SIZE_PRESETS: { value: SizePreset; label: string; aspect?: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'portrait', label: 'Portrait', aspect: '3/4' },
  { value: 'square', label: 'Square', aspect: '1/1' },
  { value: 'wide', label: 'Wide', aspect: '4/3' },
  { value: 'tall', label: 'Tall', aspect: '2/3' },
];

export function GrailCard({
  item,
  artImageUrl,
  position,
  size,
  sizePreset = 'auto',
  isEditMode,
  onSelect,
  onArtUpload,
  onRemove,
  onSizeChange,
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
  const currentPreset = SIZE_PRESETS.find(p => p.value === sizePreset) || SIZE_PRESETS[0];
  const aspectStyle = currentPreset.aspect ? { aspectRatio: currentPreset.aspect } : {};

  return (
    <div
      className="relative cursor-pointer group overflow-hidden rounded-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Base Image - with aspect ratio control */}
      <div className="relative" style={aspectStyle}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            className={`w-full object-cover transition-opacity duration-300 ${
              artImageUrl && isHovered ? 'opacity-0' : 'opacity-100'
            }`}
            style={currentPreset.aspect ? { height: '100%' } : { height: 'auto' }}
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
        <>
          {/* Grip Handle - top left */}
          <div className="absolute top-2 left-2 z-10">
            <Button
              size="icon"
              variant="secondary"
              className="h-7 w-7 cursor-grab"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-4 w-4" />
            </Button>
          </div>

          {/* Art Upload & Remove - top right */}
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
        </>
      )}

      {/* Size Preset Control - bottom right corner in edit mode */}
      {isEditMode && onSizeChange && (
        <div className="absolute bottom-2 right-2 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="secondary"
                className="text-xs h-7 px-2"
                onClick={(e) => e.stopPropagation()}
              >
                {currentPreset.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {SIZE_PRESETS.map((preset) => (
                <DropdownMenuItem
                  key={preset.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSizeChange(preset.value);
                  }}
                  className={sizePreset === preset.value ? 'bg-accent' : ''}
                >
                  {preset.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
