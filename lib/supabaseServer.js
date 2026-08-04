import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
const supabaseUrl = 'https://yimmmvjjmvivoxdepygw.supabase.co'
const supabaseKey = 'sb_publishable_-0-6BWe6rk_ZnihvucbvNg_S6cAwObJ'
export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // called from a Server Component render — middleware handles refresh
        }
      },
    },
  })
}
