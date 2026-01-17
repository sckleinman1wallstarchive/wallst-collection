import { Goal } from '@/hooks/useGoals';
import { useMetricProgress } from '@/hooks/useMetricProgress';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Trash2, Pencil, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface GoalCardProps {
  goal: Goal;
  onToggleComplete: (id: string, isComplete: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (goal: Goal) => void;
}

export const GoalCard = ({ goal, onToggleComplete, onDelete, onEdit }: GoalCardProps) => {
  const metricProgress = useMetricProgress(goal);
  
  const ownerColors: Record<string, string> = {
    Parker: 'bg-[#c9b99a] text-black',
    Spencer: 'bg-[#d4c4b0] text-black',
    WSC: 'bg-[#f5f5f0] text-black',
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatMetricValue = (value: number, metricType: string | null) => {
    if (metricType === 'items_sold' || metricType === 'items_sourced') {
      return value.toLocaleString();
    }
    return formatCurrency(value);
  };

  return (
    <div
      className={cn(
        'group relative p-6 rounded-lg transition-all duration-200',
        'bg-[hsl(266,4%,20.8%)] hover:bg-[hsl(266,4%,25%)]',
        'border border-transparent hover:border-[#c9b99a]/30',
        goal.is_complete && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-4">
        <Checkbox
          checked={goal.is_complete}
          onCheckedChange={(checked) => onToggleComplete(goal.id, checked as boolean)}
          className="mt-1 border-white/50 data-[state=checked]:bg-[#c9b99a] data-[state=checked]:border-[#c9b99a]"
        />
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'text-white font-medium text-lg leading-tight',
              goal.is_complete && 'line-through opacity-70'
            )}
          >
            {goal.description}
          </p>
          
          {/* Metric Progress Bar */}
          {metricProgress && (
            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#c9b99a] flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  {formatMetricValue(metricProgress.current, goal.metric_type)} / {formatMetricValue(metricProgress.target, goal.metric_type)}
                </span>
                <span className="text-white/60">{metricProgress.percentage.toFixed(0)}%</span>
              </div>
              <Progress 
                value={metricProgress.percentage} 
                className="h-2 bg-white/10"
              />
            </div>
          )}
          
          <div className="flex items-center gap-2 mt-3">
            <span className="text-white/60 text-sm">{goal.timeframe}</span>
            <Badge className={cn('text-xs font-medium', ownerColors[goal.owner])}>
              {goal.owner}
            </Badge>
            {goal.goal_type === 'metric' && (
              <Badge variant="outline" className="text-xs font-medium border-[#c9b99a]/50 text-[#c9b99a]">
                Metric
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(goal)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-white/50 hover:text-[#c9b99a] hover:bg-transparent"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(goal.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-white/50 hover:text-red-400 hover:bg-transparent"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
