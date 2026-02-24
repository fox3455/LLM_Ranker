'use client'

interface GradientComparisonBarProps {
  hfModels: number
  ollamaModels: number
}

export default function GradientComparisonBar({ hfModels, ollamaModels }: GradientComparisonBarProps) {
  const total = hfModels + ollamaModels
  const hfPercent = (hfModels / total) * 100
  const ollamaPercent = (ollamaModels / total) * 100

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
          <span className="font-semibold text-blue-400">Hugging Face</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.6)]" />
          <span className="font-semibold text-purple-400">Ollama</span>
        </div>
      </div>

      <div className="relative h-6 rounded-full overflow-hidden bg-gray-700 shadow-inner">
        <div 
          className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000 ease-out relative"
          style={{ width: `${hfPercent}%` }}
        >
          <div className="absolute top-0 right-0 bottom-0 w-1 bg-white/30" />
        </div>
        <div 
          className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-1000 ease-out"
          style={{ width: `${ollamaPercent}%` }}
        />
      </div>

      <div className="flex justify-between mt-4 text-sm font-medium">
        <div className="text-center">
          <div className="text-2xl text-blue-400">{hfModels}</div>
          <div className="text-xs text-gray-400">Models</div>
          <div className="text-xs text-blue-500">{hfPercent.toFixed(0)}%</div>
        </div>
        <div className="text-center">
          <div className="text-2xl text-purple-400">{ollamaModels}</div>
          <div className="text-xs text-gray-400">Models</div>
          <div className="text-xs text-purple-500">{ollamaPercent.toFixed(0)}%</div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700 text-center">
        <div className="text-sm text-gray-400">Platform Distribution</div>
        <div className="text-xs text-gray-500 mt-1">Total open source models tracked</div>
      </div>
    </div>
  )
}
