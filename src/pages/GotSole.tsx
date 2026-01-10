import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useSupabaseInventory, InventoryItem } from '@/hooks/useSupabaseInventory';
import { PriceSheetTable } from '@/components/gotsole/PriceSheetTable';
import { SellItemDialog } from '@/components/inventory/SellItemDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Printer, Edit2, Package, DollarSign, TrendingDown, Settings2, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function GotSole() {
  const { inventory, updateItem, markAsSold, getConventionItems } = useSupabaseInventory();
  const [isEditing, setIsEditing] = useState(false);
  const [sellDialogItem, setSellDialogItem] = useState<InventoryItem | null>(null);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter for convention items only
  const conventionItems = getConventionItems();

  const handleUpdateItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      await updateItem(id, updates);
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const handleSellItem = (item: InventoryItem) => {
    setSellDialogItem(item);
    setSellDialogOpen(true);
  };

  const handleSellConfirm = async (id: string, salePrice: number, platformSold?: string) => {
    try {
      await markAsSold(id, salePrice, platformSold as any);
      toast.success('Sale recorded!');
    } catch (error) {
      toast.error('Failed to record sale');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter items by search query
  const filteredItems = conventionItems.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      (item.brand?.toLowerCase().includes(query) ?? false) ||
      (item.size?.toLowerCase().includes(query) ?? false) ||
      (item.notes?.toLowerCase().includes(query) ?? false)
    );
  });

  // Calculate stats from convention items (use all convention items for stats)
  const totalItems = conventionItems.length;
  const totalListValue = conventionItems.reduce((sum, item) => sum + (item.askingPrice || 0), 0);
  const totalFloorValue = conventionItems.reduce((sum, item) => sum + (item.lowestAcceptablePrice || 0), 0);
  const totalCost = conventionItems.reduce((sum, item) => sum + item.acquisitionCost, 0);
  const totalGoalValue = conventionItems.reduce((sum, item) => sum + (item.goalPrice ?? item.askingPrice ?? 0), 0);
  const potentialProfit = totalGoalValue - totalCost;

  const eventDate = 'Saturday, January 11, 2025';

  // Empty state when no items selected
  if (conventionItems.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Got Sole - Price Sheet</h1>
              <p className="text-muted-foreground">{eventDate}</p>
            </div>
          </div>

          <Card className="p-12">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <Package className="h-16 w-16 text-muted-foreground/50" />
              <div>
                <h2 className="text-xl font-semibold">No Items Selected</h2>
                <p className="text-muted-foreground mt-1">
                  You haven't added any items to the convention yet.
                </p>
              </div>
              <Link to="/inventory">
                <Button>
                  <Settings2 className="h-4 w-4 mr-2" />
                  Manage Convention Items
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 print-container">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between no-print">
          <div>
            <h1 className="text-2xl font-bold">Got Sole - Price Sheet</h1>
            <p className="text-muted-foreground">{eventDate}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-48"
              />
            </div>
            <Link to="/inventory">
              <Button variant="outline" size="sm">
                <Settings2 className="h-4 w-4 mr-2" />
                Manage Items
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Switch
                id="edit-mode"
                checked={isEditing}
                onCheckedChange={setIsEditing}
              />
              <Label htmlFor="edit-mode" className="flex items-center gap-1 cursor-pointer">
                <Edit2 className="h-4 w-4" />
                Edit Mode
              </Label>
            </div>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>

        {/* Print header */}
        <div className="hidden print-only">
          <h1 className="text-xl font-bold text-center mb-1">Got Sole - Price Sheet</h1>
          <p className="text-center text-sm mb-4">{eventDate}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 no-print">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Package className="h-4 w-4" />
                Items
              </div>
              <p className="text-2xl font-bold mt-1">{totalItems}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <DollarSign className="h-4 w-4" />
                Total Cost
              </div>
              <p className="text-2xl font-bold mt-1 font-mono">${totalCost.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <DollarSign className="h-4 w-4" />
                List Value
              </div>
              <p className="text-2xl font-bold mt-1 font-mono">${totalListValue.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <TrendingDown className="h-4 w-4" />
                Floor Value
              </div>
              <p className="text-2xl font-bold mt-1 font-mono">${totalFloorValue.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <DollarSign className="h-4 w-4" />
                Goal Profit
              </div>
              <p className={`text-2xl font-bold mt-1 font-mono ${potentialProfit >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
                {potentialProfit >= 0 ? '+' : ''}${potentialProfit.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Editing indicator */}
        {isEditing && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-sm no-print">
            <strong>Edit Mode Active</strong> - Click on List, Goal, Floor prices or Notes to edit. Changes save automatically.
          </div>
        )}

        {/* Table */}
        <PriceSheetTable
          items={filteredItems}
          isEditing={isEditing}
          onUpdateItem={handleUpdateItem}
          onSellItem={handleSellItem}
        />
        
        {/* Search results info */}
        {searchQuery && (
          <p className="text-sm text-muted-foreground no-print">
            Showing {filteredItems.length} of {conventionItems.length} items
          </p>
        )}

        {/* Sell Dialog */}
        <SellItemDialog
          item={sellDialogItem}
          open={sellDialogOpen}
          onOpenChange={setSellDialogOpen}
          onSell={handleSellConfirm}
        />
      </div>
    </DashboardLayout>
  );
}
