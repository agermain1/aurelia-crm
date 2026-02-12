"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function getTickInterval(range) {
  // cada cuántos puntos mostrar label en X para que no se amontone
  // day: 24 puntos -> cada 2h
  // week: 168 puntos -> cada 12h
  // month: 720 puntos -> cada 24h
  if (range === "day") return 1;     // cada 2 puntos aprox si querés: 1 => muestra 1 de cada 2? (ver abajo)
  if (range === "week") return 11;   // ~cada 12h
  return 23;                         // ~cada 24h
}

export default function ActivityLineChart() {
  const [range, setRange] = useState("week"); // day|week|month
  const [payload, setPayload] = useState(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/crm/activity?range=${range}`);
      const data = await res.json();
      setPayload(data);
    })();
  }, [range]);

  const series = useMemo(() => payload?.series || [], [payload]);
  const interval = useMemo(() => getTickInterval(range), [range]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm text-slate-500">Actividad</div>
          <div className="text-lg font-semibold text-slate-900">
            Picos de mensajes entrantes (por hora)
          </div>
        </div>

        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
        >
          <option value="day">Últimas 24h</option>
          <option value="week">Últimos 7 días</option>
          <option value="month">Últimos 30 días</option>
        </select>
      </div>

      {!payload ? (
        <div className="text-slate-500">Cargando gráfico...</div>
      ) : (
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                interval={interval}
                tick={{ fontSize: 11 }}
                minTickGap={18}
              />
              <YAxis allowDecimals={false} />
              <Tooltip
                formatter={(value) => [value, "Mensajes"]}
                labelFormatter={(label) => `Hora: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="value"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
