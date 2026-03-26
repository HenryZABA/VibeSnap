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
      return new Response(JSON.stringify({ error: "image_base64 is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are a world-class UI/UX design analyst. Your task is to analyze a website screenshot and extract its complete design DNA.

CRITICAL REBRANDING RULE: The output prompt's site_theme MUST be "rebranded". Do NOT use the original website's brand name, company name, product name, or any identifiable brand references. Instead, describe the site's purpose, target audience, and core functionality in generic, universal terms. For example, instead of "Spotify music streaming app", write "A music streaming platform for discovering and listening to songs, podcasts, and playlists. Target audience: music lovers and podcast enthusiasts."

You must return a JSON object with the following structure:
{
  "title": "A creative name for this design style",
  "summary": {
    "style_text": "A detailed paragraph describing the overall visual style, mood, and design philosophy",
    "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6"]
  },
  "palette": [
    {
      "name": "Color Name",
      "hex": "#HEXCODE",
      "usage": ["primary-bg", "text", "accent", etc],
      "description": "How this color is used in the design"
    }
  ],
  "typography": {
    "fonts": [
      {
        "name": "Font Name or closest match",
        "display_name": "Display Name",
        "css": "CSS font-family string"
      }
    ],
    "scale_hint": "Description of the type scale used"
  },
  "tokens": {
    "radius": { "base": "value", "pill": "value" },
    "shadow": { "base": "value", "hover": "value" },
    "border": { "style": "value" },
    "spacing": { "grid": "value", "layout": "value" }
  },
  "prompt": {
    "site_theme": "A rebranded description of what this website does, its purpose, target audience, and core features. NO original brand names.",
    "text": "A comprehensive, detailed prompt that can be used to recreate this design style. Include specific colors, typography, spacing, and component styles.",
    "version": "v2"
  }
}

[Part 3: Image & Visual Asset Requirements]
In the output prompt text, you MUST include a dedicated section about image and visual asset generation. Analyze the screenshot for:
1. Hero images or background visuals
2. Decorative illustrations or graphics
3. Product images or photography styles
4. Icon styles and illustration approaches
Then include specific instructions in the prompt about generating these visual assets to avoid blank/empty spaces in the recreated design.

[Part 4: No Empty Spaces - Mandatory Asset Generation]
The output prompt MUST instruct that every section requiring an image, logo, illustration, or decorative graphic must have a specific generation prompt. The recreated design should NEVER have empty image placeholders or blank background areas. If the original has images, the prompt must describe what kind of images to generate as replacements.

Extract 5-8 main colors from the design. Be specific about hex values.
Identify the font families used or suggest the closest match.
Extract design tokens like border-radius, shadows, spacing patterns.
The prompt should be detailed enough that another designer could recreate the style.
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
                  data: image_base64,
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
    console.error("Error in analyze-design:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});