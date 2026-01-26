import { useState } from 'react';
import { Check, ChevronsUpDown, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { InventoryItem } from '@/hooks/useSupabaseInventory';

interface ItemSelectorProps {
  items: InventoryItem[];
  selectedItem: InventoryItem | null;
  onSelect: (item: InventoryItem | null) => void;
}

export function ItemSelector({ items, selectedItem, onSelect }: ItemSelectorProps) {
  const [open, setOpen] = useState(false);

  // Filter to active items that can be cross-posted
  const activeItems = items.filter(item => 
    ['for-sale', 'listed', 'in-closet-parker', 'in-closet-spencer', 'in-closet'].includes(item.status)
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-[48px] py-2"
        >
          {selectedItem ? (
            <div className="flex items-center gap-3 text-left">
              {selectedItem.imageUrl ? (
                <img 
                  src={selectedItem.imageUrl} 
                  alt={selectedItem.name}
                  className="w-10 h-10 object-cover rounded"
                />
              ) : (
                <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                  <Package className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-medium">{selectedItem.name}</span>
                <span className="text-xs text-muted-foreground">
                  {selectedItem.brand} · {selectedItem.size || 'No size'} · ${selectedItem.askingPrice || 0}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground">Search or select an item...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 z-50 bg-popover" align="start">
        <Command>
          <CommandInput placeholder="Search by name or brand..." />
          <CommandList>
            <CommandEmpty>No items found.</CommandEmpty>
            <CommandGroup heading="Active Inventory">
              {activeItems.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.name} ${item.brand || ''}`}
                  onSelect={() => {
                    onSelect(item);
                    setOpen(false);
                  }}
                  className="flex items-center gap-3 py-2"
                >
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.name}
                      className="w-8 h-8 object-cover rounded"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex flex-col flex-1">
                    <span className="font-medium text-sm">{item.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.brand} · {item.size || 'No size'} · ${item.askingPrice || 0}
                    </span>
                  </div>
                  <Check
                    className={cn(
                      "h-4 w-4",
                      selectedItem?.id === item.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
