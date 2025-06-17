import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
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

    // Get request body
    const body = await request.json()
    const { 
      inventory_id, 
      image_url, 
      name, 
      location, 
      notes,
      tags // array of tag IDs
    } = body

    // Use service role client to bypass RLS
    const serviceSupabase = createServiceRoleClient()

    // Verify user is a member of this inventory
    const { data: member, error: memberError } = await serviceSupabase
      .from('inventory_members')
      .select('*')
      .eq('inventory_id', inventory_id)
      .eq('user_id', user.id)
      .single()

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Not authorized to add items to this inventory' },
        { status: 403 }
      )
    }

    // Create item with service role
    const { data: item, error: itemError } = await serviceSupabase
      .from('items')
      .insert({
        inventory_id,
        image_url,
        name: name || null,
        location: location || null,
        notes: notes || null,
        created_by: user.id,
      })
      .select()
      .single()

    if (itemError) {
      console.error('Error creating item:', itemError)
      return NextResponse.json(
        { error: itemError.message },
        { status: 400 }
      )
    }

    // Add tags if provided
    if (item && tags && tags.length > 0) {
      const tagInserts = tags.map((tagId: string) => ({
        item_id: item.id,
        tag_id: tagId
      }))

      const { error: tagError } = await serviceSupabase
        .from('item_tags')
        .insert(tagInserts)

      if (tagError) {
        console.error('Error adding tags:', tagError)
      }

      // Fetch the tags for the response
      const { data: itemTags } = await serviceSupabase
        .from('tags')
        .select('*')
        .in('id', tags)

      item.item_tags = tags.map((tagId: string) => ({
        tag_id: tagId,
        tags: itemTags?.find(t => t.id === tagId)
      }))
    }

    // Add empty votes array for consistency
    item.votes = []

    return NextResponse.json({ item })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}