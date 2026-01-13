import { useState, useRef, DragEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  imageUrls: string[];
  onImagesChange: (urls: string[]) => void;
  className?: string;
}

export function ImageUpload({ imageUrls, onImagesChange, className }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
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

    setIsUploading(true);
    const newUrls: string[] = [];

    try {
      for (const file of validFiles) {
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
    // Reset input so same file can be selected again
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

  const handleRemoveImage = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    onImagesChange(newUrls);
    if (selectedIndex >= newUrls.length && newUrls.length > 0) {
      setSelectedIndex(newUrls.length - 1);
    } else if (newUrls.length === 0) {
      setSelectedIndex(0);
    }
  };

  const hasImages = imageUrls.length > 0;
  const mainImage = hasImages ? imageUrls[selectedIndex] || imageUrls[0] : null;

  return (
    <div 
      className={cn("relative", className)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {hasImages ? (
        <div className="space-y-2">
          {/* Main image preview */}
          <div className="relative group rounded-lg overflow-hidden border border-border bg-muted/30">
            <img 
              src={mainImage!} 
              alt="Item" 
              className="w-full h-48 object-contain bg-muted/20"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleRemoveImage(selectedIndex)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Thumbnails row */}
          <div className="flex gap-2 flex-wrap">
            {imageUrls.map((url, index) => (
              <button
                key={url}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  "relative w-14 h-14 rounded-md overflow-hidden border-2 transition-all group",
                  index === selectedIndex 
                    ? "border-primary ring-2 ring-primary/20" 
                    : "border-border hover:border-primary/50"
                )}
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage(index);
                  }}
                  className="absolute inset-0 bg-destructive/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <X className="h-4 w-4 text-destructive-foreground" />
                </button>
              </button>
            ))}
            
            {/* Add more button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={cn(
                "w-14 h-14 rounded-md border-2 border-dashed flex items-center justify-center transition-colors",
                isDragging 
                  ? "border-primary bg-primary/10" 
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              {isUploading ? (
                <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
              ) : (
                <ImagePlus className={cn("h-5 w-5", isDragging ? "text-primary" : "text-muted-foreground")} />
              )}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={cn(
            "w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-50",
            isDragging 
              ? "border-primary bg-primary/10" 
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
              <span className="text-sm text-muted-foreground">Uploading...</span>
            </>
          ) : (
            <>
              <ImagePlus className={cn("h-8 w-8", isDragging ? "text-primary" : "text-muted-foreground")} />
              <span className={cn("text-sm", isDragging ? "text-primary" : "text-muted-foreground")}>
                {isDragging ? "Drop images here" : "Add Photos"}
              </span>
              <span className="text-xs text-muted-foreground">
                Click or drag & drop (multiple allowed)
              </span>
            </>
          )}
        </button>
      )}
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
