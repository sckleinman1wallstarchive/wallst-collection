import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ContributionDetail {
  date: string;
  description: string;
  amount: number;
}

interface CashFlowData {
  operating: {
    cashFromSales: number;
    cashPaidForInventory: number;
    netOperating: number;
  };
  investing: {
    equipmentPurchases: number;
    equipmentSales: number;
    netInvesting: number;
  };
  financing: {
    spencerContributions: number;
    parkerContributions: number;
    distributions: number;
    netFinancing: number;
  };
  summary: {
    netCashChange: number;
    beginningCash: number;
    endingCash: number;
  };
  details: {
    salesItems: Array<{ date: string; name: string; amount: number }>;
    purchaseItems: Array<{ date: string; name: string; amount: number }>;
    spencerContributions: ContributionDetail[];
    parkerContributions: ContributionDetail[];
  };
}

export const useCashFlow = () => {
  const { inventory, isLoading: inventoryLoading, getSoldItems } = useSupabaseInventory();

  const { data: capitalAccount, isLoading: capitalLoading } = useQuery({
    queryKey: ['capital_accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('capital_accounts')
        .select('*')
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch capital contribution transactions
  const { data: contributionTransactions = [], isLoading: contributionsLoading } = useQuery({
    queryKey: ['capital_contributions_for_cashflow'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('type', 'capital_contribution')
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const soldItems = getSoldItems();

  // Calculate Operating Activities
  const cashFromSales = soldItems.reduce((sum, item) => sum + (item.salePrice || 0), 0);
  const cashPaidForInventory = inventory.reduce((sum, item) => sum + item.acquisitionCost, 0);
  const netOperating = cashFromSales - cashPaidForInventory;

  // Sales details for breakdown
  const salesItems = soldItems
    .filter(item => item.salePrice && item.salePrice > 0)
    .map(item => ({
      date: item.dateSold || '',
      name: item.name,
      amount: item.salePrice || 0,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Purchase details for breakdown
  const purchaseItems = inventory
    .filter(item => item.acquisitionCost > 0)
    .map(item => ({
      date: item.dateAdded || '',
      name: item.name,
      amount: -item.acquisitionCost,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Investing Activities (placeholder - can be expanded later)
  const equipmentPurchases = 0;
  const equipmentSales = 0;
  const netInvesting = equipmentSales - equipmentPurchases;

  // Financing Activities
  const spencerContributions = capitalAccount?.spencer_investment || 0;
  const parkerContributions = capitalAccount?.parker_investment || 0;
  const distributions = 0; // Placeholder for future distributions tracking
  const netFinancing = spencerContributions + parkerContributions - distributions;

  // Parse contribution details by partner
  const spencerContributionDetails: ContributionDetail[] = contributionTransactions
    .filter((t) => t.category === 'Spencer Kleinman')
    .map((t) => ({
      date: t.date,
      description: t.description,
      amount: Number(t.amount),
    }));

  const parkerContributionDetails: ContributionDetail[] = contributionTransactions
    .filter((t) => t.category === 'Parker Kleinman')
    .map((t) => ({
      date: t.date,
      description: t.description,
      amount: Number(t.amount),
    }));

  // Summary
  const netCashChange = netOperating + netInvesting + netFinancing;
  const beginningCash = 0; // Starting point
  const endingCash = capitalAccount?.cash_on_hand || 0;

  const cashFlowData: CashFlowData = {
    operating: {
      cashFromSales,
      cashPaidForInventory,
      netOperating,
    },
    investing: {
      equipmentPurchases,
      equipmentSales,
      netInvesting,
    },
    financing: {
      spencerContributions,
      parkerContributions,
      distributions,
      netFinancing,
    },
    summary: {
      netCashChange,
      beginningCash,
      endingCash,
    },
    details: {
      salesItems,
      purchaseItems,
      spencerContributions: spencerContributionDetails,
      parkerContributions: parkerContributionDetails,
    },
  };

  return {
    cashFlowData,
    isLoading: inventoryLoading || capitalLoading || contributionsLoading,
  };
};
