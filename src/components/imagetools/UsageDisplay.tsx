import { RemoveBgUsage } from '@/hooks/useRemoveBgUsage';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UsageDisplayProps {
  usage: RemoveBgUsage | undefined;
  isLoading: boolean;
}

export function UsageDisplay({ usage, isLoading }: UsageDisplayProps) {
  if (isLoading) {
    return (
      <div className="p-3 rounded-lg border border-border bg-muted/30 animate-pulse">
        <div className="h-4 bg-muted rounded w-3/4 mb-2" />
        <div className="h-2 bg-muted rounded w-full" />
      </div>
    );
  }

  if (!usage) {
    return null;
  }

  const percentage = (usage.used / usage.limit) * 100;

  const getStatusColor = () => {
    if (usage.warning === 'at_limit') return 'text-destructive';
    if (usage.warning === 'near_limit') return 'text-orange-500';
    if (usage.warning === 'approaching_limit') return 'text-yellow-500';
    return 'text-green-500';
  };

  const getProgressColor = () => {
    if (usage.warning === 'at_limit') return 'bg-destructive';
    if (usage.warning === 'near_limit') return 'bg-orange-500';
    if (usage.warning === 'approaching_limit') return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getIcon = () => {
    if (usage.warning === 'at_limit') {
      return <XCircle className="h-5 w-5 text-destructive" />;
    }
    if (usage.warning === 'near_limit' || usage.warning === 'approaching_limit') {
      return <AlertTriangle className={cn('h-5 w-5', getStatusColor())} />;
    }
    return <CheckCircle2 className="h-5 w-5 text-green-500" />;
  };

  const getMessage = () => {
    if (usage.warning === 'at_limit') {
      return `Monthly limit reached. Resets ${usage.resetDate}`;
    }
    if (usage.warning === 'near_limit') {
      return `Almost out! Only ${usage.remaining} left`;
    }
    if (usage.warning === 'approaching_limit') {
      return `Approaching limit: ${usage.remaining} remaining`;
    }
    return `${usage.remaining} credits remaining`;
  };

  return (
    <div className={cn(
      'p-3 rounded-lg border transition-colors',
      usage.warning === 'at_limit' && 'border-destructive/50 bg-destructive/10',
      usage.warning === 'near_limit' && 'border-orange-500/50 bg-orange-500/10',
      usage.warning === 'approaching_limit' && 'border-yellow-500/50 bg-yellow-500/10',
      !usage.warning && 'border-green-500/50 bg-green-500/10'
    )}>
      <div className="flex items-center gap-2 mb-2">
        {getIcon()}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className={cn('text-sm font-medium', getStatusColor())}>
              {usage.used}/{usage.limit} free credits used
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {getMessage()}
          </span>
        </div>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full transition-all', getProgressColor())}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
