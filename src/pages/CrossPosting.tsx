import { useState } from 'react';
import { Package } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ItemSelector } from '@/components/crossposting/ItemSelector';
import { ListingGenerator } from '@/components/crossposting/ListingGenerator';
import { useSupabaseInventory, InventoryItem } from '@/hooks/useSupabaseInventory';

export default function CrossPosting() {
  const { inventory, isLoading } = useSupabaseInventory();
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cross-Posting</h1>
          <p className="text-muted-foreground">
            Generate platform-optimized listings for Grailed, Depop, eBay, Mercari, and Vinted
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select Item</CardTitle>
            <CardDescription>
              Choose an item from your inventory to generate listings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ItemSelector
              items={inventory}
              selectedItem={selectedItem}
              onSelect={setSelectedItem}
            />
          </CardContent>
        </Card>

        {selectedItem && (
          <>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Selected Item</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  {selectedItem.imageUrl ? (
                    <img
                      src={selectedItem.imageUrl}
                      alt={selectedItem.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 space-y-1">
                    <h3 className="font-semibold text-lg">{selectedItem.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedItem.brand} · {selectedItem.size || 'No size'} · {selectedItem.category}
                    </p>
                    <div className="flex gap-4 text-sm pt-1">
                      <span>
                        <span className="text-muted-foreground">Cost:</span>{' '}
                        <span className="font-medium">${selectedItem.acquisitionCost}</span>
                      </span>
                      <span>
                        <span className="text-muted-foreground">Asking:</span>{' '}
                        <span className="font-medium">${selectedItem.askingPrice || 0}</span>
                      </span>
                      <span>
                        <span className="text-muted-foreground">Floor:</span>{' '}
                        <span className="font-medium">${selectedItem.lowestAcceptablePrice || 0}</span>
                      </span>
                    </div>
                    {selectedItem.notes && (
                      <p className="text-sm text-muted-foreground pt-2 border-t mt-2">
                        {selectedItem.notes}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Separator />

            <ListingGenerator item={selectedItem} />
          </>
        )}

        {!selectedItem && !isLoading && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-1">No Item Selected</h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                Select an item from your inventory above to generate platform-optimized listings
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
