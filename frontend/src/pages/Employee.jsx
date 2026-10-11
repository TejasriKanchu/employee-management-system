import { useState } from "react";
import { CalendarOff, CalendarCheck, ListTodo, CheckCircle2 } from "lucide-react";
import { api, useGet } from "../api";
import { Header, Stat, Card, Table, Badge, Btn, Field, inputCls } from "../ui";

export function Dashboard() {
  const [me] = useGet("/my-profile", null);
  const [mgr] = useGet("/my-manager", null);
  const [tasks] = useGet("/my-tasks");
  const [leaves] = useGet("/my-leaves");
  const [att] = useGet("/my-attendance");
  const present = att.filter((a) => a.status.toLowerCase() === "present").length;
  return (<>
    <Header title={`Hello, ${me?.name?.split(" ")[0] || "there"} 👋`} sub="Here's what's happening with your work" />
    <div className="grid grid-cols-4 gap-4 mb-6">
      <Stat label="Open tasks" value={tasks.filter((t) => t.status !== "Completed").length} icon={ListTodo} />
      <Stat label="Completed" value={tasks.filter((t) => t.status === "Completed").length} icon={CheckCircle2} color="emerald" />
      <Stat label="Days present" value={present} icon={CalendarCheck} color="sky" />
      <Stat label="Pending leaves" value={leaves.filter((l) => l.status === "pending").length} icon={CalendarOff} color="amber" />
    </div>
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2"><Card title="My tasks"><Table rows={tasks} empty="No tasks assigned" cols={[["Task", (r) => <span className="font-medium text-slate-900">{r.title}</span>], ["Priority", (r) => <Badge text={r.priority} />], ["Due", (r) => r.due_date || "—"], ["Status", (r) => <Badge text={r.status} />]]} /></Card></div>
      <div className="space-y-6">
        <Card title="My profile"><div className="p-5 flex items-center gap-4"><div className="h-14 w-14 rounded-full bg-indigo-600 text-white grid place-items-center text-xl font-semibold">{me?.name?.[0]}</div><div><p className="font-semibold text-slate-900">{me?.name}</p><p className="text-sm text-slate-500">{me?.phone}</p></div></div></Card>
        <Card title="My manager"><div className="p-5 text-sm"><p className="font-medium text-slate-900">{mgr?.name || "Not assigned"}</p><p className="text-slate-500">{mgr?.phone}</p></div></Card>
      </div>
    </div></>);
}

export function Leaves() {
  const [me] = useGet("/my-profile", null);
  const [leaves, reload] = useGet("/my-leaves");
  const [f, setF] = useState({ leave_type: "Casual", reason: "" });
  const apply = async (e) => { e.preventDefault(); await api("/leaves", "POST", { ...f, employee_id: me.id }); setF({ ...f, reason: "" }); reload(); };
  return (<><Header title="My Leaves" sub="Apply for leave and track status" />
    <div className="grid grid-cols-3 gap-6">
      <form onSubmit={apply} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 self-start">
        <h2 className="font-semibold text-slate-800">Apply for leave</h2>
        <Field label="Leave type"><select className={inputCls} value={f.leave_type} onChange={(e) => setF({ ...f, leave_type: e.target.value })}><option>Casual</option><option>Sick</option><option>Annual</option></select></Field>
        <Field label="Reason"><textarea required rows={3} className={inputCls} value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} /></Field>
        <Btn className="w-full">Submit request</Btn>
      </form>
      <div className="col-span-2"><Card title="History"><Table rows={[...leaves].reverse()} cols={[["Type", (r) => r.leave_type], ["Reason", (r) => r.reason], ["Status", (r) => <Badge text={r.status} />]]} /></Card></div>
    </div></>);
}

export function Tasks() {
  const [tasks] = useGet("/my-tasks");
  return (<><Header title="My Tasks" sub="Work assigned to you" /><Card><Table rows={tasks} empty="No tasks assigned" cols={[["Task", (r) => <div><p className="font-medium text-slate-900">{r.title}</p><p className="text-xs text-slate-500">{r.description}</p></div>], ["Priority", (r) => <Badge text={r.priority} />], ["Due", (r) => r.due_date || "—"], ["Status", (r) => <Badge text={r.status} />]]} /></Card></>);
}

export function Attendance() {
  const [att] = useGet("/my-attendance");
  return (<><Header title="My Attendance" sub="Your attendance record" /><Card><Table rows={[...att].reverse()} cols={[["Date", (r) => r.date], ["Status", (r) => <Badge text={r.status} />]]} /></Card></>);
}

export function Profile() {
  const [me] = useGet("/my-profile", null);
  const [f, setF] = useState(null);
  const [pw, setPw] = useState({ old_password: "", new_password: "" });
  const [msg, setMsg] = useState("");
  const form = f || me;
  if (!form) return null;
  const save = async (e) => { e.preventDefault(); await api("/my-profile", "PUT", { name: form.name, phone: form.phone }); setMsg("Profile updated"); };
  const change = async (e) => { e.preventDefault(); const r = await api("/change-password", "PUT", pw); setMsg(r.message); setPw({ old_password: "", new_password: "" }); };
  return (<><Header title="Profile" sub="Manage your details and password" />
    {msg && <p className="mb-4 text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2 max-w-xl">{msg}</p>}
    <div className="grid grid-cols-2 gap-6 max-w-4xl">
      <form onSubmit={save} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4"><h2 className="font-semibold">Personal details</h2>
        <Field label="Name"><input className={inputCls} value={form.name} onChange={(e) => setF({ ...form, name: e.target.value })} /></Field>
        <Field label="Phone"><input className={inputCls} value={form.phone} onChange={(e) => setF({ ...form, phone: e.target.value })} /></Field><Btn>Save changes</Btn></form>
      <form onSubmit={change} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4"><h2 className="font-semibold">Change password</h2>
        <Field label="Current password"><input type="password" required className={inputCls} value={pw.old_password} onChange={(e) => setPw({ ...pw, old_password: e.target.value })} /></Field>
        <Field label="New password"><input type="password" required className={inputCls} value={pw.new_password} onChange={(e) => setPw({ ...pw, new_password: e.target.value })} /></Field><Btn>Update password</Btn></form>
    </div></>);
}
