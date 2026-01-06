import { useState, useMemo } from 'react';
import { InventoryItem, ItemStatus } from '@/types/inventory';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InventoryTableProps {
  items: InventoryItem[];
}

const statusColors: Record<ItemStatus, string> = {
  'in-closet': 'bg-muted text-muted-foreground',
  'listed': 'bg-primary/10 text-primary',
  'on-hold': 'bg-chart-1/20 text-chart-3',
  'sold': 'bg-chart-2/20 text-chart-3',
  'archive-hold': 'bg-accent text-accent-foreground',
};

const statusLabels: Record<ItemStatus, string> = {
  'in-closet': 'In Closet',
  'listed': 'Listed',
  'on-hold': 'On Hold',
  'sold': 'Sold',
  'archive-hold': 'Archive',
};

type SortField = 'daysHeld' | 'askingPrice' | 'profitPotential' | 'brand';

export function InventoryTable({ items }: InventoryTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('daysHeld');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedItems = useMemo(() => {
    let filtered = items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.brand.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortField) {
        case 'profitPotential':
          aValue = a.askingPrice - a.acquisitionCost;
          bValue = b.askingPrice - b.acquisitionCost;
          break;
        case 'daysHeld':
          aValue = a.daysHeld;
          bValue = b.daysHeld;
          break;
        case 'askingPrice':
          aValue = a.askingPrice;
          bValue = b.askingPrice;
          break;
        case 'brand':
          aValue = a.brand;
          bValue = b.brand;
          break;
        default:
          aValue = a.daysHeld;
          bValue = b.daysHeld;
      }

      if (typeof aValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue as string)
          : (bValue as string).localeCompare(aValue);
      }

      return sortDirection === 'asc' ? aValue - (bValue as number) : (bValue as number) - aValue;
    });
  }, [items, search, statusFilter, sortField, sortDirection]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items or brands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="in-closet">In Closet</SelectItem>
            <SelectItem value="listed">Listed</SelectItem>
            <SelectItem value="on-hold">On Hold</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
            <SelectItem value="archive-hold">Archive Hold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-medium">Item</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium hover:bg-transparent"
                  onClick={() => toggleSort('brand')}
                >
                  Brand
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium hover:bg-transparent"
                  onClick={() => toggleSort('askingPrice')}
                >
                  Price
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium hover:bg-transparent"
                  onClick={() => toggleSort('profitPotential')}
                >
                  Profit
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium hover:bg-transparent"
                  onClick={() => toggleSort('daysHeld')}
                >
                  Days
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>Platform</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedItems.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/30">
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{item.brand}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={statusColors[item.status]}>
                    {statusLabels[item.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {formatCurrency(item.askingPrice)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {formatCurrency(item.askingPrice - item.acquisitionCost)}
                </TableCell>
                <TableCell className="text-right">
                  <span className={item.daysHeld > 30 ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                    {item.daysHeld}
                  </span>
                </TableCell>
                <TableCell className="text-sm capitalize text-muted-foreground">
                  {item.platform === 'none' ? '—' : item.platform}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
