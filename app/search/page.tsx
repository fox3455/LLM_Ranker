'use client'

import { useState, useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { filterModels, calculateRank } from '@/lib/data'
import ModelCard from '@/components/ModelCard'
import TierBadge from '@/components/TierBadge'
import TagCloud from '@/components/TagCloud'
import type { FilterState } from '@/types'
import { loadModels } from '@/lib/data'

function SearchContent() {
  const searchParams = useSearchParams()
  const [models, setModels] = useState<any[]>([])
  const [filteredModels, setFilteredModels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const query = searchParams.get('q') || ''
  const sort = searchParams.get('sort') || 'trending'
  const source = searchParams.get('source')
  
  const [filters, setFilters] = useState<FilterState>({
    minDownloads: 0,
    minLikes: 0,
    maxParameters: 1000,
    selectedTasks: [],
    selectedVramTiers: [],
    selectedGPU: undefined,
  })

  useEffect(() => {
    const load = async () => {
      const data = await loadModels()
      const ranked = calculateRank(data)
      setModels(ranked)
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    let result = filterModels(models, query, filters)
    
    if (source === 'huggingface' || source === 'ollama') {
      result = result.filter(m => m.source === source)
    }

    if (sort === 'downloads') {
      result = [...result].sort((a, b) => (b.weeklyDownloads || b.downloads) - (a.weeklyDownloads || a.downloads))
    } else if (sort === 'likes') {
      result = [...result].sort((a, b) => b.likes - a.likes)
    } else if (sort === 'size') {
      result = [...result].sort((a, b) => {
        const aSize = parseFloat(a.parameters) || 0
        const bSize = parseFloat(b.parameters) || 0
        return bSize - aSize
      })
    } else if (sort === 'trending') {
      result = [...result].sort((a, b) => (b.weeklyDownloads || 0) - (a.weeklyDownloads || 0))
    }

    setFilteredModels(result)
  }, [models, query, filters, sort, source])

  const allTasks = Array.from(new Set(models.flatMap(m => m.tasks))).sort()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4 shadow-[0_0_20px_rgba(168,85,247,0.5)]"></div>
          <p className="text-gray-400">Loading battle arena...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Battle Arena</h1>
          <p className="text-gray-400 mt-2">
            Showing {filteredModels.length} of {models.length} models
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={sort}
            onChange={(e) => {
              const params = new URLSearchParams(searchParams.toString())
              params.set('sort', e.target.value)
              window.history.pushState({}, '', `/search?${params.toString()}`)
            }}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            <option value="rank">🏆 Sort by Rank</option>
            <option value="downloads">📊 Sort by Downloads</option>
            <option value="likes">❤️ Sort by Likes</option>
            <option value="size">📏 Sort by Size</option>
            <option value="vram">🖥️ Sort by Graphics Card</option>
          </select>
          <select
            value={source || ''}
            onChange={(e) => {
              const params = new URLSearchParams(searchParams.toString())
              if (e.target.value) {
                params.set('source', e.target.value)
              } else {
                params.delete('source')
              }
              window.history.pushState({}, '', `/search?${params.toString()}`)
            }}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            <option value="">🌐 All Platforms</option>
            <option value="huggingface">🐙 Hugging Face</option>
            <option value="ollama">🤖 Ollama</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            {/* Stats Summary */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4">Arena Stats</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-400">Minimum Downloads</div>
                  <input
                    type="number"
                    min="0"
                    value={filters.minDownloads}
                    onChange={(e) => setFilters({ ...filters, minDownloads: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <div className="text-xs text-gray-400">Minimum Likes</div>
                  <input
                    type="number"
                    min="0"
                    value={filters.minLikes}
                    onChange={(e) => setFilters({ ...filters, minLikes: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <div className="text-xs text-gray-400">Max Parameters (B)</div>
                  <input
                    type="number"
                    min="0"
                    max={1000}
                    value={filters.maxParameters}
                    onChange={(e) => setFilters({ ...filters, maxParameters: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Tag Filter */}
            <TagCloud 
              tasks={allTasks} 
              selectedTags={filters.selectedTasks} 
              onToggleTag={(tag) => {
                const selectedTasks = filters.selectedTasks.includes(tag)
                  ? filters.selectedTasks.filter(t => t !== tag)
                  : [...filters.selectedTasks, tag]
                setFilters({ ...filters, selectedTasks })
              }}
            />
          </div>
        </div>

        {/* Model Grid */}
        <div className="lg:col-span-3">
          {filteredModels.length === 0 ? (
            <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
              <div className="text-6xl mb-4">⚔️</div>
              <h3 className="text-xl font-bold text-white mb-2">No models found</h3>
              <p className="text-gray-400 mb-6">Try adjusting your filters or search query</p>
              <button
                  onClick={() => {
                    setFilters({ minDownloads: 0, minLikes: 0, maxParameters: 1000, selectedTasks: [], selectedVramTiers: [], selectedGPU: undefined })
                    window.history.pushState({}, '', '/search')
                  }}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredModels.map((model, idx) => (
                <ModelCard 
                  key={model.id} 
                  model={model} 
                  rank={idx + 1}
                  index={idx + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4 shadow-[0_0_20px_rgba(168,85,247,0.5)]"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
