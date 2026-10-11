import { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Building2, CalendarOff, CalendarCheck, ListTodo, UserCircle } from "lucide-react";
import { api, getRole } from "./api";
import { Shell, Field, inputCls, Btn } from "./ui";
import * as A from "./pages/Admin";
import * as M from "./pages/Manager";
import * as E from "./pages/Employee";

const Guard = ({ role, links }) => (getRole() === role ? <Shell role={role} links={links} /> : <Navigate to="/login" replace />);

const adminLinks = [["/admin", "Overview", LayoutDashboard], ["/admin/employees", "Employees", Users], ["/admin/departments", "Departments", Building2], ["/admin/leaves", "Leaves", CalendarOff], ["/admin/attendance", "Attendance", CalendarCheck], ["/admin/tasks", "Assign Task", ListTodo]];
const managerLinks = [["/manager", "Overview", LayoutDashboard], ["/manager/team", "My Team", Users], ["/manager/leaves", "Leave Requests", CalendarOff], ["/manager/attendance", "Attendance", CalendarCheck]];
const employeeLinks = [["/employee", "Dashboard", LayoutDashboard], ["/employee/leaves", "My Leaves", CalendarOff], ["/employee/tasks", "My Tasks", ListTodo], ["/employee/attendance", "Attendance", CalendarCheck], ["/employee/profile", "Profile", UserCircle]];

function Login() {
  const nav = useNavigate();
  const [f, setF] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    try {
      const r = await api("/login", "POST", f);
      if (!r.access_token) return setErr(r.message || "Login failed");
      localStorage.setItem("token", r.access_token);
      nav("/" + getRole());
    } catch (x) { setErr(x.message); }
  };
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-center p-16 bg-gradient-to-br from-indigo-600 to-violet-700 text-white">
        <div className="h-12 w-12 rounded-2xl bg-white/20 grid place-items-center font-bold text-xl mb-6">E</div>
        <h1 className="text-4xl font-bold leading-tight">Employee Management System</h1>
        <p className="mt-4 text-indigo-100 max-w-md">Manage teams, track attendance, approve leaves and assign tasks, all in one place.</p>
      </div>
      <div className="grid place-items-center p-8">
        <form onSubmit={submit} className="w-full max-w-sm space-y-5">
          <div><h2 className="text-2xl font-bold text-slate-900">Welcome back</h2><p className="text-slate-500 text-sm mt-1">Sign in to your account</p></div>
          {err && <p className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{err}</p>}
          <Field label="Email"><input className={inputCls} type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="you@company.com" /></Field>
          <Field label="Password"><input className={inputCls} type="password" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} placeholder="••••••••" /></Field>
          <Btn className="w-full py-2.5">Sign in</Btn>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<Guard role="admin" links={adminLinks} />}>
        <Route index element={<A.Overview />} /><Route path="employees" element={<A.Employees />} /><Route path="departments" element={<A.Departments />} />
        <Route path="leaves" element={<A.Leaves />} /><Route path="attendance" element={<A.Attendance />} /><Route path="tasks" element={<A.Tasks />} />
      </Route>
      <Route path="/manager" element={<Guard role="manager" links={managerLinks} />}>
        <Route index element={<M.Overview />} /><Route path="team" element={<M.Team />} /><Route path="leaves" element={<M.Leaves />} /><Route path="attendance" element={<M.Attendance />} />
      </Route>
      <Route path="/employee" element={<Guard role="employee" links={employeeLinks} />}>
        <Route index element={<E.Dashboard />} /><Route path="leaves" element={<E.Leaves />} /><Route path="tasks" element={<E.Tasks />} />
        <Route path="attendance" element={<E.Attendance />} /><Route path="profile" element={<E.Profile />} />
      </Route>
      <Route path="*" element={<Navigate to={getRole() ? "/" + getRole() : "/login"} replace />} />
    </Routes>
  );
}
