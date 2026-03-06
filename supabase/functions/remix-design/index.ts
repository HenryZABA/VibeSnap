
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

**Image 1 (Source Website)**: The user's current website screenshot
**Image 2 (Reference Style)**: The style/design screenshot the user wants to reference

Please complete the following analysis tasks:
1. From Image 1 (Source Website): Extract the website theme, business positioning, core feature modules, content structure, and target users
2. From Image 2 (Reference Style): Extract UI visual style, color scheme, font style, design tokens like radius/shadow/spacing, layout patterns, and component styles
3. Combining both analyses, generate a complete "UI Modification Prompt" that guides AI to transform the source website to match the reference style

Return strict JSON format (no markdown code blocks, output raw JSON), with the following fields:

{
  "source_theme": "100-200 words describing what the source website does, target users, core features, and content structure",
  "reference_style": "100-200 words describing the reference style's visual characteristics, such as color scheme, layout features, and design language",
  "modification_prompt": "A 1000-2000 word complete modification prompt. This prompt should be directly usable by AI to transform the source website's UI to match the reference style. The prompt must include: [Content Preservation] Keep the source website's business theme, feature modules, and content structure unchanged. [Visual Style Transformation] Detailed description of the new visual style to apply, including: overall design language and atmosphere, color scheme (with specific HEX values), font suggestions, visual tokens like radius/shadow/border (with specific CSS values), spacing and layout adjustment suggestions, component style transformation (buttons, cards, navbar, forms, etc.), and animation/interaction suggestions. Use backticks to mark key CSS values and technical parameters."
}

Notes:
1. source_theme should accurately describe the source website's business essence
2. reference_style should capture the core visual characteristics of the reference
3. modification_prompt is the most important output - it must be detailed and practical enough for AI to directly transform the page
4. Return JSON directly, do not wrap in markdown code blocks
5. All output must be in English`;

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
