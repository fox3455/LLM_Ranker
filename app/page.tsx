import { loadModels, filterModels, calculateRank } from '@/lib/data'
import Link from 'next/link'
import Podium from '@/components/Podium'
import LeaderboardChart from '@/components/LeaderboardChart'
import GradientComparisonBar from '@/components/GradientComparisonBar'
import type { ProcessedModel } from '@/types'

function getModelUrl(model: ProcessedModel): string {
  const sourcePrefix = model.source === 'huggingface' ? 'hf' : 'ollama'
  const modelId = model.id.replace('/', '_').replace(':', '_')
  return `/models/${sourcePrefix}_${modelId}`
}

export default async function Home() {
  const models = await loadModels()
  const rankedModels = calculateRank(models, 'overall')

  const featuredModels = rankedModels.slice(0, 6)
  const topDownloaded = [...models].sort((a, b) => b.downloads - a.downloads).slice(0, 10)
  const hfCount = rankedModels.filter(m => m.source === 'huggingface').length
  const ollamaCount = rankedModels.filter(m => m.source === 'ollama').length

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Background gradient orb */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[100px] -z-10" />
        <div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[80px] -z-10" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[90px] -z-10" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 animate-slide-up">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400">
              LLM Battle Arena
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Compare, rank, and discover the top open source LLMs from Hugging Face & Ollama
          </p>
          <div className="flex justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link 
              href="/search"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 transition-all transform hover:scale-105 hover:shadow-purple-500/50"
            >
              Enter Battle Arena
            </Link>
            <Link 
              href="/compare"
              className="px-8 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-bold rounded-xl transition-all transform hover:scale-105"
            >
              Compare Champions
            </Link>
          </div>
        </div>
      </section>

      {/* Top 3 Champions Podium */}
      <section className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <Podium models={rankedModels.slice(0, 3)} />
      </section>

      {/* Stats Counters */}
      <section className="container mx-auto px-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Models', value: rankedModels.length, color: 'text-indigo-400', icon: '📦' },
            { label: 'Hugging Face', value: hfCount, color: 'text-blue-400', icon: '🐙' },
            { label: 'Ollama', value: ollamaCount, color: 'text-purple-400', icon: '🤖' },
            { label: 'Use Cases', value: new Set(rankedModels.flatMap(m => m.tasks)).size, color: 'text-green-400', icon: '🎯' },
          ].map((stat, i) => (
            <div key={i} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center backdrop-blur-sm hover:border-purple-500/30 transition-colors">
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className={`text-4xl md:text-5xl font-bold ${stat.color}`}>{stat.value.toLocaleString()}</div>
              <div className="text-sm text-gray-400 mt-2 uppercase tracking-wider font-semibold">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Platform Split */}
      <section className="container mx-auto px-4 animate-slide-up" style={{ animationDelay: '0.5s' }}>
        <GradientComparisonBar hfModels={hfCount} ollamaModels={ollamaCount} />
      </section>

      {/* Leaderboard Chart */}
      <section className="container mx-auto px-4 animate-slide-up" style={{ animationDelay: '0.6s' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white">
            <span className="text-yellow-400">⚡</span> Top 10 All-Time Leaders
          </h2>
          <Link href="/search" className="text-indigo-400 hover:text-indigo-300 text-sm font-bold flex items-center gap-1">
            View All Models <span>→</span>
          </Link>
        </div>
        <LeaderboardChart models={rankedModels} />
      </section>

      {/* Featured Models Grid */}
      <section className="container mx-auto px-4 animate-slide-up" style={{ animationDelay: '0.7s' }}>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white">
            <span className="text-purple-400">🏆</span> Featured Champions
          </h2>
          <div className="flex gap-2">
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs">Rank</span>
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs">Downloads</span>
            <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-xs">GPU</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredModels.map((model, index) => (
            <div 
              key={model.id}
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold
                    ${index === 0 ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.6)]' : 
                      index === 1 ? 'bg-gray-400 text-black shadow-[0_0_15px_rgba(156,163,175,0.6)]' : 
                      index === 2 ? 'bg-orange-500 text-black shadow-[0_0_15px_rgba(249,115,22,0.6)]' : 
                      'bg-gray-700 text-white'}
                  `}>
                    {index + 1}
                  </div>
                  <div>
                    <Link
                      href={getModelUrl(model)}
                      className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors"
                    >
                      {model.name}
                    </Link>
                    <div className="text-xs text-gray-400 capitalize">{model.source}</div>
                  </div>
                </div>
                <Link 
                  href={getModelUrl(model)}
                  className="text-indigo-400 hover:text-indigo-300 font-medium text-sm transition-colors"
                >
                  View Profile
                </Link>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                  <span className="text-gray-400 text-sm">Downloads</span>
                  <span className="font-bold text-blue-400">{formatNumber(model.downloads)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                  <span className="text-gray-400 text-sm">Likes</span>
                  <span className="font-bold text-red-400">{formatNumber(model.likes)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                  <span className="text-gray-400 text-sm">Parameters</span>
                  <span className="font-bold text-purple-400">{model.parameters}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400 text-sm">VRAM Est.</span>
                  <span className="font-bold text-green-400">{model.estimatedVram}</span>
                </div>
              </div>

              {model.tasks.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-700/50">
                  <div className="flex flex-wrap gap-2">
                    {model.tasks.slice(0, 3).map(task => (
                      <span 
                        key={task} 
                        className="px-2 py-1 rounded bg-green-500/20 text-green-300 text-xs font-medium border border-green-500/30"
                      >
                        {task}
                      </span>
                    ))}
                    {model.tasks.length > 3 && (
                      <span className="px-2 py-1 rounded bg-gray-700 text-gray-300 text-xs">
                        +{model.tasks.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function formatNumber(num: number): string {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return num.toLocaleString()
}
