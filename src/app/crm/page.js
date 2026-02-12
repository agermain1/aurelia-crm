"use client";

import ActivityLineChart from "@/components/ActivityLineChart";
import { useEffect, useState } from "react";

function Card({ title, value }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="text-2xl font-semibold text-slate-900 mt-1">{value}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/crm/stats");
      const data = await res.json();
      setStats(data);
    })();
  }, []);
  console.log(stats)

  return (
    <div className="h-full overflow-auto p-6">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-slate-900">Estadísticas</h1>
        <p className="text-sm text-slate-500">Resumen general del CRM</p>
      </div>

      {!stats ? (
        <div className="text-slate-500">Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card title="Leads" value={stats.leads} />
          <Card title="Conversaciones" value={stats.conversations} />
          <Card title="Reservas confirmadas" value={stats.confirmed_reservations} />
           <Card title="Reservas canceladas" value={stats.cancelled_reservations} />
        </div>
      )}
      <ActivityLineChart />
    </div>
  );
}
