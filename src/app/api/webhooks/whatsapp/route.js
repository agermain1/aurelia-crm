import { supabaseServer } from "@/lib/supabaseServer";
import { sendWhatsAppMessage } from "@/lib/twilio";
import { generateFreeAIReply } from "@/lib/aiFree";

import { findOrCreateLeadByPhone } from "@/lib/services/leads";
import {
  findOrCreateConversation,
  touchConversationOnInbound,
  shouldAutoReplyAI,
} from "@/lib/services/conversations";
import { saveInboundMessage, saveOutboundMessage } from "@/lib/services/messages";

export async function GET() {
  return new Response("OK", { status: 200 });
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const from = formData.get("From"); // whatsapp:+549...
    const body = (formData.get("Body") || "").toString().trim();

    if (!from || !body) {
      return new Response("<Response></Response>", {
        headers: { "Content-Type": "text/xml" },
      });
    }

    console.log("Webhook hit:", from, body);

    // 1) Lead
    const lead = await findOrCreateLeadByPhone(from);

    // 2) Conversation
    const convo = await findOrCreateConversation({ leadId: lead.id, channel: "whatsapp" });

    // 3) Save inbound
    await saveInboundMessage({ conversationId: convo.id, content: body });

    // 4) Update convo metadata (preview/unread)
    await touchConversationOnInbound({ conversationId: convo.id, preview: body });

    // 5) Refetch convo (para owner/pausa/context)
    const { data: freshConvo, error } = await supabaseServer
      .from("conversations")
      .select("*")
      .eq("id", convo.id)
      .single();

    if (error) throw error;

    // 6) Si owner=human o está pausada, no respondemos con IA
    if (!shouldAutoReplyAI(freshConvo)) {
      return new Response("<Response></Response>", {
        headers: { "Content-Type": "text/xml" },
      });
    }

    // 7) IA gratis (humana) con contexto
    const currentContext = freshConvo.context || {};
    const { reply, nextContext } = generateFreeAIReply({
      inboundText: body,
      context: currentContext,
      now: new Date(),
    });

    // 8) Guardar contexto actualizado
    await supabaseServer
      .from("conversations")
      .update({
        context: nextContext,
        updated_at: new Date().toISOString(),
      })
      .eq("id", freshConvo.id);

    // 9) Guardar outbound en DB (para verlo en CRM)
    await saveOutboundMessage({
      conversationId: freshConvo.id,
      content: reply,
      role: "assistant",
    });

    // 10) Enviar WhatsApp outbound real
    await sendWhatsAppMessage(from, reply);

    // 11) Actualizar preview del último mensaje con la respuesta
    await supabaseServer
      .from("conversations")
      .update({
        last_message_at: new Date().toISOString(),
        last_message_preview: reply.slice(0, 140),
        updated_at: new Date().toISOString(),
        unread_count: 0,
      })
      .eq("id", freshConvo.id);

    return new Response("<Response></Response>", {
      headers: { "Content-Type": "text/xml" },
    });
  } catch (err) {
    console.error("Webhook error:", err);

    return new Response("<Response></Response>", {
      headers: { "Content-Type": "text/xml" },
    });
  }
}
