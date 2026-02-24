'use client'

import { useState, useEffect } from 'react'
import { loadModels, calculateRank } from '@/lib/data'
import ModelCard from '@/components/ModelCard'
import type { ProcessedModel } from '@/types'

interface ComparisonModel {
  id: string
  name: string
  source: 'huggingface' | 'ollama'
  parameters: string
  downloads: number
  likes: number
  estimatedVram: string
  tasks: string[]
}

export default function ComparePage() {
  const [models, setModels] = useState<ProcessedModel[]>([])
  const [selectedModels, setSelectedModels] = useState<ComparisonModel[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const data = await loadModels()
      const ranked = calculateRank(data)
      setModels(ranked)
      setLoading(false)
    }
    load()
  }, [])

  const addModel = (model: ProcessedModel) => {
    if (selectedModels.find(m => m.id === model.id)) return
    
    if (selectedModels.length >= 3) {
      alert('You can compare up to 3 models')
      return
    }
    
    setSelectedModels([
      ...selectedModels,
      {
        id: model.id,
        name: model.name,
        source: model.source,
        parameters: model.parameters,
        downloads: model.downloads,
        likes: model.likes,
        estimatedVram: model.estimatedVram,
        tasks: model.tasks,
      },
    ])
    setSearchQuery('')
  }

  const removeModel = (id: string) => {
    setSelectedModels(selectedModels.filter(m => m.id !== id))
  }

  const filteredModels = models.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 10)

  const stats = {
    downloads: selectedModels.reduce((sum, m) => sum + m.downloads, 0),
    likes: selectedModels.reduce((sum, m) => sum + m.likes, 0),
    params: selectedModels.map(m => m.parameters),
    vrams: selectedModels.map(m => m.estimatedVram),
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Compare Models
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Select up to 3 models to compare their specifications and performance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {selectedModels.length > 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-gray-200 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 font-semibold text-gray-900 dark:text-white">Metric</div>
                {selectedModels.map(model => (
                  <div key={model.id} className="bg-gray-50 dark:bg-gray-800 p-4 flex items-center justify-between group">
                    <div className="font-semibold text-gray-900 dark:text-white truncate max-w-[150px]">{model.name}</div>
                    <button 
                      onClick={() => removeModel(model.id)}
                      className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {[
                  { label: 'Source', key: 'source' },
                  { label: 'Parameters', key: 'parameters' },
                  { label: 'Downloads', key: 'downloads' },
                  { label: 'Likes', key: 'likes' },
                  { label: 'Estimated VRAM', key: 'estimatedVram' },
                  { label: 'Use Cases', key: 'tasks' },
                ].map((row) => (
                  <div key={row.label} className="grid grid-cols-1 md:grid-cols-4 bg-white dark:bg-gray-900">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 font-medium text-gray-700 dark:text-gray-300">
                      {row.label}
                    </div>
                    {selectedModels.map((model) => (
                      <div key={model.id} className="p-4 text-gray-900 dark:text-white font-medium">
                        {(model as any)[row.key]}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No models selected
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Search and select models to compare
              </p>
            </div>
          )}

          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Search Models to Compare
            </h2>
            <input
              type="text"
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 mb-4"
            />
            
            {filteredModels.length > 0 && (
              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredModels.map(model => (
                  <div
                    key={model.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
                    onClick={() => addModel(model)}
                  >
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{model.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {model.parameters} • {model.downloads.toLocaleString()} downloads
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                      + Add
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {filteredModels.length === 0 && searchQuery && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No models found matching &quot;{searchQuery}&quot;
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Summary
            </h2>
            {selectedModels.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-600 dark:text-gray-400">Models Compared</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{selectedModels.length} / 3</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-600 dark:text-gray-400">Total Downloads</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{stats.downloads.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-600 dark:text-gray-400">Total Likes</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{stats.likes.toLocaleString()}</span>
                </div>
                <div className="pt-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Parameter Sizes</h3>
                  <div className="flex flex-wrap gap-1">
                    {stats.params.map((param, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                        {param}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Select models to see summary
              </div>
            )}
          </div>

          <div className="bg-indigo-600 dark:bg-indigo-700 rounded-xl p-6 text-white">
            <h2 className="text-xl font-bold mb-2">Tips</h2>
            <ul className="space-y-2 text-sm opacity-90">
              <li>Compare 2-3 similar models for best insights</li>
              <li>Check parameter sizes for GPU requirements</li>
              <li>Look at downloads and likes for community adoption</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
