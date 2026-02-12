"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/crm", label: "Estadísticas" },
  { href: "/crm/inbox", label: "Mensajes" },
  { href: "/crm/leads", label: "Leads" },
];

export default function CrmLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="h-full flex bg-slate-50">
      <aside className="w-[260px] border-r border-slate-200 bg-white">
        <div className="p-4 border-b border-slate-200">
          <div className="font-semibold text-slate-900">Aurelia CRM</div>
          <div className="text-xs text-slate-500">Reservas · WhatsApp</div>
        </div>

        <nav className="p-2">
          {items.map((it) => {
            const active = pathname === it.href;
            return (
              <Link
                key={it.href}
                href={it.href}
                className={`block px-3 py-2 rounded-xl text-sm mb-1 ${
                  active
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {it.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
