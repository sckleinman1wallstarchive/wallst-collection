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
      // Get the selected items with their details
      const selectedItems = unassignedItems.filter((item) => selectedIds.has(item.id));

      // Update inventory items with paid_by
      const { error } = await supabase
        .from('inventory_items')
        .update({ paid_by: owner })
        .in('id', Array.from(selectedIds));

      if (error) throw error;

      // If assigned to Spencer or Parker (personal purchase), create contribution entries
      if (owner !== 'Shared') {
        // Check for existing contribution entries to avoid duplicates
        const { data: existingContributions } = await supabase
          .from('transactions')
          .select('reference')
          .eq('type', 'capital_contribution')
          .in('reference', Array.from(selectedIds));

        const existingRefs = new Set((existingContributions || []).map((c) => c.reference));

        // Create contribution entries for items that don't already have one
        const newContributions = selectedItems
          .filter((item) => !existingRefs.has(item.id))
          .map((item) => ({
            type: 'capital_contribution' as const,
            category: owner,
            amount: item.acquisitionCost,
            date: item.dateAdded || new Date().toISOString().split('T')[0],
            description: `Purchase: ${item.name}`,
            reference: item.id,
          }));

        if (newContributions.length > 0) {
          const { error: txError } = await supabase
            .from('transactions')
            .insert(newContributions);

          if (txError) throw txError;

          // Update capital_accounts with the total
          const totalAmount = newContributions.reduce((sum, c) => sum + c.amount, 0);

          const { data: account } = await supabase
            .from('capital_accounts')
            .select('*')
            .maybeSingle();

          if (account) {
            const isSpencer = owner === 'Spencer Kleinman';
            const updateData = isSpencer
              ? { spencer_investment: Number(account.spencer_investment) + totalAmount }
              : { parker_investment: Number(account.parker_investment) + totalAmount };

            await supabase
              .from('capital_accounts')
              .update(updateData)
              .eq('id', account.id);
          }
        }
      }

      toast.success(`Assigned ${selectedIds.size} items to ${owner === 'Shared' ? 'Shared' : owner.split(' ')[0]}`);
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['capital_contributions'] });
      queryClient.invalidateQueries({ queryKey: ['capital_contributions_for_cashflow'] });
      queryClient.invalidateQueries({ queryKey: ['capital_accounts'] });
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
      <DialogContent className="sm:max-w-2xl h-[80vh] max-h-[80vh] overflow-hidden flex flex-col">
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

        <div className="flex-1 min-h-0 overflow-y-auto pr-4 overscroll-contain touch-pan-y">
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
                <div className="flex items-center gap-2">
                  {item.paidBy === 'Spencer Kleinman' && (
                    <Badge variant="outline" className="text-xs">Spencer</Badge>
                  )}
                  {item.paidBy === 'Parker Kleinman' && (
                    <Badge variant="outline" className="text-xs">Parker</Badge>
                  )}
                  {item.paidBy === 'Shared' && (
                    <Badge className="text-xs bg-blue-500/20 text-blue-500 border-0">WSA</Badge>
                  )}
                  <span className="text-sm font-mono text-muted-foreground">
                    {formatCurrency(item.acquisitionCost)}
                  </span>
                </div>
              </div>
            ))}
            {unassignedItems.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No items found
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground font-medium">
            Personal Purchases (before shared account)
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleAssign('Spencer Kleinman')}
              disabled={selectedIds.size === 0 || isAssigning}
            >
              Spencer Paid
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleAssign('Parker Kleinman')}
              disabled={selectedIds.size === 0 || isAssigning}
            >
              Parker Paid
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground font-medium pt-2">
            Shared Account (WSA Bank)
          </div>
          <Button
            onClick={() => handleAssign('Shared')}
            disabled={selectedIds.size === 0 || isAssigning}
            className="w-full"
          >
            Mark as Shared (WSA Account)
          </Button>
          
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
