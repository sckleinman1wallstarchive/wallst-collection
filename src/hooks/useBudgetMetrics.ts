import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
import { supabase } from '@/integrations/supabase/client';
import { startOfWeek, isAfter } from 'date-fns';

export interface BudgetMetrics {
  liquidCash: number;
  inTransitCost: number;
  deployedThisWeek: number;
  totalOperatingCapital: number;
  inTransitPercent: number;
  deploymentGovernor: number;
  weeklyDeploymentLimit: number;
  isOverDeployed: boolean;
  isInTransitHigh: boolean;
  activeInventoryCost: number;
  engineCapital: number;
  bufferCapital: number;
  longHoldsCapital: number;
}

export function useBudgetMetrics(): BudgetMetrics & { isLoading: boolean } {
  const { inventory, isLoading: inventoryLoading, getActiveItems } = useSupabaseInventory();
  
  const { data: capitalAccount, isLoading: accountsLoading } = useQuery({
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

  const metrics = useMemo(() => {
    const activeItems = getActiveItems();
    
    // Liquid cash from capital accounts
    const liquidCash = capitalAccount?.cash_on_hand || 0;
    
    // In-transit items (status = 'otw')
    const otwItems = inventory.filter(i => i.status === 'otw');
    const inTransitCost = otwItems.reduce((sum, i) => sum + i.acquisitionCost, 0);
    
    // Deployed this week (items purchased in the last 7 days)
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
    const recentPurchases = inventory.filter(i => {
      if (!i.dateAdded) return false;
      const addedDate = new Date(i.dateAdded);
      return isAfter(addedDate, weekStart) && i.status !== 'sold';
    });
    const deployedThisWeek = recentPurchases.reduce((sum, i) => sum + i.acquisitionCost, 0);
    
    // Active inventory cost
    const activeInventoryCost = activeItems.reduce((sum, i) => sum + i.acquisitionCost, 0);
    
    // Total operating capital = liquid cash + active inventory cost
    const totalOperatingCapital = liquidCash + activeInventoryCost;
    
    // In-transit percentage
    const inTransitPercent = totalOperatingCapital > 0 
      ? (inTransitCost / totalOperatingCapital) * 100 
      : 0;
    
    // Weekly deployment governor (45% of operating capital)
    const deploymentGovernor = 0.45;
    const weeklyDeploymentLimit = totalOperatingCapital * deploymentGovernor;
    
    // Red flags
    const isOverDeployed = deployedThisWeek > weeklyDeploymentLimit;
    const isInTransitHigh = inTransitPercent > 45;
    
    // Capital buckets (based on days held)
    // Engine: 0-14 days (fast movers)
    // Buffer: 15-30 days (normal velocity)
    // Long Holds: 30+ days (slow capital)
    const engineItems = activeItems.filter(i => (i.daysHeld || 0) <= 14);
    const bufferItems = activeItems.filter(i => (i.daysHeld || 0) > 14 && (i.daysHeld || 0) <= 30);
    const longHoldItems = activeItems.filter(i => (i.daysHeld || 0) > 30);
    
    const engineCapital = engineItems.reduce((sum, i) => sum + i.acquisitionCost, 0);
    const bufferCapital = bufferItems.reduce((sum, i) => sum + i.acquisitionCost, 0);
    const longHoldsCapital = longHoldItems.reduce((sum, i) => sum + i.acquisitionCost, 0);

    return {
      liquidCash,
      inTransitCost,
      deployedThisWeek,
      totalOperatingCapital,
      inTransitPercent,
      deploymentGovernor,
      weeklyDeploymentLimit,
      isOverDeployed,
      isInTransitHigh,
      activeInventoryCost,
      engineCapital,
      bufferCapital,
      longHoldsCapital,
    };
  }, [inventory, capitalAccount, getActiveItems]);

  return {
    ...metrics,
    isLoading: inventoryLoading || accountsLoading,
  };
}
