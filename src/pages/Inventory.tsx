import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { AddItemDialog } from '@/components/inventory/AddItemDialog';
import { SellItemDialog } from '@/components/inventory/SellItemDialog';
import { ItemDetailSheet } from '@/components/inventory/ItemDetailSheet';
import { useInventory } from '@/hooks/useInventory';
import { InventoryItem } from '@/types/inventory';
import { Card } from '@/components/ui/card';

const Inventory = () => {
  const { 
    inventory, 
    addItem, 
    updateItem, 
    deleteItem, 
    markAsSold,
    getFinancialSummary 
  } = useInventory();

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
          <AddItemDialog onAdd={addItem} />
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
          onUpdate={updateItem}
          onDelete={deleteItem}
          onSell={handleOpenSell}
        />

        <SellItemDialog
          item={sellItem}
          open={sellOpen}
          onOpenChange={setSellOpen}
          onSell={markAsSold}
        />
      </div>
    </DashboardLayout>
  );
};

export default Inventory;
