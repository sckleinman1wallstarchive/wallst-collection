import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SHOPIFY_STORE_DOMAIN = "wallst-collection-ux2t9.myshopify.com";
const SHOPIFY_API_VERSION = "2025-01";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SHOPIFY_ACCESS_TOKEN = Deno.env.get("SHOPIFY_ACCESS_TOKEN");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SHOPIFY_ACCESS_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { action, itemId, itemIds } = await req.json();

    if (action === "sync") {
      // Sync a single item to Shopify
      const { data: item, error } = await supabase
        .from("inventory_items")
        .select("*")
        .eq("id", itemId)
        .single();

      if (error || !item) {
        throw new Error(`Item not found: ${itemId}`);
      }

      // Build product data
      const productData = {
        product: {
          title: item.name,
          body_html: item.notes || "",
          vendor: item.brand || "Unknown",
          product_type: item.category || "other",
          variants: [
            {
              price: item.asking_price?.toString() || "0",
              sku: item.id,
              inventory_quantity: item.status === "listed" ? 1 : 0,
              option1: item.size || "One Size",
            },
          ],
          options: [
            {
              name: "Size",
              values: [item.size || "One Size"],
            },
          ],
          images: item.image_urls?.length
            ? item.image_urls.map((url: string) => ({ src: url }))
            : item.image_url
            ? [{ src: item.image_url }]
            : [],
        },
      };

      let shopifyProductId = item.shopify_product_id;

      if (shopifyProductId) {
        // Update existing product
        const updateResponse = await fetch(
          `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/products/${shopifyProductId}.json`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
            },
            body: JSON.stringify(productData),
          }
        );

        if (!updateResponse.ok) {
          const errorText = await updateResponse.text();
          throw new Error(`Shopify update failed: ${errorText}`);
        }
      } else {
        // Create new product
        const createResponse = await fetch(
          `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/products.json`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
            },
            body: JSON.stringify(productData),
          }
        );

        if (!createResponse.ok) {
          const errorText = await createResponse.text();
          throw new Error(`Shopify create failed: ${errorText}`);
        }

        const result = await createResponse.json();
        shopifyProductId = result.product.id.toString();

        // Save Shopify product ID back to Supabase
        await supabase
          .from("inventory_items")
          .update({ shopify_product_id: shopifyProductId })
          .eq("id", itemId);
      }

      return new Response(
        JSON.stringify({ success: true, shopifyProductId }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "bulk-sync") {
      // Sync multiple items
      const ids = itemIds || [];
      const results: { itemId: string; success: boolean; error?: string }[] = [];

      for (const id of ids) {
        try {
          const { data: item, error } = await supabase
            .from("inventory_items")
            .select("*")
            .eq("id", id)
            .single();

          if (error || !item) {
            results.push({ itemId: id, success: false, error: "Item not found" });
            continue;
          }

          const productData = {
            product: {
              title: item.name,
              body_html: item.notes || "",
              vendor: item.brand || "Unknown",
              product_type: item.category || "other",
              variants: [
                {
                  price: item.asking_price?.toString() || "0",
                  sku: item.id,
                  inventory_quantity: item.status === "listed" ? 1 : 0,
                  option1: item.size || "One Size",
                },
              ],
              options: [
                {
                  name: "Size",
                  values: [item.size || "One Size"],
                },
              ],
              images: item.image_urls?.length
                ? item.image_urls.map((url: string) => ({ src: url }))
                : item.image_url
                ? [{ src: item.image_url }]
                : [],
            },
          };

          let shopifyProductId = item.shopify_product_id;

          if (shopifyProductId) {
            const updateResponse = await fetch(
              `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/products/${shopifyProductId}.json`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
                },
                body: JSON.stringify(productData),
              }
            );

            if (!updateResponse.ok) {
              results.push({ itemId: id, success: false, error: "Update failed" });
              continue;
            }
          } else {
            const createResponse = await fetch(
              `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/products.json`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
                },
                body: JSON.stringify(productData),
              }
            );

            if (!createResponse.ok) {
              results.push({ itemId: id, success: false, error: "Create failed" });
              continue;
            }

            const result = await createResponse.json();
            shopifyProductId = result.product.id.toString();

            await supabase
              .from("inventory_items")
              .update({ shopify_product_id: shopifyProductId })
              .eq("id", id);
          }

          results.push({ itemId: id, success: true });
        } catch (err) {
          results.push({ itemId: id, success: false, error: String(err) });
        }
      }

      return new Response(
        JSON.stringify({ success: true, results }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "delete") {
      // Delete product from Shopify
      const { data: item, error } = await supabase
        .from("inventory_items")
        .select("shopify_product_id")
        .eq("id", itemId)
        .single();

      if (error || !item?.shopify_product_id) {
        return new Response(
          JSON.stringify({ success: true, message: "No Shopify product to delete" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const deleteResponse = await fetch(
        `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/products/${item.shopify_product_id}.json`,
        {
          method: "DELETE",
          headers: {
            "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
          },
        }
      );

      if (!deleteResponse.ok && deleteResponse.status !== 404) {
        throw new Error("Failed to delete Shopify product");
      }

      // Clear Shopify ID from database
      await supabase
        .from("inventory_items")
        .update({ shopify_product_id: null })
        .eq("id", itemId);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
