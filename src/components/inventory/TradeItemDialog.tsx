import { useState } from 'react';
import { InventoryItem } from '@/hooks/useSupabaseInventory';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
import { ArrowRightLeft, Plus, Minus, ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TradeItemDialogProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableItems: InventoryItem[];
  onTrade: (
    itemId: string,
    tradedForItemId: string | null,
    cashDifference: number
  ) => void;
}

export function TradeItemDialog({
  item,
  open,
  onOpenChange,
  availableItems,
  onTrade,
}: TradeItemDialogProps) {
  const [receivedOption, setReceivedOption] = useState<'new' | 'existing'>('new');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [cashDirection, setCashDirection] = useState<'paid' | 'received'>('paid');
  const [cashAmount, setCashAmount] = useState<string>('0');
  const [searchOpen, setSearchOpen] = useState(false);

  if (!item) return null;

  const handleSubmit = () => {
    const cash = parseFloat(cashAmount) || 0;
    // Positive = you paid extra, Negative = they paid you extra
    const cashDifference = cashDirection === 'paid' ? cash : -cash;
    
    onTrade(item.id, receivedOption === 'existing' ? selectedItemId || null : null, cashDifference);
    
    // Reset state
    setReceivedOption('new');
    setSelectedItemId('');
    setCashDirection('paid');
    setCashAmount('0');
    onOpenChange(false);
  };

  // Filter out the current item and sold items from available items
  const selectableItems = availableItems.filter(
    (i) => i.id !== item.id && !['sold', 'scammed', 'refunded', 'traded'].includes(i.status)
  );

  const selectedItem = selectableItems.find(i => i.id === selectedItemId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Record Trade
          </DialogTitle>
          <DialogDescription>
            Trading: <strong>{item.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Item received - two options side by side */}
          <div className="space-y-2">
            <Label>Item Received</Label>
            <div className="grid grid-cols-2 gap-3">
              {/* Add New Item */}
              <Button
                type="button"
                variant={receivedOption === 'new' ? 'default' : 'outline'}
                className="h-auto py-3 flex flex-col items-center gap-1"
                onClick={() => {
                  setReceivedOption('new');
                  setSelectedItemId('');
                }}
              >
                <Plus className="h-5 w-5" />
                <span className="text-sm font-medium">Add New Item</span>
                <span className="text-xs text-muted-foreground">Create after trade</span>
              </Button>
              
              {/* Select Existing */}
              <Button
                type="button"
                variant={receivedOption === 'existing' ? 'default' : 'outline'}
                className="h-auto py-3 flex flex-col items-center gap-1"
                onClick={() => setReceivedOption('existing')}
              >
                <ArrowRightLeft className="h-5 w-5" />
                <span className="text-sm font-medium">Select Existing</span>
                <span className="text-xs text-muted-foreground">From inventory</span>
              </Button>
            </div>
            
            {/* Searchable dropdown only shows when "existing" is selected */}
            {receivedOption === 'existing' && (
              <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={searchOpen}
                    className="w-full justify-between mt-2"
                  >
                    {selectedItem 
                      ? `${selectedItem.name}${selectedItem.size ? ` (${selectedItem.size})` : ''}`
                      : "Search items..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search by name or size..." />
                    <CommandList>
                      <CommandEmpty>No items found</CommandEmpty>
                      <CommandGroup>
                        {selectableItems.map((i) => (
                          <CommandItem
                            key={i.id}
                            value={`${i.name} ${i.size || ''}`}
                            onSelect={() => {
                              setSelectedItemId(i.id);
                              setSearchOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedItemId === i.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {i.name} {i.size ? `(${i.size})` : ''}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* Cash difference */}
          <div className="space-y-3">
            <Label>Cash Difference</Label>
            <RadioGroup
              value={cashDirection}
              onValueChange={(v) => setCashDirection(v as 'paid' | 'received')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="paid" id="paid" />
                <Label htmlFor="paid" className="flex items-center gap-1 cursor-pointer">
                  <Minus className="h-3 w-3" />
                  I paid extra
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="received" id="received" />
                <Label htmlFor="received" className="flex items-center gap-1 cursor-pointer">
                  <Plus className="h-3 w-3" />
                  They paid extra
                </Label>
              </div>
            </RadioGroup>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                type="number"
                min="0"
                step="1"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                className="pl-7"
                placeholder="0"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {cashDirection === 'paid'
                ? 'Enter amount you added on top of your item'
                : 'Enter amount they added on top of their item'}
            </p>
          </div>

          {/* Summary */}
          <div className="p-3 bg-muted rounded-lg space-y-1">
            <p className="text-sm font-medium">Trade Summary</p>
            <p className="text-xs text-muted-foreground">
              {item.name} → {receivedOption === 'existing' && selectedItem 
                ? selectedItem.name 
                : '(will add new item after)'}
            </p>
            {parseFloat(cashAmount) > 0 && (
              <p className="text-xs">
                Cash: {cashDirection === 'paid' ? 'You paid' : 'You received'} ${cashAmount}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSubmit} className="flex-1">
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Confirm Trade
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
