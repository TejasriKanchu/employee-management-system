import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LogOut, X } from "lucide-react";

export function Shell({ role, links }) {
  const nav = useNavigate();
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col p-4 fixed inset-y-0">
        <div className="flex items-center gap-2 px-2 py-3 mb-4">
          <div className="h-9 w-9 rounded-xl bg-indigo-500 grid place-items-center text-white font-bold">E</div>
          <div><p className="text-white font-semibold leading-tight">EMS</p><p className="text-xs text-slate-400 capitalize">{role} panel</p></div>
        </div>
        <nav className="space-y-1 flex-1">
          {links.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} end className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${isActive ? "bg-indigo-600 text-white" : "hover:bg-slate-800"}`}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <button onClick={() => { localStorage.removeItem("token"); nav("/login"); }} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-slate-800"><LogOut size={18} /> Logout</button>
      </aside>
      <main className="ml-64 flex-1 p-8"><Outlet /></main>
    </div>
  );
}

export const Header = ({ title, sub, children }) => (
  <div className="flex items-end justify-between mb-6">
    <div><h1 className="text-2xl font-bold text-slate-900">{title}</h1>{sub && <p className="text-sm text-slate-500 mt-1">{sub}</p>}</div>
    <div className="flex gap-2">{children}</div>
  </div>
);

export const Stat = ({ label, value, icon: Icon, color = "indigo" }) => {
  const c = { indigo: "bg-indigo-50 text-indigo-600", emerald: "bg-emerald-50 text-emerald-600", amber: "bg-amber-50 text-amber-600", rose: "bg-rose-50 text-rose-600", sky: "bg-sky-50 text-sky-600" }[color];
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center gap-4">
      <div className={`h-12 w-12 rounded-xl grid place-items-center ${c}`}><Icon size={22} /></div>
      <div><p className="text-2xl font-bold text-slate-900">{value}</p><p className="text-sm text-slate-500">{label}</p></div>
    </div>
  );
};

export const Card = ({ title, action, children }) => (
  <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
    {title && <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100"><h2 className="font-semibold text-slate-800">{title}</h2>{action}</div>}
    {children}
  </section>
);

const badge = { approved: "emerald", present: "emerald", completed: "emerald", low: "slate", pending: "amber", medium: "sky", "in progress": "sky", rejected: "rose", absent: "rose", high: "rose" };
export const Badge = ({ text }) => {
  const c = { emerald: "bg-emerald-50 text-emerald-700", amber: "bg-amber-50 text-amber-700", rose: "bg-rose-50 text-rose-700", sky: "bg-sky-50 text-sky-700", slate: "bg-slate-100 text-slate-600" }[badge[String(text).toLowerCase()] || "slate"];
  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${c}`}>{text}</span>;
};

export const Table = ({ cols, rows, empty = "Nothing here yet" }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead><tr className="text-left text-xs uppercase tracking-wide text-slate-500 bg-slate-50">{cols.map(([h]) => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}</tr></thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((r, i) => <tr key={r.id ?? i} className="hover:bg-slate-50">{cols.map(([h, f]) => <td key={h} className="px-5 py-3.5 text-slate-700">{f(r)}</td>)}</tr>)}
        {!rows.length && <tr><td colSpan={cols.length} className="px-5 py-10 text-center text-slate-400">{empty}</td></tr>}
      </tbody>
    </table>
  </div>
);

export const Btn = ({ variant = "primary", ...p }) => (
  <button {...p} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${variant === "primary" ? "bg-indigo-600 text-white hover:bg-indigo-700" : variant === "danger" ? "text-rose-600 hover:bg-rose-50" : variant === "ok" ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"} ${p.className || ""}`} />
);

export const Field = ({ label, children }) => <label className="block"><span className="text-sm font-medium text-slate-700">{label}</span><div className="mt-1">{children}</div></label>;
export const inputCls = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

export const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-slate-900/40 grid place-items-center z-50 p-4">
    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
      <div className="flex justify-between items-center mb-4"><h3 className="font-semibold text-lg">{title}</h3><button onClick={onClose}><X size={18} /></button></div>
      {children}
    </div>
  </div>
);
