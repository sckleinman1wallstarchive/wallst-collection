import { useState, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PublicInventoryItem } from '@/hooks/usePublicInventory';
import { Button } from '@/components/ui/button';
import { GripVertical, Upload, Pencil } from 'lucide-react';
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
  artImageUrl?: string | null;
  onSizeChange?: (size: SizePreset) => void;
  onArtUpload?: (file: File) => void;
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
  artImageUrl,
  onSizeChange,
  onArtUpload,
  onClick
}: PersonalCollectionCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: !isEditMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Display art image if available, otherwise use item's primary image
  const displayImage = artImageUrl || item.imageUrls?.[0] || item.imageUrl;

  const currentPreset = SIZE_PRESETS.find(p => p.value === sizePreset) || SIZE_PRESETS[0];
  const aspectStyle = currentPreset.aspect ? { aspectRatio: currentPreset.aspect } : {};

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onArtUpload) {
      onArtUpload(file);
    }
    e.target.value = '';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative cursor-pointer overflow-hidden rounded-lg group break-inside-avoid mb-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />

      {/* Image Container */}
      <div className="relative" style={aspectStyle}>
        {displayImage ? (
          <img
            src={displayImage}
            alt={item.name}
            className="w-full h-full object-cover"
            style={currentPreset.aspect ? {} : { height: 'auto' }}
          />
        ) : (
          <div className="aspect-square bg-secondary/20 flex items-center justify-center text-muted-foreground">
            No image
          </div>
        )}

        {/* Hover Overlay - Wine red box with brand name (only for non-edit mode) */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
            isHovered && !isEditMode ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="bg-[#722F37]/90 px-6 py-3 rounded">
            <span className="text-white font-serif text-lg tracking-wide">
              {item.brand || item.name}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Mode Controls */}
      {isEditMode && (
        <>
          {/* Grip Handle - top left with drag listeners */}
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

          {/* Art Upload Button - top right */}
          {onArtUpload && (
            <div className="absolute top-2 right-2 z-10">
              <Button
                size="sm"
                variant="secondary"
                className="gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                {artImageUrl ? <Pencil className="h-3 w-3" /> : <Upload className="h-3 w-3" />}
                {artImageUrl ? 'Edit' : 'Upload'}
              </Button>
            </div>
          )}

          {/* Size Preset Control - bottom right corner */}
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
