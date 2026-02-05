import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, X, ImageOff } from 'lucide-react';
import { usePostingTracker } from '@/hooks/usePostingTracker';
import { PostingPlatformCard } from './PostingPlatformCard';
import { PostingAddItemsDialog } from './PostingAddItemsDialog';
import { InventoryItem } from '@/hooks/useSupabaseInventory';

interface PostingTrackerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventory: InventoryItem[];
}

export function PostingTrackerDialog({
  open,
  onOpenChange,
  inventory,
}: PostingTrackerDialogProps) {
  const {
    platforms,
    trackerItems,
    getItemsForPlatform,
    addPlatform,
    updatePlatform,
    deletePlatform,
    addItemsToPlatform,
    removeItemFromPlatform,
  } = usePostingTracker();

  const [newPlatformName, setNewPlatformName] = useState('');
  const [showAddItems, setShowAddItems] = useState<string | null>(null);
  const [viewingPlatform, setViewingPlatform] = useState<string | null>(null);

  const handleAddPlatform = async () => {
    const name = newPlatformName.trim();
    if (!name) return;
    await addPlatform(name);
    setNewPlatformName('');
  };

  const activePlatform = platforms.find((p) => p.id === showAddItems);
  const viewPlatform = platforms.find((p) => p.id === viewingPlatform);

  const getPostedIdsForPlatform = (platformId: string) => {
    return new Set(
      getItemsForPlatform(platformId).map((i) => i.inventory_item_id)
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Posting Tracker</DialogTitle>
            <DialogDescription>
              Track which items have been posted to each platform
            </DialogDescription>
          </DialogHeader>

          {/* Viewing posted items for a platform */}
          {viewingPlatform && viewPlatform ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{viewPlatform.platform_name} — Posted Items</h3>
                <Button variant="ghost" size="sm" onClick={() => setViewingPlatform(null)}>
                  ← Back
                </Button>
              </div>
              <ScrollArea className="h-[400px]">
                <div className="space-y-1">
                  {getItemsForPlatform(viewingPlatform).map((trackerItem) => {
                    const item = inventory.find((i) => i.id === trackerItem.inventory_item_id);
                    if (!item) return null;
                    return (
                      <div key={trackerItem.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50">
                        <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageOff className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.brand} · {item.size}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeItemFromPlatform({ trackerId: viewingPlatform, itemId: item.id })}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                  {getItemsForPlatform(viewingPlatform).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">No items posted yet</p>
                  )}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Platform Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {platforms.map((platform) => (
                  <PostingPlatformCard
                    key={platform.id}
                    platform={platform}
                    itemCount={getItemsForPlatform(platform.id).length}
                    onAddItems={() => setShowAddItems(platform.id)}
                    onViewItems={() => setViewingPlatform(platform.id)}
                    onDelete={() => deletePlatform(platform.id)}
                    onUpdateArtwork={(url) =>
                      updatePlatform({ id: platform.id, updates: { artwork_url: url } })
                    }
                  />
                ))}
              </div>

              {/* Add New Platform */}
              <div className="flex gap-2 pt-2 border-t">
                <Input
                  placeholder="New platform name..."
                  value={newPlatformName}
                  onChange={(e) => setNewPlatformName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddPlatform()}
                />
                <Button onClick={handleAddPlatform} disabled={!newPlatformName.trim()}>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Items Sub-dialog */}
      {activePlatform && (
        <PostingAddItemsDialog
          open={!!showAddItems}
          onOpenChange={(open) => !open && setShowAddItems(null)}
          platformName={activePlatform.platform_name}
          inventory={inventory}
          alreadyPostedIds={getPostedIdsForPlatform(activePlatform.id)}
          onAddItems={(itemIds) =>
            addItemsToPlatform({ trackerId: activePlatform.id, itemIds })
          }
        />
      )}
    </>
  );
}
