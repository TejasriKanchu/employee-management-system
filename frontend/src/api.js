import { useEffect, useState, useCallback } from "react";
const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
export const getToken = () => localStorage.getItem("token");
export const getRole = () => {
  try { return JSON.parse(atob(getToken().split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).role; } catch { return null; }
};
export async function api(path, method = "GET", body) {
  const r = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json", ...(getToken() && { Authorization: `Bearer ${getToken()}` }) },
    body: body && JSON.stringify(body),
  });
  if (r.status === 401) { localStorage.removeItem("token"); window.location.href = "/login"; }
  const data = await r.json().catch(() => null);
  if (!r.ok) throw new Error(typeof data?.detail === "string" ? data.detail : "Request failed");
  return data;
}
// GET helper: const [data, reload, loading] = useGet("/employees")
export function useGet(path, fallback = []) {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const load = useCallback(() => api(path).then(setData).catch(() => setData(fallback)).finally(() => setLoading(false)), [path]);
  useEffect(() => { load(); }, [load]);
  return [data, load, loading];
}
