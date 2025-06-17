import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Test 1: Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // Test 2: Simple query
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select('id, name')
      .limit(5)
    
    // Test 3: Inventories query
    const { data: inventories, error: invError } = await supabase
      .from('inventories')
      .select('id, name')
      .limit(5)
    
    return NextResponse.json({
      auth: {
        success: !authError,
        user: user?.email,
        error: authError?.message
      },
      items: {
        success: !itemsError,
        count: items?.length || 0,
        error: itemsError?.message
      },
      inventories: {
        success: !invError,
        count: inventories?.length || 0,
        error: invError?.message
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}