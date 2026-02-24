import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { loadModels, getRecommendedGPU } from '@/lib/data'
import type { ProcessedModel } from '@/types'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata | null> {
  const models = await loadModels()
  
  const source = params.id.split('_')[0]
  const afterSource = params.id.substring(source.length + 1)
  const modelId = afterSource.replace(/_/g, source === 'hf' ? '/' : ':')
  const model = models.find(m => m.id === modelId)
  
  if (!model) return null
  
  return {
    title: `${model.name} - LLM Ranking`,
    description: `${model.parameters} model${model.source === 'huggingface' ? ' from Hugging Face' : ' from Ollama'} with ${model.downloads} downloads and ${model.likes} likes`,
  }
}

export async function generateStaticParams() {
  const models = await loadModels()
  return models.map((m) => ({
    id: `${m.source === 'huggingface' ? 'hf' : 'ollama'}_${m.id.replace('/', '_').replace(':', '_')}`,
  }))
}

export default async function ModelPage({ params }: { params: { id: string } }) {
  const models = await loadModels()
  
  const source = params.id.split('_')[0]
  const afterSource = params.id.substring(source.length + 1)
  const modelId = afterSource.replace(/_/g, source === 'hf' ? '/' : ':')
  const model = models.find(m => m.id === modelId)
  
  if (!model) {
    notFound()
  }

  const relatedModels = models
    .filter(m => 
      m.id !== model.id &&
      m.tasks.some(t => model.tasks.includes(t))
    )
    .slice(0, 6)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {model.name}
              </h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                model.source === 'huggingface'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
              }`}>
                {model.source === 'huggingface' ? 'Hugging Face' : 'Ollama'}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Downloads</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{model.downloads.toLocaleString()}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Likes</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{model.likes.toLocaleString()}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Parameters</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{model.parameters}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Estimated VRAM</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{model.estimatedVram}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {model.tasks.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-wrap gap-2">
              {model.tasks.map(task => (
                <span 
                  key={task}
                  className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-medium"
                >
                  {task}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        {model.source === 'huggingface' ? (
          <a
            href={`https://huggingface.co/${model.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            View on Hugging Face
          </a>
        ) : (
          <a
            href={`https://ollama.com/library/${model.name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            Run with Ollama
          </a>
        )}
        
        <a
          href="/compare"
          className="px-6 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Compare Models
        </a>
      </div>

      {/* Model Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">About this Model</h3>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                This {model.parameters} model {model.source === 'huggingface' 
                  ? `was published on Hugging Face` 
                  : 'is available on Ollama'}
              </p>
              <p>
                With {model.downloads.toLocaleString()} downloads and {model.likes.toLocaleString()} likes, 
                this model has been widely adopted by the community.
              </p>
              <p>
                Estimated VRAM requirement: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{model.estimatedVram}</span>
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recommended Hardware</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Minimum GPU VRAM</div>
                <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{model.estimatedVram}</div>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Recommended</div>
                 <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                    {model.estimatedVram === 'Unknown' 
                      ? 'Unknown - Parameters not available' 
                      : getRecommendedGPU(model.estimatedVram)}
                 </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
            <dl className="space-y-4">
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <dt className="text-gray-600 dark:text-gray-400">Downloads</dt>
                <dd className="font-medium text-gray-900 dark:text-white">{model.downloads.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <dt className="text-gray-600 dark:text-gray-400">Likes</dt>
                <dd className="font-medium text-gray-900 dark:text-white">{model.likes.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <dt className="text-gray-600 dark:text-gray-400">Parameters</dt>
                <dd className="font-medium text-gray-900 dark:text-white">{model.parameters}</dd>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <dt className="text-gray-600 dark:text-gray-400">Source</dt>
                <dd className="font-medium text-gray-900 dark:text-white capitalize">{model.source}</dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-gray-600 dark:text-gray-400">Use Cases</dt>
                <dd className="font-medium text-gray-900 dark:text-white">{model.tasks.length}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Related Models */}
      {relatedModels.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Related Models
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedModels.map(m => (
              <div 
                key={m.id} 
                className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors cursor-pointer"
              >
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{m.name}</h4>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>{m.parameters}</span>
                  <span>•</span>
                  <span>{m.downloads.toLocaleString()} downloads</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {m.tasks.slice(0, 2).map(task => (
                    <span key={task} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                      {task}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
