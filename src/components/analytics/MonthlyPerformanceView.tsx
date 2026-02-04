import { useState } from 'react';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronDown, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface MonthlyPerformanceViewProps {
  onBack: () => void;
}

interface MonthData {
  month: string;
  monthLabel: string;
  revenue: number;
  cogs: number;
  profit: number;
  itemsSold: number;
  items: Array<{
    id: string;
    name: string;
    salePrice: number;
    acquisitionCost: number;
    profit: number;
    dateSold: string;
  }>;
}

export function MonthlyPerformanceView({ onBack }: MonthlyPerformanceViewProps) {
  const { inventory } = useSupabaseInventory();
  const [expandedMonths, setExpandedMonths] = useState<string[]>([]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Group sold items by month
  const soldItems = inventory.filter(i => i.status === 'sold' && i.dateSold);
  
  const monthlyData: MonthData[] = soldItems.reduce((acc, item) => {
    const dateSold = item.dateSold ? parseISO(item.dateSold) : new Date();
    const monthKey = format(dateSold, 'yyyy-MM');
    const monthLabel = format(dateSold, 'MMMM yyyy');
    
    const revenue = (item.salePrice || 0) + 
      (item.tradeCashDifference && item.tradeCashDifference < 0 
        ? Math.abs(item.tradeCashDifference) : 0);
    const profit = revenue - item.acquisitionCost;

    const existing = acc.find(m => m.month === monthKey);
    if (existing) {
      existing.revenue += revenue;
      existing.cogs += item.acquisitionCost;
      existing.profit += profit;
      existing.itemsSold += 1;
      existing.items.push({
        id: item.id,
        name: item.name,
        salePrice: item.salePrice || 0,
        acquisitionCost: item.acquisitionCost,
        profit,
        dateSold: item.dateSold || '',
      });
    } else {
      acc.push({
        month: monthKey,
        monthLabel,
        revenue,
        cogs: item.acquisitionCost,
        profit,
        itemsSold: 1,
        items: [{
          id: item.id,
          name: item.name,
          salePrice: item.salePrice || 0,
          acquisitionCost: item.acquisitionCost,
          profit,
          dateSold: item.dateSold || '',
        }],
      });
    }
    return acc;
  }, [] as MonthData[]);

  // Sort by most recent first
  monthlyData.sort((a, b) => b.month.localeCompare(a.month));

  // Calculate month-over-month changes
  const getChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / Math.abs(previous)) * 100);
  };

  const toggleMonth = (month: string) => {
    setExpandedMonths(prev => 
      prev.includes(month) 
        ? prev.filter(m => m !== month)
        : [...prev, month]
    );
  };

  // Total stats
  const totalRevenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0);
  const totalCOGS = monthlyData.reduce((sum, m) => sum + m.cogs, 0);
  const totalProfit = monthlyData.reduce((sum, m) => sum + m.profit, 0);
  const totalItemsSold = monthlyData.reduce((sum, m) => sum + m.itemsSold, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Monthly Performance</h1>
          <p className="text-muted-foreground text-sm">Month-by-month breakdown of sales performance</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Total Revenue</p>
          <p className="text-xl font-semibold mt-1">{formatCurrency(totalRevenue)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Total COGS</p>
          <p className="text-xl font-semibold mt-1">{formatCurrency(totalCOGS)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Total Profit</p>
          <p className={`text-xl font-semibold mt-1 ${totalProfit >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
            {totalProfit >= 0 ? '+' : ''}{formatCurrency(totalProfit)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Items Sold</p>
          <p className="text-xl font-semibold mt-1">{totalItemsSold}</p>
        </Card>
      </div>

      {/* Monthly Breakdown */}
      <div className="space-y-3">
        {monthlyData.map((month, index) => {
          const previousMonth = monthlyData[index + 1];
          const revenueChange = previousMonth ? getChange(month.revenue, previousMonth.revenue) : 0;
          const profitChange = previousMonth ? getChange(month.profit, previousMonth.profit) : 0;
          const isExpanded = expandedMonths.includes(month.month);

          return (
            <Collapsible key={month.month} open={isExpanded} onOpenChange={() => toggleMonth(month.month)}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div>
                          <CardTitle className="text-base font-medium">{month.monthLabel}</CardTitle>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {month.itemsSold} item{month.itemsSold !== 1 ? 's' : ''} sold
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Revenue</p>
                          <div className="flex items-center gap-2">
                            <p className="text-lg font-semibold">{formatCurrency(month.revenue)}</p>
                            {previousMonth && (
                              <span className={`text-xs flex items-center ${revenueChange >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
                                {revenueChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                {Math.abs(revenueChange)}%
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Profit</p>
                          <div className="flex items-center gap-2">
                            <p className={`text-lg font-semibold ${month.profit >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
                              {month.profit >= 0 ? '+' : ''}{formatCurrency(month.profit)}
                            </p>
                            {previousMonth && (
                              <span className={`text-xs flex items-center ${profitChange >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
                                {profitChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                {Math.abs(profitChange)}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="border-t pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {month.items
                          .sort((a, b) => b.profit - a.profit)
                          .map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">{item.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(parseISO(item.dateSold), 'MMM d')} · {formatCurrency(item.salePrice)}
                                </p>
                              </div>
                              <div className="text-right ml-3">
                                <p className={`text-sm font-mono ${item.profit >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
                                  {item.profit >= 0 ? '+' : ''}{formatCurrency(item.profit)}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}

        {monthlyData.length === 0 && (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Minus className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No Sales Data</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Sell some items to see monthly performance data here.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
