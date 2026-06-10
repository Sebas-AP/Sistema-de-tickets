import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { getInitials } from "../utils/ticketUtils";

export function useAgents() {
  const [agents, setAgents] = useState([]);
  useEffect(() => {
    supabase
      .from("Agentes")
      .select("id, Nombre, Especialidad")
      .then(({ data }) => {
        setAgents((data ?? []).map(a => ({
          id:           String(a.id),
          name:         a.Nombre,
          initials:     getInitials(a.Nombre),
          especialidad: a.Especialidad || ""
        })));
      });
  }, []);
  return agents;
}
