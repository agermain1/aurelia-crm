import { supabaseServer } from "@/lib/supabaseServer";

export async function saveInboundMessage({ conversationId, content }) {
  const { error } = await supabaseServer.from("messages").insert({
    conversation_id: conversationId,
    direction: "inbound",
    role: "user",
    content,
  });
  if (error) throw error;
}

export async function saveOutboundMessage({ conversationId, content, role = "assistant" }) {
  const { error } = await supabaseServer.from("messages").insert({
    conversation_id: conversationId,
    direction: "outbound",
    role, // "assistant" para IA o "human" para manual
    content,
  });
  if (error) throw error;
}
