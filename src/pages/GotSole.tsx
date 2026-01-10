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
import { Printer, Edit2, Package, DollarSign, TrendingDown, Settings2, Search, TrendingUp, BarChart3, Percent } from 'lucide-react';
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
  const potentialFloorProfit = totalFloorValue - totalCost;

  // Calculate analytics
  const avgMargin = totalCost > 0 ? Math.round(((totalGoalValue - totalCost) / totalCost) * 100) : 0;
  const avgFloorMargin = totalCost > 0 ? Math.round(((totalFloorValue - totalCost) / totalCost) * 100) : 0;
  const avgItemCost = totalItems > 0 ? Math.round(totalCost / totalItems) : 0;
  const avgItemGoal = totalItems > 0 ? Math.round(totalGoalValue / totalItems) : 0;

  // Category breakdown
  const categoryBreakdown = conventionItems.reduce((acc, item) => {
    const cat = item.category || 'other';
    if (!acc[cat]) {
      acc[cat] = { count: 0, cost: 0, goalValue: 0, floorValue: 0 };
    }
    acc[cat].count++;
    acc[cat].cost += item.acquisitionCost;
    acc[cat].goalValue += item.goalPrice ?? item.askingPrice ?? 0;
    acc[cat].floorValue += item.lowestAcceptablePrice ?? 0;
    return acc;
  }, {} as Record<string, { count: number; cost: number; goalValue: number; floorValue: number }>);

  // Items missing prices
  const missingGoalPrice = conventionItems.filter(i => !i.goalPrice && !i.askingPrice).length;
  const missingFloorPrice = conventionItems.filter(i => !i.lowestAcceptablePrice).length;

  // Price range analysis
  const priceRanges = {
    under50: conventionItems.filter(i => (i.goalPrice ?? i.askingPrice ?? 0) < 50).length,
    '50to100': conventionItems.filter(i => {
      const price = i.goalPrice ?? i.askingPrice ?? 0;
      return price >= 50 && price < 100;
    }).length,
    '100to200': conventionItems.filter(i => {
      const price = i.goalPrice ?? i.askingPrice ?? 0;
      return price >= 100 && price < 200;
    }).length,
    '200to500': conventionItems.filter(i => {
      const price = i.goalPrice ?? i.askingPrice ?? 0;
      return price >= 200 && price < 500;
    }).length,
    over500: conventionItems.filter(i => (i.goalPrice ?? i.askingPrice ?? 0) >= 500).length,
  };

  const categoryLabels: Record<string, string> = {
    footwear: 'Footwear',
    tops: 'Tops',
    bottoms: 'Bottoms',
    outerwear: 'Outerwear',
    accessories: 'Accessories',
    bags: 'Bags',
    other: 'Other',
  };

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

        {/* Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
          {/* Margin Analysis */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-3">
                <Percent className="h-4 w-4" />
                Margin Analysis
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Goal Margin</span>
                  <span className={`font-bold ${avgMargin >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
                    {avgMargin}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Floor Margin</span>
                  <span className={`font-bold ${avgFloorMargin >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
                    {avgFloorMargin}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Floor Profit</span>
                  <span className={`font-bold ${potentialFloorProfit >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
                    ${potentialFloorProfit.toLocaleString()}
                  </span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Avg Cost</span>
                    <span className="font-mono">${avgItemCost}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Avg Goal</span>
                    <span className="font-mono">${avgItemGoal}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-3">
                <BarChart3 className="h-4 w-4" />
                Category Breakdown
              </div>
              <div className="space-y-2">
                {Object.entries(categoryBreakdown)
                  .sort((a, b) => b[1].count - a[1].count)
                  .map(([category, data]) => (
                    <div key={category} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{categoryLabels[category] || category}</span>
                        <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{data.count}</span>
                      </div>
                      <span className="font-mono text-xs">${data.goalValue.toLocaleString()}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Price Distribution & Alerts */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-3">
                <TrendingUp className="h-4 w-4" />
                Price Distribution
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Under $50</span>
                  <span className="font-mono">{priceRanges.under50}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">$50 - $100</span>
                  <span className="font-mono">{priceRanges['50to100']}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">$100 - $200</span>
                  <span className="font-mono">{priceRanges['100to200']}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">$200 - $500</span>
                  <span className="font-mono">{priceRanges['200to500']}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">$500+</span>
                  <span className="font-mono">{priceRanges.over500}</span>
                </div>
              </div>
              {(missingGoalPrice > 0 || missingFloorPrice > 0) && (
                <div className="border-t pt-2 mt-3 space-y-1">
                  {missingGoalPrice > 0 && (
                    <p className="text-xs text-chart-5">{missingGoalPrice} items missing goal/list price</p>
                  )}
                  {missingFloorPrice > 0 && (
                    <p className="text-xs text-chart-5">{missingFloorPrice} items missing floor price</p>
                  )}
                </div>
              )}
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
