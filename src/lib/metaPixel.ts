// Meta Pixel ID
const META_PIXEL_ID = '33902034032743890';

// Declare fbq on window
declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}

function fbq(...args: unknown[]) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq(...args);
  }
}

export const metaPixel = {
  trackPageView: () => {
    fbq('track', 'PageView');
  },

  trackViewContent: (item: { id: string; name: string; askingPrice?: number | null; brand?: string | null }) => {
    fbq('track', 'ViewContent', {
      content_name: item.name,
      content_ids: [item.id],
      content_type: 'product',
      value: item.askingPrice || 0,
      currency: 'USD',
    });
  },

  trackAddToCart: (item: { id: string; name: string; askingPrice?: number | null }) => {
    fbq('track', 'AddToCart', {
      content_name: item.name,
      content_ids: [item.id],
      content_type: 'product',
      value: item.askingPrice || 0,
      currency: 'USD',
    });
  },

  trackInitiateCheckout: (itemIds: string[], numItems: number, total: number) => {
    fbq('track', 'InitiateCheckout', {
      content_ids: itemIds,
      num_items: numItems,
      value: total,
      currency: 'USD',
    });
  },

  trackPurchase: (value: number) => {
    fbq('track', 'Purchase', {
      value,
      currency: 'USD',
    });
  },
};
