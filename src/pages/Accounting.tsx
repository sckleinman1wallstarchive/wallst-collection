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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, Tooltip } from 'recharts';
import { DollarSign, TrendingUp, Package, FileText, PlusCircle, Receipt, ChevronDown, ChevronUp, BarChart3, Users } from 'lucide-react';
import { CashFlowStatement } from '@/components/accounting/CashFlowStatement';
import { RecordContributionDialog } from '@/components/accounting/RecordContributionDialog';
import { ExpenseTrackerDialog } from '@/components/accounting/ExpenseTrackerDialog';
import { ExpenseList } from '@/components/accounting/ExpenseList';
import { AssignPurchasesDialog } from '@/components/accounting/AssignPurchasesDialog';

type View = 'dashboard' | 'cash-flow';

const Accounting = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [contributionDialogOpen, setContributionDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [assignPurchasesOpen, setAssignPurchasesOpen] = useState(false);
  const [chartsExpanded, setChartsExpanded] = useState(false);
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
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
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Accounting</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Financial overview and P&L tracking
          </p>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card 
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => setContributionDialogOpen(true)}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-chart-1/20 rounded-lg">
                <PlusCircle className="h-6 w-6 text-chart-1" />
              </div>
              <div>
                <p className="font-medium">Record Contribution</p>
                <p className="text-xs text-muted-foreground">Add partner capital</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => setCurrentView('cash-flow')}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-chart-2/20 rounded-lg">
                <FileText className="h-6 w-6 text-chart-2" />
              </div>
              <div>
                <p className="font-medium">Cash Flow Statement</p>
                <p className="text-xs text-muted-foreground">View detailed flows</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => setExpenseDialogOpen(true)}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-destructive/20 rounded-lg">
                <Receipt className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="font-medium">Record Expense</p>
                <p className="text-xs text-muted-foreground">Track business costs</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => setAssignPurchasesOpen(true)}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">Assign Purchases</p>
                <p className="text-xs text-muted-foreground">Tag who paid</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compact Monthly Goal Progress */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Monthly Goal: {formatCurrency(monthlyTarget)}</span>
                <span className="text-sm font-semibold">{progressPercent.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${Math.min(progressPercent, 100)}%` }}
                />
              </div>
            </div>
            <div className="w-px h-8 bg-border hidden md:block" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Stretch: {formatCurrency(stretchTarget)}</span>
                <span className="text-sm font-semibold">{((summary.totalProfit / stretchTarget) * 100).toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-chart-1 transition-all duration-500"
                  style={{ width: `${Math.min((summary.totalProfit / stretchTarget) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div className="w-px h-8 bg-border hidden md:block" />
            <div className="flex gap-6 text-sm">
              <div>
                <p className="text-muted-foreground">Profit</p>
                <p className="font-semibold text-chart-2">+{formatCurrency(summary.totalProfit)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Remaining</p>
                <p className="font-semibold">{formatCurrency(Math.max(0, monthlyTarget - summary.totalProfit))}</p>
              </div>
            </div>
          </div>
        </Card>

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
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Margin</p>
                <p className="text-xl font-semibold">{summary.avgMargin}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Collapsible Charts */}
        <Collapsible open={chartsExpanded} onOpenChange={setChartsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full gap-2">
              <BarChart3 className="h-4 w-4" />
              {chartsExpanded ? 'Hide' : 'Show'} Analytics Charts
              {chartsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4">
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
          </CollapsibleContent>
        </Collapsible>

        {/* Expenses List */}
        <ExpenseList />

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

        {/* Dialogs */}
        <RecordContributionDialog 
          open={contributionDialogOpen} 
          onOpenChange={setContributionDialogOpen} 
        />
        <ExpenseTrackerDialog
          open={expenseDialogOpen}
          onOpenChange={setExpenseDialogOpen}
        />
        <AssignPurchasesDialog
          open={assignPurchasesOpen}
          onOpenChange={setAssignPurchasesOpen}
        />
      </div>
    </DashboardLayout>
  );
};

export default Accounting;
