

# Meta Pixel Integration for Wall St Collection Storefront

## What This Does

Adds Meta Pixel tracking to your storefront so you can run ads on Facebook and Instagram without manually syncing anything. The pixel automatically reports:

- **Every page visit** (PageView) -- so Meta knows who's browsing
- **Every product viewed** (ViewContent) -- so Meta can build audiences of people interested in specific items
- **Add to Cart actions** (AddToCart) -- for retargeting people who almost bought
- **Checkout started** (InitiateCheckout) -- for retargeting cart abandoners
- **Purchases completed** (Purchase) -- so Meta can optimize ads for conversions and find similar buyers

Your Pixel ID: **33902034032743890**

Once this is live, you just create ads in Meta Ads Manager and the pixel handles the rest -- building audiences, tracking conversions, and optimizing delivery automatically.

---

## Implementation

### 1. Create a Meta Pixel utility module

**New file: `src/lib/metaPixel.ts`**

A helper module that:
- Initializes the Meta Pixel with your ID on first load
- Provides typed functions: `trackPageView()`, `trackViewContent()`, `trackAddToCart()`, `trackInitiateCheckout()`, `trackPurchase()`
- Each function passes product data (name, price, brand, category, item ID) so Meta can match products to audiences

### 2. Add the Pixel base script to index.html

Insert the standard Meta Pixel `<script>` tag in the `<head>` of `index.html` with your Pixel ID hardcoded. This loads the pixel on every page.

### 3. Wire up tracking events across the storefront

| File | Event Tracked | When |
|------|--------------|------|
| `src/pages/Storefront.tsx` | **PageView** | On every view change (shop-all, sold, brand, etc.) |
| `src/pages/Storefront.tsx` | **ViewContent** | When a product detail opens |
| `src/stores/shopCartStore.ts` | **AddToCart** | When `addItem()` is called |
| `src/stores/shopCartStore.ts` | **InitiateCheckout** | When `checkout()` is called |
| `src/pages/CheckoutSuccess.tsx` | **Purchase** | On successful checkout page load |

### 4. No backend changes needed

Everything runs client-side. No database changes, no edge functions, no syncing.

---

## Technical Details

### Meta Pixel Helper (`src/lib/metaPixel.ts`)

```typescript
// Wraps fbq() calls with type safety
export const metaPixel = {
  trackPageView: () => fbq('track', 'PageView'),
  
  trackViewContent: (item) => fbq('track', 'ViewContent', {
    content_name: item.name,
    content_ids: [item.id],
    content_type: 'product',
    value: item.askingPrice,
    currency: 'USD',
  }),
  
  trackAddToCart: (item) => fbq('track', 'AddToCart', {
    content_name: item.name,
    content_ids: [item.id],
    content_type: 'product',
    value: item.askingPrice,
    currency: 'USD',
  }),
  
  trackInitiateCheckout: (items, total) => fbq('track', 'InitiateCheckout', {
    content_ids: items.map(i => i.id),
    num_items: items.length,
    value: total,
    currency: 'USD',
  }),
  
  trackPurchase: (value) => fbq('track', 'Purchase', {
    value,
    currency: 'USD',
  }),
};
```

### index.html Script Addition

Standard Meta Pixel base code snippet added to `<head>` with Pixel ID `33902034032743890`.

### Event Integration Points

- **Storefront.tsx**: Call `trackPageView()` in a `useEffect` on view changes. Call `trackViewContent()` inside `handleProductSelect()` when an item is selected.
- **shopCartStore.ts**: Call `trackAddToCart()` at the end of `addItem()`. Call `trackInitiateCheckout()` at the start of `checkout()`.
- **CheckoutSuccess.tsx**: Call `trackPurchase()` in the existing `useEffect`.

---

## Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/metaPixel.ts` | Create | Pixel helper with typed event functions |
| `index.html` | Modify | Add Meta Pixel base script in head |
| `src/pages/Storefront.tsx` | Modify | Add PageView + ViewContent tracking |
| `src/stores/shopCartStore.ts` | Modify | Add AddToCart + InitiateCheckout tracking |
| `src/pages/CheckoutSuccess.tsx` | Modify | Add Purchase tracking |

---

## After Setup

Once deployed, go to **Meta Events Manager** and you should see events appearing in real time as you browse your storefront. Then in **Meta Ads Manager**, you can create campaigns that target people who viewed products, added to cart, or look like past buyers -- all automatic.

