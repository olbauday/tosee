import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    // Get all inventories the user has access to
    const { data: inventories, error } = await supabase
      .from('inventories')
      .select('id, name, share_code, created_by, created_at')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching inventories:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ 
      user_id: user.id,
      inventories: inventories || [],
      count: inventories?.length || 0
    })
    
  } catch (error: any) {
    console.error('Error in debug endpoint:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}