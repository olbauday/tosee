import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all containers for the user with location info
    const { data: containers, error } = await supabase
      .from('containers')
      .select(`
        *,
        locations!location_id (
          id,
          name
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Format the response
    const formattedContainers = containers.map(container => ({
      ...container,
      location_name: container.locations?.name || null
    }))

    return NextResponse.json({ containers: formattedContainers })
  } catch (error) {
    console.error('Error fetching containers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, location_id, color, icon } = body

    // Create new container
    const { data: container, error } = await supabase
      .from('containers')
      .insert({
        user_id: user.id,
        name,
        description,
        location_id,
        color,
        icon
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ container })
  } catch (error) {
    console.error('Error creating container:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}