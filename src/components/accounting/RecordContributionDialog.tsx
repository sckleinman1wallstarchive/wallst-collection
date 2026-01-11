import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCapitalContributions } from '@/hooks/useCapitalContributions';
import { Loader2 } from 'lucide-react';

interface RecordContributionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RecordContributionDialog = ({
  open,
  onOpenChange,
}: RecordContributionDialogProps) => {
  const { addContribution, isAdding } = useCapitalContributions();
  const [partner, setPartner] = useState<'Spencer Kleinman' | 'Parker Kleinman'>('Spencer Kleinman');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    addContribution(
      {
        partner,
        amount: numAmount,
        date,
        description: description.trim() || 'Capital contribution',
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          // Reset form
          setPartner('Spencer Kleinman');
          setAmount('');
          setDate(new Date().toISOString().split('T')[0]);
          setDescription('');
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Capital Contribution</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="partner">Partner</Label>
            <Select
              value={partner}
              onValueChange={(v) => setPartner(v as 'Spencer Kleinman' | 'Parker Kleinman')}
            >
              <SelectTrigger id="partner">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Spencer Kleinman">Spencer</SelectItem>
                <SelectItem value="Parker Kleinman">Parker</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="pl-7"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
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

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="e.g., Initial investment, Working capital, Equipment fund..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isAdding}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isAdding || !amount}>
              {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Record Contribution
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
