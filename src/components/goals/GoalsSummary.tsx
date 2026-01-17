import { useState, useEffect } from 'react';
import { Goal } from '@/hooks/useGoals';
import { useMetricProgress } from '@/hooks/useMetricProgress';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ImageOff, Search, Loader2, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface GoalsSummaryProps {
  goals: Goal[];
  onBack: () => void;
}

const GoalSummaryItem = ({ goal, index }: { goal: Goal; index: number }) => {
  const [searchedImage, setSearchedImage] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const metricProgress = useMetricProgress(goal);

  const ownerColors: Record<string, string> = {
    Parker: 'text-[#c9b99a]',
    Spencer: 'text-[#d4c4b0]',
    WSC: 'text-[#f5f5f0]',
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatMetricValue = (value: number, metricType: string | null) => {
    if (metricType === 'items_sold' || metricType === 'items_sourced') {
      return value.toLocaleString();
    }
    return formatCurrency(value);
  };

  const searchArtwork = async () => {
    if (!goal.art_style) return;
    
    setSearching(true);
    try {
      const response = await supabase.functions.invoke('search-artwork', {
        body: { artStyle: goal.art_style, goalDescription: goal.description }
      });

      if (response.data?.imageUrl) {
        setSearchedImage(response.data.imageUrl);
      }
    } catch (error) {
      console.error('Artwork search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const isEven = index % 2 === 0;

  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 gap-0',
        'border-b border-[#c9b99a]/10 last:border-b-0'
      )}
    >
      {/* Text Side */}
      <div
        className={cn(
          'p-12 md:p-16 lg:p-20 flex flex-col justify-center min-h-[50vh]',
          'bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d]',
          !isEven && 'md:order-2'
        )}
      >
        <p
          className={cn(
            'text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight text-white mb-8',
            goal.is_complete && 'line-through opacity-60'
          )}
        >
          {goal.description}
        </p>

        {/* Metric Progress */}
        {metricProgress && (
          <div className="mb-6 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#c9b99a] flex items-center gap-2">
                <Target className="h-4 w-4" />
                {formatMetricValue(metricProgress.current, goal.metric_type)} / {formatMetricValue(metricProgress.target, goal.metric_type)}
              </span>
              <span className="text-white/60">{metricProgress.percentage.toFixed(0)}%</span>
            </div>
            <Progress 
              value={metricProgress.percentage} 
              className="h-3 bg-white/10"
            />
          </div>
        )}

        <div className="flex items-center gap-4 text-base md:text-lg">
          <span className="text-white/50">{goal.timeframe}</span>
          <span className="text-white/30">|</span>
          <span className={ownerColors[goal.owner]}>{goal.owner}</span>
        </div>
        {goal.is_complete && (
          <div className="mt-6 inline-flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="text-green-400 text-base font-medium">Completed</span>
          </div>
        )}
      </div>

      {/* Art Side */}
      <div
        className={cn(
          'min-h-[50vh] flex items-center justify-center',
          'bg-gradient-to-br from-[#c9b99a]/10 to-[#d4c4b0]/5',
          !isEven && 'md:order-1'
        )}
      >
        {goal.image_url || searchedImage ? (
          <img
            src={searchedImage || goal.image_url!}
            alt={goal.description}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center p-12">
            <ImageOff className="h-16 w-16 text-[#c9b99a]/30 mx-auto mb-4" />
            {goal.art_style ? (
              <div className="space-y-4">
                <p className="text-[#c9b99a]/50 text-lg italic">
                  Style: {goal.art_style}
                </p>
                <Button
                  onClick={searchArtwork}
                  disabled={searching}
                  variant="outline"
                  className="bg-transparent border-[#c9b99a]/50 text-[#c9b99a] hover:bg-[#c9b99a]/10"
                >
                  {searching ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search Artwork
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <p className="text-white/30 text-lg">No image</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const GoalsSummary = ({ goals, onBack }: GoalsSummaryProps) => {
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#1a1a1a] via-[#0d0d0d] to-black overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#1a1a1a]/90 backdrop-blur-sm border-b border-[#c9b99a]/20">
        <div className="w-full px-8 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[#f5f5f0] tracking-tight">Goals Summary</h1>
            <p className="text-[#c9b99a] text-sm">Wall St Collection</p>
          </div>
        </div>
      </div>

      {/* Goals List - Full Width */}
      <div className="w-full">
        {goals.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/50 text-lg">No goals yet. Add some goals to see them here.</p>
          </div>
        ) : (
          goals.map((goal, index) => (
            <GoalSummaryItem key={goal.id} goal={goal} index={index} />
          ))
        )}
      </div>
    </div>
  );
};
