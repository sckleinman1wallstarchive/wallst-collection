
# Add "Back to Dashboard" Button for Admin Users

## Overview
Add a button visible only to authenticated admin users (those in the `allowed_emails` table) that appears after the welcome screen, allowing quick navigation back to the internal dashboard.

---

## Implementation Approach

### Location
The button will be added to **StorefrontTopNav** component since:
- It's displayed on all views after the welcome screen
- It already receives the `showEditButton` prop which indicates admin access
- Consistent placement in the header for easy access

### Design
- Positioned to the left of the Edit button
- Subtle styling that matches the storefront aesthetic
- Uses an icon (LayoutDashboard or ArrowLeft) with optional text

---

## Changes

### File: `src/components/storefront/StorefrontTopNav.tsx`

**Add:**
1. Import `useNavigate` from `react-router-dom`
2. Import `LayoutDashboard` icon from `lucide-react`
3. Add a new button before the Edit button that:
   - Only renders when `showEditButton` is true (same admin check)
   - Navigates to `/` (dashboard)
   - Styled as a ghost button with white text

```text
Header Layout (Admin View):
+----------------------------------------------------------+
| Home | Shop All | Shop By Brand | Grails    [Dashboard] [Edit] [Cart] |
+----------------------------------------------------------+
```

---

## Technical Details

The button leverages the existing `showEditButton` prop which is already controlled by the `isAllowedUser` query in `Storefront.tsx`. This query checks if the authenticated user's email exists in the `allowed_emails` table.

**Security Note:** The visibility is purely client-side (the button simply won't render for non-admins), but the dashboard routes are already protected by the `AccessGate` component, so even if someone manually navigates to `/`, they would need to authenticate.

---

## Files Modified

| File | Change |
|------|--------|
| `src/components/storefront/StorefrontTopNav.tsx` | Add "Back to Dashboard" button visible only when `showEditButton` is true |
