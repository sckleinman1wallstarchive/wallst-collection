import { useState, useMemo } from 'react';
import { InventoryItem, ItemStatus, Owner } from '@/types/inventory';
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
import { Search, ArrowUpDown, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InventoryTableProps {
  items: InventoryItem[];
  onItemClick: (item: InventoryItem) => void;
}

const statusColors: Record<ItemStatus, string> = {
  'in-closet': 'bg-muted text-muted-foreground',
  'listed': 'bg-primary/10 text-primary',
  'on-hold': 'bg-chart-1/20 text-chart-3',
  'sold': 'bg-chart-2/20 text-chart-2',
  'archive-hold': 'bg-accent text-accent-foreground',
  'scammed': 'bg-destructive/20 text-destructive',
  'refunded': 'bg-muted text-muted-foreground',
  'traded': 'bg-chart-4/20 text-chart-4',
};

const statusLabels: Record<ItemStatus, string> = {
  'in-closet': 'In Closet',
  'listed': 'Listed',
  'on-hold': 'On Hold',
  'sold': 'Sold',
  'archive-hold': 'Archive',
  'scammed': 'Scammed',
  'refunded': 'Refunded',
  'traded': 'Traded',
};

type SortField = 'daysHeld' | 'askingPrice' | 'profitPotential' | 'brand' | 'dateAdded';

export function InventoryTable({ items, onItemClick }: InventoryTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('dateAdded');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedItems = useMemo(() => {
    let filtered = items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.brand.toLowerCase().includes(search.toLowerCase());
      
      // Status filter
      let matchesStatus = true;
      if (statusFilter === 'active') matchesStatus = !['sold', 'scammed', 'refunded', 'traded'].includes(item.status);
      else if (statusFilter === 'sold') matchesStatus = item.status === 'sold';
      else if (statusFilter === 'issues') matchesStatus = ['scammed', 'refunded', 'traded'].includes(item.status);
      else if (statusFilter !== 'all') matchesStatus = item.status === statusFilter;

      // Owner filter
      const matchesOwner = ownerFilter === 'all' || item.owner === ownerFilter;

      return matchesSearch && matchesStatus && matchesOwner;
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
        case 'dateAdded':
          aValue = new Date(a.dateAdded).getTime();
          bValue = new Date(b.dateAdded).getTime();
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
  }, [items, search, statusFilter, ownerFilter, sortField, sortDirection]);

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
            <SelectItem value="active">Active Items</SelectItem>
            <SelectItem value="all">All Items</SelectItem>
            <SelectItem value="sold">Sold Items</SelectItem>
            <SelectItem value="issues">Issues (Scammed/Refunded)</SelectItem>
            <SelectItem value="in-closet">In Closet</SelectItem>
            <SelectItem value="listed">Listed</SelectItem>
            <SelectItem value="on-hold">On Hold</SelectItem>
            <SelectItem value="archive-hold">Archive Hold</SelectItem>
          </SelectContent>
        </Select>
        <Select value={ownerFilter} onValueChange={setOwnerFilter}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Owner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Owners</SelectItem>
            <SelectItem value="Parker">Parker</SelectItem>
            <SelectItem value="Spencer">Spencer</SelectItem>
            <SelectItem value="Parker K">Parker K</SelectItem>
            <SelectItem value="Shared">Shared</SelectItem>
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
              <TableHead>Owner</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium hover:bg-transparent"
                  onClick={() => toggleSort('askingPrice')}
                >
                  Asking
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
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedItems.map((item) => (
              <TableRow
                key={item.id}
                className="hover:bg-muted/30 cursor-pointer"
                onClick={() => onItemClick(item)}
              >
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.size && <span className="mr-2">Size {item.size}</span>}
                      <span className="capitalize">{item.category}</span>
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{item.brand}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={statusColors[item.status]}>
                    {statusLabels[item.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{item.owner}</TableCell>
                <TableCell className="text-right font-mono text-sm text-muted-foreground">
                  {formatCurrency(item.acquisitionCost)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {item.status === 'sold' ? formatCurrency(item.salePrice || 0) : formatCurrency(item.askingPrice)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  <span className={item.status === 'sold' ? 'text-chart-2' : ''}>
                    {item.status === 'sold'
                      ? `+${formatCurrency((item.salePrice || 0) - item.acquisitionCost)}`
                      : formatCurrency(item.askingPrice - item.acquisitionCost)}
                  </span>
                </TableCell>
                <TableCell>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredAndSortedItems.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No items found
          </div>
        )}
      </div>
    </div>
  );
}
