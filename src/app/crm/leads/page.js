"use client";

import { useEffect, useState } from "react";

const tabs = [
  { key: "all", label: "Todos" },
  { key: "in_conversation", label: "En conversación" },
  { key: "confirmed", label: "Confirmados" },
  { key: "cancelled", label: "Cancelados" },
];

export default function LeadsPage() {
  const [tab, setTab] = useState("all");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/crm/leads?status=${tab}`);
    const data = await res.json();
    setRows(data.leads || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [tab]);

  return (
    <div className="h-full overflow-auto p-6">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-slate-900">Leads</h1>
        <p className="text-sm text-slate-500">Estado de cada lead / reserva</p>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-2 rounded-xl text-sm border ${
              tab === t.key
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-slate-500">Cargando...</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-5 text-xs font-medium text-slate-500 bg-slate-50 border-b border-slate-200 px-4 py-3">
            <div>Lead</div>
            <div>Estado</div>
            <div>Fecha</div>
            <div>Hora</div>
            <div>Personas</div>
          </div>

          {rows.length === 0 ? (
            <div className="p-4 text-slate-500">Sin resultados.</div>
          ) : (
            rows.map((r, idx) => (
              <div
                key={`${r.conversation_id}-${idx}`}
                className="grid grid-cols-5 px-4 py-3 border-b border-slate-100 text-sm"
              >
                <div className="text-slate-900">{r.name || r.phone}</div>
                <div className="text-slate-700">{r.status}</div>
                <div className="text-slate-700">{r.date || "—"}</div>
                <div className="text-slate-700">{r.time || "—"}</div>
                <div className="text-slate-700">{r.people || "—"}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
