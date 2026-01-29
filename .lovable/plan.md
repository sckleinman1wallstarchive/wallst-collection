

# Implementation Plan: Storefront Item Assignment and Fixes

## Summary of Issues Found

### Issue 1: ERD CY Twomblee Hoodie Not on Storefront
The item "Enfants Riches Deprimes x CY Twomblee" has status **`listed`**, not **`for-sale`**. The storefront's "Shop All" only shows items with `for-sale` status. This is working as designed - you need to change the item's status to `for-sale` in the Inventory page if you want it to appear on the storefront.

### Issue 2: Assign Items to Brands in Edit Mode
Currently, when you click a brand card, it filters by matching the item's `brand` field. There's no way to manually curate which items appear under which brand showcase. We'll add an item assignment feature.

### Issue 3: Category Filtering
The current categories in the database are: `tops`, `bottoms`, `outerwear`, `footwear`, `accessories`, `bags`, `other`. We'll add the specific categories you requested (belt, sweater, jacket) to make filtering more granular.

---

## Implementation Details

### Part 1: Add "Assign Items" Feature to Shop by Brand

**Database Changes:**
- Create a new junction table `storefront_brand_items` to link inventory items to storefront brands (many-to-many relationship)
- This allows one item to be featured under multiple brands if needed

```text
New Table: storefront_brand_items
- id (uuid, primary key)
- brand_id (uuid, references storefront_brands)
- inventory_item_id (uuid, references inventory_items)
- display_order (integer)
- created_at (timestamp)
```

**UI Changes (ShopByBrandView.tsx):**
- Add "Assign Items" button on each brand card in edit mode
- Open a dialog showing available inventory items (for-sale status)
- Allow selecting/deselecting items to assign to that brand
- Save selections to the new junction table

**Filtering Logic Update:**
- When clicking a brand to view its items:
  - First, show items explicitly assigned via `storefront_brand_items`
  - Optionally, also include items where the `brand` field matches (existing behavior)
  - Or make it exclusive (only show assigned items)

---

### Part 2: Add New Category Options

**Database Changes:**
- Update the `item_category` enum to add: `belt`, `sweater`, `jacket`
- These are more specific than the current options

**UI Changes:**
- Update `StorefrontFilters.tsx` category options
- Update `StorefrontProductCard.tsx` category dropdown
- Update any other places that list categories

---

### Part 3: Quick Fix for ERD Hoodie

No code changes needed - in the Inventory page, change the item's status from `listed` to `for-sale` and it will appear on the storefront.

---

## Files to Modify

| File | Changes |
|------|---------|
| **Database Migration** | Create `storefront_brand_items` table with RLS policies |
| **Database Migration** | Add `belt`, `sweater`, `jacket` to `item_category` enum |
| `src/hooks/useStorefrontBrands.ts` | Add functions to manage item assignments |
| `src/components/storefront/ShopByBrandView.tsx` | Add "Assign Items" button and dialog |
| `src/components/storefront/StorefrontFilters.tsx` | Add new category options |
| `src/components/storefront/StorefrontProductCard.tsx` | Update category dropdown options |
| `src/pages/Storefront.tsx` | Update brand click handler to use assigned items |

---

## New Feature: Item Assignment Dialog

When you click "Assign Items" on a brand card in edit mode:

1. A dialog opens showing all for-sale inventory items
2. Items already assigned to this brand are pre-selected (checkmarked)
3. You can search/filter the list
4. Select items to add, deselect to remove
5. Click "Save" to update the assignments
6. The brand card can optionally show a count like "5 items assigned"

---

## Technical Flow

```text
Shop by Brand (Edit Mode)
     |
     v
+------------------+
| Brand Card       |
| [Assign Items]   |  <-- New button
| [Upload Art]     |
+------------------+
     |
     v (click Assign Items)
+------------------------------------------+
| Assign Items to "Chrome Hearts"          |
|------------------------------------------|
| [Search items...]                        |
|                                          |
| [ ] Chrome Hearts Ring - $450            |
| [x] Chrome Hearts Hoodie - $800          |
| [x] Chrome Hearts Dagger - $350          |
| [ ] Other Brand Jacket - $600            |
|                                          |
| [Cancel]              [Save Assignments] |
+------------------------------------------+
```

---

## Summary

This plan adds the ability to manually curate which items appear under each brand in the storefront, adds more specific clothing categories for filtering, and explains why the ERD hoodie isn't showing (status issue, not a bug).

