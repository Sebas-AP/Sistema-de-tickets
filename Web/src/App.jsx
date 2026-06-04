// =============================================================
// HelpDesk Admin Panel — React + Tailwind CSS
// Estructura: Functional Components + Hooks + Mock Data
// Para integración real: reemplaza las funciones marcadas con
// comentarios → [ DB ] o [ API ] por llamadas a Supabase/REST
// =============================================================

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  LayoutDashboard, Ticket, Users, BarChart3, Settings,
  Bell, Search, Eye, Plus, X, Save, LogOut,
  Clock, CheckCircle2, AlertCircle, Gauge,
  TrendingUp, TrendingDown, Inbox, HelpCircle, Sun, Moon
} from "lucide-react";

// =============================================================
// hooks/useDarkMode.js
// =============================================================
function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem("darkMode");
    if (stored !== null) return stored === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("darkMode", String(dark));
  }, [dark]);

  return [dark, setDark];
}

// =============================================================
// data/mockData.js
// =============================================================
const MOCK_TICKETS = [
  {
    id: "TK-1001", title: "Error al iniciar sesión con SSO",
    category: "Autenticación", requester: "Laura Gómez", requesterInitials: "LG",
    agent: "Ana García", agentInitials: "AG",
    status: "open", priority: "urgent", created: "2025-06-02",
    desc: "Los usuarios reportan que el login con SSO falla en el 40% de los intentos. El error es 'Invalid token response'. Ocurre principalmente en Firefox y Safari.",
  },
  {
    id: "TK-1002", title: "Solicitud de nuevo monitor para diseño",
    category: "Hardware", requester: "Diego Ramírez", requesterInitials: "DR",
    agent: "Carlos López", agentInitials: "CL",
    status: "pending", priority: "medium", created: "2025-06-01",
    desc: "El equipo de diseño necesita monitores 4K adicionales. Se requieren 3 unidades modelo Dell U2723QE.",
  },
  {
    id: "TK-1003", title: "VPN sin conexión en sede Madrid",
    category: "Redes", requester: "Marta Sanz", requesterInitials: "MS",
    agent: "María Torres", agentInitials: "MT",
    status: "open", priority: "high", created: "2025-06-01",
    desc: "Desde las 09:15h la VPN no permite conexión a recursos internos desde la sede Madrid. Afecta a 25 usuarios.",
  },
  {
    id: "TK-1004", title: "Actualización de licencias Office 365",
    category: "Software", requester: "José Herrera", requesterInitials: "JH",
    agent: "Pedro Ruiz", agentInitials: "PR",
    status: "resolved", priority: "low", created: "2025-05-30",
    desc: "Renovar las 120 licencias de Microsoft 365 Business Premium antes del 15 de junio.",
  },
  {
    id: "TK-1005", title: "Fallo en backup nocturno del servidor BD-03",
    category: "Servidores", requester: "Tech Ops", requesterInitials: "TO",
    agent: "Sofía Mendez", agentInitials: "SM",
    status: "open", priority: "urgent", created: "2025-06-02",
    desc: "El backup a las 02:00h falló con 'Disk quota exceeded'. El servidor BD-03 almacena datos críticos de producción.",
  },
  {
    id: "TK-1006", title: "Correo spam pasando filtro anti-phishing",
    category: "Seguridad", requester: "Ana Blanco", requesterInitials: "AB",
    agent: "Ana García", agentInitials: "AG",
    status: "pending", priority: "high", created: "2025-05-31",
    desc: "Se han recibido 12 correos de phishing sofisticados que superan el filtro de Microsoft Defender.",
  },
  {
    id: "TK-1007", title: "Impresora 3er piso sin conexión",
    category: "Hardware", requester: "Roberto Vega", requesterInitials: "RV",
    agent: "Carlos López", agentInitials: "CL",
    status: "closed", priority: "low", created: "2025-05-28",
    desc: "La impresora HP LaserJet del tercer piso no aparece en la red. Posible falla de tarjeta de red.",
  },
  {
    id: "TK-1008", title: "Acceso denegado a carpeta compartida legal",
    category: "Permisos", requester: "Valeria Cruz", requesterInitials: "VC",
    agent: "María Torres", agentInitials: "MT",
    status: "resolved", priority: "medium", created: "2025-05-29",
    desc: "Tres abogados reportan acceso denegado a /shared/legal/contratos. Error 403 desde la migración del viernes.",
  },
];

const AGENTS = [
  { id: "ana",    name: "Ana García",    initials: "AG" },
  { id: "carlos", name: "Carlos López",  initials: "CL" },
  { id: "maria",  name: "María Torres",  initials: "MT" },
  { id: "pedro",  name: "Pedro Ruiz",    initials: "PR" },
  { id: "sofia",  name: "Sofía Mendez",  initials: "SM" },
];

// =============================================================
// hooks/useTickets.js
// =============================================================
function useTickets() {
  const [tickets, setTickets] = useState(MOCK_TICKETS);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filteredTickets = useMemo(() => {
    let list = tickets;
    if (filter === "urgent") list = list.filter((t) => t.priority === "urgent");
    else if (filter !== "all") list = list.filter((t) => t.status === filter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          t.requester.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [tickets, filter, search]);

  // [ API ] PUT /api/tickets/:id — reemplazar setTickets con llamada real
  const updateTicket = useCallback((id, changes) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...changes } : t))
    );
  }, []);

  const stats = useMemo(() => ({
    pending:  tickets.filter((t) => t.status === "pending" || t.status === "open").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    urgent:   tickets.filter((t) => t.priority === "urgent" && !["resolved","closed"].includes(t.status)).length,
    byStatus: ["open","pending","resolved","closed"].map((s) => ({
      key: s, count: tickets.filter((t) => t.status === s).length, total: tickets.length,
    })),
  }), [tickets]);

  return { tickets, filteredTickets, filter, setFilter, search, setSearch, updateTicket, stats };
}

// =============================================================
// components/dashboard/KpiCard.jsx
// =============================================================
const KPI_CONFIG = {
  pending:  { label: "Tickets pendientes", icon: Clock,         bg: "bg-amber-50 dark:bg-amber-900/30",    iconColor: "text-amber-600 dark:text-amber-400",  trend: "+2 desde ayer",      trendUp: false },
  resolved: { label: "Resueltos hoy",      icon: CheckCircle2,  bg: "bg-emerald-50 dark:bg-emerald-900/30",iconColor: "text-emerald-600 dark:text-emerald-400",trend: "+18% vs. ayer",      trendUp: true  },
  urgent:   { label: "Urgentes abiertos",  icon: AlertCircle,   bg: "bg-red-50 dark:bg-red-900/30",        iconColor: "text-red-500 dark:text-red-400",      trend: "−1 desde ayer",      trendUp: true  },
  avgTime:  { label: "Tiempo prom. resolución", icon: Gauge,    bg: "bg-violet-50 dark:bg-violet-900/30",  iconColor: "text-violet-600 dark:text-violet-400", trend: "−30min vs. sem. ant.", trendUp: true  },
};

function KpiCard({ type, value }) {
  const cfg = KPI_CONFIG[type];
  const Icon = cfg.icon;
  const TrendIcon = cfg.trendUp ? TrendingDown : TrendingUp;
  const trendColor = cfg.trendUp ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400";
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500 dark:text-gray-400">{cfg.label}</span>
        <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center`}>
          <Icon size={15} className={cfg.iconColor} />
        </div>
      </div>
      <p className="text-2xl font-medium text-gray-900 dark:text-white tracking-tight">{value}</p>
      <p className={`text-xs mt-1 flex items-center gap-1 ${trendColor}`}>
        <TrendIcon size={11} /> {cfg.trend}
      </p>
    </div>
  );
}

// =============================================================
// components/tickets/StatusBadge.jsx
// =============================================================
const STATUS_STYLES = {
  open:     "bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  pending:  "bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  resolved: "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  closed:   "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
};
const STATUS_LABELS = { open:"Abierto", pending:"Pendiente", resolved:"Resuelto", closed:"Cerrado" };

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status] ?? STATUS_STYLES.open}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

const PRIO_STYLES = {
  urgent: { badge: "bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-400",       dot: "bg-red-500 dark:bg-red-400" },
  high:   { badge: "bg-orange-50 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400", dot: "bg-orange-500 dark:bg-orange-400" },
  medium: { badge: "bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", dot: "bg-yellow-400 dark:bg-yellow-400" },
  low:    { badge: "bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-400",  dot: "bg-green-500 dark:bg-green-400" },
};
const PRIO_LABELS = { urgent:"Urgente", high:"Alta", medium:"Media", low:"Baja" };

function PriorityBadge({ priority }) {
  const cfg = PRIO_STYLES[priority] ?? PRIO_STYLES.medium;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {PRIO_LABELS[priority] ?? priority}
    </span>
  );
}

// =============================================================
// components/tickets/TicketTable.jsx
// =============================================================
const FILTERS = [
  { key: "all", label: "Todos" },
  { key: "open", label: "Abiertos" },
  { key: "pending", label: "Pendientes" },
  { key: "resolved", label: "Resueltos" },
  { key: "urgent", label: "Urgentes" },
];

function TicketTable({ tickets, filter, setFilter, onOpenTicket }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-gray-900 dark:text-white flex-1">Todos los tickets</span>
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                filter === f.key
                  ? "bg-violet-50 border-violet-200 text-violet-700 dark:bg-violet-900/30 dark:border-violet-700 dark:text-violet-400 font-medium"
                  : "border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
              {["ID","Título / Categoría","Solicitante","Agente","Estado","Prioridad",""].map((h, i) => (
                <th key={i} className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400 dark:text-gray-500 text-sm">
                  <Inbox size={32} className="mx-auto mb-2 text-gray-200 dark:text-gray-600" />
                  No se encontraron tickets
                </td>
              </tr>
            ) : (
              tickets.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => onOpenTicket(t.id)}
                  className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/40 cursor-pointer transition-colors last:border-none"
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-[11px] text-gray-400 dark:text-gray-500">{t.id}</span>
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <p className="text-gray-900 dark:text-gray-100 truncate">{t.title}</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{t.category}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs whitespace-nowrap">{t.requester}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs whitespace-nowrap">{t.agent}</td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-4 py-3"><PriorityBadge priority={t.priority} /></td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); onOpenTicket(t.id); }}
                      className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Eye size={13} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// =============================================================
// components/tickets/TicketDetail.jsx
// =============================================================
function TicketDetail({ ticket, agents, onClose, onSave }) {
  const [status, setStatus] = useState(ticket.status);
  const [agentId, setAgentId] = useState(
    agents.find((a) => a.name === ticket.agent)?.id ?? ""
  );

  if (!ticket) return null;

  const handleSave = () => {
    const agent = agents.find((a) => a.id === agentId);
    // [ API ] PUT /api/tickets/:id — enviar { status, agentId } al backend
    onSave(ticket.id, {
      status,
      agent: agent?.name ?? ticket.agent,
      agentInitials: agent?.initials ?? ticket.agentInitials,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-[440px] max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700 shadow-xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-start gap-3">
          <div className="flex-1">
            <p className="font-mono text-[11px] text-gray-400 dark:text-gray-500 mb-1">{ticket.id}</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{ticket.title}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{ticket.category} · {ticket.created}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 flex flex-col gap-4">
          <div>
            <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1.5">Descripción</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{ticket.desc}</p>
          </div>

          <hr className="border-gray-100 dark:border-gray-700" />

          <div className="grid grid-cols-2 gap-3">
            <div><p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Estado</p><StatusBadge status={ticket.status} /></div>
            <div><p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Prioridad</p><PriorityBadge priority={ticket.priority} /></div>
            <div><p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Solicitante</p><p className="text-sm text-gray-900 dark:text-gray-100">{ticket.requester}</p></div>
            <div><p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Creado</p><p className="text-sm text-gray-900 dark:text-gray-100">{ticket.created}</p></div>
          </div>

          <hr className="border-gray-100 dark:border-gray-700" />

          {/* Cambiar estado — [ API ] */}
          <div>
            <label className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide block mb-1.5">
              Cambiar estado
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
            >
              <option value="open">Abierto</option>
              <option value="pending">Pendiente</option>
              <option value="resolved">Resuelto</option>
              <option value="closed">Cerrado</option>
            </select>
          </div>

          {/* Reasignar agente — [ API ] */}
          <div>
            <label className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide block mb-1.5">
              Reasignar agente
            </label>
            <select
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
            >
              <option value="">Sin asignar</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <hr className="border-gray-100 dark:border-gray-700" />

          {/* Actividad — [ API ] GET /api/tickets/:id/activity */}
          <div>
            <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">Actividad reciente</p>
            {[
              { text: `Agente ${ticket.agent} fue asignado`, time: "1h ago" },
              { text: `Estado cambiado a ${ticket.status}`, time: "3h ago" },
              { text: `${ticket.requester} abrió el ticket`, time: ticket.created },
            ].map((a, i) => (
              <div key={i} className="flex gap-3 mb-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-600 dark:text-gray-400">{a.text}</p>
                  <p className="text-gray-400 dark:text-gray-500 text-[10px] mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-violet-700 dark:bg-violet-600 text-white text-sm font-medium hover:bg-violet-800 dark:hover:bg-violet-700 transition-colors flex items-center gap-1.5"
          >
            <Save size={13} /> Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================
// views/DashboardView.jsx
// =============================================================
function DashboardView({ stats, tickets, onNavigate, onOpenTicket }) {
  const STATUS_INFO = [
    { key: "open",     label: "Abiertos",   color: "bg-blue-500" },
    { key: "pending",  label: "Pendientes", color: "bg-amber-400" },
    { key: "resolved", label: "Resueltos",  color: "bg-emerald-500" },
    { key: "closed",   label: "Cerrados",   color: "bg-gray-300 dark:bg-gray-500" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-base font-medium text-gray-900 dark:text-white">Bienvenido de nuevo, Admin</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Resumen de actividad · {new Date().toLocaleDateString("es-ES", { weekday:"long", day:"numeric", month:"long" })}
          </p>
        </div>
        <button
          onClick={() => onNavigate("tickets")}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-700 dark:bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-800 dark:hover:bg-violet-700 transition-colors"
        >
          <Plus size={14} /> Nuevo ticket
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <KpiCard type="pending"  value={stats.pending} />
        <KpiCard type="resolved" value={stats.resolved} />
        <KpiCard type="urgent"   value={stats.urgent} />
        <KpiCard type="avgTime"  value="4.2h" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Tickets recientes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center">
            <span className="text-sm font-medium text-gray-900 dark:text-white flex-1">Tickets recientes</span>
            <button onClick={() => onNavigate("tickets")} className="text-xs text-violet-600 dark:text-violet-400 hover:underline">Ver todos →</button>
          </div>
          {tickets.slice(0, 4).map((t) => (
            <div
              key={t.id}
              onClick={() => onOpenTicket(t.id)}
              className="px-4 py-2.5 flex items-center gap-3 border-b border-gray-50 dark:border-gray-700/50 last:border-none hover:bg-gray-50 dark:hover:bg-gray-700/40 cursor-pointer transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{t.title}</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500">{t.id} · {t.requester}</p>
              </div>
              <StatusBadge status={t.status} />
            </div>
          ))}
        </div>

        {/* Distribución por estado */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-900 dark:text-white">Distribución por estado</span>
          </div>
          <div className="px-4 py-4 flex flex-col gap-3">
            {STATUS_INFO.map(({ key, label, color }) => {
              const row = stats.byStatus.find((s) => s.key === key);
              const pct = row ? Math.round((row.count / row.total) * 100) : 0;
              return (
                <div key={key}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
                    <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                      {row?.count ?? 0} <span className="text-gray-400 dark:text-gray-500 font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================
// views/TicketsView.jsx
// =============================================================
function TicketsView({ filteredTickets, filter, setFilter, onOpenTicket }) {
  return (
    <TicketTable
      tickets={filteredTickets}
      filter={filter}
      setFilter={setFilter}
      onOpenTicket={onOpenTicket}
    />
  );
}

// =============================================================
// components/layout/Sidebar.jsx
// =============================================================
const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard",     Icon: LayoutDashboard },
  { key: "tickets",   label: "Tickets",       Icon: Ticket, hasBadge: true },
  { key: "users",     label: "Usuarios",      Icon: Users },
  { key: "reports",   label: "Reportes",      Icon: BarChart3 },
  { key: "config",    label: "Configuración", Icon: Settings },
];

function Sidebar({ activeView, onNavigate, pendingCount }) {
  return (
    <aside className="w-56 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="h-14 px-4 flex items-center gap-2.5 border-b border-gray-100 dark:border-gray-700">
        <div className="w-7 h-7 rounded-lg bg-[#1a1a2e] flex items-center justify-center">
          <Ticket size={14} className="text-violet-400" />
        </div>
        <span className="text-sm font-medium text-gray-900 dark:text-white tracking-tight">HelpDesk Pro</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2.5 flex flex-col gap-0.5">
        <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2 py-2">Principal</p>
        {NAV_ITEMS.slice(0, 2).map(({ key, label, Icon, hasBadge }) => (
          <NavItem key={key} label={label} Icon={Icon} active={activeView === key}
            badge={hasBadge ? pendingCount : null}
            onClick={() => onNavigate(key)} />
        ))}
        <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2 py-2 mt-1">Gestión</p>
        {NAV_ITEMS.slice(2).map(({ key, label, Icon }) => (
          <NavItem key={key} label={label} Icon={Icon} active={activeView === key}
            onClick={() => onNavigate(key)} />
        ))}
      </nav>

      {/* Admin footer — [ AUTH ] Supabase auth.user() o JWT decode */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#1a1a2e] flex items-center justify-center text-[10px] font-medium text-violet-400">AD</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 dark:text-white">Admin</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">admin@helpdesk.io</p>
          </div>
          <button className="text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors" title="Cerrar sesión">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ label, Icon, active, badge, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-sm transition-colors ${
        active
          ? "bg-violet-50 text-violet-700 font-medium dark:bg-violet-900/30 dark:text-violet-400"
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"
      }`}
    >
      <Icon size={16} />
      {label}
      {badge != null && (
        <span className="ml-auto text-[10px] font-medium bg-red-500 text-white rounded-full px-1.5 py-0.5 leading-none">
          {badge}
        </span>
      )}
    </button>
  );
}

// =============================================================
// components/layout/Topbar.jsx
// =============================================================
const VIEW_TITLES = { dashboard:"Dashboard", tickets:"Gestión de Tickets", users:"Usuarios", reports:"Reportes", config:"Configuración" };

function Topbar({ activeView, search, onSearch, dark, onToggleDark }) {
  const [hasNotif, setHasNotif] = useState(true);
  return (
    <header className="h-14 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center px-5 gap-3 flex-shrink-0">
      <span className="text-sm font-medium text-gray-900 dark:text-white flex-1">{VIEW_TITLES[activeView] ?? activeView}</span>
      {/* Search — filtra la tabla de tickets */}
      <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-lg px-3 h-8">
        <Search size={13} className="text-gray-400 dark:text-gray-500" />
        <input
          type="text" placeholder="Buscar tickets..."
          value={search} onChange={(e) => onSearch(e.target.value)}
          className="bg-transparent text-sm text-gray-900 dark:text-gray-100 outline-none w-44 placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
        {search && (
          <button onClick={() => onSearch("")} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={13} />
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <button
          onClick={onToggleDark}
          className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title={dark ? "Modo claro" : "Modo oscuro"}
        >
          {dark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        {/* [ API ] GET /api/notifications — cargar notificaciones reales */}
        <button
          onClick={() => setHasNotif(false)}
          className="relative w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Bell size={15} />
          {hasNotif && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />}
        </button>
        <button className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <HelpCircle size={15} />
        </button>
        {/* [ AUTH ] Reemplazar con avatar del usuario autenticado */}
        <div className="w-7 h-7 rounded-full bg-[#1a1a2e] flex items-center justify-center text-[10px] font-medium text-violet-400 cursor-pointer">AD</div>
      </div>
    </header>
  );
}

// =============================================================
// components/layout/AdminLayout.jsx
// =============================================================
function AdminLayout({ children, activeView, onNavigate, search, onSearch, pendingCount, dark, onToggleDark }) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      <Sidebar activeView={activeView} onNavigate={onNavigate} pendingCount={pendingCount} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar activeView={activeView} search={search} onSearch={onSearch} dark={dark} onToggleDark={onToggleDark} />
        <main className="flex-1 overflow-y-auto p-5">{children}</main>
      </div>
    </div>
  );
}

// =============================================================
// App.jsx — Punto de entrada principal
// =============================================================
export default function App() {
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedId, setSelectedId] = useState(null);
  const [dark, setDark] = useDarkMode();
  const { tickets, filteredTickets, filter, setFilter, search, setSearch, updateTicket, stats } = useTickets();

  // Si hay búsqueda activa, navegar a la vista de tickets automáticamente
  const handleSearch = (q) => {
    setSearch(q);
    if (q && activeView !== "tickets") setActiveView("tickets");
  };

  const handleNavigate = (view) => setActiveView(view);

  const selectedTicket = tickets.find((t) => t.id === selectedId) ?? null;

  return (
    <AdminLayout
      activeView={activeView}
      onNavigate={handleNavigate}
      search={search}
      onSearch={handleSearch}
      pendingCount={stats.pending}
      dark={dark}
      onToggleDark={() => setDark((d) => !d)}
    >
      {activeView === "dashboard" && (
        <DashboardView
          stats={stats}
          tickets={tickets}
          onNavigate={handleNavigate}
          onOpenTicket={setSelectedId}
        />
      )}

      {activeView === "tickets" && (
        <TicketsView
          filteredTickets={filteredTickets}
          filter={filter}
          setFilter={setFilter}
          onOpenTicket={setSelectedId}
        />
      )}

      {activeView === "users" && (
        <PlaceholderView icon={Users} title="Vista de Usuarios"
          subtitle="Conectar con GET /api/users para cargar agentes y solicitantes" />
      )}
      {activeView === "reports" && (
        <PlaceholderView icon={BarChart3} title="Reportes"
          subtitle="Integrar Recharts o D3 con endpoint de analíticas" />
      )}
      {activeView === "config" && (
        <PlaceholderView icon={Settings} title="Configuración"
          subtitle="SLAs, categorías, notificaciones, integración SMTP / webhooks" />
      )}

      {selectedTicket && (
        <TicketDetail
          ticket={selectedTicket}
          agents={AGENTS}
          onClose={() => setSelectedId(null)}
          onSave={updateTicket}
        />
      )}
    </AdminLayout>
  );
}

function PlaceholderView({ icon: Icon, title, subtitle }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-14 text-center">
      <Icon size={36} className="mx-auto mb-3 text-gray-200 dark:text-gray-600" />
      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{title}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>
    </div>
  );
}
