import { createClient } from '@supabase/supabase-js';

// WARNING: DO NOT use a Service Role Key on the client. 
// It allows full, unrestricted access to your database.
// Only use the VITE_SUPABASE_ANON_KEY here.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
