import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'
  const error = requestUrl.searchParams.get('error')
  const error_description = requestUrl.searchParams.get('error_description')

  // Handle error cases from Supabase
  if (error) {
    console.error('Auth error:', error, error_description)
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/error?error=${error}&description=${encodeURIComponent(error_description || '')}`
    )
  }

  if (code) {
    const supabase = await createClient()
    
    // For email magic links, the code is the actual session token
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!sessionError) {
      // URL to redirect to after sign in process completes
      return NextResponse.redirect(`${requestUrl.origin}${next}`)
    }

    // If the standard flow didn't work, it might be a different type of auth
    console.error('Session error:', sessionError)
  }

  // Return to error page
  return NextResponse.redirect(`${requestUrl.origin}/auth/error`)
}