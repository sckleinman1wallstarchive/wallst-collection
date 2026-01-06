import { Task } from '@/types/inventory';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
}

const statusIcons = {
  'todo': Circle,
  'in-progress': Clock,
  'done': CheckCircle2,
};

const statusStyles = {
  'todo': 'text-muted-foreground',
  'in-progress': 'text-chart-1',
  'done': 'text-chart-2',
};

const ownerColors: Record<string, string> = {
  'Parker': 'bg-chart-1/20 text-chart-3',
  'Spencer': 'bg-chart-2/20 text-chart-3',
  'Parker K': 'bg-chart-4/30 text-chart-3',
};

export function TaskList({ tasks }: TaskListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (dateString: string, status: Task['status']) => {
    if (status === 'done') return false;
    const dueDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  return (
    <div className="space-y-2">
      {tasks.map((task) => {
        const Icon = statusIcons[task.status];
        const overdue = isOverdue(task.dueDate, task.status);
        
        return (
          <Card key={task.id} className="bg-card hover:bg-muted/30 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Icon className={`h-5 w-5 mt-0.5 ${statusStyles[task.status]}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`font-medium text-sm ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                      {task.name}
                    </p>
                    <Badge variant="secondary" className={ownerColors[task.owner]}>
                      {task.owner}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground capitalize">{task.category}</span>
                    <span className={`text-xs ${overdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                      {overdue ? 'Overdue: ' : 'Due: '}{formatDate(task.dueDate)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
