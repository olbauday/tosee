import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Use regular client to check authentication
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Use service role client to bypass RLS
    const serviceSupabase = createServiceRoleClient()

    // First get inventories created by the user
    const { data: createdInventories, error: createdError } = await serviceSupabase
      .from('inventories')
      .select('*, inventory_members(*)')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })

    if (createdError) {
      console.error('Error fetching created inventories:', createdError)
    }

    // Then get inventories where user is a member but not creator
    const { data: memberInventories, error: memberError } = await serviceSupabase
      .from('inventory_members')
      .select(`
        inventory_id,
        inventories (
          *,
          inventory_members (*)
        )
      `)
      .eq('user_id', user.id)
      .order('joined_at', { ascending: false })

    if (memberError) {
      console.error('Error fetching member inventories:', memberError)
    }

    // Combine and deduplicate inventories
    const allInventories = [...(createdInventories || [])]
    
    if (memberInventories) {
      memberInventories.forEach((item: any) => {
        const inventory = item.inventories
        if (inventory && !allInventories.find(inv => inv.id === inventory.id)) {
          allInventories.push(inventory)
        }
      })
    }

    // Sort by created_at
    allInventories.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return NextResponse.json({ inventories: allInventories })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}