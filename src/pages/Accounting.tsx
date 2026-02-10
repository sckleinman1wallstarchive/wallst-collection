import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, Tooltip } from 'recharts';
import { DollarSign, TrendingUp, Package, FileText, PlusCircle, Receipt, ChevronDown, ChevronUp, BarChart3, Users, ArrowUpDown, Pencil, Check, CalendarIcon, Wallet, Scale, ClipboardList } from 'lucide-react';
import { CashFlowStatement } from '@/components/accounting/CashFlowStatement';
import { BalanceSheet } from '@/components/accounting/BalanceSheet';
import { IncomeStatement } from '@/components/accounting/IncomeStatement';
import { RecordContributionDialog } from '@/components/accounting/RecordContributionDialog';
import { ExpenseTrackerDialog } from '@/components/accounting/ExpenseTrackerDialog';
import { ExpenseList } from '@/components/accounting/ExpenseList';
import { AssignPurchasesDialog } from '@/components/accounting/AssignPurchasesDialog';
import { BudgetDialog } from '@/components/accounting/BudgetDialog';
import { AnalyticsInlineView } from '@/components/accounting/AnalyticsInlineView';
import { format, parse } from 'date-fns';
import { cn } from '@/lib/utils';

type View = 'dashboard' | 'cash-flow' | 'budget' | 'analytics' | 'balance-sheet' | 'income-statement';
type SortOption = 'date' | 'price' | 'brand';

const Accounting = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [contributionDialogOpen, setContributionDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [assignPurchasesOpen, setAssignPurchasesOpen] = useState(false);
  const [chartsExpanded, setChartsExpanded] = useState(false);
  const [expensesExpanded, setExpensesExpanded] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [editMode, setEditMode] = useState(false);
  const [editingDateId, setEditingDateId] = useState<string | null>(null);
  
  const { inventory, isLoading, getSoldItems, getFinancialSummary, updateItem } = useSupabaseInventory();
  const soldItems = getSoldItems();
  const summary = getFinancialSummary();

  // Sort sold items based on selected option (items with dates first, then no dates)
  const sortedSoldItems = useMemo(() => {
    const items = [...soldItems];
    
    items.sort((a, b) => {
      // First, prioritize items with dates over items without dates
      const aHasDate = !!a.dateSold;
      const bHasDate = !!b.dateSold;
      
      if (aHasDate && !bHasDate) return -1;
      if (!aHasDate && bHasDate) return 1;
      
      // Then apply the selected sort criteria
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.dateSold || '').getTime() - new Date(b.dateSold || '').getTime();
          break;
        case 'price':
          comparison = (a.salePrice || 0) - (b.salePrice || 0);
          break;
        case 'brand':
          comparison = (a.brand || '').localeCompare(b.brand || '');
          break;
      }
      
      return sortDirection === 'desc' ? -comparison : comparison;
    });
    
    return items;
  }, [soldItems, sortBy, sortDirection]);

  // Calculate totals for selected items
  const selectedTotals = useMemo(() => {
    const selected = sortedSoldItems.filter(item => selectedItems.has(item.id));
    const totalCOGS = selected.reduce((sum, item) => sum + item.acquisitionCost, 0);
    const totalSales = selected.reduce((sum, item) => sum + (item.salePrice || 0), 0);
    const totalProfit = totalSales - totalCOGS;
    
    return {
      count: selected.length,
      cogs: totalCOGS,
      sales: totalSales,
      profit: totalProfit,
    };
  }, [sortedSoldItems, selectedItems]);

  const toggleItemSelection = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const toggleAllItems = () => {
    if (selectedItems.size === sortedSoldItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(sortedSoldItems.map(item => item.id)));
    }
  };

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleDateChange = async (itemId: string, newDate: Date | undefined) => {
    if (!newDate) return;
    await updateItem(itemId, { dateSold: format(newDate, 'yyyy-MM-dd') });
    setEditingDateId(null);
  };

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
  const progressPercent = (summary.totalRevenue / monthlyTarget) * 100;

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

  // Render Budget view
  if (currentView === 'budget') {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <BudgetDialog onBack={() => setCurrentView('dashboard')} />
        </div>
      </DashboardLayout>
    );
  }

  // Render Analytics view
  if (currentView === 'analytics') {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <AnalyticsInlineView onBack={() => setCurrentView('dashboard')} />
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

  // Render Balance Sheet view
  if (currentView === 'balance-sheet') {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <BalanceSheet onBack={() => setCurrentView('dashboard')} />
        </div>
      </DashboardLayout>
    );
  }

  // Render Income Statement view
  if (currentView === 'income-statement') {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <IncomeStatement onBack={() => setCurrentView('dashboard')} />
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

        {/* Quick Action Cards - BIGGER */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card 
            className="cursor-pointer hover:border-primary/50 transition-colors hover:shadow-md"
            onClick={() => setCurrentView('budget')}
          >
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className="p-4 bg-chart-2/20 rounded-xl">
                <Wallet className="h-8 w-8 text-chart-2" />
              </div>
              <div>
                <p className="font-semibold text-lg">Budget</p>
                <p className="text-xs text-muted-foreground">Capital governance</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-primary/50 transition-colors hover:shadow-md"
            onClick={() => setContributionDialogOpen(true)}
          >
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className="p-4 bg-chart-1/20 rounded-xl">
                <PlusCircle className="h-8 w-8 text-chart-1" />
              </div>
              <div>
                <p className="font-semibold text-lg">Contribution</p>
                <p className="text-xs text-muted-foreground">Add partner capital</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-primary/50 transition-colors hover:shadow-md"
            onClick={() => setCurrentView('cash-flow')}
          >
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className="p-4 bg-chart-3/20 rounded-xl">
                <FileText className="h-8 w-8 text-chart-3" />
              </div>
              <div>
                <p className="font-semibold text-lg">Cash Flow</p>
                <p className="text-xs text-muted-foreground">Statement</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-primary/50 transition-colors hover:shadow-md"
            onClick={() => setExpenseDialogOpen(true)}
          >
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className="p-4 bg-destructive/20 rounded-xl">
                <Receipt className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <p className="font-semibold text-lg">Expense</p>
                <p className="text-xs text-muted-foreground">Track costs</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-primary/50 transition-colors hover:shadow-md"
            onClick={() => setCurrentView('analytics')}
          >
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className="p-4 bg-primary/20 rounded-xl">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-lg">Analytics</p>
                <p className="text-xs text-muted-foreground">View insights</p>
              </div>
            </CardContent>
          </Card>
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

        {/* Collapsible Expenses List - De-emphasized */}
        <Collapsible open={expensesExpanded} onOpenChange={setExpensesExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <Receipt className="h-4 w-4" />
              View Recent Expenses
              {expensesExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4">
            <ExpenseList />
          </CollapsibleContent>
        </Collapsible>

        {/* Sales Ledger */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base font-medium">Sales Ledger</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={editMode ? "default" : "outline"}
                size="sm"
                className="h-8 gap-1"
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? <Check className="h-3 w-3" /> : <Pencil className="h-3 w-3" />}
                {editMode ? "Done" : "Edit Dates"}
              </Button>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-[140px] h-8">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="price">Sale Price</SelectItem>
                  <SelectItem value="brand">Brand</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={toggleSortDirection}
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {sortedSoldItems.length > 0 ? (
              <>
                {/* Selected Items Summary */}
                {selectedItems.size > 0 && (
                  <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-sm font-medium">
                        {selectedTotals.count} item{selectedTotals.count !== 1 ? 's' : ''} selected
                      </span>
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">COGS: </span>
                          <span className="font-mono font-medium">{formatCurrency(selectedTotals.cogs)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Sales: </span>
                          <span className="font-mono font-medium">{formatCurrency(selectedTotals.sales)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Profit: </span>
                          <span className="font-mono font-medium text-chart-2">+{formatCurrency(selectedTotals.profit)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]">
                        <Checkbox 
                          checked={selectedItems.size === sortedSoldItems.length && sortedSoldItems.length > 0}
                          onCheckedChange={toggleAllItems}
                        />
                      </TableHead>
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
                    {sortedSoldItems.map((item) => {
                      const profit = (item.salePrice || 0) - item.acquisitionCost;
                      const margin = item.salePrice ? ((profit / item.salePrice) * 100).toFixed(0) : '0';
                      const isSelected = selectedItems.has(item.id);
                      return (
                        <TableRow 
                          key={item.id} 
                          className={cn(
                            isSelected ? 'bg-primary/5' : '',
                            'cursor-pointer hover:bg-muted/50'
                          )}
                          onClick={() => toggleItemSelection(item.id)}
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox 
                              checked={isSelected}
                              onCheckedChange={() => toggleItemSelection(item.id)}
                            />
                          </TableCell>
                          <TableCell className="text-sm">
                            {editMode ? (
                              <Popover open={editingDateId === item.id} onOpenChange={(open) => setEditingDateId(open ? item.id : null)}>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                      "h-7 px-2 text-xs font-normal",
                                      !item.dateSold && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-1 h-3 w-3" />
                                    {item.dateSold || "Set date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={item.dateSold ? parse(item.dateSold, 'yyyy-MM-dd', new Date()) : undefined}
                                    onSelect={(date) => handleDateChange(item.id, date)}
                                    initialFocus
                                    className={cn("p-3 pointer-events-auto")}
                                  />
                                </PopoverContent>
                              </Popover>
                            ) : (
                              item.dateSold || <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
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
              </>
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
