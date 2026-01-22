import { useState } from 'react';
import { GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublicInventoryItem } from '@/hooks/usePublicInventory';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type SizePreset = 'auto' | 'portrait' | 'square' | 'wide' | 'tall';

interface PersonalCollectionCardProps {
  item: PublicInventoryItem;
  isEditMode?: boolean;
  sizePreset?: SizePreset;
  onSizeChange?: (size: SizePreset) => void;
  onClick?: () => void;
}

const SIZE_PRESETS: { value: SizePreset; label: string; aspect?: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'portrait', label: 'Portrait', aspect: '3/4' },
  { value: 'square', label: 'Square', aspect: '1/1' },
  { value: 'wide', label: 'Wide', aspect: '4/3' },
  { value: 'tall', label: 'Tall', aspect: '2/3' },
];

export function PersonalCollectionCard({ 
  item, 
  isEditMode = false,
  sizePreset = 'auto',
  onSizeChange,
  onClick 
}: PersonalCollectionCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const firstImage = item.imageUrls?.[0] || item.imageUrl;

  const currentPreset = SIZE_PRESETS.find(p => p.value === sizePreset) || SIZE_PRESETS[0];
  const aspectStyle = currentPreset.aspect ? { aspectRatio: currentPreset.aspect } : {};

  return (
    <div 
      className="relative cursor-pointer overflow-hidden rounded-lg group break-inside-avoid"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Base Image - art style, no text overlays */}
      <div className="relative" style={aspectStyle}>
        {firstImage ? (
          <img 
            src={firstImage} 
            alt={item.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            style={currentPreset.aspect ? {} : { height: 'auto' }}
          />
        ) : (
          <div className="aspect-square bg-secondary/20 flex items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
      </div>

      {/* Edit Mode Controls */}
      {isEditMode && (
        <>
          {/* Grip Handle */}
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

          {/* Size Preset Control */}
          {onSizeChange && (
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
        </>
      )}
    </div>
  );
}
