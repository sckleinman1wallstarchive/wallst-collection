import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface KeyUsage {
  id: string;
  name: string;
  used: number;
  limit: number;
  remaining: number;
  exhausted: boolean;
}

export interface RemoveBgUsage {
  totalUsed: number;
  totalLimit: number;
  totalRemaining: number;
  keys: KeyUsage[];
  activeKey: string | null;
  keyCount: number;
  monthYear: string;
  resetDate: string;
  warning: 'approaching_limit' | 'near_limit' | 'at_limit' | null;
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
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60 * 5,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['removebg-usage'] });
  };

  return {
    ...query,
    usage: query.data,
    invalidate,
  };
}
