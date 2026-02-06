

# Storefront and Inventory Updates

## Changes

### 1. Posting Tracker button matches status box sizing and sidebar color
The "Posting" button in the Inventory page will be restyled to match the same size, shape, and appearance as the status breakdown cards (For Sale, OTW, etc.). It will use the sidebar gray color (`hsl(266, 4%, 20.8%)` / `bg-primary`) with white text, sitting alongside the other status boxes in the grid.

### 2. PostingPlatformCard "Add Items" button uses sidebar gray
The "Add Items" button inside each posting platform card currently uses `variant="secondary"`. It will be changed to use the sidebar gray background (`bg-primary text-primary-foreground`) so it matches the overall dark theme of the cards.

### 3. Remove Storefront link button
The storefront top nav currently shows a "Dashboard" button for authorized users. No other "storefront link" button exists elsewhere, so this stays as-is. If there's a specific button you want removed, let me know -- but based on the code, the nav links are just text tabs, not buttons.

### 4. Remove "Edit with Lovable" button
The `index.html` currently references Lovable in the OG image and Twitter meta tags. These will be removed/replaced. The "Edit with Lovable" badge that appears on published sites is injected by the platform -- it cannot be removed via code changes. However, once you connect a custom domain, it should no longer appear.

### 5. Update OG/Twitter meta images
Remove the Lovable branding from the `og:image` and `twitter:image` meta tags and the `twitter:site` reference.

### 6. Sold listing descriptions auto-generated
In `SoldProductCard.tsx` and `SoldProductDetail.tsx`, the `generateDescription` function currently includes "Send Offers/Trades" and "IG: Wall Street Archive". For sold items, it will be changed to show only:
- Item name
- Size (if available)  
- Sale price (formatted as currency)

### 7. Sold badge: black background, white text, top-left position
In `SoldProductCard.tsx`, change the SOLD badge from `bg-red-600` to `bg-black text-white` and ensure it's positioned top-left (it already is). Same change in `SoldProductDetail.tsx`.

---

## Technical Details

### Files to modify

| File | Changes |
|------|---------|
| `src/pages/Inventory.tsx` | Move the Posting trigger from a standalone button into the status grid as a card-sized box with `bg-primary text-primary-foreground` styling |
| `src/components/inventory/PostingPlatformCard.tsx` | Change the "Add Items" button from `variant="secondary"` to explicit `bg-primary text-primary-foreground hover:bg-primary/90` |
| `src/components/storefront/SoldProductCard.tsx` | Update `generateDescription` to show name + size + sold price only; change SOLD badge to `bg-black text-white` |
| `src/components/storefront/SoldProductDetail.tsx` | Update `generateDescription` to show name + size + sold price only; change SOLD badge to `bg-black text-white` |
| `index.html` | Remove Lovable OG image references and Twitter site tag |

### Posting button as status card
Instead of a separate outline button in the header, the "Posting" trigger will be rendered as an additional card in the status grid (after the flagged items card). It will look like:

```text
+------------------+
|   Posting        |
|   [Send icon]    |
|                  |
|  Track postings  |
+------------------+
```

Same dimensions as "For Sale", "OTW", etc. Dark sidebar color background, white text.

### Sold description format
```
Item Name
Size: 10
Sold: $250
```

No "Send Offers/Trades" or IG handle for sold items.
