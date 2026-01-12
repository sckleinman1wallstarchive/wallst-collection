import { useExpenses } from '@/hooks/useExpenses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

const categoryLabels: Record<string, string> = {
  supplies: 'Supplies',
  shipping: 'Shipping',
  'platform-fees': 'Platform Fees',
  other: 'Other',
};

export function ExpenseList() {
  const { expenses, isLoading, deleteExpense, getTotalExpenses } = useExpenses();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">Recent Expenses</CardTitle>
        <Badge variant="secondary" className="font-mono">
          Total: {formatCurrency(getTotalExpenses())}
        </Badge>
      </CardHeader>
      <CardContent>
        {expenses.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Paid By</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.slice(0, 10).map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="text-sm">{expense.date}</TableCell>
                  <TableCell className="text-sm font-medium">{expense.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {categoryLabels[expense.category] || expense.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {expense.owner === 'Shared' ? 'Shared' : expense.owner.split(' ')[0]}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-destructive">
                    -{formatCurrency(expense.amount)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => deleteExpense(expense.id)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No expenses recorded yet</p>
        )}
      </CardContent>
    </Card>
  );
}
