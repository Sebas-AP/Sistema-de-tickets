import { Inbox, Eye, Clock, CheckCircle2 } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import { formatDuration } from "../../utils/ticketUtils";

const FILTERS = [
  { key: "all",      label: "Todos" },
  { key: "open",     label: "En proceso" },
  { key: "pending",  label: "Pendientes" },
  { key: "resolved", label: "Finalizados" },
  { key: "urgent",   label: "Urgentes" },
];

// Color del badge según si está resuelto o cuánto tiempo lleva abierto
function elapsedStyle(status, rawFecha) {
  if (!rawFecha) return { cls: "text-[#7a6a50] dark:text-[#666]", Icon: Clock };
  if (status === "resolved" || status === "closed") {
    return { cls: "text-[#22c55e]", Icon: CheckCircle2 };
  }
  const hours = (Date.now() - new Date(rawFecha)) / 3_600_000;
  if (hours < 4)   return { cls: "text-[#7a6a50] dark:text-[#555]",   Icon: Clock };
  if (hours < 24)  return { cls: "text-[#b8910a]",                     Icon: Clock };
  if (hours < 72)  return { cls: "text-[#d06020]",                     Icon: Clock };
  return               { cls: "text-red-400",                          Icon: Clock };
}

export function TicketTable({ tickets, filter, setFilter, agentFilter, setAgentFilter, agents, onOpenTicket }) {
  return (
    <div className="bg-[#c8b89a] dark:bg-[#1d1d1d] rounded-xl border border-[#b0a07a] dark:border-[#2a2a2a] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#b0a07a] dark:border-[#2a2a2a] flex items-center gap-2 flex-wrap">
        <span className="text-sm font-semibold text-[#1a1a1a] dark:text-white flex-1 uppercase tracking-wide">
          Todos los tickets
        </span>
        <div className="flex gap-3 items-center">
          {agents && agents.length > 0 && (
            <select
              value={agentFilter}
              onChange={e => setAgentFilter(e.target.value)}
              className="px-3 py-1 rounded-full text-xs border border-[#a09070] dark:border-[#3a3a3a] text-[#5a4a30] dark:text-[#888] bg-[#c8b89a] dark:bg-[#1d1d1d] outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] transition-colors"
            >
              <option value="all">Todos los agentes</option>
              {agents.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          )}
          <div className="flex gap-1.5">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                filter === f.key
                  ? "bg-[#1a1a1a] border-[#16a34a] text-[#4caf50] font-semibold"
                  : "border-[#a09070] text-[#5a4a30] dark:border-[#3a3a3a] dark:text-[#888] hover:bg-[#b8a880] dark:hover:bg-[#2a2a2a]"
              }`}
            >
              {f.label}
            </button>
          ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#b0a078] dark:bg-[#252525] border-b border-[#a09070] dark:border-[#2a2a2a]">
              {["ID", "Título / Categoría", "Solicitante", "Agente", "Estado", "Prioridad", "Tiempo", ""].map((h, i) => (
                <th key={i} className="px-4 py-2.5 text-left text-[11px] font-bold text-[#2a1a0a] dark:text-[#888] uppercase tracking-widest whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-[#7a6a50] dark:text-[#666] text-sm">
                  <Inbox size={32} className="mx-auto mb-2 text-[#a09070] dark:text-[#444]" />
                  No se encontraron tickets
                </td>
              </tr>
            ) : (
              tickets.map(t => {
                const { cls, Icon } = elapsedStyle(t.status, t.rawFecha);
                return (
                  <tr
                    key={t._id}
                    onClick={() => onOpenTicket(t.id)}
                    className="border-b border-[#b8a880] dark:border-[#2a2a2a] hover:bg-[#bfae88] dark:hover:bg-[#252525] cursor-pointer transition-colors last:border-none"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-[11px] text-[#5a4a30] dark:text-[#666]">{t.id}</span>
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="text-[#1a1a1a] dark:text-[#e0d8cc] font-medium truncate">{t.title}</p>
                      <p className="text-[11px] text-[#5a4a30] dark:text-[#666] mt-0.5">{t.category}</p>
                    </td>
                    <td className="px-4 py-3 text-[#3a2a1a] dark:text-[#aaa] text-xs whitespace-nowrap">{t.requester}</td>
                    <td className="px-4 py-3 text-[#3a2a1a] dark:text-[#aaa] text-xs whitespace-nowrap">{t.agent}</td>
                    <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                    <td className="px-4 py-3"><PriorityBadge priority={t.priority} /></td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 text-[11px] font-medium whitespace-nowrap ${cls}`}>
                        <Icon size={11} />
                        {formatDuration(t.rawFecha)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={e => { e.stopPropagation(); onOpenTicket(t.id); }}
                        className="w-7 h-7 rounded-lg border border-[#a09070] dark:border-[#3a3a3a] flex items-center justify-center text-[#5a4a30] dark:text-[#666] hover:bg-[#b0a070] dark:hover:bg-[#2a2a2a] transition-colors"
                      >
                        <Eye size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
