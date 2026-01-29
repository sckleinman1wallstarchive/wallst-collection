import { useState, useRef } from 'react';
import { Loader2, Plus, Trash2, ListChecks } from 'lucide-react';
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
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useStorefrontBrands, StorefrontBrand } from '@/hooks/useStorefrontBrands';
import { SortableBrandCard } from './SortableBrandCard';
import { AssignBrandItemsDialog } from './AssignBrandItemsDialog';
import { toast } from 'sonner';

interface ShopByBrandViewProps {
  isEditMode: boolean;
  onBrandClick: (brandName: string) => void;
}

type SizePreset = 'auto' | 'portrait' | 'square' | 'wide' | 'tall';

export function ShopByBrandView({ isEditMode, onBrandClick }: ShopByBrandViewProps) {
  const { brands, isLoading, addBrand, deleteBrand, uploadArtImage, updateBrand, reorderBrands } = useStorefrontBrands();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showArtDialog, setShowArtDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<StorefrontBrand | null>(null);
  const [newBrandName, setNewBrandName] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleAddBrand = async () => {
    if (!newBrandName.trim()) {
      toast.error('Please enter a brand name');
      return;
    }
    
    addBrand({ brandName: newBrandName.trim() });
    
    setShowAddDialog(false);
    setNewBrandName('');
  };

  const handleArtUpload = async (file: File) => {
    if (!selectedBrand) return;
    setUploading(true);
    try {
      await uploadArtImage(selectedBrand.id, file);
      toast.success('Art image uploaded');
      setShowArtDialog(false);
      setSelectedBrand(null);
    } catch {
      toast.error('Failed to upload art image');
    } finally {
      setUploading(false);
    }
  };

  const handleSizeChange = (brandId: string, newSize: SizePreset) => {
    updateBrand({ id: brandId, updates: { size_preset: newSize } as any });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = brands.findIndex(b => b.id === active.id);
      const newIndex = brands.findIndex(b => b.id === over.id);
      const newOrder = arrayMove(brands, oldIndex, newIndex);
      reorderBrands(newOrder.map((b, i) => ({ id: b.id, order: i })));
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
    <div className="space-y-8 bg-black -m-6 p-6 min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif tracking-wide text-white">Shop by Brand</h2>
          <p className="text-white/60 text-sm mt-1">
            Explore our curated collection by brand
          </p>
        </div>
        {isEditMode && (
          <Button onClick={() => setShowAddDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Brand
          </Button>
        )}
      </div>

      {/* Brand Grid - Staggered Fine Art Layout using CSS Columns */}
      {brands.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-white/30 rounded-lg">
          <p className="text-white/60">
            {isEditMode ? 'Click "Add Brand" to start showcasing brands' : 'No brands added yet'}
          </p>
        </div>
      ) : isEditMode ? (
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCenter} 
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={brands.map(b => b.id)} strategy={rectSortingStrategy}>
            <div className="columns-2 md:columns-3 gap-6">
              {brands.map((brand) => (
                <div key={brand.id} className="relative group break-inside-avoid mb-6">
                  <SortableBrandCard
                    id={brand.id}
                    brandName={brand.brand_name}
                    featuredImageUrl={brand.featured_image_url}
                    artImageUrl={brand.art_image_url}
                    isEditMode={isEditMode}
                    sizePreset={(brand as any).size_preset || 'auto'}
                    onArtUpload={() => {
                      setSelectedBrand(brand);
                      setShowArtDialog(true);
                    }}
                    onSizeChange={(size) => handleSizeChange(brand.id, size)}
                    onClick={() => onBrandClick(brand.brand_name)}
                  />
                  <div className="absolute bottom-2 left-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBrand(brand);
                        setShowAssignDialog(true);
                      }}
                    >
                      <ListChecks className="h-3 w-3 mr-1" />
                      Items
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteBrand(brand.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="columns-2 md:columns-3 gap-6">
          {brands.map((brand) => (
            <div key={brand.id} className="relative group break-inside-avoid mb-6">
              <SortableBrandCard
                id={brand.id}
                brandName={brand.brand_name}
                featuredImageUrl={brand.featured_image_url}
                artImageUrl={brand.art_image_url}
                isEditMode={false}
                sizePreset={(brand as any).size_preset || 'auto'}
                onArtUpload={() => {}}
                onSizeChange={() => {}}
                onClick={() => onBrandClick(brand.brand_name)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Add Brand Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Add Brand to Showcase</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Brand Name</Label>
              <Input
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                placeholder="Enter brand name (e.g., Chrome Hearts)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddBrand();
                  }
                }}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddBrand}>Add Brand</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Art Upload Dialog */}
      <Dialog open={showArtDialog} onOpenChange={setShowArtDialog}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Upload Art for {selectedBrand?.brand_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload an image to display for this brand. The brand name will appear over the image.
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

      {/* Assign Items Dialog */}
      {selectedBrand && (
        <AssignBrandItemsDialog
          open={showAssignDialog}
          onOpenChange={(open) => {
            setShowAssignDialog(open);
            if (!open) setSelectedBrand(null);
          }}
          brandId={selectedBrand.id}
          brandName={selectedBrand.brand_name}
        />
      )}
    </div>
  );
}
