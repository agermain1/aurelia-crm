import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const { data, error } = await supabaseServer
    .from("conversations")
    .select(`
      id, channel, status, owner, ai_paused_until,
      last_message_at, last_message_preview, unread_count,
      created_at,
      leads ( id, phone, name, status )
    `)
    .order("last_message_at", { ascending: false, nullsFirst: false });
console.log("conversations payload:", data);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ conversations: data ?? [] });
}
