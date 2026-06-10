import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_KEY
);

async function check() {
  const { data, error } = await supabase.from('Conversaciones').insert({ incidente_id: 36, mensaje: 'Test ticket 36', Usuario_ID: null });
  console.log('Insert 36 Error:', error);
}

check();
