import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { ProgressBar } from '@/components/dashboard/ProgressBar';
import { TaskList } from '@/components/tasks/TaskList';
import { mockInventory, mockTasks, mockFinancials } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, DollarSign, TrendingUp, Clock, AlertTriangle } from 'lucide-react';

const Index = () => {
  // Calculate metrics
  const activeItems = mockInventory.filter(i => i.status !== 'sold');
  const listedItems = mockInventory.filter(i => i.status === 'listed');
  const totalInventoryValue = activeItems.reduce((sum, i) => sum + i.acquisitionCost, 0);
  const potentialRevenue = activeItems.reduce((sum, i) => sum + i.askingPrice, 0);
  const avgDaysHeld = Math.round(activeItems.reduce((sum, i) => sum + i.daysHeld, 0) / activeItems.length);
  const stagnantItems = activeItems.filter(i => i.daysHeld > 30);
  const upcomingTasks = mockTasks.filter(t => t.status !== 'done').slice(0, 4);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

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
            value={activeItems.length}
            subtitle={`${listedItems.length} currently listed`}
            icon={<Package className="h-4 w-4" />}
          />
          <StatCard
            title="Inventory Cost"
            value={formatCurrency(totalInventoryValue)}
            subtitle={`${formatCurrency(potentialRevenue)} potential`}
            icon={<DollarSign className="h-4 w-4" />}
          />
          <StatCard
            title="Monthly Progress"
            value={formatCurrency(mockFinancials.currentProfit)}
            subtitle={`of ${formatCurrency(mockFinancials.monthlyProfitTarget)} target`}
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
                  <span className="text-sm text-muted-foreground">Profit Target</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(mockFinancials.currentProfit)} / {formatCurrency(mockFinancials.monthlyProfitTarget)}
                  </span>
                </div>
                <ProgressBar
                  value={mockFinancials.currentProfit}
                  max={mockFinancials.monthlyProfitTarget}
                  showPercentage={false}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Stretch Target</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(mockFinancials.currentProfit)} / {formatCurrency(mockFinancials.stretchTarget)}
                  </span>
                </div>
                <ProgressBar
                  value={mockFinancials.currentProfit}
                  max={mockFinancials.stretchTarget}
                  showPercentage={false}
                />
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Target Margin</p>
                  <p className="text-lg font-semibold">{mockFinancials.targetMargin}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Per Partner</p>
                  <p className="text-lg font-semibold">{formatCurrency(mockFinancials.currentProfit / 3)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Capital Pool</p>
                  <p className="text-lg font-semibold">{formatCurrency(mockFinancials.capitalInjected)}</p>
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
              {stagnantItems.length > 0 && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                  <p className="text-sm font-medium">{stagnantItems.length} items over 30 days</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Consider price drops or relisting
                  </p>
                </div>
              )}
              {mockInventory.filter(i => i.status === 'in-closet').length > 0 && (
                <div className="p-3 rounded-md bg-muted border border-border">
                  <p className="text-sm font-medium">
                    {mockInventory.filter(i => i.status === 'in-closet').length} unlisted items
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Capital not working until listed
                  </p>
                </div>
              )}
              <div className="p-3 rounded-md bg-muted border border-border">
                <p className="text-sm font-medium">Weekly meeting</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Set agenda for Sunday sync
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">Upcoming Tasks</CardTitle>
            <a href="/tasks" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              View all →
            </a>
          </CardHeader>
          <CardContent>
            <TaskList tasks={upcomingTasks} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Index;
