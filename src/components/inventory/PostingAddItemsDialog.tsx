import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { ImageOff, Search } from 'lucide-react';
import { InventoryItem } from '@/hooks/useSupabaseInventory';

interface PostingAddItemsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platformName: string;
  inventory: InventoryItem[];
  alreadyPostedIds: Set<string>;
  onAddItems: (itemIds: string[]) => void;
}

export function PostingAddItemsDialog({
  open,
  onOpenChange,
  platformName,
  inventory,
  alreadyPostedIds,
  onAddItems,
}: PostingAddItemsDialogProps) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filteredItems = useMemo(() => {
    const activeItems = inventory.filter(
      (item) => !['sold', 'traded', 'scammed', 'refunded'].includes(item.status)
    );
    if (!search.trim()) return activeItems;
    const q = search.toLowerCase();
    return activeItems.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.brand?.toLowerCase().includes(q)
    );
  }, [inventory, search]);

  const toggleItem = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleSubmit = () => {
    if (selected.size === 0) return;
    onAddItems(Array.from(selected));
    setSelected(new Set());
    setSearch('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Items to {platformName}</DialogTitle>
          <DialogDescription>
            Select inventory items to mark as posted on {platformName}
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <ScrollArea className="h-[350px] -mx-2">
          <div className="space-y-1 px-2">
            {filteredItems.map((item) => {
              const isPosted = alreadyPostedIds.has(item.id);
              const isSelected = selected.has(item.id);
              
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                    isPosted
                      ? 'opacity-50 cursor-not-allowed'
                      : isSelected
                      ? 'bg-primary/10'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => !isPosted && toggleItem(item.id)}
                >
                  <Checkbox
                    checked={isPosted || isSelected}
                    disabled={isPosted}
                    className="pointer-events-none"
                  />
                  <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageOff className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.brand} · {item.size}
                    </p>
                  </div>
                  {isPosted && (
                    <span className="text-xs text-muted-foreground">Already posted</span>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-muted-foreground">
            {selected.size} selected
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={selected.size === 0}>
              Add {selected.size > 0 ? `(${selected.size})` : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
