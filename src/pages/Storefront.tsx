import { useState, useMemo } from 'react';
import { Loader2, Store, User, ShoppingBag } from 'lucide-react';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
import { ProductCard } from '@/components/storefront/ProductCard';
import { ProductDetailDialog } from '@/components/storefront/ProductDetailDialog';
import { PersonalCollectionCard } from '@/components/storefront/PersonalCollectionCard';
import { StorefrontWelcome } from '@/components/storefront/StorefrontWelcome';
import { StorefrontNav } from '@/components/storefront/StorefrontNav';
import { ClosetSelection } from '@/components/storefront/ClosetSelection';
import { ShopifyProduct } from '@/lib/shopify';

type StorefrontView = 'welcome' | 'navigation' | 'shop-all' | 'closet-selection' | 'parker-closet' | 'spencer-closet';

export default function Storefront() {
  const [currentView, setCurrentView] = useState<StorefrontView>('welcome');
  const [selectedProduct, setSelectedProduct] = useState<ShopifyProduct | null>(null);
  
  const { data: shopifyProducts, isLoading: shopifyLoading } = useShopifyProducts();
  const { inventory, isLoading: inventoryLoading } = useSupabaseInventory();

  // Get personal collection items
  const getPersonalCollection = (owner: 'parker' | 'spencer') => {
    if (!inventory) return [];
    const status = owner === 'parker' ? 'in-closet-parker' : 'in-closet-spencer';
    return inventory.filter(item => item.status === status);
  };

  const handleEnterShop = () => {
    setCurrentView('navigation');
  };

  const handleNavigate = (view: StorefrontView) => {
    setCurrentView(view);
  };

  const handleBack = () => {
    switch (currentView) {
      case 'shop-all':
      case 'closet-selection':
        setCurrentView('navigation');
        break;
      case 'parker-closet':
      case 'spencer-closet':
        setCurrentView('closet-selection');
        break;
      default:
        setCurrentView('welcome');
    }
  };

  const handleSelectCloset = (closet: 'parker' | 'spencer') => {
    setCurrentView(closet === 'parker' ? 'parker-closet' : 'spencer-closet');
  };

  // Welcome screen
  if (currentView === 'welcome') {
    return <StorefrontWelcome onEnterShop={handleEnterShop} />;
  }

  // Get the appropriate collection for closet views
  const parkerCollection = getPersonalCollection('parker');
  const spencerCollection = getPersonalCollection('spencer');

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <StorefrontNav 
        currentView={currentView}
        onNavigate={handleNavigate}
        onBack={handleBack}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Navigation View - Shows links */}
        {currentView === 'navigation' && (
          <div className="text-center py-20">
            <h1 className="text-4xl font-light tracking-wide mb-4">Wall St. Collection</h1>
            <p className="text-muted-foreground mb-12">Curated vintage and designer pieces</p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button
                onClick={() => setCurrentView('shop-all')}
                className="group flex items-center gap-3 px-8 py-4 border border-border rounded-lg hover:border-primary transition-all duration-300"
              >
                <Store className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                <span className="font-medium tracking-wide">Shop All</span>
              </button>
              
              <button
                onClick={() => setCurrentView('closet-selection')}
                className="group flex items-center gap-3 px-8 py-4 border border-border rounded-lg hover:border-primary transition-all duration-300"
              >
                <User className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                <span className="font-medium tracking-wide">Personal Collection</span>
              </button>
            </div>
          </div>
        )}

        {/* Shop All View */}
        {currentView === 'shop-all' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-light tracking-wide">Shop All</h2>
                <p className="text-muted-foreground text-sm">
                  {shopifyProducts?.length || 0} items available
                </p>
              </div>
            </div>

            {shopifyLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : shopifyProducts && shopifyProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {shopifyProducts.map((product) => (
                  <ProductCard 
                    key={product.node.id} 
                    product={product}
                    onClick={() => setSelectedProduct(product)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No products found</h3>
                <p className="text-muted-foreground">
                  Products synced from your inventory will appear here.
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
                {parkerCollection.length} items in collection
              </p>
            </div>

            {inventoryLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : parkerCollection.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {parkerCollection.map((item) => (
                  <PersonalCollectionCard key={item.id} item={item} />
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
                {spencerCollection.length} items in collection
              </p>
            </div>

            {inventoryLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : spencerCollection.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {spencerCollection.map((item) => (
                  <PersonalCollectionCard key={item.id} item={item} />
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
      </main>

      <ProductDetailDialog 
        product={selectedProduct}
        open={!!selectedProduct}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
      />
    </div>
  );
}
