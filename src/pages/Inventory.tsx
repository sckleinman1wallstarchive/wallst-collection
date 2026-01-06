import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { mockInventory } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Inventory = () => {
  const activeItems = mockInventory.filter(i => i.status !== 'sold');
  const totalValue = activeItems.reduce((sum, i) => sum + i.acquisitionCost, 0);
  const potentialProfit = activeItems.reduce((sum, i) => sum + (i.askingPrice - i.acquisitionCost), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {activeItems.length} items · {formatCurrency(totalValue)} invested · {formatCurrency(potentialProfit)} potential profit
            </p>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>

        <InventoryTable items={mockInventory} />
      </div>
    </DashboardLayout>
  );
};

export default Inventory;
