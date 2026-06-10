import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
const supabaseUrl = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const supabaseKey = env.match(/VITE_SUPABASE_KEY=(.*)/)[1].trim();
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: users } = await supabase.from('Usuarios').select('id, Usuario');
  console.log("Usuarios:", users);
  
  const { data: agents } = await supabase.from('Agentes').select('id, Nombre');
  console.log("Agentes:", agents);
}
check();
