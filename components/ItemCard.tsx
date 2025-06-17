'use client'

import { Check, X, HelpCircle, MapPin, MessageCircle, Heart, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ItemCardProps {
  item: any
  userVote: 'keep' | 'toss' | 'maybe' | null
  status: 'pending' | 'keep' | 'toss' | 'discuss'
  viewMode: 'grid' | 'list'
  onVote: (vote: 'keep' | 'toss' | 'maybe') => void
  onClick: () => void
}

export default function ItemCard({ 
  item, 
  userVote, 
  status, 
  viewMode, 
  onVote, 
  onClick 
}: ItemCardProps) {
  const statusStyles = {
    pending: {
      border: 'border-gray-200',
      bg: '',
      badge: ''
    },
    keep: {
      border: 'border-green-400',
      bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
      badge: 'bg-green-500'
    },
    toss: {
      border: 'border-red-400',
      bg: 'bg-gradient-to-br from-red-50 to-pink-50',
      badge: 'bg-red-500'
    },
    discuss: {
      border: 'border-yellow-400',
      bg: 'bg-gradient-to-br from-yellow-50 to-amber-50',
      badge: 'bg-yellow-500'
    },
  }

  const voteButtons = [
    { vote: 'keep' as const, icon: Heart, activeColor: 'text-green-600 bg-green-100', hoverColor: 'hover:text-green-600 hover:bg-green-50' },
    { vote: 'toss' as const, icon: Trash2, activeColor: 'text-red-600 bg-red-100', hoverColor: 'hover:text-red-600 hover:bg-red-50' },
    { vote: 'maybe' as const, icon: HelpCircle, activeColor: 'text-yellow-600 bg-yellow-100', hoverColor: 'hover:text-yellow-600 hover:bg-yellow-50' },
  ]

  if (viewMode === 'list') {
    return (
      <div 
        className={cn(
          "card-modern flex items-center gap-4 sm:gap-6 cursor-pointer",
          statusStyles[status].border,
          statusStyles[status].bg,
          "border-2"
        )}
        onClick={onClick}
      >
        <img
          src={item.image_url}
          alt={item.name || 'Item'}
          className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 object-cover rounded-xl flex-shrink-0"
        />
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-lg sm:text-xl truncate">
            {item.name || 'Unnamed Item'}
          </h3>
          
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 text-sm text-gray-600">
            {item.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{item.location}</span>
              </div>
            )}
            {item.votes.length > 0 && (
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>{item.votes.length} vote{item.votes.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {item.item_tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {item.item_tags.map((it: any) => (
                <span key={it.tag_id} className="status-badge bg-gray-100 text-gray-700 border-gray-200">
                  {it.tags?.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 sm:gap-3 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {voteButtons.map(({ vote, icon: Icon, activeColor, hoverColor }) => (
            <button
              key={vote}
              onClick={() => onVote(vote)}
              className={cn(
                "p-2.5 sm:p-3 rounded-xl transition-all duration-200",
                userVote === vote 
                  ? activeColor 
                  : `text-gray-400 bg-gray-50 ${hoverColor}`
              )}
              title={vote.charAt(0).toUpperCase() + vote.slice(1)}
            >
              <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div 
      className={cn(
        "card-modern p-0 overflow-hidden cursor-pointer group relative",
        statusStyles[status].border,
        statusStyles[status].bg,
        "border-2"
      )}
      onClick={onClick}
    >
      <div className="aspect-square relative overflow-hidden bg-gray-100">
        <img
          src={item.image_url}
          alt={item.name || 'Item'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {status !== 'pending' && (
          <div className="absolute top-2 right-2">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm",
              statusStyles[status].badge,
              "text-white"
            )}>
              {status === 'keep' && <Heart className="w-5 h-5" />}
              {status === 'toss' && <Trash2 className="w-5 h-5" />}
              {status === 'discuss' && <HelpCircle className="w-5 h-5" />}
            </div>
          </div>
        )}
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
      </div>

      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base lg:text-lg group-hover:text-indigo-600 transition-colors">
          {item.name || 'Unnamed Item'}
        </h3>
        
        {item.location && (
          <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{item.location}</span>
          </p>
        )}

        {item.item_tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {item.item_tags.slice(0, 2).map((it: any) => (
              <span key={it.tag_id} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                {it.tags?.name}
              </span>
            ))}
            {item.item_tags.length > 2 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                +{item.item_tags.length - 2}
              </span>
            )}
          </div>
        )}

        <div className="flex gap-1 mt-3" onClick={(e) => e.stopPropagation()}>
          {voteButtons.map(({ vote, icon: Icon, activeColor, hoverColor }) => (
            <button
              key={vote}
              onClick={() => onVote(vote)}
              className={cn(
                "flex-1 p-2 rounded-lg transition-all duration-200 text-xs sm:text-sm",
                userVote === vote 
                  ? activeColor 
                  : `text-gray-400 bg-gray-50 ${hoverColor}`
              )}
            >
              <Icon className="w-4 h-4 mx-auto" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}