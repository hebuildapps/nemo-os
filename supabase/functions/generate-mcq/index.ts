import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface McqPayload {
  question: string;
  options: string[];
  correct: number;
}

const fallbackMcq = (topic: string): McqPayload => ({
  question: `Which best describes the core concept of "${topic}"?`,
  options: [
    "A) It involves systematic analysis of algorithmic complexity and data structures",
    "B) It is primarily about database normalization and query optimization",
    "C) It is mainly a UI/UX design methodology for front-end apps",
    "D) It focuses on network protocol and communication design",
  ],
  correct: 0,
});

const isValidMcq = (value: unknown): value is McqPayload => {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<McqPayload>;

  return (
    typeof candidate.question === "string" &&
    Array.isArray(candidate.options) &&
    candidate.options.length === 4 &&
    candidate.options.every((option) => typeof option === "string") &&
    typeof candidate.correct === "number" &&
    Number.isInteger(candidate.correct) &&
    candidate.correct >= 0 &&
    candidate.correct < candidate.options.length
  );
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const payload = await req.json();
    const topic = payload.topic ?? payload.taskTitle ?? "Software Engineering";
    const difficulty = payload.difficulty ?? "Medium";
    const stage = payload.stage ?? "";
    const taskDescription = payload.taskDescription ?? "";

    const NEMO_BACKEND_URL = Deno.env.get("NEMO_BACKEND_URL");
    if (!NEMO_BACKEND_URL) throw new Error("NEMO_BACKEND_URL is not configured");

    const backendBaseUrl = NEMO_BACKEND_URL.replace(/\/+$/, "");
    const response = await fetch(`${backendBaseUrl}/api/generate-mcq`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic,
        difficulty,
        stage,
        taskDescription,
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
      console.error("Amazon Nova backend error:", response.status, errText);
      throw new Error("Amazon Nova backend error");
    }

    const data: unknown = await response.json();
    let mcq: unknown = data;

    if (typeof mcq === "string") {
      const mcqText = mcq;
      try {
        mcq = JSON.parse(mcqText);
      } catch {
        const jsonMatch = mcqText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          mcq = JSON.parse(jsonMatch[0]);
        }
      }
    }

    if (!isValidMcq(mcq)) {
      mcq = fallbackMcq(topic);
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
