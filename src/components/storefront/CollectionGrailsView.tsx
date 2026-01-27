import { useState, useRef, useMemo } from 'react';
import { Loader2, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { supabase } from '@/integrations/supabase/client';
import { useStorefrontGrails, GRAIL_POSITIONS } from '@/hooks/useStorefrontGrails';
import { SortableGrailCard } from './SortableGrailCard';
import { StorefrontProductDetail } from './StorefrontProductDetail';
import { PublicInventoryItem } from '@/hooks/usePublicInventory';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CollectionGrailsViewProps {
  isEditMode: boolean;
}

type SizePreset = 'auto' | 'portrait' | 'square' | 'wide' | 'tall';

export function CollectionGrailsView({ isEditMode }: CollectionGrailsViewProps) {
  const { grailsByPosition, isLoading, addGrail, removeGrail, uploadArtImage, updateGrailSize, updateGrailText, reorderGrails, markGrailSold } = useStorefrontGrails();
  const [showSelectDialog, setShowSelectDialog] = useState(false);
  const [showArtDialog, setShowArtDialog] = useState(false);
  const [showTextDialog, setShowTextDialog] = useState(false);
  const [showSoldDialog, setShowSoldDialog] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedItem, setSelectedItem] = useState<PublicInventoryItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [soldPrice, setSoldPrice] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

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

  // Filter inventory items based on search (for selection dialog)
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return allItems || [];
    const query = searchQuery.toLowerCase();
    return (allItems || []).filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.brand?.toLowerCase().includes(query)
    );
  }, [searchQuery, allItems]);

  const handleAddGrail = () => {
    if (!selectedPosition || !selectedItemId) return;
    addGrail({ position: selectedPosition, inventoryItemId: selectedItemId });
    setShowSelectDialog(false);
    setSelectedPosition(null);
    setSelectedItemId('');
  };

  const handleRemoveGrail = (position: number) => {
    removeGrail(position);
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

  const handleSizeChange = (position: number, newSize: SizePreset) => {
    updateGrailSize({ position, sizePreset: newSize });
  };

  const handleOpenTextEdit = (position: number) => {
    const grail = grailsByPosition.get(position);
    setSelectedPosition(position);
    setEditTitle(grail?.title || '');
    setEditDescription(grail?.description || '');
    setShowTextDialog(true);
  };

  const handleSaveText = () => {
    if (!selectedPosition) return;
    updateGrailText({ position: selectedPosition, title: editTitle || undefined, description: editDescription || undefined });
    setShowTextDialog(false);
    setSelectedPosition(null);
    setEditTitle('');
    setEditDescription('');
  };

  const handleOpenSoldDialog = (position: number) => {
    const grail = grailsByPosition.get(position);
    if (grail?.is_sold) {
      // Toggle off - unmark as sold
      markGrailSold({ position, isSold: false });
    } else {
      // Open dialog to enter price
      setSelectedPosition(position);
      setSoldPrice('');
      setShowSoldDialog(true);
    }
  };

  const handleConfirmSold = () => {
    if (!selectedPosition) return;
    markGrailSold({ 
      position: selectedPosition, 
      isSold: true, 
      soldPrice: soldPrice ? parseFloat(soldPrice) : undefined 
    });
    setShowSoldDialog(false);
    setSelectedPosition(null);
    setSoldPrice('');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const fromPosition = parseInt(active.id as string);
      const toPosition = parseInt(over.id as string);
      reorderGrails([{ fromPosition, toPosition }]);
    }
  };

  // Create sortable items list
  const sortableItems = GRAIL_POSITIONS.map(({ position }) => position.toString());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const renderGrailCards = () => (
    <div 
      className="gap-4"
      style={{
        columnCount: 4,
        columnGap: '1rem',
      }}
    >
      {GRAIL_POSITIONS.map(({ position, size }) => {
        const grail = grailsByPosition.get(position);
        // Skip empty slots in non-edit mode
        if (!grail?.item && !isEditMode) return null;
        
        return (
          <div
            key={position}
            className="mb-4"
            style={{ breakInside: 'avoid' }}
          >
            <SortableGrailCard
              id={position.toString()}
              item={grail?.item || null}
              artImageUrl={grail?.art_image_url || null}
              title={grail?.title || null}
              description={grail?.description || null}
              position={position}
              size={size}
              sizePreset={(grail?.size_preset as SizePreset) || 'auto'}
              isEditMode={isEditMode}
              isSold={grail?.is_sold || false}
              soldPrice={grail?.sold_price}
              onSelect={() => {
                setSelectedPosition(position);
                setShowSelectDialog(true);
              }}
              onArtUpload={() => {
                setSelectedPosition(position);
                setShowArtDialog(true);
              }}
              onRemove={() => handleRemoveGrail(position)}
              onSizeChange={(newSize) => handleSizeChange(position, newSize)}
              onEditText={() => handleOpenTextEdit(position)}
              onMarkSold={() => handleOpenSoldDialog(position)}
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
  );

  const handleOpenAddGrail = () => {
    // Find first empty position
    const emptyPosition = GRAIL_POSITIONS.find(({ position }) => !grailsByPosition.get(position)?.item);
    if (emptyPosition) {
      setSelectedPosition(emptyPosition.position);
      setShowSelectDialog(true);
    } else {
      // All positions full, use next available position
      const maxPosition = Math.max(...GRAIL_POSITIONS.map(p => p.position));
      setSelectedPosition(maxPosition + 1);
      setShowSelectDialog(true);
    }
  };

  return (
    <div className="min-h-[80vh] bg-black">
      {/* Title */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif tracking-[0.3em] text-white">
            COLLECTION GRAILS
          </h1>
          <p className="text-white/60 mt-2 tracking-wide">
            The most coveted pieces in our collection
          </p>
        </div>
        {isEditMode && (
          <Button
            variant="outline"
            onClick={handleOpenAddGrail}
            className="border-white/30 text-white hover:bg-white/10"
          >
            + Add Grail
          </Button>
        )}
      </div>

      {/* True Masonry Gallery using CSS Columns with gaps */}
      {isEditMode ? (
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCenter} 
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sortableItems} strategy={rectSortingStrategy}>
            {renderGrailCards()}
          </SortableContext>
        </DndContext>
      ) : (
        renderGrailCards()
      )}

      {/* Select Item Dialog */}
      <Dialog open={showSelectDialog} onOpenChange={(open) => {
        setShowSelectDialog(open);
        if (!open) setSearchQuery('');
      }}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Select Grail for Position {selectedPosition}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Scrollable Item List */}
            <ScrollArea className="h-64 border rounded-md">
              <div className="p-2 space-y-1">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-2 rounded-md cursor-pointer transition-colors ${
                      selectedItemId === item.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-secondary'
                    }`}
                    onClick={() => setSelectedItemId(item.id)}
                  >
                    <span className="text-sm">
                      {item.brand ? `${item.brand} - ` : ''}{item.name}
                    </span>
                  </div>
                ))}
                {filteredItems.length === 0 && (
                  <div className="text-center text-muted-foreground py-4 text-sm">
                    No items found
                  </div>
                )}
              </div>
            </ScrollArea>

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

      {/* Text Edit Dialog */}
      <Dialog open={showTextDialog} onOpenChange={setShowTextDialog}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Edit Grail Text</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="Enter title..."
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Enter description..."
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowTextDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveText}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sold Price Dialog */}
      <Dialog open={showSoldDialog} onOpenChange={setShowSoldDialog}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Mark Grail as Sold</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Sale Price (optional)</Label>
              <Input
                type="number"
                placeholder="Enter sale price..."
                value={soldPrice}
                onChange={(e) => setSoldPrice(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSoldDialog(false)}>Cancel</Button>
              <Button onClick={handleConfirmSold}>Mark as Sold</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Item Detail Dialog */}
      <StorefrontProductDetail
        item={selectedItem}
        open={!!selectedItem}
        onOpenChange={(open) => !open && setSelectedItem(null)}
        isEditMode={isEditMode}
      />
    </div>
  );
}
