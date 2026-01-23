import { useState, useMemo } from 'react';
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

  const showSearchAndFilters = currentView === 'shop-all';

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full group/sidebar-wrapper">
        <StorefrontSidebar 
          currentView={currentView as StorefrontView}
          onNavigate={handleNavigate}
        />
        <SidebarInset className={['shop-all', 'parker-closet', 'spencer-closet', 'closet-selection', 'shop-by-brand', 'collection-grails', 'about-us'].includes(currentView) ? 'bg-black' : ''}>
          <header className={`flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 ${['shop-all', 'parker-closet', 'spencer-closet', 'closet-selection', 'shop-by-brand', 'collection-grails', 'about-us'].includes(currentView) ? 'border-white/10' : ''}`}>
            <div className="flex items-center gap-2">
              <SidebarTrigger className={`-ml-1 ${['shop-all', 'parker-closet', 'spencer-closet', 'closet-selection', 'shop-by-brand', 'collection-grails', 'about-us'].includes(currentView) ? 'text-white' : ''}`} />
              <span className={`text-lg font-medium tracking-wide ${['shop-all', 'parker-closet', 'spencer-closet', 'closet-selection', 'shop-by-brand', 'collection-grails', 'about-us'].includes(currentView) ? 'text-white' : ''}`}>
                {getViewTitle()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isAllowedUser && (
                <Button
                  variant={isEditMode ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`gap-1 ${['shop-all', 'parker-closet', 'spencer-closet', 'closet-selection', 'shop-by-brand', 'collection-grails', 'about-us'].includes(currentView) && !isEditMode ? 'text-white hover:text-white hover:bg-white/10' : ''}`}
                >
                  {isEditMode ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                  {isEditMode ? 'Done' : 'Edit'}
                </Button>
              )}
              {currentView === 'shop-all' && <ShopCart />}
            </div>
          </header>

          <main className={`flex-1 p-6 ${['shop-all', 'parker-closet', 'spencer-closet', 'closet-selection', 'shop-by-brand', 'collection-grails', 'about-us'].includes(currentView) ? 'text-white' : ''}`}>
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
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                    {filteredShopItems.map((item) => (
                      <StorefrontProductCard 
                        key={item.id} 
                        item={item}
                        isEditMode={isEditMode}
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
              <ClosetSelection onSelectCloset={handleSelectCloset} isEditMode={isEditMode} />
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
                  <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                    {filteredParkerItems.map((item) => (
                      <PersonalCollectionCard 
                        key={item.id} 
                        item={item}
                        isEditMode={isEditMode}
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
                  <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                    {filteredSpencerItems.map((item) => (
                      <PersonalCollectionCard 
                        key={item.id} 
                        item={item}
                        isEditMode={isEditMode}
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

      {/* Product Detail Dialog (for Shop All items) - key forces remount on item change */}
      <StorefrontProductDetail 
        key={selectedProduct?.id || 'none'}
        item={selectedProduct}
        open={!!selectedProduct}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
        isEditMode={isEditMode}
      />

      {/* Closet Item Detail Dialog (for Personal Collection items) - key forces remount on item change */}
      <ClosetItemDetail 
        key={selectedClosetItem?.id || 'none'}
        item={selectedClosetItem}
        open={!!selectedClosetItem}
        onOpenChange={(open) => !open && setSelectedClosetItem(null)}
      />
    </SidebarProvider>
  );
}
