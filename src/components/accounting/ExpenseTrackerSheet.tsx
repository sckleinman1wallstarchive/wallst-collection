import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useExpenses, Expense } from '@/hooks/useExpenses';
import { Receipt, Plus, Trash2, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const CATEGORIES = [
  { value: 'supplies', label: 'Supplies' },
  { value: 'shipping', label: 'Shipping' },
  { value: 'platform-fees', label: 'Platform Fees' },
  { value: 'other', label: 'Other' },
] as const;

const OWNERS = [
  { value: 'Spencer Kleinman', label: 'Spencer' },
  { value: 'Parker Kleinman', label: 'Parker' },
  { value: 'Shared', label: 'Shared' },
] as const;

interface ExpenseTrackerSheetProps {
  children: React.ReactNode;
}

export const ExpenseTrackerSheet = ({ children }: ExpenseTrackerSheetProps) => {
  const { expenses, isLoading, addExpense, deleteExpense, totalExpenses, expensesByCategory } = useExpenses();
  const [isAdding, setIsAdding] = useState(false);
  const [newExpense, setNewExpense] = useState({
    amount: '',
    description: '',
    category: 'other' as const,
    owner: 'Shared' as const,
    date: new Date().toISOString().split('T')[0],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddExpense = async () => {
    if (!newExpense.amount || !newExpense.description) return;
    
    await addExpense({
      amount: parseFloat(newExpense.amount),
      description: newExpense.description,
      category: newExpense.category,
      owner: newExpense.owner,
      date: newExpense.date,
    });

    setNewExpense({
      amount: '',
      description: '',
      category: 'other',
      owner: 'Shared',
      date: new Date().toISOString().split('T')[0],
    });
    setIsAdding(false);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      supplies: 'bg-blue-500/20 text-blue-500',
      shipping: 'bg-orange-500/20 text-orange-500',
      'platform-fees': 'bg-purple-500/20 text-purple-500',
      other: 'bg-muted text-muted-foreground',
    };
    return colors[category] || colors.other;
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Expense Tracker
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-semibold text-destructive">
                -{formatCurrency(totalExpenses)}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">This Month</p>
              <p className="text-2xl font-semibold">
                {formatCurrency(
                  expenses
                    .filter(e => {
                      const expenseDate = new Date(e.date);
                      const now = new Date();
                      return expenseDate.getMonth() === now.getMonth() && 
                             expenseDate.getFullYear() === now.getFullYear();
                    })
                    .reduce((sum, e) => sum + e.amount, 0)
                )}
              </p>
            </Card>
          </div>

          {/* Category Breakdown */}
          {Object.keys(expensesByCategory).length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">By Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(expensesByCategory).map(([category, amount]) => (
                    <Badge key={category} variant="outline" className="text-xs">
                      {category}: {formatCurrency(amount)}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add Expense Form */}
          {isAdding ? (
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Add New Expense</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsAdding(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newExpense.date}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="What was this expense for?"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={newExpense.category}
                      onValueChange={(value: typeof newExpense.category) => 
                        setNewExpense(prev => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Owner</Label>
                    <Select
                      value={newExpense.owner}
                      onValueChange={(value: typeof newExpense.owner) => 
                        setNewExpense(prev => ({ ...prev, owner: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OWNERS.map(owner => (
                          <SelectItem key={owner.value} value={owner.value}>
                            {owner.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleAddExpense} className="w-full">
                  Add Expense
                </Button>
              </div>
            </Card>
          ) : (
            <Button onClick={() => setIsAdding(true)} className="w-full" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          )}

          {/* Expense List */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">All Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : expenses.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(expense.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-medium">{expense.description}</p>
                          <p className="text-xs text-muted-foreground">{expense.owner}</p>
                        </TableCell>
                        <TableCell>
                          <Badge className={getCategoryColor(expense.category)}>
                            {expense.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          -{formatCurrency(expense.amount)}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteExpense(expense.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No expenses recorded yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};
