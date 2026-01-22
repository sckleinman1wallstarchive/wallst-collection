import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Pencil, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AboutUsContent {
  id: string;
  owner: string;
  art_image_url: string | null;
  art_title: string | null;
  bio: string | null;
}

interface AboutUsGalleryProps {
  isEditMode: boolean;
}

export function AboutUsGallery({ isEditMode }: AboutUsGalleryProps) {
  const queryClient = useQueryClient();
  const [editingOwner, setEditingOwner] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [artTitle, setArtTitle] = useState('');

  const { data: content, isLoading } = useQuery({
    queryKey: ['about-us-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('about_us_content')
        .select('*')
        .order('owner');
      if (error) throw error;
      return data as AboutUsContent[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ owner, artUrl, title }: { owner: string; artUrl: string; title: string }) => {
      const { error } = await supabase
        .from('about_us_content')
        .update({ art_image_url: artUrl, art_title: title })
        .eq('owner', owner);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['about-us-content'] });
      toast.success('Art piece updated');
      setEditingOwner(null);
    },
    onError: () => {
      toast.error('Failed to update art piece');
    },
  });

  const handleFileUpload = async (owner: string, file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `about-us/${owner}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('inventory-images')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('inventory-images')
        .getPublicUrl(fileName);

      updateMutation.mutate({ owner, artUrl: publicUrl, title: artTitle });
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const parkerContent = content?.find((c) => c.owner === 'parker');
  const spencerContent = content?.find((c) => c.owner === 'spencer');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-black py-16 px-8">
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif tracking-widest text-white mb-4">
            ABOUT US
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Wall St. Collection is a curated vintage and designer clothing resale business 
            founded by Parker and Spencer Kleinman.
          </p>
        </div>

        {/* Art Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
          {/* Parker's Art Piece */}
          <ArtPieceFrame
            owner="Parker"
            imageUrl={parkerContent?.art_image_url}
            title={parkerContent?.art_title}
            isEditMode={isEditMode}
            onEdit={() => {
              setArtTitle(parkerContent?.art_title || '');
              setEditingOwner('parker');
            }}
          />

          {/* Spencer's Art Piece */}
          <ArtPieceFrame
            owner="Spencer"
            imageUrl={spencerContent?.art_image_url}
            title={spencerContent?.art_title}
            isEditMode={isEditMode}
            onEdit={() => {
              setArtTitle(spencerContent?.art_title || '');
              setEditingOwner('spencer');
            }}
          />
        </div>

        {/* Mission Statement */}
        <div className="mt-24 text-center border-t border-white/10 pt-12">
          <p className="text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Our mission is to give pre-loved garments a second life while providing 
            fashion enthusiasts access to rare and distinctive pieces at accessible prices.
            We specialize in sourcing unique, high-quality pieces that tell a story.
          </p>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingOwner} onOpenChange={() => setEditingOwner(null)}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Edit {editingOwner === 'parker' ? "Parker's" : "Spencer's"} Art Piece</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="art-title">Art Title</Label>
              <Input
                id="art-title"
                value={artTitle}
                onChange={(e) => setArtTitle(e.target.value)}
                placeholder="Enter title for the art piece"
              />
            </div>
            <div className="space-y-2">
              <Label>Upload Art Image</Label>
              <Input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && editingOwner) {
                    handleFileUpload(editingOwner, file);
                  }
                }}
              />
            </div>
            {uploading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ArtPieceFrameProps {
  owner: string;
  imageUrl: string | null | undefined;
  title: string | null | undefined;
  isEditMode: boolean;
  onEdit: () => void;
}

function ArtPieceFrame({ owner, imageUrl, title, isEditMode, onEdit }: ArtPieceFrameProps) {
  return (
    <div className="flex flex-col items-center">
      {/* Frame Container */}
      <div className="relative w-full max-w-md">
        {/* Outer Frame */}
        <div className="border-8 border-white/20 p-2 bg-white/5">
          {/* Inner Frame */}
          <div className="border-2 border-white/10 aspect-[3/4] relative overflow-hidden bg-black">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title || `${owner}'s art piece`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground border-2 border-dashed border-muted-foreground/30 m-4">
                {isEditMode ? (
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2" />
                    <span className="text-sm">Click edit to add art</span>
                  </div>
                ) : (
                  <span className="text-sm">Art piece coming soon</span>
                )}
              </div>
            )}

            {/* Edit Button */}
            {isEditMode && (
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2 gap-1"
                onClick={onEdit}
              >
                {imageUrl ? <Pencil className="h-3 w-3" /> : <Upload className="h-3 w-3" />}
                {imageUrl ? 'Edit' : 'Add'}
              </Button>
            )}
          </div>
        </div>

        {/* Title Plaque */}
        <div className="mt-6 text-center">
          <h3 className="text-xl font-serif tracking-wide text-white">{owner}</h3>
          {title && (
            <p className="text-muted-foreground text-sm mt-1 italic">"{title}"</p>
          )}
        </div>
      </div>
    </div>
  );
}
