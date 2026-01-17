import { useState, useRef, DragEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ImagePlus, X, Loader2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ImageUploadProps {
  imageUrls: string[];
  onImagesChange: (urls: string[]) => void;
  className?: string;
}

const MAX_IMAGES = 15;
const GRID_SLOTS = 8;

const photoSlots = [
  { label: 'Add a photo', isUploader: true },
  { label: 'Cover photo' },
  { label: 'Front' },
  { label: 'Back' },
  { label: 'Side' },
  { label: 'Label' },
  { label: 'Detail' },
  { label: 'Flaw' },
];

interface SortableImageSlotProps {
  id: string;
  url: string;
  index: number;
  label: string;
  onRemove: (index: number, e: React.MouseEvent) => void;
  onImageDragStart: (e: React.DragEvent<HTMLImageElement>, url: string) => void;
}

function SortableImageSlot({ 
  id, 
  url, 
  index, 
  label, 
  onRemove,
  onImageDragStart 
}: SortableImageSlotProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "aspect-square border-2 rounded-md relative overflow-hidden group",
        isDragging ? "border-primary ring-2 ring-primary/30" : "border-transparent"
      )}
    >
      <img 
        src={url} 
        alt={label} 
        className="w-full h-full object-cover rounded-md"
        draggable
        onDragStart={(e) => onImageDragStart(e, url)}
      />
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 p-1 bg-background/80 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-3 w-3 text-foreground" />
      </div>
      {/* Remove button */}
      <button
        type="button"
        onClick={(e) => onRemove(index, e)}
        className="absolute top-1 right-1 p-1 bg-destructive/80 rounded opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="h-3 w-3 text-destructive-foreground" />
      </button>
      {/* Cover label for first slot */}
      {index === 0 && (
        <span className="absolute bottom-0 left-0 right-0 bg-background/80 text-[10px] text-center py-0.5 font-medium">
          Cover
        </span>
      )}
    </div>
  );
}

interface SortableOverflowImageProps {
  id: string;
  url: string;
  index: number;
  onRemove: (index: number, e: React.MouseEvent) => void;
  onImageDragStart: (e: React.DragEvent<HTMLImageElement>, url: string) => void;
}

function SortableOverflowImage({ 
  id, 
  url, 
  index, 
  onRemove,
  onImageDragStart 
}: SortableOverflowImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative flex-shrink-0 group",
        isDragging && "ring-2 ring-primary/30 rounded-md"
      )}
    >
      <img 
        src={url} 
        alt={`Photo ${index + 1}`}
        className="w-12 h-12 object-cover rounded-md"
        draggable
        onDragStart={(e) => onImageDragStart(e, url)}
      />
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-0.5 left-0.5 p-0.5 bg-background/80 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-2 w-2 text-foreground" />
      </div>
      <button
        type="button"
        onClick={(e) => onRemove(index, e)}
        className="absolute top-0.5 right-0.5 p-0.5 bg-destructive/80 rounded opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="h-2 w-2 text-destructive-foreground" />
      </button>
    </div>
  );
}

export function ImageUpload({ imageUrls, onImagesChange, className }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const uploadFiles = async (files: FileList) => {
    const validFiles: File[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 5MB`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Limit to remaining slots
    const remainingSlots = MAX_IMAGES - imageUrls.length;
    const filesToUpload = validFiles.slice(0, remainingSlots);

    if (filesToUpload.length < validFiles.length) {
      toast.warning(`Only ${filesToUpload.length} of ${validFiles.length} images uploaded (max ${MAX_IMAGES})`);
    }

    setIsUploading(true);
    const newUrls: string[] = [];

    try {
      for (const file of filesToUpload) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `items/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('inventory-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('inventory-images')
          .getPublicUrl(filePath);

        newUrls.push(publicUrl);
      }

      onImagesChange([...imageUrls, ...newUrls]);
      toast.success(`${newUrls.length} image${newUrls.length > 1 ? 's' : ''} uploaded`);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image(s)');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await uploadFiles(files);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await uploadFiles(files);
    }
  };

  const handleRemoveImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newUrls = imageUrls.filter((_, i) => i !== index);
    onImagesChange(newUrls);
  };

  const handleSlotClick = (index: number) => {
    // If slot is empty or is the uploader slot, trigger file input
    if (!imageUrls[index] || index === 0) {
      fileInputRef.current?.click();
    }
  };

  // Enable dragging images out to desktop/other apps
  const handleImageDragStart = (e: React.DragEvent<HTMLImageElement>, url: string) => {
    e.stopPropagation();
    e.dataTransfer.setData('text/uri-list', url);
    e.dataTransfer.setData('text/plain', url);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDndDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (over && active.id !== over.id) {
      const oldIndex = imageUrls.findIndex((_, i) => `image-${i}` === active.id);
      const newIndex = imageUrls.findIndex((_, i) => `image-${i}` === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(imageUrls, oldIndex, newIndex);
        onImagesChange(newOrder);
      }
    }
  };

  const activeUrl = activeId ? imageUrls[parseInt(activeId.replace('image-', ''))] : null;
  const allImageIds = imageUrls.map((_, i) => `image-${i}`);

  return (
    <div 
      className={cn("relative", className)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Photos</p>
          <p className="text-xs text-muted-foreground">{imageUrls.length}/{MAX_IMAGES}</p>
        </div>
        
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDndDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={allImageIds} strategy={rectSortingStrategy}>
            <div className={cn(
              "grid grid-cols-4 gap-2 p-2 rounded-lg transition-colors",
              isDragging && "bg-primary/5 ring-2 ring-primary/20"
            )}>
              {photoSlots.map((slot, index) => {
                const image = imageUrls[index];
                const isEmpty = !image;
                const isDisabled = isUploading && isEmpty;
                
                if (image) {
                  return (
                    <SortableImageSlot
                      key={`image-${index}`}
                      id={`image-${index}`}
                      url={image}
                      index={index}
                      label={slot.label}
                      onRemove={handleRemoveImage}
                      onImageDragStart={handleImageDragStart}
                    />
                  );
                }
                
                return (
                  <button
                    key={index}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => isEmpty && handleSlotClick(index)}
                    className={cn(
                      "aspect-square border-2 border-dashed rounded-md flex flex-col items-center justify-center gap-1 transition-all relative overflow-hidden group",
                      isEmpty 
                        ? "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30" 
                        : "border-transparent",
                      isDisabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isUploading && index === imageUrls.length ? (
                      <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                    ) : slot.isUploader ? (
                      <ImagePlus className={cn(
                        "h-5 w-5",
                        isDragging ? "text-primary" : "text-muted-foreground"
                      )} />
                    ) : null}
                    <span className={cn(
                      "text-[10px] text-center px-1 leading-tight",
                      isDragging && slot.isUploader ? "text-primary" : "text-muted-foreground"
                    )}>
                      {slot.label}
                    </span>
                  </button>
                );
              })}
            </div>
            
            {imageUrls.length > GRID_SLOTS && (
              <div className="mt-2 pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">
                  Additional photos ({imageUrls.length - GRID_SLOTS})
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {imageUrls.slice(GRID_SLOTS).map((url, idx) => (
                    <SortableOverflowImage
                      key={`image-${idx + GRID_SLOTS}`}
                      id={`image-${idx + GRID_SLOTS}`}
                      url={url}
                      index={idx + GRID_SLOTS}
                      onRemove={handleRemoveImage}
                      onImageDragStart={handleImageDragStart}
                    />
                  ))}
                </div>
              </div>
            )}
          </SortableContext>
          
          <DragOverlay>
            {activeUrl && (
              <div className="w-16 h-16 rounded-md overflow-hidden shadow-lg ring-2 ring-primary">
                <img 
                  src={activeUrl} 
                  alt="Dragging" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
        
        <p className="text-xs text-muted-foreground text-center">
          Click or drag & drop images • Drag grip to reorder
        </p>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
