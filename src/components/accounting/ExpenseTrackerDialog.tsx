import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useExpenses } from '@/hooks/useExpenses';
import { Database } from '@/integrations/supabase/types';

type ExpenseCategory = Database['public']['Enums']['expense_category'];
type ItemOwner = Database['public']['Enums']['item_owner'];

interface ExpenseTrackerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'supplies', label: 'Supplies' },
  { value: 'shipping', label: 'Shipping' },
  { value: 'platform-fees', label: 'Platform Fees' },
  { value: 'other', label: 'Other' },
];

const OWNERS: { value: ItemOwner; label: string }[] = [
  { value: 'Shared', label: 'Shared' },
  { value: 'Spencer Kleinman', label: 'Spencer' },
  { value: 'Parker Kleinman', label: 'Parker' },
];

export function ExpenseTrackerDialog({ open, onOpenChange }: ExpenseTrackerDialogProps) {
  const { addExpense, isAdding } = useExpenses();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('other');
  const [owner, setOwner] = useState<ItemOwner>('Shared');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !description) return;

    await addExpense({
      amount: parseFloat(amount),
      description,
      category,
      owner,
      date,
    });

    // Reset form
    setAmount('');
    setDescription('');
    setCategory('other');
    setOwner('Shared');
    setDate(new Date().toISOString().split('T')[0]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="What was this expense for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Paid By</Label>
              <Select value={owner} onValueChange={(v) => setOwner(v as ItemOwner)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OWNERS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isAdding}>
              {isAdding ? 'Saving...' : 'Save Expense'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
