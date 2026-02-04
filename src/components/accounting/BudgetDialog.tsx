import { useBudgetMetrics } from '@/hooks/useBudgetMetrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  Wallet, 
  TrendingUp, 
  AlertTriangle, 
  Package,
  Clock,
  Gauge
} from 'lucide-react';

interface BudgetDialogProps {
  onBack: () => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

export function BudgetDialog({ onBack }: BudgetDialogProps) {
  const metrics = useBudgetMetrics();

  if (metrics.isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const deploymentPercent = metrics.weeklyDeploymentLimit > 0
    ? (metrics.deployedThisWeek / metrics.weeklyDeploymentLimit) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Budget & Capital</h1>
          <p className="text-muted-foreground text-sm">
            Capital governance based on Dealer Operating System
          </p>
        </div>
      </div>

      {/* Alert Banners */}
      {(metrics.isOverDeployed || metrics.isInTransitHigh) && (
        <div className="space-y-2">
          {metrics.isOverDeployed && (
            <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Weekly Deployment Exceeded</p>
                <p className="text-sm text-muted-foreground">
                  You've deployed {formatCurrency(metrics.deployedThisWeek)} this week, 
                  exceeding the 45% governor limit of {formatCurrency(metrics.weeklyDeploymentLimit)}.
                </p>
              </div>
            </div>
          )}
          {metrics.isInTransitHigh && (
            <div className="flex items-center gap-3 p-4 bg-chart-4/10 border border-chart-4/20 rounded-lg">
              <Package className="h-5 w-5 text-chart-4" />
              <div>
                <p className="font-medium text-chart-4">High In-Transit Inventory</p>
                <p className="text-sm text-muted-foreground">
                  {metrics.inTransitPercent.toFixed(0)}% of capital is in transit. 
                  Keep this under 45% to maintain liquidity.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-chart-2/20 rounded-lg">
              <Wallet className="h-6 w-6 text-chart-2" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Liquid Cash</p>
              <p className="text-2xl font-semibold">{formatCurrency(metrics.liquidCash)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Operating Capital</p>
              <p className="text-2xl font-semibold">{formatCurrency(metrics.totalOperatingCapital)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${metrics.isInTransitHigh ? 'bg-destructive/20' : 'bg-chart-4/20'}`}>
              <Package className={`h-6 w-6 ${metrics.isInTransitHigh ? 'text-destructive' : 'text-chart-4'}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">In Transit</p>
              <p className="text-2xl font-semibold">{formatCurrency(metrics.inTransitCost)}</p>
              <Badge variant={metrics.isInTransitHigh ? "destructive" : "secondary"} className="mt-1">
                {metrics.inTransitPercent.toFixed(0)}% of capital
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Weekly Deployment Governor */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Weekly Deployment Governor
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Cap weekly spending at 45% of operating capital
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Deployed This Week</span>
              <span className={metrics.isOverDeployed ? 'text-destructive font-semibold' : ''}>
                {formatCurrency(metrics.deployedThisWeek)} / {formatCurrency(metrics.weeklyDeploymentLimit)}
              </span>
            </div>
            <Progress 
              value={Math.min(deploymentPercent, 100)} 
              className={metrics.isOverDeployed ? '[&>div]:bg-destructive' : ''}
            />
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Remaining Budget</span>
            <span className="font-mono">
              {formatCurrency(Math.max(0, metrics.weeklyDeploymentLimit - metrics.deployedThisWeek))}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Capital Buckets */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Capital Velocity Buckets
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            How fast your capital is moving
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-chart-2/10 border border-chart-2/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-chart-2">Engine</span>
                <Badge variant="outline" className="text-xs">0-14 days</Badge>
              </div>
              <p className="text-2xl font-semibold">{formatCurrency(metrics.engineCapital)}</p>
              <p className="text-xs text-muted-foreground mt-1">Fast-moving inventory</p>
            </div>

            <div className="p-4 bg-chart-4/10 border border-chart-4/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-chart-4">Buffer</span>
                <Badge variant="outline" className="text-xs">15-30 days</Badge>
              </div>
              <p className="text-2xl font-semibold">{formatCurrency(metrics.bufferCapital)}</p>
              <p className="text-xs text-muted-foreground mt-1">Normal velocity</p>
            </div>

            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-destructive">Long Holds</span>
                <Badge variant="outline" className="text-xs">30+ days</Badge>
              </div>
              <p className="text-2xl font-semibold">{formatCurrency(metrics.longHoldsCapital)}</p>
              <p className="text-xs text-muted-foreground mt-1">Capital blockers</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* In-Transit Gauge */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">In-Transit Inventory Gauge</CardTitle>
          <p className="text-xs text-muted-foreground">
            Keep OTW items under 45% of operating capital
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Current In-Transit</span>
              <span className={metrics.isInTransitHigh ? 'text-destructive font-semibold' : ''}>
                {metrics.inTransitPercent.toFixed(0)}% / 45% max
              </span>
            </div>
            <Progress 
              value={Math.min((metrics.inTransitPercent / 45) * 100, 100)} 
              className={metrics.isInTransitHigh ? '[&>div]:bg-destructive' : '[&>div]:bg-chart-4'}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">In-Transit Cost</p>
              <p className="font-semibold">{formatCurrency(metrics.inTransitCost)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Active Inventory</p>
              <p className="font-semibold">{formatCurrency(metrics.activeInventoryCost)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
