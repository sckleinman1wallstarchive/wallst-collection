import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { mapDatabaseError } from '@/lib/errorHandler';

type DbInventoryItem = Database['public']['Tables']['inventory_items']['Row'];
type DbInsertItem = Database['public']['Tables']['inventory_items']['Insert'];
type DbUpdateItem = Database['public']['Tables']['inventory_items']['Update'];

export interface InventoryItem {
  id: string;
  name: string;
  brand: string | null;
  brandCategory: string | null;
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
  imageUrls: string[];
  inConvention: boolean;
  everInConvention: boolean;
  tradedForItemId: string | null;
  tradeCashDifference: number | null;
  paidBy: Database['public']['Enums']['item_owner'] | null;
  prioritySale: boolean;
  attentionNote: string | null;
  createdAt: string;
}

// Transform database row to app format
const toAppItem = (row: DbInventoryItem): InventoryItem => ({
  id: row.id,
  name: row.name,
  brand: row.brand,
  brandCategory: (row as any).brand_category || null,
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
  imageUrls: (row as any).image_urls || [],
  inConvention: (row as any).in_convention || false,
  everInConvention: (row as any).ever_in_convention || false,
  tradedForItemId: (row as any).traded_for_item_id || null,
  tradeCashDifference: (row as any).trade_cash_difference || null,
  paidBy: row.paid_by,
  prioritySale: (row as any).priority_sale || false,
  attentionNote: (row as any).attention_note || null,
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
  image_urls: item.imageUrls || [],
  in_convention: item.inConvention ?? false,
  ever_in_convention: item.everInConvention ?? false,
  traded_for_item_id: item.tradedForItemId,
  trade_cash_difference: item.tradeCashDifference,
  priority_sale: item.prioritySale ?? false,
  attention_note: item.attentionNote,
  paid_by: item.paidBy || 'Shared',
} as DbInsertItem);

// Helper to adjust cash_on_hand
const adjustCashOnHand = async (amount: number) => {
  const { data: account } = await supabase
    .from('capital_accounts')
    .select('*')
    .maybeSingle();
  
  if (account) {
    await supabase
      .from('capital_accounts')
      .update({ cash_on_hand: Number(account.cash_on_hand) + amount })
      .eq('id', account.id);
  }
};

// Transform app format to database update format
const toDbUpdate = (item: Partial<InventoryItem>): DbUpdateItem => {
  const update: Record<string, any> = {};
  if (item.name !== undefined) update.name = item.name;
  if (item.brand !== undefined) update.brand = item.brand;
  if (item.brandCategory !== undefined) update.brand_category = item.brandCategory;
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
  if (item.imageUrls !== undefined) update.image_urls = item.imageUrls;
  if (item.inConvention !== undefined) update.in_convention = item.inConvention;
  if (item.everInConvention !== undefined) update.ever_in_convention = item.everInConvention;
  if (item.tradedForItemId !== undefined) update.traded_for_item_id = item.tradedForItemId;
  if (item.tradeCashDifference !== undefined) update.trade_cash_difference = item.tradeCashDifference;
  if (item.prioritySale !== undefined) update.priority_sale = item.prioritySale;
  if (item.attentionNote !== undefined) update.attention_note = item.attentionNote;
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
      
      // Deduct from cash if paid by Shared (business account)
      const paidBy = item.paidBy || 'Shared';
      if (paidBy === 'Shared') {
        await adjustCashOnHand(-(item.acquisitionCost || 0));
      }
      
      return toAppItem(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['capital_accounts'] });
      toast.success('Item added');
    },
    onError: (error) => {
      toast.error(mapDatabaseError(error));
    },
  });

  // Update item
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates, previousItem }: { id: string; updates: Partial<InventoryItem>; previousItem?: InventoryItem }) => {
      const { data, error } = await supabase
        .from('inventory_items')
        .update(toDbUpdate(updates))
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Handle refund: if status changed to 'refunded' and was a Shared purchase, add cost back
      if (updates.status === 'refunded' && previousItem && previousItem.paidBy === 'Shared') {
        await adjustCashOnHand(previousItem.acquisitionCost);
        queryClient.invalidateQueries({ queryKey: ['capital_accounts'] });
      }
      
      return toAppItem(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Item updated');
    },
    onError: (error) => {
      toast.error(mapDatabaseError(error));
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
      toast.error(mapDatabaseError(error));
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
      toast.error(mapDatabaseError(error));
    },
  });

  // Helper functions
  const addItem = (item: Partial<InventoryItem>) => addMutation.mutateAsync(item);
  
  const updateItem = (id: string, updates: Partial<InventoryItem>, previousItem?: InventoryItem) => 
    updateMutation.mutateAsync({ id, updates, previousItem });
  
  const deleteItem = (id: string) => deleteMutation.mutateAsync(id);
  
  const markAsSold = async (
    id: string,
    salePrice: number,
    platformSold?: Database['public']['Enums']['platform'],
    dateSold?: string
  ) => {
    // Add sale price to cash
    await adjustCashOnHand(salePrice);
    queryClient.invalidateQueries({ queryKey: ['capital_accounts'] });
    
    return updateMutation.mutateAsync({
      id,
      updates: {
        status: 'sold',
        salePrice,
        platformSold,
        dateSold: dateSold || new Date().toISOString().split('T')[0],
        // IMPORTANT: do NOT clear inConvention here.
        // Items sold at the convention should still count toward Got Sole sold stats.
      },
    });
  };

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
      missingImage: active.filter(i => !i.imageUrl && (!i.imageUrls || i.imageUrls.length === 0)),
      missingFloorPrice: active.filter(i => !i.lowestAcceptablePrice),
      missingGoalPrice: active.filter(i => !i.goalPrice),
      missingAskingPrice: active.filter(i => !i.askingPrice),
    };
  };

  const getFinancialSummary = () => {
    const sold = getSoldItems();
    const active = getActiveItems();
    const scammed = inventory.filter((i) => i.status === 'scammed');
    const refunded = inventory.filter((i) => i.status === 'refunded');
    const traded = inventory.filter((i) => i.status === 'traded');

    // Exclude refunded items from totalSpent (we got that money back)
    const nonRefundedItems = inventory.filter((i) => i.status !== 'refunded');
    const totalSpent = nonRefundedItems.reduce((sum, i) => sum + i.acquisitionCost, 0);
    const refundedAmount = refunded.reduce((sum, i) => sum + i.acquisitionCost, 0);
    
    // Cash received from trades (negative tradeCashDifference = you received cash)
    const tradeCashReceived = traded.reduce((sum, i) => {
      const diff = i.tradeCashDifference || 0;
      return sum + (diff < 0 ? Math.abs(diff) : 0);
    }, 0);
    
    // Cash paid in trades (positive tradeCashDifference = you paid cash)
    const tradeCashPaid = traded.reduce((sum, i) => {
      const diff = i.tradeCashDifference || 0;
      return sum + (diff > 0 ? diff : 0);
    }, 0);

    // Revenue includes sales + cash received from trades
    const saleRevenue = sold.reduce((sum, i) => sum + (i.salePrice || 0), 0);
    const totalRevenue = saleRevenue + tradeCashReceived;
    
    // COGS includes sold items' cost + traded items' cost ONLY when cash was received
    // (trades with no cash are inventory swaps - profit realized when received item sells)
    const soldCost = sold.reduce((sum, i) => sum + i.acquisitionCost, 0);
    const tradedCostForCashReceived = traded.reduce((sum, i) => {
      const diff = i.tradeCashDifference || 0;
      // Only count cost if you received cash in this trade
      return sum + (diff < 0 ? i.acquisitionCost : 0);
    }, 0);
    const totalCostOfSold = soldCost + tradedCostForCashReceived;
    
    const totalProfit = totalRevenue - totalCostOfSold;
    const activeInventoryCost = active.reduce((sum, i) => sum + i.acquisitionCost, 0);
    const potentialRevenue = active.reduce((sum, i) => sum + (i.askingPrice || 0), 0);
    const minimumRevenue = active.reduce((sum, i) => sum + (i.lowestAcceptablePrice || 0), 0);
    const lostToScams = scammed.reduce((sum, i) => sum + i.acquisitionCost, 0);

    return {
      totalSpent,
      refundedAmount,
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
      tradeCashReceived,
      tradeCashPaid,
      tradedItemsCount: traded.length,
    };
  };

  // Get all items ever in a convention that are now sold/shipped (for convention analytics)
  const getConventionSoldItems = () => inventory.filter((i) => 
    i.everInConvention && i.status === 'sold'
  );

  // Get all items that need attention (have an attention note)
  const getAttentionItems = () => inventory.filter((i) => i.attentionNote);
  // Get items marked for sale (for storefront)
  const getForSaleItems = () => inventory.filter((i) => i.status === 'for-sale');

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
    getAttentionItems,
    getIncompleteItems,
    getFinancialSummary,
    getForSaleItems,
  };
}
