export type ItemStatus = 'in-closet' | 'listed' | 'on-hold' | 'sold' | 'archive-hold' | 'scammed' | 'refunded' | 'traded';
export type ItemCategory = 'outerwear' | 'pants' | 'top' | 'footwear' | 'accessory' | 'other';
export type Platform = 'grailed' | 'depop' | 'instagram' | 'in-person' | 'ebay' | 'vinted' | 'mercari' | 'trade' | 'none';

export interface InventoryItem {
  id: string;
  name: string;
  brand: string;
  category: ItemCategory;
  size?: string;
  acquisitionCost: number;
  askingPrice: number;
  lowestAcceptablePrice: number;
  salePrice?: number;
  status: ItemStatus;
  daysHeld: number;
  platform: Platform;
  sourcePlatform?: string;
  notes: string;
  dateAdded: string;
  dateSold?: string;
  soldTo?: string;
}

export interface Task {
  id: string;
  name: string;
  category: 'inventory' | 'posting' | 'sourcing' | 'backend' | 'admin';
  dueDate: string;
  status: 'todo' | 'in-progress' | 'done';
  notes?: string;
}

export interface ContentPost {
  id: string;
  itemName: string;
  platform: Platform;
  date: string;
  result: 'dms' | 'interest' | 'sold' | 'none';
}

export interface FinancialGoals {
  monthlyProfitTarget: number;
  stretchTarget: number;
  targetMargin: number;
  capitalInjected: number;
}