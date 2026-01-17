import { useState, useRef, DragEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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

export function ImageUpload({ imageUrls, onImagesChange, className }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    e.stopPropagation(); // Prevent triggering the container's drag events
    e.dataTransfer.setData('text/uri-list', url);
    e.dataTransfer.setData('text/plain', url);
    e.dataTransfer.effectAllowed = 'copy';
  };

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
        
        <div className={cn(
          "grid grid-cols-4 gap-2 p-2 rounded-lg transition-colors",
          isDragging && "bg-primary/5 ring-2 ring-primary/20"
        )}>
          {photoSlots.map((slot, index) => {
            const image = imageUrls[index];
            const isEmpty = !image;
            const isDisabled = isUploading && isEmpty;
            
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
                {image ? (
                  <>
                    <img 
                      src={image} 
                      alt={slot.label} 
                      className="w-full h-full object-cover rounded-md cursor-grab active:cursor-grabbing"
                      draggable
                      onDragStart={(e) => handleImageDragStart(e, image)}
                    />
                    <button
                      type="button"
                      onClick={(e) => handleRemoveImage(index, e)}
                      className="absolute inset-0 bg-destructive/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md"
                    >
                      <X className="h-5 w-5 text-destructive-foreground" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-0 left-0 right-0 bg-background/80 text-[10px] text-center py-0.5 font-medium">
                        Cover
                      </span>
                    )}
                  </>
                ) : (
                  <>
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
                  </>
                )}
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
                <div key={idx + GRID_SLOTS} className="relative flex-shrink-0 group">
                  <img 
                    src={url} 
                    alt={`Photo ${idx + GRID_SLOTS + 1}`}
                    className="w-12 h-12 object-cover rounded-md cursor-grab active:cursor-grabbing"
                    draggable
                    onDragStart={(e) => handleImageDragStart(e, url)}
                  />
                  <button
                    type="button"
                    onClick={(e) => handleRemoveImage(idx + GRID_SLOTS, e)}
                    className="absolute inset-0 bg-destructive/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md"
                  >
                    <X className="h-3 w-3 text-destructive-foreground" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <p className="text-xs text-muted-foreground text-center">
          Click or drag & drop images
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
