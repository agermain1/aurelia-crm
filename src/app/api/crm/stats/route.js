import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const [{ count: leadsCount }, { count: conversationsCount }] = await Promise.all([
    supabaseServer.from("leads").select("*", { count: "exact", head: true }),
    supabaseServer.from("conversations").select("*", { count: "exact", head: true }),
  ]);

  // Confirmadas: conversaciones con context.status = "confirmed"
  const { data: confirmedRows, error: confirmedError } = await supabaseServer
    .from("conversations")
    .select("id")
    .contains("context", { status: "confirmed" });

  if (confirmedError) {
    return Response.json({ error: confirmedError.message }, { status: 500 });
  }

  // Canceladas: conversaciones con context.status = "cancelled"
  const { data: cancelledRows, error: cancelledError } = await supabaseServer
    .from("conversations")
    .select("id")
    .contains("context", { status: "cancelled" });

  if (cancelledError) {
    return Response.json({ error: cancelledError.message }, { status: 500 });
  }

  return Response.json({
    leads: leadsCount || 0,
    conversations: conversationsCount || 0,
    confirmed_reservations: confirmedRows?.length || 0,
    cancelled_reservations: cancelledRows?.length || 0,
  });
}
