import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useConversaciones(ticketId) {
  const [conversaciones, setConversaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadConversaciones = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("Conversaciones")
        .select(`
          id,
          mensaje,
          fecha_publicacion,
          Usuario_ID,
          Usuarios (
            Usuario
          )
        `)
        .eq("incidente_id", ticketId)
        .order("fecha_publicacion", { ascending: true });

      if (err) throw err;

      setConversaciones(data.map(c => ({
        id: c.id,
        mensaje: c.mensaje,
        fecha: new Date(c.fecha_publicacion).toLocaleString("es-ES"),
        usuario: c.Usuarios?.Usuario || "Sistema",
      })));
    } catch (err) {
      console.error("Error cargando conversaciones:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    loadConversaciones();
  }, [loadConversaciones]);

  const addConversacion = async (mensaje, usuarioId) => {
    try {
      const { error: err } = await supabase
        .from("Conversaciones")
        .insert({
          incidente_id: ticketId,
          mensaje,
          Usuario_ID: usuarioId || null
        });
      
      if (err) throw err;
      await loadConversaciones();
      return { success: true };
    } catch (err) {
      console.error("Error al añadir conversación:", err);
      return { success: false, error: err.message };
    }
  };

  return { conversaciones, loading, error, addConversacion };
}
