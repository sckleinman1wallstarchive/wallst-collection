import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ImageOff, ChevronDown, ChevronUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InventoryItem } from '@/hooks/useSupabaseInventory';

interface InventoryImageSelectorProps {
  inventory: InventoryItem[];
  isLoading: boolean;
  selectedImages: Map<string, Set<string>>; // itemId -> Set of image URLs
  onSelectionChange: (selection: Map<string, Set<string>>) => void;
}

export function InventoryImageSelector({
  inventory,
  isLoading,
  selectedImages,
  onSelectionChange,
}: InventoryImageSelectorProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  // Filter items that have images
  const itemsWithImages = inventory.filter(
    (item) => item.imageUrls && item.imageUrls.length > 0
  );

  const getItemImageCount = (item: InventoryItem) => item.imageUrls?.length || 0;

  const getSelectedCount = (itemId: string) => {
    return selectedImages.get(itemId)?.size || 0;
  };

  const isItemFullySelected = (item: InventoryItem) => {
    const selected = selectedImages.get(item.id);
    return selected?.size === getItemImageCount(item);
  };

  const isItemPartiallySelected = (item: InventoryItem) => {
    const count = getSelectedCount(item.id);
    return count > 0 && count < getItemImageCount(item);
  };

  const toggleItemSelection = (item: InventoryItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newSelection = new Map(selectedImages);
    const currentSelection = newSelection.get(item.id);
    
    if (currentSelection && currentSelection.size === getItemImageCount(item)) {
      // Deselect all
      newSelection.delete(item.id);
    } else {
      // Select all images
      newSelection.set(item.id, new Set(item.imageUrls || []));
    }
    
    onSelectionChange(newSelection);
  };

  const toggleSingleImage = (itemId: string, imageUrl: string) => {
    const newSelection = new Map(selectedImages);
    const currentSelection = newSelection.get(itemId) || new Set<string>();
    
    if (currentSelection.has(imageUrl)) {
      currentSelection.delete(imageUrl);
      if (currentSelection.size === 0) {
        newSelection.delete(itemId);
      } else {
        newSelection.set(itemId, currentSelection);
      }
    } else {
      currentSelection.add(imageUrl);
      newSelection.set(itemId, currentSelection);
    }
    
    onSelectionChange(newSelection);
  };

  const handleItemClick = (item: InventoryItem) => {
    if (expandedItem === item.id) {
      setExpandedItem(null);
    } else {
      setExpandedItem(item.id);
    }
  };

  const selectAll = () => {
    const newSelection = new Map<string, Set<string>>();
    itemsWithImages.forEach((item) => {
      if (item.imageUrls && item.imageUrls.length > 0) {
        newSelection.set(item.id, new Set(item.imageUrls));
      }
    });
    onSelectionChange(newSelection);
  };

  const clearSelection = () => {
    onSelectionChange(new Map());
  };

  const getTotalSelectedImages = () => {
    let total = 0;
    selectedImages.forEach((urls) => {
      total += urls.size;
    });
    return total;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2 justify-end">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  if (itemsWithImages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[250px] text-muted-foreground">
        <ImageOff className="h-12 w-12 mb-2" />
        <p>No inventory items with images</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {getTotalSelectedImages()} images from {selectedImages.size} items selected
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={selectAll}>
            Select All
          </Button>
          <Button variant="outline" size="sm" onClick={clearSelection}>
            Clear
          </Button>
        </div>
      </div>

      {/* Item Grid */}
      <ScrollArea className="h-[350px]">
        <div className="space-y-2">
          {itemsWithImages.map((item) => {
            const isExpanded = expandedItem === item.id;
            const coverImage = item.imageUrls?.[0];
            const imageCount = getItemImageCount(item);
            const selectedCount = getSelectedCount(item.id);
            
            return (
              <div key={item.id} className="border rounded-lg overflow-hidden">
                {/* Item Header - Cover Image */}
                <div
                  className={cn(
                    "flex items-center gap-3 p-2 cursor-pointer transition-colors",
                    isExpanded ? "bg-muted/50" : "hover:bg-muted/30"
                  )}
                  onClick={() => handleItemClick(item)}
                >
                  {/* Cover Image with Checkbox */}
                  <div className="relative w-16 h-16 flex-shrink-0">
                    {coverImage ? (
                      <img
                        src={coverImage}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted rounded-md flex items-center justify-center">
                        <ImageOff className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div 
                      className="absolute top-1 left-1"
                      onClick={(e) => toggleItemSelection(item, e)}
                    >
                      <Checkbox
                        checked={isItemFullySelected(item)}
                        className={cn(
                          "bg-background/90",
                          isItemPartiallySelected(item) && "data-[state=unchecked]:bg-primary/50"
                        )}
                      />
                    </div>
                  </div>

                  {/* Item Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedCount > 0 ? (
                        <span className="text-primary">{selectedCount}/{imageCount} selected</span>
                      ) : (
                        <span>{imageCount} photo{imageCount !== 1 ? 's' : ''}</span>
                      )}
                    </p>
                  </div>

                  {/* Expand/Collapse */}
                  <div className="flex items-center gap-2">
                    {imageCount > 1 && (
                      <span className="text-xs text-muted-foreground">
                        Click to {isExpanded ? 'collapse' : 'expand'}
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Expanded Image Grid */}
                {isExpanded && imageCount > 0 && (
                  <div className="p-2 pt-0 border-t bg-muted/20">
                    <div className="grid grid-cols-5 gap-2 mt-2">
                      {item.imageUrls?.map((url, idx) => {
                        const isSelected = selectedImages.get(item.id)?.has(url);
                        return (
                          <div
                            key={`${item.id}-${idx}`}
                            className={cn(
                              "relative aspect-square rounded-md overflow-hidden cursor-pointer border-2 transition-all",
                              isSelected
                                ? "border-primary ring-2 ring-primary/20"
                                : "border-transparent hover:border-muted-foreground/50"
                            )}
                            onClick={() => toggleSingleImage(item.id, url)}
                          >
                            <img
                              src={url}
                              alt={`${item.name} ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-1 left-1">
                              <Checkbox
                                checked={isSelected}
                                className="bg-background/90"
                              />
                            </div>
                            {idx === 0 && (
                              <span className="absolute bottom-0 left-0 right-0 bg-background/80 text-[8px] text-center py-0.5">
                                Cover
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
