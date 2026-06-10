import { useState, useMemo } from "react";
import { Inbox, ChevronDown, ChevronUp, Clock, Eye } from "lucide-react";

const STATUS_CONFIG = [
  { key: "open",     label: "En proceso", bar: "bg-[#d63384]", chip: "bg-[#d63384]/20 text-[#d63384]" },
  { key: "pending",  label: "Pendientes", bar: "bg-[#b8910a]", chip: "bg-[#b8910a]/20 text-[#b8910a]" },
  { key: "resolved", label: "Resueltos",  bar: "bg-[#16a34a]", chip: "bg-[#16a34a]/20 text-[#22c55e]" },
  { key: "closed",   label: "Bloqueados", bar: "bg-[#cc3333]", chip: "bg-[#cc3333]/20 text-[#f87171]" },
];

function Chip({ label, value, colorClass, isActive, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center px-2 py-1.5 rounded-lg flex-1 min-w-0 transition-all ${
        isActive ? 'ring-2 ring-white/40 shadow-md scale-105' : 'hover:brightness-110 hover:scale-105 opacity-80 hover:opacity-100'
      } ${colorClass}`}
    >
      <span className="text-base font-bold leading-none">{value}</span>
      <span className="text-[9px] uppercase tracking-wide mt-0.5 text-center leading-tight">{label}</span>
    </button>
  );
}

function AgentCard({ agent, onOpenTicket }) {
  const [statusFilter, setStatusFilter] = useState(null);
  const [timeFilter, setTimeFilter] = useState("all");

  const isExpanded = statusFilter !== null;
  const max = Math.max(agent.total, 1);

  const filteredTickets = useMemo(() => {
    if (!agent.assignedTickets) return [];
    
    let list = agent.assignedTickets;
    
    if (statusFilter === "urgent") {
      list = list.filter(t => t.priority === "urgent" && !["resolved", "closed"].includes(t.status));
    } else if (statusFilter) {
      list = list.filter(t => t.status === statusFilter);
    }
    
    if (timeFilter !== "all") {
      const now = new Date();
      list = list.filter(t => {
        if (!t.rawFecha) return false;
        const tDate = new Date(t.rawFecha);
        if (timeFilter === "today") return tDate.toDateString() === now.toDateString();
        if (timeFilter === "week") return Math.ceil(Math.abs(now - tDate) / 86400000) <= 7;
        if (timeFilter === "month") return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
        return true;
      });
    }
    
    return list;
  }, [agent.assignedTickets, timeFilter, statusFilter]);

  const handleStatusClick = (status) => {
    setStatusFilter(prev => prev === status ? null : status);
  };

  return (
    <div className="bg-[#c8b89a] dark:bg-[#1d1d1d] rounded-xl border border-[#b0a07a] dark:border-[#2a2a2a] p-4 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-full bg-[#16a34a] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
          {agent.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#1a1a1a] dark:text-white truncate">{agent.name}</p>
          {agent.especialidad ? (
            <p className="text-[11px] text-[#5a4a30] dark:text-[#888] truncate">{agent.especialidad}</p>
          ) : (
            <p className="text-[11px] text-[#a09070] dark:text-[#555] italic">Sin especialidad</p>
          )}
        </div>
        <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
          <div>
            <p className="text-2xl font-medium text-[#1a1a1a] dark:text-white leading-none">{agent.total}</p>
            <p className="text-[10px] text-[#7a6a50] dark:text-[#666] mt-0.5">tickets</p>
          </div>
        </div>
      </div>

      {/* Status chips */}
      <div className="flex gap-1.5 mb-4">
        {STATUS_CONFIG.map(s => (
          <Chip
            key={s.key}
            label={s.label}
            value={agent.byStatus[s.key]}
            colorClass={s.chip}
            isActive={statusFilter === s.key}
            onClick={() => handleStatusClick(s.key)}
          />
        ))}
        {agent.urgent > 0 && (
          <Chip 
            label="Urgentes" 
            value={agent.urgent} 
            colorClass="bg-red-500/20 text-red-400" 
            isActive={statusFilter === "urgent"}
            onClick={() => handleStatusClick("urgent")}
          />
        )}
      </div>

      {/* Distribution bars */}
      {agent.total > 0 ? (
        <div className="flex flex-col gap-1.5">
          {STATUS_CONFIG.filter(s => agent.byStatus[s.key] > 0).map(s => {
            const pct = Math.round((agent.byStatus[s.key] / max) * 100);
            return (
              <div key={s.key}>
                <div className="flex justify-between mb-0.5">
                  <span className="text-[10px] text-[#5a4a30] dark:text-[#666]">{s.label}</span>
                  <span className="text-[10px] font-bold text-[#1a1a1a] dark:text-[#e0d8cc]">
                    {agent.byStatus[s.key]}
                    <span className="font-normal text-[#7a6a50] dark:text-[#666]"> ({pct}%)</span>
                  </span>
                </div>
                <div className="h-1.5 bg-[#a09070] dark:bg-[#333] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${s.bar} transition-all duration-500`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-[#7a6a50] dark:text-[#555] text-center py-1 italic">Sin tickets asignados</p>
      )}

      {/* Expanded Tickets List */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-[#b0a07a] dark:border-[#2a2a2a] flex-1 flex flex-col min-h-[200px]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[11px] font-bold text-[#1a1a1a] dark:text-[#e0d8cc] uppercase tracking-widest">Tickets asignados</span>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-2 py-1 rounded border border-[#a09070] dark:border-[#3a3a3a] text-[10px] text-[#5a4a30] dark:text-[#888] bg-[#c8b89a] dark:bg-[#1d1d1d] outline-none focus:border-[#16a34a]"
            >
              <option value="all">Todos</option>
              <option value="today">Hoy</option>
              <option value="week">Últimos 7 días</option>
              <option value="month">Este mes</option>
            </select>
          </div>
          
          <div className="flex-1 overflow-y-auto no-scrollbar pr-1 space-y-2 max-h-[250px]">
            {filteredTickets.length === 0 ? (
              <p className="text-xs text-[#7a6a50] dark:text-[#666] text-center py-4">No hay tickets para este período</p>
            ) : (
              filteredTickets.map(t => (
                <div key={t.id} className="bg-[#bfae88] dark:bg-[#252525] rounded-lg p-2.5 flex items-center justify-between gap-2 border border-[#b0a07a] dark:border-[#333]">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-[9px] text-[#5a4a30] dark:text-[#888]">{t.id}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                        t.status === 'open' ? 'bg-[#d63384]/20 text-[#d63384]' :
                        t.status === 'pending' ? 'bg-[#b8910a]/20 text-[#b8910a]' :
                        t.status === 'resolved' ? 'bg-[#16a34a]/20 text-[#22c55e]' :
                        'bg-[#cc3333]/20 text-[#f87171]'
                      }`}>
                        {STATUS_CONFIG.find(s => s.key === t.status)?.label || t.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[#1a1a1a] dark:text-white truncate">{t.title}</p>
                    <div className="flex items-center gap-1 mt-1 text-[#5a4a30] dark:text-[#666]">
                      <Clock size={10} />
                      <span className="text-[9px]">{t.created}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenTicket(t.id)}
                    className="w-7 h-7 flex-shrink-0 rounded-lg border border-[#a09070] dark:border-[#3a3a3a] flex items-center justify-center text-[#5a4a30] dark:text-[#888] hover:bg-[#c8b89a] dark:hover:bg-[#1d1d1d] transition-colors"
                  >
                    <Eye size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function AgentsView({ agents, tickets, onOpenTicket }) {
  const agentStats = useMemo(() => (
    agents.map(agent => {
      const rawId = parseInt(agent.id);
      const mine  = tickets.filter(t => t.agentRawId === rawId);
      const byStatus = Object.fromEntries(
        STATUS_CONFIG.map(s => [s.key, mine.filter(t => t.status === s.key).length])
      );
      return {
        ...agent,
        total:  mine.length,
        urgent: mine.filter(t => t.priority === "urgent" && !["resolved", "closed"].includes(t.status)).length,
        byStatus,
        assignedTickets: mine,
      };
    }).sort((a, b) => b.total - a.total)
  ), [agents, tickets]);

  const totalAssigned = agentStats.reduce((s, a) => s + a.total, 0);

  if (agents.length === 0) {
    return (
      <div className="bg-[#c8b89a] dark:bg-[#1d1d1d] rounded-xl border border-[#b0a07a] dark:border-[#2a2a2a] p-14 text-center">
        <Inbox size={36} className="mx-auto mb-3 text-[#a09070] dark:text-[#3a3a3a]" />
        <p className="text-sm font-semibold text-[#1a1a1a] dark:text-white mb-1">Sin agentes registrados</p>
        <p className="text-xs text-[#5a4a30] dark:text-[#666]">Agrega agentes en la tabla Agentes de Supabase</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Summary header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base font-semibold text-[#1a1a1a] dark:text-white">Agentes de soporte</p>
          <p className="text-xs text-[#7a6a50] dark:text-[#888] mt-0.5">
            {agentStats.length} agente{agentStats.length !== 1 ? "s" : ""} · {totalAssigned} ticket{totalAssigned !== 1 ? "s" : ""} asignados
          </p>
        </div>
        <div className="flex gap-3">
          {STATUS_CONFIG.map(s => {
            const total = agentStats.reduce((sum, a) => sum + a.byStatus[s.key], 0);
            return total > 0 ? (
              <div key={s.key} className="text-center">
                <p className="text-lg font-medium text-[#1a1a1a] dark:text-white leading-none">{total}</p>
                <p className="text-[10px] text-[#7a6a50] dark:text-[#666] mt-0.5">{s.label}</p>
              </div>
            ) : null;
          })}
        </div>
      </div>

      {/* Agent cards grid */}
      <div className="grid grid-cols-2 gap-3 items-start">
        {agentStats.map(a => <AgentCard key={a.id} agent={a} onOpenTicket={onOpenTicket} />)}
      </div>
    </div>
  );
}
