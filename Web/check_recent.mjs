import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_KEY
);

async function check() {
  const { data, error } = await supabase.from('Conversaciones').select('*').order('fecha_publicacion', { ascending: false }).limit(10);
  console.log('Recent Conversaciones:', data);
  console.log('Error:', error);
}

check();
