
# Dual Background Removal + Authentication History System

This plan implements a switchable background removal service (remove.bg vs Lovable AI) and creates an authentication history system with manual verification capability.

---

## Part 1: Switchable Background Removal

### Overview

Add a toggle switch to choose between two background removal methods:

| Method | Best For | Credits |
|--------|----------|---------|
| **remove.bg** | Complex backgrounds requiring complete removal | 50/month per key |
| **Lovable AI** | Already-removed backgrounds needing color swap | Lovable AI usage credits |

### Implementation Steps

#### 1.1 Update BackgroundSelector Component

**File**: `src/components/imagetools/BackgroundSelector.tsx`

Changes:
- Add new prop `processorType` and `onProcessorChange`
- Add a "Processor" toggle section at the top with two options:
  - "remove.bg" with helper text: "Best for complex background extraction"
  - "Lovable AI" with helper text: "Best for backdrop color swaps (faster, cheaper)"
- Export the processor type for use in parent

#### 1.2 Create New Edge Function for Lovable AI Background Processing

**New File**: `supabase/functions/ai-background-replace/index.ts`

- Uses Lovable AI (`google/gemini-2.5-flash-image`) for image generation
- Accepts same payload structure as remove-background function
- For transparent: "Remove the background completely, make it transparent, preserve only the subject"
- For solid color: "Replace the background with solid {color} color, keep the subject exactly the same"
- Processes images in batch, returns base64 processed images
- No remove.bg credit tracking needed

**Config**: `supabase/config.toml`
```toml
[functions.ai-background-replace]
verify_jwt = false
```

#### 1.3 Update ImageTools Page

**File**: `src/pages/ImageTools.tsx`

Changes:
- Add `processorType` state: `'removebg' | 'lovable-ai'`
- Pass processor type to BackgroundSelector
- Update `processImages()` to call appropriate edge function based on selection
- Hide remove.bg usage display when Lovable AI is selected
- Update button text dynamically based on processor

---

## Part 2: Multiple remove.bg API Keys Guide

Each remove.bg account gets 50 free credits per month. To stack credits:

1. **Create multiple accounts** at remove.bg with different email addresses
2. **Generate API keys** from each account's dashboard
3. **Add keys** in Image Tools page → API Key Management section
4. **Automatic rotation**: System uses keys in priority order, switching when one runs out

Tip: Use email aliases like `yourname+1@gmail.com`, `yourname+2@gmail.com`

---

## Part 3: Authentication History System

### Database Changes

**New Table**: `item_authentication_history`

```sql
CREATE TABLE public.item_authentication_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Item identification (optional link to inventory)
  inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE SET NULL,
  brand TEXT NOT NULL,
  item_name TEXT NOT NULL,
  size TEXT,
  
  -- AI analysis results
  ai_score INTEGER,
  ai_verdict TEXT, -- 'likely_authentic', 'likely_fake', 'inconclusive'
  ai_reasoning JSONB,
  ai_analyzed_details JSONB,
  references JSONB,
  
  -- Manual verification
  manual_verdict TEXT, -- 'authentic', 'fake', 'unknown'
  manual_notes TEXT,
  manually_verified_at TIMESTAMP WITH TIME ZONE,
  verified_by TEXT, -- 'parker', 'spencer', 'professional', 'other'
  verification_source TEXT, -- 'in-person', 'online-service', 'seller-confirmation'
  
  -- Images stored as URLs
  image_urls TEXT[]
);

-- RLS policies
ALTER TABLE public.item_authentication_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allowed users can read history" ON public.item_authentication_history
  FOR SELECT USING (is_allowed_user());
CREATE POLICY "Allowed users can insert history" ON public.item_authentication_history
  FOR INSERT WITH CHECK (is_allowed_user());
CREATE POLICY "Allowed users can update history" ON public.item_authentication_history
  FOR UPDATE USING (is_allowed_user());
CREATE POLICY "Allowed users can delete history" ON public.item_authentication_history
  FOR DELETE USING (is_allowed_user());
```

### Frontend Changes

#### 3.1 Create Authentication History Hook

**New File**: `src/hooks/useAuthenticationHistory.ts`

- Fetch all authentication records with React Query
- Add new record (save AI result + item details)
- Update manual verification
- Delete record
- Filter by inventory item ID

#### 3.2 Create Manual Verification Dialog

**New File**: `src/components/authenticate/ManualVerificationDialog.tsx`

Dialog contents:
- Verdict buttons: Authentic (green) / Fake (red) / Unknown (gray)
- Verified by dropdown: Parker / Spencer / Professional Authenticator / Other
- Source dropdown: In-Person Check / Online Service / Seller Confirmation / Other
- Notes textarea
- Save button

#### 3.3 Create History List Component

**New File**: `src/components/authenticate/AuthenticationHistoryList.tsx`

- Card list of past authentications
- Shows: item name, brand, AI verdict badge, manual verdict (if any), date
- Color-coded by verdict status
- Click to expand full details
- Filter by: All / Authentic / Fake / Needs Verification

#### 3.4 Update Authenticate Page

**File**: `src/pages/Authenticate.tsx`

Changes:
- Add tabs: "New Check" | "History"
- Add optional inventory item selector before analysis
- Add "Save to History" button after analysis completes
- Add "Mark as Verified" button that opens ManualVerificationDialog
- History tab shows AuthenticationHistoryList
- When linked to inventory item, auto-fills brand/name/size

---

## Files Summary

| Action | File |
|--------|------|
| Modify | `src/components/imagetools/BackgroundSelector.tsx` |
| Modify | `src/pages/ImageTools.tsx` |
| Create | `supabase/functions/ai-background-replace/index.ts` |
| Modify | `supabase/config.toml` |
| Create | `src/hooks/useAuthenticationHistory.ts` |
| Create | `src/components/authenticate/ManualVerificationDialog.tsx` |
| Create | `src/components/authenticate/AuthenticationHistoryList.tsx` |
| Modify | `src/pages/Authenticate.tsx` |
| Create | Database migration for `item_authentication_history` table |

---

## UI Wireframes

### Image Tools - Processor Toggle

```text
+----------------------------------------------------------+
|  Background                                              |
|  --------------------------------------------------------|
|  Processor:                                              |
|  +-------------------+  +-------------------+            |
|  | remove.bg        |  | Lovable AI  ✓     |            |
|  | Complex removal  |  | Color swaps       |            |
|  +-------------------+  +-------------------+            |
|                                                          |
|  Background Options:                                     |
|  [Transparent] [Solid Color]                             |
|  ...                                                     |
+----------------------------------------------------------+
```

### Authenticate Page with History

```text
+----------------------------------------------------------+
|  AUTHENTICATE                                             |
|  [New Check]  [History]                                  |
+----------------------------------------------------------+

History Tab:
+----------------------------------------------------------+
|  Filter: [All ▼]                                         |
|                                                          |
|  +------------------------+  +------------------------+  |
|  | Rick Owens Ramones     |  | Supreme Box Logo       |  |
|  | AI: 92% ✓ Authentic    |  | AI: 45% ? Inconclusive |  |
|  | ✓ Manually Verified    |  | Needs Verification     |  |
|  | Jan 15, 2026           |  | Jan 10, 2026           |  |
|  +------------------------+  +------------------------+  |
+----------------------------------------------------------+

Manual Verification Dialog:
+----------------------------------------------------------+
|  VERIFY AUTHENTICITY                          [X]        |
|                                                          |
|  Your Verdict:                                           |
|  [✓ Authentic]  [✗ Fake]  [? Unknown]                    |
|                                                          |
|  Verified By: [ Spencer ▼ ]                              |
|  Source: [ In-Person Check ▼ ]                           |
|                                                          |
|  Notes:                                                  |
|  +-----------------------------------------------------+|
|  | Checked tags in person, matches retail reference... ||
|  +-----------------------------------------------------+|
|                                                          |
|  [Cancel]                        [Save Verification]     |
+----------------------------------------------------------+
```

---

## Technical Details

### Lovable AI Background Processing

The edge function will use Gemini's image editing capability:

```typescript
const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${LOVABLE_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "google/gemini-2.5-flash-image",
    messages: [{
      role: "user",
      content: [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: imageDataUrl } }
      ]
    }],
    modalities: ["image", "text"]
  })
});

// Extract the generated image from response
const data = await response.json();
const processedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
```

Prompts:
- Transparent: "Remove the background from this product photo completely. Make the background fully transparent. Keep the product/subject exactly as-is with no modifications."
- Solid color: "Replace the background of this product photo with a solid {#HEXCODE} color. Keep the product/subject exactly as-is with no modifications."

### Authentication History Data Flow

1. User runs authentication → AI result displayed
2. User clicks "Save to History" → Record created with AI results
3. Later, user clicks "Mark as Verified" → Opens dialog
4. User selects verdict + source + notes → Updates record
5. History list shows combined AI + manual status

