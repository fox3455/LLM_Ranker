import type { ProcessedModel } from '@/types'
import Link from 'next/link'

function getModelUrl(model: ProcessedModel): string {
  const sourcePrefix = model.source === 'huggingface' ? 'hf' : 'ollama'
  const modelId = model.id.replace('/', '_').replace(':', '_')
  return `/models/${sourcePrefix}_${modelId}`
}

interface PodiumProps {
  models: ProcessedModel[]
}

export default function Podium({ models }: PodiumProps) {
  if (models.length < 3) {
    return (
      <div className="text-center py-12 bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl border border-gray-700">
        <p className="text-gray-400">Not enough models to display podium</p>
      </div>
    )
  }

  const podiumColors = [
    'from-yellow-400 to-yellow-600',
    'from-gray-300 to-gray-500',
    'from-orange-400 to-orange-600',
  ]
  
  const medalIcons = ['🥇', '🥈', '🥉']
  const rankLabels = ['CHAMPION', 'RUNNER-UP', 'THIRD PLACE']

  return (
    <section className="py-12 bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-purple-400 to-indigo-400">
              🏆 LLM Champions
            </span>
          </h2>
          <p className="text-gray-400 text-lg">Top performing open source models</p>
        </div>

        <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-8 max-w-5xl mx-auto">
          {/* 2nd Place */}
          <div className="flex-1 max-w-sm w-full animate-slide-up">
            <PodiumModel
              model={models[1]}
              position={2}
              color={podiumColors[1]}
              icon={medalIcons[1]}
              label={rankLabels[1]}
              height="h-48 md:h-64"
              url={getModelUrl(models[1])}
            />
          </div>

          {/* 1st Place */}
          <div className="flex-1 max-w-sm w-full animate-float">
            <PodiumModel
              model={models[0]}
              position={1}
              color={podiumColors[0]}
              icon={medalIcons[0]}
              label={rankLabels[0]}
              height="h-64 md:h-80"
              url={getModelUrl(models[0])}
            />
          </div>

          {/* 3rd Place */}
          <div className="flex-1 max-w-sm w-full animate-slide-up">
            <PodiumModel
              model={models[2]}
              position={3}
              color={podiumColors[2]}
              icon={medalIcons[2]}
              label={rankLabels[2]}
              height="h-48 md:h-64"
              url={getModelUrl(models[2])}
            />
          </div>
        </div>

        {/* Platform split indicator */}
        <div className="mt-12 bg-gray-800/50 rounded-xl p-6 max-w-3xl mx-auto border border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-blue-400">Hugging Face</span>
            <span className="text-sm font-bold text-purple-400">Ollama</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-4 bg-gradient-to-r from-blue-600 to-blue-400 rounded-l-lg" />
            <div className="flex-1 h-4 bg-gradient-to-r from-purple-600 to-purple-400 rounded-r-lg" />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>HF Models</span>
            <span>Ollama Models</span>
          </div>
        </div>
      </div>
    </section>
  )
}

interface PodiumModelProps {
  model: ProcessedModel
  position: number
  color: string
  icon: string
  label: string
  height: string
}

function PodiumModel({ model, position, color, icon, label, height, url }: PodiumModelProps & { url: string }) {
  return (
    <div className="relative group">
      {/* Base */}
      <div className={`absolute bottom-0 left-0 right-0 h-4 bg-gray-700 rounded-b-lg`} />
      
      {/* Platform */}
      <div className={`relative z-10 bg-gradient-to-b ${color} rounded-t-2xl p-6 ${height} flex flex-col items-center justify-end shadow-2xl shadow-purple-500/30 border-2 border-white/20 backdrop-blur-sm`}>
        {/* Rank label */}
        <div className="absolute top-3 right-3 bg-black/30 px-2 py-1 rounded-lg backdrop-blur-sm">
          <span className="text-lg">{icon}</span>
        </div>
        
        <div className="mb-4 text-center">
          <span className="text-xs font-bold text-white/80 uppercase tracking-wider mb-1 block">{label}</span>
          <h3 className="text-lg font-bold text-white truncate max-w-full">{model.name}</h3>
        </div>

        <div className="space-y-2 w-full">
          <div className="bg-black/40 rounded-lg p-2 backdrop-blur-sm">
            <div className="flex justify-between text-xs text-gray-300">
              <span>Downloads</span>
              <span className="font-bold">{formatNumber(model.downloads)}</span>
            </div>
          </div>
          <div className="bg-black/40 rounded-lg p-2 backdrop-blur-sm">
            <div className="flex justify-between text-xs text-gray-300">
              <span>Parameters</span>
              <span className="font-bold">{model.parameters}</span>
            </div>
          </div>
        </div>

        <Link
          href={url}
          className="mt-4 px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-semibold transition-all transform group-hover:scale-105"
        >
          View Profile →
        </Link>
      </div>
    </div>
  )
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`
  }
  return num.toString()
}
