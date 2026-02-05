import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { PublicInventoryItem } from '@/hooks/usePublicInventory';
import { supabase } from '@/integrations/supabase/client';
import { metaPixel } from '@/lib/metaPixel';

export interface ShopCartItem {
  item: PublicInventoryItem;
  quantity: number;
}

interface ShopCartStore {
  items: ShopCartItem[];
  isLoading: boolean;
  addItem: (item: PublicInventoryItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getTotalItems: () => number;
  checkout: () => Promise<string | null>;
}

export const useShopCartStore = create<ShopCartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      addItem: (item) => {
        const { items } = get();
        const existingIndex = items.findIndex(i => i.item.id === item.id);
        
        if (existingIndex >= 0) {
          const newItems = [...items];
          newItems[existingIndex].quantity += 1;
          set({ items: newItems });
        } else {
          set({ items: [...items, { item, quantity: 1 }] });
        }
        metaPixel.trackAddToCart(item);
      },

      removeItem: (itemId) => {
        set({ items: get().items.filter(i => i.item.id !== itemId) });
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        set({
          items: get().items.map(i =>
            i.item.id === itemId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce((sum, cartItem) => {
          const price = cartItem.item.askingPrice || 0;
          return sum + price * cartItem.quantity;
        }, 0);
      },

      getTotalItems: () => {
        return get().items.reduce((sum, cartItem) => sum + cartItem.quantity, 0);
      },

      checkout: async () => {
        const { items } = get();
        if (items.length === 0) return null;

        metaPixel.trackInitiateCheckout(
          items.map(i => i.item.id),
          items.reduce((sum, i) => sum + i.quantity, 0),
          get().getTotal()
        );

        set({ isLoading: true });
        try {
          const cartItems = items.map(cartItem => ({
            id: cartItem.item.id,
            name: cartItem.item.name,
            price: cartItem.item.askingPrice || 0,
            quantity: cartItem.quantity,
            image_url: cartItem.item.imageUrl || cartItem.item.imageUrls[0],
            size: cartItem.item.size,
          }));

          const { data, error } = await supabase.functions.invoke('create-checkout-session', {
            body: { items: cartItems },
          });

          if (error) throw error;
          if (!data?.url) throw new Error('No checkout URL received');

          return data.url;
        } catch (error) {
          console.error('Checkout error:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'shop-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
