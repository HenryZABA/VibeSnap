
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const AI_API_TOKEN = Deno.env.get("AI_API_TOKEN_d2810d84bb25");
    if (!AI_API_TOKEN) {
      throw new Error("AI_API_TOKEN is not configured");
    }

    const { image_base64 } = await req.json();

    if (!image_base64) {
      return new Response(
        JSON.stringify({ error: "image_base64 is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are a professional UI/UX design analyst. Analyze the provided webpage screenshot and extract its design DNA.

CRITICAL REBRANDING RULE for site_theme:
- You MUST completely rebrand the website theme. Do NOT use any brand names, product names, company names, domain names, or any identifiable terms from the original screenshot.
- Replace all specific references with generic, category-level descriptions. For example: instead of "Spotify" say "a music streaming platform", instead of "Airbnb" say "a short-term rental marketplace", instead of "Nike" say "a sportswear brand".
- The site_theme should read as if describing a brand-new, unnamed product in the same category.
- This rebranding rule also applies to the prompt.text field - never mention the original brand/product name anywhere.

Return strict JSON format (no markdown code blocks, output raw JSON), with the following fields:

{
  "title": "A short creative name for this design (2-6 words, reflecting the core style, e.g. 'Minimal Forest', 'Neon Cityscape', 'Warm Bakery')",
  "summary": {
    "style_text": "A 200-300 word design style summary covering overall visual style, color scheme, layout characteristics, and design philosophy",
    "tags": ["tag1", "tag2", "tag3", "tag4"]
  },
  "palette": [
    {
      "name": "Color name (e.g. Primary Blue)",
      "hex": "#hex_value",
      "usage": ["usage1", "usage2"],
      "description": "Brief description of the color's role"
    }
  ],
  "typography": {
    "fonts": [
      {
        "name": "Font English name",
        "display_name": "Font display name",
        "css": "CSS font-family value"
      }
    ],
    "scale_hint": "Font scale hierarchy description"
  },
  "tokens": {
    "radius": {
      "base": "Base border-radius value",
      "pill": "Pill-shaped border-radius value"
    },
    "shadow": {
      "base": "Base shadow CSS value",
      "hover": "Hover shadow CSS value"
    },
    "border": {
      "style": "Border style description"
    },
    "spacing": {
      "grid": "Grid gap value",
      "layout": "Layout spacing description"
    }
  },
  "prompt": {
    "site_theme": "A 100-200 word REBRANDED description of the website's theme and purpose. Describe WHAT TYPE of website this is, WHO the target users are, and WHAT core features it offers - but NEVER mention the original brand name, product name, or any identifying terms. Write as if briefing a designer to build a new product in the same category from scratch.",
    "text": "A complete design prompt (800-1500 words) that can be directly used by AI to generate a page with the same style. The prompt must contain these parts: [Part 1: Site Theme & Purpose] Describe the type of website, industry/scenario, target user group, and core feature modules - all in REBRANDED generic terms, never referencing the original brand. [Part 2: UI Design Style] Page type, overall visual style, color scheme (with specific HEX values), font suggestions, visual tokens like radius/shadow/spacing (with specific CSS values), layout structure, component styles, and animation suggestions. [Part 3: Image & Visual Asset Requirements] Carefully examine the screenshot for any background images, hero banners, decorative illustrations, product photos, icons, or other visual assets used in the design. For each image area identified, describe: its position and dimensions, the content/subject of the image, the visual style (photographic, illustrative, abstract, gradient, etc.), mood and color tone, and provide a detailed AI image generation prompt that can be used to recreate a similar image. If the page uses full-bleed background images, gradient overlays on photos, or decorative elements, specify those clearly so AI can generate appropriate replacement assets. [Part 4: No Empty Spaces - Mandatory Asset Generation] The generated page must NOT have any blank white backgrounds, empty image placeholders, or missing visual elements. For every area where the original design uses an image, photo, illustration, logo, icon, or decorative graphic, you MUST provide a specific AI image generation prompt. This includes: a site logo/brand mark (describe the style, shape, colors, and mood - e.g. 'A minimal geometric logo mark using two overlapping circles in deep blue and coral, conveying connection and creativity'), hero/banner images, background textures or patterns, product/content thumbnails, decorative illustrations or icons, avatar placeholders, and any other visual asset. If the original uses a gradient or colored background instead of an image, specify the exact CSS gradient. The goal is that an AI building this page can generate ALL visual assets from these prompts, resulting in a fully polished page with zero empty spaces. Combine all parts so AI can not only replicate the visual style but also understand the business positioning, content direction, and generate all necessary visual assets. Use backticks to mark key CSS values and technical parameters.",
    "version": "v2"
  }
}

Notes:
1. Title should be short and creative, reflecting the core style
2. Palette array should contain 6-8 main colors identified from the screenshot
3. Each color must have an accurate HEX value
4. Tags should be 4-6 short design style tags
5. prompt.text should be detailed enough for AI to generate a page with the same style
6. CRITICAL: The output prompt MUST include image generation prompts for EVERY visual element - logos, backgrounds, hero images, thumbnails, decorative graphics. The resulting page should have ZERO empty/blank spaces.
7. CRITICAL: Never use the original brand name, company name, or product name anywhere in the output. Always use generic category descriptions instead.
8. Return JSON directly, do not wrap in markdown code blocks
9. All output must be in English`;

    const response = await fetch("https://api.enter.pro/code/api/v1/ai/messages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: systemPrompt
              },
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/jpeg",
                  data: image_base64
                }
              }
            ]
          }
        ],
        max_tokens: 4096,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: `AI service error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    console.log("AI response received:", JSON.stringify(aiResponse).substring(0, 200));

    let textContent = "";
    if (aiResponse.content && Array.isArray(aiResponse.content)) {
      for (const block of aiResponse.content) {
        if (block.type === "text") {
          textContent += block.text;
        }
      }
    }

    let result;
    try {
      result = JSON.parse(textContent);
    } catch {
      const jsonMatch = textContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[1].trim());
      } else {
        const objectMatch = textContent.match(/\{[\s\S]*\}/);
        if (objectMatch) {
          result = JSON.parse(objectMatch[0]);
        } else {
          throw new Error("Could not parse AI response as JSON");
        }
      }
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
