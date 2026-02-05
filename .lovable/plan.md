
# Two Features: Image Tools Status Filter + Inventory Posting Tracker

## Feature 1: Status Filter in Image Tools

Add a row of status filter buttons (matching the inventory status cards style) above the inventory image selector so you can filter which items show up by status (e.g., only "For Sale" items, only "OTW", etc.).

- Adds a horizontal row of clickable status chips/buttons at the top of the "Select Inventory Images" card
- Statuses shown: For Sale, OTW, In Closet (Parker), In Closet (Spencer), Sold, plus an "All" option
- Selecting a status filters the item list below to only show items with that status
- Defaults to "All" (current behavior)

---

## Feature 2: Posting Tracker in Inventory

A new "Posting" button in the Inventory page header (next to "Add Item" and the Convention Mode toggle) that opens a dialog/panel with big platform boxes for tracking where items have been posted.

### How it works

1. **"Posting" button** in the inventory header bar opens a full-width dialog
2. Inside the dialog: a grid of **3-6 large platform boxes** (e.g., Grailed, Depop, eBay, Mercari, Instagram, Vinted)
3. Each box:
   - Has a dark background matching the sidebar color (`hsl(266, 4%, 20.8%)`) with **white text**
   - Shows the platform name prominently
   - Has an optional artwork/icon area (defaults to the sidebar gray color, but you can upload a custom image)
   - Shows a count of items posted to that platform
   - Clicking a box opens a sub-view where you can select inventory items to mark as "posted" to that platform
4. The dialog background is white (matching the rest of the pages)
5. Data is stored in a new database table `posting_tracker` to persist which items are marked as posted to which platform

### UI Layout

```text
+----------------------------------------------------------+
|  Posting Tracker                                    [X]  |
+----------------------------------------------------------+
|                                                          |
|  +------------------+  +------------------+              |
|  |  (artwork/gray)  |  |  (artwork/gray)  |              |
|  |                  |  |                  |              |
|  |    GRAILED       |  |     DEPOP        |              |
|  |   12 posted      |  |    8 posted      |              |
|  |  [+ Add Items]   |  |  [+ Add Items]   |              |
|  +------------------+  +------------------+              |
|                                                          |
|  +------------------+  +------------------+              |
|  |  (artwork/gray)  |  |  (artwork/gray)  |              |
|  |                  |  |                  |              |
|  |     EBAY         |  |   INSTAGRAM      |              |
|  |   5 posted       |  |   3 posted       |              |
|  |  [+ Add Items]   |  |  [+ Add Items]   |              |
|  +------------------+  +------------------+              |
|                                                          |
+----------------------------------------------------------+
```

### Database

New table: `posting_tracker`
- `id` (uuid, PK)
- `platform_name` (text) -- e.g., "Grailed", "Depop"
- `artwork_url` (text, nullable) -- custom artwork for the box
- `display_order` (integer)
- `created_at` (timestamptz)

New table: `posting_tracker_items`
- `id` (uuid, PK)
- `tracker_id` (uuid, FK to posting_tracker)
- `inventory_item_id` (uuid, FK to inventory_items)
- `posted_at` (timestamptz, default now())
- `created_at` (timestamptz)

Both tables get RLS policies using `is_allowed_user()` for full CRUD.

---

## Technical Summary

### Files to create
| File | Purpose |
|------|---------|
| `src/components/inventory/PostingTrackerDialog.tsx` | Main dialog with the big platform boxes grid |
| `src/components/inventory/PostingPlatformCard.tsx` | Individual platform box component (dark bg, white text, artwork area) |
| `src/components/inventory/PostingAddItemsDialog.tsx` | Sub-dialog for selecting inventory items to mark as posted |
| `src/hooks/usePostingTracker.ts` | Hook for CRUD operations on posting_tracker and posting_tracker_items |

### Files to modify
| File | Change |
|------|--------|
| `src/pages/Inventory.tsx` | Add "Posting" button next to Add Item, render PostingTrackerDialog |
| `src/pages/ImageTools.tsx` | Add status filter state + pass filtered inventory to InventoryImageSelector |
| `src/components/imagetools/InventoryImageSelector.tsx` | No changes needed (filtering happens at parent level) |

### Database migration
- Create `posting_tracker` and `posting_tracker_items` tables with RLS policies
