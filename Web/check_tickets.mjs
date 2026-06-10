import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_KEY
);

async function check() {
  const { data, error } = await supabase.from('Tickets').select('*').order('id', { ascending: false }).limit(5);
  console.log('Recent Tickets:', data);
}

check();
