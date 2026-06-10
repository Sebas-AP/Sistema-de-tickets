import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { mapDbTicket } from "../utils/ticketUtils";

export function useTickets(agentName = null) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [filter,  setFilter]  = useState("all");
  const [agentFilter, setAgentFilter] = useState("all");
  const [search,  setSearch]  = useState("");

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        { data: ticketRows, error: tErr },
        { data: incRows },
        { data: usrRows },
        { data: agtRows },
      ] = await Promise.all([
        supabase.from("Tickets").select("*").order("Fecha", { ascending: false }),
        supabase.from("Incidentes").select("id, Categoria, Incidente, Tiempo, Agentes"),
        supabase.from("Usuarios").select("id, Usuario, Rol"),
        supabase.from("Agentes").select("id, Nombre"),
      ]);
      if (tErr) throw tErr;

      const incMap = Object.fromEntries((incRows ?? []).map(i => [i.id, i]));
      const usrMap = Object.fromEntries((usrRows ?? []).map(u => [u.id, u]));

      // agentMap from Agentes
      const agentMap = Object.fromEntries(
        (agtRows ?? []).map(a => [a.id, { Nombre: a.Nombre }])
      );

      setTickets((ticketRows ?? []).map(row => mapDbTicket(row, incMap, usrMap, agentMap)));
    } catch (err) {
      setError(err.message ?? "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
    const subscription = supabase
      .channel('tickets_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Tickets' }, () => {
        loadTickets();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [loadTickets]);

  const filteredTickets = useMemo(() => {
    let list = agentName ? tickets.filter(t => t.agent === agentName || t.requester === agentName) : tickets;
    if (agentFilter !== "all") list = list.filter(t => String(t.agentRawId) === agentFilter);
    if (filter === "urgent") list = list.filter(t => t.priority === "urgent");
    else if (filter === "all") list = list.filter(t => t.status !== "resolved");
    else list = list.filter(t => t.status === filter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.title.toLowerCase().includes(q)    ||
        t.id.toLowerCase().includes(q)        ||
        t.requester.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [tickets, filter, search, agentName, agentFilter]);

  const updateTicket = useCallback(async (formattedId, changes) => {
    const ticket = tickets.find(t => t.id === formattedId);
    if (!ticket) return;

    setTickets(prev => prev.map(t => t.id === formattedId ? { ...t, ...changes } : t));

    const dbPayload = {};
    if (changes.status     !== undefined) dbPayload.Status  = changes.status;
    if (changes.agentRawId !== undefined) dbPayload.Agente  = changes.agentRawId;
    if (changes.comment    !== undefined) dbPayload.comment = changes.comment;
    const { error: dbErr } = await supabase
      .from("Tickets")
      .update(dbPayload)
      .eq("id", ticket._id);
    if (dbErr) {
      console.error("Error al actualizar ticket:", dbErr.message);
      setTickets(prev => prev.map(t => t.id === formattedId ? ticket : t));
    }
  }, [tickets]);

  const stats = useMemo(() => {
    const base = agentName ? tickets.filter(t => t.agent === agentName || t.requester === agentName) : tickets;
    return {
      pending:  base.filter(t => t.status === "pending" || t.status === "open").length,
      resolved: base.filter(t => t.status === "resolved").length,
      urgent:   base.filter(t => t.priority === "urgent" && !["resolved", "closed"].includes(t.status)).length,
      byStatus: ["open", "pending", "resolved", "closed"].map(s => ({
        key: s, count: base.filter(t => t.status === s).length, total: base.length,
      })),
    };
  }, [tickets, agentName]);

  return { tickets, filteredTickets, filter, setFilter, agentFilter, setAgentFilter, search, setSearch, updateTicket, stats, loading, error, refresh: loadTickets };
}
