import { Users, CalendarOff, CalendarCheck } from "lucide-react";
import { api, useGet } from "../api";
import { Header, Stat, Card, Table, Badge, Btn } from "../ui";

const useTeam = () => { const [team] = useGet("/manager/team"); return [team, (id) => team.find((e) => e.id === id)?.name || `#${id}`]; };

export function Overview() {
  const [team, name] = useTeam();
  const [leaves, reload] = useGet("/manager/leaves");
  const [att] = useGet("/manager/attendance");
  const today = new Date().toISOString().slice(0, 10);
  const present = att.filter((a) => a.date === today && a.status.toLowerCase() === "present").length;
  const decide = async (id, s) => { await api(`/manager/leaves/${id}?status=${s}`, "PUT"); reload(); };
  return (<>
    <Header title="Manager Dashboard" sub="Your team at a glance" />
    <div className="grid grid-cols-3 gap-4 mb-6">
      <Stat label="Team members" value={team.length} icon={Users} />
      <Stat label="Present today" value={present} icon={CalendarCheck} color="emerald" />
      <Stat label="Pending approvals" value={leaves.length} icon={CalendarOff} color="amber" />
    </div>
    <div className="grid grid-cols-5 gap-6">
      <div className="col-span-3"><Card title="Leave requests awaiting you">
        <Table empty="All caught up 🎉" rows={leaves} cols={[["Employee", (r) => name(r.employee_id)], ["Type", (r) => r.leave_type], ["Reason", (r) => r.reason],
          ["", (r) => <div className="flex gap-2"><Btn variant="ok" onClick={() => decide(r.id, "approved")}>Approve</Btn><Btn variant="danger" onClick={() => decide(r.id, "rejected")}>Reject</Btn></div>]]} />
      </Card></div>
      <div className="col-span-2"><Card title="My team"><ul className="divide-y divide-slate-100">
        {team.map((m) => <li key={m.id} className="flex items-center gap-3 px-5 py-3"><div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 grid place-items-center font-semibold">{m.name[0]}</div><div><p className="text-sm font-medium text-slate-900">{m.name}</p><p className="text-xs text-slate-500">{m.phone}</p></div></li>)}
      </ul></Card></div>
    </div></>);
}

export function Team() {
  const [team] = useTeam();
  return (<><Header title="My Team" sub={`${team.length} direct reports`} />
    <Card><Table rows={team} cols={[["Name", (r) => <span className="font-medium text-slate-900">{r.name}</span>], ["Phone", (r) => r.phone], ["Employee ID", (r) => `EMP-${String(r.id).padStart(3, "0")}`]]} /></Card></>);
}

export function Leaves() {
  const [team, name] = useTeam();
  const [leaves, reload] = useGet("/manager/leaves");
  const decide = async (id, s) => { await api(`/manager/leaves/${id}?status=${s}`, "PUT"); reload(); };
  return (<><Header title="Leave Requests" sub="Pending requests from your team" />
    <Card><Table empty="No pending requests" rows={leaves} cols={[["Employee", (r) => name(r.employee_id)], ["Type", (r) => r.leave_type], ["Reason", (r) => r.reason], ["Status", (r) => <Badge text={r.status} />],
      ["", (r) => <div className="flex gap-2"><Btn variant="ok" onClick={() => decide(r.id, "approved")}>Approve</Btn><Btn variant="danger" onClick={() => decide(r.id, "rejected")}>Reject</Btn></div>]]} /></Card></>);
}

export function Attendance() {
  const [, name] = useTeam();
  const [rows] = useGet("/manager/attendance");
  return (<><Header title="Team Attendance" sub="Attendance records for your team" />
    <Card><Table rows={[...rows].reverse()} cols={[["Employee", (r) => name(r.employee_id)], ["Date", (r) => r.date], ["Status", (r) => <Badge text={r.status} />]]} /></Card></>);
}
