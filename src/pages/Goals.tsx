import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useGoals } from '@/hooks/useGoals';
import { GoalCard } from '@/components/goals/GoalCard';
import { AddGoalDialog } from '@/components/goals/AddGoalDialog';
import { GoalsSummary } from '@/components/goals/GoalsSummary';
import { Button } from '@/components/ui/button';
import { BookOpen, Loader2 } from 'lucide-react';

const Goals = () => {
  const [showSummary, setShowSummary] = useState(false);
  const { goals, isLoading, createGoal, deleteGoal, toggleComplete } = useGoals();

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
    </DashboardLayout>
  );
};

export default Goals;
