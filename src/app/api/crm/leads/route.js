import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // all | confirmed | cancelled | in_conversation

  const { data, error } = await supabaseServer
    .from("conversations")
    .select(`
      id, channel, created_at, context,
      leads ( id, phone, name, status )
    `)
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const rows = (data || []).map((c) => {
    const ctxStatus = c.context?.status || "in_conversation";
    return {
      conversation_id: c.id,
      phone: c.leads?.phone,
      name: c.leads?.name,
      status: ctxStatus,
      date: c.context?.date || null,
      time: c.context?.time || null,
      people: c.context?.people || null,
    };
  });

  const filtered =
    !status || status === "all"
      ? rows
      : rows.filter((r) => r.status === status);

  return Response.json({ leads: filtered });
}
