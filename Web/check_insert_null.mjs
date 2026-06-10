import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_KEY
);

async function check() {
  const { data, error } = await supabase.from('Conversaciones').insert({ incidente_id: 14, mensaje: 'Test null', Usuario_ID: null });
  console.log('Insert Null User Data:', data);
  console.log('Insert Null User Error:', error);
}

check();
