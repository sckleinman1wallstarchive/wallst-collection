import { useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useStorefrontGrails, GRAIL_POSITIONS } from '@/hooks/useStorefrontGrails';
import { GrailCard } from './GrailCard';
import { StorefrontProductDetail } from './StorefrontProductDetail';
import { PublicInventoryItem } from '@/hooks/usePublicInventory';
import { toast } from 'sonner';

interface CollectionGrailsViewProps {
  isEditMode: boolean;
}

export function CollectionGrailsView({ isEditMode }: CollectionGrailsViewProps) {
  const { grailsByPosition, isLoading, addGrail, uploadArtImage } = useStorefrontGrails();
  const [showSelectDialog, setShowSelectDialog] = useState(false);
  const [showArtDialog, setShowArtDialog] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedItem, setSelectedItem] = useState<PublicInventoryItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get all inventory items for selection
  const { data: allItems } = useQuery({
    queryKey: ['all-inventory-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('id, name, brand, image_urls, image_url')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  const handleAddGrail = () => {
    if (!selectedPosition || !selectedItemId) return;
    addGrail({ position: selectedPosition, inventoryItemId: selectedItemId });
    setShowSelectDialog(false);
    setSelectedPosition(null);
    setSelectedItemId('');
  };

  const handleArtUpload = async (file: File) => {
    if (!selectedPosition) return;
    setUploading(true);
    try {
      await uploadArtImage(selectedPosition, file);
      toast.success('Art image uploaded');
      setShowArtDialog(false);
      setSelectedPosition(null);
    } catch {
      toast.error('Failed to upload art image');
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-black -m-6 p-8">
      {/* Title */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-serif tracking-[0.3em] text-white">
          COLLECTION GRAILS
        </h1>
        <p className="text-muted-foreground mt-2 tracking-wide">
          The most coveted pieces in our collection
        </p>
      </div>

      {/* Masonry Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-min">
        {GRAIL_POSITIONS.map(({ position, size }) => {
          const grail = grailsByPosition.get(position);
          return (
            <div
              key={position}
              className={`${size === 'large' ? 'row-span-2' : size === 'medium' ? 'row-span-1' : 'row-span-1'}`}
            >
              <GrailCard
                item={grail?.item || null}
                artImageUrl={grail?.art_image_url || null}
                position={position}
                size={size}
                isEditMode={isEditMode}
                onSelect={() => {
                  setSelectedPosition(position);
                  setShowSelectDialog(true);
                }}
                onArtUpload={() => {
                  setSelectedPosition(position);
                  setShowArtDialog(true);
                }}
                onClick={() => {
                  if (grail?.item) {
                    setSelectedItem(grail.item);
                  }
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Select Item Dialog */}
      <Dialog open={showSelectDialog} onOpenChange={setShowSelectDialog}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Select Grail for Position {selectedPosition}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Inventory Item</Label>
              <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an item" />
                </SelectTrigger>
                <SelectContent className="bg-popover max-h-64">
                  {allItems?.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.brand ? `${item.brand} - ` : ''}{item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSelectDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddGrail} disabled={!selectedItemId}>
                Add Grail
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Art Upload Dialog */}
      <Dialog open={showArtDialog} onOpenChange={setShowArtDialog}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Upload Art for Grail Position {selectedPosition}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This image will appear in grayscale when hovering over the grail.
            </p>
            <div className="space-y-2">
              <Label>Art Image</Label>
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleArtUpload(file);
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

      {/* Item Detail Dialog */}
      <StorefrontProductDetail
        item={selectedItem}
        open={!!selectedItem}
        onOpenChange={(open) => !open && setSelectedItem(null)}
      />
    </div>
  );
}
