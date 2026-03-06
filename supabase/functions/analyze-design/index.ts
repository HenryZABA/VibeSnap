
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
    const AI_API_TOKEN = Deno.env.get("AI_API_TOKEN_c747b5206c1c");
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

    const systemPrompt = `你是一个专业的 UI/UX 设计分析师。请分析用户提供的网页截图，提取其设计 DNA。

请返回严格的 JSON 格式（不要使用 markdown 代码块包裹，直接输出纯 JSON），包含以下字段：

{
  "title": "为这个设计起一个简短有创意的名称（2-6个字，体现设计风格特点，如'极简森林'、'霓虹都市'、'暖阳烘焙'）",
  "summary": {
    "style_text": "一段200-300字的设计风格总结描述，涵盖整体视觉风格、配色方案、布局特点、设计理念等",
    "tags": ["标签1", "标签2", "标签3", "标签4"]
  },
  "palette": [
    {
      "name": "颜色名称（如 Primary Blue）",
      "hex": "#十六进制颜色值",
      "usage": ["用途1", "用途2"],
      "description": "简短的中文说明"
    }
  ],
  "typography": {
    "fonts": [
      {
        "name": "字体英文名",
        "display_name": "字体显示名（含中文别名）",
        "css": "CSS font-family 值"
      }
    ],
    "scale_hint": "字号层级描述"
  },
  "tokens": {
    "radius": {
      "base": "基础圆角值",
      "pill": "药丸形圆角值"
    },
    "shadow": {
      "base": "基础阴影CSS值",
      "hover": "悬停阴影CSS值"
    },
    "border": {
      "style": "边框风格描述"
    },
    "spacing": {
      "grid": "网格间距值",
      "layout": "布局间距描述"
    }
  },
  "prompt": {
    "text": "一段完整的设计提示词（800-1500字），可以直接用于 AI 生成同风格页面。提示词应包含：页面类型、整体风格、颜色方案（含具体HEX值）、字体建议、圆角/阴影/间距等视觉 token、布局结构、组件风格、动画建议等。用反引号标注关键CSS值和技术参数。",
    "version": "v1"
  }
}

注意：
1. title 要简短有创意，能体现设计的核心风格特点
2. palette 数组应包含6-8个从截图中识别到的主要颜色
3. 每个颜色都要准确提取HEX值
4. tags 应该是4-6个简短的设计风格标签
5. prompt.text 要足够详细，能让 AI 生成同款风格的页面
6. 直接返回 JSON，不要包裹在 markdown 代码块中`;

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
