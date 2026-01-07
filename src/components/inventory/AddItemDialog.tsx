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

type ItemCategory = Database['public']['Enums']['item_category'];
type ItemStatus = Database['public']['Enums']['item_status'];
type Platform = Database['public']['Enums']['platform'];

interface AddItemDialogProps {
  onAdd: (item: Partial<InventoryItem>) => void;
}

const categories: { value: ItemCategory; label: string }[] = [
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'bottoms', label: 'Bottoms' },
  { value: 'tops', label: 'Tops' },
  { value: 'footwear', label: 'Footwear' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'bags', label: 'Bags' },
  { value: 'other', label: 'Other' },
];

const statuses: { value: ItemStatus; label: string }[] = [
  { value: 'in-closet', label: 'In Closet' },
  { value: 'listed', label: 'Listed' },
  { value: 'archive-hold', label: 'Archive Hold' },
];

const platforms: { value: Platform; label: string }[] = [
  { value: 'none', label: 'Not Listed' },
  { value: 'grailed', label: 'Grailed' },
  { value: 'depop', label: 'Depop' },
  { value: 'ebay', label: 'eBay' },
  { value: 'poshmark', label: 'Poshmark' },
  { value: 'vinted', label: 'Vinted' },
  { value: 'mercari', label: 'Mercari' },
];

export function AddItemDialog({ onAdd }: AddItemDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'tops' as ItemCategory,
    size: '',
    acquisitionCost: '',
    askingPrice: '',
    lowestAcceptablePrice: '',
    status: 'in-closet' as ItemStatus,
    platform: 'none' as Platform,
    sourcePlatform: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const cost = parseFloat(formData.acquisitionCost);
    const asking = parseFloat(formData.askingPrice);
    const lowest = parseFloat(formData.lowestAcceptablePrice);

    if (!formData.name || isNaN(cost)) return;

    onAdd({
      name: formData.name,
      brand: formData.brand || null,
      category: formData.category,
      size: formData.size || null,
      acquisitionCost: cost,
      askingPrice: asking || cost * 2,
      lowestAcceptablePrice: lowest || cost * 1.5,
      status: formData.status,
      platform: formData.platform,
      sourcePlatform: formData.sourcePlatform || null,
      notes: formData.notes || null,
      dateAdded: new Date().toISOString().split('T')[0],
    });

    setFormData({
      name: '',
      brand: '',
      category: 'tops',
      size: '',
      acquisitionCost: '',
      askingPrice: '',
      lowestAcceptablePrice: '',
      status: 'in-closet',
      platform: 'none',
      sourcePlatform: '',
      notes: '',
    });
    setOpen(false);
  };

  const cost = parseFloat(formData.acquisitionCost) || 0;
  const suggestedAsking = cost * 2;
  const suggestedLowest = cost * 1.5;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4 mr-2" />Add Item</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Inventory Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Item Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Helmut Lang Bondage Jacket" required />
            </div>
            <div>
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} placeholder="e.g. Helmut Lang" />
            </div>
            <div>
              <Label htmlFor="size">Size</Label>
              <Input id="size" value={formData.size} onChange={(e) => setFormData({ ...formData, size: e.target.value })} placeholder="e.g. XL, 10, 44" />
            </div>
            <div className="col-span-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value: ItemCategory) => setFormData({ ...formData, category: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-medium mb-3">Pricing</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="cost">Cost (Paid)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input id="cost" type="number" value={formData.acquisitionCost} onChange={(e) => setFormData({ ...formData, acquisitionCost: e.target.value })} placeholder="0" className="pl-7" required />
                </div>
              </div>
              <div>
                <Label htmlFor="asking">Asking Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input id="asking" type="number" value={formData.askingPrice} onChange={(e) => setFormData({ ...formData, askingPrice: e.target.value })} placeholder={suggestedAsking.toString()} className="pl-7" />
                </div>
                {cost > 0 && !formData.askingPrice && <p className="text-xs text-muted-foreground mt-1">Suggested: ${suggestedAsking}</p>}
              </div>
              <div>
                <Label htmlFor="lowest">Lowest Accept</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input id="lowest" type="number" value={formData.lowestAcceptablePrice} onChange={(e) => setFormData({ ...formData, lowestAcceptablePrice: e.target.value })} placeholder={suggestedLowest.toString()} className="pl-7" />
                </div>
                {cost > 0 && !formData.lowestAcceptablePrice && <p className="text-xs text-muted-foreground mt-1">Suggested: ${suggestedLowest}</p>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: ItemStatus) => setFormData({ ...formData, status: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="platform">Listed On</Label>
              <Select value={formData.platform} onValueChange={(value: Platform) => setFormData({ ...formData, platform: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {platforms.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="sourcePlatform">Sourced From</Label>
            <Input id="sourcePlatform" value={formData.sourcePlatform} onChange={(e) => setFormData({ ...formData, sourcePlatform: e.target.value })} placeholder="e.g. Grailed, Estate Sale, Trade" />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Season, condition, sizing notes, comps..." rows={3} />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Add Item</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}