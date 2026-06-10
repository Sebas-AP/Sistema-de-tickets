import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_KEY
);

async function check() {
  const { data, error } = await supabase.from('Conversaciones').insert({ incidente_id: 14, mensaje: 'Test insert', Usuario_ID: 3 });
  console.log('Insert Data:', data);
  console.log('Insert Error:', error);
}

check();
