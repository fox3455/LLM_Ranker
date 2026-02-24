import type { ProcessedModel } from '@/types'
import Link from 'next/link'
import TierBadge from '@/components/TierBadge'

interface ModelCardProps {
  model: ProcessedModel
  rank: number
  index: number
}

export default function ModelCard({ model, rank, index }: ModelCardProps) {
  const tierColors = [
    'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]',
    'border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]',
    'border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]',
    'border-green-500 shadow-[0_0_5px_rgba(34,197,94,0.2)]',
    'border-gray-500 shadow-[0_0_5px_rgba(107,114,128,0.2)]',
  ]

  const tier = tierColors[Math.min(rank - 1, 4)]

  return (
    <div className={`
      relative bg-gray-800/50 rounded-xl p-6 border-2 transition-all duration-300 hover:shadow-2xl
      hover:shadow-purple-500/20 hover:scale-[1.02] ${tier}
    `}>
      {/* Tier badge */}
      <div className="absolute top-4 right-4">
        <TierBadge rank={rank} />
      </div>

      <div className="mb-4">
        <div className="mb-2">
          <Link
            href={`/models/${model.source === 'huggingface' ? 'hf' : 'ollama'}_${model.id.replace('/', '_').replace(':', '_')}`}
            className="text-xl font-bold text-white truncate hover:text-purple-400 transition-colors"
            title={model.name}
          >
            {model.name}
          </Link>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            model.source === 'huggingface'
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
          }`}>
            {model.source === 'huggingface' ? '🐙 HF' : '🤖 Ollama'}
          </span>
          {model.weeklyDownloads && model.weeklyDownloads > 0 && (
            <span className="text-xs px-2 py-1 rounded-full font-medium bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
              <span>🔥</span> Trending
            </span>
          )}
        </div>
        <Link
          href={`/models/${model.source === 'huggingface' ? `hf_${model.id.replace('/', '_')}` : `ollama_${model.name.replace(':', '_')}`}`}
          className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold"
        >
          View Profile
        </Link>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-gray-900/50 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">Downloads</div>
          <div className="text-lg font-bold text-blue-400">{formatNumber(model.downloads)}</div>
          <div className="text-xs text-gray-500">🔥 {Math.log10(model.downloads + 1).toFixed(1)} score</div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">Likes</div>
          <div className="text-lg font-bold text-red-400">{formatNumber(model.likes)}</div>
          <div className="text-xs text-gray-500">❤️ Community love</div>
        </div>
      </div>

      <div className="space-y-3 mb-5">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Parameters</span>
          <span className="font-semibold text-purple-400">{model.parameters}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Estimated VRAM</span>
          <span className="font-semibold text-green-400">{model.estimatedVram}</span>
        </div>
      </div>

      {/* Tags */}
      {model.tasks.length > 0 && (
        <div className="pt-4 border-t border-gray-700">
          <div className="flex flex-wrap gap-2">
            {model.tasks.slice(0, 4).map(task => (
              <span
                key={task}
                className="px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30"
              >
                {task}
              </span>
            ))}
            {model.tasks.length > 4 && (
              <span className="px-2 py-1 rounded text-xs bg-gray-700 text-gray-300">
                +{model.tasks.length - 4}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action button */}
        <Link
          href={`/models/${model.source === 'huggingface' ? 'hf' : 'ollama'}_${model.id.replace('/', '_').replace(':', '_')}`}
          className="block w-full mt-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-center rounded-lg text-sm font-semibold transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
        >
          View Model Details
        </Link>
    </div>
  )
}

function formatNumber(num: number): string {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return num.toLocaleString()
}
