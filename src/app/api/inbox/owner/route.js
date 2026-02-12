import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req) {
  const { conversationId, owner } = await req.json(); // owner: "ai" | "human"
  if (!conversationId || !owner) return Response.json({ error: "missing params" }, { status: 400 });

  const payload =
    owner === "human"
      ? { owner: "human", ai_paused_until: new Date(Date.now() + 60 * 60 * 1000).toISOString() } // 1h
      : { owner: "ai", ai_paused_until: null };

  const { error } = await supabaseServer.from("conversations").update(payload).eq("id", conversationId);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true });
}
