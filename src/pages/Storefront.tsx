import { useState, useMemo, useEffect } from 'react';
import { Loader2, User, ShoppingBag, Pencil, Check } from 'lucide-react';
import { usePublicInventory, useClosetInventory, PublicInventoryItem } from '@/hooks/usePublicInventory';
import { StorefrontProductCard } from '@/components/storefront/StorefrontProductCard';
import { StorefrontProductDetail } from '@/components/storefront/StorefrontProductDetail';
import { PersonalCollectionCard } from '@/components/storefront/PersonalCollectionCard';
import { ClosetItemDetail } from '@/components/storefront/ClosetItemDetail';
import { StorefrontWelcome } from '@/components/storefront/StorefrontWelcome';
import { StorefrontSidebar, StorefrontView } from '@/components/storefront/StorefrontSidebar';
import { StorefrontSearchBar } from '@/components/storefront/StorefrontSearchBar';
import { StorefrontFilters, FilterState } from '@/components/storefront/StorefrontFilters';
import { ShopByBrandView } from '@/components/storefront/ShopByBrandView';
import { CollectionGrailsView } from '@/components/storefront/CollectionGrailsView';
import { AboutUsGallery } from '@/components/storefront/AboutUsGallery';
import { ClosetSelection } from '@/components/storefront/ClosetSelection';
import { ShopCart } from '@/components/shop/ShopCart';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export default function Storefront() {
  const [currentView, setCurrentView] = useState<StorefrontView | 'welcome'>('welcome');
  const [selectedProduct, setSelectedProduct] = useState<PublicInventoryItem | null>(null);
  const [selectedClosetItem, setSelectedClosetItem] = useState<PublicInventoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({ sizes: [], brands: [], categories: [] });
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Check if user is allowed (for edit mode)
  const { data: isAllowedUser } = useQuery({
    queryKey: ['is-allowed-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      const { data } = await supabase
        .from('allowed_emails')
        .select('email')
        .eq('email', user.email)
        .single();
      
      return !!data;
    },
  });
  
  // Fetch shop items (for-sale status)
  const { data: shopItems, isLoading: shopLoading } = usePublicInventory();
  
  // Fetch closet items
  const { data: parkerItems, isLoading: parkerLoading } = useClosetInventory('parker');
  const { data: spencerItems, isLoading: spencerLoading } = useClosetInventory('spencer');

  // Get available sizes and brands for filters
  const availableSizes = useMemo(() => {
    const sizes = new Set<string>();
    shopItems?.forEach((item) => item.size && sizes.add(item.size));
    parkerItems?.forEach((item) => item.size && sizes.add(item.size));
    spencerItems?.forEach((item) => item.size && sizes.add(item.size));
    return Array.from(sizes).sort();
  }, [shopItems, parkerItems, spencerItems]);

  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    shopItems?.forEach((item) => item.brand && brands.add(item.brand));
    parkerItems?.forEach((item) => item.brand && brands.add(item.brand));
    spencerItems?.forEach((item) => item.brand && brands.add(item.brand));
    return Array.from(brands).sort();
  }, [shopItems, parkerItems, spencerItems]);

  // Filter function
  const filterItems = (items: PublicInventoryItem[] | undefined) => {
    if (!items) return [];
    return items.filter((item) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          item.name.toLowerCase().includes(query) ||
          (item.brand?.toLowerCase().includes(query)) ||
          (item.size?.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // Size filter
      if (filters.sizes.length > 0 && (!item.size || !filters.sizes.includes(item.size))) {
        return false;
      }

      // Brand filter
      if (filters.brands.length > 0 && (!item.brand || !filters.brands.includes(item.brand))) {
        return false;
      }

      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(item.category)) {
        return false;
      }

      return true;
    });
  };

  const filteredShopItems = useMemo(() => filterItems(shopItems), [shopItems, searchQuery, filters]);
  const filteredParkerItems = useMemo(() => filterItems(parkerItems), [parkerItems, searchQuery, filters]);
  const filteredSpencerItems = useMemo(() => filterItems(spencerItems), [spencerItems, searchQuery, filters]);

  const handleEnterShop = () => {
    setCurrentView('shop-all');
  };

  const handleNavigate = (view: StorefrontView) => {
    setCurrentView(view);
    setSearchQuery('');
    setFilters({ sizes: [], brands: [], categories: [] });
  };

  const handleSelectCloset = (closet: 'parker' | 'spencer') => {
    setCurrentView(closet === 'parker' ? 'parker-closet' : 'spencer-closet');
  };

  const handleBrandClick = (brandName: string) => {
    setFilters({ ...filters, brands: [brandName] });
    setCurrentView('shop-all');
  };

  // Welcome screen
  if (currentView === 'welcome') {
    return <StorefrontWelcome onEnterShop={handleEnterShop} />;
  }

  const getViewTitle = () => {
    switch (currentView) {
      case 'shop-all': return 'Shop All';
      case 'closet-selection': return 'Personal Collection';
      case 'parker-closet': return "Parker's Closet";
      case 'spencer-closet': return "Spencer's Closet";
      case 'shop-by-brand': return 'Shop by Brand';
      case 'collection-grails': return 'Collection Grails';
      case 'about-us': return 'About Us';
      default: return '';
    }
  };

  const showSearchAndFilters = ['shop-all', 'parker-closet', 'spencer-closet'].includes(currentView);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <StorefrontSidebar 
          currentView={currentView as StorefrontView}
          onNavigate={handleNavigate}
        />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <span className="text-lg font-medium tracking-wide">
                {getViewTitle()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isAllowedUser && (
                <Button
                  variant={isEditMode ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setIsEditMode(!isEditMode)}
                  className="gap-1"
                >
                  {isEditMode ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                  {isEditMode ? 'Done' : 'Edit'}
                </Button>
              )}
              {currentView === 'shop-all' && <ShopCart />}
            </div>
          </header>

          <main className="flex-1 p-6">
            {/* Search and Filters for applicable views */}
            {showSearchAndFilters && (
              <div className="space-y-4 mb-6">
                <StorefrontSearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search by name, brand, or size..."
                />
                <StorefrontFilters
                  filters={filters}
                  onChange={setFilters}
                  availableSizes={availableSizes}
                  availableBrands={availableBrands}
                />
              </div>
            )}

            {/* Shop All View */}
            {currentView === 'shop-all' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-light tracking-wide">Shop All</h2>
                  <p className="text-muted-foreground text-sm">
                    {filteredShopItems.length} items available
                  </p>
                </div>

                {shopLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredShopItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredShopItems.map((item) => (
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
                      {searchQuery || filters.sizes.length || filters.brands.length || filters.categories.length
                        ? 'Try adjusting your search or filters.'
                        : 'Items marked as "For Sale" will appear here.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Shop by Brand View */}
            {currentView === 'shop-by-brand' && (
              <ShopByBrandView isEditMode={isEditMode} onBrandClick={handleBrandClick} />
            )}

            {/* Collection Grails View */}
            {currentView === 'collection-grails' && (
              <CollectionGrailsView isEditMode={isEditMode} />
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
                    {filteredParkerItems.length} items in collection
                  </p>
                </div>

                {parkerLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredParkerItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredParkerItems.map((item) => (
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
                    <h3 className="text-lg font-medium mb-2">No items found</h3>
                    <p className="text-muted-foreground">
                      {searchQuery || filters.sizes.length || filters.brands.length || filters.categories.length
                        ? 'Try adjusting your search or filters.'
                        : 'Items marked as "In Closet - Parker" will appear here.'}
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
                    {filteredSpencerItems.length} items in collection
                  </p>
                </div>

                {spencerLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredSpencerItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSpencerItems.map((item) => (
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
                    <h3 className="text-lg font-medium mb-2">No items found</h3>
                    <p className="text-muted-foreground">
                      {searchQuery || filters.sizes.length || filters.brands.length || filters.categories.length
                        ? 'Try adjusting your search or filters.'
                        : 'Items marked as "In Closet - Spencer" will appear here.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* About Us View */}
            {currentView === 'about-us' && (
              <AboutUsGallery isEditMode={isEditMode} />
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
