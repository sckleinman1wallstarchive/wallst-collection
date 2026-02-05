
# Sold Section, Stripe Confirmation, Budget Categories & Monthly Analytics Consolidation

## Overview
This plan addresses multiple requests:
1. **Consolidate Monthly Analytics** - Fix the confusion with multiple monthly views (Monthly Performance vs Monthly History)
2. **Add "Sold" Section to Storefront Navigation** - Archive page showing previously sold items with prices and descriptions
3. **Meta Commerce + Stripe Readiness** - Verify product page structure for Instagram tagging
4. **Stripe Checkout Confirmation** - Improve success page visibility and messaging
5. **Budget Categories** - Separate Operating Costs budget from Big Purchases budget

---

## Part 1: Consolidate Monthly Analytics

Currently there are TWO separate monthly views that essentially do the same thing:
- **Monthly Performance** - Shows month-by-month sales with MoM changes
- **Monthly History** - Also shows month-by-month sales with expandable details

This is confusing. The solution is to merge them into a single unified "Monthly Numbers" view.

### Changes

**File: `src/pages/Analytics.tsx`**

Remove the duplicate buttons and consolidate into one "Monthly Numbers" button that leads to a single comprehensive view.

**File: `src/components/analytics/MonthlyPerformanceView.tsx`**

Rename to `MonthlyNumbersView.tsx` and enhance to include:
- Summary stats at top (Total Revenue, COGS, Profit, Items Sold)
- Best Month highlights
- Expandable month cards with individual item details
- MoM percentage changes

**File to remove: `src/components/accounting/MonthlyHistoryView.tsx`**

Delete this duplicate component and update Analytics.tsx to use the consolidated view.

---

## Part 2: Add "Sold" Section to Storefront Navigation

Add a new nav item in the storefront top navigation to display previously sold items as social proof.

### Changes

**File: `src/components/storefront/StorefrontTopNav.tsx`**

Add "Sold" to the NAV_ITEMS array:
```typescript
const NAV_ITEMS: { view: LandingNavView; label: string }[] = [
  { view: 'home', label: 'Home' },
  { view: 'shop-all', label: 'Shop All' },
  { view: 'sold', label: 'Sold' },  // NEW
  { view: 'shop-by-brand', label: 'Shop By Brand' },
  { view: 'collection-grails', label: 'Grails' },
];
```

Update the LandingNavView type to include 'sold'.

**File: `src/pages/Storefront.tsx`**

Add 'sold' to the StorefrontView type and handle the new view.

**New File: `src/components/storefront/SoldItemsView.tsx`**

Create a gallery component that:
- Fetches items with status = 'sold' from inventory
- Displays them in a grid similar to Shop All
- Shows "SOLD" overlay badge on each card
- Displays the sold price (strikethrough style optional)
- Shows auto-generated description (same format as Shop All)
- NO Add to Cart button - just view-only cards

**New File: `src/hooks/useSoldInventory.ts`**

Hook to fetch sold items for public display:
```typescript
const { data } = await supabase
  .from('inventory_items')
  .select('id, name, brand, size, sale_price, asking_price, image_url, image_urls, notes, date_sold')
  .eq('status', 'sold')
  .order('date_sold', { ascending: false });
```

**New File: `src/components/storefront/SoldProductCard.tsx`**

A view-only product card that:
- Displays the item image
- Shows "SOLD" badge overlay
- Shows the sold price prominently
- Shows truncated description
- Click opens a detail view (read-only, no cart button)

---

## Part 3: Meta Commerce + Stripe Readiness Check

Current structure analysis:

| Requirement | Status | Notes |
|-------------|--------|-------|
| Stable Product URLs | READY | `/shop?item=<uuid>` deep links work |
| Clear Price Display | READY | `askingPrice` shown prominently |
| Availability | READY | Only 'for-sale' items appear in Shop All |
| SKU-like Identifiers | READY | UUID serves as unique identifier |
| External Checkout via Stripe | READY | Checkout session redirects to Stripe |
| Product Images | READY | Images uploaded to Supabase Storage |

**Instagram Product Tagging Compatibility:**
- Product URLs are shareable: `https://wallst-collection.lovable.app/shop?item=<uuid>`
- Direct links bypass welcome page (already implemented)
- Meta Commerce requires a product catalog sync (external setup in Meta Business Suite - **PENDING EXTERNAL CONNECTION**)

**No code changes needed** - the structure is already Meta Commerce compatible. You would need to:
1. Create a Meta Business account
2. Set up a Product Catalog in Meta Commerce Manager
3. Manually add products or use a feed (CSV/JSON with product URLs)

---

## Part 4: Stripe Deposit Confirmation

Current checkout success page at `/shop/success` is functional but minimal.

### Changes

**File: `src/pages/CheckoutSuccess.tsx`**

Enhance the success page to include:
- Larger, more prominent success icon and message
- Clear "Payment Confirmed" language
- Note about funds depositing to connected account
- Order reference number (Stripe session ID suffix)
- Email confirmation note (Stripe sends receipt automatically)

Updated content:
```typescript
<CardTitle className="text-2xl">Payment Confirmed!</CardTitle>
<p className="text-muted-foreground">
  Thank you for your purchase! Your payment has been processed successfully.
  You'll receive an email confirmation shortly.
</p>
<p className="text-sm text-muted-foreground mt-4">
  Funds will be deposited to the connected bank account within 2-7 business days.
</p>
```

**File: `src/stores/shopCartStore.ts`**

Add success redirect URL with session_id parameter (already implemented).

---

## Part 5: Budget Categories - Operating vs Big Purchases

Based on the "High Velocity Dealer Operating System" document, create a two-tier budget system:

### Operating Budget (Small/Recurring Costs)
- Supplies
- Subscriptions  
- Advertising
- Pop-Up expenses
- Small inventory purchases (under a threshold, e.g., $200)
- Dividends (Parker/Spencer withdrawals)

### Deployment Budget (Big Purchases)
- Inventory purchases above threshold
- Subject to Weekly Deployment Governor (45% cap)
- Subject to In-Transit Inventory cap (45%)

### Changes

**File: `src/hooks/useBudgetMetrics.ts`**

Add new calculated fields:
```typescript
interface BudgetMetrics {
  // ... existing fields ...
  
  // Operating Budget
  operatingBudget: number;           // Reserved for expenses/dividends
  operatingSpentThisMonth: number;   // Expenses + dividends this month
  operatingRemaining: number;        // What's left for small costs
  
  // Deployment Budget  
  deploymentBudget: number;          // For big inventory purchases
  deploymentSpentThisWeek: number;   // Already deployed
  deploymentRemaining: number;       // Available for more purchases
}
```

**File: `src/components/accounting/BudgetDialog.tsx`**

Add two-section layout:
1. **Operating Costs Budget** - Shows monthly allocation for expenses
2. **Deployment Budget** - Shows weekly allocation for inventory purchases

Add red flag alerts:
- Operating budget running low
- Deployment budget exceeded (already exists)
- In-transit too high (already exists)

---

## File Changes Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/pages/Analytics.tsx` | Modify | Consolidate monthly views into one button |
| `src/components/analytics/MonthlyPerformanceView.tsx` | Modify | Rename and enhance to be the single monthly view |
| `src/components/accounting/MonthlyHistoryView.tsx` | Delete | Remove duplicate component |
| `src/components/storefront/StorefrontTopNav.tsx` | Modify | Add "Sold" nav item |
| `src/pages/Storefront.tsx` | Modify | Handle 'sold' view |
| `src/components/storefront/SoldItemsView.tsx` | Create | Display sold items gallery |
| `src/components/storefront/SoldProductCard.tsx` | Create | Read-only sold item card |
| `src/hooks/useSoldInventory.ts` | Create | Fetch sold items for public display |
| `src/pages/CheckoutSuccess.tsx` | Modify | Improve confirmation messaging |
| `src/hooks/useBudgetMetrics.ts` | Modify | Add operating vs deployment budgets |
| `src/components/accounting/BudgetDialog.tsx` | Modify | Two-section budget display |

---

## Technical Details

### Sold Items Query
```typescript
// New hook: useSoldInventory.ts
export function useSoldInventory() {
  return useQuery({
    queryKey: ['public-inventory', 'sold'],
    queryFn: async () => {
      const { data } = await supabase
        .from('inventory_items')
        .select('id, name, brand, size, sale_price, image_url, image_urls, notes, date_sold')
        .eq('status', 'sold')
        .order('date_sold', { ascending: false })
        .limit(50); // Show last 50 sold items
      return data;
    },
  });
}
```

### Budget Calculation Logic
```typescript
// Operating budget: 10-15% of operating capital for monthly expenses
const operatingBudgetPercent = 0.12; // 12%
const operatingBudget = totalOperatingCapital * operatingBudgetPercent;

// Deployment budget: Remaining after operating reserve, capped at 45% weekly
const deploymentBudget = weeklyDeploymentLimit; // Already calculated at 45%
```

### RLS Policy for Sold Items
The existing RLS policy allows public read for `status = 'sold'` items - no database changes needed:
```sql
-- Already exists (from memory context)
Policy: "Public can view storefront items"
Using: (status = ANY (ARRAY['for-sale', 'in-closet-parker', 'in-closet-spencer', 'listed']))
```

**Need to add 'sold' to this policy** for the Sold section to work publicly.

---

## Database Migration Required

Add 'sold' status to the public visibility RLS policy:

```sql
-- Update the RLS policy to include 'sold' status for public viewing
DROP POLICY IF EXISTS "Public can view storefront items" ON public.inventory_items;

CREATE POLICY "Public can view storefront items" ON public.inventory_items
  FOR SELECT
  USING (status = ANY (ARRAY[
    'for-sale'::item_status, 
    'in-closet-parker'::item_status, 
    'in-closet-spencer'::item_status, 
    'listed'::item_status,
    'sold'::item_status  -- NEW: Allow public to view sold items
  ]));
```

---

## Status Summary

| Feature | Status |
|---------|--------|
| Monthly Numbers Consolidation | Implementation ready |
| Sold Section in Storefront | Implementation ready (needs RLS update) |
| Meta Commerce Structure | READY / PENDING EXTERNAL CONNECTION |
| Stripe Checkout Confirmation | Implementation ready |
| Budget Categories | Implementation ready |

---

## After Implementation

1. **Test Sold Section** - Navigate to /shop and click "Sold" to view archive
2. **Verify RLS** - Confirm sold items are visible to unauthenticated users
3. **Test Checkout** - Complete a test purchase and verify enhanced success page
4. **Verify Budget UI** - Check that Operating and Deployment budgets display correctly
5. **Confirm Analytics** - Verify single "Monthly Numbers" button replaces the two previous buttons
