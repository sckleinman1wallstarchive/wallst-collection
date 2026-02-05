

# Schedule Calendar, Analytics Tabs, Description Spacing, Status Cleanup & Navigation Updates

## Overview
This plan addresses all your requests:
1. **Add Schedule navigation with monthly calendar UI** - Wall calendar style with tasks appearing like Apple Calendar
2. **Fix Monthly Numbers in Analytics** - Make it a clear tab so it doesn't get lost
3. **Add Pop Ups tab inside Analytics** - Already exists, but making it clearer with tabs
4. **Only one space between descriptions** - Fix the double line breaks in auto-generated descriptions
5. **Remove "listed" as an inventory status** - Clean up the status options
6. **Add Personal Collection to storefront top nav** - Already exists as closet-selection, just needs to be added
7. **Center the storefront top navigation bar** - Balance the nav layout

---

## Part 1: Schedule Page with Monthly Calendar

Create a new "Schedule" navigation item with a wall calendar-style monthly view.

### UI Design (Like Apple Calendar)
```text
┌─────────────────────────────────────────────────────────────────┐
│                         FEBRUARY 2026                            │
│  ◀ Prev                                              Next ▶     │
├─────────────────────────────────────────────────────────────────┤
│  Sun    Mon    Tue    Wed    Thu    Fri    Sat                  │
├────┬────┬────┬────┬────┬────┬────┬────────────────────────────────┤
│    │  1 │  2 │  3 │  4 │  5 │  6 │                              │
│    │    │ ■S │    │    │    │    │  ← Small colored dot for task│
├────┼────┼────┼────┼────┼────┼────┤                              │
│  7 │  8 │  9 │ 10 │ 11 │ 12 │ 13 │                              │
│    │ ■P │    │ ■S │    │    │    │  ■S = Spencer, ■P = Parker   │
├────┼────┼────┼────┼────┼────┼────┤                              │
│ 14 │ 15 │ 16 │ 17 │ 18 │ 19 │ 20 │                              │
│    │    │    │    │    │    │    │                              │
└────┴────┴────┴────┴────┴────┴────┴──────────────────────────────┘

Click on a date with a task to see details in a popover/dialog
```

### Database Table
```sql
CREATE TYPE task_owner AS ENUM ('spencer', 'parker');
CREATE TYPE task_status AS ENUM ('todo', 'in-progress', 'done');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');

CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  owner task_owner NOT NULL,
  status task_status NOT NULL DEFAULT 'todo',
  due_date date NOT NULL,
  priority task_priority DEFAULT 'medium',
  category text,
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allowed users can manage tasks"
  ON tasks FOR ALL
  USING (is_allowed_user())
  WITH CHECK (is_allowed_user());
```

### New Files
| File | Purpose |
|------|---------|
| `src/pages/Schedule.tsx` | Monthly calendar view with task dots |
| `src/hooks/useTasks.ts` | CRUD operations for tasks |
| `src/components/schedule/CalendarView.tsx` | Monthly calendar grid component |
| `src/components/schedule/TaskPopover.tsx` | Popover showing task details when clicking a date |
| `src/components/schedule/AddTaskDialog.tsx` | Dialog to create/edit tasks |

### Calendar Features
- Monthly grid layout (7 columns, 5-6 rows)
- Colored dots on dates with tasks (blue for Spencer, green for Parker)
- Click on a date to see task details in a popover
- Navigate between months
- Add task button at top
- Filter by owner (Spencer/Parker/All)
- Task popover shows: title, description, priority, status, owner
- Mark done directly from popover

---

## Part 2: Analytics with Proper Tabs

Currently the Monthly Numbers and Pop Ups buttons are easy to miss. Convert to a proper tab-based navigation at the top of Analytics.

### Changes

**File: `src/pages/Analytics.tsx`**

Replace the button-based navigation with Tabs component:
```typescript
<Tabs value={currentView} onValueChange={(v) => setCurrentView(v as AnalyticsView)}>
  <TabsList>
    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
    <TabsTrigger value="monthly-numbers">Monthly Numbers</TabsTrigger>
    <TabsTrigger value="pop-ups">Pop Ups</TabsTrigger>
  </TabsList>
</Tabs>
```

This makes it immediately clear that there are 3 views available.

---

## Part 3: Pop Ups in Accounting Analytics

The Analytics view embedded in Accounting also needs the same tab structure.

**File: `src/components/accounting/AnalyticsInlineView.tsx`**

Add the same tab-based navigation:
- Dashboard (current analytics)
- Monthly Numbers
- Pop Ups

Import the MonthlyPerformanceView and PopUpsInlineView components.

---

## Part 4: Fix Description Spacing (Single Space)

The auto-generated descriptions have double line breaks (`\n\n`). Change to single line breaks.

### Files to Update

**File: `src/components/storefront/StorefrontProductDetail.tsx`**

Current:
```typescript
return [
  item.name,
  '',  // empty line
  item.size ? `Size: ${item.size}` : 'Size: One Size',
  '',  // empty line
  'Send Offers/Trades',
  '',  // empty line
  'Hit Me Up For A Better Price On IG At Wall Street Archive'
].join('\n');
```

Change to:
```typescript
return [
  item.name,
  item.size ? `Size: ${item.size}` : 'Size: One Size',
  'Send Offers/Trades',
  'Hit Me Up For A Better Price On IG At Wall Street Archive'
].join('\n');
```

**File: `src/components/storefront/SoldProductCard.tsx`**

Current:
```typescript
const parts: string[] = [];
parts.push(item.name);
if (item.size) parts.push(`Size: ${item.size}`);
parts.push('Send Offers/Trades');
parts.push('IG: Wall Street Archive');
return parts.join(' • ');
```

This one uses ` • ` which is fine - leave it as is.

**File: `src/components/storefront/SoldProductDetail.tsx`**

Same fix as StorefrontProductDetail - remove extra empty strings.

---

## Part 5: Remove "listed" as Inventory Status

The "listed" status is redundant with "for-sale". Remove it from the UI options.

### Files to Update

**File: `src/components/inventory/InventoryTable.tsx`**
- Remove `'listed'` from STATUS_COLORS
- Remove `'listed'` from STATUS_LABELS
- Remove `<SelectItem value="listed">` from status filter

**File: `src/pages/Inventory.tsx`**
- Remove `'listed'` from STATUS_LABELS
- Remove from the status order array

**File: `src/components/inventory/ItemDetailSheet.tsx`**
- Remove `{ value: 'listed', label: 'Listed' }` from STATUS_OPTIONS
- Change the "Mark as Unsold" button to set status to `'for-sale'` instead of `'listed'`

**File: `src/components/inventory/AddItemDialog.tsx`**
- Remove `{ value: 'listed', label: 'For Sale' }` - use `for-sale` instead

**File: `src/pages/Analytics.tsx`**
- Change `i.status === 'listed'` to `i.status === 'for-sale'` in the status distribution

**Note:** The database enum still contains 'listed' for backwards compatibility with existing data. We just won't show it in the UI going forward.

---

## Part 6: Add Personal Collection to Storefront Top Nav

**File: `src/components/storefront/StorefrontTopNav.tsx`**

Add to NAV_ITEMS array:
```typescript
const NAV_ITEMS: { view: LandingNavView; label: string }[] = [
  { view: 'home', label: 'Home' },
  { view: 'shop-all', label: 'Shop All' },
  { view: 'sold', label: 'Sold' },
  { view: 'shop-by-brand', label: 'Shop By Brand' },
  { view: 'collection-grails', label: 'Grails' },
  { view: 'closet-selection', label: 'Personal Collection' },  // NEW
];
```

Update type:
```typescript
export type LandingNavView = 'home' | 'shop-all' | 'sold' | 'shop-by-brand' | 'collection-grails' | 'closet-selection';
```

---

## Part 7: Center Top Navigation Bar

**File: `src/components/storefront/StorefrontTopNav.tsx`**

Change the flex layout to center the nav:
```typescript
<div className="flex items-center h-14">
  {/* Left spacer */}
  <div className="flex-1" />
  
  {/* Centered navigation */}
  <nav className="flex items-center gap-0">
    {NAV_ITEMS.map(...)}
  </nav>
  
  {/* Right side: Dashboard + Edit + Cart */}
  <div className="flex-1 flex items-center justify-end gap-3">
    {/* buttons */}
  </div>
</div>
```

---

## File Changes Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/pages/Schedule.tsx` | Create | Monthly calendar page |
| `src/hooks/useTasks.ts` | Create | Task CRUD operations |
| `src/components/schedule/CalendarView.tsx` | Create | Calendar grid UI |
| `src/components/schedule/TaskPopover.tsx` | Create | Task detail popover |
| `src/components/schedule/AddTaskDialog.tsx` | Create | Add/edit task dialog |
| `src/components/layout/AppSidebar.tsx` | Modify | Add Schedule nav item |
| `src/App.tsx` | Modify | Add /schedule route |
| `src/pages/Analytics.tsx` | Modify | Tab-based navigation, remove 'listed' |
| `src/components/accounting/AnalyticsInlineView.tsx` | Modify | Add tabs for sub-views |
| `src/components/storefront/StorefrontProductDetail.tsx` | Modify | Single space in description |
| `src/components/storefront/SoldProductDetail.tsx` | Modify | Single space in description |
| `src/components/inventory/InventoryTable.tsx` | Modify | Remove 'listed' status |
| `src/components/inventory/ItemDetailSheet.tsx` | Modify | Remove 'listed', use 'for-sale' |
| `src/components/inventory/AddItemDialog.tsx` | Modify | Remove 'listed' status option |
| `src/pages/Inventory.tsx` | Modify | Remove 'listed' from labels |
| `src/components/storefront/StorefrontTopNav.tsx` | Modify | Add Personal Collection, center nav |

---

## Database Migration

```sql
-- Create task management tables
CREATE TYPE task_owner AS ENUM ('spencer', 'parker');
CREATE TYPE task_status AS ENUM ('todo', 'in-progress', 'done');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');

CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  owner task_owner NOT NULL,
  status task_status NOT NULL DEFAULT 'todo',
  due_date date NOT NULL,
  priority task_priority DEFAULT 'medium',
  category text,
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS policies for allowed users
CREATE POLICY "Allowed users can read tasks"
  ON tasks FOR SELECT
  USING (is_allowed_user());

CREATE POLICY "Allowed users can insert tasks"
  ON tasks FOR INSERT
  WITH CHECK (is_allowed_user());

CREATE POLICY "Allowed users can update tasks"
  ON tasks FOR UPDATE
  USING (is_allowed_user());

CREATE POLICY "Allowed users can delete tasks"
  ON tasks FOR DELETE
  USING (is_allowed_user());

-- Trigger for updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## Calendar UI Technical Details

### Calendar Grid Component
```typescript
// Generate days for a month
const getDaysInMonth = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay(); // 0 = Sunday
  
  // Create array with padding for days before month starts
  const days = [];
  for (let i = 0; i < startingDay; i++) {
    days.push(null); // Empty cells
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  return days;
};
```

### Task Colors
- Spencer: `bg-blue-500` (blue dot)
- Parker: `bg-green-500` (green dot)
- High priority: Add ring/border
- Overdue: Red dot

### Popover Content
When clicking a date with tasks:
- List all tasks for that date
- Show: Title, Owner badge, Priority badge, Status checkbox
- Click task to expand details
- Quick actions: Mark done, Edit, Delete

---

## After Implementation

1. **Test Schedule page** - Navigate to /schedule, add tasks, verify calendar displays correctly
2. **Test task creation** - Add tasks for Spencer and Parker with different due dates
3. **Test Analytics tabs** - Verify Dashboard, Monthly Numbers, and Pop Ups tabs work
4. **Verify description spacing** - Check product detail pages have single-line descriptions
5. **Verify "listed" status removed** - Check inventory forms and filters
6. **Test Personal Collection nav** - Click it in storefront top nav
7. **Verify centered navigation** - Check storefront nav is properly centered

