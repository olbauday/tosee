import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: itemId } = await params

    // Use service role client to bypass RLS
    const serviceSupabase = createServiceRoleClient()

    // Get the item to check inventory membership and ownership
    const { data: item, error: itemError } = await serviceSupabase
      .from('items')
      .select('inventory_id, created_by, image_url')
      .eq('id', itemId)
      .single()

    if (itemError || !item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    // Verify user is the creator or an owner of the inventory
    const { data: member, error: memberError } = await serviceSupabase
      .from('inventory_members')
      .select('role')
      .eq('inventory_id', item.inventory_id)
      .eq('user_id', user.id)
      .single()

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Not authorized to delete this item' },
        { status: 403 }
      )
    }

    // Only allow deletion if user created the item or is an owner
    if (item.created_by !== user.id && member.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only the item creator or inventory owner can delete items' },
        { status: 403 }
      )
    }

    // Delete associated records first
    // Delete votes
    await serviceSupabase
      .from('votes')
      .delete()
      .eq('item_id', itemId)

    // Delete comments
    await serviceSupabase
      .from('comments')
      .delete()
      .eq('item_id', itemId)

    // Delete item tags
    await serviceSupabase
      .from('item_tags')
      .delete()
      .eq('item_id', itemId)

    // Delete the item
    const { error: deleteError } = await serviceSupabase
      .from('items')
      .delete()
      .eq('id', itemId)

    if (deleteError) {
      console.error('Error deleting item:', deleteError)
      return NextResponse.json(
        { error: deleteError.message },
        { status: 400 }
      )
    }

    // Try to delete the image from storage if it's a Supabase URL
    if (item.image_url && item.image_url.includes('supabase.co/storage')) {
      const urlParts = item.image_url.split('/storage/v1/object/public/inventory-photos/')
      if (urlParts[1]) {
        await supabase.storage
          .from('inventory-photos')
          .remove([urlParts[1]])
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}