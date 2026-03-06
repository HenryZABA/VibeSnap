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

    const { source_base64, reference_base64 } = await req.json();

    if (!source_base64 || !reference_base64) {
      return new Response(
        JSON.stringify({ error: "source_base64 and reference_base64 are both required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const nl = "\n";
    const modPromptDesc = [
      "1000-2000字的完整修改提示词。这段提示词应该可以直接交给 AI，让它将源网页的 UI 改造为参考风格。提示词必须包含以下内容：",
      "",
      "【网站定位与内容保持】保留源网页的业务主题、功能模块和内容结构不变。",
      "",
      "【视觉风格改造】详细描述要应用的新视觉风格，包括：",
      "- 整体设计语言和氛围",
      "- 配色方案（含具体HEX值）",
      "- 字体建议",
      "- 圆角、阴影、边框等视觉 token（含具体CSS值）",
      "- 间距和布局调整建议",
      "- 组件样式改造（按钮、卡片、导航栏、表单等）",
      "- 动画和交互建议",
      "",
      "用反引号标注关键CSS值和技术参数。",
    ].join(nl);

    const systemPrompt = `你是一个专业的 UI/UX 设计改造专家。用户会提供两张图片：

**图片1（源网页）**：用户当前的网页截图
**图片2（参考风格）**：用户想要参考的风格/设计截图

请你完成以下分析任务：
1. 从图片1（源网页）中提取：网站主题、业务定位、核心功能模块、内容结构、目标用户
2. 从图片2（参考风格）中提取：UI 视觉风格、配色方案、字体风格、圆角/阴影/间距等设计 token、布局模式、组件风格
3. 综合以上两点，生成一段完整的「UI 修改提示词」，指导 AI 将源网页改造为参考风格

请返回严格的 JSON 格式（不要使用 markdown 代码块包裹，直接输出纯 JSON），包含以下字段：

{
  "source_theme": "100-200字，描述源网页是做什么的、目标用户、核心功能、内容结构等",
  "reference_style": "100-200字，描述参考风格图的视觉风格特点，如配色风格、布局特征、设计语言等",
  "modification_prompt": "${modPromptDesc}"
}

注意：
1. source_theme 要准确描述源网站的业务本质，不要偏离
2. reference_style 要抓住参考风格的核心视觉特征
3. modification_prompt 是最重要的输出，要足够详细和实用，让 AI 能直接据此改造页面
4. 直接返回 JSON，不要包裹在 markdown 代码块中`;

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
