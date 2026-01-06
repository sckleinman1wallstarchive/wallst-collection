export type ItemStatus = 'in-closet' | 'listed' | 'on-hold' | 'sold' | 'archive-hold';
export type ItemCategory = 'outerwear' | 'pants' | 'top' | 'footwear' | 'accessory' | 'other';
export type Platform = 'grailed' | 'depop' | 'instagram' | 'in-person' | 'none';
export type Owner = 'Parker' | 'Spencer' | 'Parker K';

export interface InventoryItem {
  id: string;
  name: string;
  brand: string;
  category: ItemCategory;
  acquisitionCost: number;
  askingPrice: number;
  lowestAcceptablePrice: number;
  salePrice?: number;
  status: ItemStatus;
  daysHeld: number;
  platform: Platform;
  notes: string;
  dateAdded: string;
  dateSold?: string;
  soldTo?: string;
}

export interface Task {
  id: string;
  name: string;
  owner: Owner;
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
  owner: Owner;
  result: 'dms' | 'interest' | 'sold' | 'none';
}

export interface FinancialGoals {
  monthlyProfitTarget: number;
  stretchTarget: number;
  targetMargin: number;
  partnerPayoutTarget: number;
  capitalInjected: number;
}
