'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Check, XCircle, HelpCircle, Trash2, Send, User } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { cn } from '@/lib/utils'

interface ItemDetailProps {
  item: any
  user: SupabaseUser
  inventory: any
  onClose: () => void
  onUpdate: (item: any) => void
  onDelete: (itemId: string) => void
}

export default function ItemDetail({
  item,
  user,
  inventory,
  onClose,
  onUpdate,
  onDelete,
}: ItemDetailProps) {
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState<any[]>([])
  const [loadingComments, setLoadingComments] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const supabase = createClient()

  // Load comments
  useState(() => {
    const loadComments = async () => {
      // Check if we're in dev mode
      const devUser = localStorage.getItem('dev_user')
      if (devUser) {
        // Load comments from localStorage for dev mode
        const devComments = localStorage.getItem(`dev_comments_${item.id}`)
        if (devComments) {
          setComments(JSON.parse(devComments))
        }
        setLoadingComments(false)
      } else {
        try {
          const response = await fetch(`/api/comments?item_id=${item.id}`)
          if (response.ok) {
            const { comments } = await response.json()
            // Add user email for display (we'll need to update the API to include this)
            const commentsWithUser = comments.map((c: any) => ({
              ...c,
              user: { email: user.id === c.user_id ? user.email : 'Other User' }
            }))
            setComments(commentsWithUser)
          }
        } catch (error) {
          console.error('Error loading comments:', error)
        }
        setLoadingComments(false)
      }
    }
    loadComments()
  })

  const handleVote = async (vote: 'keep' | 'toss' | 'maybe') => {
    // Check if we're in dev mode
    const devUser = localStorage.getItem('dev_user')
    if (devUser) {
      // Update item with new vote for dev mode
      const existingVotes = item.votes.filter((v: any) => v.user_id !== user.id)
      const updatedItem = { 
        ...item, 
        votes: [...existingVotes, { user_id: user.id, vote }] 
      }
      onUpdate(updatedItem)
      
      // Update localStorage
      const devItems = localStorage.getItem(`dev_items_${item.inventory_id}`)
      if (devItems) {
        const items = JSON.parse(devItems)
        const itemIndex = items.findIndex((i: any) => i.id === item.id)
        if (itemIndex !== -1) {
          items[itemIndex] = updatedItem
          localStorage.setItem(`dev_items_${item.inventory_id}`, JSON.stringify(items))
        }
      }
    } else {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item_id: item.id,
          vote: vote,
        }),
      })

      if (response.ok) {
        // Update item with new vote
        const existingVotes = item.votes.filter((v: any) => v.user_id !== user.id)
        const updatedItem = { 
          ...item, 
          votes: [...existingVotes, { user_id: user.id, vote }] 
        }
        onUpdate(updatedItem)
      } else {
        const data = await response.json()
        console.error('Error voting:', data.error)
      }
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return

    // Check if we're in dev mode
    const devUser = localStorage.getItem('dev_user')
    if (devUser) {
      const parsedUser = JSON.parse(devUser)
      const newComment = {
        id: `comment_${Date.now()}`,
        item_id: item.id,
        user_id: user.id,
        message: comment.trim(),
        created_at: new Date().toISOString(),
        user: { email: parsedUser.email }
      }
      const updatedComments = [...comments, newComment]
      setComments(updatedComments)
      setComment('')
      
      // Save to localStorage
      localStorage.setItem(`dev_comments_${item.id}`, JSON.stringify(updatedComments))
    } else {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item_id: item.id,
          message: comment.trim(),
        }),
      })

      if (response.ok) {
        const { comment: newComment } = await response.json()
        // Add user email for display
        newComment.user = { email: user.email }
        setComments([...comments, newComment])
        setComment('')
      } else {
        const data = await response.json()
        console.error('Error adding comment:', data.error)
      }
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this item?')) return
    
    setDeleting(true)
    
    // Check if we're in dev mode
    const devUser = localStorage.getItem('dev_user')
    if (devUser) {
      // Delete from localStorage
      const devItems = localStorage.getItem(`dev_items_${item.inventory_id}`)
      if (devItems) {
        const items = JSON.parse(devItems)
        const filteredItems = items.filter((i: any) => i.id !== item.id)
        localStorage.setItem(`dev_items_${item.inventory_id}`, JSON.stringify(filteredItems))
      }
      
      // Delete comments
      localStorage.removeItem(`dev_comments_${item.id}`)
      
      onDelete(item.id)
    } else {
      const response = await fetch(`/api/items/${item.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onDelete(item.id)
      } else {
        const data = await response.json()
        console.error('Error deleting item:', data.error)
        alert(data.error || 'Failed to delete item')
      }
    }
    setDeleting(false)
  }

  const getUserVote = (userId: string) => {
    const vote = item.votes.find((v: any) => v.user_id === userId)
    return vote?.vote || null
  }

  const voteIcons = {
    keep: { icon: Check, color: 'text-green-600' },
    toss: { icon: XCircle, color: 'text-red-600' },
    maybe: { icon: HelpCircle, color: 'text-yellow-600' },
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg lg:max-w-5xl max-h-[90vh] overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Image side */}
          <div className="w-full lg:w-1/2 bg-gray-100 h-64 lg:h-auto">
            <img
              src={item.image_url}
              alt={item.name || 'Item'}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Details side */}
          <div className="w-full lg:w-1/2 flex flex-col">
            <div className="p-4 lg:p-6 border-b">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    {item.name || 'Unnamed Item'}
                  </h2>
                  {item.location && (
                    <p className="text-gray-600 mt-1">{item.location}</p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {item.notes && (
                <p className="mt-4 text-gray-700">{item.notes}</p>
              )}

              {item.item_tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {item.item_tags.map((it: any) => (
                    <span key={it.tag_id} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">
                      {it.tags?.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Voting section */}
            <div className="p-4 lg:p-6 border-b">
              <h3 className="font-semibold mb-4">Votes</h3>
              
              <div className="space-y-3">
                {inventory.inventory_members?.map((member: any) => {
                  const vote = getUserVote(member.user_id)
                  const VoteIcon = vote && vote in voteIcons ? voteIcons[vote as keyof typeof voteIcons].icon : User
                  const color = vote && vote in voteIcons ? voteIcons[vote as keyof typeof voteIcons].color : 'text-gray-400'
                  
                  return (
                    <div key={member.user_id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <VoteIcon className={cn("w-5 h-5", color)} />
                        <span className="text-sm">
                          {member.user_id === user.id ? 'You' : 'Partner'}
                        </span>
                      </div>
                      
                      {member.user_id === user.id && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleVote('keep')}
                            className={cn(
                              "p-2 rounded transition",
                              vote === 'keep' 
                                ? 'bg-green-100 text-green-600' 
                                : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                            )}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleVote('toss')}
                            className={cn(
                              "p-2 rounded transition",
                              vote === 'toss' 
                                ? 'bg-red-100 text-red-600' 
                                : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                            )}
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleVote('maybe')}
                            className={cn(
                              "p-2 rounded transition",
                              vote === 'maybe' 
                                ? 'bg-yellow-100 text-yellow-600' 
                                : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                            )}
                          >
                            <HelpCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Comments section */}
            <div className="flex-1 overflow-y-auto p-6">
              <h3 className="font-semibold mb-4">Discussion</h3>
              
              {loadingComments ? (
                <p className="text-gray-500">Loading comments...</p>
              ) : comments.length === 0 ? (
                <p className="text-gray-500">No comments yet</p>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">
                          {comment.user_id === user.id ? 'You' : 'Partner'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{comment.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Comment form */}
            <form onSubmit={handleComment} className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Delete button */}
            {item.created_by === user.id && (
              <div className="p-4 border-t">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-red-600 hover:text-red-700 flex items-center gap-2 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  {deleting ? 'Deleting...' : 'Delete Item'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}