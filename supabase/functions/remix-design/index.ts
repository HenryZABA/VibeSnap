
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

    const { source_base64, reference_base64 } = await req.json();

    if (!source_base64 || !reference_base64) {
      return new Response(
        JSON.stringify({ error: "source_base64 and reference_base64 are both required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are a professional UI/UX design transformation expert. The user will provide two images:

**Image 1 (Source Website)**: The user's current website screenshot - this is the project whose functionality must be FULLY PRESERVED
**Image 2 (Reference Style)**: The style/design screenshot the user wants to reference - ONLY the visual style from this image should be applied

CRITICAL RULES:
1. FUNCTIONALITY PRESERVATION: The modification prompt MUST preserve ALL features, functionality, content sections, navigation structure, interactive elements, and business logic visible in the source website (Image 1). List every feature module you can identify and explicitly state they must remain unchanged.
2. STYLE-ONLY TRANSFER: Only the visual appearance (colors, fonts, spacing, shadows, borders, component styling, etc.) from the reference (Image 2) should be applied. Never suggest adding, removing, or changing any functional element from the source.
3. FEATURE INVENTORY: In source_theme, provide a detailed inventory of every feature/section visible in the source website so nothing gets lost during the transformation.

Please complete the following analysis tasks:
1. From Image 1 (Source Website): Extract a comprehensive feature inventory - every page section, navigation item, interactive element, form, button, content area, and functional module visible. Also identify the website theme, business positioning, and target users.
2. From Image 2 (Reference Style): Extract ONLY the visual style - color scheme, font style, design tokens like radius/shadow/spacing, layout patterns, component styling, and any background images or decorative visual assets used.
3. Generate a complete "UI Modification Prompt" that applies the reference visual style to the source website while preserving 100% of its functionality.

Return strict JSON format (no markdown code blocks, output raw JSON), with the following fields:

{
  "source_theme": "200-300 words. Start with a brief description of what the source website does and who it serves. Then provide a DETAILED FEATURE INVENTORY listing every visible section, component, and interactive element (e.g., 'Header with logo, search bar, and user menu; Hero section with headline, subtitle, and CTA button; Product grid with filter sidebar; Footer with 4-column links'). This inventory ensures nothing is lost during transformation.",
  "reference_style": "100-200 words describing the reference style's visual characteristics: color palette, typography style, spacing philosophy, component aesthetics, layout approach, and any notable use of background images or decorative visual assets",
  "modification_prompt": "A 1000-2000 word complete modification prompt. This prompt should be directly usable by AI to transform the source website's UI to match the reference style. The prompt MUST include: [Feature Preservation Mandate] Explicitly list ALL features and sections from the source website that must remain unchanged - every navigation item, content section, interactive element, form field, and functional component. State clearly: 'Do NOT add, remove, or modify any functionality. Only change the visual appearance.' [Visual Style Transformation] Detailed description of the new visual style to apply, including: overall design language and atmosphere, color scheme (with specific HEX values), font suggestions, visual tokens like radius/shadow/border (with specific CSS values), spacing and layout adjustment suggestions (layout changes are OK as long as all content/features remain), component style transformation for each component type identified in the source (buttons, cards, navbar, forms, tables, etc.), and animation/interaction suggestions. [Image & Visual Asset Generation] Analyze the reference style for any background images, hero banners, decorative illustrations, gradient overlays, or visual embellishments. For each visual asset needed to achieve the reference style, provide a detailed AI image generation prompt describing: the subject/content, visual style (photographic, illustrative, abstract, etc.), color palette and mood, dimensions and placement. Use backticks to mark key CSS values and technical parameters."
}

Notes:
1. source_theme MUST include a comprehensive feature inventory - this is critical to prevent feature loss
2. reference_style should focus purely on visual characteristics, not functionality
3. modification_prompt must start with an explicit feature preservation mandate before any style instructions
4. The prompt should make it impossible for an AI following it to accidentally remove or change any source website functionality
5. Return JSON directly, do not wrap in markdown code blocks
6. All output must be in English`;

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
                  data: source_base64
                }
              },
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/jpeg",
                  data: reference_base64
                }
              }
            ]
          }
        ],
        max_tokens: 8192,
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
