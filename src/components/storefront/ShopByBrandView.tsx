import { useState, useRef } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
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
import { useStorefrontBrands, StorefrontBrand } from '@/hooks/useStorefrontBrands';
import { BrandShowcaseCard } from './BrandShowcaseCard';
import { toast } from 'sonner';

interface ShopByBrandViewProps {
  isEditMode: boolean;
  onBrandClick: (brandName: string) => void;
}

export function ShopByBrandView({ isEditMode, onBrandClick }: ShopByBrandViewProps) {
  const { brands, isLoading, addBrand, deleteBrand, uploadArtImage } = useStorefrontBrands();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showArtDialog, setShowArtDialog] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<StorefrontBrand | null>(null);
  const [newBrandName, setNewBrandName] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get all unique brands from inventory for suggestions
  const { data: inventoryBrands } = useQuery({
    queryKey: ['inventory-brands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('brand, id, image_urls, image_url')
        .not('brand', 'is', null);
      
      if (error) throw error;
      
      // Group by brand
      const brandMap = new Map<string, { id: string; imageUrl: string | null }[]>();
      (data || []).forEach((item) => {
        if (!item.brand) return;
        const existing = brandMap.get(item.brand) || [];
        existing.push({
          id: item.id,
          imageUrl: (item.image_urls as string[])?.[0] || item.image_url,
        });
        brandMap.set(item.brand, existing);
      });
      
      return brandMap;
    },
  });

  // Brands not yet added to storefront
  const availableBrands = Array.from(inventoryBrands?.keys() || [])
    .filter((b) => !brands.find((sb) => sb.brand_name.toLowerCase() === b.toLowerCase()))
    .sort();

  const handleAddBrand = () => {
    if (!newBrandName.trim()) {
      toast.error('Please enter a brand name');
      return;
    }
    addBrand({ brandName: newBrandName.trim(), featuredItemId: selectedItemId || undefined });
    setShowAddDialog(false);
    setNewBrandName('');
    setSelectedItemId('');
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif tracking-wide">Shop by Brand</h2>
          <p className="text-muted-foreground text-sm mt-1">
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

      {/* Brand Grid */}
      {brands.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-muted-foreground/30 rounded-lg">
          <p className="text-muted-foreground">
            {isEditMode ? 'Click "Add Brand" to start showcasing brands' : 'No brands added yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {brands.map((brand) => (
            <div key={brand.id} className="relative group">
              <BrandShowcaseCard
                brandName={brand.brand_name}
                featuredImageUrl={brand.featured_image_url}
                artImageUrl={brand.art_image_url}
                isEditMode={isEditMode}
                onArtUpload={() => {
                  setSelectedBrand(brand);
                  setShowArtDialog(true);
                }}
                onClick={() => onBrandClick(brand.brand_name)}
              />
              {isEditMode && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteBrand(brand.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
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
              {availableBrands.length > 0 ? (
                <Select value={newBrandName} onValueChange={setNewBrandName}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a brand from inventory" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {availableBrands.map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="Enter brand name"
                />
              )}
            </div>

            {newBrandName && inventoryBrands?.get(newBrandName) && (
              <div className="space-y-2">
                <Label>Featured Item (optional)</Label>
                <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an item to feature" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {inventoryBrands.get(newBrandName)?.map((item, idx) => (
                      <SelectItem key={item.id} value={item.id}>
                        Item {idx + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

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
              This image will appear in grayscale when hovering over the brand card.
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
    </div>
  );
}
