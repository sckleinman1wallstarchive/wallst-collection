import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Contribution {
  id: string;
  partner: 'Spencer Kleinman' | 'Parker Kleinman';
  amount: number;
  date: string;
  description: string;
  created_at: string;
}

interface AddContributionParams {
  partner: 'Spencer Kleinman' | 'Parker Kleinman';
  amount: number;
  date: string;
  description: string;
}

export const useCapitalContributions = () => {
  const queryClient = useQueryClient();

  // Fetch all capital contribution transactions
  const { data: contributions = [], isLoading } = useQuery({
    queryKey: ['capital_contributions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('type', 'capital_contribution')
        .order('date', { ascending: false });

      if (error) throw error;

      return (data || []).map((t) => ({
        id: t.id,
        partner: t.category as 'Spencer Kleinman' | 'Parker Kleinman',
        amount: Number(t.amount),
        date: t.date,
        description: t.description,
        created_at: t.created_at,
      })) as Contribution[];
    },
  });

  // Add a new contribution
  const addContributionMutation = useMutation({
    mutationFn: async (params: AddContributionParams) => {
      // 1. Insert into transactions table
      const { error: txError } = await supabase.from('transactions').insert({
        type: 'capital_contribution',
        category: params.partner,
        amount: params.amount,
        date: params.date,
        description: params.description,
      });

      if (txError) throw txError;

      // 2. Update capital_accounts
      // First, get current capital account
      const { data: account, error: fetchError } = await supabase
        .from('capital_accounts')
        .select('*')
        .maybeSingle();

      if (fetchError) throw fetchError;

      const isSpencer = params.partner === 'Spencer Kleinman';
      
      if (account) {
        // Update existing account
        const updateData = isSpencer
          ? { 
              spencer_investment: Number(account.spencer_investment) + params.amount,
              cash_on_hand: Number(account.cash_on_hand) + params.amount
            }
          : { 
              parker_investment: Number(account.parker_investment) + params.amount,
              cash_on_hand: Number(account.cash_on_hand) + params.amount
            };

        const { error: updateError } = await supabase
          .from('capital_accounts')
          .update(updateData)
          .eq('id', account.id);

        if (updateError) throw updateError;
      } else {
        // Create new account
        const insertData = {
          spencer_investment: isSpencer ? params.amount : 0,
          parker_investment: isSpencer ? 0 : params.amount,
          cash_on_hand: params.amount,
        };

        const { error: insertError } = await supabase
          .from('capital_accounts')
          .insert(insertData);

        if (insertError) throw insertError;
      }

      return params;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['capital_contributions'] });
      queryClient.invalidateQueries({ queryKey: ['capital_accounts'] });
      toast.success('Contribution recorded successfully');
    },
    onError: (error) => {
      console.error('Failed to record contribution:', error);
      toast.error('Failed to record contribution');
    },
  });

  // Get contributions by partner
  const getContributionsByPartner = (partner: 'Spencer Kleinman' | 'Parker Kleinman') => {
    return contributions.filter((c) => c.partner === partner);
  };

  return {
    contributions,
    isLoading,
    addContribution: addContributionMutation.mutate,
    isAdding: addContributionMutation.isPending,
    getContributionsByPartner,
  };
};
