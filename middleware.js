import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
const supabaseUrl = 'https://yimmmvjjmvivoxdepygw.supabase.co'
const supabaseKey = 'sb_publishable_-0-6BWe6rk_ZnihvucbvNg_S6cAwObJ'
export async function middleware(request) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })
  await supabase.auth.getUser()
  return response
}
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
