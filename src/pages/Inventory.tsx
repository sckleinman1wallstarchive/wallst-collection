import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { AddItemDialog } from '@/components/inventory/AddItemDialog';
import { SellItemDialog } from '@/components/inventory/SellItemDialog';
import { ItemDetailSheet } from '@/components/inventory/ItemDetailSheet';
import { useSupabaseInventory, InventoryItem } from '@/hooks/useSupabaseInventory';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const Inventory = () => {
  const { 
    inventory, 
    isLoading,
    addItem, 
    updateItem, 
    deleteItem, 
    markAsSold,
    getFinancialSummary 
  } = useSupabaseInventory();

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [sellItem, setSellItem] = useState<InventoryItem | null>(null);
  const [sellOpen, setSellOpen] = useState(false);

  const summary = getFinancialSummary();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleItemClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setDetailOpen(true);
  };

  const handleOpenSell = (item: InventoryItem) => {
    setSellItem(item);
    setSellOpen(true);
    setDetailOpen(false);
  };

  const handleAddItem = async (item: Parameters<typeof addItem>[0]) => {
    await addItem(item);
  };

  const handleUpdateItem = async (id: string, updates: Partial<InventoryItem>) => {
    await updateItem(id, updates);
    setSelectedItem(prev => prev ? { ...prev, ...updates } : null);
  };

  const handleDeleteItem = async (id: string) => {
    await deleteItem(id);
    setDetailOpen(false);
    setSelectedItem(null);
  };

  const handleMarkAsSold = async (id: string, salePrice: number, platformSold?: string) => {
    await markAsSold(id, salePrice, platformSold as any);
    setSellOpen(false);
    setSellItem(null);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-48 mt-2" />
            </div>
            <Skeleton className="h-10 w-28" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-6 w-24" />
              </Card>
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {summary.activeItems} active items · {summary.itemsSold} sold
            </p>
          </div>
          <AddItemDialog onAdd={handleAddItem} />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Invested</p>
            <p className="text-xl font-semibold mt-1">{formatCurrency(summary.activeInventoryCost)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Asking Total</p>
            <p className="text-xl font-semibold mt-1">{formatCurrency(summary.potentialRevenue)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Floor Total</p>
            <p className="text-xl font-semibold mt-1">{formatCurrency(summary.minimumRevenue)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Revenue (Sold)</p>
            <p className="text-xl font-semibold mt-1">{formatCurrency(summary.totalRevenue)}</p>
          </Card>
          <Card className="p-4 bg-primary/5">
            <p className="text-xs text-muted-foreground">Profit (Realized)</p>
            <p className="text-xl font-semibold mt-1 text-chart-2">+{formatCurrency(summary.totalProfit)}</p>
          </Card>
        </div>

        <InventoryTable items={inventory} onItemClick={handleItemClick} />

        <ItemDetailSheet
          item={selectedItem}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          onUpdate={handleUpdateItem}
          onDelete={handleDeleteItem}
          onSell={handleOpenSell}
        />

        <SellItemDialog
          item={sellItem}
          open={sellOpen}
          onOpenChange={setSellOpen}
          onSell={handleMarkAsSold}
        />
      </div>
    </DashboardLayout>
  );
};

export default Inventory;
