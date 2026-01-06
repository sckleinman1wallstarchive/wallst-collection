import { useState } from 'react';
import { InventoryItem, ItemCategory, ItemStatus, Platform } from '@/types/inventory';
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
import { Trash2, DollarSign, Save } from 'lucide-react';

interface ItemDetailSheetProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, updates: Partial<InventoryItem>) => void;
  onDelete: (id: string) => void;
  onSell: (item: InventoryItem) => void;
}

const categories: { value: ItemCategory; label: string }[] = [
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'pants', label: 'Pants' },
  { value: 'top', label: 'Top' },
  { value: 'footwear', label: 'Footwear' },
  { value: 'accessory', label: 'Accessory' },
  { value: 'other', label: 'Other' },
];

const statuses: { value: ItemStatus; label: string }[] = [
  { value: 'in-closet', label: 'In Closet' },
  { value: 'listed', label: 'Listed' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'archive-hold', label: 'Archive Hold' },
];

const platforms: { value: Platform; label: string }[] = [
  { value: 'none', label: 'Not Listed' },
  { value: 'grailed', label: 'Grailed' },
  { value: 'depop', label: 'Depop' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'in-person', label: 'In Person' },
];

export function ItemDetailSheet({
  item,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
  onSell,
}: ItemDetailSheetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<InventoryItem>>({});

  if (!item) return null;

  const handleEdit = () => {
    setEditData({
      name: item.name,
      brand: item.brand,
      category: item.category,
      acquisitionCost: item.acquisitionCost,
      askingPrice: item.askingPrice,
      lowestAcceptablePrice: item.lowestAcceptablePrice,
      status: item.status,
      platform: item.platform,
      notes: item.notes,
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

  const profit = item.askingPrice - item.acquisitionCost;
  const margin = ((profit / item.askingPrice) * 100).toFixed(0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left">Item Details</SheetTitle>
        </SheetHeader>

        {item.status === 'sold' ? (
          <div className="mt-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <p className="text-muted-foreground">{item.brand}</p>
            </div>
            <Badge className="bg-chart-2/20 text-chart-3">Sold</Badge>
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
                <p className="font-mono font-semibold text-chart-2">
                  +${(item.salePrice || 0) - item.acquisitionCost}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date Sold</p>
                <p className="font-medium">{item.dateSold}</p>
              </div>
            </div>
            {item.soldTo && (
              <div>
                <p className="text-xs text-muted-foreground">Sold To</p>
                <p className="text-sm">{item.soldTo}</p>
              </div>
            )}
            {item.notes && (
              <div>
                <p className="text-xs text-muted-foreground">Notes</p>
                <p className="text-sm">{item.notes}</p>
              </div>
            )}
          </div>
        ) : isEditing ? (
          <div className="mt-6 space-y-4">
            <div>
              <Label>Item Name</Label>
              <Input
                value={editData.name || ''}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Brand</Label>
                <Input
                  value={editData.brand || ''}
                  onChange={(e) => setEditData({ ...editData, brand: e.target.value })}
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={editData.category}
                  onValueChange={(value: ItemCategory) =>
                    setEditData({ ...editData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Cost</Label>
                <Input
                  type="number"
                  value={editData.acquisitionCost || ''}
                  onChange={(e) =>
                    setEditData({ ...editData, acquisitionCost: parseFloat(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label>Asking</Label>
                <Input
                  type="number"
                  value={editData.askingPrice || ''}
                  onChange={(e) =>
                    setEditData({ ...editData, askingPrice: parseFloat(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label>Floor</Label>
                <Input
                  type="number"
                  value={editData.lowestAcceptablePrice || ''}
                  onChange={(e) =>
                    setEditData({ ...editData, lowestAcceptablePrice: parseFloat(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Select
                  value={editData.status}
                  onValueChange={(value: ItemStatus) =>
                    setEditData({ ...editData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Platform</Label>
                <Select
                  value={editData.platform}
                  onValueChange={(value: Platform) =>
                    setEditData({ ...editData, platform: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={editData.notes || ''}
                onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <p className="text-muted-foreground">{item.brand}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary" className="capitalize">
                  {item.category}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {item.status.replace('-', ' ')}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Cost</p>
                <p className="font-mono text-lg font-semibold">${item.acquisitionCost}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Asking</p>
                <p className="font-mono text-lg font-semibold">${item.askingPrice}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Floor</p>
                <p className="font-mono text-lg font-semibold">${item.lowestAcceptablePrice}</p>
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

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Days Held</p>
                <p className="font-medium">{item.daysHeld} days</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Platform</p>
                <p className="font-medium capitalize">{item.platform === 'none' ? 'Not Listed' : item.platform}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date Added</p>
                <p className="font-medium">{item.dateAdded}</p>
              </div>
            </div>

            {item.notes && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                <p className="text-sm bg-muted p-3 rounded-lg">{item.notes}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-border">
              <Button onClick={() => onSell(item)} className="flex-1">
                <DollarSign className="h-4 w-4 mr-2" />
                Record Sale
              </Button>
              <Button variant="outline" onClick={handleEdit}>
                Edit
              </Button>
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
