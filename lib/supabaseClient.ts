import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
    // runtime will warn; keep strict to avoid exposing service keys
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
