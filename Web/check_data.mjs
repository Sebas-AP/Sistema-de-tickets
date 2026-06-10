import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_KEY
);

async function check() {
  const { data: convData } = await supabase.from('Conversaciones').select('*').limit(2);
  console.log('Conversaciones Data:', convData);

  const { data: ticketData } = await supabase.from('Tickets').select('id, "Incidente_ID"').limit(5);
  console.log('Tickets Data:', ticketData);

  const { data: incData } = await supabase.from('Incidentes').select('id').limit(5);
  console.log('Incidentes Data:', incData);
}

check();
