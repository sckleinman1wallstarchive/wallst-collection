
# Storefront Landing Page Redesign

This plan transforms your storefront into a polished landing page experience inspired by Alex Maxamenko's website, with a top navigation bar, hero carousel, collection photos scroll, and a structured "New Arrivals" section.

---

## Overview

The redesign introduces a new **Landing Page** view that appears after the welcome gate. Users will see:

1. **Top Navigation Bar**: `Home | Shop All | Shop By Brand | Grails` with About Us at page bottom
2. **Hero Carousel**: Featured brands rotating with "Shop Now" buttons
3. **Collection Photos**: Horizontal scroll of manually uploaded lifestyle/collection images
4. **New Arrivals Section**: 12 items (4 per row), last 4 half-grayed with "Shop All" overlay
5. **About Us**: Moved to bottom of landing page

---

## Visual Flow

```text
+----------------------------------------------------------+
|  Welcome Gate ("WALL ST COLLECTION" + "Take a Tour")     |
+----------------------------------------------------------+
                           |
                           v
+----------------------------------------------------------+
|  TOP NAV: Home | Shop All | Shop By Brand | Grails       |
+----------------------------------------------------------+
|                                                          |
|  HERO CAROUSEL                                           |
|  [Featured Brand Image]                                  |
|  "RICK OWENS"                                            |
|  [Shop Now]                                              |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|  COLLECTION PHOTOS (horizontal scroll)                   |
|  [img] [img] [img] [img] [img] ...                       |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|  NEW ARRIVALS                                            |
|  [item] [item] [item] [item]  <- Row 1                   |
|  [item] [item] [item] [item]  <- Row 2                   |
|  [item] [item] [item] [item]  <- Row 3 (grayed overlay)  |
|         [View All Button]                                |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|  ABOUT US SECTION                                        |
|  (existing AboutUsGallery component)                     |
|                                                          |
+----------------------------------------------------------+
```

---

## Implementation Steps

### Step 1: Update Welcome Screen

**File**: `src/components/storefront/StorefrontWelcome.tsx`

- Change button text from "Shop" to "Take a Tour"
- Update `onEnterShop` callback naming to `onEnterTour` for clarity

---

### Step 2: Create Top Navigation Component

**New File**: `src/components/storefront/StorefrontTopNav.tsx`

- Horizontal bar with links: `Home | Shop All | Shop By Brand | Grails`
- Vertical bar separators (`|`) between each link
- Sticky positioning at top
- Dark background with white text
- Cart icon on the right side
- Edit mode toggle button (for authorized users)

---

### Step 3: Create Hero Carousel Component

**New File**: `src/components/storefront/HeroCarousel.tsx`

- Uses existing `embla-carousel-react` (already installed)
- Fetches featured brands from `storefront_brands` table
- Displays brand art image fullscreen with overlay
- Shows brand name in large typography
- "Shop Now" button links to Shop All filtered by that brand
- Auto-advances every 5 seconds
- Navigation dots at bottom

---

### Step 4: Create Collection Photos Component

**New File**: `src/components/storefront/CollectionPhotosScroll.tsx`

**Database**: New table `collection_photos` with columns:
- `id` (uuid, primary key)
- `image_url` (text)
- `display_order` (integer)
- `created_at` (timestamp)

**Features**:
- Horizontal scrolling container with overflow-x-auto
- Displays manually uploaded collection/lifestyle photos
- In edit mode: add/remove/reorder photos
- Images stored in `inventory-images` bucket under `/collection/` folder

---

### Step 5: Create New Arrivals Section Component

**New File**: `src/components/storefront/NewArrivalsSection.tsx`

- Displays first 12 items from `usePublicInventory` (ordered by most recent)
- 4-column grid layout (`grid-cols-4`)
- Last 4 items (row 3) have a semi-transparent gray overlay
- "View All" button overlay on the grayed section
- Clicking "View All" navigates to Shop All view

---

### Step 6: Create Landing Page Component

**New File**: `src/components/storefront/StorefrontLanding.tsx`

Composes all sections:
1. `StorefrontTopNav`
2. `HeroCarousel`
3. `CollectionPhotosScroll`
4. `NewArrivalsSection`
5. `AboutUsGallery` (existing component)

---

### Step 7: Update Main Storefront Page

**File**: `src/pages/Storefront.tsx`

- Add new view state: `'landing'`
- Welcome screen navigates to `'landing'` instead of `'shop-all'`
- Landing page navigation:
  - "Home" stays on landing
  - "Shop All", "Shop By Brand", "Grails" navigate to respective views
- Update Shop All grid from 3 columns to 4 columns (`lg:grid-cols-4`)
- Remove sidebar completely when on landing page
- Keep sidebar for other views (Shop All, Brands, Grails, Closets)

---

### Step 8: Update Shop All Grid Layout

**Files**: `src/pages/Storefront.tsx`, `src/components/storefront/StorefrontProductCard.tsx`

- Change grid from `lg:grid-cols-3` to `lg:grid-cols-4`
- Adjust card sizing for 4-column layout

---

## Database Changes

### New Table: `collection_photos`

```sql
CREATE TABLE public.collection_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.collection_photos ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view collection photos"
  ON public.collection_photos FOR SELECT
  USING (true);

-- Authenticated users with allowed email can manage
CREATE POLICY "Allowed users can manage collection photos"
  ON public.collection_photos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.allowed_emails
      WHERE email = auth.jwt()->>'email'
    )
  );
```

---

## New/Modified Files Summary

| Action | File |
|--------|------|
| Modify | `src/components/storefront/StorefrontWelcome.tsx` |
| Create | `src/components/storefront/StorefrontTopNav.tsx` |
| Create | `src/components/storefront/HeroCarousel.tsx` |
| Create | `src/components/storefront/CollectionPhotosScroll.tsx` |
| Create | `src/components/storefront/NewArrivalsSection.tsx` |
| Create | `src/components/storefront/StorefrontLanding.tsx` |
| Create | `src/hooks/useCollectionPhotos.ts` |
| Modify | `src/pages/Storefront.tsx` |
| Modify | `src/hooks/usePublicInventory.ts` (add query for recent items) |

---

## Technical Details

### Hero Carousel Implementation
- Uses Embla Carousel with autoplay plugin
- Fetches from existing `storefront_brands` table (brands with art images)
- Fallback to placeholder if no brands configured

### Collection Photos Management
- In edit mode, shows "+" button to add new photos
- Drag-and-drop reordering with @dnd-kit
- Delete button on hover
- Images uploaded to `inventory-images/collection/` path

### New Arrivals Logic
- Query `inventory_items` where `status = 'for-sale'`
- Order by `created_at DESC` to get newest items
- Limit to 12 items
- Apply gray overlay CSS to items 9-12

### Navigation State
- `currentView` now includes `'landing'` option
- Top nav visible only on landing page
- Sidebar hidden on landing page, visible on other views
