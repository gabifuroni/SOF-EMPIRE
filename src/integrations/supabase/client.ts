import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_PUBLIC_SUPABASE_URL!;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL) {
  throw new Error('Missing env.VITE_PUBLIC_SUPABASE_URL');
}
if (!SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('Missing env.VITE_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);