import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'           // Paste from your Supabase dashboard (Project Settings > API)
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'  // Paste from your Supabase dashboard

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
