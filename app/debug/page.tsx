'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DebugPage() {
  const [devUser, setDevUser] = useState<any>(null)
  const [devInventories, setDevInventories] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    // Load dev data
    const user = localStorage.getItem('dev_user')
    const inventories = localStorage.getItem('dev_inventories')
    
    if (user) setDevUser(JSON.parse(user))
    if (inventories) setDevInventories(JSON.parse(inventories))
  }, [])

  const createTestInventory = () => {
    const newInventory = {
      id: `inv_${Date.now()}`,
      name: 'Test Inventory',
      share_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      created_by: devUser?.id || 'dev-user-123',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      inventory_members: [{
        user_id: devUser?.id || 'dev-user-123',
        role: 'owner',
        joined_at: new Date().toISOString()
      }]
    }

    const existingInventories = devInventories || []
    const updatedInventories = [...existingInventories, newInventory]
    
    localStorage.setItem('dev_inventories', JSON.stringify(updatedInventories))
    setDevInventories(updatedInventories)
    
    alert(`Created inventory with share code: ${newInventory.share_code}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Page - Dev Mode Data</h1>
        
        <div className="bg-white rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Dev User</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
            {JSON.stringify(devUser, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Dev Inventories ({devInventories.length})</h2>
          {devInventories.map((inv, index) => (
            <div key={inv.id} className="mb-4 p-4 bg-gray-50 rounded">
              <p className="font-semibold">{index + 1}. {inv.name}</p>
              <p className="text-sm text-gray-600">ID: {inv.id}</p>
              <p className="text-sm font-mono bg-amber-100 inline-block px-2 py-1 rounded mt-1">
                Share Code: {inv.share_code}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Members: {inv.inventory_members?.length || 0}
              </p>
            </div>
          ))}
          
          <button
            onClick={createTestInventory}
            className="mt-4 bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600"
          >
            Create Test Inventory
          </button>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Back to Dashboard
          </button>
          
          <button
            onClick={() => {
              localStorage.clear()
              router.push('/')
            }}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Clear All Dev Data
          </button>
        </div>
      </div>
    </div>
  )
}