import { useMemo } from 'react';
import { useSupabaseInventory } from './useSupabaseInventory';
import { Goal } from './useGoals';

export interface MetricProgress {
  current: number;
  target: number;
  percentage: number;
}

export const useMetricProgress = (goal: Goal): MetricProgress | null => {
  const { inventory } = useSupabaseInventory();

  return useMemo(() => {
    if (goal.goal_type !== 'metric' || !goal.metric_type || !goal.metric_target) {
      return null;
    }

    const startDate = goal.start_date ? new Date(goal.start_date) : null;
    const endDate = goal.end_date ? new Date(goal.end_date) : null;

    // Filter inventory items by date range if specified
    const filteredItems = inventory?.filter((item) => {
      const itemDate = item.dateAdded ? new Date(item.dateAdded) : new Date(item.createdAt);
      
      if (startDate && itemDate < startDate) return false;
      if (endDate && itemDate > endDate) return false;
      
      return true;
    }) || [];

    let current = 0;

    switch (goal.metric_type) {
      case 'inventory_cost':
        // Total acquisition cost of items sourced in date range
        current = filteredItems.reduce((sum, item) => sum + (item.acquisitionCost || 0), 0);
        break;
      
      case 'revenue':
        // Total revenue from sales in date range
        const soldItems = filteredItems.filter((item) => {
          if (!['sold', 'traded'].includes(item.status)) return false;
          if (!item.dateSold) return false;
          const soldDate = new Date(item.dateSold);
          if (startDate && soldDate < startDate) return false;
          if (endDate && soldDate > endDate) return false;
          return true;
        });
        current = soldItems.reduce((sum, item) => {
          const salePrice = item.salePrice || 0;
          const tradeCash = item.tradeCashDifference || 0;
          return sum + salePrice + (tradeCash > 0 ? tradeCash : 0);
        }, 0);
        break;
      
      case 'profit':
        // Total profit from sales in date range
        const profitItems = filteredItems.filter((item) => {
          if (!['sold', 'traded'].includes(item.status)) return false;
          if (!item.dateSold) return false;
          const soldDate = new Date(item.dateSold);
          if (startDate && soldDate < startDate) return false;
          if (endDate && soldDate > endDate) return false;
          return true;
        });
        current = profitItems.reduce((sum, item) => {
          const salePrice = item.salePrice || 0;
          const cost = item.acquisitionCost || 0;
          const tradeCash = item.tradeCashDifference || 0;
          return sum + (salePrice - cost) + tradeCash;
        }, 0);
        break;
      
      case 'items_sold':
        // Count of items sold in date range
        current = filteredItems.filter((item) => {
          if (!['sold', 'traded'].includes(item.status)) return false;
          if (!item.dateSold) return false;
          const soldDate = new Date(item.dateSold);
          if (startDate && soldDate < startDate) return false;
          if (endDate && soldDate > endDate) return false;
          return true;
        }).length;
        break;
      
      case 'items_sourced':
        // Count of items added in date range
        current = filteredItems.length;
        break;
      
      default:
        return null;
    }

    const target = goal.metric_target;
    const percentage = target > 0 ? Math.min(100, (current / target) * 100) : 0;

    return { current, target, percentage };
  }, [goal, inventory]);
};
