import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type DbExpense = Database['public']['Tables']['expenses']['Row'];
type DbInsertExpense = Database['public']['Tables']['expenses']['Insert'];
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

const toDbInsert = (expense: Partial<Expense>): DbInsertExpense => ({
  amount: expense.amount || 0,
  description: expense.description || '',
  category: expense.category || 'other',
  owner: expense.owner || 'Shared',
  date: expense.date || new Date().toISOString().split('T')[0],
});

export const useExpenses = () => {
  const queryClient = useQueryClient();

  const { data: expenses = [], isLoading, error } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(toAppExpense);
    },
  });

  const addExpenseMutation = useMutation({
    mutationFn: async (expense: Partial<Expense>) => {
      const { data, error } = await supabase
        .from('expenses')
        .insert(toDbInsert(expense))
        .select()
        .single();
      
      if (error) throw error;
      return toAppExpense(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense added');
    },
    onError: (error) => {
      toast.error('Failed to add expense: ' + error.message);
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Expense> & { id: string }) => {
      const { data, error } = await supabase
        .from('expenses')
        .update({
          amount: updates.amount,
          description: updates.description,
          category: updates.category,
          owner: updates.owner,
          date: updates.date,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return toAppExpense(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense updated');
    },
    onError: (error) => {
      toast.error('Failed to update expense: ' + error.message);
    },
  });

  const deleteExpenseMutation = useMutation({
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

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const expensesByCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  return {
    expenses,
    isLoading,
    error,
    addExpense: (expense: Partial<Expense>) => addExpenseMutation.mutateAsync(expense),
    updateExpense: (expense: Partial<Expense> & { id: string }) => updateExpenseMutation.mutateAsync(expense),
    deleteExpense: (id: string) => deleteExpenseMutation.mutateAsync(id),
    totalExpenses,
    expensesByCategory,
  };
};
