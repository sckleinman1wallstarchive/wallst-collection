import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { AddItemDialog } from '@/components/inventory/AddItemDialog';
import { SellItemDialog } from '@/components/inventory/SellItemDialog';
import { ItemDetailSheet } from '@/components/inventory/ItemDetailSheet';
import { TradeItemDialog } from '@/components/inventory/TradeItemDialog';
import { useSupabaseInventory, InventoryItem } from '@/hooks/useSupabaseInventory';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Database } from '@/integrations/supabase/types';
import { CalendarCheck, Package } from 'lucide-react';
import { toast } from 'sonner';

type ItemStatus = Database['public']['Enums']['item_status'];

const statusLabels: Record<string, string> = {
  'in-closet': 'In Closet',
  'in-closet-parker': 'In Closet (Parker)',
  'in-closet-spencer': 'In Closet (Spencer)',
  'listed': 'Listed',
  'sold': 'Sold',
  'otw': 'OTW',
  'refunded': 'Refunded',
  'traded': 'Traded',
  'shipped': 'Shipped',
  'archive-hold': 'Archive',
  'scammed': 'Scammed',
};

interface StatusSummary {
  status: string;
  label: string;
  count: number;
  totalCost: number;
  totalAsking: number;
  totalFloor: number;
  totalRevenue: number;
  totalProfit: number;
}

const Inventory = () => {
  const { 
    inventory, 
    isLoading,
    addItem, 
    updateItem, 
    deleteItem, 
    markAsSold,
    markAsTraded,
    toggleConvention,
    getFinancialSummary,
    getConventionItems,
  } = useSupabaseInventory();

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [sellItem, setSellItem] = useState<InventoryItem | null>(null);
  const [sellOpen, setSellOpen] = useState(false);
  const [tradeItem, setTradeItem] = useState<InventoryItem | null>(null);
  const [tradeOpen, setTradeOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [conventionMode, setConventionMode] = useState(false);

  const summary = getFinancialSummary();
  const conventionItems = getConventionItems();

  // Calculate summaries by status
  const statusSummaries = useMemo((): StatusSummary[] => {
    const summaryMap = new Map<string, StatusSummary>();
    
    inventory.forEach((item) => {
      const status = item.status;
      const existing = summaryMap.get(status) || {
        status,
        label: statusLabels[status] || status,
        count: 0,
        totalCost: 0,
        totalAsking: 0,
        totalFloor: 0,
        totalRevenue: 0,
        totalProfit: 0,
      };
      
      existing.count += 1;
      existing.totalCost += item.acquisitionCost;
      existing.totalAsking += item.askingPrice || 0;
      existing.totalFloor += item.lowestAcceptablePrice || 0;
      
      if (status === 'sold') {
        existing.totalRevenue += item.salePrice || 0;
        existing.totalProfit += (item.salePrice || 0) - item.acquisitionCost;
      }
      
      summaryMap.set(status, existing);
    });
    
    // Order: active statuses first, then sold, then issues
    const order = ['in-closet-parker', 'in-closet-spencer', 'in-closet', 'listed', 'otw', 'shipped', 'sold', 'traded', 'refunded', 'scammed', 'archive-hold'];
    return order
      .filter(s => summaryMap.has(s))
      .map(s => summaryMap.get(s)!);
  }, [inventory]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleItemClick = (item: InventoryItem) => {
    if (conventionMode) return; // Don't open detail in convention mode
    setSelectedItem(item);
    setDetailOpen(true);
  };

  const handleOpenSell = (item: InventoryItem) => {
    setSellItem(item);
    setSellOpen(true);
    setDetailOpen(false);
  };

  const handleOpenTrade = (item: InventoryItem) => {
    setTradeItem(item);
    setTradeOpen(true);
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

  const handleMarkAsTraded = async (
    id: string, 
    tradedForItemId: string | null, 
    cashDifference: number
  ) => {
    await markAsTraded(id, tradedForItemId, cashDifference);
    setTradeOpen(false);
    setTradeItem(null);
    toast.success('Trade recorded!');
  };

  const handleConventionToggle = async (id: string, inConvention: boolean) => {
    await toggleConvention(id, inConvention);
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
          <div className="flex items-center gap-4">
            {/* Convention Mode Toggle */}
            <div className="flex items-center gap-2">
              <Switch
                id="convention-mode"
                checked={conventionMode}
                onCheckedChange={setConventionMode}
              />
              <Label htmlFor="convention-mode" className="flex items-center gap-1.5 cursor-pointer">
                <CalendarCheck className="h-4 w-4" />
                Convention Mode
              </Label>
            </div>
            <AddItemDialog onAdd={handleAddItem} />
          </div>
        </div>

        {/* Convention Mode Banner */}
        {conventionMode && (
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Convention Mode Active</p>
                  <p className="text-sm text-muted-foreground">
                    Check items to add them to your convention price sheet
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{conventionItems.length}</p>
                <p className="text-xs text-muted-foreground">items selected</p>
              </div>
            </div>
          </Card>
        )}

        {/* Status Totals - Clickable Cards */}
        {!conventionMode && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Status Breakdown</p>
              {selectedStatus && (
                <button 
                  onClick={() => setSelectedStatus(null)}
                  className="text-xs text-primary hover:underline"
                >
                  Clear selection
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {statusSummaries.map((s) => {
                const isSelected = selectedStatus === s.status;
                const isSold = s.status === 'sold';
                
                return (
                  <Card 
                    key={s.status}
                    onClick={() => setSelectedStatus(isSelected ? null : s.status)}
                    className={cn(
                      "p-3 cursor-pointer transition-all hover:ring-2 hover:ring-primary/50",
                      isSelected && "ring-2 ring-primary bg-primary/5"
                    )}
                  >
                    <p className="text-xs text-muted-foreground truncate">{s.label}</p>
                    <p className="text-lg font-semibold mt-0.5">{s.count} items</p>
                    <div className="mt-2 pt-2 border-t space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Cost</span>
                        <span className="font-mono">{formatCurrency(s.totalCost)}</span>
                      </div>
                      {isSold ? (
                        <>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Revenue</span>
                            <span className="font-mono">{formatCurrency(s.totalRevenue)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Profit</span>
                            <span className="font-mono text-chart-2">+{formatCurrency(s.totalProfit)}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Asking</span>
                            <span className="font-mono">{formatCurrency(s.totalAsking)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Floor</span>
                            <span className="font-mono">{formatCurrency(s.totalFloor)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Status Detail */}
        {selectedStatus && !conventionMode && (
          <Card className="p-4 bg-primary/5 border-primary/20">
            {(() => {
              const s = statusSummaries.find(x => x.status === selectedStatus);
              if (!s) return null;
              const isSold = s.status === 'sold';
              const potentialProfit = s.totalAsking - s.totalCost;
              
              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{s.label} Summary</h3>
                    <span className="text-sm text-muted-foreground">{s.count} items</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Cost</p>
                      <p className="text-xl font-semibold">{formatCurrency(s.totalCost)}</p>
                    </div>
                    {isSold ? (
                      <>
                        <div>
                          <p className="text-xs text-muted-foreground">Total Revenue</p>
                          <p className="text-xl font-semibold">{formatCurrency(s.totalRevenue)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total Profit</p>
                          <p className="text-xl font-semibold text-chart-2">+{formatCurrency(s.totalProfit)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Margin</p>
                          <p className="text-xl font-semibold">
                            {s.totalRevenue > 0 ? ((s.totalProfit / s.totalRevenue) * 100).toFixed(1) : 0}%
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="text-xs text-muted-foreground">Total Asking</p>
                          <p className="text-xl font-semibold">{formatCurrency(s.totalAsking)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total Floor</p>
                          <p className="text-xl font-semibold">{formatCurrency(s.totalFloor)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Potential Profit</p>
                          <p className="text-xl font-semibold text-chart-2">+{formatCurrency(potentialProfit)}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })()}
          </Card>
        )}

        <InventoryTable 
          items={inventory} 
          onItemClick={handleItemClick}
          selectionMode={conventionMode}
          onConventionToggle={handleConventionToggle}
          onUpdateItem={handleUpdateItem}
        />

        <ItemDetailSheet
          item={selectedItem}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          onUpdate={handleUpdateItem}
          onDelete={handleDeleteItem}
          onSell={handleOpenSell}
          onTrade={handleOpenTrade}
          allItems={inventory}
        />

        <SellItemDialog
          item={sellItem}
          open={sellOpen}
          onOpenChange={setSellOpen}
          onSell={handleMarkAsSold}
        />

        <TradeItemDialog
          item={tradeItem}
          open={tradeOpen}
          onOpenChange={setTradeOpen}
          availableItems={inventory}
          onTrade={handleMarkAsTraded}
        />
      </div>
    </DashboardLayout>
  );
};

export default Inventory;
