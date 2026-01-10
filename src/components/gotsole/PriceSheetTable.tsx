import { useState } from 'react';
import { InventoryItem } from '@/hooks/useSupabaseInventory';
import { EditableCell } from './EditableCell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DollarSign, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PriceSheetTableProps {
  items: InventoryItem[];
  isEditing: boolean;
  onUpdateItem: (id: string, updates: Partial<InventoryItem>) => void;
  onSellItem: (item: InventoryItem) => void;
}

type SortField = 'name' | 'acquisitionCost' | 'askingPrice' | 'goalPrice' | 'lowestAcceptablePrice' | 'profit';
type SortDirection = 'asc' | 'desc';

export function PriceSheetTable({ items, isEditing, onUpdateItem, onSellItem }: PriceSheetTableProps) {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getProfit = (item: InventoryItem) => {
    const goalPrice = item.goalPrice ?? item.askingPrice ?? 0;
    return goalPrice - item.acquisitionCost;
  };

  const sortedItems = [...items].sort((a, b) => {
    let aVal: number | string;
    let bVal: number | string;

    switch (sortField) {
      case 'name':
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
        break;
      case 'acquisitionCost':
        aVal = a.acquisitionCost;
        bVal = b.acquisitionCost;
        break;
      case 'askingPrice':
        aVal = a.askingPrice ?? 0;
        bVal = b.askingPrice ?? 0;
        break;
      case 'goalPrice':
        aVal = a.goalPrice ?? a.askingPrice ?? 0;
        bVal = b.goalPrice ?? b.askingPrice ?? 0;
        break;
      case 'lowestAcceptablePrice':
        aVal = a.lowestAcceptablePrice ?? 0;
        bVal = b.lowestAcceptablePrice ?? 0;
        break;
      case 'profit':
        aVal = getProfit(a);
        bVal = getProfit(b);
        break;
      default:
        aVal = a.name;
        bVal = b.name;
    }

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortDirection === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className={cn(
          'h-3 w-3 transition-opacity',
          sortField === field ? 'opacity-100' : 'opacity-30'
        )} />
      </div>
    </TableHead>
  );

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table className="print-table">
        <TableHeader>
          <TableRow>
            <SortableHeader field="name">Item</SortableHeader>
            <TableHead>Size</TableHead>
            <SortableHeader field="acquisitionCost">Cost</SortableHeader>
            <SortableHeader field="askingPrice">List</SortableHeader>
            <SortableHeader field="goalPrice">Goal</SortableHeader>
            <SortableHeader field="lowestAcceptablePrice">Floor</SortableHeader>
            <SortableHeader field="profit">Profit</SortableHeader>
            <TableHead>Notes</TableHead>
            <TableHead className="no-print">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedItems.map((item) => {
            const profit = getProfit(item);
            const goalPrice = item.goalPrice ?? item.askingPrice;
            
            return (
              <TableRow key={item.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    {item.brand && (
                      <p className="text-xs text-muted-foreground">{item.brand}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <EditableCell
                      value={item.size}
                      onSave={(val) => onUpdateItem(item.id, { size: val as string | null })}
                      isEditing={true}
                      type="text"
                      placeholder="—"
                      className="w-16 text-xs"
                    />
                  ) : (
                    <Badge variant="outline" className="font-mono text-xs">
                      {item.size || '-'}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm">${item.acquisitionCost}</span>
                </TableCell>
                <TableCell>
                  <EditableCell
                    value={item.askingPrice}
                    onSave={(val) => onUpdateItem(item.id, { askingPrice: val as number | null })}
                    isEditing={isEditing}
                    prefix="$"
                  />
                </TableCell>
                <TableCell>
                  <EditableCell
                    value={item.goalPrice ?? item.askingPrice}
                    onSave={(val) => onUpdateItem(item.id, { goalPrice: val as number | null })}
                    isEditing={isEditing}
                    prefix="$"
                  />
                </TableCell>
                <TableCell>
                  <EditableCell
                    value={item.lowestAcceptablePrice}
                    onSave={(val) => onUpdateItem(item.id, { lowestAcceptablePrice: val as number | null })}
                    isEditing={isEditing}
                    prefix="$"
                  />
                </TableCell>
                <TableCell>
                  <span className={cn(
                    'font-mono text-sm font-semibold',
                    profit >= 0 ? 'text-chart-2' : 'text-destructive'
                  )}>
                    {profit >= 0 ? '+' : ''}${profit}
                  </span>
                </TableCell>
                <TableCell className="max-w-[200px]">
                  <EditableCell
                    value={item.notes}
                    onSave={(val) => onUpdateItem(item.id, { notes: val as string | null })}
                    isEditing={isEditing}
                    type="text"
                    placeholder="Add notes..."
                    className="text-xs"
                  />
                </TableCell>
                <TableCell className="no-print">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSellItem(item)}
                    className="h-7 text-xs"
                  >
                    <DollarSign className="h-3 w-3 mr-1" />
                    Sell
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
