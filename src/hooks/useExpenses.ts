import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type DbExpense = Database['public']['Tables']['expenses']['Row'];
type ExpenseCategory = Database['public']['Enums']['expense_category'];
type ItemOwner = Database['public']['Enums']['item_owner'];

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: ExpenseCategory;
  owner: ItemOwner;
  date: string;
  createdAt: string;
}

const toAppExpense = (row: DbExpense): Expense => ({
  id: row.id,
  amount: Number(row.amount),
  description: row.description,
  category: row.category,
  owner: row.owner,
  date: row.date,
  createdAt: row.created_at,
});

export function useExpenses() {
  const queryClient = useQueryClient();

  const { data: expenses = [], isLoading, error } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data.map(toAppExpense);
    },
  });

  const addMutation = useMutation({
    mutationFn: async (expense: Omit<Expense, 'id' | 'createdAt'>) => {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          amount: expense.amount,
          description: expense.description,
          category: expense.category,
          owner: expense.owner,
          date: expense.date,
        })
        .select()
        .single();
      
      if (error) throw error;
      return toAppExpense(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense recorded');
    },
    onError: (error) => {
      toast.error('Failed to add expense: ' + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete expense: ' + error.message);
    },
  });

  const addExpense = (expense: Omit<Expense, 'id' | 'createdAt'>) => 
    addMutation.mutateAsync(expense);
  
  const deleteExpense = (id: string) => deleteMutation.mutateAsync(id);

  const getTotalExpenses = () => expenses.reduce((sum, e) => sum + e.amount, 0);

  const getExpensesByCategory = () => {
    return expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<ExpenseCategory, number>);
  };

  const getExpensesByOwner = () => {
    return expenses.reduce((acc, e) => {
      acc[e.owner] = (acc[e.owner] || 0) + e.amount;
      return acc;
    }, {} as Record<ItemOwner, number>);
  };

  return {
    expenses,
    isLoading,
    error,
    addExpense,
    deleteExpense,
    getTotalExpenses,
    getExpensesByCategory,
    getExpensesByOwner,
    isAdding: addMutation.isPending,
  };
}
