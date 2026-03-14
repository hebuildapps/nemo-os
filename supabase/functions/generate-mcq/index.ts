import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { taskTitle, taskDescription } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a quiz generator for software engineering interview preparation. Generate exactly 1 multiple-choice question to validate understanding of a given topic. Return ONLY valid JSON with this exact structure: {"question":"...","options":["A) ...","B) ...","C) ...","D) ..."],"correct":0}. The "correct" field is the 0-based index of the correct option. Make questions genuinely challenging and technically accurate. No markdown wrapping.`,
          },
          {
            role: "user",
            content: `Generate an MCQ for topic: "${taskTitle}"\nContext: ${taskDescription}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_mcq",
              description: "Generate a multiple choice question",
              parameters: {
                type: "object",
                properties: {
                  question: { type: "string", description: "The question text" },
                  options: {
                    type: "array",
                    items: { type: "string" },
                    description: "4 answer options prefixed with A), B), C), D)",
                  },
                  correct: {
                    type: "integer",
                    description: "0-based index of the correct option",
                  },
                },
                required: ["question", "options", "correct"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_mcq" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();

    // Extract from tool call response
    let mcq;
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      mcq = JSON.parse(toolCall.function.arguments);
    } else {
      // Fallback: try to parse from content
      const content = data.choices?.[0]?.message?.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        mcq = JSON.parse(jsonMatch[0]);
      }
    }

    if (!mcq || !mcq.options || mcq.options.length !== 4) {
      // Return a safe fallback
      mcq = {
        question: `Which best describes the core concept of "${taskTitle}"?`,
        options: [
          "A) It involves systematic analysis of algorithmic complexity and data structures",
          "B) It is primarily about database normalization and query optimization",
          "C) It is mainly a UI/UX design methodology for front-end apps",
          "D) It focuses on network protocol and communication design",
        ],
        correct: 0,
      };
    }

    return new Response(JSON.stringify(mcq), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-mcq error:", e);
    // Return fallback on any error
    return new Response(
      JSON.stringify({
        question: "What is the primary purpose of this topic in software engineering?",
        options: [
          "A) Algorithm design and problem solving",
          "B) Visual design and user experience",
          "C) Hardware configuration and maintenance",
          "D) Project management and team coordination",
        ],
        correct: 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
