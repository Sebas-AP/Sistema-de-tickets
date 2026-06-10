import { useState } from "react";
import { X, Save, MessageSquare, Clock, CheckCircle2, Timer } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import { formatDuration } from "../../utils/ticketUtils";
import { useConversaciones } from "../../hooks/useConversaciones";

function ElapsedBlock({ rawFecha, status }) {
  const done    = status === "resolved" || status === "closed";
  const elapsed = formatDuration(rawFecha);

  // Color dinámico para tickets abiertos según antigüedad
  let barColor = "bg-[#22c55e]";
  let textColor = "text-[#22c55e]";
  let label = "Tiempo de resolución";
  let Icon  = CheckCircle2;

  if (!done) {
    label = "Tiempo abierto";
    Icon  = Timer;
    const hours = rawFecha ? (Date.now() - new Date(rawFecha)) / 3_600_000 : 0;
    if (hours < 4)       { barColor = "bg-[#888]";      textColor = "text-[#888]"; }
    else if (hours < 24) { barColor = "bg-[#b8910a]";   textColor = "text-[#b8910a]"; }
    else if (hours < 72) { barColor = "bg-[#d06020]";   textColor = "text-[#d06020]"; }
    else                 { barColor = "bg-red-400";      textColor = "text-red-400"; }
  }

  return (
    <div className={`col-span-2 rounded-lg border px-3 py-2.5 flex items-center gap-3 ${
      done
        ? "border-[#16a34a]/40 bg-[#16a34a]/10"
        : "border-[#b0a07a]/60 dark:border-[#3a3a3a] bg-[#b8a880]/30 dark:bg-[#252525]"
    }`}>
      <Icon size={16} className={`${textColor} flex-shrink-0`} />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-[#5a4a30] dark:text-[#666] uppercase tracking-widest mb-0.5">
          {label}
        </p>
        <p className={`text-lg font-semibold leading-none ${textColor}`}>{elapsed}</p>
      </div>
      {!done && rawFecha && (
        <div className="text-right flex-shrink-0">
          <p className="text-[10px] text-[#7a6a50] dark:text-[#555]">desde</p>
          <p className="text-[11px] font-medium text-[#3a2a1a] dark:text-[#aaa]">
            {new Date(rawFecha).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
      )}
      {done && rawFecha && (
        <div className="flex items-center gap-1 text-[11px] text-[#22c55e] flex-shrink-0">
          <Clock size={10} />
          <span>{new Date(rawFecha).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</span>
        </div>
      )}
    </div>
  );
}

export function TicketDetail({ ticket, agents, user, onClose, onSave, isAgent = false }) {
  const [status,  setStatus]  = useState(ticket.status);
  const [agentId, setAgentId] = useState(
    ticket.agentRawId != null ? String(ticket.agentRawId) : ""
  );
  
  const { conversaciones, loading, addConversacion } = useConversaciones(ticket?._id);
  const [newComment, setNewComment] = useState("");

  if (!ticket) return null;

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    
    const agent = agents.find(a => a.id === agentId);
    const newAgentId = isAgent ? ticket.agentRawId : (agentId ? parseInt(agentId) : null);
    
    let commentToSave = newComment.trim();
    if (ticket.status !== status) {
        const estadoNombres = { open: "En proceso", pending: "Pendiente", resolved: "Finalizado", closed: "Bloqueado" };
        commentToSave += (commentToSave ? "\n\n" : "") + `[Sistema] Estado cambiado a: ${estadoNombres[status] || status}`;
    }
    if (!isAgent && ticket.agentRawId !== newAgentId) {
        const agName = agent ? agent.name : "Sin asignar";
        commentToSave += (commentToSave ? "\n\n" : "") + `[Sistema] Ticket asignado a: ${agName}`;
    }

    try {
      if (commentToSave) {
          const res = await addConversacion(commentToSave, user?.id);
          if (res && !res.success) {
            alert("No se pudo guardar el comentario: " + (res.error || "Error de base de datos"));
            setIsSaving(false);
            return;
          }
      }

      onSave(ticket.id, {
        status,
        agent:         isAgent ? ticket.agent : (agent?.name ?? ticket.agent),
        agentInitials: isAgent ? ticket.agentInitials : (agent ? `${agent.name[0] ?? ""}` : ticket.agentInitials),
        agentRawId:    newAgentId,
      });
      onClose();
    } catch (error) {
      console.error("Error al guardar:", error);
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#c8b89a] dark:bg-[#1d1d1d] rounded-2xl w-[440px] max-h-[90vh] overflow-y-auto no-scrollbar border border-[#a09070] dark:border-[#2a2a2a] shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#b0a07a] dark:border-[#2a2a2a] flex items-start gap-3">
          <div className="flex-1">
            <p className="font-mono text-[11px] text-[#5a4a30] dark:text-[#666] mb-1">{ticket.id}</p>
            <p className="text-sm font-semibold text-[#1a1a1a] dark:text-white">{ticket.title}</p>
            <p className="text-xs text-[#5a4a30] dark:text-[#888] mt-0.5">
              {ticket.category}
              {ticket.incidenteTiempo ? ` · Tiempo estimado: ${ticket.incidenteTiempo}` : ""}
              {" · "}{ticket.created}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg border border-[#a09070] dark:border-[#3a3a3a] flex items-center justify-center text-[#5a4a30] dark:text-[#666] hover:bg-[#b0a07a] dark:hover:bg-[#2a2a2a] transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 flex flex-col gap-4">
          <div>
            <p className="text-[10px] font-bold text-[#5a4a30] dark:text-[#666] uppercase tracking-widest mb-1.5">Descripción</p>
            <p className="text-sm text-[#1a1a1a] dark:text-[#ccc] leading-relaxed">{ticket.desc || "Sin descripción."}</p>
          </div>

          <hr className="border-[#b0a07a] dark:border-[#2a2a2a]" />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-bold text-[#5a4a30] dark:text-[#666] uppercase tracking-widest mb-1">Estado actual</p>
              <StatusBadge status={ticket.status} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#5a4a30] dark:text-[#666] uppercase tracking-widest mb-1">Prioridad</p>
              <PriorityBadge priority={ticket.priority} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#5a4a30] dark:text-[#666] uppercase tracking-widest mb-1">Solicitante</p>
              <p className="text-sm text-[#1a1a1a] dark:text-[#e0d8cc]">{ticket.requester}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#5a4a30] dark:text-[#666] uppercase tracking-widest mb-1">Creado</p>
              <p className="text-sm text-[#1a1a1a] dark:text-[#e0d8cc]">{ticket.created}</p>
            </div>
            {ticket.departamento && (
              <div className="col-span-2">
                <p className="text-[10px] font-bold text-[#5a4a30] dark:text-[#666] uppercase tracking-widest mb-1">Departamento</p>
                <p className="text-sm text-[#1a1a1a] dark:text-[#e0d8cc]">{ticket.departamento}</p>
              </div>
            )}

            {/* Bloque de tiempo — ocupa las 2 columnas */}
            <ElapsedBlock rawFecha={ticket.rawFecha} status={ticket.status} />
          </div>

          <hr className="border-[#b0a07a] dark:border-[#2a2a2a]" />

          <div>
            <label className="text-[10px] font-bold text-[#5a4a30] dark:text-[#666] uppercase tracking-widest block mb-1.5">
              Cambiar estado
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full border border-[#a09070] dark:border-[#3a3a3a] rounded-lg px-3 py-2 text-sm text-[#1a1a1a] dark:text-[#e0d8cc] bg-[#d4c4a0] dark:bg-[#2a2a2a] outline-none focus:ring-2 focus:ring-[#16a34a]/30 focus:border-[#16a34a]"
            >
              <option value="open">En proceso</option>
              <option value="pending">Pendiente</option>
              <option value="resolved">Finalizado</option>
              <option value="closed">Bloqueado</option>
            </select>
          </div>

          {!isAgent && (
            <div>
              <label className="text-[10px] font-bold text-[#5a4a30] dark:text-[#666] uppercase tracking-widest block mb-1.5">
                Reasignar agente
              </label>
              <select
                value={agentId}
                onChange={e => setAgentId(e.target.value)}
                className="w-full border border-[#a09070] dark:border-[#3a3a3a] rounded-lg px-3 py-2 text-sm text-[#1a1a1a] dark:text-[#e0d8cc] bg-[#d4c4a0] dark:bg-[#2a2a2a] outline-none focus:ring-2 focus:ring-[#16a34a]/30 focus:border-[#16a34a]"
              >
                <option value="">Sin asignar</option>
                {agents.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name}{a.especialidad ? ` — ${a.especialidad}` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {isAgent && (
            <div>
              <p className="text-[10px] font-bold text-[#5a4a30] dark:text-[#666] uppercase tracking-widest mb-1">Agente asignado</p>
              <p className="text-sm text-[#1a1a1a] dark:text-[#e0d8cc]">{ticket.agent}</p>
            </div>
          )}

          <hr className="border-[#b0a07a] dark:border-[#2a2a2a]" />

          {/* Comentario — visible y editable para admin y agente */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-[#5a4a30] dark:text-[#666] uppercase tracking-widest flex items-center gap-1.5 mb-2">
              <MessageSquare size={11} /> Historial y Comentarios
            </label>
            
            <div className="flex-1 max-h-[220px] overflow-y-auto no-scrollbar mb-3 pr-2 flex flex-col gap-2">
              {loading ? (
                <p className="text-xs text-[#888]">Cargando...</p>
              ) : conversaciones.length === 0 ? (
                <p className="text-xs text-[#888] italic">No hay comentarios aún.</p>
              ) : (
                conversaciones.map(c => (
                  <div key={c.id} className="bg-[#b8a880]/30 dark:bg-[#252525] p-2.5 rounded-lg border border-[#b0a07a]/40 dark:border-[#3a3a3a]">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-[#5a4a30] dark:text-[#888]">{c.usuario}</span>
                      <span className="text-[10px] text-[#7a6a50] dark:text-[#666]">{c.fecha}</span>
                    </div>
                    <p className="text-sm text-[#1a1a1a] dark:text-[#ccc] whitespace-pre-wrap">{c.mensaje}</p>
                  </div>
                ))
              )}
            </div>

            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Añade notas internas, pasos realizados o cualquier observación…"
              rows={3}
              className="w-full border border-[#a09070] dark:border-[#3a3a3a] rounded-lg px-3 py-2 text-sm text-[#1a1a1a] dark:text-[#e0d8cc] bg-[#d4c4a0] dark:bg-[#2a2a2a] outline-none focus:ring-2 focus:ring-[#16a34a]/30 focus:border-[#16a34a] resize-none placeholder:text-[#a09070] dark:placeholder:text-[#555] leading-relaxed flex-shrink-0"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#b0a07a] dark:border-[#2a2a2a] flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-[#a09070] dark:border-[#3a3a3a] text-sm text-[#3a2a1a] dark:text-[#888] hover:bg-[#b8a880] dark:hover:bg-[#2a2a2a] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-4 py-1.5 rounded-lg text-white text-sm font-semibold transition-colors flex items-center gap-1.5 ${
              isSaving ? "bg-[#16a34a]/70 cursor-not-allowed" : "bg-[#16a34a] hover:bg-[#15803d]"
            }`}
          >
            <Save size={13} /> {isSaving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
