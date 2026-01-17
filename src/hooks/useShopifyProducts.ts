import { useQuery } from '@tanstack/react-query';
import { storefrontApiRequest, STOREFRONT_PRODUCTS_QUERY, ShopifyProduct } from '@/lib/shopify';

export function useShopifyProducts(query?: string) {
  return useQuery({
    queryKey: ['shopify-products', query],
    queryFn: async () => {
      const data = await storefrontApiRequest(STOREFRONT_PRODUCTS_QUERY, { 
        first: 100,
        query: query || null
      });
      
      if (!data?.data?.products?.edges) {
        return [];
      }
      
      return data.data.products.edges as ShopifyProduct[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
