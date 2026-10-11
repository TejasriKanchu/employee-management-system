import { useState } from "react";
import { Users, Building2, CalendarOff, UserCog } from "lucide-react";
import { api, useGet } from "../api";
import { Header, Stat, Card, Table, Badge, Btn, Field, inputCls, Modal } from "../ui";

const useLookups = () => {
  const [emps, reloadE] = useGet("/employees");
  const [deps, reloadD] = useGet("/departments");
  const [users] = useGet("/users");
  const name = (id) => emps.find((e) => e.id === id)?.name || "—";
  const dep = (id) => deps.find((d) => d.id === id)?.name || "—";
  const email = (uid) => users.find((u) => u.id === uid)?.email || "—";
  return { emps, deps, users, name, dep, email, reloadE, reloadD };
};
const Select = ({ value, onChange, options, placeholder }) => (
  <select className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} required={!!placeholder?.startsWith("Select")}>
    <option value="">{placeholder}</option>{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
  </select>
);

export function Overview() {
  const L = useLookups();
  const [leaves] = useGet("/admin/leaves");
  const pending = leaves.filter((l) => l.status === "pending");
  return (
    <>
      <Header title="Admin Dashboard" sub="Company-wide overview" />
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Stat label="Employees" value={L.emps.length} icon={Users} />
        <Stat label="Departments" value={L.deps.length} icon={Building2} color="sky" />
        <Stat label="User accounts" value={L.users.length} icon={UserCog} color="emerald" />
        <Stat label="Pending leaves" value={pending.length} icon={CalendarOff} color="amber" />
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2"><Card title="Recent leave requests">
          <Table rows={leaves.slice(-5).reverse()} cols={[["Employee", (r) => L.name(r.employee_id)], ["Type", (r) => r.leave_type], ["Reason", (r) => r.reason], ["Status", (r) => <Badge text={r.status} />]]} />
        </Card></div>
        <Card title="Headcount by department"><div className="p-5 space-y-4">
          {L.deps.map((d) => { const n = L.emps.filter((e) => e.department_id === d.id).length; return (
            <div key={d.id}><div className="flex justify-between text-sm mb-1"><span className="text-slate-700">{d.name}</span><span className="text-slate-500">{n}</span></div>
              <div className="h-2 bg-slate-100 rounded-full"><div className="h-2 bg-indigo-500 rounded-full" style={{ width: `${(n / Math.max(L.emps.length, 1)) * 100}%` }} /></div></div>); })}
        </div></Card>
      </div>
    </>
  );
}

export function Employees() {
  const L = useLookups();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ user_id: "", name: "", phone: "", department_id: "", manager_id: "" });
  const save = async (e) => {
    e.preventDefault();
    await api("/employees", "POST", { ...f, user_id: +f.user_id, department_id: +f.department_id, manager_id: f.manager_id ? +f.manager_id : null });
    setOpen(false); L.reloadE();
  };
  const del = async (id) => { if (confirm("Delete this employee?")) { await api(`/employees/${id}`, "DELETE"); L.reloadE(); } };
  const rows = L.emps.filter((e) => e.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <Header title="Employees" sub={`${L.emps.length} people in the company`}>
        <input className={inputCls + " w-60"} placeholder="Search by name…" value={q} onChange={(e) => setQ(e.target.value)} />
        <Btn onClick={() => setOpen(true)}>+ Add employee</Btn>
      </Header>
      <Card><Table rows={rows} cols={[
        ["Name", (r) => <div className="flex items-center gap-3"><div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 grid place-items-center font-semibold">{r.name[0]}</div><div><p className="font-medium text-slate-900">{r.name}</p><p className="text-xs text-slate-500">{L.email(r.user_id)}</p></div></div>],
        ["Phone", (r) => r.phone], ["Department", (r) => <Badge text={L.dep(r.department_id)} />], ["Manager", (r) => L.name(r.manager_id)],
        ["", (r) => <Btn variant="danger" onClick={() => del(r.id)}>Delete</Btn>]]} /></Card>
      {open && <Modal title="Add employee" onClose={() => setOpen(false)}>
        <form onSubmit={save} className="space-y-3">
          <Field label="User account"><Select value={f.user_id} onChange={(v) => setF({ ...f, user_id: v })} placeholder="Select user" options={L.users.map((u) => [u.id, `${u.email} (${u.role})`])} /></Field>
          <Field label="Full name"><input required className={inputCls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <Field label="Phone"><input required className={inputCls} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
          <Field label="Department"><Select value={f.department_id} onChange={(v) => setF({ ...f, department_id: v })} placeholder="Select department" options={L.deps.map((d) => [d.id, d.name])} /></Field>
          <Field label="Manager"><Select value={f.manager_id} onChange={(v) => setF({ ...f, manager_id: v })} placeholder="No manager" options={L.emps.map((e) => [e.id, e.name])} /></Field>
          <Btn className="w-full">Save employee</Btn>
        </form></Modal>}
    </>
  );
}

export function Departments() {
  const [deps, reload] = useGet("/departments");
  const [f, setF] = useState({ name: "", description: "" });
  const add = async (e) => { e.preventDefault(); await api("/departments", "POST", f); setF({ name: "", description: "" }); reload(); };
  const del = async (id) => { if (confirm("Delete department?")) { await api(`/departments/${id}`, "DELETE"); reload(); } };
  return (
    <>
      <Header title="Departments" sub="Organise your company structure" />
      <form onSubmit={add} className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 flex gap-3 items-end">
        <div className="flex-1"><Field label="Name"><input required className={inputCls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field></div>
        <div className="flex-[2]"><Field label="Description"><input className={inputCls} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field></div>
        <Btn>Add department</Btn>
      </form>
      <Card><Table rows={deps} cols={[["Name", (r) => <span className="font-medium text-slate-900">{r.name}</span>], ["Description", (r) => r.description || "—"], ["", (r) => <Btn variant="danger" onClick={() => del(r.id)}>Delete</Btn>]]} /></Card>
    </>
  );
}

export function Leaves() {
  const L = useLookups();
  const [leaves] = useGet("/admin/leaves");
  return (<><Header title="Leave Requests" sub="All requests across the company" />
    <Card><Table rows={leaves} cols={[["Employee", (r) => L.name(r.employee_id)], ["Type", (r) => r.leave_type], ["Reason", (r) => r.reason], ["Status", (r) => <Badge text={r.status} />]]} /></Card></>);
}

export function Attendance() {
  const L = useLookups();
  const [rows, reload] = useGet("/attendance");
  const [f, setF] = useState({ employee_id: "", date: new Date().toISOString().slice(0, 10), status: "Present" });
  const mark = async (e) => { e.preventDefault(); await api("/attendance", "POST", { ...f, employee_id: +f.employee_id }); reload(); };
  return (<><Header title="Attendance" sub="Mark and review daily attendance" />
    <form onSubmit={mark} className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 flex gap-3 items-end">
      <div className="flex-1"><Field label="Employee"><Select value={f.employee_id} onChange={(v) => setF({ ...f, employee_id: v })} placeholder="Select employee" options={L.emps.map((e) => [e.id, e.name])} /></Field></div>
      <Field label="Date"><input type="date" className={inputCls} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
      <Field label="Status"><select className={inputCls} value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}><option>Present</option><option>Absent</option></select></Field>
      <Btn>Mark</Btn>
    </form>
    <Card><Table rows={[...rows].reverse()} cols={[["Employee", (r) => L.name(r.employee_id)], ["Date", (r) => r.date], ["Status", (r) => <Badge text={r.status} />]]} /></Card></>);
}

export function Tasks() {
  const L = useLookups();
  const [f, setF] = useState({ title: "", description: "", assigned_to: "", priority: "Medium", due_date: "" });
  const [msg, setMsg] = useState("");
  const create = async (e) => {
    e.preventDefault();
    await api("/tasks", "POST", { ...f, assigned_to: +f.assigned_to, due_date: f.due_date || null });
    setMsg("Task assigned successfully"); setF({ ...f, title: "", description: "" });
  };
  return (<><Header title="Assign Task" sub="Create a task for any employee" />
    <form onSubmit={create} className="bg-white rounded-2xl border border-slate-200 p-6 max-w-2xl space-y-4">
      {msg && <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">{msg}</p>}
      <Field label="Title"><input required className={inputCls} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
      <Field label="Description"><textarea rows={3} className={inputCls} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Assign to"><Select value={f.assigned_to} onChange={(v) => setF({ ...f, assigned_to: v })} placeholder="Select employee" options={L.emps.map((e) => [e.id, e.name])} /></Field>
        <Field label="Priority"><select className={inputCls} value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value })}><option>Low</option><option>Medium</option><option>High</option></select></Field>
        <Field label="Due date"><input type="date" className={inputCls} value={f.due_date} onChange={(e) => setF({ ...f, due_date: e.target.value })} /></Field>
      </div>
      <Btn>Assign task</Btn>
    </form></>);
}
