import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, Tooltip } from 'recharts';
import { DollarSign, TrendingUp, Users, Package, FileText, PlusCircle } from 'lucide-react';
import { CashFlowStatement } from '@/components/accounting/CashFlowStatement';
import { RecordContributionDialog } from '@/components/accounting/RecordContributionDialog';

type View = 'dashboard' | 'cash-flow';

const Accounting = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [contributionDialogOpen, setContributionDialogOpen] = useState(false);
  const { inventory, isLoading, getSoldItems, getFinancialSummary } = useSupabaseInventory();
  const soldItems = getSoldItems();
  const summary = getFinancialSummary();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Sales by date for chart
  const salesByDate = soldItems.reduce((acc, item) => {
    const date = item.dateSold || '';
    if (!date) return acc;
    if (!acc[date]) {
      acc[date] = { date, revenue: 0, profit: 0, count: 0 };
    }
    acc[date].revenue += item.salePrice || 0;
    acc[date].profit += (item.salePrice || 0) - item.acquisitionCost;
    acc[date].count += 1;
    return acc;
  }, {} as Record<string, { date: string; revenue: number; profit: number; count: number }>);

  const salesChartData = Object.values(salesByDate).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Running totals for profit chart
  let runningProfit = 0;
  const profitOverTime = salesChartData.map((day) => {
    runningProfit += day.profit;
    return {
      date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      profit: runningProfit,
    };
  });

  // Monthly targets
  const monthlyTarget = 5000;
  const stretchTarget = 10000;
  const progressPercent = (summary.totalProfit / monthlyTarget) * 100;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-10 w-10 rounded-lg mb-2" />
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-6 w-24" />
              </Card>
            ))}
          </div>
          <Skeleton className="h-48 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  // Render Cash Flow Statement view
  if (currentView === 'cash-flow') {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <CashFlowStatement onBack={() => setCurrentView('dashboard')} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Accounting</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Financial overview and P&L tracking
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setContributionDialogOpen(true)}
              className="gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Record Contribution
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setCurrentView('cash-flow')}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Statement of Cash Flows
            </Button>
          </div>
        </div>

        {/* Key Financial Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
                <p className="text-xl font-semibold">{formatCurrency(summary.totalRevenue)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Package className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cost of Goods</p>
                <p className="text-xl font-semibold">{formatCurrency(summary.totalCostOfSold)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-chart-2/5 border-chart-2/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-chart-2/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Net Profit</p>
                <p className="text-xl font-semibold text-chart-2">+{formatCurrency(summary.totalProfit)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Margin</p>
                <p className="text-xl font-semibold">{summary.avgMargin}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Progress to Goal */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Monthly Goal Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Baseline Target: {formatCurrency(monthlyTarget)}</span>
                  <span className="font-medium">{progressPercent.toFixed(0)}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${Math.min(progressPercent, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Stretch Target: {formatCurrency(stretchTarget)}</span>
                  <span className="font-medium">{((summary.totalProfit / stretchTarget) * 100).toFixed(0)}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-chart-1 transition-all duration-500"
                    style={{ width: `${Math.min((summary.totalProfit / stretchTarget) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Items Sold</p>
                  <p className="text-lg font-semibold">{summary.itemsSold}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg Margin</p>
                  <p className="text-lg font-semibold">{summary.avgMargin}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Remaining to Target</p>
                  <p className="text-lg font-semibold">{formatCurrency(Math.max(0, monthlyTarget - summary.totalProfit))}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profit Over Time */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Cumulative Profit</CardTitle>
            </CardHeader>
            <CardContent>
              {profitOverTime.length > 0 ? (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={profitOverTime}>
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11 }} />
                      <Tooltip 
                        formatter={(value: number) => [`$${value}`, 'Total Profit']}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: 'var(--radius)',
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="profit" 
                        stroke="hsl(var(--chart-2))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--chart-2))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No sales yet</p>
              )}
            </CardContent>
          </Card>

          {/* Daily Revenue */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Revenue by Day</CardTitle>
            </CardHeader>
            <CardContent>
              {salesChartData.length > 0 ? (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesChartData}>
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 11 }}
                        tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11 }} />
                      <Tooltip 
                        formatter={(value: number) => [`$${value}`, 'Revenue']}
                        labelFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: 'var(--radius)',
                        }}
                      />
                      <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No sales yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sales Ledger */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Sales Ledger</CardTitle>
          </CardHeader>
          <CardContent>
            {soldItems.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">Sale Price</TableHead>
                    <TableHead className="text-right">Profit</TableHead>
                    <TableHead className="text-right">Margin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {soldItems
                    .sort((a, b) => new Date(b.dateSold || '').getTime() - new Date(a.dateSold || '').getTime())
                    .map((item) => {
                      const profit = (item.salePrice || 0) - item.acquisitionCost;
                      const margin = item.salePrice ? ((profit / item.salePrice) * 100).toFixed(0) : '0';
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="text-sm">{item.dateSold}</TableCell>
                          <TableCell>
                            <p className="font-medium text-sm">{item.name}</p>
                          </TableCell>
                          <TableCell className="text-sm">{item.brand}</TableCell>
                          <TableCell className="text-right font-mono text-sm text-muted-foreground">
                            {formatCurrency(item.acquisitionCost)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {formatCurrency(item.salePrice || 0)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="secondary" className="bg-chart-2/20 text-chart-2 font-mono">
                              +{formatCurrency(profit)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {margin}%
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No sales recorded yet</p>
            )}
          </CardContent>
        </Card>

        <RecordContributionDialog 
          open={contributionDialogOpen} 
          onOpenChange={setContributionDialogOpen} 
        />
      </div>
    </DashboardLayout>
  );
};

export default Accounting;
