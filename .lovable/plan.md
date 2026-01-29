

# Fix: Automatic API Key Rotation + Manual Priority Control

## The Problem

Your backend currently:
1. Picks the first key based on priority
2. If remove.bg returns `402 Insufficient credits`, it records an error but **doesn't try the next key**
3. Usage tracking is local (hardcoded 50/key), not real remove.bg balances

## Solution

### Part 1: Automatic Key Rotation on 402/403 Errors

**File: `supabase/functions/remove-background/index.ts`**

Update the image processing loop to retry with the next available key when the current key fails:

```text
Current behavior:
  Try key 1 → 402 Error → Record failure → Move to next image

New behavior:
  Try key 1 → 402 Error → Mark key as exhausted → Try key 2 → Success!
```

Changes:
- Add a `failedKeyIds` set to track keys that returned 402/403 during this request
- When a key fails with 402 (insufficient credits) or 403 (invalid key):
  - Add key to `failedKeyIds`
  - Retry the same image with the next available key
  - Only record failure if ALL keys are exhausted
- Continue using keys in priority order, skipping failed ones

### Part 2: Manual Priority Control (Already Exists!)

You can already manually control which key is used first via **priority order**:

**How to manually switch keys:**
1. Go to Image Tools page
2. In the API Keys section, you'll see keys numbered 1, 2, 3, etc.
3. The drag handles (`⋮⋮`) let you reorder them
4. The **top key (priority 0)** is tried first

But the reorder functionality needs to actually work - let me check if it's connected...

### Part 3: Add "Set as Primary" Quick Action

Add a button on each key card to quickly move it to the top (priority 0) without dragging:
- Shows on non-primary keys only
- One click to make that key the first one tried

### Part 4: Fetch Real Balances from remove.bg (Optional but Recommended)

Update `check-removebg-usage` to call remove.bg's `/account` endpoint for each key to get real balances instead of the hardcoded 50/key estimate.

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/remove-background/index.ts` | Add retry logic for 402/403 errors |
| `src/components/imagetools/ApiKeyManager.tsx` | Add "Set as Primary" button, verify drag-to-reorder works |
| `src/hooks/useRemoveBgKeys.ts` | Add `setPrimaryKey` mutation |
| `supabase/functions/check-removebg-usage/index.ts` | Fetch real balances from remove.bg API |
| `src/hooks/useRemoveBgUsage.ts` | Update types to handle real balance data |
| `src/components/imagetools/UsageDisplay.tsx` | Show real remaining credits |

---

## Implementation Details

### Backend Retry Logic

```typescript
// For each image
let imageProcessed = false;
const failedKeysForThisImage: Set<string> = new Set();

while (!imageProcessed) {
  // Find next available key (not failed, not exhausted)
  const selectedKey = keysWithUsage.find(k => 
    !failedKeysForThisImage.has(k.id) && 
    k.currentUsage < LIMIT_PER_KEY
  );
  
  if (!selectedKey) {
    // All keys exhausted for this image
    results.push({ error: 'All API keys exhausted' });
    break;
  }
  
  const response = await fetch(...);
  
  if (response.status === 402 || response.status === 403) {
    // Mark this key as failed and retry with next key
    failedKeysForThisImage.add(selectedKey.id);
    continue; // <-- This is the key change!
  }
  
  // Success or other error - stop retrying
  imageProcessed = true;
}
```

### Manual "Set as Primary" Button

Each key card will have a star/arrow button that:
1. Calls `reorderKeys` with that key moved to position 0
2. Shifts all other keys down by 1

---

## Summary

After this fix:
- **Automatic**: If key 1 is out of credits, the system automatically tries key 2, then key 3, etc.
- **Manual**: Click "Set as Primary" on any key to make it the first one tried
- **Visibility**: Real credit balances from remove.bg instead of estimated counts

