import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: itemId } = await params;
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { notes } = await request.json()

    // Update the item notes
    const { data, error } = await supabase
      .from('items')
      .update({ notes })
      .eq('id', itemId)
      .select()
      .single()

    if (error) {
      console.error('Error updating item notes:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ item: data })
  } catch (error) {
    console.error('Error in update notes API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}