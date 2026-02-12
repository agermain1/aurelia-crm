import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-10 max-w-lg w-full text-center">
        <h1 className="text-2xl font-semibold text-slate-900 mb-3">
          Aurelia CRM
        </h1>

        <p className="text-slate-600 text-sm mb-8">
          MVP gestión de conversaciones
        </p>

        <Link
          href="/crm"
          className="inline-block px-6 py-3 rounded-2xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition"
        >
          Ir al Panel
        </Link>
      </div>
    </div>
  );
}
