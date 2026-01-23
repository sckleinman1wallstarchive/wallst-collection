const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AuthenticationRequest {
  images: string[]; // base64 data URLs
  brand: string;
  itemName: string;
  size?: string;
}

interface Reference {
  url: string;
  platform: string;
  description: string;
}

interface AuthenticationResult {
  score: number;
  verdict: 'likely_authentic' | 'likely_fake' | 'inconclusive';
  reasoning: {
    positiveIndicators: string[];
    concernIndicators: string[];
    summary: string;
  };
  references: Reference[];
  analyzedDetails: {
    stitching: string;
    labels: string;
    materials: string;
    hardware: string;
    construction: string;
  };
}

async function searchReferences(brand: string, itemName: string): Promise<Reference[]> {
  const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
  if (!apiKey) {
    console.log('Firecrawl not configured, skipping reference search');
    return [];
  }

  const references: Reference[] = [];
  const searchQueries = [
    `${brand} ${itemName} authentic legit check`,
    `${brand} ${itemName} real vs fake`,
    `site:grailed.com ${brand} ${itemName}`,
  ];

  try {
    // Just do one search to save API calls
    const query = searchQueries[0];
    console.log('Searching references:', query);
    
    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        limit: 5,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const results = data.data || [];
      
      for (const result of results) {
        let platform = 'Web';
        if (result.url?.includes('grailed.com')) platform = 'Grailed';
        else if (result.url?.includes('ebay.com')) platform = 'eBay';
        else if (result.url?.includes('stockx.com')) platform = 'StockX';
        else if (result.url?.includes('goat.com')) platform = 'GOAT';
        
        references.push({
          url: result.url || '',
          platform,
          description: result.title || result.description || 'Reference found',
        });
      }
    }
  } catch (error) {
    console.error('Reference search error:', error);
  }

  return references;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { images, brand, itemName, size }: AuthenticationRequest = await req.json();

    if (!images || images.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'At least one image is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!brand || !itemName) {
      return new Response(
        JSON.stringify({ success: false, error: 'Brand and item name are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Authenticating: ${brand} ${itemName}`);

    // Search for references in parallel with AI analysis setup
    const referencesPromise = searchReferences(brand, itemName);

    // Build the AI prompt
    const itemDescription = size ? `${brand} ${itemName} (Size: ${size})` : `${brand} ${itemName}`;
    
    const systemPrompt = `You are an expert authenticator specializing in high-end fashion, streetwear, and sneakers. You have extensive knowledge of authentic products from brands like Nike, Jordan, Adidas, Supreme, Louis Vuitton, Gucci, and many others.

Analyze the provided images and determine the authenticity of the item. Look for:
1. STITCHING: Quality, consistency, thread color, spacing
2. LABELS/TAGS: Font accuracy, placement, printing quality, wash tag details
3. MATERIALS: Quality, texture, color accuracy
4. HARDWARE: Zippers, buttons, logos, metal finishes
5. CONSTRUCTION: Shape, proportions, build quality

Known fake tells for popular items:
- Incorrect font on labels
- Poor stitching quality or wrong thread color
- Wrong material texture or feel
- Incorrect logo placement or size
- Manufacturing defects uncommon in retail

Provide your analysis in the following JSON format only, no other text:
{
  "score": <number 0-100>,
  "verdict": "<likely_authentic|likely_fake|inconclusive>",
  "reasoning": {
    "positiveIndicators": ["<list of authentic markers found>"],
    "concernIndicators": ["<list of concerns or fake markers>"],
    "summary": "<2-3 sentence overall assessment>"
  },
  "analyzedDetails": {
    "stitching": "<brief assessment>",
    "labels": "<brief assessment>",
    "materials": "<brief assessment>",
    "hardware": "<brief assessment>",
    "construction": "<brief assessment>"
  }
}`;

    const userPrompt = `Please authenticate this item: ${itemDescription}

Analyze the ${images.length} image(s) provided and give me your authenticity assessment.`;

    // Build content array with images
    const contentArray: any[] = [
      { type: 'text', text: userPrompt },
    ];

    for (const imageData of images) {
      contentArray.push({
        type: 'image_url',
        image_url: { url: imageData },
      });
    }

    // Call AI vision model
    console.log('Calling AI for authentication analysis...');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: contentArray },
        ],
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI analysis failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let responseText = aiData.choices?.[0]?.message?.content || '';
    
    // Clean up the response
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    console.log('AI response:', responseText);

    // Parse AI response
    let analysisResult: Partial<AuthenticationResult>;
    try {
      analysisResult = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Create a default response if parsing fails
      analysisResult = {
        score: 50,
        verdict: 'inconclusive',
        reasoning: {
          positiveIndicators: [],
          concernIndicators: ['Unable to fully analyze images'],
          summary: 'The AI analysis was unable to definitively determine authenticity. Please try with clearer images or consult a professional authenticator.',
        },
        analyzedDetails: {
          stitching: 'Unable to analyze',
          labels: 'Unable to analyze',
          materials: 'Unable to analyze',
          hardware: 'Unable to analyze',
          construction: 'Unable to analyze',
        },
      };
    }

    // Get references
    const references = await referencesPromise;

    // Combine results
    const result: AuthenticationResult = {
      score: analysisResult.score || 50,
      verdict: analysisResult.verdict || 'inconclusive',
      reasoning: analysisResult.reasoning || {
        positiveIndicators: [],
        concernIndicators: [],
        summary: 'Analysis complete.',
      },
      references,
      analyzedDetails: analysisResult.analyzedDetails || {
        stitching: 'Not analyzed',
        labels: 'Not analyzed',
        materials: 'Not analyzed',
        hardware: 'Not analyzed',
        construction: 'Not analyzed',
      },
    };

    console.log('Authentication complete:', result.verdict, result.score);

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Authentication error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
