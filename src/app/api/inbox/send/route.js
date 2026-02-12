import { supabaseServer } from "@/lib/supabaseServer";
import { sendWhatsAppMessage } from "@/lib/twilio";

export async function POST(req) {
  const { conversationId, content } = await req.json();

  if (!conversationId || !content) {
    return Response.json(
      { error: "conversationId & content required" },
      { status: 400 }
    );
  }

  // 1️⃣ Obtener conversación + lead (para saber el teléfono)
  const { data: convo, error: convoErr } = await supabaseServer
    .from("conversations")
    .select("id, leads ( phone )")
    .eq("id", conversationId)
    .single();

  if (convoErr) {
    return Response.json({ error: convoErr.message }, { status: 500 });
  }

  const to = convo?.leads?.phone;

  if (!to) {
    return Response.json(
      { error: "Lead phone not found" },
      { status: 400 }
    );
  }

  // 2️⃣ Guardar mensaje outbound en DB
  const { data: msg, error: msgErr } = await supabaseServer
    .from("messages")
    .insert({
      conversation_id: conversationId,
      direction: "outbound",
      role: "human",
      content,
    })
    .select("*")
    .single();

  if (msgErr) {
    return Response.json({ error: msgErr.message }, { status: 500 });
  }

  // 3️⃣ 🔥 ACÁ VA EL ENVÍO A WHATSAPP
  await sendWhatsAppMessage(to, content);

  // 4️⃣ Actualizar preview + timestamp
  await supabaseServer
    .from("conversations")
    .update({
      last_message_at: new Date().toISOString(),
      last_message_preview: content.slice(0, 140),
      unread_count: 0,
    })
    .eq("id", conversationId);

  return Response.json({ ok: true, message: msg });
}
