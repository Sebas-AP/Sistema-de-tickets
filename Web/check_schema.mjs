import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_KEY
);

async function check() {
  const { data, error } = await supabase.from('Conversaciones').select('*').limit(1);
  console.log('Conversaciones Data:', data);
  console.log('Conversaciones Error:', error);

  const res = await supabase.from('Conversaciones').insert({ incidente_id: 1, mensaje: 'Test', Usuario_ID: 1 });
  console.log('Insert res:', res);
}

check();
