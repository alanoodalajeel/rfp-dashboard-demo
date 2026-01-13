"use client";

import React, { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  Filter,
  LayoutDashboard,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";

type Status =
  | "Draft"
  | "Internal Review"
  | "Published"
  | "Q&A"
  | "Submission Closed"
  | "Evaluation"
  | "Awarded";

type Risk = "None" | "At Risk" | "Overdue";

type Rfp = {
  id: string;
  title: string;
  category: string;
  site: string;
  owner: string;
  status: Status;
  dueDate: string; // YYYY-MM-DD
  budgetAed?: number;
  vendorsInvited: number;
  submissions: number;
  lastActivity: string; // YYYY-MM-DD
  approvals: { finance: boolean; legal: boolean; head: boolean };
  risk: Risk;
};

const statusOrder: Status[] = [
  "Draft",
  "Internal Review",
  "Published",
  "Q&A",
  "Submission Closed",
  "Evaluation",
  "Awarded",
];

const chartColors = [
  "#2563EB", // blue
  "#16A34A", // green
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // violet
  "#06B6D4", // cyan
  "#F97316", // orange
  "#22C55E", // emerald
  "#0EA5E9", // sky
  "#A855F7", // purple
];

function daysUntil(dateISO: string) {
  const d = new Date(dateISO + "T00:00:00");
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = d.getTime() - startToday.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatAed(n: number) {
  return new Intl.NumberFormat("en-AE").format(n);
}

function badge(text: string, tone: "ok" | "warn" | "danger" | "neutral" = "neutral") {
  const toneClass =
    tone === "ok"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : tone === "warn"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : tone === "danger"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-slate-200 bg-slate-50 text-slate-700";
  return <span className={"badge " + toneClass}>{text}</span>;
}

function statusTone(s: Status): "neutral" | "warn" | "ok" {
  if (s === "Awarded") return "ok";
  if (s === "Evaluation" || s === "Submission Closed") return "warn";
  return "neutral";
}

function riskTone(r: Risk): "neutral" | "warn" | "danger" {
  if (r === "None") return "neutral";
  if (r === "At Risk") return "warn";
  return "danger";
}

const demoRfps: Rfp[] = [
  {
    id: "RFP-2026-001",
    title: "Solar PV & PPA (Data Center Sites)",
    category: "Energy/Solar",
    site: "AUH",
    owner: "Procurement",
    status: "Q&A",
    dueDate: "2026-01-25",
    budgetAed: 42000000,
    vendorsInvited: 6,
    submissions: 3,
    lastActivity: "2026-01-10",
    approvals: { finance: true, legal: false, head: true },
    risk: "At Risk",
  },
  {
    id: "RFP-2026-002",
    title: "CRAH / FAHU Filters Framework",
    category: "M&E/HVAC",
    site: "DXB",
    owner: "OPS",
    status: "Published",
    dueDate: "2026-01-22",
    budgetAed: 2100000,
    vendorsInvited: 8,
    submissions: 2,
    lastActivity: "2026-01-11",
    approvals: { finance: true, legal: true, head: true },
    risk: "None",
  },
  {
    id: "RFP-2026-003",
    title: "Electrical Insulation Rubber Matting",
    category: "Electrical",
    site: "ALN",
    owner: "Procurement",
    status: "Evaluation",
    dueDate: "2026-01-15",
    budgetAed: 680000,
    vendorsInvited: 5,
    submissions: 4,
    lastActivity: "2026-01-09",
    approvals: { finance: true, legal: true, head: false },
    risk: "At Risk",
  },
  {
    id: "RFP-2026-004",
    title: "Generator Controller Upgrade",
    category: "Electrical",
    site: "AUH",
    owner: "OPS",
    status: "Internal Review",
    dueDate: "2026-01-12",
    budgetAed: 950000,
    vendorsInvited: 4,
    submissions: 0,
    lastActivity: "2026-01-06",
    approvals: { finance: false, legal: false, head: false },
    risk: "Overdue",
  },
];

const cycleTrend = [
  { month: "Aug", days: 22 },
  { month: "Sep", days: 20 },
  { month: "Oct", days: 18 },
  { month: "Nov", days: 19 },
  { month: "Dec", days: 17 },
  { month: "Jan", days: 18 },
];

function KpiCard({
  title,
  value,
  sub,
  icon,
}: {
  title: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="card kpi">
      <div>
        <div className="text-sm muted">{title}</div>
        <div className="mt-1 text-2xl font-semibold">{value}</div>
        <div className="mt-1 text-xs muted">{sub}</div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2">{icon}</div>
    </div>
  );
}

function SectionTitle({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-sm font-semibold">{title}</div>
      {right}
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
      <div className="h-full rounded-full bg-slate-900/70" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

function Dashboard({ rfps }: { rfps: Rfp[] }) {
  const active = rfps.filter((r) => r.status !== "Awarded");
  const dueThisWeek = rfps.filter((r) => {
    const d = daysUntil(r.dueDate);
    return d >= 0 && d <= 7;
  });
  const overdue = rfps.filter((r) => daysUntil(r.dueDate) < 0 && r.status !== "Awarded");

  const pipeline = useMemo(() => {
    const counts = Object.fromEntries(statusOrder.map((s) => [s, 0])) as Record<Status, number>;
    rfps.forEach((r) => (counts[r.status] += 1));
    return statusOrder.map((s) => ({ stage: s, count: counts[s] }));
  }, [rfps]);

  const statusPie = useMemo(() => {
    const counts = Object.fromEntries(statusOrder.map((s) => [s, 0])) as Record<Status, number>;
    rfps.forEach((r) => (counts[r.status] += 1));
    return statusOrder.map((s) => ({ name: s, value: counts[s] }));
  }, [rfps]);

  const riskPie = useMemo(() => {
    const map: Record<string, number> = { "On track": 0, "At risk": 0, Overdue: 0 };
    rfps.forEach((r) => {
      if (r.risk === "None") map["On track"] += 1;
      else if (r.risk === "At Risk") map["At risk"] += 1;
      else map["Overdue"] += 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [rfps]);

  const byCategory = useMemo(() => {
    const agg: Record<string, number> = {};
    rfps.forEach((r) => (agg[r.category] = (agg[r.category] || 0) + 1));
    return Object.entries(agg).map(([name, count]) => ({ name, count }));
  }, [rfps]);

  const budgetBySite = useMemo(() => {
    const agg: Record<string, number> = {};
    rfps.forEach((r) => {
      if (!r.budgetAed) return;
      agg[r.site] = (agg[r.site] || 0) + r.budgetAed;
    });
    return Object.entries(agg)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [rfps]);

  const vendorParticipation = useMemo(() => {
    return rfps
      .slice()
      .sort((a, b) => b.lastActivity.localeCompare(a.lastActivity))
      .slice(0, 6)
      .map((r) => ({
        name: r.id,
        invited: r.vendorsInvited,
        submitted: r.submissions,
        notSubmitted: Math.max(0, r.vendorsInvited - r.submissions),
      }));
  }, [rfps]);

  const alerts = useMemo(() => {
    const items: { type: "warn" | "danger" | "ok"; text: string }[] = [];
    if (dueThisWeek.length) items.push({ type: "warn", text: `${dueThisWeek.length} RFP(s) due within 7 days` });
    if (overdue.length) items.push({ type: "danger", text: `${overdue.length} RFP(s) overdue` });
    const missingApprovals = rfps.filter((r) => !r.approvals.finance || !r.approvals.legal || !r.approvals.head);
    if (missingApprovals.length) items.push({ type: "warn", text: `${missingApprovals.length} RFP(s) missing one or more approvals` });
    if (!items.length) items.push({ type: "ok", text: "No critical alerts" });
    return items;
  }, [rfps, dueThisWeek.length, overdue.length]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Active RFPs" value={`${active.length}`} sub="Not yet awarded" icon={<ClipboardList className="h-5 w-5" />} />
        <KpiCard title="Due this week" value={`${dueThisWeek.length}`} sub="Next 7 days" icon={<Calendar className="h-5 w-5" />} />
        <KpiCard title="Overdue" value={`${overdue.length}`} sub="Needs attention" icon={<AlertTriangle className="h-5 w-5" />} />
        <KpiCard title="SLA Compliance" value="87%" sub="Avg cycle time 17.8 days" icon={<ShieldCheck className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="card xl:col-span-2 p-5">
          <SectionTitle title="Pipeline" />
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
            {pipeline.map((p) => (
              <div key={p.stage} className="rounded-2xl border border-slate-200 p-3">
                <div className="text-xs muted">{p.stage}</div>
                <div className="mt-1 text-xl font-semibold">{p.count}</div>
                <div className="mt-2">
                  <ProgressBar value={p.count * 20} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card p-4">
              <SectionTitle title="Cycle time trend" />
              <div className="h-56 mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cycleTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="days" strokeWidth={2} fillOpacity={0.25} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-4">
              <SectionTitle title="RFPs by category" />
              <div className="h-56 mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byCategory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count">
                      {byCategory.map((_, i) => (
                        <Cell key={i} fill={chartColors[i % chartColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-4">
              <SectionTitle title="Status distribution" />
              <div className="h-56 mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={26} />
                    <Pie data={statusPie} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                      {statusPie.map((_, i) => (
                        <Cell key={i} fill={chartColors[i % chartColors.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-4">
              <SectionTitle title="Risk health" />
              <div className="h-56 mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={26} />
                    <Pie data={riskPie} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                      {riskPie.map((_, i) => (
                        <Cell key={i} fill={chartColors[(i + 3) % chartColors.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card p-4">
              <SectionTitle title="Budget by site (AED)" />
              <div className="h-60 mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip formatter={(v: any) => `AED ${formatAed(Number(v))}`} />
                    <Legend verticalAlign="bottom" height={26} />
                    <Pie data={budgetBySite} dataKey="value" nameKey="name" innerRadius={45} outerRadius={85} paddingAngle={2}>
                      {budgetBySite.map((_, i) => (
                        <Cell key={i} fill={chartColors[(i + 5) % chartColors.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-4">
              <SectionTitle title="Vendor participation (recent)" />
              <div className="h-60 mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={vendorParticipation} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="submitted" stackId="a" fill={chartColors[1]} />
                    <Bar dataKey="notSubmitted" stackId="a" fill={chartColors[3]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <SectionTitle title="Alerts" right={<Bell className="h-4 w-4 muted" />} />
            <div className="mt-4 space-y-3">
              {alerts.map((a, idx) => (
                <div key={idx} className="flex items-start gap-3 rounded-2xl border border-slate-200 p-3">
                  <div className="mt-0.5">
                    {a.type === "danger" ? (
                      <AlertTriangle className="h-5 w-5" />
                    ) : a.type === "warn" ? (
                      <Clock className="h-5 w-5" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5" />
                    )}
                  </div>
                  <div className="text-sm">{a.text}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <SectionTitle title="Due soon" />
            <div className="mt-4 space-y-3">
              {rfps
                .slice()
                .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                .slice(0, 4)
                .map((r) => (
                  <div key={r.id} className="rounded-2xl border border-slate-200 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-medium truncate">{r.title}</div>
                      {badge(r.risk === "None" ? "On track" : r.risk === "At Risk" ? "At risk" : "Overdue", riskTone(r.risk))}
                    </div>
                    <div className="mt-1 text-xs muted flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {r.dueDate} • {daysUntil(r.dueDate)} day(s)
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      {badge(r.status, statusTone(r.status))}
                      <div className="text-xs muted">{r.site}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="card p-5">
            <SectionTitle title="Quick filters" />
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 muted">
                <Filter className="h-4 w-4" />
                Demo-only (no backend). Deploy on Vercel for a share link.
              </div>
              <div className="flex items-center gap-2 muted">
                <Users className="h-4 w-4" />
                Vendor + submission metrics are sample data.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const [query, setQuery] = useState("");
  const [site, setSite] = useState<string>("All");
  const [status, setStatus] = useState<string>("All");

  const sites = useMemo(() => ["All", ...Array.from(new Set(demoRfps.map((r) => r.site)))], []);
  const statuses = useMemo(() => ["All", ...statusOrder], []);

  const filtered = useMemo(() => {
    return demoRfps.filter((r) => {
      const q = query.trim().toLowerCase();
      const matchQ = !q || `${r.id} ${r.title} ${r.category} ${r.owner}`.toLowerCase().includes(q);
      const matchSite = site === "All" || r.site === site;
      const matchStatus = status === "All" || r.status === status;
      return matchQ && matchSite && matchStatus;
    });
  }, [query, site, status]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="rounded-2xl bg-slate-900 text-white p-2">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">Demo RFP Platform</div>
              <div className="text-xs muted">Procurement Monitoring • Prototype</div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                className="h-10 w-[340px] rounded-2xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:bg-white"
                placeholder="Search RFP ID, title, category…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <select
              className="h-10 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none"
              value={site}
              onChange={(e) => setSite(e.target.value)}
            >
              {sites.map((s) => (
                <option key={s} value={s}>
                  Site: {s}
                </option>
              ))}
            </select>

            <select
              className="h-10 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  Status: {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {badge("View-only demo", "neutral")}
          {badge("No backend", "neutral")}
          {badge("Charts: Recharts", "neutral")}
          {badge("Deploy: Vercel", "neutral")}
        </div>

        <Dashboard rfps={filtered} />
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-8 text-xs muted">
        Data shown is sample data for demo purposes only.
      </footer>
    </div>
  );
}
