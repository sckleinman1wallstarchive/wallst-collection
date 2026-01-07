import { Task, ContentPost, FinancialGoals } from '@/types/inventory';

export const mockTasks: Task[] = [
  {
    id: '1',
    name: 'Photograph new Helmut arrivals',
    category: 'posting',
    dueDate: '2025-01-07',
    status: 'todo',
  },
  {
    id: '2',
    name: 'Update Grailed listings with new comps',
    category: 'inventory',
    dueDate: '2025-01-08',
    status: 'in-progress',
  },
  {
    id: '3',
    name: 'Source at Brooklyn flea market',
    category: 'sourcing',
    dueDate: '2025-01-10',
    status: 'todo',
  },
  {
    id: '4',
    name: 'Reconcile January expenses',
    category: 'backend',
    dueDate: '2025-01-15',
    status: 'todo',
  },
  {
    id: '5',
    name: 'Clean and prep Tabi boots',
    category: 'inventory',
    dueDate: '2025-01-06',
    status: 'todo',
  },
];

export const mockContentPosts: ContentPost[] = [
  {
    id: '1',
    itemName: 'Helmut Lang Bondage Strap Jacket',
    platform: 'instagram',
    date: '2025-01-05',
    result: 'dms',
  },
  {
    id: '2',
    itemName: 'Raf Simons Virginia Creeper Hoodie',
    platform: 'instagram',
    date: '2025-01-04',
    result: 'interest',
  },
  {
    id: '3',
    itemName: 'Rick Owens Geobaskets',
    platform: 'instagram',
    date: '2025-01-03',
    result: 'none',
  },
];

export const mockFinancials: FinancialGoals = {
  monthlyProfitTarget: 5000,
  stretchTarget: 10000,
  targetMargin: 50,
  capitalInjected: 10000,
};