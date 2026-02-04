
# Budget System + UI Improvements for Accounting & Analytics

## Overview
This plan addresses five requests:
1. **Budget system** with a big UI button in Accounting
2. **Bigger buttons** for all action cards in Accounting
3. **De-emphasize Recent Expenses** (make it less prominent)
4. **Monthly History button** in Analytics
5. **Analytics button in Accounting** that opens the same Analytics UI inline

Additionally, I noticed you uploaded a "High Velocity Dealer Operating System" PDF - this appears to be a capital management framework. I can integrate these principles into the budget system if you'd like.

---

## Part 1: Budget System

Create a new Budget management feature accessible via a prominent button in Accounting.

### What the Budget System Will Track
Based on the Dealer Operating System document you uploaded:
- **Liquid Cash** - available capital for immediate deployment
- **In Transit Inventory** - cost basis of items on the way (capped at 45%)
- **Deployed Capital** - items purchased awaiting arrival
- **Weekly Deployment Governor** - cap spending at 45-55% of operating capital

### New Files
| File | Purpose |
|------|---------|
| `src/components/accounting/BudgetDialog.tsx` | Main budget management interface |
| `src/hooks/useBudgetMetrics.ts` | Calculate capital buckets from inventory data |

### Budget UI Features
- Capital bucket visualization (Engine/Buffer/Long Holds)
- Weekly deployment tracker with governor limit
- In-transit inventory percentage gauge
- Red flag alerts when limits exceeded

---

## Part 2: Bigger Action Buttons

Transform the current small action cards into larger, more prominent buttons.

### Current State
```text
Small cards (p-4) with compact layout
```

### New State
```text
Larger cards (p-6) with bigger icons, larger text
Grid: 5 columns on desktop (adding Budget + Analytics)
```

### Visual Changes
- Icon size: `h-6 w-6` → `h-8 w-8`
- Icon container: `p-3` → `p-4`
- Text size: base → `text-lg` for titles
- Card padding: `p-4` → `p-6`
- Add visual emphasis with subtle gradients

---

## Part 3: De-emphasize Recent Expenses

Move the ExpenseList component lower in the page hierarchy and make it collapsible.

### Changes
- Wrap ExpenseList in a Collapsible (default closed)
- Move it below the Sales Ledger
- Smaller header text

---

## Part 4: Analytics Button in Accounting

Add an "Analytics" action card that opens the Analytics view inline (same as the Analytics page but embedded in Accounting).

### Implementation Approach
- Add a new view type: `'analytics'` to the existing `View` type
- When clicked, render the Analytics page content inline (similar to how Cash Flow Statement works)
- Add a "Back" button to return to the dashboard

---

## Part 5: Monthly History Button in Analytics

Add a button in Analytics that shows month-by-month historical breakdown.

### Features
- Monthly totals table (Revenue, COGS, Profit per month)
- Month-over-month comparison
- Expandable to show individual sales per month

---

## File Changes Summary

| File | Changes |
|------|---------|
| `src/pages/Accounting.tsx` | Bigger buttons, add Budget + Analytics views, de-emphasize expenses |
| `src/pages/Analytics.tsx` | Add Monthly History section/button |
| `src/components/accounting/BudgetDialog.tsx` | **NEW** - Budget management UI |
| `src/hooks/useBudgetMetrics.ts` | **NEW** - Capital calculations |
| `src/components/accounting/MonthlyHistoryView.tsx` | **NEW** - Month-by-month breakdown |

---

## Technical Details

### New View States (Accounting.tsx)
```typescript
type View = 'dashboard' | 'cash-flow' | 'analytics' | 'budget';
```

### Button Grid Layout
```typescript
// 5 columns on desktop, 2 on mobile
<div className="grid grid-cols-2 md:grid-cols-5 gap-4">
  <BigActionCard icon={Wallet} title="Budget" subtitle="Capital governance" />
  <BigActionCard icon={PlusCircle} title="Contribution" subtitle="Add partner capital" />
  <BigActionCard icon={FileText} title="Cash Flow" subtitle="Statement" />
  <BigActionCard icon={Receipt} title="Expenses" subtitle="Track costs" />
  <BigActionCard icon={BarChart3} title="Analytics" subtitle="View insights" />
</div>
```

### Budget Metrics Hook
```typescript
interface BudgetMetrics {
  liquidCash: number;           // From capital_accounts
  inTransitCost: number;        // Sum of OTW items
  deployedThisWeek: number;     // Purchases in last 7 days
  inTransitPercent: number;     // inTransitCost / totalOperatingCapital * 100
  deploymentGovernor: number;   // Weekly cap (45-55%)
  isOverDeployed: boolean;      // Red flag
  isInTransitHigh: boolean;     // Over 45%
}
```

### Expense Section (Collapsible)
```typescript
<Collapsible>
  <CollapsibleTrigger asChild>
    <Button variant="ghost" size="sm">
      View Recent Expenses
    </Button>
  </CollapsibleTrigger>
  <CollapsibleContent>
    <ExpenseList />
  </CollapsibleContent>
</Collapsible>
```

---

## UI Mockup - Big Action Buttons

```text
┌─────────────────────────────────────────────────────────────────┐
│                         ACCOUNTING                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐│
│  │    💰   │  │    📄   │  │    🧾   │  │    📊   │  │    👥   ││
│  │ BUDGET  │  │  CASH   │  │ EXPENSE │  │ANALYTICS│  │ ASSIGN  ││
│  │ Capital │  │  FLOW   │  │  Track  │  │ Insights│  │PURCHASES││
│  │Governance│  │Statement│  │  costs  │  │         │  │         ││
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘│
│                                                                  │
│  [Monthly Goal Progress Bar]                                     │
│                                                                  │
│  [Key Financial Metrics - 4 cards]                              │
│                                                                  │
│  [Sales Ledger Table]                                           │
│                                                                  │
│  ▸ View Recent Expenses (collapsed)                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## After Implementation

1. **Test the Budget button** - verify the capital metrics calculate correctly
2. **Test Analytics in Accounting** - ensure it shows the same data as the Analytics page
3. **Verify Monthly History** - check month-by-month breakdown is accurate
