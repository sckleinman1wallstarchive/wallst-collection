import { Goal } from '@/hooks/useGoals';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GoalsSummaryProps {
  goals: Goal[];
  onBack: () => void;
}

export const GoalsSummary = ({ goals, onBack }: GoalsSummaryProps) => {
  const ownerColors: Record<string, string> = {
    Parker: 'text-[#c9b99a]',
    Spencer: 'text-[#d4c4b0]',
    WSC: 'text-[#f5f5f0]',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] via-[#0d0d0d] to-black">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#1a1a1a]/90 backdrop-blur-sm border-b border-[#c9b99a]/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#f5f5f0] tracking-tight">Goals Summary</h1>
            <p className="text-[#c9b99a] text-sm">Wall St Collection</p>
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="max-w-4xl mx-auto py-12 px-6 space-y-0">
        {goals.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/50 text-lg">No goals yet. Add some goals to see them here.</p>
          </div>
        ) : (
          goals.map((goal, index) => {
            const isEven = index % 2 === 0;
            return (
              <div
                key={goal.id}
                className={cn(
                  'grid grid-cols-1 md:grid-cols-2 gap-0',
                  'border-b border-[#c9b99a]/10 last:border-b-0'
                )}
              >
                {/* Text Side */}
                <div
                  className={cn(
                    'p-8 md:p-12 flex flex-col justify-center',
                    'bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d]',
                    !isEven && 'md:order-2'
                  )}
                >
                  <p
                    className={cn(
                      'text-2xl md:text-3xl font-semibold leading-tight text-white mb-6',
                      goal.is_complete && 'line-through opacity-60'
                    )}
                  >
                    {goal.description}
                  </p>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-white/50">{goal.timeframe}</span>
                    <span className="text-white/30">|</span>
                    <span className={ownerColors[goal.owner]}>{goal.owner}</span>
                  </div>
                  {goal.is_complete && (
                    <div className="mt-4 inline-flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                      <span className="text-green-400 text-sm font-medium">Completed</span>
                    </div>
                  )}
                </div>

                {/* Art Side */}
                <div
                  className={cn(
                    'aspect-square md:aspect-auto min-h-[250px] flex items-center justify-center',
                    'bg-gradient-to-br from-[#c9b99a]/10 to-[#d4c4b0]/5',
                    !isEven && 'md:order-1'
                  )}
                >
                  {goal.image_url ? (
                    <img
                      src={goal.image_url}
                      alt={goal.description}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-8">
                      <ImageOff className="h-12 w-12 text-[#c9b99a]/30 mx-auto mb-3" />
                      {goal.art_style ? (
                        <p className="text-[#c9b99a]/50 text-sm italic">
                          Style: {goal.art_style}
                        </p>
                      ) : (
                        <p className="text-white/30 text-sm">No image</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
