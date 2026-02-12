import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");
  if (!conversationId) return Response.json({ error: "conversationId required" }, { status: 400 });

  const { data, error } = await supabaseServer
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ messages: data ?? [] });
}
