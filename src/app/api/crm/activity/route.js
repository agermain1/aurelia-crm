import { supabaseServer } from "@/lib/supabaseServer";

function toISO(d) {
  return d.toISOString();
}
function pad2(n) {
  return String(n).padStart(2, "0");
}
function formatHourLabel(date) {
  const d = new Date(date);
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)} ${pad2(d.getHours())}:00`;
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") || "week"; // day|week|month

  const now = new Date();
  let from = new Date(now);

  if (range === "day") from.setHours(now.getHours() - 23, 0, 0, 0);   // 24 puntos (hora)
  if (range === "week") from.setHours(now.getHours() - 24 * 7 + 1, 0, 0, 0); // 168 puntos
  if (range === "month") from.setHours(now.getHours() - 24 * 30 + 1, 0, 0, 0); // 720 puntos

  // inbound = picos de entrada (cambiable)
  const { data, error } = await supabaseServer
    .from("messages")
    .select("created_at, direction")
    .gte("created_at", toISO(from))
    .lte("created_at", toISO(now))
    .eq("direction", "inbound")
    .order("created_at", { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Buckets por hora
  const buckets = new Map();
  const start = new Date(from);
  start.setMinutes(0, 0, 0);

  const end = new Date(now);

  for (let d = new Date(start); d <= end; d.setHours(d.getHours() + 1)) {
    buckets.set(d.toISOString(), 0);
  }

  for (const m of data || []) {
    const dt = new Date(m.created_at);
    dt.setMinutes(0, 0, 0);
    const key = dt.toISOString();
    buckets.set(key, (buckets.get(key) || 0) + 1);
  }

  const series = Array.from(buckets.entries()).map(([iso, count]) => ({
    ts: iso,
    label: formatHourLabel(iso), // siempre fecha + hora
    value: count,
  }));

  return Response.json({ range, bucket: "hour", series });
}
