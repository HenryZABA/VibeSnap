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
      return new Response(JSON.stringify({ error: "Both source_base64 and reference_base64 are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are a world-class UI/UX design consultant. You are given TWO website screenshots:
1. IMAGE 1 (Source): The client's current website that needs a visual redesign
2. IMAGE 2 (Reference): A reference design whose visual style should be applied to the source

CRITICAL RULES:
- FUNCTIONALITY PRESERVATION MANDATE: You MUST preserve 100% of the source website's functionality. Every feature, button, form, navigation item, content section, and interactive element from the source MUST appear in the output prompt. Do NOT remove, hide, or simplify any functionality.
- FEATURE INVENTORY: In the source_theme, you must create a detailed inventory of ALL features and content sections found in the source website. List every navigation item, every button, every form field, every content card, every section heading, etc.
- STYLE-ONLY TRANSFER: Only the visual style (colors, typography, spacing, shadows, borders, layout patterns, imagery style) from the reference should be applied. The source's complete feature set and content structure must remain intact.

Your task:
1. Analyze the SOURCE website's theme (what it does, its purpose, target audience) and create a complete feature inventory
2. Analyze the REFERENCE website's visual style (colors, typography, layout, design patterns)
3. Generate a comprehensive modification prompt that applies the reference's visual style to the source while preserving ALL source functionality

Return a JSON object:
{
  "source_theme": "Detailed description of what the source website does, its purpose, target audience, AND a complete feature inventory listing every UI element, navigation item, content section, button, form, and interactive element found in the source.",
  "reference_style": "Detailed description of the reference design's visual characteristics",
  "modification_prompt": "A comprehensive, actionable prompt to redesign the source website using the reference's visual style. Must explicitly state that ALL original features and functionality must be preserved. Include specific colors, typography, spacing, component styles, and image/visual asset generation instructions."
}

[Part 3: Image & Visual Asset Requirements]
In the modification_prompt, include a dedicated section about generating images, logos, illustrations, and decorative graphics. The redesigned website must NOT have any empty image placeholders or blank background areas. Every space that needs a visual must have a specific image generation prompt describing what to create.

[Part 4: No Empty Spaces - Mandatory Asset Generation]
The modification_prompt MUST instruct that every section requiring an image, logo, illustration, icon, or decorative graphic must have a specific generation prompt. The redesigned website should NEVER have empty image placeholders, blank backgrounds, or missing visual elements. Include prompts for generating hero images, section backgrounds, icons, logos, and any decorative elements needed.

ALL output must be in English.`;

    const response = await fetch("https://api.enter.pro/code/api/v1/ai/messages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-pro-preview",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: systemPrompt,
              },
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/jpeg",
                  data: source_base64,
                },
              },
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/jpeg",
                  data: reference_base64,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI API error: ${response.status} ${errorText}`);
      return new Response(JSON.stringify({ error: `AI service error: ${response.status}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await response.json();

    let resultText = "";
    if (aiResponse.content && aiResponse.content.length > 0) {
      for (const block of aiResponse.content) {
        if (block.type === "text") {
          resultText += block.text;
        }
      }
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(resultText);
    } catch {
      const jsonMatch = resultText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[1].trim());
      } else {
        throw new Error("Failed to parse AI response as JSON");
      }
    }

    return new Response(JSON.stringify(parsedResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in remix-design:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});