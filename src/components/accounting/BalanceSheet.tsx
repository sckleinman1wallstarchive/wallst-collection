import { useState } from 'react';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
import { useExpenses } from '@/hooks/useExpenses';
import { useCashFlow } from '@/hooks/useCashFlow';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Pencil, Check, Scale } from 'lucide-react';

interface BalanceSheetProps {
  onBack: () => void;
}

export const BalanceSheet = ({ onBack }: BalanceSheetProps) => {
  const [editMode, setEditMode] = useState(false);
  const { inventory, isLoading: invLoading } = useSupabaseInventory();
  const { cashFlowData, isLoading: cfLoading } = useCashFlow();

  const { data: capitalAccount, isLoading: capLoading } = useQuery({
    queryKey: ['capital_accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('capital_accounts')
        .select('*')
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Editable labels
  const [labels, setLabels] = useState({
    cashOnHand: 'Cash on Hand',
    inventory: 'Inventory (at Cost)',
    totalAssets: 'Total Assets',
    totalLiabilities: 'Total Liabilities',
    spencerCapital: "Spencer's Capital Contribution",
    parkerCapital: "Parker's Capital Contribution",
    retainedEarnings: 'Retained Earnings',
    totalEquity: "Total Owner's Equity",
    totalLiabEquity: 'Total Liabilities & Equity',
  });

  const isLoading = invLoading || cfLoading || capLoading;
  const currentYear = new Date().getFullYear();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
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

  // Assets
  const cashOnHand = capitalAccount?.cash_on_hand || 0;
  
  // Inventory at cost = unsold items (exclude sold, refunded, scammed, traded)
  const unsoldStatuses = ['in-closet', 'listed', 'archive-hold', 'in-closet-parker', 'in-closet-spencer', 'otw', 'for-sale'];
  const inventoryAtCost = inventory
    .filter(item => unsoldStatuses.includes(item.status))
    .reduce((sum, item) => sum + item.acquisitionCost, 0);

  const totalAssets = cashOnHand + inventoryAtCost;

  // Liabilities (currently none)
  const totalLiabilities = 0;

  // Equity
  const spencerCapital = capitalAccount?.spencer_investment || 0;
  const parkerCapital = capitalAccount?.parker_investment || 0;
  
  // Retained Earnings = Total Assets - Total Liabilities - Contributions
  const retainedEarnings = totalAssets - totalLiabilities - spencerCapital - parkerCapital;
  const totalEquity = spencerCapital + parkerCapital + retainedEarnings;

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Balance Sheet</h1>
            <p className="text-muted-foreground text-sm">
              Wall St Collection — As of December 31, {currentYear}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? <Check className="h-4 w-4 mr-1.5" /> : <Pencil className="h-4 w-4 mr-1.5" />}
          {editMode ? 'Done' : 'Edit'}
        </Button>
      </div>

      {/* Assets */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-chart-2/10 rounded-lg">
              <Scale className="h-5 w-5 text-chart-2" />
            </div>
            <CardTitle className="text-lg">Assets</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider px-3">Current Assets</p>
          
          <div className="flex justify-between items-center py-2 px-3">
            <LabelCell labelKey="cashOnHand" className="text-sm" />
            <span className="font-mono text-sm">{formatCurrency(cashOnHand)}</span>
          </div>
          <div className="flex justify-between items-center py-2 px-3">
            <LabelCell labelKey="inventory" className="text-sm" />
            <span className="font-mono text-sm">{formatCurrency(inventoryAtCost)}</span>
          </div>

          <Separator className="my-2" />
          <div className="flex justify-between items-center py-2 bg-muted/50 px-3 rounded-md">
            <LabelCell labelKey="totalAssets" className="font-medium text-sm" />
            <Badge variant="outline" className="font-mono text-chart-2">
              {formatCurrency(totalAssets)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Liabilities */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Liabilities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground italic text-center py-2">
            No liabilities recorded
          </p>
          <Separator className="my-2" />
          <div className="flex justify-between items-center py-2 bg-muted/50 px-3 rounded-md">
            <LabelCell labelKey="totalLiabilities" className="font-medium text-sm" />
            <Badge variant="outline" className="font-mono">
              {formatCurrency(totalLiabilities)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Owner's Equity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Owner's Equity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center py-2 px-3">
            <LabelCell labelKey="spencerCapital" className="text-sm" />
            <span className="font-mono text-sm">{formatCurrency(spencerCapital)}</span>
          </div>
          <div className="flex justify-between items-center py-2 px-3">
            <LabelCell labelKey="parkerCapital" className="text-sm" />
            <span className="font-mono text-sm">{formatCurrency(parkerCapital)}</span>
          </div>
          <div className="flex justify-between items-center py-2 px-3">
            <LabelCell labelKey="retainedEarnings" className="text-sm" />
            <span className={`font-mono text-sm ${retainedEarnings >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
              {formatCurrency(retainedEarnings)}
            </span>
          </div>

          <Separator className="my-2" />
          <div className="flex justify-between items-center py-2 bg-muted/50 px-3 rounded-md">
            <LabelCell labelKey="totalEquity" className="font-medium text-sm" />
            <Badge variant="outline" className="font-mono text-chart-2">
              {formatCurrency(totalEquity)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Balance Check */}
      <Card className="border-primary/30">
        <CardContent className="py-4">
          <div className="flex justify-between items-center px-3">
            <LabelCell labelKey="totalLiabEquity" className="font-semibold text-sm" />
            <Badge className="font-mono text-sm">
              {formatCurrency(totalLiabilities + totalEquity)}
            </Badge>
          </div>
          {Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01 && (
            <p className="text-xs text-chart-2 text-center mt-2">✓ Assets = Liabilities + Equity (Balanced)</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
