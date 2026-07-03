import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  ''

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are not set. Set them in .env.local (frontend) or .env (Vercel).'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

export type SupabaseClient = typeof supabase
