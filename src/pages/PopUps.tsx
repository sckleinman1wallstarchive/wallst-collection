import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useSupabaseInventory, InventoryItem } from '@/hooks/useSupabaseInventory';
import { useExpenses } from '@/hooks/useExpenses';
import { PriceSheetTable } from '@/components/gotsole/PriceSheetTable';
import { SellItemDialog } from '@/components/inventory/SellItemDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Printer, Edit2, Package, DollarSign, TrendingDown, Settings2, Search, Percent, ArrowLeft, Plus, Calendar, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

type ViewState = 'hub' | 'got-sole';

export default function PopUps() {
  const { inventory, updateItem, markAsSold, getConventionItems, getConventionSoldItems } = useSupabaseInventory();
  const { getTotalPopUpExpenses } = useExpenses();
  const [viewState, setViewState] = useState<ViewState>('hub');
  const [isEditing, setIsEditing] = useState(false);
  const [sellDialogItem, setSellDialogItem] = useState<InventoryItem | null>(null);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'active' | 'sold'>('active');

  // Get all convention-related items (including sold ones with everInConvention)
  const conventionItems = getConventionItems();
  const soldConventionItems = getConventionSoldItems();
  
  // All items that ever participated in conventions
  const allConventionHistoryItems = inventory.filter(item => item.everInConvention);

  // Pop-up expenses
  const popUpExpenses = getTotalPopUpExpenses();

  // Hub analytics
  // Total Invested = ALL convention COGS (sold + unsold) + pop-up expenses
  const allConventionCOGS = allConventionHistoryItems.reduce((sum, item) => sum + item.acquisitionCost, 0);
  const totalInvested = allConventionCOGS + popUpExpenses;

  const inventoryCost = allConventionHistoryItems
    .filter(i => !['sold', 'traded', 'scammed', 'refunded'].includes(i.status))
    .reduce((sum, item) => sum + item.acquisitionCost, 0);
  
  const soldRevenue = soldConventionItems.reduce((sum, item) => sum + (item.salePrice || 0), 0);
  const soldCOGS = soldConventionItems.reduce((sum, item) => sum + item.acquisitionCost, 0);
  const totalProfit = soldRevenue - soldCOGS;
  const averageMargin = soldRevenue > 0 ? Math.round((totalProfit / soldRevenue) * 100) : 0;

  // Got Sole specific stats
  const gotSoleDate = 'January 11, 2025';
  const gotSoleEndDate = new Date('2025-01-11'); // Convention end date
  const gotSoleItemsSold = soldConventionItems.length;
  const gotSoleProfit = totalProfit;

  // Auto-release convention items 2 days after the event
  useEffect(() => {
    const releaseDays = 2;
    const releaseDate = new Date(gotSoleEndDate);
    releaseDate.setDate(releaseDate.getDate() + releaseDays);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    releaseDate.setHours(0, 0, 0, 0);
    
    if (today > releaseDate && conventionItems.length > 0) {
      // Bulk update to release items from convention
      conventionItems.forEach(item => {
        updateItem(item.id, { inConvention: false });
      });
    }
  }, [conventionItems, updateItem]);

  // Auto-switch to 'sold' view when there are no active items
  useEffect(() => {
    if (conventionItems.length === 0 && viewMode === 'active') {
      setViewMode('sold');
    }
  }, [conventionItems.length, viewMode]);

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
  const displayItems = viewMode === 'active' ? conventionItems : soldConventionItems;
  const filteredItems = displayItems.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      (item.brand?.toLowerCase().includes(query) ?? false) ||
      (item.size?.toLowerCase().includes(query) ?? false) ||
      (item.notes?.toLowerCase().includes(query) ?? false)
    );
  });

  // Price sheet stats
  const totalItems = conventionItems.length;
  const totalListValue = conventionItems.reduce((sum, item) => sum + (item.askingPrice || 0), 0);
  const totalFloorValue = conventionItems.reduce((sum, item) => sum + (item.lowestAcceptablePrice || 0), 0);
  const totalCost = conventionItems.reduce((sum, item) => sum + item.acquisitionCost, 0);
  const totalGoalValue = conventionItems.reduce((sum, item) => sum + (item.goalPrice ?? item.askingPrice ?? 0), 0);
  const potentialProfit = totalGoalValue - totalCost;

  // Sold stats
  const soldTotalSales = soldConventionItems.reduce((sum, item) => sum + (item.salePrice || 0), 0);
  const soldProfitMargin = soldTotalSales > 0 ? Math.round(((soldTotalSales - soldCOGS) / soldTotalSales) * 100) : 0;

  // Hub View
  if (viewState === 'hub') {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold">Pop Ups</h1>
            <p className="text-muted-foreground">Manage your convention and pop-up events</p>
          </div>

          {/* Analytics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <DollarSign className="h-4 w-4" />
                  Total Invested
                </div>
                <p className="text-2xl font-bold mt-1 font-mono">${totalInvested.toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <TrendingUp className="h-4 w-4" />
                  Total Profit
                </div>
                <p className={`text-2xl font-bold mt-1 font-mono ${totalProfit >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
                  {totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <Percent className="h-4 w-4" />
                  Average Margin
                </div>
                <p className={`text-2xl font-bold mt-1 ${averageMargin >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
                  {averageMargin}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <Package className="h-4 w-4" />
                  Inventory Cost
                </div>
                <p className="text-2xl font-bold mt-1 font-mono">${inventoryCost.toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <DollarSign className="h-4 w-4" />
                  Pop-Up Expenses
                </div>
                <p className="text-2xl font-bold mt-1 font-mono">${popUpExpenses.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>

          {/* Events Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Got Sole Card */}
              <Card 
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setViewState('got-sole')}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Got Sole</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {gotSoleDate}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Items Sold</span>
                      <span className="font-medium">{gotSoleItemsSold}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Profit</span>
                      <span className={`font-medium ${gotSoleProfit >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
                        {gotSoleProfit >= 0 ? '+' : ''}${gotSoleProfit.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Active Items</span>
                      <span className="font-medium">{conventionItems.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Add Event Placeholder */}
              <Card 
                className="cursor-pointer border-dashed hover:border-primary/50 transition-colors flex items-center justify-center min-h-[180px]"
                onClick={() => toast.info('Coming soon! Multiple events support will be added in a future update.')}
              >
                <div className="flex flex-col items-center text-muted-foreground">
                  <Plus className="h-8 w-8 mb-2" />
                  <span className="font-medium">Add Event</span>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Got Sole Price Sheet View
  const eventDate = 'Saturday, January 11, 2025';

  // Empty state when no items selected
  if (conventionItems.length === 0 && soldConventionItems.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setViewState('hub')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
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
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setViewState('hub')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Got Sole - Price Sheet</h1>
              <p className="text-muted-foreground">{eventDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {conventionItems.length > 0 ? (
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'active' | 'sold')}>
                <TabsList>
                  <TabsTrigger value="active">
                    Active ({conventionItems.length})
                  </TabsTrigger>
                  <TabsTrigger value="sold">
                    Sold ({soldConventionItems.length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            ) : (
              <div className="text-sm text-muted-foreground">
                Sold ({soldConventionItems.length})
              </div>
            )}
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
                {viewMode === 'active' ? 'Items' : 'Items Sold'}
              </div>
              <p className="text-2xl font-bold mt-1">
                {viewMode === 'active' ? totalItems : soldConventionItems.length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <DollarSign className="h-4 w-4" />
                {viewMode === 'active' ? 'Total Cost' : 'COGS'}
              </div>
              <p className="text-2xl font-bold mt-1 font-mono">
                ${viewMode === 'active' ? totalCost.toLocaleString() : soldCOGS.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <DollarSign className="h-4 w-4" />
                {viewMode === 'active' ? 'List Value' : 'Total Sales'}
              </div>
              <p className="text-2xl font-bold mt-1 font-mono">
                ${viewMode === 'active' ? totalListValue.toLocaleString() : soldTotalSales.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                {viewMode === 'active' ? (
                  <TrendingDown className="h-4 w-4" />
                ) : (
                  <DollarSign className="h-4 w-4" />
                )}
                {viewMode === 'active' ? 'Floor Value' : 'Profit'}
              </div>
              {viewMode === 'active' ? (
                <p className="text-2xl font-bold mt-1 font-mono">${totalFloorValue.toLocaleString()}</p>
              ) : (
                <p
                  className={`text-2xl font-bold mt-1 font-mono ${totalProfit >= 0 ? 'text-chart-2' : 'text-destructive'}`}
                >
                  {totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Percent className="h-4 w-4" />
                {viewMode === 'active' ? 'Goal Profit' : 'Profit Margin'}
              </div>
              {viewMode === 'active' ? (
                <p
                  className={`text-2xl font-bold mt-1 font-mono ${potentialProfit >= 0 ? 'text-chart-2' : 'text-destructive'}`}
                >
                  {potentialProfit >= 0 ? '+' : ''}${potentialProfit.toLocaleString()}
                </p>
              ) : (
                <p
                  className={`text-2xl font-bold mt-1 ${soldProfitMargin >= 0 ? 'text-chart-2' : 'text-destructive'}`}
                >
                  {soldProfitMargin}%
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Margin Analysis Bar */}
        <Card className="no-print">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-3">
              <Percent className="h-4 w-4" />
              {viewMode === 'active' ? 'Projected Margins' : 'Sold Statistics'}
            </div>
            {viewMode === 'active' ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Total Cost</span>
                  <p className="text-xl font-bold font-mono">${totalCost.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">List Value</span>
                  <p className="text-xl font-bold font-mono">${totalListValue.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Goal Value</span>
                  <p className="text-xl font-bold font-mono">${totalGoalValue.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Floor Value</span>
                  <p className="text-xl font-bold font-mono">${totalFloorValue.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Goal Profit</span>
                  <p className={`text-xl font-bold ${potentialProfit >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
                    {potentialProfit >= 0 ? '+' : ''}${potentialProfit.toLocaleString()}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Total Sales</span>
                  <p className="text-xl font-bold font-mono">${soldTotalSales.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">COGS</span>
                  <p className="text-xl font-bold font-mono">${soldCOGS.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Profit</span>
                  <p className={`text-xl font-bold font-mono ${totalProfit >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
                    {totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Profit Margin</span>
                  <p className={`text-xl font-bold ${soldProfitMargin >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
                    {soldProfitMargin}%
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Items Sold</span>
                  <p className="text-xl font-bold">{soldConventionItems.length}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

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
            Showing {filteredItems.length} of {displayItems.length} items
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