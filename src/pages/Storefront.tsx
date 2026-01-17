import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Store, ShoppingBag, User } from 'lucide-react';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
import { ProductCard } from '@/components/storefront/ProductCard';
import { ProductDetailDialog } from '@/components/storefront/ProductDetailDialog';
import { CartDrawer } from '@/components/storefront/CartDrawer';
import { BrandFilter } from '@/components/storefront/BrandFilter';
import { PersonalCollectionCard } from '@/components/storefront/PersonalCollectionCard';
import { ShopifyProduct } from '@/lib/shopify';

export default function Storefront() {
  const [selectedProduct, setSelectedProduct] = useState<ShopifyProduct | null>(null);
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [collectionOwner, setCollectionOwner] = useState<'parker' | 'spencer'>('parker');
  
  const { data: shopifyProducts, isLoading: shopifyLoading } = useShopifyProducts();
  const { inventory, isLoading: inventoryLoading } = useSupabaseInventory();

  // Extract unique brands from Shopify products
  const brands = useMemo(() => {
    if (!shopifyProducts) return [];
    const brandSet = new Set<string>();
    shopifyProducts.forEach(product => {
      const brandOption = product.node.options.find(o => o.name.toLowerCase() === 'brand');
      if (brandOption?.values[0]) {
        brandSet.add(brandOption.values[0]);
      }
    });
    return Array.from(brandSet).sort();
  }, [shopifyProducts]);

  // Filter products by brand
  const filteredProducts = useMemo(() => {
    if (!shopifyProducts) return [];
    if (selectedBrand === 'all') return shopifyProducts;
    return shopifyProducts.filter(product => {
      const brandOption = product.node.options.find(o => o.name.toLowerCase() === 'brand');
      return brandOption?.values[0] === selectedBrand;
    });
  }, [shopifyProducts, selectedBrand]);

  // Get personal collection items
  const personalCollection = useMemo(() => {
    if (!inventory) return [];
    const status = collectionOwner === 'parker' ? 'in-closet-parker' : 'in-closet-spencer';
    return inventory.filter(item => item.status === status);
  }, [inventory, collectionOwner]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Wall St. Collection</h1>
          <p className="text-muted-foreground">Curated vintage and designer pieces</p>
        </div>
        <CartDrawer />
      </div>

      <Tabs defaultValue="shop-all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="shop-all" className="gap-2">
            <Store className="h-4 w-4" />
            Shop All
          </TabsTrigger>
          <TabsTrigger value="shop-by-brand" className="gap-2">
            <ShoppingBag className="h-4 w-4" />
            Shop by Brand
          </TabsTrigger>
          <TabsTrigger value="personal-collection" className="gap-2">
            <User className="h-4 w-4" />
            Personal Collection
          </TabsTrigger>
        </TabsList>

        {/* Shop All Tab */}
        <TabsContent value="shop-all" className="space-y-6">
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
              <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground">
                Products synced from your inventory will appear here.
              </p>
            </div>
          )}
        </TabsContent>

        {/* Shop by Brand Tab */}
        <TabsContent value="shop-by-brand" className="space-y-6">
          <div className="flex items-center gap-4">
            <BrandFilter 
              brands={brands}
              selectedBrand={selectedBrand}
              onBrandChange={setSelectedBrand}
            />
            <span className="text-sm text-muted-foreground">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          {shopifyLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
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
                {selectedBrand !== 'all' 
                  ? `No products found for "${selectedBrand}"`
                  : 'Products synced from your inventory will appear here.'}
              </p>
            </div>
          )}
        </TabsContent>

        {/* Personal Collection Tab */}
        <TabsContent value="personal-collection" className="space-y-6">
          <Tabs value={collectionOwner} onValueChange={(v) => setCollectionOwner(v as 'parker' | 'spencer')}>
            <TabsList>
              <TabsTrigger value="parker">Parker's Closet</TabsTrigger>
              <TabsTrigger value="spencer">Spencer's Closet</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {inventoryLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : personalCollection.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {personalCollection.map((item) => (
                <PersonalCollectionCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No items in collection</h3>
              <p className="text-muted-foreground">
                Items marked as "{collectionOwner === 'parker' ? 'In Closet - Parker' : 'In Closet - Spencer'}" will appear here.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ProductDetailDialog 
        product={selectedProduct}
        open={!!selectedProduct}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
      />
    </div>
  );
}
