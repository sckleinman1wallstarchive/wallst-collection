import { useState, useEffect } from 'react';
import { Loader2, Search, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface AssignBrandItemsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brandId: string;
  brandName: string;
}

interface InventoryItem {
  id: string;
  name: string;
  brand: string | null;
  askingPrice: number | null;
  imageUrl: string | null;
}

export function AssignBrandItemsDialog({
  open,
  onOpenChange,
  brandId,
  brandName,
}: AssignBrandItemsDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  // Fetch all for-sale items
  const { data: allItems, isLoading: itemsLoading } = useQuery({
    queryKey: ['inventory-for-assignment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('id, name, brand, asking_price, image_url, image_urls')
        .eq('status', 'for-sale')
        .order('name');
      
      if (error) throw error;
      return (data || []).map((item) => ({
        id: item.id,
        name: item.name,
        brand: item.brand,
        askingPrice: item.asking_price,
        imageUrl: item.image_urls?.[0] || item.image_url,
      }));
    },
    enabled: open,
  });

  // Fetch currently assigned items for this brand
  const { data: assignedItems, isLoading: assignedLoading } = useQuery({
    queryKey: ['brand-assigned-items', brandId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('storefront_brand_items')
        .select('inventory_item_id')
        .eq('brand_id', brandId);
      
      if (error) throw error;
      return new Set((data || []).map((row) => row.inventory_item_id));
    },
    enabled: open && !!brandId,
  });

  // Initialize selected items when dialog opens
  useEffect(() => {
    if (assignedItems) {
      setSelectedIds(new Set(assignedItems));
    }
  }, [assignedItems]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      // Delete all current assignments for this brand
      await supabase
        .from('storefront_brand_items')
        .delete()
        .eq('brand_id', brandId);

      // Insert new assignments
      if (selectedIds.size > 0) {
        const assignments = Array.from(selectedIds).map((itemId, index) => ({
          brand_id: brandId,
          inventory_item_id: itemId,
          display_order: index,
        }));
        
        const { error } = await supabase
          .from('storefront_brand_items')
          .insert(assignments);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-assigned-items', brandId] });
      queryClient.invalidateQueries({ queryKey: ['storefront-brands'] });
      toast.success(`Updated items for ${brandName}`);
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Failed to save assignments');
    },
  });

  const toggleItem = (itemId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const filteredItems = allItems?.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.brand?.toLowerCase().includes(query)
    );
  });

  const isLoading = itemsLoading || assignedLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign Items to {brandName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items..."
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ScrollArea className="h-[350px] rounded-md border p-2">
              <div className="space-y-1">
                {filteredItems?.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedIds.has(item.id)}
                      onCheckedChange={() => toggleItem(item.id)}
                    />
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.brand || 'No brand'} • ${item.askingPrice?.toFixed(0) || 'TBD'}
                      </p>
                    </div>
                    {selectedIds.has(item.id) && (
                      <Check className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </label>
                ))}
                {filteredItems?.length === 0 && (
                  <p className="text-center text-muted-foreground py-4 text-sm">
                    No items found
                  </p>
                )}
              </div>
            </ScrollArea>
          )}

          <p className="text-sm text-muted-foreground">
            {selectedIds.size} item{selectedIds.size !== 1 ? 's' : ''} selected
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Save Assignments
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
