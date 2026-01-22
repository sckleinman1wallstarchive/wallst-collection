import { useState } from 'react';
import { Loader2, User, ShoppingBag, Info } from 'lucide-react';
import { usePublicInventory, useClosetInventory, PublicInventoryItem } from '@/hooks/usePublicInventory';
import { StorefrontProductCard } from '@/components/storefront/StorefrontProductCard';
import { StorefrontProductDetail } from '@/components/storefront/StorefrontProductDetail';
import { PersonalCollectionCard } from '@/components/storefront/PersonalCollectionCard';
import { ClosetItemDetail } from '@/components/storefront/ClosetItemDetail';
import { StorefrontWelcome } from '@/components/storefront/StorefrontWelcome';
import { StorefrontSidebar } from '@/components/storefront/StorefrontSidebar';
import { ClosetSelection } from '@/components/storefront/ClosetSelection';
import { ShopCart } from '@/components/shop/ShopCart';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';

type StorefrontView = 'welcome' | 'shop-all' | 'closet-selection' | 'parker-closet' | 'spencer-closet' | 'about-us';

export default function Storefront() {
  const [currentView, setCurrentView] = useState<StorefrontView>('welcome');
  const [selectedProduct, setSelectedProduct] = useState<PublicInventoryItem | null>(null);
  const [selectedClosetItem, setSelectedClosetItem] = useState<PublicInventoryItem | null>(null);
  
  // Fetch shop items (for-sale status)
  const { data: shopItems, isLoading: shopLoading } = usePublicInventory();
  
  // Fetch closet items
  const { data: parkerItems, isLoading: parkerLoading } = useClosetInventory('parker');
  const { data: spencerItems, isLoading: spencerLoading } = useClosetInventory('spencer');

  const handleEnterShop = () => {
    setCurrentView('shop-all');
  };

  const handleNavigate = (view: StorefrontView) => {
    setCurrentView(view);
  };

  const handleSelectCloset = (closet: 'parker' | 'spencer') => {
    setCurrentView(closet === 'parker' ? 'parker-closet' : 'spencer-closet');
  };

  // Welcome screen
  if (currentView === 'welcome') {
    return <StorefrontWelcome onEnterShop={handleEnterShop} />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <StorefrontSidebar 
          currentView={currentView as Exclude<StorefrontView, 'welcome'>}
          onNavigate={handleNavigate}
        />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <span className="text-lg font-medium tracking-wide">
                {currentView === 'shop-all' && 'Shop All'}
                {currentView === 'closet-selection' && 'Personal Collection'}
                {currentView === 'parker-closet' && "Parker's Closet"}
                {currentView === 'spencer-closet' && "Spencer's Closet"}
                {currentView === 'about-us' && 'About Us'}
              </span>
            </div>
            {currentView === 'shop-all' && <ShopCart />}
          </header>

          <main className="flex-1 p-6">
            {/* Shop All View */}
            {currentView === 'shop-all' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-light tracking-wide">Shop All</h2>
                  <p className="text-muted-foreground text-sm">
                    {shopItems?.length || 0} items available
                  </p>
                </div>

                {shopLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : shopItems && shopItems.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {shopItems.map((item) => (
                      <StorefrontProductCard 
                        key={item.id} 
                        item={item}
                        onClick={() => setSelectedProduct(item)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No products found</h3>
                    <p className="text-muted-foreground">
                      Items marked as "For Sale" will appear here.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Closet Selection View */}
            {currentView === 'closet-selection' && (
              <ClosetSelection onSelectCloset={handleSelectCloset} />
            )}

            {/* Parker's Closet View */}
            {currentView === 'parker-closet' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-light tracking-wide">Parker's Closet</h2>
                  <p className="text-muted-foreground text-sm">
                    {parkerItems?.length || 0} items in collection
                  </p>
                </div>

                {parkerLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : parkerItems && parkerItems.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {parkerItems.map((item) => (
                      <PersonalCollectionCard 
                        key={item.id} 
                        item={item}
                        onClick={() => setSelectedClosetItem(item)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No items in collection</h3>
                    <p className="text-muted-foreground">
                      Items marked as "In Closet - Parker" will appear here.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Spencer's Closet View */}
            {currentView === 'spencer-closet' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-light tracking-wide">Spencer's Closet</h2>
                  <p className="text-muted-foreground text-sm">
                    {spencerItems?.length || 0} items in collection
                  </p>
                </div>

                {spencerLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : spencerItems && spencerItems.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {spencerItems.map((item) => (
                      <PersonalCollectionCard 
                        key={item.id} 
                        item={item}
                        onClick={() => setSelectedClosetItem(item)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No items in collection</h3>
                    <p className="text-muted-foreground">
                      Items marked as "In Closet - Spencer" will appear here.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* About Us View */}
            {currentView === 'about-us' && (
              <div className="max-w-2xl mx-auto space-y-8 py-8">
                <div className="text-center">
                  <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-3xl font-light tracking-wide mb-4">About Wall St. Collection</h2>
                </div>
                
                <div className="prose prose-invert max-w-none space-y-6">
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Wall St. Collection is a curated vintage and designer clothing resale business 
                    founded by Parker and Spencer Kleinman. We specialize in sourcing unique, 
                    high-quality pieces that tell a story.
                  </p>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    Our mission is to give pre-loved garments a second life while providing 
                    fashion enthusiasts access to rare and distinctive pieces at accessible prices.
                  </p>
                  
                  <div className="border-t border-border pt-6">
                    <h3 className="text-xl font-medium mb-3">Contact Us</h3>
                    <p className="text-muted-foreground">
                      Interested in a piece or have questions? Reach out through our social channels 
                      or browse our listings on Grailed, Depop, and other platforms.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </main>
        </SidebarInset>
      </div>

      {/* Product Detail Dialog (for Shop All items) */}
      <StorefrontProductDetail 
        item={selectedProduct}
        open={!!selectedProduct}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
      />

      {/* Closet Item Detail Dialog (for Personal Collection items) */}
      <ClosetItemDetail 
        item={selectedClosetItem}
        open={!!selectedClosetItem}
        onOpenChange={(open) => !open && setSelectedClosetItem(null)}
      />
    </SidebarProvider>
  );
}
