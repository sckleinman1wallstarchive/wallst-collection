

# Implementation Plan: Schedule Enhancements, Analytics Tabs, Storefront Polish & Sold Archive Control

## Summary

This plan addresses all your requests:

1. **Schedule - Add "Both" option** for assigning tasks to both Spencer and Parker
2. **Schedule - Quick Notes parser** with AI to auto-create tasks from free-form text
3. **Sold section - Delete/Hide button** to remove items from the sold archive in edit mode
4. **Sold section - Hover artwork effect** like Grails cards
5. **Analytics tabs in Accounting** - Add the same tab navigation (Dashboard, Monthly Numbers, Pop Ups) to the inline Analytics view
6. **Accounting - Remove misleading monthly goal section** showing all-time revenue at 607%
7. **Storefront navigation polish** - Upgrade from cheap pipe separators to sleek pill-style tabs

---

## Part 1: Schedule - Add "Both" Owner Option

### Database Migration
Add 'both' to the task_owner enum:

```sql
ALTER TYPE task_owner ADD VALUE 'both';
```

### File Changes

| File | Changes |
|------|---------|
| `src/hooks/useTasks.ts` | Update `TaskOwner` type to include `'both'` |
| `src/components/schedule/AddTaskDialog.tsx` | Add "Both" option to the owner dropdown |
| `src/components/schedule/CalendarView.tsx` | Add purple color for "both" tasks |
| `src/components/schedule/TaskPopover.tsx` | Add purple badge color for "both" owner |
| `src/pages/Schedule.tsx` | Add "Both" filter button |

### Color Scheme
- Spencer: Blue (`bg-blue-500`)
- Parker: Green (`bg-green-500`)
- Both: Purple (`bg-purple-500`)

---

## Part 2: Quick Notes Parser (AI Task Creation)

Add a text area where you can paste notes and have AI automatically extract and create tasks.

### New Components

**File: `src/components/schedule/QuickNotesParser.tsx`**

A collapsible text area with:
- Large textarea for pasting/typing notes
- "Parse & Create Tasks" button
- Uses AI to extract:
  - Task title
  - Description
  - Due date (inferred from "by Friday", "next week", etc.)
  - Owner (inferred from "Spencer should...", "Parker needs to...")
  - Priority (inferred from "urgent", "ASAP", etc.)

### New Edge Function

**File: `supabase/functions/parse-tasks/index.ts`**

Uses Lovable AI Gateway (`google/gemini-2.5-flash`) to parse free-form notes:

```typescript
// Input: "Parker needs to list the Balenciaga by Friday. Spencer should source more jewelry before next week."
// Output: [
//   { title: "List the Balenciaga", owner: "parker", dueDate: "2026-02-07", priority: "medium" },
//   { title: "Source more jewelry", owner: "spencer", dueDate: "2026-02-12", priority: "medium" }
// ]
```

### UI Integration
Add a collapsible "Quick Notes" section above the calendar in `Schedule.tsx`.

---

## Part 3: Sold Section - Delete/Hide Button

Allow hiding items from the sold archive in edit mode.

### Database Migration

```sql
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS hide_from_sold_archive boolean DEFAULT false;
```

### File Changes

| File | Changes |
|------|---------|
| `src/hooks/useSoldInventory.ts` | Add `hide_from_sold_archive` to interface, filter hidden items |
| `src/components/storefront/SoldItemsView.tsx` | Accept `isEditMode` prop, add `onRemoveItem` handler |
| `src/components/storefront/SoldProductCard.tsx` | Add remove button (X) in edit mode |
| `src/pages/Storefront.tsx` | Pass `isEditMode` to SoldItemsView, add mutation for hiding items |

### How It Works
- In edit mode, each sold card shows an X button
- Clicking it sets `hide_from_sold_archive = true`
- Item is filtered from the query but kept in database for accounting

---

## Part 4: Sold Section - Hover Artwork Effect

Make sold cards behave like GrailCards - on hover, reveal clean artwork.

### File Changes

**File: `src/components/storefront/SoldProductCard.tsx`**

Refactor to match GrailCard pattern:
- Add `isHovered` state
- Base image shows product with SOLD badge and text overlay
- On hover: fade overlay, show clean image (or art if uploaded)
- Optional: support `closet_art_url` or similar field for custom hover art

### Visual Behavior
```
Normal State: Product image with SOLD badge + price overlay
Hover State: Clean product image fades in, text fades out
```

---

## Part 5: Analytics Tabs in Accounting

The Analytics inline view (in Accounting) currently only shows the Dashboard. Add the same tab navigation as the main Analytics page.

### File Changes

**File: `src/components/accounting/AnalyticsInlineView.tsx`**

Add imports and state:
```typescript
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MonthlyPerformanceView } from '@/components/analytics/MonthlyPerformanceView';
import { PopUpsInlineView } from '@/components/analytics/PopUpsInlineView';

type AnalyticsSubView = 'dashboard' | 'monthly-numbers' | 'pop-ups';
const [currentSubView, setCurrentSubView] = useState<AnalyticsSubView>('dashboard');
```

Add tab navigation below the header:
```typescript
<Tabs value={currentSubView} onValueChange={(v) => setCurrentSubView(v as AnalyticsSubView)}>
  <TabsList>
    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
    <TabsTrigger value="monthly-numbers">Monthly Numbers</TabsTrigger>
    <TabsTrigger value="pop-ups">Pop Ups</TabsTrigger>
  </TabsList>
</Tabs>
```

Conditionally render views:
```typescript
if (currentSubView === 'monthly-numbers') {
  return <MonthlyPerformanceView onBack={() => setCurrentSubView('dashboard')} />;
}
if (currentSubView === 'pop-ups') {
  return <PopUpsInlineView onBack={() => setCurrentSubView('dashboard')} />;
}
```

---

## Part 6: Accounting - Remove Misleading Monthly Goal Section

The section at lines 319-359 in `Accounting.tsx` shows:
- "Monthly Goal: $5,000" at 607%
- But it's actually using **all-time revenue** ($30,352), not monthly

This is misleading and wastes space.

### File Changes

**File: `src/pages/Accounting.tsx`**

Delete lines 319-359 (the "Compact Monthly Goal Progress" Card):

```typescript
// DELETE THIS ENTIRE BLOCK:
{/* Compact Monthly Goal Progress */}
<Card className="p-4">
  <div className="flex flex-col md:flex-row md:items-center gap-4">
    ...
  </div>
</Card>
```

---

## Part 7: Storefront Navigation - Premium Design

The current nav uses plain text with `|` pipe separators which looks cheap.

### Current Design
```
Home | Shop All | Sold | Shop By Brand | Grails | Personal Collection
```

### New Design
Sleek pill-based navigation with:
- Subtle dark background pill container
- Active tab has white background with black text
- Inactive tabs have transparent background with hover effect

### File Changes

**File: `src/components/storefront/StorefrontTopNav.tsx`**

Replace the current nav structure:

```typescript
// Before
<nav className="flex items-center gap-0 justify-center">
  {NAV_ITEMS.map((item, index) => (
    <div key={item.view} className="flex items-center">
      {index > 0 && (
        <span className="text-white/40 mx-3 select-none">|</span>
      )}
      <button ...>
        {item.label}
      </button>
    </div>
  ))}
</nav>

// After
<nav className="flex items-center gap-1 bg-white/5 rounded-full px-1.5 py-1">
  {NAV_ITEMS.map((item) => (
    <button
      key={item.view}
      onClick={() => onNavigate(item.view)}
      className={`px-4 py-1.5 rounded-full text-sm transition-all ${
        currentView === item.view
          ? 'bg-white text-black font-medium'
          : 'text-white/60 hover:text-white hover:bg-white/10'
      }`}
    >
      {item.label}
    </button>
  ))}
</nav>
```

---

## File Changes Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/hooks/useTasks.ts` | Modify | Add 'both' to TaskOwner type |
| `src/components/schedule/AddTaskDialog.tsx` | Modify | Add "Both" option to dropdown |
| `src/components/schedule/CalendarView.tsx` | Modify | Purple dots for "both" tasks |
| `src/components/schedule/TaskPopover.tsx` | Modify | Purple badge for "both" owner |
| `src/pages/Schedule.tsx` | Modify | Add "Both" filter, integrate QuickNotesParser |
| `src/components/schedule/QuickNotesParser.tsx` | Create | Notes-to-tasks AI parser UI |
| `supabase/functions/parse-tasks/index.ts` | Create | AI parsing edge function |
| `src/hooks/useSoldInventory.ts` | Modify | Filter hidden items, add field to interface |
| `src/components/storefront/SoldItemsView.tsx` | Modify | Pass edit mode, handle removal |
| `src/components/storefront/SoldProductCard.tsx` | Modify | Add remove button, hover effect |
| `src/pages/Storefront.tsx` | Modify | Pass isEditMode to SoldItemsView |
| `src/components/accounting/AnalyticsInlineView.tsx` | Modify | Add tabs for Monthly Numbers & Pop Ups |
| `src/pages/Accounting.tsx` | Modify | Remove misleading monthly goal section |
| `src/components/storefront/StorefrontTopNav.tsx` | Modify | Pill-style navigation design |

---

## Database Migrations

```sql
-- Add 'both' to task_owner enum
ALTER TYPE task_owner ADD VALUE 'both';

-- Add hide column for sold archive control
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS hide_from_sold_archive boolean DEFAULT false;
```

---

## Technical Details

### AI Task Parsing

Uses Lovable AI Gateway with `google/gemini-2.5-flash`:

**System prompt:**
```
Extract tasks from the following notes. For each task, determine:
- title: A concise task title
- description: Optional additional details
- owner: "spencer", "parker", or "both" (infer from context, default to "both")
- dueDate: YYYY-MM-DD format (infer from phrases like "by Friday", "next week")
- priority: "low", "medium", or "high" (infer from urgency words)

Return as JSON array.
```

### Hover Effect Pattern (from GrailCard)

```typescript
const [isHovered, setIsHovered] = useState(false);

<div
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
>
  {/* Base image */}
  <img className={`transition-opacity ${isHovered ? 'opacity-0' : 'opacity-100'}`} />
  
  {/* Hover overlay - clean image */}
  <img className={`absolute inset-0 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
</div>
```

---

## After Implementation

1. **Test Schedule "Both" option** - Create a task for both, verify purple dot appears
2. **Test Quick Notes parser** - Paste sample notes, verify AI creates correct tasks
3. **Test Analytics tabs in Accounting** - Go to Accounting > Analytics, verify all 3 tabs work
4. **Verify monthly goal section removed** - Check Accounting dashboard no longer shows 607%
5. **Test Sold remove button** - Enable edit mode, hide an item, verify it disappears
6. **Test Sold hover effect** - Hover over sold cards, verify image transition
7. **Test new navigation style** - Verify pill-style nav looks polished

