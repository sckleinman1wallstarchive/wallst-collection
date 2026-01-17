import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { ProgressBar } from '@/components/dashboard/ProgressBar';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, DollarSign, TrendingUp, Clock, AlertTriangle, Ruler, Image, Tag, ChevronDown, ChevronUp, ShoppingBag, Flame, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const Index = () => {
  const { inventory, getFinancialSummary, getActiveItems, getIncompleteItems, updateItem } = useSupabaseInventory();
  const [showSizeList, setShowSizeList] = useState(false);
  const [showPhotoList, setShowPhotoList] = useState(false);
  const [showFloorPriceList, setShowFloorPriceList] = useState(false);
  const [showAskingPriceList, setShowAskingPriceList] = useState(false);
  const [showStagnantList, setShowStagnantList] = useState(false);
  const summary = getFinancialSummary();
  const activeItems = getActiveItems();
  const incompleteItems = getIncompleteItems();
  
  const avgDaysHeld = activeItems.length > 0 
    ? Math.round(activeItems.reduce((sum, i) => sum + (i.daysHeld || 0), 0) / activeItems.length)
    : 0;
  const stagnantItems = activeItems.filter(i => (i.daysHeld || 0) > 30);

  // Recent cops - last 10 items sorted by date_added (or created_at as fallback)
  const recentCops = [...(inventory || [])]
    .filter(i => !['sold', 'traded', 'refunded', 'scammed'].includes(i.status))
    .sort((a, b) => {
      const dateA = a.dateAdded || a.createdAt;
      const dateB = b.dateAdded || b.createdAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    })
    .slice(0, 10);

  // Priority items - marked with priority_sale = true
  const priorityItems = activeItems.filter(i => i.prioritySale);

  // Handler to add priority
  const handleAddPriority = async (itemId: string) => {
    await updateItem(itemId, { prioritySale: true });
  };

  // Handler to remove priority
  const removePriority = async (itemId: string) => {
    await updateItem(itemId, { prioritySale: false });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const monthlyTarget = 8333;
  const stretchTarget = 10000;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
            <p className="text-muted-foreground text-sm mt-1">
              January 2025 · Week 2
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Active Items"
            value={summary.activeItems}
            subtitle={`${formatCurrency(summary.activeInventoryCost)} invested`}
            icon={<Package className="h-4 w-4" />}
          />
          <StatCard
            title="Potential Revenue"
            value={formatCurrency(summary.potentialRevenue)}
            subtitle={`Floor: ${formatCurrency(summary.minimumRevenue)}`}
            icon={<DollarSign className="h-4 w-4" />}
          />
          <StatCard
            title="Realized Profit"
            value={formatCurrency(summary.totalProfit)}
            subtitle={`${summary.itemsSold} items sold`}
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <StatCard
            title="Avg Days Held"
            value={avgDaysHeld}
            subtitle={`${stagnantItems.length} items over 30 days`}
            icon={<Clock className="h-4 w-4" />}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress Section */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-medium">Monthly Goals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Revenue Target</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(summary.totalRevenue)} / {formatCurrency(monthlyTarget)}
                  </span>
                </div>
                <ProgressBar
                  value={summary.totalRevenue}
                  max={monthlyTarget}
                  showPercentage={false}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Stretch Target</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(summary.totalRevenue)} / {formatCurrency(stretchTarget)}
                  </span>
                </div>
                <ProgressBar
                  value={summary.totalRevenue}
                  max={stretchTarget}
                  showPercentage={false}
                />
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Avg Margin</p>
                  <p className="text-lg font-semibold">{summary.avgMargin}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Profit</p>
                  <p className="text-lg font-semibold">{formatCurrency(summary.totalProfit)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Items Sold</p>
                  <p className="text-lg font-semibold">{summary.itemsSold}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerts Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Attention Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Critical: Stagnant items */}
              {stagnantItems.length > 0 && (
                <Collapsible open={showStagnantList} onOpenChange={setShowStagnantList}>
                  <CollapsibleTrigger className="w-full text-left p-3 rounded-md bg-destructive/10 border border-destructive/20 hover:bg-destructive/15 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-destructive" />
                        <p className="text-sm font-medium">{stagnantItems.length} items over 30 days</p>
                      </div>
                      {showStagnantList ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Consider price drops or relisting
                    </p>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 max-h-48 overflow-y-auto space-y-1">
                    {stagnantItems.map((item) => (
                      <Link
                        key={item.id}
                        to={`/inventory?item=${item.id}&edit=true`}
                        className="block px-3 py-2 text-xs rounded bg-muted/50 hover:bg-muted transition-colors truncate"
                      >
                        {item.name} ({item.daysHeld} days)
                      </Link>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Warning: Missing sizes */}
              {incompleteItems.missingSize.length > 0 && (
                <Collapsible open={showSizeList} onOpenChange={setShowSizeList}>
                  <CollapsibleTrigger className="w-full text-left p-3 rounded-md bg-chart-5/10 border border-chart-5/20 hover:bg-chart-5/15 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Ruler className="h-4 w-4 text-chart-5" />
                        <p className="text-sm font-medium">{incompleteItems.missingSize.length} items need sizes</p>
                      </div>
                      {showSizeList ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Click to view all items
                    </p>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 max-h-48 overflow-y-auto space-y-1">
                    {incompleteItems.missingSize.map((item) => (
                      <Link
                        key={item.id}
                        to={`/inventory?item=${item.id}&edit=true`}
                        className="block px-3 py-2 text-xs rounded bg-muted/50 hover:bg-muted transition-colors truncate"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Warning: Missing photos */}
              {incompleteItems.missingImage.length > 0 && (
                <Collapsible open={showPhotoList} onOpenChange={setShowPhotoList}>
                  <CollapsibleTrigger className="w-full text-left p-3 rounded-md bg-chart-5/10 border border-chart-5/20 hover:bg-chart-5/15 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Image className="h-4 w-4 text-chart-5" />
                        <p className="text-sm font-medium">{incompleteItems.missingImage.length} items need photos</p>
                      </div>
                      {showPhotoList ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Click to view all items
                    </p>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 max-h-48 overflow-y-auto space-y-1">
                    {incompleteItems.missingImage.map((item) => (
                      <Link
                        key={item.id}
                        to={`/inventory?item=${item.id}&edit=true`}
                        className="block px-3 py-2 text-xs rounded bg-muted/50 hover:bg-muted transition-colors truncate"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Warning: Missing floor prices */}
              {incompleteItems.missingFloorPrice.length > 0 && (
                <Collapsible open={showFloorPriceList} onOpenChange={setShowFloorPriceList}>
                  <CollapsibleTrigger className="w-full text-left p-3 rounded-md bg-chart-5/10 border border-chart-5/20 hover:bg-chart-5/15 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-chart-5" />
                        <p className="text-sm font-medium">{incompleteItems.missingFloorPrice.length} items need floor prices</p>
                      </div>
                      {showFloorPriceList ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Click to view all items
                    </p>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 max-h-48 overflow-y-auto space-y-1">
                    {incompleteItems.missingFloorPrice.map((item) => (
                      <Link
                        key={item.id}
                        to={`/inventory?item=${item.id}&edit=true`}
                        className="block px-3 py-2 text-xs rounded bg-muted/50 hover:bg-muted transition-colors truncate"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Warning: Missing asking prices */}
              {incompleteItems.missingAskingPrice.length > 0 && (
                <Collapsible open={showAskingPriceList} onOpenChange={setShowAskingPriceList}>
                  <CollapsibleTrigger className="w-full text-left p-3 rounded-md bg-chart-5/10 border border-chart-5/20 hover:bg-chart-5/15 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-chart-5" />
                        <p className="text-sm font-medium">{incompleteItems.missingAskingPrice.length} items need asking prices</p>
                      </div>
                      {showAskingPriceList ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Click to view all items
                    </p>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 max-h-48 overflow-y-auto space-y-1">
                    {incompleteItems.missingAskingPrice.map((item) => (
                      <Link
                        key={item.id}
                        to={`/inventory?item=${item.id}&edit=true`}
                        className="block px-3 py-2 text-xs rounded bg-muted/50 hover:bg-muted transition-colors truncate"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Info: Weekly meeting */}
              <Link to="/tasks" className="block p-3 rounded-md bg-muted border border-border hover:bg-muted/80 transition-colors">
                <p className="text-sm font-medium">Weekly meeting</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Set agenda for Sunday sync
                </p>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Cops & Need Gone Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Cops */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Recent Cops
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2 pr-4">
                  {recentCops.length > 0 ? (
                    recentCops.map((item) => (
                      <Link
                        key={item.id}
                        to={`/inventory?item=${item.id}`}
                        className="flex justify-between items-center p-2 rounded hover:bg-muted transition-colors"
                      >
                        <span className="text-sm truncate flex-1">{item.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {formatCurrency(item.acquisitionCost)}
                        </span>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No recent purchases</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Need Gone */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                Need Gone
              </CardTitle>
              <Select onValueChange={handleAddPriority}>
                <SelectTrigger className="w-[180px] h-8">
                  <SelectValue placeholder="Add item..." />
                </SelectTrigger>
                <SelectContent>
                  {activeItems.filter(i => !i.prioritySale).map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2 pr-4">
                  {priorityItems.length > 0 ? (
                    priorityItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center p-2 rounded bg-orange-500/10 border border-orange-500/20"
                      >
                        <Link
                          to={`/inventory?item=${item.id}`}
                          className="text-sm truncate flex-1 hover:underline"
                        >
                          {item.name}
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 ml-2"
                          onClick={() => removePriority(item.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No priority items. Use the dropdown to add items you need to move fast.
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
