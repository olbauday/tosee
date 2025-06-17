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
    const { item_id, message } = body

    // Use service role client to bypass RLS
    const serviceSupabase = createServiceRoleClient()

    // Get the item to check inventory membership
    const { data: item, error: itemError } = await serviceSupabase
      .from('items')
      .select('inventory_id')
      .eq('id', item_id)
      .single()

    if (itemError || !item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    // Verify user is a member of this inventory
    const { data: member, error: memberError } = await serviceSupabase
      .from('inventory_members')
      .select('*')
      .eq('inventory_id', item.inventory_id)
      .eq('user_id', user.id)
      .single()

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Not authorized to comment on this item' },
        { status: 403 }
      )
    }

    // Create comment with service role
    const { data: comment, error: commentError } = await serviceSupabase
      .from('comments')
      .insert({
        item_id,
        user_id: user.id,
        message: message.trim(),
      })
      .select()
      .single()

    if (commentError) {
      console.error('Error creating comment:', commentError)
      return NextResponse.json(
        { error: commentError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ comment })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const item_id = searchParams.get('item_id')

    if (!item_id) {
      return NextResponse.json(
        { error: 'item_id is required' },
        { status: 400 }
      )
    }

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

    // Get the item to check inventory membership
    const { data: item, error: itemError } = await serviceSupabase
      .from('items')
      .select('inventory_id')
      .eq('id', item_id)
      .single()

    if (itemError || !item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    // Verify user is a member of this inventory
    const { data: member, error: memberError } = await serviceSupabase
      .from('inventory_members')
      .select('*')
      .eq('inventory_id', item.inventory_id)
      .eq('user_id', user.id)
      .single()

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Not authorized to view comments for this item' },
        { status: 403 }
      )
    }

    // Fetch comments with user info
    const { data: comments, error: commentsError } = await serviceSupabase
      .from('comments')
      .select('*')
      .eq('item_id', item_id)
      .order('created_at', { ascending: true })

    if (commentsError) {
      console.error('Error fetching comments:', commentsError)
      return NextResponse.json(
        { error: commentsError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ comments: comments || [] })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}