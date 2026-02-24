'use client'

import { useState } from 'react'

interface TagCloudProps {
  tasks: string[]
  selectedTags: string[]
  onToggleTag: (tag: string) => void
  topTags?: string[]
}

const tagColors = [
  'bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30',
  'bg-orange-500/20 text-orange-300 border-orange-500/30 hover:bg-orange-500/30',
  'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30',
  'bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30',
  'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30',
  'bg-teal-500/20 text-teal-300 border-teal-500/30 hover:bg-teal-500/30',
  'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/30',
  'bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30',
  'bg-indigo-500/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/30',
  'bg-violet-500/20 text-violet-300 border-violet-500/30 hover:bg-violet-500/30',
  'bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30',
  'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30 hover:bg-fuchsia-500/30',
  'bg-pink-500/20 text-pink-300 border-pink-500/30 hover:bg-pink-500/30',
  'bg-rose-500/20 text-rose-300 border-rose-500/30 hover:bg-rose-500/30',
]

export default function TagCloud({ tasks, selectedTags, onToggleTag }: TagCloudProps) {
  const [displayTags, setDisplayTags] = useState(tasks)

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 shadow-lg">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span className="text-green-400">🏷️</span>
        Use Case Tags
      </h3>
      
      <div className="flex flex-wrap gap-2">
        {displayTags.map((tag, index) => {
          const isSelected = selectedTags.includes(tag)
          const colorIndex = index % tagColors.length
          const [bg, text, border] = tagColors[colorIndex].split(' ')

          return (
            <button
              key={tag}
              onClick={() => onToggleTag(tag)}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                ${isSelected 
                  ? `${text} ${bg.replace('/20', '/50')} ${border.replace('/30', '/50')} ring-2 ring-offset-2 ring-offset-gray-800 ${text.replace('300', '400')}` 
                  : `${text} ${bg} ${border}`}
              `}
            >
              {tag}
              {isSelected && (
                <span className="ml-1 text-lg leading-none">✕</span>
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-400">
          Click tags to filter models by use case
        </p>
      </div>
    </div>
  )
}
