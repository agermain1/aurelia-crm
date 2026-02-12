import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const [{ count: leadsCount }, { count: conversationsCount }, { count: messagesCount }] =
    await Promise.all([
      supabaseServer.from("leads").select("*", { count: "exact", head: true }),
      supabaseServer.from("conversations").select("*", { count: "exact", head: true }),
      supabaseServer.from("messages").select("*", { count: "exact", head: true }),
    ]);

  // Confirmaciones: contamos conversaciones con context.status = "confirmed"
  const { data: confirmedRows, error } = await supabaseServer
    .from("conversations")
    .select("id")
    .contains("context", { status: "confirmed" });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({
    leads: leadsCount || 0,
    conversations: conversationsCount || 0,
    messages: messagesCount || 0,
    confirmed_reservations: confirmedRows?.length || 0,
  });
}
