import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Pencil, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ClosetSelectionProps {
  onSelectCloset: (closet: 'parker' | 'spencer') => void;
  isEditMode?: boolean;
}

// Wine-red color for hover overlay
const WINE_RED_BG = 'rgba(114, 47, 55, 0.9)';

interface ClosetArt {
  owner: string;
  art_image_url: string | null;
}

export function ClosetSelection({ onSelectCloset, isEditMode = false }: ClosetSelectionProps) {
  const [hoveredCloset, setHoveredCloset] = useState<'parker' | 'spencer' | null>(null);
  const [uploadingFor, setUploadingFor] = useState<'parker' | 'spencer' | null>(null);
  const parkerInputRef = useRef<HTMLInputElement>(null);
  const spencerInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Fetch closet selection art from about_us_content
  const { data: closetArt } = useQuery({
    queryKey: ['closet-selection-art'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('about_us_content')
        .select('owner, art_image_url')
        .in('owner', ['parker', 'spencer']);
      
      if (error) throw error;
      return data as ClosetArt[];
    },
  });

  const parkerArt = closetArt?.find(c => c.owner === 'parker')?.art_image_url;
  const spencerArt = closetArt?.find(c => c.owner === 'spencer')?.art_image_url;

  const uploadMutation = useMutation({
    mutationFn: async ({ owner, file }: { owner: 'parker' | 'spencer'; file: File }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `closet-selection/${owner}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('inventory-images')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('inventory-images')
        .getPublicUrl(fileName);
      
      // Update about_us_content with new art URL
      const { error: updateError } = await supabase
        .from('about_us_content')
        .update({ art_image_url: publicUrl })
        .eq('owner', owner);
      
      if (updateError) throw updateError;
      
      return publicUrl;
    },
    onSuccess: (_, { owner }) => {
      queryClient.invalidateQueries({ queryKey: ['closet-selection-art'] });
      toast.success(`${owner.charAt(0).toUpperCase() + owner.slice(1)}'s closet image updated`);
    },
    onError: () => {
      toast.error('Failed to upload image');
    },
    onSettled: () => {
      setUploadingFor(null);
    },
  });

  const handleFileSelect = (owner: 'parker' | 'spencer', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingFor(owner);
      uploadMutation.mutate({ owner, file });
    }
    e.target.value = '';
  };

  const renderClosetCard = (
    owner: 'parker' | 'spencer',
    artUrl: string | null | undefined,
    inputRef: React.RefObject<HTMLInputElement>
  ) => {
    const isHovered = hoveredCloset === owner;
    const hasArt = !!artUrl;
    const isUploading = uploadingFor === owner;
    const label = owner === 'parker' ? "PARKER'S" : "SPENCER'S";

    return (
      <Card 
        className="group cursor-pointer overflow-hidden rounded-2xl border-0 transition-all duration-300 relative"
        onMouseEnter={() => setHoveredCloset(owner)}
        onMouseLeave={() => setHoveredCloset(null)}
        onClick={() => !isEditMode && onSelectCloset(owner)}
      >
        <CardContent className="p-0">
          <div className="aspect-square relative flex items-center justify-center overflow-hidden">
            {/* Background: Art image or solid wine-red */}
            {hasArt ? (
              <img
                src={artUrl}
                alt={`${owner}'s closet`}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div 
                className="absolute inset-0"
                style={{ backgroundColor: 'hsl(0, 45%, 22%)' }}
              />
            )}

            {/* Hover Overlay - Wine red with white text (only when art exists) */}
            {hasArt && (
              <div
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ backgroundColor: WINE_RED_BG }}
              >
                <div className="text-center">
                  <h3 className="text-2xl font-light tracking-[0.15em] mb-2 text-white">
                    {label}
                  </h3>
                  <p className="text-lg tracking-[0.2em] text-white/80">
                    CLOSET
                  </p>
                </div>
              </div>
            )}

            {/* Default Text - Only visible when no art OR when not hovered */}
            {!hasArt && (
              <div className="relative z-10 text-center">
                <h3 
                  className="text-2xl font-light tracking-[0.15em] mb-2 transition-colors duration-300 text-white"
                >
                  {label}
                </h3>
                <p 
                  className="text-lg tracking-[0.2em] transition-colors duration-300 text-white/70"
                >
                  CLOSET
                </p>
              </div>
            )}

            {/* Edit Mode: Upload Button */}
            {isEditMode && (
              <div className="absolute top-3 right-3 z-20">
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(owner, e)}
                />
                <Button
                  size="sm"
                  variant="secondary"
                  className="gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.click();
                  }}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : hasArt ? (
                    <Pencil className="h-3 w-3" />
                  ) : (
                    <Upload className="h-3 w-3" />
                  )}
                  {isUploading ? 'Uploading...' : hasArt ? 'Edit' : 'Upload'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-[80vh] bg-black py-12 px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-light tracking-wide mb-2 text-white">Personal Collection</h2>
        <p className="text-muted-foreground">Select a closet to explore</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {renderClosetCard('parker', parkerArt, parkerInputRef)}
        {renderClosetCard('spencer', spencerArt, spencerInputRef)}
      </div>
    </div>
  );
}
