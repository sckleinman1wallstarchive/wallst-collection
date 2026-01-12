import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Search } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type ItemOwner = Database['public']['Enums']['item_owner'];

interface AssignPurchasesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

export function AssignPurchasesDialog({ open, onOpenChange }: AssignPurchasesDialogProps) {
  const { inventory } = useSupabaseInventory();
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Filter items that need assignment (paid_by is Shared or not set)
  // Since paid_by is a new column, we need to check from the raw data
  const unassignedItems = useMemo(() => {
    return inventory.filter((item) => {
      // For now, show all items so users can assign historical purchases
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      return matchesSearch;
    });
  }, [inventory, searchQuery]);

  const toggleItem = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleAll = () => {
    if (selectedIds.size === unassignedItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(unassignedItems.map((i) => i.id)));
    }
  };

  const handleAssign = async (owner: ItemOwner) => {
    if (selectedIds.size === 0) return;

    setIsAssigning(true);
    try {
      const { error } = await supabase
        .from('inventory_items')
        .update({ paid_by: owner })
        .in('id', Array.from(selectedIds));

      if (error) throw error;

      toast.success(`Assigned ${selectedIds.size} items to ${owner === 'Shared' ? 'Shared' : owner.split(' ')[0]}`);
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    } catch (error: any) {
      toast.error('Failed to assign items: ' + error.message);
    } finally {
      setIsAssigning(false);
    }
  };

  const selectedTotal = useMemo(() => {
    return unassignedItems
      .filter((i) => selectedIds.has(i.id))
      .reduce((sum, i) => sum + i.acquisitionCost, 0);
  }, [unassignedItems, selectedIds]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Assign Historical Purchases</DialogTitle>
          <DialogDescription>
            Select items and assign who originally paid for them. This helps track each partner's investment before the shared bank account.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center justify-between py-2 border-b border-border">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedIds.size === unassignedItems.length && unassignedItems.length > 0}
              onCheckedChange={toggleAll}
            />
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} of {unassignedItems.length} selected
            </span>
          </div>
          {selectedIds.size > 0 && (
            <Badge variant="secondary" className="font-mono">
              {formatCurrency(selectedTotal)}
            </Badge>
          )}
        </div>

        <ScrollArea className="flex-1 min-h-0 max-h-[300px]">
          <div className="space-y-1">
            {unassignedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                onClick={() => toggleItem(item.id)}
              >
                <Checkbox checked={selectedIds.has(item.id)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.brand} • {item.dateAdded || 'No date'}
                  </p>
                </div>
                <span className="text-sm font-mono text-muted-foreground">
                  {formatCurrency(item.acquisitionCost)}
                </span>
              </div>
            ))}
            {unassignedItems.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No items found
              </p>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-between gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleAssign('Spencer Kleinman')}
              disabled={selectedIds.size === 0 || isAssigning}
            >
              Assign to Spencer
            </Button>
            <Button
              variant="outline"
              onClick={() => handleAssign('Parker Kleinman')}
              disabled={selectedIds.size === 0 || isAssigning}
            >
              Assign to Parker
            </Button>
            <Button
              onClick={() => handleAssign('Shared')}
              disabled={selectedIds.size === 0 || isAssigning}
            >
              Mark as Shared
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
