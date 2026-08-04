import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = 'https://yimmmvjjmvivoxdepygw.supabase.co'
const supabaseKey = 'sb_publishable_-0-6BWe6rk_ZnihvucbvNg_S6cAwObJ'

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseKey)
}
