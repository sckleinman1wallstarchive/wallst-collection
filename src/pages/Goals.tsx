import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProgressBar } from '@/components/dashboard/ProgressBar';
import { useInventory } from '@/hooks/useInventory';
import { mockFinancials } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Users, Wallet, TrendingUp } from 'lucide-react';

const Goals = () => {
  const { getFinancialSummary, getActiveItems } = useInventory();
  const summary = getFinancialSummary();
  const activeItems = getActiveItems();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const partners = ['Parker', 'Spencer', 'Parker K'];
  const partnerShare = summary.totalProfit / 3;
  const partnerTarget = mockFinancials.partnerPayoutTarget;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Goals & Finance</h1>
          <p className="text-muted-foreground text-sm mt-1">
            January 2025 targets and progress
          </p>
        </div>

        {/* Main Goals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Monthly Profit Target
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-baseline justify-between mb-4">
                  <span className="text-3xl font-semibold">{formatCurrency(summary.totalProfit)}</span>
                  <span className="text-muted-foreground text-sm">of {formatCurrency(mockFinancials.monthlyProfitTarget)}</span>
                </div>
                <ProgressBar
                  value={summary.totalProfit}
                  max={mockFinancials.monthlyProfitTarget}
                  label="Baseline Target"
                />
              </div>
              <div>
                <ProgressBar
                  value={summary.totalProfit}
                  max={mockFinancials.stretchTarget}
                  label="Stretch Target ($10k)"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Margin Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Target Margin</p>
                  <p className="text-2xl font-semibold mt-1">{mockFinancials.targetMargin}%</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Actual Margin</p>
                  <p className="text-2xl font-semibold mt-1">{summary.avgMargin}%</p>
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Revenue</span>
                  <span className="font-medium">{formatCurrency(summary.totalRevenue)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Total Cost</span>
                  <span className="font-medium">{formatCurrency(summary.totalCostOfSold)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Partner Split */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Partner Payouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {partners.map((partner) => (
                <div key={partner} className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium">{partner}</p>
                  <p className="text-2xl font-semibold mt-2">{formatCurrency(partnerShare)}</p>
                  <div className="mt-3">
                    <ProgressBar
                      value={partnerShare}
                      max={partnerTarget}
                      showPercentage={false}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Target: {formatCurrency(partnerTarget)}/month
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Capital Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Capital Pool
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Total Injected</p>
                <p className="text-2xl font-semibold mt-1">{formatCurrency(mockFinancials.capitalInjected)}</p>
                <p className="text-xs text-muted-foreground mt-2">$5k per partner</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Currently Deployed</p>
                <p className="text-2xl font-semibold mt-1">
                  {formatCurrency(summary.activeInventoryCost)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">In active inventory</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Available</p>
                <p className="text-2xl font-semibold mt-1">
                  {formatCurrency(mockFinancials.capitalInjected - summary.activeInventoryCost + summary.totalProfit)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">For new sourcing</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Goals;
