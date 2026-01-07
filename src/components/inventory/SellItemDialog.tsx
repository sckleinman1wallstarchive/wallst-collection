import { useState } from 'react';
import { InventoryItem } from '@/hooks/useSupabaseInventory';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SellItemDialogProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSell: (id: string, salePrice: number, platformSold?: string) => void;
}

export function SellItemDialog({ item, open, onOpenChange, onSell }: SellItemDialogProps) {
  const [salePrice, setSalePrice] = useState('');
  const [soldTo, setSoldTo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !salePrice) return;

    const price = parseFloat(salePrice);
    if (isNaN(price)) return;

    onSell(item.id, price, item.platform);
    setSalePrice('');
    setSoldTo('');
    onOpenChange(false);
  };

  if (!item) return null;

  const profit = parseFloat(salePrice) - item.acquisitionCost;
  const margin = salePrice ? ((profit / parseFloat(salePrice)) * 100).toFixed(1) : '0';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Sale</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-muted rounded-lg">
            <p className="font-medium text-sm">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.brand}</p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="p-2 bg-muted/50 rounded">
              <p className="text-xs text-muted-foreground">Cost</p>
              <p className="font-mono font-medium">${item.acquisitionCost}</p>
            </div>
            <div className="p-2 bg-muted/50 rounded">
              <p className="text-xs text-muted-foreground">Asking</p>
              <p className="font-mono font-medium">${item.askingPrice || 0}</p>
            </div>
            <div className="p-2 bg-muted/50 rounded">
              <p className="text-xs text-muted-foreground">Floor</p>
              <p className="font-mono font-medium">${item.lowestAcceptablePrice || 0}</p>
            </div>
          </div>

          <div>
            <Label htmlFor="salePrice">Sale Price</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="salePrice"
                type="number"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder={(item.askingPrice || 0).toString()}
                className="pl-7 text-lg"
                autoFocus
                required
              />
            </div>
          </div>

          {salePrice && (
            <div className="flex gap-4 p-3 bg-muted rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Profit</p>
                <p className={`font-mono font-semibold ${profit >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
                  {profit >= 0 ? '+' : ''}${profit.toFixed(0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Margin</p>
                <p className="font-mono font-semibold">{margin}%</p>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="soldTo">Sold To (optional)</Label>
            <Input
              id="soldTo"
              value={soldTo}
              onChange={(e) => setSoldTo(e.target.value)}
              placeholder="e.g. Grailed buyer @username"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Record Sale</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
