import { supabaseServer } from "@/lib/supabaseServer";

/**
 * Busca una conversación abierta por lead + canal, o la crea.
 */
export async function findOrCreateConversation({ leadId, channel = "whatsapp" }) {
  const { data: existing, error: findError } = await supabaseServer
    .from("conversations")
    .select("*")
    .eq("lead_id", leadId)
    .eq("channel", channel)
    .eq("status", "open")
    .maybeSingle();

  if (findError) throw findError;
  if (existing) return existing;

  const { data: created, error: createError } = await supabaseServer
    .from("conversations")
    .insert({
      lead_id: leadId,
      channel,
      status: "open",
      owner: "ai",
      ai_paused_until: null,
      last_message_at: null,
      last_message_preview: null,
      unread_count: 0,
    })
    .select("*")
    .single();

  if (createError) throw createError;
  return created;
}

/**
 * Actualiza metadatos de conversación cuando entra un mensaje inbound.
 * Para MVP dejamos unread_count=1 (simple). Si querés increment real luego, hacemos RPC.
 */
export async function touchConversationOnInbound({ conversationId, preview }) {
  const { error } = await supabaseServer
    .from("conversations")
    .update({
      last_message_at: new Date().toISOString(),
      last_message_preview: (preview || "").slice(0, 140),
      unread_count: 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversationId);

  if (error) throw error;
}

/**
 * Determina si la IA debe responder automáticamente según owner y ai_paused_until.
 */
export function shouldAutoReplyAI(convo) {
  if (!convo) return false;
  if (convo.owner === "human") return false;

  if (convo.ai_paused_until) {
    const pausedUntil = new Date(convo.ai_paused_until).getTime();
    if (Number.isFinite(pausedUntil) && pausedUntil > Date.now()) return false;
  }

  return true;
}
