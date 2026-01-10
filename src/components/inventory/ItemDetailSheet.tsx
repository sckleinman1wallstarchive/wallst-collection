import React, { useState, useRef } from 'react';
import { InventoryItem } from '@/hooks/useSupabaseInventory';
import { Database } from '@/integrations/supabase/types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, DollarSign, Save, ImagePlus, X, Loader2, ArrowRightLeft, CalendarCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type ItemStatus = Database['public']['Enums']['item_status'];
type Platform = Database['public']['Enums']['platform'];

interface ItemDetailSheetProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, updates: Partial<InventoryItem>) => void;
  onDelete: (id: string) => void;
  onSell: (item: InventoryItem) => void;
  onTrade?: (item: InventoryItem) => void;
  allItems?: InventoryItem[];
  startInEditMode?: boolean;
}

const statuses: { value: ItemStatus; label: string }[] = [
  { value: 'in-closet-parker', label: 'In Closet (Parker)' },
  { value: 'in-closet-spencer', label: 'In Closet (Spencer)' },
  { value: 'listed', label: 'For Sale' },
  { value: 'otw', label: 'OTW' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'scammed', label: 'Scammed' },
];

const platforms: { value: Platform; label: string }[] = [
  { value: 'none', label: 'Not Listed' },
  { value: 'grailed', label: 'Grailed' },
  { value: 'depop', label: 'Depop' },
  { value: 'ebay', label: 'eBay' },
  { value: 'poshmark', label: 'Poshmark' },
  { value: 'vinted', label: 'Vinted' },
  { value: 'mercari', label: 'Mercari' },
  { value: 'trade', label: 'Trade' },
];

export function ItemDetailSheet({ item, open, onOpenChange, onUpdate, onDelete, onSell, onTrade, allItems = [], startInEditMode = false }: ItemDetailSheetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<InventoryItem>>({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);

  // Auto-start edit mode when requested
  React.useEffect(() => {
    if (open && startInEditMode && item && !hasAutoStarted && item.status !== 'sold' && item.status !== 'traded') {
      setEditData({
        name: item.name,
        size: item.size,
        acquisitionCost: item.acquisitionCost,
        askingPrice: item.askingPrice,
        lowestAcceptablePrice: item.lowestAcceptablePrice,
        status: item.status,
        platform: item.platform,
        notes: item.notes,
        imageUrl: item.imageUrl,
        inConvention: item.inConvention,
      });
      setIsEditing(true);
      setHasAutoStarted(true);
    }
    if (!open) {
      setHasAutoStarted(false);
    }
  }, [open, startInEditMode, item, hasAutoStarted]);

  if (!item) return null;

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

      if (isEditing) {
        setEditData({ ...editData, imageUrl: publicUrl });
      } else {
        onUpdate(item.id, { imageUrl: publicUrl });
      }
      toast.success('Image uploaded');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = () => {
    setEditData({
      name: item.name,
      size: item.size,
      acquisitionCost: item.acquisitionCost,
      askingPrice: item.askingPrice,
      lowestAcceptablePrice: item.lowestAcceptablePrice,
      status: item.status,
      platform: item.platform,
      notes: item.notes,
      imageUrl: item.imageUrl,
      inConvention: item.inConvention,
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdate(item.id, editData);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Delete this item?')) {
      onDelete(item.id);
      onOpenChange(false);
    }
  };

  const handleConventionToggle = () => {
    onUpdate(item.id, { inConvention: !item.inConvention });
  };

  const profit = (item.askingPrice || 0) - item.acquisitionCost;
  const margin = (item.askingPrice || 0) > 0 ? ((profit / (item.askingPrice || 1)) * 100).toFixed(0) : '0';
  const isLostItem = ['scammed', 'refunded'].includes(item.status);
  const isTradedItem = item.status === 'traded';
  const currentImageUrl = isEditing ? editData.imageUrl : item.imageUrl;

  // Get traded item info
  const tradedForItem = isTradedItem && item.tradedForItemId 
    ? allItems.find(i => i.id === item.tradedForItemId) 
    : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left">Item Details</SheetTitle>
        </SheetHeader>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {item.status === 'sold' ? (
          <div className="mt-6 space-y-4">
            {item.imageUrl && (
              <img 
                src={item.imageUrl} 
                alt={item.name} 
                className="w-full h-48 object-cover rounded-lg border border-border"
              />
            )}
            <div>
              <h3 className="text-lg font-semibold">{item.name}</h3>
              {item.size && <p className="text-sm text-muted-foreground">Size {item.size}</p>}
            </div>
            <Badge className="bg-chart-2/20 text-chart-2">Sold</Badge>
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Cost</p>
                <p className="font-mono font-semibold">${item.acquisitionCost}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sale Price</p>
                <p className="font-mono font-semibold">${item.salePrice}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Profit</p>
                <p className="font-mono font-semibold text-chart-2">+${(item.salePrice || 0) - item.acquisitionCost}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date Sold</p>
                <p className="font-medium">{item.dateSold}</p>
              </div>
            </div>
            {item.notes && (
              <div>
                <p className="text-xs text-muted-foreground">Notes</p>
                <p className="text-sm">{item.notes}</p>
              </div>
            )}

            <div className="space-y-2">
              {/* Allow fixing old sold items that got their convention flag cleared */}
              <Button
                variant={item.inConvention ? 'secondary' : 'outline'}
                className="w-full"
                onClick={handleConventionToggle}
              >
                <CalendarCheck className="h-4 w-4 mr-2" />
                {item.inConvention ? 'Remove from Convention' : 'Add to Convention'}
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  if (!window.confirm('Mark this item as unsold? This will clear sale price and date sold.')) return;
                  onUpdate(item.id, {
                    status: 'listed',
                    salePrice: null,
                    platformSold: null,
                    dateSold: null,
                  });
                }}
              >
                Mark Unsold
              </Button>
            </div>
          </div>
        ) : isTradedItem ? (
          <div className="mt-6 space-y-4">
            {item.imageUrl && (
              <img 
                src={item.imageUrl} 
                alt={item.name} 
                className="w-full h-48 object-cover rounded-lg border border-border"
              />
            )}
            <div>
              <h3 className="text-lg font-semibold">{item.name}</h3>
              {item.size && <p className="text-sm text-muted-foreground">Size {item.size}</p>}
            </div>
            <Badge className="bg-chart-4/20 text-chart-4">Traded</Badge>
            <div className="p-4 bg-muted rounded-lg space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Original Cost</p>
                <p className="font-mono font-semibold">${item.acquisitionCost}</p>
              </div>
              {tradedForItem && (
                <div>
                  <p className="text-xs text-muted-foreground">Traded For</p>
                  <p className="font-medium">{tradedForItem.name}</p>
                </div>
              )}
              {item.tradeCashDifference !== null && item.tradeCashDifference !== 0 && (
                <div>
                  <p className="text-xs text-muted-foreground">Cash Difference</p>
                  <p className={`font-mono font-semibold ${item.tradeCashDifference > 0 ? 'text-destructive' : 'text-chart-2'}`}>
                    {item.tradeCashDifference > 0 ? `You paid $${item.tradeCashDifference}` : `You received $${Math.abs(item.tradeCashDifference)}`}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : isEditing ? (
          <div className="mt-6 space-y-4">
            <div>
              <Label>Photo</Label>
              {currentImageUrl ? (
                <div className="relative group mt-1">
                  <img 
                    src={currentImageUrl} 
                    alt="Item" 
                    className="w-full h-40 object-cover rounded-lg border border-border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setEditData({ ...editData, imageUrl: null })}
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
            </div>

            <div>
              <Label>Item Name</Label>
              <Input value={editData.name || ''} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
            </div>
            <div>
              <Label>Size</Label>
              <Input value={editData.size || ''} onChange={(e) => setEditData({ ...editData, size: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Cost</Label>
                <Input type="number" value={editData.acquisitionCost || ''} onChange={(e) => setEditData({ ...editData, acquisitionCost: parseFloat(e.target.value) })} />
              </div>
              <div>
                <Label>Asking</Label>
                <Input type="number" value={editData.askingPrice || ''} onChange={(e) => setEditData({ ...editData, askingPrice: parseFloat(e.target.value) })} />
              </div>
              <div>
                <Label>Floor</Label>
                <Input type="number" value={editData.lowestAcceptablePrice || ''} onChange={(e) => setEditData({ ...editData, lowestAcceptablePrice: parseFloat(e.target.value) })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Select value={editData.status} onValueChange={(value: ItemStatus) => setEditData({ ...editData, status: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Platform</Label>
                <Select value={editData.platform} onValueChange={(value: Platform) => setEditData({ ...editData, platform: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {platforms.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={editData.notes || ''} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} rows={3} />
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} className="flex-1"><Save className="h-4 w-4 mr-2" />Save Changes</Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {item.imageUrl ? (
              <img 
                src={item.imageUrl} 
                alt={item.name} 
                className="w-full h-48 object-cover rounded-lg border border-border"
              />
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-muted/50 transition-colors disabled:opacity-50"
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

            <div>
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <div className="flex gap-2 mt-2 flex-wrap">
                {item.size && <Badge variant="outline">Size {item.size}</Badge>}
                <Badge variant="outline" className="capitalize">{item.status.replace(/-/g, ' ')}</Badge>
                {item.inConvention && (
                  <Badge className="bg-primary/10 text-primary">
                    <CalendarCheck className="h-3 w-3 mr-1" />
                    Convention
                  </Badge>
                )}
              </div>
            </div>

            {!isLostItem && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Cost</p>
                    <p className="font-mono text-lg font-semibold">${item.acquisitionCost}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Asking</p>
                    <p className="font-mono text-lg font-semibold">${item.askingPrice || 0}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Floor</p>
                    <p className="font-mono text-lg font-semibold">${item.lowestAcceptablePrice || 0}</p>
                  </div>
                </div>
                <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Potential Profit</p>
                      <p className="font-mono text-xl font-semibold">${profit}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Target Margin</p>
                      <p className="font-mono text-xl font-semibold">{margin}%</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {isLostItem && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive font-medium">Lost ${item.acquisitionCost} - {item.status}</p>
              </div>
            )}

            {item.notes && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                <p className="text-sm bg-muted p-3 rounded-lg">{item.notes}</p>
              </div>
            )}

            {/* Convention Toggle */}
            <Button 
              variant={item.inConvention ? "secondary" : "outline"} 
              className="w-full"
              onClick={handleConventionToggle}
            >
              <CalendarCheck className="h-4 w-4 mr-2" />
              {item.inConvention ? 'Remove from Convention' : 'Add to Convention'}
            </Button>

            <div className="flex gap-3 pt-4 border-t border-border">
              {!isLostItem && (
                <>
                  <Button onClick={() => onSell(item)} className="flex-1">
                    <DollarSign className="h-4 w-4 mr-2" />Record Sale
                  </Button>
                  {onTrade && (
                    <Button variant="outline" onClick={() => onTrade(item)}>
                      <ArrowRightLeft className="h-4 w-4 mr-2" />Trade
                    </Button>
                  )}
                </>
              )}
              <Button variant="outline" onClick={handleEdit}>Edit</Button>
              <Button variant="ghost" size="icon" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
