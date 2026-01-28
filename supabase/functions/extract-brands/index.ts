import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Brand category mappings - AI will use these as guidance
const BRAND_CATEGORIES = {
  jewelry: ["Chrome Hearts", "David Yurman", "Tiffany", "Cartier"],
  "japanese-designers": ["Comme des Garcons", "CDG", "Junya Watanabe", "Kapital", "Undercover", "Issey Miyake", "Yohji Yamamoto", "Visvim", "Neighborhood", "WTAPS", "Sacai", "Takahiro Miyashita", "Number Nine", "Julius"],
  "european-luxury": ["Maison Margiela", "Prada", "Saint Laurent", "Gucci", "Balenciaga", "Bottega Veneta", "Burberry", "Givenchy", "Valentino", "Versace", "Dior", "Louis Vuitton", "Celine"],
  "avant-garde": ["Rick Owens", "RAF Simons", "Helmut Lang", "Ann Demeulemeester", "Dries Van Noten", "Haider Ackermann", "Boris Bidjan Saberi", "Carol Christian Poell"],
  streetwear: ["Enfants Riches Deprimes", "ERD", "Supreme", "Stussy", "Palace", "BAPE", "Off-White", "Fear of God", "Essentials"],
  contemporary: ["Stone Island", "Acne Studios", "Our Legacy", "AMI", "APC", "Kenzo", "CP Company"],
  footwear: ["Nike", "Jordan", "Air Jordan", "Adidas", "New Balance", "Asics", "Salomon", "Converse", "Vans"],
  vintage: ["Vintage", "Deadstock"],
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const { mode = "backfill", itemId, itemName } = await req.json();
    
    console.log(`Extract brands called with mode: ${mode}, itemId: ${itemId}`);

    let itemsToProcess: { id: string; name: string }[] = [];

    if (mode === "single" && itemName) {
      // For new items, just extract brand from the name without DB query
      itemsToProcess = [{ id: itemId || "new", name: itemName }];
    } else if (mode === "backfill") {
      // Fetch items missing brand or brand_category
      const { data: items, error } = await supabase
        .from("inventory_items")
        .select("id, name")
        .or("brand.is.null,brand_category.is.null");

      if (error) throw error;
      itemsToProcess = items || [];
      console.log(`Found ${itemsToProcess.length} items to process`);
    }

    if (itemsToProcess.length === 0) {
      return new Response(
        JSON.stringify({ message: "No items to process", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Batch items for AI processing (process up to 20 at a time)
    const batchSize = 20;
    const results: { id: string; brand: string; brandCategory: string }[] = [];

    for (let i = 0; i < itemsToProcess.length; i += batchSize) {
      const batch = itemsToProcess.slice(i, i + batchSize);
      
      const prompt = `You are an expert in fashion brands and streetwear. For each item name below, extract:
1. The BRAND NAME (properly formatted, e.g., "Chrome Hearts", "Comme des Garcons", "Rick Owens")
2. The BRAND CATEGORY from these options: jewelry, japanese-designers, european-luxury, avant-garde, streetwear, contemporary, footwear, vintage, other

Examples:
- "Chrome Hearts Large Filligree Pendant" → Brand: "Chrome Hearts", Category: "jewelry"
- "Maison Margiela Black Laceless Gats" → Brand: "Maison Margiela", Category: "european-luxury"  
- "Rick Owens Geothrasher Dirt" → Brand: "Rick Owens", Category: "avant-garde"
- "CDG Homme Patchwork Sweater" → Brand: "Comme des Garcons Homme", Category: "japanese-designers"
- "Jordan 4 Retro Black Cat" → Brand: "Jordan", Category: "footwear"
- "ERD Logo Tee" → Brand: "Enfants Riches Deprimes", Category: "streetwear"

Items to process:
${batch.map((item, idx) => `${idx + 1}. [ID: ${item.id}] "${item.name}"`).join("\n")}

Respond with a JSON array of objects with id, brand, and brandCategory fields. Only return the JSON array, no other text.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: "You are a fashion brand extraction expert. Return only valid JSON arrays." },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI API error:", response.status, errorText);
        
        if (response.status === 429) {
          console.error("Rate limited, waiting before retry...");
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        
        // For payment/credit issues (402) or other errors, return gracefully
        if (response.status === 402) {
          console.log("Insufficient credits - skipping brand extraction");
          return new Response(
            JSON.stringify({
              message: "Brand extraction skipped - insufficient credits",
              processed: 0,
              results: [],
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // For other errors, continue with next batch
        continue;
      }

      const aiData = await response.json();
      const content = aiData.choices?.[0]?.message?.content || "";
      
      console.log(`AI response for batch ${i / batchSize + 1}:`, content.substring(0, 200));

      try {
        // Parse JSON from response (handle markdown code blocks)
        let jsonStr = content;
        if (content.includes("```")) {
          jsonStr = content.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
        }
        
        const parsed = JSON.parse(jsonStr);
        results.push(...parsed);
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError, content);
        // Continue with next batch
      }
    }

    console.log(`Extracted brands for ${results.length} items`);

    // Update database (skip if mode is "single" for new items)
    if (mode === "backfill" && results.length > 0) {
      for (const result of results) {
        const { error: updateError } = await supabase
          .from("inventory_items")
          .update({
            brand: result.brand,
            brand_category: result.brandCategory,
          })
          .eq("id", result.id);

        if (updateError) {
          console.error(`Failed to update item ${result.id}:`, updateError);
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${results.length} items`,
        processed: results.length,
        results: mode === "single" ? results : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Extract brands error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
