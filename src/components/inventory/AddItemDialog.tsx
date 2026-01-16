import { useState } from 'react';
import { InventoryItem } from '@/hooks/useSupabaseInventory';
import { Database } from '@/integrations/supabase/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { PlatformMultiSelect } from './PlatformMultiSelect';
import { ImageUpload } from './ImageUpload';
import { supabase } from '@/integrations/supabase/client';

type ItemStatus = Database['public']['Enums']['item_status'];

interface AddItemDialogProps {
  onAdd: (item: Partial<InventoryItem>) => void;
}

const statuses: { value: ItemStatus; label: string }[] = [
  { value: 'in-closet-parker', label: 'In Closet (Parker)' },
  { value: 'in-closet-spencer', label: 'In Closet (Spencer)' },
  { value: 'listed', label: 'For Sale' },
  { value: 'otw', label: 'OTW' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'traded', label: 'Traded' },
];

// Extract brand from item name using AI
async function extractBrandFromName(name: string): Promise<{ brand: string; brandCategory: string } | null> {
  try {
    const { data, error } = await supabase.functions.invoke('extract-brands', {
      body: { mode: 'single', itemName: name }
    });
    
    if (error || !data?.results?.[0]) return null;
    return {
      brand: data.results[0].brand,
      brandCategory: data.results[0].brandCategory,
    };
  } catch {
    return null;
  }
}

export function AddItemDialog({ onAdd }: AddItemDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    size: '',
    acquisitionCost: '',
    askingPrice: '',
    lowestAcceptablePrice: '',
    status: 'in-closet-parker' as ItemStatus,
    platforms: [] as string[],
    sourcePlatform: '',
    notes: '',
    imageUrls: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cost = parseFloat(formData.acquisitionCost);
    const asking = parseFloat(formData.askingPrice);
    const lowest = parseFloat(formData.lowestAcceptablePrice);

    if (!formData.name || isNaN(cost)) return;

    // Extract brand using AI (non-blocking, best effort)
    const brandInfo = await extractBrandFromName(formData.name);

    onAdd({
      name: formData.name,
      size: formData.size || null,
      acquisitionCost: cost,
      askingPrice: asking || cost * 2,
      lowestAcceptablePrice: lowest || cost * 1.5,
      status: formData.status,
      platforms: formData.platforms,
      sourcePlatform: formData.sourcePlatform || null,
      notes: formData.notes || null,
      dateAdded: new Date().toISOString().split('T')[0],
      imageUrl: formData.imageUrls[0] || null,
      imageUrls: formData.imageUrls,
      brand: brandInfo?.brand || null,
      brandCategory: brandInfo?.brandCategory || null,
    });

    setFormData({
      name: '',
      size: '',
      acquisitionCost: '',
      askingPrice: '',
      lowestAcceptablePrice: '',
      status: 'in-closet-parker',
      platforms: [],
      sourcePlatform: '',
      notes: '',
      imageUrls: [],
    });
    setOpen(false);
  };

  const cost = parseFloat(formData.acquisitionCost) || 0;
  const suggestedAsking = cost * 2;
  const suggestedLowest = cost * 1.5;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Image Upload - Depop Style Grid */}
          <ImageUpload
            imageUrls={formData.imageUrls}
            onImagesChange={(urls) => setFormData({ ...formData, imageUrls: urls })}
          />

          {/* Item Name */}
          <div>
            <Label htmlFor="name">Item Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Jordan 4 Retro Black Cat"
              required
            />
          </div>

          {/* Size */}
          <div>
            <Label htmlFor="size">Size</Label>
            <Input
              id="size"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              placeholder="10.5"
            />
          </div>

          {/* Pricing Row */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="cost">Cost *</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.acquisitionCost}
                onChange={(e) => setFormData({ ...formData, acquisitionCost: e.target.value })}
                placeholder="200"
                required
              />
            </div>
            <div>
              <Label htmlFor="asking">
                Asking
                {cost > 0 && (
                  <span className="text-muted-foreground font-normal ml-1">
                    (~${suggestedAsking.toFixed(0)})
                  </span>
                )}
              </Label>
              <Input
                id="asking"
                type="number"
                step="0.01"
                value={formData.askingPrice}
                onChange={(e) => setFormData({ ...formData, askingPrice: e.target.value })}
                placeholder={cost > 0 ? suggestedAsking.toFixed(0) : '400'}
              />
            </div>
            <div>
              <Label htmlFor="lowest">
                Lowest
                {cost > 0 && (
                  <span className="text-muted-foreground font-normal ml-1">
                    (~${suggestedLowest.toFixed(0)})
                  </span>
                )}
              </Label>
              <Input
                id="lowest"
                type="number"
                step="0.01"
                value={formData.lowestAcceptablePrice}
                onChange={(e) => setFormData({ ...formData, lowestAcceptablePrice: e.target.value })}
                placeholder={cost > 0 ? suggestedLowest.toFixed(0) : '300'}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: ItemStatus) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Source Platform */}
          <div>
            <Label htmlFor="source">Source Platform</Label>
            <Input
              id="source"
              value={formData.sourcePlatform}
              onChange={(e) => setFormData({ ...formData, sourcePlatform: e.target.value })}
              placeholder="Mercari, eBay, etc."
            />
          </div>

          {/* Platforms */}
          <PlatformMultiSelect
            value={formData.platforms}
            onChange={(platforms) => setFormData({ ...formData, platforms })}
          />

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Season, condition, sizing notes, comps..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Item</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
