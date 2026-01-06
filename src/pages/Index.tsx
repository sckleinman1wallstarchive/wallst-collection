import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { ProgressBar } from '@/components/dashboard/ProgressBar';
import { TaskList } from '@/components/tasks/TaskList';
import { useInventory } from '@/hooks/useInventory';
import { mockTasks } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, DollarSign, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const { inventory, getFinancialSummary, getActiveItems } = useInventory();
  const summary = getFinancialSummary();
  const activeItems = getActiveItems();
  
  const avgDaysHeld = activeItems.length > 0 
    ? Math.round(activeItems.reduce((sum, i) => sum + i.daysHeld, 0) / activeItems.length)
    : 0;
  const stagnantItems = activeItems.filter(i => i.daysHeld > 30);
  const upcomingTasks = mockTasks.filter(t => t.status !== 'done').slice(0, 4);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const monthlyTarget = 5000;

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
            value={summary.activeItems}
            subtitle={`${formatCurrency(summary.activeInventoryCost)} invested`}
            icon={<Package className="h-4 w-4" />}
          />
          <StatCard
            title="Potential Revenue"
            value={formatCurrency(summary.potentialRevenue)}
            subtitle={`Floor: ${formatCurrency(summary.minimumRevenue)}`}
            icon={<DollarSign className="h-4 w-4" />}
          />
          <StatCard
            title="Realized Profit"
            value={formatCurrency(summary.totalProfit)}
            subtitle={`${summary.itemsSold} items sold`}
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
                    {formatCurrency(summary.totalProfit)} / {formatCurrency(monthlyTarget)}
                  </span>
                </div>
                <ProgressBar
                  value={summary.totalProfit}
                  max={monthlyTarget}
                  showPercentage={false}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Stretch Target</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(summary.totalProfit)} / {formatCurrency(10000)}
                  </span>
                </div>
                <ProgressBar
                  value={summary.totalProfit}
                  max={10000}
                  showPercentage={false}
                />
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Avg Margin</p>
                  <p className="text-lg font-semibold">{summary.avgMargin}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Per Partner</p>
                  <p className="text-lg font-semibold">{formatCurrency(summary.totalProfit / 3)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Items Sold</p>
                  <p className="text-lg font-semibold">{summary.itemsSold}</p>
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
                <Link to="/inventory" className="block p-3 rounded-md bg-destructive/10 border border-destructive/20 hover:bg-destructive/15 transition-colors">
                  <p className="text-sm font-medium">{stagnantItems.length} items over 30 days</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Consider price drops or relisting
                  </p>
                </Link>
              )}
              {inventory.filter(i => i.status === 'in-closet').length > 0 && (
                <Link to="/inventory" className="block p-3 rounded-md bg-muted border border-border hover:bg-muted/80 transition-colors">
                  <p className="text-sm font-medium">
                    {inventory.filter(i => i.status === 'in-closet').length} unlisted items
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Capital not working until listed
                  </p>
                </Link>
              )}
              <Link to="/tasks" className="block p-3 rounded-md bg-muted border border-border hover:bg-muted/80 transition-colors">
                <p className="text-sm font-medium">Weekly meeting</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Set agenda for Sunday sync
                </p>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Tasks Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">Upcoming Tasks</CardTitle>
            <Link to="/tasks" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              View all →
            </Link>
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
