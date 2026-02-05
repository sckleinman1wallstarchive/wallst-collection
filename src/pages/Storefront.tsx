import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, User, ShoppingBag } from 'lucide-react';
import { usePublicInventory, useClosetInventory, PublicInventoryItem } from '@/hooks/usePublicInventory';
import { StorefrontProductCard } from '@/components/storefront/StorefrontProductCard';
import { StorefrontProductDetail } from '@/components/storefront/StorefrontProductDetail';
import { PersonalCollectionCard } from '@/components/storefront/PersonalCollectionCard';
import { ClosetItemDetail } from '@/components/storefront/ClosetItemDetail';
import { StorefrontWelcome } from '@/components/storefront/StorefrontWelcome';
import { StorefrontTopNav, LandingNavView } from '@/components/storefront/StorefrontTopNav';
import { StorefrontSearchBar } from '@/components/storefront/StorefrontSearchBar';
import { StorefrontFilters, FilterState } from '@/components/storefront/StorefrontFilters';
import { ShopByBrandView } from '@/components/storefront/ShopByBrandView';
import { useStorefrontBrands } from '@/hooks/useStorefrontBrands';
import { CollectionGrailsView } from '@/components/storefront/CollectionGrailsView';
import { AboutUsGallery } from '@/components/storefront/AboutUsGallery';
import { ClosetSelection } from '@/components/storefront/ClosetSelection';
import { StorefrontLanding } from '@/components/storefront/StorefrontLanding';
 import { SoldItemsView } from '@/components/storefront/SoldItemsView';
 import { SoldProductDetail } from '@/components/storefront/SoldProductDetail';
 import { SoldInventoryItem } from '@/hooks/useSoldInventory';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';

 type StorefrontView = 'welcome' | 'home' | 'shop-all' | 'sold' | 'shop-by-brand' | 'collection-grails' | 'closet-selection' | 'parker-closet' | 'spencer-closet' | 'about-us';

export default function Storefront() {
  const [searchParams, setSearchParams] = useSearchParams();
  // Check for direct item link - skip welcome if ?item= is present
  const initialItemId = searchParams.get('item');
  const [currentView, setCurrentView] = useState<StorefrontView>(initialItemId ? 'home' : 'welcome');
  const [selectedProduct, setSelectedProduct] = useState<PublicInventoryItem | null>(null);
  const [selectedClosetItem, setSelectedClosetItem] = useState<PublicInventoryItem | null>(null);
   const [selectedSoldItem, setSelectedSoldItem] = useState<SoldInventoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({ sizes: [], brands: [], categories: [] });
  const [isEditMode, setIsEditMode] = useState(false);
  const [localShopItems, setLocalShopItems] = useState<PublicInventoryItem[]>([]);
  const [brandItemFilter, setBrandItemFilter] = useState<string[] | null>(null);
  
  const { fetchBrandItemIds } = useStorefrontBrands();
  
  const queryClient = useQueryClient();
  
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );
  
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

  // Handle URL parameters for direct item links
  useEffect(() => {
    const itemId = searchParams.get('item');
    if (itemId && shopItems) {
      const item = shopItems.find(i => i.id === itemId);
      if (item) {
        setSelectedProduct(item);
        if (currentView === 'welcome') {
          setCurrentView('home');
        }
      }
    }
  }, [searchParams, shopItems, currentView]);

  // Update URL when item is selected/deselected
  const handleProductSelect = (item: PublicInventoryItem | null) => {
    setSelectedProduct(item);
    if (item) {
      setSearchParams({ item: item.id });
    } else {
      searchParams.delete('item');
      setSearchParams(searchParams);
    }
  };

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
  const filterItems = (items: PublicInventoryItem[] | undefined, useBrandItemFilter = false) => {
    if (!items) return [];
    return items.filter((item) => {
      // If brand item filter is active, only show those specific items
      if (useBrandItemFilter && brandItemFilter && brandItemFilter.length > 0) {
        if (!brandItemFilter.includes(item.id)) return false;
      }
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          item.name.toLowerCase().includes(query) ||
          (item.brand?.toLowerCase().includes(query)) ||
          (item.size?.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      if (filters.sizes.length > 0 && (!item.size || !filters.sizes.includes(item.size))) {
        return false;
      }

      if (filters.brands.length > 0 && (!item.brand || !filters.brands.includes(item.brand))) {
        return false;
      }

      if (filters.categories.length > 0 && !filters.categories.includes(item.category)) {
        return false;
      }

      return true;
    });
  };

  const filteredShopItems = useMemo(() => filterItems(shopItems, true), [shopItems, searchQuery, filters, brandItemFilter]);
  const filteredParkerItems = useMemo(() => filterItems(parkerItems), [parkerItems, searchQuery, filters]);
  const filteredSpencerItems = useMemo(() => filterItems(spencerItems), [spencerItems, searchQuery, filters]);

  // Sync local shop items with filtered items
  useEffect(() => {
    if (filteredShopItems.length > 0) {
      setLocalShopItems(filteredShopItems);
    }
  }, [filteredShopItems]);

  const handleShopAllDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = localShopItems.findIndex(item => item.id === active.id);
      const newIndex = localShopItems.findIndex(item => item.id === over.id);
      const newOrder = arrayMove(localShopItems, oldIndex, newIndex);
      setLocalShopItems(newOrder);
      
      for (let i = 0; i < newOrder.length; i++) {
        await supabase
          .from('inventory_items')
          .update({ storefront_display_order: i })
          .eq('id', newOrder[i].id);
      }
      queryClient.invalidateQueries({ queryKey: ['public-inventory'] });
    }
  };

  const handleEnterShop = () => {
    setCurrentView('home');
  };

  const handleNavigate = (view: LandingNavView) => {
    if (view === 'home') {
      setCurrentView('home');
    } else {
      setCurrentView(view as StorefrontView);
    }
    setSearchQuery('');
    setFilters({ sizes: [], brands: [], categories: [] });
    setBrandItemFilter(null); // Clear brand item filter when navigating
  };

  const handleSelectCloset = (closet: 'parker' | 'spencer') => {
    setCurrentView(closet === 'parker' ? 'parker-closet' : 'spencer-closet');
  };

  const handleBrandClick = async (brandName: string) => {
    // Find the brand to get its ID
    const { data: brand } = await supabase
      .from('storefront_brands')
      .select('id')
      .eq('brand_name', brandName)
      .maybeSingle();
    
    if (brand) {
      const assignedIds = await fetchBrandItemIds(brand.id);
      if (assignedIds.length > 0) {
        // Filter by assigned items
        setBrandItemFilter(assignedIds);
        setFilters({ sizes: [], brands: [], categories: [] });
      } else {
        // Fallback: filter by brand name
        setBrandItemFilter(null);
        setFilters({ ...filters, brands: [brandName] });
      }
    } else {
      // Fallback: filter by brand name
      setBrandItemFilter(null);
      setFilters({ ...filters, brands: [brandName] });
    }
    setCurrentView('shop-all');
  };

  // Welcome screen
  if (currentView === 'welcome') {
    return <StorefrontWelcome onEnterShop={handleEnterShop} />;
  }

  // Landing page
  if (currentView === 'home') {
    return (
      <>
        <StorefrontLanding
          onNavigate={handleNavigate}
          onItemClick={(item) => handleProductSelect(item)}
          onBrandClick={handleBrandClick}
          isEditMode={isEditMode}
          onEditModeToggle={() => setIsEditMode(!isEditMode)}
          showEditButton={!!isAllowedUser}
        />
        
        <StorefrontProductDetail 
          key={selectedProduct?.id || 'none'}
          item={selectedProduct}
          open={!!selectedProduct}
          onOpenChange={(open) => !open && handleProductSelect(null)}
          isEditMode={isEditMode}
        />
      </>
    );
  }

  const getViewTitle = () => {
    switch (currentView) {
      case 'shop-all': return 'Shop All';
       case 'sold': return 'Sold';
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
    <div className="min-h-screen bg-black">
      {/* Top Navigation - visible on all views */}
      <StorefrontTopNav
        currentView={currentView === 'parker-closet' || currentView === 'spencer-closet' || currentView === 'closet-selection' || currentView === 'about-us' ? 'home' : currentView as LandingNavView}
        onNavigate={handleNavigate}
        isEditMode={isEditMode}
        onEditModeToggle={() => setIsEditMode(!isEditMode)}
        showEditButton={!!isAllowedUser}
      />

      <main className="flex-1 p-6 text-white">
        {/* View Title */}
        <div className="max-w-7xl mx-auto mb-6">
          <h2 className="text-2xl font-light tracking-wide">{getViewTitle()}</h2>
        </div>

        {/* Search and Filters for Shop All */}
        {showSearchAndFilters && (
          <div className="max-w-7xl mx-auto space-y-4 mb-6">
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
          <div className="max-w-7xl mx-auto space-y-6">
            <p className="text-white/60 text-sm">
              {filteredShopItems.length} items available
            </p>

            {shopLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-white/50" />
              </div>
            ) : localShopItems.length > 0 ? (
              isEditMode ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleShopAllDragEnd}>
                  <SortableContext items={localShopItems.map(i => i.id)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {localShopItems.map((item) => (
                        <StorefrontProductCard 
                          key={item.id} 
                          item={item}
                          isEditMode={isEditMode}
                          onClick={() => handleProductSelect(item)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredShopItems.map((item) => (
                    <StorefrontProductCard 
                      key={item.id} 
                      item={item}
                      isEditMode={false}
                      onClick={() => handleProductSelect(item)}
                    />
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 text-white/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No products found</h3>
                <p className="text-white/60">
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
          <div className="max-w-7xl mx-auto">
            <ShopByBrandView isEditMode={isEditMode} onBrandClick={handleBrandClick} />
          </div>
        )}

        {/* Collection Grails View */}
        {currentView === 'collection-grails' && (
          <div className="max-w-7xl mx-auto">
            <CollectionGrailsView isEditMode={isEditMode} />
          </div>
        )}

        {/* Closet Selection View */}
        {currentView === 'closet-selection' && (
          <div className="max-w-7xl mx-auto">
            <ClosetSelection onSelectCloset={handleSelectCloset} isEditMode={isEditMode} />
          </div>
        )}

        {/* Parker's Closet View */}
        {currentView === 'parker-closet' && (
          <div className="max-w-7xl mx-auto space-y-6">
            <p className="text-white/60 text-sm">
              {filteredParkerItems.length} items in collection
            </p>

            {parkerLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-white/50" />
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
                <User className="h-12 w-12 text-white/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No items found</h3>
                <p className="text-white/60">
                  Items marked as "In Closet - Parker" will appear here.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Spencer's Closet View */}
        {currentView === 'spencer-closet' && (
          <div className="max-w-7xl mx-auto space-y-6">
            <p className="text-white/60 text-sm">
              {filteredSpencerItems.length} items in collection
            </p>

            {spencerLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-white/50" />
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
                <User className="h-12 w-12 text-white/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No items found</h3>
                <p className="text-white/60">
                  Items marked as "In Closet - Spencer" will appear here.
                </p>
              </div>
            )}
          </div>
        )}

        {/* About Us View */}
        {currentView === 'about-us' && (
          <div className="max-w-7xl mx-auto">
            <AboutUsGallery isEditMode={isEditMode} />
          </div>
        )}

       {/* Sold Items View */}
       {currentView === 'sold' && (
         <div className="max-w-7xl mx-auto">
           <SoldItemsView onItemClick={(item) => setSelectedSoldItem(item)} />
         </div>
       )}
      </main>

      {/* Product Detail Dialog */}
      <StorefrontProductDetail 
        key={selectedProduct?.id || 'none'}
        item={selectedProduct}
        open={!!selectedProduct}
        onOpenChange={(open) => !open && handleProductSelect(null)}
        isEditMode={isEditMode}
      />

      {/* Closet Item Detail Dialog */}
      <ClosetItemDetail
        key={selectedClosetItem?.id || 'closet-none'}
        item={selectedClosetItem}
        open={!!selectedClosetItem}
        onOpenChange={(open) => !open && setSelectedClosetItem(null)}
      />

     {/* Sold Item Detail Dialog */}
     <SoldProductDetail
       key={selectedSoldItem?.id || 'sold-none'}
       item={selectedSoldItem}
       open={!!selectedSoldItem}
       onOpenChange={(open) => !open && setSelectedSoldItem(null)}
     />
    </div>
  );
}
