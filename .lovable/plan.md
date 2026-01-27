
# Storefront Navigation - Completed

## Summary
Removed sidebar navigation and made top navigation the sole method for navigating the storefront. Also removed Collection Photos feature, added "Add More" to Grails, and implemented shareable item links.

## Completed Changes

### ✅ Removed Collection Photos Feature
- Deleted `src/components/storefront/CollectionPhotosScroll.tsx`
- Deleted `src/hooks/useCollectionPhotos.ts`
- Removed from `src/components/storefront/StorefrontLanding.tsx`
- Dropped `collection_photos` table via migration

### ✅ Removed Sidebar from All Views
- Deleted `src/components/storefront/StorefrontSidebar.tsx`
- Updated `src/pages/Storefront.tsx` to use top nav on all views
- Removed `SidebarProvider` wrapper entirely

### ✅ Added "Add Grail" Button
- Added "Add Grail" button to `CollectionGrailsView.tsx` (visible in edit mode)
- Opens existing item selector dialog

### ✅ Individual Item Links
- Added URL parameter support: `?item=<uuid>`
- Links like `https://wallst-collection.lovable.app/storefront?item=abc-123` open item detail directly
- URL updates when opening/closing item details

## Navigation Flow

```text
Welcome Gate → "Take a Tour"
     |
     v
+----------------------------------------------------------+
|  TOP NAV: Home | Shop All | Shop By Brand | Grails       |
+----------------------------------------------------------+
     |
     +-- Home (Landing) --> Hero, New Arrivals, About Us
     +-- Shop All --> 4-column product grid
     +-- Shop By Brand --> Brand cards with art
     +-- Grails --> Curated grails + "Add Grail" button
```

## Custom Domain
To connect a custom domain:
1. Go to Settings → Domains in Lovable
2. Add your domain (e.g., wallstcollection.com)
3. Update DNS records as instructed
