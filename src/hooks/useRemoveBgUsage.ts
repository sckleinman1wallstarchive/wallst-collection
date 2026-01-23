import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RemoveBgUsage {
  used: number;
  limit: number;
  remaining: number;
  monthYear: string;
  resetDate: string;
  warning: 'approaching_limit' | 'near_limit' | 'at_limit' | null;
  lastUpdated: string | null;
}

export function useRemoveBgUsage() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['removebg-usage'],
    queryFn: async (): Promise<RemoveBgUsage> => {
      const { data, error } = await supabase.functions.invoke('check-removebg-usage');
      
      if (error) {
        throw error;
      }
      
      return data;
    },
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['removebg-usage'] });
  };

  return {
    ...query,
    invalidate,
  };
}
