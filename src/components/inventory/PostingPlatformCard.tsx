import { useState, useRef } from 'react';
import { PostingPlatform } from '@/hooks/usePostingTracker';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, ImagePlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PostingPlatformCardProps {
  platform: PostingPlatform;
  itemCount: number;
  onAddItems: () => void;
  onViewItems: () => void;
  onDelete: () => void;
  onUpdateArtwork: (url: string | null) => void;
}

export function PostingPlatformCard({
  platform,
  itemCount,
  onAddItems,
  onViewItems,
  onDelete,
  onUpdateArtwork,
}: PostingPlatformCardProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleArtworkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `posting-tracker/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('inventory-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('inventory-images')
        .getPublicUrl(fileName);

      onUpdateArtwork(publicUrl);
      toast.success('Artwork updated');
    } catch {
      toast.error('Failed to upload artwork');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="rounded-xl overflow-hidden flex flex-col bg-primary text-primary-foreground min-h-[240px]">
      {/* Artwork Area */}
      <div
        className={cn(
          "relative h-28 flex items-center justify-center cursor-pointer group",
          platform.artwork_url ? "" : "bg-sidebar-accent"
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        {platform.artwork_url ? (
          <img
            src={platform.artwork_url}
            alt={platform.platform_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
            <ImagePlus className="h-6 w-6" />
            <span className="text-xs">Add Artwork</span>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleArtworkUpload}
          className="hidden"
        />
        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-2 right-2 p-1.5 rounded-md bg-background/20 hover:bg-destructive/80 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Info Area */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold tracking-wide uppercase">
            {platform.platform_name}
          </h3>
          <button
            onClick={onViewItems}
            className="text-sm opacity-80 hover:opacity-100 hover:underline transition-opacity mt-1"
          >
            {itemCount} posted
          </button>
        </div>

        <Button
          size="sm"
          className="w-full mt-3 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={onAddItems}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Items
        </Button>
      </div>
    </div>
  );
}
