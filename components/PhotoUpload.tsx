'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Camera, Upload, X, Plus, Loader2 } from 'lucide-react'

interface PhotoUploadProps {
  inventoryId: string
  userId: string
  locations: any[]
  tags: any[]
  onClose: () => void
  onUploadComplete: (items: any[]) => void
  onLocationAdd: (location: any) => void
  onTagAdd: (tag: any) => void
}

interface UploadItem {
  id: string
  file: File
  preview: string
  name: string
  location: string
  tags: string[]
  notes: string
  uploading: boolean
  uploaded: boolean
}

export default function PhotoUpload({
  inventoryId,
  userId,
  locations,
  tags,
  onClose,
  onUploadComplete,
  onLocationAdd,
  onTagAdd,
}: PhotoUploadProps) {
  const [items, setItems] = useState<UploadItem[]>([])
  const [newLocation, setNewLocation] = useState('')
  const [newTag, setNewTag] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const newItems: UploadItem[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      name: '',
      location: locations[0]?.name || '',
      tags: [],
      notes: '',
      uploading: false,
      uploaded: false,
    }))

    setItems([...items, ...newItems])
  }

  const updateItem = (id: string, updates: Partial<UploadItem>) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ))
  }

  const removeItem = (id: string) => {
    const item = items.find(i => i.id === id)
    if (item) {
      URL.revokeObjectURL(item.preview)
    }
    setItems(items.filter(item => item.id !== id))
  }

  const addLocation = async () => {
    if (!newLocation.trim()) return

    // Check if we're in dev mode
    const devUser = localStorage.getItem('dev_user')
    if (devUser) {
      const newLoc = {
        id: `loc_${Date.now()}`,
        inventory_id: inventoryId,
        name: newLocation.trim()
      }
      onLocationAdd(newLoc)
      
      // Save to localStorage
      const existingLocations = localStorage.getItem(`dev_locations_${inventoryId}`)
      const locations = existingLocations ? JSON.parse(existingLocations) : []
      locations.push(newLoc)
      localStorage.setItem(`dev_locations_${inventoryId}`, JSON.stringify(locations))
      
      setNewLocation('')
    } else {
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inventory_id: inventoryId,
          name: newLocation.trim()
        }),
      })

      const data = await response.json()
      
      if (response.ok && data.location) {
        onLocationAdd(data.location)
        setNewLocation('')
      } else {
        console.error('Error adding location:', data.error)
      }
    }
  }

  const addTag = async () => {
    if (!newTag.trim()) return

    // Check if we're in dev mode
    const devUser = localStorage.getItem('dev_user')
    if (devUser) {
      const newT = {
        id: `tag_${Date.now()}`,
        inventory_id: inventoryId,
        name: newTag.trim()
      }
      onTagAdd(newT)
      
      // Save to localStorage
      const existingTags = localStorage.getItem(`dev_tags_${inventoryId}`)
      const tags = existingTags ? JSON.parse(existingTags) : []
      tags.push(newT)
      localStorage.setItem(`dev_tags_${inventoryId}`, JSON.stringify(tags))
      
      setNewTag('')
    } else {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inventory_id: inventoryId,
          name: newTag.trim()
        }),
      })

      const data = await response.json()
      
      if (response.ok && data.tag) {
        onTagAdd(data.tag)
        setNewTag('')
      } else {
        console.error('Error adding tag:', data.error)
      }
    }
  }

  const uploadItems = async () => {
    setUploading(true)
    const uploadedItems: any[] = []

    // Check if we're in dev mode
    const devUser = localStorage.getItem('dev_user')
    
    for (const item of items) {
      if (item.uploaded) continue

      updateItem(item.id, { uploading: true })

      if (devUser) {
        // For dev mode, create a data URL for the image
        const reader = new FileReader()
        const dataUrl = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(item.file)
        })

        // Create item for dev mode
        const itemData = {
          id: `item_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          inventory_id: inventoryId,
          image_url: dataUrl,
          name: item.name || null,
          location: item.location || null,
          notes: item.notes || null,
          created_by: userId,
          created_at: new Date().toISOString(),
          votes: [],
          item_tags: item.tags.map(tagName => {
            const tag = tags.find(t => t.name === tagName)
            return tag ? { tag_id: tag.id, tags: tag } : null
          }).filter(Boolean)
        }

        uploadedItems.push(itemData)
        updateItem(item.id, { uploading: false, uploaded: true })
      } else {
        // Original Supabase logic
        const fileName = `${userId}/${inventoryId}/${Date.now()}_${item.file.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('inventory-photos')
          .upload(fileName, item.file)

        if (uploadError) {
          console.error('Upload error:', uploadError)
          updateItem(item.id, { uploading: false })
          continue
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('inventory-photos')
          .getPublicUrl(fileName)

        // Create item in database via API route
        const tagIds = tags
          .filter(t => item.tags.includes(t.name))
          .map(t => t.id)

        const response = await fetch('/api/items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inventory_id: inventoryId,
            image_url: publicUrl,
            name: item.name,
            location: item.location,
            notes: item.notes,
            tags: tagIds
          }),
        })

        const data = await response.json()

        if (response.ok && data.item) {
          uploadedItems.push(data.item)
          updateItem(item.id, { uploading: false, uploaded: true })
        } else {
          console.error('Error creating item:', data.error)
          updateItem(item.id, { uploading: false })
        }
      }
    }

    setUploading(false)
    if (uploadedItems.length > 0) {
      onUploadComplete(uploadedItems)
      
      // Save to localStorage if in dev mode
      if (devUser) {
        const existingItems = localStorage.getItem(`dev_items_${inventoryId}`)
        const items = existingItems ? JSON.parse(existingItems) : []
        const updatedItems = [...uploadedItems, ...items]
        localStorage.setItem(`dev_items_${inventoryId}`, JSON.stringify(updatedItems))
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg lg:max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Add Items</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Upload buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Take Photo
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 border border-gray-300 py-3 px-4 rounded-md hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Upload Files
            </button>
          </div>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />

          {/* Location and Tag management */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Locations
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addLocation()}
                  placeholder="Add new location"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <button
                  onClick={addLocation}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTag()}
                  placeholder="Add new tag"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <button
                  onClick={addTag}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Items list */}
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="border rounded-lg p-4">
                <div className="flex gap-4">
                  <img
                    src={item.preview}
                    alt=""
                    className="w-20 h-20 lg:w-24 lg:h-24 object-cover rounded"
                  />
                  
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(item.id, { name: e.target.value })}
                        placeholder="Item name (optional)"
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full"
                        disabled={item.uploading || item.uploaded}
                      />
                      
                      <select
                        value={item.location}
                        onChange={(e) => updateItem(item.id, { location: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full"
                        disabled={item.uploading || item.uploaded}
                      >
                        <option value="">No location</option>
                        {locations.map(loc => (
                          <option key={loc.id} value={loc.name}>{loc.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {tags.map(tag => (
                        <button
                          key={tag.id}
                          onClick={() => {
                            const currentTags = item.tags.includes(tag.name)
                              ? item.tags.filter(t => t !== tag.name)
                              : [...item.tags, tag.name]
                            updateItem(item.id, { tags: currentTags })
                          }}
                          disabled={item.uploading || item.uploaded}
                          className={`px-2 py-1 rounded-full text-xs transition ${
                            item.tags.includes(tag.name)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          } ${(item.uploading || item.uploaded) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>

                    <textarea
                      value={item.notes}
                      onChange={(e) => updateItem(item.id, { notes: e.target.value })}
                      placeholder="Notes (optional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      rows={2}
                      disabled={item.uploading || item.uploaded}
                    />
                  </div>

                  <div className="flex items-start">
                    {item.uploading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    ) : item.uploaded ? (
                      <span className="text-green-600 text-sm">Uploaded</span>
                    ) : (
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-500 hover:text-red-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={uploadItems}
              disabled={items.length === 0 || uploading || items.every(i => i.uploaded)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
              Upload {items.filter(i => !i.uploaded).length} Item{items.filter(i => !i.uploaded).length !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}