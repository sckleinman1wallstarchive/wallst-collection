import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
import { useExpenses } from '@/hooks/useExpenses';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ContributionDetail {
  date: string;
  description: string;
  amount: number;
}

interface ExpenseDetail {
  date: string;
  description: string;
  amount: number;
  category: string;
}

interface CashFlowData {
  operating: {
    cashFromSales: number;
    cashPaidForInventory: number;
    cashPaidForExpenses: number;
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
    expectedCash: number;
  };
  details: {
    salesItems: Array<{ date: string; name: string; amount: number }>;
    purchaseItems: Array<{ date: string; name: string; amount: number; paidBy: string }>;
    wsaPurchaseItems: Array<{ date: string; name: string; amount: number }>;
    expenseItems: ExpenseDetail[];
    spencerContributions: ContributionDetail[];
    parkerContributions: ContributionDetail[];
  };
}

export const useCashFlow = () => {
  const { inventory, isLoading: inventoryLoading, getSoldItems } = useSupabaseInventory();
  const { expenses, isLoading: expensesLoading } = useExpenses();

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
  
  // Separate WSA purchases (Shared) from personal purchases (Spencer/Parker)
  // Personal purchases don't come from WSA cash - they come from contributions
  const wsaPurchases = inventory.filter((item) => item.paidBy === 'Shared');
  const cashPaidForInventory = wsaPurchases.reduce((sum, item) => sum + item.acquisitionCost, 0);
  
  const cashPaidForExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netOperating = cashFromSales - cashPaidForInventory - cashPaidForExpenses;

  // Sales details for breakdown
  const salesItems = soldItems
    .filter(item => item.salePrice && item.salePrice > 0)
    .map(item => ({
      date: item.dateSold || '',
      name: item.name,
      amount: item.salePrice || 0,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // All purchase details for breakdown (for reference)
  const purchaseItems = inventory
    .filter(item => item.acquisitionCost > 0)
    .map(item => ({
      date: item.dateAdded || '',
      name: item.name,
      amount: -item.acquisitionCost,
      paidBy: item.paidBy || 'Shared',
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // WSA-only purchases for operating section
  const wsaPurchaseItems = wsaPurchases
    .filter(item => item.acquisitionCost > 0)
    .map(item => ({
      date: item.dateAdded || '',
      name: item.name,
      amount: -item.acquisitionCost,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Expense details for breakdown
  const expenseItems: ExpenseDetail[] = expenses.map(exp => ({
    date: exp.date,
    description: exp.description,
    amount: -exp.amount,
    category: exp.category,
  }));

  // Investing Activities (placeholder - can be expanded later)
  const equipmentPurchases = 0;
  const equipmentSales = 0;
  const netInvesting = equipmentSales - equipmentPurchases;

  // Financing Activities - Get from contribution transactions, not capital_accounts
  // This ensures we count the actual recorded contributions
  const spencerContributions = contributionTransactions
    .filter((t) => t.category === 'Spencer Kleinman')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const parkerContributions = contributionTransactions
    .filter((t) => t.category === 'Parker Kleinman')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Calculate distributions as the difference between expected and actual cash
  // Expected Cash = Beginning Cash + Contributions + Revenue - COGS (WSA only) - Expenses
  const beginningCash = 0;
  const expectedCash = beginningCash + spencerContributions + parkerContributions + cashFromSales - cashPaidForInventory - cashPaidForExpenses;
  const actualCash = capitalAccount?.cash_on_hand || 0;
  const distributions = Math.max(0, expectedCash - actualCash); // Only positive if money was taken out

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
  const endingCash = actualCash;

  const cashFlowData: CashFlowData = {
    operating: {
      cashFromSales,
      cashPaidForInventory,
      cashPaidForExpenses,
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
      expectedCash,
    },
    details: {
      salesItems,
      purchaseItems,
      wsaPurchaseItems,
      expenseItems,
      spencerContributions: spencerContributionDetails,
      parkerContributions: parkerContributionDetails,
    },
  };

  return {
    cashFlowData,
    isLoading: inventoryLoading || capitalLoading || contributionsLoading || expensesLoading,
  };
};
