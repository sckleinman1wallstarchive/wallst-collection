import { useState } from 'react';
import { InventoryItem } from '@/types/inventory';

const initialInventory: InventoryItem[] = [
  {
    id: '1',
    name: 'Helmut Lang Bondage Strap Jacket',
    brand: 'Helmut Lang',
    category: 'outerwear',
    acquisitionCost: 280,
    askingPrice: 560,
    lowestAcceptablePrice: 420,
    status: 'listed',
    daysHeld: 14,
    platform: 'grailed',
    notes: 'FW98, excellent condition, rare size 48',
    dateAdded: '2024-12-23',
  },
  {
    id: '2',
    name: 'Raf Simons Virginia Creeper Hoodie',
    brand: 'Raf Simons',
    category: 'top',
    acquisitionCost: 450,
    askingPrice: 995,
    lowestAcceptablePrice: 750,
    status: 'listed',
    daysHeld: 7,
    platform: 'grailed',
    notes: 'AW02, size M, slight fading - priced accordingly',
    dateAdded: '2024-12-30',
  },
  {
    id: '3',
    name: 'Margiela Tabi Boots',
    brand: 'Maison Margiela',
    category: 'footwear',
    acquisitionCost: 320,
    askingPrice: 640,
    lowestAcceptablePrice: 500,
    status: 'in-closet',
    daysHeld: 21,
    platform: 'none',
    notes: 'Size 43, needs cleaning before listing',
    dateAdded: '2024-12-16',
  },
  {
    id: '4',
    name: 'Undercover Scab Tee',
    brand: 'Undercover',
    category: 'top',
    acquisitionCost: 180,
    askingPrice: 450,
    lowestAcceptablePrice: 350,
    status: 'on-hold',
    daysHeld: 3,
    platform: 'instagram',
    notes: 'SS03, buyer requested hold until Friday',
    dateAdded: '2025-01-03',
  },
  {
    id: '5',
    name: 'Rick Owens Geobaskets',
    brand: 'Rick Owens',
    category: 'footwear',
    acquisitionCost: 400,
    askingPrice: 730,
    lowestAcceptablePrice: 580,
    status: 'listed',
    daysHeld: 28,
    platform: 'depop',
    notes: 'Size 44, milk colorway, creasing on toe',
    dateAdded: '2024-12-09',
  },
  {
    id: '6',
    name: 'Number (N)ine Skull Knit',
    brand: 'Number (N)ine',
    category: 'top',
    acquisitionCost: 520,
    askingPrice: 1040,
    lowestAcceptablePrice: 800,
    status: 'archive-hold',
    daysHeld: 45,
    platform: 'none',
    notes: 'Personal grail - not for sale unless exceptional offer',
    dateAdded: '2024-11-22',
  },
  {
    id: '7',
    name: 'CDG Homme Plus Deconstructed Blazer',
    brand: 'Comme des Garçons',
    category: 'outerwear',
    acquisitionCost: 220,
    askingPrice: 490,
    lowestAcceptablePrice: 380,
    salePrice: 425,
    status: 'sold',
    daysHeld: 12,
    platform: 'grailed',
    notes: 'Sold 1/4 - buyer in NYC',
    dateAdded: '2024-12-25',
    dateSold: '2025-01-04',
    soldTo: 'Grailed buyer @archiveking',
  },
  {
    id: '8',
    name: 'Yohji Yamamoto Wide Leg Trousers',
    brand: 'Yohji Yamamoto',
    category: 'pants',
    acquisitionCost: 150,
    askingPrice: 300,
    lowestAcceptablePrice: 230,
    status: 'listed',
    daysHeld: 18,
    platform: 'grailed',
    notes: 'Size 2, black wool, excellent drape',
    dateAdded: '2024-12-19',
  },
  {
    id: '9',
    name: 'Issey Miyake Pleats Please Top',
    brand: 'Issey Miyake',
    category: 'top',
    acquisitionCost: 85,
    askingPrice: 180,
    lowestAcceptablePrice: 140,
    salePrice: 165,
    status: 'sold',
    daysHeld: 5,
    platform: 'instagram',
    notes: 'Quick flip from estate sale',
    dateAdded: '2024-12-28',
    dateSold: '2025-01-02',
    soldTo: 'IG DM buyer',
  },
];

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);

  const addItem = (item: Omit<InventoryItem, 'id' | 'daysHeld'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: Date.now().toString(),
      daysHeld: 0,
    };
    setInventory((prev) => [newItem, ...prev]);
    return newItem;
  };

  const updateItem = (id: string, updates: Partial<InventoryItem>) => {
    setInventory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteItem = (id: string) => {
    setInventory((prev) => prev.filter((item) => item.id !== id));
  };

  const markAsSold = (id: string, salePrice: number, soldTo?: string) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'sold' as const,
              salePrice,
              dateSold: new Date().toISOString().split('T')[0],
              soldTo,
            }
          : item
      )
    );
  };

  const getActiveItems = () => inventory.filter((i) => i.status !== 'sold');
  const getSoldItems = () => inventory.filter((i) => i.status === 'sold');

  const getFinancialSummary = () => {
    const sold = getSoldItems();
    const active = getActiveItems();

    const totalRevenue = sold.reduce((sum, i) => sum + (i.salePrice || 0), 0);
    const totalCostOfSold = sold.reduce((sum, i) => sum + i.acquisitionCost, 0);
    const totalProfit = totalRevenue - totalCostOfSold;
    const activeInventoryCost = active.reduce((sum, i) => sum + i.acquisitionCost, 0);
    const potentialRevenue = active.reduce((sum, i) => sum + i.askingPrice, 0);
    const minimumRevenue = active.reduce((sum, i) => sum + i.lowestAcceptablePrice, 0);

    return {
      totalRevenue,
      totalCostOfSold,
      totalProfit,
      activeInventoryCost,
      potentialRevenue,
      minimumRevenue,
      itemsSold: sold.length,
      activeItems: active.length,
      avgMargin: totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0',
    };
  };

  return {
    inventory,
    addItem,
    updateItem,
    deleteItem,
    markAsSold,
    getActiveItems,
    getSoldItems,
    getFinancialSummary,
  };
}
