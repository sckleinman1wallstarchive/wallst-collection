import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useGoals, Goal, UpdateGoalInput } from '@/hooks/useGoals';
import { GoalCard } from '@/components/goals/GoalCard';
import { AddGoalDialog } from '@/components/goals/AddGoalDialog';
import { EditGoalDialog } from '@/components/goals/EditGoalDialog';
import { GoalsSummary } from '@/components/goals/GoalsSummary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Loader2, DollarSign } from 'lucide-react';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';

const Goals = () => {
  const [showSummary, setShowSummary] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const { goals, isLoading, createGoal, deleteGoal, toggleComplete, updateGoal } = useGoals();
  const { getFinancialSummary } = useSupabaseInventory();
  const summary = getFinancialSummary();

  // Revenue goals
  const revenueGoal = 8333;
  const stretchGoal = 10000;
  const currentRevenue = summary.totalProfit;
  const revenuePercentage = Math.min(100, (currentRevenue / revenueGoal) * 100);
  const stretchPercentage = Math.min(100, (currentRevenue / stretchGoal) * 100);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
  };

  const handleUpdateGoal = (updates: UpdateGoalInput) => {
    updateGoal.mutate(updates);
  };

  if (showSummary) {
    return <GoalsSummary goals={goals} onBack={() => setShowSummary(false)} />;
  }

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-4rem)] bg-[hsl(266,4%,20.8%)] rounded-lg p-6">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">Goals</h1>
              <p className="text-white/50 text-sm mt-1">
                Track your business and personal milestones
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowSummary(true)}
              className="bg-transparent border-[#c9b99a]/50 text-[#c9b99a] hover:bg-[#c9b99a]/10 hover:text-[#d4c4b0]"
              disabled={goals.length === 0}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              View Summary
            </Button>
          </div>

          {/* Revenue Progress Card */}
          <Card className="bg-[hsl(266,4%,25%)] border-[#c9b99a]/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-white flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-[#c9b99a]" />
                Monthly Revenue Target
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/60">Goal</span>
                  <span className="text-sm font-medium text-white">
                    {formatCurrency(currentRevenue)} / {formatCurrency(revenueGoal)}
                  </span>
                </div>
                <Progress 
                  value={revenuePercentage} 
                  className="h-3 bg-white/10"
                />
                <p className="text-xs text-white/40 mt-1">{revenuePercentage.toFixed(0)}% complete</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/60">Stretch Goal</span>
                  <span className="text-sm font-medium text-white">
                    {formatCurrency(currentRevenue)} / {formatCurrency(stretchGoal)}
                  </span>
                </div>
                <Progress 
                  value={stretchPercentage} 
                  className="h-3 bg-white/10"
                />
                <p className="text-xs text-white/40 mt-1">{stretchPercentage.toFixed(0)}% complete</p>
              </div>
            </CardContent>
          </Card>

          {/* Goals Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 text-white/50 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onToggleComplete={(id, isComplete) => toggleComplete.mutate({ id, is_complete: isComplete })}
                  onDelete={(id) => deleteGoal.mutate(id)}
                  onEdit={handleEditGoal}
                />
              ))}
              <AddGoalDialog
                onAddGoal={(goal) => createGoal.mutate(goal)}
                isLoading={createGoal.isPending}
              />
            </div>
          )}

          {/* Empty State Enhancement */}
          {!isLoading && goals.length === 0 && (
            <div className="text-center py-8">
              <p className="text-white/40 text-sm">
                Add your first goal to get started tracking your milestones
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Goal Dialog */}
      <EditGoalDialog
        goal={editingGoal}
        open={!!editingGoal}
        onOpenChange={(open) => !open && setEditingGoal(null)}
        onUpdateGoal={handleUpdateGoal}
        isLoading={updateGoal.isPending}
      />
    </DashboardLayout>
  );
};

export default Goals;
