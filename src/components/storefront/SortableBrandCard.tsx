import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Upload, Pencil, GripVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type SizePreset = 'auto' | 'portrait' | 'square' | 'wide' | 'tall';

interface SortableBrandCardProps {
  id: string;
  brandName: string;
  featuredImageUrl: string | null;
  artImageUrl: string | null;
  isEditMode: boolean;
  sizePreset?: SizePreset;
  onArtUpload: () => void;
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

export function SortableBrandCard({
  id,
  brandName,
  featuredImageUrl,
  artImageUrl,
  isEditMode,
  sizePreset = 'auto',
  onArtUpload,
  onSizeChange,
  onClick,
}: SortableBrandCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !isEditMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const displayImage = artImageUrl || featuredImageUrl;
  const currentPreset = SIZE_PRESETS.find(p => p.value === sizePreset) || SIZE_PRESETS[0];
  const aspectStyle = currentPreset.aspect ? { aspectRatio: currentPreset.aspect } : {};

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative cursor-pointer overflow-hidden rounded-lg group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Base Image */}
      <div className="relative" style={aspectStyle}>
        {displayImage ? (
          <img
            src={displayImage}
            alt={brandName}
            className="w-full h-full object-cover"
            style={currentPreset.aspect ? {} : { height: 'auto' }}
          />
        ) : (
          <div className="aspect-square bg-secondary/20 flex items-center justify-center text-muted-foreground">
            No image
          </div>
        )}

        {/* Red Text Overlay - visible by default, hidden on hover */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
            isHovered ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div className="text-center px-4">
            <h3 className="text-xl md:text-2xl font-serif text-red-600 tracking-wider drop-shadow-lg">
              {brandName}
            </h3>
          </div>
        </div>
      </div>

      {/* Edit Mode Controls */}
      {isEditMode && (
        <>
          {/* Grip Handle - top left - with drag listeners */}
          <div 
            className="absolute top-2 left-2 z-10"
            {...attributes}
            {...listeners}
          >
            <Button
              size="icon"
              variant="secondary"
              className="h-7 w-7 cursor-grab active:cursor-grabbing"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-4 w-4" />
            </Button>
          </div>

          {/* Upload Button - top right */}
          <div className="absolute top-2 right-2 flex gap-1 z-10">
            <Button
              size="sm"
              variant="secondary"
              className="gap-1"
              onClick={(e) => {
                e.stopPropagation();
                onArtUpload();
              }}
            >
              {artImageUrl ? <Pencil className="h-3 w-3" /> : <Upload className="h-3 w-3" />}
              {artImageUrl ? 'Edit' : 'Upload'}
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
