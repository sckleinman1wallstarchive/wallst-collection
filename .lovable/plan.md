
# Multi-Change Implementation Plan

## Overview
This plan addresses several connected changes to streamline the application:

1. **Remove Lovable AI from Image Tools** - Eliminate the "Color Switcher" processor option that uses the Lovable AI gateway
2. **Remove Cross-Posting feature** - Delete the page, route, and sidebar link
3. **Reorder sidebar navigation**
4. **Fix monthly goals to track by calendar month** (current month only)
5. **Display which item is "listed"** (currently: "Enfants Riches Deprimes x CY Twomblee")
6. **Fix refunds language** - Refunds are "recovered funds", not "lost" money
7. **Hide scammed/refunded items from "All Items"** - Only show them in their specific status tab

---

## 1. Remove Lovable AI from Image Tools

### Files to Modify:

**`src/components/imagetools/BackgroundSelector.tsx`**
- Remove the `ProcessorType` export (only keep `'removebg'`)
- Remove the processor selector UI (lines 67-106)
- Remove the warning message for Lovable AI

**`src/pages/ImageTools.tsx`**
- Remove `processorType` state (default to `'removebg'` only)
- Remove AI batching logic (simplify processing since only remove.bg will be used)
- Remove processor toggle in button text
- Always show remove.bg usage display

**Edge functions** (`supabase/functions/ai-background-replace/index.ts`)
- Keep the function file but it will no longer be called from the frontend

---

## 2. Remove Cross-Posting

### Files to Delete:
- `src/pages/CrossPosting.tsx`
- `src/components/crossposting/ItemSelector.tsx`
- `src/components/crossposting/ListingGenerator.tsx`
- `src/components/crossposting/PlatformListingCard.tsx`

### Files to Modify:

**`src/App.tsx`**
- Remove import of `CrossPosting`
- Remove route: `<Route path="/cross-posting" element={<CrossPosting />} />`

**`src/components/layout/AppSidebar.tsx`**
- Remove Cross-Posting from navigation array
- Remove `Share2` icon import

---

## 3. Reorder Sidebar Navigation

**`src/components/layout/AppSidebar.tsx`**

New order (as requested):
```text
1. Overview          (/)
2. Inventory         (/inventory)
3. Storefront        (/storefront)
4. Accounting        (/accounting)
5. Analytics         (/analytics)
6. Image Tools       (/image-tools)
7. Authenticate      (/authenticate)
8. Pop Ups           (/pop-ups)
9. Contacts          (/contacts)
10. Goals            (/goals)
```

---

## 4. Monthly Goals - Track by Calendar Month

**`src/pages/Goals.tsx`** and **`src/pages/Index.tsx`**

Currently, `getFinancialSummary().totalRevenue` returns ALL-TIME revenue. For monthly tracking:
- Filter sold items by current calendar month
- Calculate revenue only from items sold in the current month

**Changes:**
- In `Goals.tsx`: Replace `summary.totalRevenue` with a monthly calculation
- Add helper to filter by current month
- Display current month name in the UI

---

## 5. Show Which Item is "Listed"

The single "listed" item is **Enfants Riches Deprimes x CY Twomblee**.

**`src/pages/Index.tsx`** (or Goals page - based on your answer, this seems more like a debugging question)

Since you're curious which item is listed, I'll add a small indicator in the "Monthly Goals" section showing:
- "1 item currently listed: [item name]" (clickable link to open item)

---

## 6. Fix Refund Language

Refunds are money recovered, not lost. Current problematic text is in:

**`src/components/inventory/ItemDetailSheet.tsx`** (line 626)
```jsx
// Current:
<p className="text-sm text-destructive font-medium">Lost ${item.acquisitionCost} - {item.status}</p>

// Change to (for refunded status only):
<p className="text-sm text-chart-2 font-medium">Recovered ${item.acquisitionCost} - Refunded</p>
```

**For scammed items:** Keep the red "Lost" styling since scammed money IS lost.

The logic will differentiate:
- `status === 'refunded'` → Green "Recovered $X - Refunded"
- `status === 'scammed'` → Red "Lost $X - Scammed"

---

## 7. Hide Scammed/Refunded from "All Items" Tab

**`src/components/inventory/InventoryTable.tsx`**

Currently, "All Items" filter (`statusFilter === 'all'`) shows everything.

Change the filter logic:
- `all` → Shows everything EXCEPT `scammed` and `refunded`
- Rename `all` to something like "active" or keep as "all" but exclude these statuses
- Users can still view scammed/refunded via the "Issues" filter

---

## Technical Summary

| File | Change |
|------|--------|
| `src/components/imagetools/BackgroundSelector.tsx` | Remove Lovable AI processor option |
| `src/pages/ImageTools.tsx` | Simplify to remove.bg only |
| `src/pages/CrossPosting.tsx` | DELETE |
| `src/components/crossposting/*` | DELETE (3 files) |
| `src/App.tsx` | Remove CrossPosting import and route |
| `src/components/layout/AppSidebar.tsx` | Remove Cross-Posting, reorder navigation |
| `src/pages/Goals.tsx` | Filter revenue by current calendar month |
| `src/pages/Index.tsx` | Filter revenue by current month, add listed item indicator |
| `src/components/inventory/ItemDetailSheet.tsx` | Change refund text to "Recovered" (green) |
| `src/components/inventory/InventoryTable.tsx` | Exclude scammed/refunded from "All Items" filter |
