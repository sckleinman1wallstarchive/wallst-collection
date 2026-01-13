import { useState, useRef } from 'react';
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
import { Plus, ImagePlus, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PlatformMultiSelect } from './PlatformMultiSelect';

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
    imageUrl: null as string | null,
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
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

      setFormData({ ...formData, imageUrl: publicUrl });
      toast.success('Image uploaded');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const cost = parseFloat(formData.acquisitionCost);
    const asking = parseFloat(formData.askingPrice);
    const lowest = parseFloat(formData.lowestAcceptablePrice);

    if (!formData.name || isNaN(cost)) return;

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
      imageUrl: formData.imageUrl,
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
      imageUrl: null,
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
          {/* Image Upload */}
          <div>
            <Label>Photo</Label>
            {formData.imageUrl ? (
              <div className="relative group mt-1">
                <img 
                  src={formData.imageUrl} 
                  alt="Item" 
                  className="w-full h-40 object-cover rounded-lg border border-border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setFormData({ ...formData, imageUrl: null })}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full h-32 mt-1 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-muted/50 transition-colors disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                    <span className="text-sm text-muted-foreground">Uploading...</span>
                  </>
                ) : (
                  <>
                    <ImagePlus className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Add Photo</span>
                  </>
                )}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Item Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Helmut Lang Bondage Jacket" required />
            </div>
            <div className="col-span-2">
              <Label htmlFor="size">Size</Label>
              <Input id="size" value={formData.size} onChange={(e) => setFormData({ ...formData, size: e.target.value })} placeholder="e.g. XL, 10, 44" />
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
              <Label htmlFor="sourcePlatform">Sourced From</Label>
              <Input id="sourcePlatform" value={formData.sourcePlatform} onChange={(e) => setFormData({ ...formData, sourcePlatform: e.target.value })} placeholder="e.g. Grailed, Estate Sale" />
            </div>
          </div>

          <PlatformMultiSelect
            value={formData.platforms}
            onChange={(platforms) => setFormData({ ...formData, platforms })}
          />
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