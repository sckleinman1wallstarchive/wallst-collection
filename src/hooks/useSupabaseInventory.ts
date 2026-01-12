import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type DbInventoryItem = Database['public']['Tables']['inventory_items']['Row'];
type DbInsertItem = Database['public']['Tables']['inventory_items']['Insert'];
type DbUpdateItem = Database['public']['Tables']['inventory_items']['Update'];

export interface InventoryItem {
  id: string;
  name: string;
  brand: string | null;
  category: Database['public']['Enums']['item_category'];
  size: string | null;
  acquisitionCost: number;
  askingPrice: number | null;
  goalPrice: number | null;
  lowestAcceptablePrice: number | null;
  salePrice: number | null;
  status: Database['public']['Enums']['item_status'];
  daysHeld: number | null;
  platform: Database['public']['Enums']['platform'];
  platforms: string[];
  platformSold: Database['public']['Enums']['platform'] | null;
  sourcePlatform: string | null;
  source: string | null;
  notes: string | null;
  dateAdded: string | null;
  dateSold: string | null;
  imageUrl: string | null;
  inConvention: boolean;
  everInConvention: boolean;
  tradedForItemId: string | null;
  tradeCashDifference: number | null;
  paidBy: Database['public']['Enums']['item_owner'] | null;
  prioritySale: boolean;
  createdAt: string;
}

// Transform database row to app format
const toAppItem = (row: DbInventoryItem): InventoryItem => ({
  id: row.id,
  name: row.name,
  brand: row.brand,
  category: row.category,
  size: row.size,
  acquisitionCost: row.acquisition_cost,
  askingPrice: row.asking_price,
  goalPrice: (row as any).goal_price || null,
  lowestAcceptablePrice: row.lowest_acceptable_price,
  salePrice: row.sale_price,
  status: row.status,
  daysHeld: row.days_held,
  platform: row.platform,
  platforms: (row as any).platforms || [],
  platformSold: row.platform_sold,
  sourcePlatform: row.source_platform,
  source: row.source,
  notes: row.notes,
  dateAdded: row.date_added,
  dateSold: row.date_sold,
  imageUrl: (row as any).image_url || null,
  inConvention: (row as any).in_convention || false,
  everInConvention: (row as any).ever_in_convention || false,
  tradedForItemId: (row as any).traded_for_item_id || null,
  tradeCashDifference: (row as any).trade_cash_difference || null,
  paidBy: row.paid_by,
  prioritySale: (row as any).priority_sale || false,
  createdAt: row.created_at,
});

// Transform app format to database insert format
const toDbInsert = (item: Partial<InventoryItem>): DbInsertItem => ({
  name: item.name || '',
  brand: item.brand,
  category: item.category || 'other',
  size: item.size,
  acquisition_cost: item.acquisitionCost || 0,
  asking_price: item.askingPrice,
  goal_price: item.goalPrice,
  lowest_acceptable_price: item.lowestAcceptablePrice,
  sale_price: item.salePrice,
  status: item.status || 'in-closet-parker',
  days_held: item.daysHeld,
  platform: item.platform || 'none',
  platforms: item.platforms || [],
  platform_sold: item.platformSold,
  source_platform: item.sourcePlatform,
  source: item.source,
  notes: item.notes,
  date_added: item.dateAdded,
  date_sold: item.dateSold,
  image_url: item.imageUrl,
  in_convention: item.inConvention ?? false,
  ever_in_convention: item.everInConvention ?? false,
  traded_for_item_id: item.tradedForItemId,
  trade_cash_difference: item.tradeCashDifference,
  priority_sale: item.prioritySale ?? false,
} as DbInsertItem);

// Transform app format to database update format
const toDbUpdate = (item: Partial<InventoryItem>): DbUpdateItem => {
  const update: Record<string, any> = {};
  if (item.name !== undefined) update.name = item.name;
  if (item.brand !== undefined) update.brand = item.brand;
  if (item.category !== undefined) update.category = item.category;
  if (item.size !== undefined) update.size = item.size;
  if (item.acquisitionCost !== undefined) update.acquisition_cost = item.acquisitionCost;
  if (item.askingPrice !== undefined) update.asking_price = item.askingPrice;
  if (item.goalPrice !== undefined) update.goal_price = item.goalPrice;
  if (item.lowestAcceptablePrice !== undefined) update.lowest_acceptable_price = item.lowestAcceptablePrice;
  if (item.salePrice !== undefined) update.sale_price = item.salePrice;
  if (item.status !== undefined) update.status = item.status;
  if (item.daysHeld !== undefined) update.days_held = item.daysHeld;
  if (item.platform !== undefined) update.platform = item.platform;
  if (item.platforms !== undefined) update.platforms = item.platforms;
  if (item.platformSold !== undefined) update.platform_sold = item.platformSold;
  if (item.sourcePlatform !== undefined) update.source_platform = item.sourcePlatform;
  if (item.source !== undefined) update.source = item.source;
  if (item.notes !== undefined) update.notes = item.notes;
  if (item.dateAdded !== undefined) update.date_added = item.dateAdded;
  if (item.dateSold !== undefined) update.date_sold = item.dateSold;
  if (item.imageUrl !== undefined) update.image_url = item.imageUrl;
  if (item.inConvention !== undefined) update.in_convention = item.inConvention;
  if (item.everInConvention !== undefined) update.ever_in_convention = item.everInConvention;
  if (item.tradedForItemId !== undefined) update.traded_for_item_id = item.tradedForItemId;
  if (item.tradeCashDifference !== undefined) update.trade_cash_difference = item.tradeCashDifference;
  if (item.prioritySale !== undefined) update.priority_sale = item.prioritySale;
  return update as DbUpdateItem;
};

export function useSupabaseInventory() {
  const queryClient = useQueryClient();

  // Fetch all inventory items
  const { data: inventory = [], isLoading, error } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data.map(toAppItem);
    },
  });

  // Add item
  const addMutation = useMutation({
    mutationFn: async (item: Partial<InventoryItem>) => {
      const { data, error } = await supabase
        .from('inventory_items')
        .insert(toDbInsert(item))
        .select()
        .single();
      
      if (error) throw error;
      return toAppItem(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Item added');
    },
    onError: (error) => {
      toast.error('Failed to add item: ' + error.message);
    },
  });

  // Update item
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<InventoryItem> }) => {
      const { data, error } = await supabase
        .from('inventory_items')
        .update(toDbUpdate(updates))
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return toAppItem(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Item updated');
    },
    onError: (error) => {
      toast.error('Failed to update item: ' + error.message);
    },
  });

  // Delete item
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Item deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete item: ' + error.message);
    },
  });

  // Bulk insert for import
  const bulkInsertMutation = useMutation({
    mutationFn: async (items: Partial<InventoryItem>[]) => {
      const dbItems = items.map(toDbInsert);
      const { data, error } = await supabase
        .from('inventory_items')
        .insert(dbItems)
        .select();
      
      if (error) throw error;
      return data.map(toAppItem);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success(`Imported ${data.length} items`);
    },
    onError: (error) => {
      toast.error('Failed to import items: ' + error.message);
    },
  });

  // Helper functions
  const addItem = (item: Partial<InventoryItem>) => addMutation.mutateAsync(item);
  
  const updateItem = (id: string, updates: Partial<InventoryItem>) => 
    updateMutation.mutateAsync({ id, updates });
  
  const deleteItem = (id: string) => deleteMutation.mutateAsync(id);
  
  const markAsSold = (
    id: string,
    salePrice: number,
    platformSold?: Database['public']['Enums']['platform']
  ) =>
    updateMutation.mutateAsync({
      id,
      updates: {
        status: 'sold',
        salePrice,
        platformSold,
        dateSold: new Date().toISOString().split('T')[0],
        // IMPORTANT: do NOT clear inConvention here.
        // Items sold at the convention should still count toward Got Sole sold stats.
      },
    });

  const markAsUnsold = (id: string) =>
    updateMutation.mutateAsync({
      id,
      updates: {
        status: 'listed',
        salePrice: null,
        platformSold: null,
        dateSold: null,
      },
    });

  const markAsTraded = (
    id: string,
    tradedForItemId: string | null,
    tradeCashDifference: number = 0
  ) =>
    updateMutation.mutateAsync({
      id,
      updates: {
        status: 'traded',
        tradedForItemId,
        tradeCashDifference,
        dateSold: new Date().toISOString().split('T')[0],
        // IMPORTANT: do NOT clear inConvention here.
      },
    });

  const toggleConvention = (id: string, inConvention: boolean) =>
    updateMutation.mutateAsync({ 
      id, 
      updates: { 
        inConvention,
        // Once an item is added to a convention, it's forever tracked for convention analytics
        ...(inConvention ? { everInConvention: true } : {})
      } 
    });

  const tagAsConventionSale = (id: string) =>
    updateMutation.mutateAsync({ id, updates: { everInConvention: true } });

  const bulkInsert = (items: Partial<InventoryItem>[]) => bulkInsertMutation.mutateAsync(items);

  const getActiveItems = () => inventory.filter((i) => 
    i.status !== 'sold' && i.status !== 'scammed' && i.status !== 'refunded' && i.status !== 'traded'
  );
  
  const getSoldItems = () => inventory.filter((i) => i.status === 'sold');

  const getConventionItems = () => inventory.filter((i) => 
    i.inConvention && i.status !== 'sold' && i.status !== 'scammed' && i.status !== 'refunded' && i.status !== 'traded'
  );

  const getIncompleteItems = () => {
    const active = getActiveItems();
    return {
      missingSize: active.filter(i => !i.size),
      missingImage: active.filter(i => !i.imageUrl),
      missingFloorPrice: active.filter(i => !i.lowestAcceptablePrice),
      missingGoalPrice: active.filter(i => !i.goalPrice),
      missingAskingPrice: active.filter(i => !i.askingPrice),
    };
  };

  const getFinancialSummary = () => {
    const sold = getSoldItems();
    const active = getActiveItems();
    const scammed = inventory.filter((i) => i.status === 'scammed');

    const totalSpent = inventory.reduce((sum, i) => sum + i.acquisitionCost, 0);
    const totalRevenue = sold.reduce((sum, i) => sum + (i.salePrice || 0), 0);
    const totalCostOfSold = sold.reduce((sum, i) => sum + i.acquisitionCost, 0);
    const totalProfit = totalRevenue - totalCostOfSold;
    const activeInventoryCost = active.reduce((sum, i) => sum + i.acquisitionCost, 0);
    const potentialRevenue = active.reduce((sum, i) => sum + (i.askingPrice || 0), 0);
    const minimumRevenue = active.reduce((sum, i) => sum + (i.lowestAcceptablePrice || 0), 0);
    const lostToScams = scammed.reduce((sum, i) => sum + i.acquisitionCost, 0);

    return {
      totalSpent,
      totalRevenue,
      totalCostOfSold,
      totalProfit,
      activeInventoryCost,
      potentialRevenue,
      minimumRevenue,
      itemsSold: sold.length,
      activeItems: active.length,
      lostToScams,
      avgMargin: totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0',
    };
  };

  // Get all items ever in a convention that are now sold/shipped (for convention analytics)
  const getConventionSoldItems = () => inventory.filter((i) => 
    i.everInConvention && i.status === 'sold'
  );

  return {
    inventory,
    isLoading,
    error,
    addItem,
    updateItem,
    deleteItem,
    markAsSold,
    markAsUnsold,
    markAsTraded,
    toggleConvention,
    tagAsConventionSale,
    bulkInsert,
    getActiveItems,
    getSoldItems,
    getConventionItems,
    getConventionSoldItems,
    getIncompleteItems,
    getFinancialSummary,
  };
}
