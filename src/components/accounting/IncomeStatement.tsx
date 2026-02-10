import { useState, useMemo } from 'react';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
import { useExpenses } from '@/hooks/useExpenses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Pencil, Check, TrendingUp } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, isWithinInterval, parseISO } from 'date-fns';

interface IncomeStatementProps {
  onBack: () => void;
}

type Timeframe = 'all-time' | 'this-month' | 'last-month' | 'this-year' | 'last-3-months' | 'last-6-months';

export const IncomeStatement = ({ onBack }: IncomeStatementProps) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('all-time');
  const [editMode, setEditMode] = useState(false);
  const { inventory, isLoading: invLoading, getSoldItems } = useSupabaseInventory();
  const { expenses, isLoading: expLoading } = useExpenses();

  const [labels, setLabels] = useState({
    revenue: 'Revenue (Sales)',
    cogs: 'Cost of Goods Sold',
    grossProfit: 'Gross Profit',
    supplies: 'Supplies',
    shipping: 'Shipping',
    platformFees: 'Platform Fees',
    popUp: 'Pop-Up Expenses',
    advertising: 'Advertising',
    subscriptions: 'Subscriptions',
    otherExpenses: 'Other Expenses',
    totalExpenses: 'Total Operating Expenses',
    netIncome: 'Net Income',
  });

  const isLoading = invLoading || expLoading;

  const getDateRange = (): { start: Date; end: Date } | null => {
    const now = new Date();
    switch (timeframe) {
      case 'this-month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'last-month':
        const lastMonth = subMonths(now, 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
      case 'this-year':
        return { start: startOfYear(now), end: endOfYear(now) };
      case 'last-3-months':
        return { start: startOfMonth(subMonths(now, 2)), end: endOfMonth(now) };
      case 'last-6-months':
        return { start: startOfMonth(subMonths(now, 5)), end: endOfMonth(now) };
      case 'all-time':
      default:
        return null;
    }
  };

  const isInRange = (dateStr: string | undefined | null) => {
    if (!dateStr) return timeframe === 'all-time';
    const range = getDateRange();
    if (!range) return true;
    try {
      const date = parseISO(dateStr);
      return isWithinInterval(date, { start: range.start, end: range.end });
    } catch {
      return false;
    }
  };

  const data = useMemo(() => {
    const soldItems = getSoldItems().filter(item => isInRange(item.dateSold));
    const filteredExpenses = expenses.filter(e => isInRange(e.date));

    const revenue = soldItems.reduce((sum, item) => sum + (item.salePrice || 0), 0);
    const cogs = soldItems.reduce((sum, item) => sum + item.acquisitionCost, 0);
    const grossProfit = revenue - cogs;

    const expensesByCategory = filteredExpenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netIncome = grossProfit - totalExpenses;

    return {
      revenue,
      cogs,
      grossProfit,
      expensesByCategory,
      totalExpenses,
      netIncome,
      soldCount: soldItems.length,
    };
  }, [inventory, expenses, timeframe]);

  const formatCurrency = (amount: number) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(Math.abs(amount));
    return amount < 0 ? `(${formatted})` : formatted;
  };

  const getAmountColor = (amount: number) => {
    if (amount > 0) return 'text-chart-2';
    if (amount < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  const updateLabel = (key: keyof typeof labels, value: string) => {
    setLabels(prev => ({ ...prev, [key]: value }));
  };

  const LabelCell = ({ labelKey, className = '' }: { labelKey: keyof typeof labels; className?: string }) => {
    if (editMode) {
      return (
        <Input
          value={labels[labelKey]}
          onChange={(e) => updateLabel(labelKey, e.target.value)}
          className={`h-7 text-sm ${className}`}
        />
      );
    }
    return <span className={className}>{labels[labelKey]}</span>;
  };

  const getTimeframeLabel = () => {
    const range = getDateRange();
    if (!range) return 'All Time';
    return `${format(range.start, 'MMM d, yyyy')} — ${format(range.end, 'MMM d, yyyy')}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Income Statement</h1>
            <p className="text-muted-foreground text-sm">
              Wall St Collection — {getTimeframeLabel()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeframe} onValueChange={(v) => setTimeframe(v as Timeframe)}>
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-time">All Time</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="last-3-months">Last 3 Months</SelectItem>
              <SelectItem value="last-6-months">Last 6 Months</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? <Check className="h-4 w-4 mr-1.5" /> : <Pencil className="h-4 w-4 mr-1.5" />}
            {editMode ? 'Done' : 'Edit'}
          </Button>
        </div>
      </div>

      {/* Revenue & COGS */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-chart-2/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-chart-2" />
            </div>
            <CardTitle className="text-lg">Revenue & Cost of Goods</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center py-2 px-3">
            <LabelCell labelKey="revenue" className="text-sm" />
            <span className={`font-mono text-sm font-medium ${getAmountColor(data.revenue)}`}>
              {formatCurrency(data.revenue)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 px-3">
            <LabelCell labelKey="cogs" className="text-sm" />
            <span className="font-mono text-sm text-destructive">
              ({formatCurrency(data.cogs)})
            </span>
          </div>

          <Separator className="my-2" />
          <div className="flex justify-between items-center py-2 bg-muted/50 px-3 rounded-md">
            <LabelCell labelKey="grossProfit" className="font-medium text-sm" />
            <Badge variant="outline" className={`font-mono ${getAmountColor(data.grossProfit)}`}>
              {formatCurrency(data.grossProfit)}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground px-3">
            Gross Margin: {data.revenue > 0 ? ((data.grossProfit / data.revenue) * 100).toFixed(1) : '0'}%
            &nbsp;•&nbsp; {data.soldCount} items sold
          </p>
        </CardContent>
      </Card>

      {/* Operating Expenses */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Operating Expenses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { key: 'supplies' as const, category: 'supplies' },
            { key: 'shipping' as const, category: 'shipping' },
            { key: 'platformFees' as const, category: 'platform-fees' },
            { key: 'popUp' as const, category: 'pop-up' },
            { key: 'advertising' as const, category: 'advertising' },
            { key: 'subscriptions' as const, category: 'subscriptions' },
            { key: 'otherExpenses' as const, category: 'other' },
          ].map(({ key, category }) => {
            const amount = data.expensesByCategory[category] || 0;
            if (amount === 0) return null;
            return (
              <div key={key} className="flex justify-between items-center py-2 px-3">
                <LabelCell labelKey={key} className="text-sm" />
                <span className="font-mono text-sm text-destructive">
                  ({formatCurrency(amount)})
                </span>
              </div>
            );
          })}

          {data.totalExpenses === 0 && (
            <p className="text-xs text-muted-foreground italic text-center py-2">
              No expenses in this period
            </p>
          )}

          <Separator className="my-2" />
          <div className="flex justify-between items-center py-2 bg-muted/50 px-3 rounded-md">
            <LabelCell labelKey="totalExpenses" className="font-medium text-sm" />
            <Badge variant="outline" className="font-mono text-destructive">
              ({formatCurrency(data.totalExpenses)})
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Net Income */}
      <Card className="border-primary/30">
        <CardContent className="py-4">
          <div className="flex justify-between items-center px-3">
            <LabelCell labelKey="netIncome" className="font-semibold text-sm" />
            <Badge className={`font-mono text-sm ${data.netIncome >= 0 ? '' : 'bg-destructive'}`}>
              {formatCurrency(data.netIncome)}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Net Margin: {data.revenue > 0 ? ((data.netIncome / data.revenue) * 100).toFixed(1) : '0'}%
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
