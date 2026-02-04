import { useMemo, useState } from 'react';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ArrowLeft, ChevronDown, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { format, parse, startOfMonth, isValid } from 'date-fns';

interface MonthlyHistoryViewProps {
  onBack: () => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

interface MonthData {
  month: string;
  monthLabel: string;
  revenue: number;
  cogs: number;
  profit: number;
  itemCount: number;
  items: Array<{
    id: string;
    name: string;
    brand: string;
    salePrice: number;
    acquisitionCost: number;
    profit: number;
    dateSold: string;
  }>;
}

export function MonthlyHistoryView({ onBack }: MonthlyHistoryViewProps) {
  const { inventory } = useSupabaseInventory();
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  const monthlyData = useMemo(() => {
    const soldItems = inventory.filter(i => i.status === 'sold');
    
    // Group by month
    const byMonth = soldItems.reduce((acc, item) => {
      const dateSold = item.dateSold;
      if (!dateSold) return acc;
      
      const date = parse(dateSold, 'yyyy-MM-dd', new Date());
      if (!isValid(date)) return acc;
      
      const monthKey = format(startOfMonth(date), 'yyyy-MM');
      const monthLabel = format(date, 'MMMM yyyy');
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          monthLabel,
          revenue: 0,
          cogs: 0,
          profit: 0,
          itemCount: 0,
          items: [],
        };
      }
      
      const salePrice = item.salePrice || 0;
      const profit = salePrice - item.acquisitionCost;
      
      acc[monthKey].revenue += salePrice;
      acc[monthKey].cogs += item.acquisitionCost;
      acc[monthKey].profit += profit;
      acc[monthKey].itemCount += 1;
      acc[monthKey].items.push({
        id: item.id,
        name: item.name,
        brand: item.brand || 'Unknown',
        salePrice,
        acquisitionCost: item.acquisitionCost,
        profit,
        dateSold,
      });
      
      return acc;
    }, {} as Record<string, MonthData>);

    // Sort by month descending (newest first)
    return Object.values(byMonth).sort((a, b) => b.month.localeCompare(a.month));
  }, [inventory]);

  const toggleMonth = (month: string) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(month)) {
      newExpanded.delete(month);
    } else {
      newExpanded.add(month);
    }
    setExpandedMonths(newExpanded);
  };

  // Calculate month-over-month changes
  const getChange = (current: number, previous: number | undefined) => {
    if (previous === undefined || previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Monthly History</h1>
          <p className="text-muted-foreground text-sm">
            Month-by-month breakdown of sales performance
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      {monthlyData.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Best Month (Revenue)</p>
            <p className="text-lg font-semibold mt-1">
              {monthlyData.reduce((best, m) => m.revenue > best.revenue ? m : best, monthlyData[0]).monthLabel}
            </p>
            <p className="text-sm text-chart-2">
              {formatCurrency(Math.max(...monthlyData.map(m => m.revenue)))}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Best Month (Profit)</p>
            <p className="text-lg font-semibold mt-1">
              {monthlyData.reduce((best, m) => m.profit > best.profit ? m : best, monthlyData[0]).monthLabel}
            </p>
            <p className="text-sm text-chart-2">
              {formatCurrency(Math.max(...monthlyData.map(m => m.profit)))}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Total Revenue (All Time)</p>
            <p className="text-xl font-semibold mt-1">
              {formatCurrency(monthlyData.reduce((sum, m) => sum + m.revenue, 0))}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Total Profit (All Time)</p>
            <p className="text-xl font-semibold mt-1 text-chart-2">
              +{formatCurrency(monthlyData.reduce((sum, m) => sum + m.profit, 0))}
            </p>
          </Card>
        </div>
      )}

      {/* Monthly Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Monthly Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyData.length > 0 ? (
            <div className="space-y-2">
              {monthlyData.map((month, index) => {
                const prevMonth = monthlyData[index + 1];
                const revenueChange = getChange(month.revenue, prevMonth?.revenue);
                const profitChange = getChange(month.profit, prevMonth?.profit);
                const isExpanded = expandedMonths.has(month.month);

                return (
                  <Collapsible key={month.month} open={isExpanded} onOpenChange={() => toggleMonth(month.month)}>
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors">
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                          <div>
                            <p className="font-medium">{month.monthLabel}</p>
                            <p className="text-xs text-muted-foreground">
                              {month.itemCount} item{month.itemCount !== 1 ? 's' : ''} sold
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-right">
                            <p className="text-muted-foreground text-xs">Revenue</p>
                            <p className="font-mono font-medium">{formatCurrency(month.revenue)}</p>
                            {revenueChange !== null && (
                              <div className={`flex items-center justify-end gap-1 text-xs ${revenueChange >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
                                {revenueChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                {revenueChange >= 0 ? '+' : ''}{revenueChange.toFixed(0)}%
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-muted-foreground text-xs">COGS</p>
                            <p className="font-mono">{formatCurrency(month.cogs)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-muted-foreground text-xs">Profit</p>
                            <p className="font-mono font-medium text-chart-2">+{formatCurrency(month.profit)}</p>
                            {profitChange !== null && (
                              <div className={`flex items-center justify-end gap-1 text-xs ${profitChange >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
                                {profitChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                {profitChange >= 0 ? '+' : ''}{profitChange.toFixed(0)}%
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="mt-2 ml-7 border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Item</TableHead>
                              <TableHead>Brand</TableHead>
                              <TableHead className="text-right">Cost</TableHead>
                              <TableHead className="text-right">Sale</TableHead>
                              <TableHead className="text-right">Profit</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {month.items
                              .sort((a, b) => b.dateSold.localeCompare(a.dateSold))
                              .map((item) => (
                              <TableRow key={item.id}>
                                <TableCell className="text-sm">{item.dateSold}</TableCell>
                                <TableCell className="text-sm font-medium">{item.name}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">{item.brand}</TableCell>
                                <TableCell className="text-right font-mono text-sm">
                                  {formatCurrency(item.acquisitionCost)}
                                </TableCell>
                                <TableCell className="text-right font-mono text-sm">
                                  {formatCurrency(item.salePrice)}
                                </TableCell>
                                <TableCell className="text-right font-mono text-sm text-chart-2">
                                  +{formatCurrency(item.profit)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No sales recorded yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
