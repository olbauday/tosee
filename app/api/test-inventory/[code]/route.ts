import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params
    
    // Use server client
    const supabase = await createClient()
    
    // First, check if any inventories exist at all
    const { data: allInventories, error: allError } = await supabase
      .from('inventories')
      .select('id, name, share_code')
      .limit(10)
    
    console.log('All inventories:', allInventories, 'Error:', allError)
    
    // Then try to find the specific one
    const { data: inventory, error } = await supabase
      .from('inventories')
      .select('*')
      .eq('share_code', code)
      .single()
    
    if (error) {
      return NextResponse.json({ 
        error: error.message,
        code: error.code,
        details: error.details,
        allInventories: allInventories || []
      }, { status: 400 })
    }
    
    // Get members count
    const { count } = await supabase
      .from('inventory_members')
      .select('*', { count: 'exact', head: true })
      .eq('inventory_id', inventory.id)
    
    return NextResponse.json({ 
      inventory,
      memberCount: count,
      allInventories: allInventories || []
    })
    
  } catch (error: any) {
    console.error('Test endpoint error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}