 import { useMemo } from 'react';
 import { useQuery } from '@tanstack/react-query';
 import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
 import { useExpenses } from '@/hooks/useExpenses';
 import { supabase } from '@/integrations/supabase/client';
 import { startOfWeek, startOfMonth, isAfter, isWithinInterval, endOfMonth } from 'date-fns';
 
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
   // Operating Budget (monthly for expenses, dividends, small costs)
   operatingBudget: number;
   operatingSpentThisMonth: number;
   operatingRemaining: number;
   isOperatingLow: boolean;
   // Deployment Budget (weekly for inventory purchases)
   deploymentRemaining: number;
 }
 
 export function useBudgetMetrics(): BudgetMetrics & { isLoading: boolean } {
   const { inventory, isLoading: inventoryLoading, getActiveItems } = useSupabaseInventory();
   const { expenses, isLoading: expensesLoading } = useExpenses();
   
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
     const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
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
     const engineItems = activeItems.filter(i => (i.daysHeld || 0) <= 14);
     const bufferItems = activeItems.filter(i => (i.daysHeld || 0) > 14 && (i.daysHeld || 0) <= 30);
     const longHoldItems = activeItems.filter(i => (i.daysHeld || 0) > 30);
     
     const engineCapital = engineItems.reduce((sum, i) => sum + i.acquisitionCost, 0);
     const bufferCapital = bufferItems.reduce((sum, i) => sum + i.acquisitionCost, 0);
     const longHoldsCapital = longHoldItems.reduce((sum, i) => sum + i.acquisitionCost, 0);
 
     // Operating Budget (12% of operating capital for monthly expenses)
     const operatingBudgetPercent = 0.12;
     const operatingBudget = totalOperatingCapital * operatingBudgetPercent;
     
     // Calculate expenses spent this month
     const now = new Date();
     const monthStart = startOfMonth(now);
     const monthEnd = endOfMonth(now);
     const thisMonthExpenses = expenses.filter(e => {
       const expenseDate = new Date(e.date);
       return isWithinInterval(expenseDate, { start: monthStart, end: monthEnd });
     });
     const operatingSpentThisMonth = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
     const operatingRemaining = Math.max(0, operatingBudget - operatingSpentThisMonth);
     const isOperatingLow = operatingRemaining < operatingBudget * 0.2;
     
     // Deployment remaining
     const deploymentRemaining = Math.max(0, weeklyDeploymentLimit - deployedThisWeek);
 
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
       operatingBudget,
       operatingSpentThisMonth,
       operatingRemaining,
       isOperatingLow,
       deploymentRemaining,
     };
   }, [inventory, capitalAccount, getActiveItems, expenses]);
 
   return {
     ...metrics,
     isLoading: inventoryLoading || accountsLoading || expensesLoading,
   };
 }