import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getGameItems } from '@/lib/supabase/game-service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ inventoryId: string }> }
) {
  const { inventoryId } = await params;
  try {
    console.log('Simple game items API called with inventoryId:', inventoryId)
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For now, let's try a direct query (this will only work if RLS is disabled)
    const { data: items, error } = await supabase
      .from('items')
      .select('*')
      .eq('inventory_id', inventoryId)
    
    console.log('Items query result:', { 
      itemCount: items?.length, 
      error,
      sampleItem: items?.[0]
    })
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ 
        items: [],
        totalItems: 0,
        decidedCount: 0,
        error: error.message,
        warning: 'Database error - check if RLS is disabled'
      })
    }
    
    return NextResponse.json({ 
      items: items || [],
      totalItems: items?.length || 0,
      decidedCount: 0
    })
  } catch (error) {
    console.error('Error in simple game items API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}