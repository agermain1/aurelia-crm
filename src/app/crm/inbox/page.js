"use client";

import { useEffect, useState } from "react";
import { useInboxStore } from "@/store/useInboxStore";

export default function InboxPage() {
  const {
    conversations,
    selectedConversationId,
    messages,
    setSelectedConversationId,
    setConversations,
    setMessages,
    loadingConversations,
    loadingMessages,
    setLoadingConversations,
    setLoadingMessages,
  } = useInboxStore();

  const [draft, setDraft] = useState("");
async function loadConversations({ silent = false } = {}) {
  try {
    if (!silent) setLoadingConversations(true);

    const res = await fetch("/api/inbox/conversations");
    const data = await res.json();
    const incoming = data.conversations || [];

    setConversations((prev) => {
      if (!prev || prev.length === 0) return incoming;

      const prevById = new Map(prev.map((c) => [c.id, c]));
      let changed = false;

      const merged = incoming.map((next) => {
        const old = prevById.get(next.id);
        if (!old) {
          changed = true;
          return next;
        }

        const same =
          old.last_message_at === next.last_message_at &&
          old.last_message_preview === next.last_message_preview &&
          old.unread_count === next.unread_count &&
          old.owner === next.owner &&
          old.status === next.status;

        if (same) return old;
        changed = true;
        return { ...old, ...next };
      });

      return changed ? merged : prev;
    });
  } catch (e) {
    console.error("loadConversations error:", e);
  } finally {
    if (!silent) setLoadingConversations(false);
  }
}




 async function loadMessages(conversationId, { silent = false } = {}) {
  try {
    if (!silent) setLoadingMessages(true);

    const res = await fetch(`/api/inbox/messages?conversationId=${conversationId}`);
    const data = await res.json();
    const incoming = data.messages || [];

    setMessages((prev) => {
      // Si no había prev, set directo
      if (!prev || prev.length === 0) return incoming;

      // ✅ Si el largo y el último id son iguales, no actualizamos (evita “recarga”)
      const prevLast = prev[prev.length - 1];
      const nextLast = incoming[incoming.length - 1];

      const same =
        prev.length === incoming.length &&
        (prevLast?.id || null) === (nextLast?.id || null);

      return same ? prev : incoming;
    });
  } catch (e) {
    console.error("loadMessages error:", e);
  } finally {
    if (!silent) setLoadingMessages(false);
  }
}

useEffect(() => {
  loadConversations({ silent: false });

  const t = setInterval(() => {
    if (document.visibilityState === "visible") {
      loadConversations({ silent: true });
    }
  }, 5000);

  return () => clearInterval(t);
}, []);

useEffect(() => {
  if (!selectedConversationId) return;

  // Primera carga con loading
  loadMessages(selectedConversationId, { silent: false });

  // Polling silencioso (sin loading + sin re-render si no hay cambios)
  const t = setInterval(() => {
    if (document.visibilityState === "visible") {
      loadMessages(selectedConversationId, { silent: true });
    }
  }, 2000);

  return () => clearInterval(t);
}, [selectedConversationId]);


  async function sendManual() {
    if (!selectedConversationId || !draft.trim()) return;
    const content = draft.trim();
    setDraft("");

    await fetch("/api/inbox/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: selectedConversationId, content }),
    });

    await loadMessages(selectedConversationId);
    await loadConversations();
  }

  async function setOwner(owner) {
    if (!selectedConversationId) return;
    await fetch("/api/inbox/owner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: selectedConversationId, owner }),
    });
    await loadConversations();
  }

  const selected = conversations.find((c) => c.id === selectedConversationId);

  return (
    <div className="h-[calc(100vh-0px)] flex bg-slate-50">
      {/* Left list */}
      <aside className="w-[360px] border-r border-slate-200 bg-white">
        <div className="p-4 border-b border-slate-200">
          <h1 className="text-lg font-semibold">Inbox</h1>
          <p className="text-sm text-slate-500">WhatsApp Sandbox</p>
        </div>

        <div className="overflow-auto h-[calc(100vh-73px)]">
  {loadingConversations && conversations.length === 0 ? (
  <div className="p-4 text-slate-500">Cargando...</div>
) : (
  conversations.map((c) => (
    <button
      key={c.id}
      onClick={() => setSelectedConversationId(c.id)}
      className={`w-full text-left p-4 border-b border-slate-100 hover:bg-slate-50 ${
        selectedConversationId === c.id ? "bg-slate-50" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="font-medium text-slate-900">
          {c.leads?.name || c.leads?.phone}
        </div>
        <div className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
          {c.owner?.toUpperCase()}
        </div>
      </div>
      <div className="text-sm text-slate-600 mt-1 line-clamp-1">
        {c.last_message_preview || "—"}
      </div>
      <div className="text-xs text-slate-400 mt-1">
        {c.status} {c.unread_count ? `• ${c.unread_count} nuevos` : ""}
      </div>
    </button>
  ))
)}

        </div>
      </aside>

      {/* Right chat */}
      <main className="flex-1 flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
          <div>
            <div className="font-semibold">{selected ? (selected.leads?.name || selected.leads?.phone) : "Seleccioná un chat"}</div>
            <div className="text-xs text-slate-500">{selected ? `Owner: ${selected.owner}` : ""}</div>
          </div>

          {selectedConversationId && (
            <div className="flex gap-2">
              <button
                onClick={() => setOwner("human")}
                className="px-3 py-2 rounded-xl bg-slate-900 text-white text-sm"
              >
                Tomar control
              </button>
              <button
                onClick={() => setOwner("ai")}
                className="px-3 py-2 rounded-xl bg-slate-100 text-slate-900 text-sm"
              >
                Devolver a IA
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-3">
          {!selectedConversationId ? (
            <div className="text-slate-500">Elegí una conversación a la izquierda.</div>
          ) : loadingMessages ? (
            <div className="text-slate-500">Cargando mensajes...</div>
          ) : (
            messages.map((m) => {
              const isUser = m.direction === "inbound";
              return (
                <div
                  key={m.id}
                  className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-sm ${
                    isUser ? "bg-white border border-slate-200" : "bg-emerald-50 border border-emerald-100 ml-auto"
                  }`}
                >
                  <div className="text-sm text-slate-800 whitespace-pre-wrap">{m.content}</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {new Date(m.created_at).toLocaleString()}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {selectedConversationId && (
          <div className="p-4 border-t border-slate-200 bg-white flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Escribí una respuesta..."
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-200"
            />
            <button
              onClick={sendManual}
              className="px-4 py-3 rounded-xl bg-slate-900 text-white"
            >
              Enviar
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
