
# Storefront Navigation Simplification

This plan removes the sidebar entirely and makes the top navigation the sole method for navigating the storefront. It also removes the Collection Photos feature, adds an "Add More" option to Grails, and implements shareable item links.

---

## Changes Overview

1. **Remove Sidebar Navigation** - Delete sidebar from all storefront views
2. **Remove Collection Photos** - Remove component and database table
3. **Add Grails "Add More" Button** - Allow adding new grails from the Grails view
4. **Individual Item Links** - Support URL parameters for direct item access

---

## Implementation Steps

### Step 1: Remove Collection Photos Feature

**Files to modify/delete:**
- Delete `src/components/storefront/CollectionPhotosScroll.tsx`
- Delete `src/hooks/useCollectionPhotos.ts`
- Remove import and usage from `src/components/storefront/StorefrontLanding.tsx`
- Database: Drop `collection_photos` table (migration)

---

### Step 2: Remove Sidebar from All Views

**File**: `src/pages/Storefront.tsx`

Current behavior: Sidebar shows on Shop All, Brands, Grails, Closets views
New behavior: No sidebar anywhere - only top nav on all views

Changes:
- Remove `StorefrontSidebar` component import and rendering
- Remove `SidebarProvider` wrapper for non-landing views
- Render `StorefrontTopNav` on ALL views (not just landing)
- Update navigation state management

**File**: `src/components/storefront/StorefrontTopNav.tsx`

- Add navigation for all views (currently only handles landing)
- Ensure it works on Shop All, Brands, Grails, Closets pages
- Add active state styling for current view

---

### Step 3: Add "Add More" to Grails

**File**: `src/components/storefront/CollectionGrailsView.tsx`

In edit mode, add an "Add Grail" button that:
- Opens the existing item selector dialog
- Allows selecting an item to add as a new grail
- Uses existing `useStorefrontGrails` hook's add functionality

The button will appear at the end of the grails grid (similar to how empty slots work now).

---

### Step 4: Individual Item Links

**File**: `src/pages/Storefront.tsx`

Add URL parameter support:
- Check for `?item=<uuid>` parameter on load
- If present, automatically open that item's detail sheet
- Works with any view (Shop All, Closets, etc.)

Example URLs:
- `https://yoursite.com/storefront?item=abc-123` - Opens item detail
- `https://yoursite.com/storefront?view=shop-all&item=abc-123` - Shop All with item open

**Implementation:**
```text
1. Use useSearchParams() from react-router-dom
2. On mount, check for 'item' parameter
3. Find item in inventory data
4. Set selectedItem state to open detail sheet
5. Optionally update URL when opening/closing items
```

---

## Files Summary

| Action | File |
|--------|------|
| Delete | `src/components/storefront/CollectionPhotosScroll.tsx` |
| Delete | `src/hooks/useCollectionPhotos.ts` |
| Modify | `src/components/storefront/StorefrontLanding.tsx` |
| Modify | `src/pages/Storefront.tsx` |
| Modify | `src/components/storefront/StorefrontTopNav.tsx` |
| Modify | `src/components/storefront/CollectionGrailsView.tsx` |
| Create | Database migration to drop `collection_photos` table |

---

## Navigation Flow After Changes

```text
Welcome Gate
     |
     v
+----------------------------------------------------------+
|  TOP NAV: Home | Shop All | Shop By Brand | Grails       |
+----------------------------------------------------------+
     |
     +-- Home (Landing) --> Hero, New Arrivals, About Us
     |
     +-- Shop All --> 4-column product grid (top nav stays)
     |
     +-- Shop By Brand --> Brand cards with art (top nav stays)
     |
     +-- Grails --> Curated grails + "Add More" button (top nav stays)
```

No sidebar on any page. Top nav is persistent across all views.

---

## Shareable Link Format

Once implemented, you can share individual items like:
- `https://wallst-collection.lovable.app/storefront?item=<item-uuid>`

When someone opens this link, they'll see the storefront with that item's detail sheet already open.

---

## Database Migration

```sql
-- Drop the collection_photos table since feature is removed
DROP TABLE IF EXISTS public.collection_photos;
```
