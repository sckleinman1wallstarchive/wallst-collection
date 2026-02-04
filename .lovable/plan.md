
# Direct Item Links + Descriptions on Storefront

## Overview
This plan addresses four related requests:
1. **Direct item links** - Bypass the welcome page when sharing an item link on Instagram
2. **Descriptions on storefront** - Show the listing description (notes) on Shop All cards and detail views
3. **AI brand categorization** - Ensure items like "Enfants Riches Deprimes x CY Twombly" get properly tagged
4. **Automatic description generation** - Populate descriptions on the shop page automatically

---

## Part 1: Bypass Welcome Page for Direct Item Links

Currently when someone clicks a link like `/shop?item=abc123`, they still see the Welcome page and must click "Take a Tour" before the item opens.

### Changes

**File: `src/pages/Storefront.tsx`**

Update the URL parameter handling to bypass the welcome screen when an item ID is present:

```text
Current flow:
  URL has ?item=123 → Show welcome → Click "Take a Tour" → Then open item

New flow:
  URL has ?item=123 → Skip welcome → Jump directly to "home" view with item open
```

Logic change:
- On initial mount, check if `?item=` parameter exists
- If yes, skip `'welcome'` state and go directly to `'home'`
- Open the product detail immediately

---

## Part 2: Show Descriptions on Storefront

The `notes` field in `inventory_items` stores the listing description. Currently this field is fetched but not displayed prominently.

### Changes

**File: `src/components/storefront/StorefrontProductCard.tsx`**

Add the description (notes) below the item name:
- Show first 50-80 characters with "..." truncation
- Use muted text styling to keep the card clean
- Description appears between name and price

**File: `src/components/storefront/StorefrontProductDetail.tsx`**

Add a dedicated "Description" section:
- Display the full description/notes prominently
- Position it after the size/category badges
- Use proper typography for readability

---

## Part 3: Automatic Description Generation

When an item doesn't have a description yet, auto-generate one using the listing format from the inventory system.

### Changes

**File: `src/components/storefront/StorefrontProductCard.tsx` and `StorefrontProductDetail.tsx`**

If `notes` is empty/null, generate a default description using the same format:
- Item Name
- Size: [size]
- Send Offers/Trades
- Hit Me Up For A Better Price On IG At Wall Street Archive

This matches what you create in the inventory listing generator.

---

## Part 4: AI Brand Categorization Improvements

The CY Twombly x ERD item currently has no brand set. The AI extraction already handles this, but needs a trigger.

### Changes

**1. Update brand extraction prompt (`supabase/functions/extract-brands/index.ts`)**

Add explicit handling for collaborations:
- "ERD x CY Twombly" should map to brand "Enfants Riches Deprimes" 
- "Supreme x [Artist]" should map to "Supreme"
- First brand in collaboration takes precedence

**2. Trigger brand extraction for items missing brand data**

The existing "Auto-tag" button on Analytics already does this. No code change needed - just run it to backfill the CY Twombly item.

---

## Summary of File Changes

| File | Changes |
|------|---------|
| `src/pages/Storefront.tsx` | Check for `?item=` on mount, skip welcome page if present |
| `src/components/storefront/StorefrontProductCard.tsx` | Add description display (truncated) below item name |
| `src/components/storefront/StorefrontProductDetail.tsx` | Add full description section, auto-generate if empty |
| `supabase/functions/extract-brands/index.ts` | Improve collaboration handling in AI prompt |

---

## Technical Details

### Direct Link URL Format
Your Instagram links will use this format:
```
https://wallst-collection.lovable.app/shop?item=7437bd01-5a0f-4d94-8abe-b846a58a1e31
```

When someone taps this link:
1. Page loads directly to the storefront (no welcome gate)
2. Product detail popup opens automatically
3. User can add to cart immediately

### Description Display Logic

```typescript
// Generate default if no notes exist
const getDescription = (item: PublicInventoryItem): string => {
  if (item.notes) return item.notes;
  
  // Auto-generate default listing format
  return [
    item.name,
    '',
    item.size ? `Size: ${item.size}` : 'Size: One Size',
    '',
    'Send Offers/Trades',
    '',
    'Hit Me Up For A Better Price On IG At Wall Street Archive'
  ].join('\n');
};
```

### Card Preview (truncated)
On the Shop All grid, show only first line or two:
```typescript
const previewDescription = (desc: string) => {
  const firstLine = desc.split('\n').filter(l => l.trim())[0] || '';
  return firstLine.length > 60 ? firstLine.slice(0, 60) + '...' : firstLine;
};
```

---

## After Implementation

1. **Test direct links**: Copy an item URL and open in incognito - should bypass welcome
2. **Run Auto-tag**: Go to Analytics page, click "Auto-tag" to fix CY Twombly item
3. **Verify descriptions**: Check Shop All page shows descriptions under each item
