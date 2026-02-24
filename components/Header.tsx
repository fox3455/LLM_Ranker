import Link from 'next/link'
import SearchBar from '@/components/SearchBar'
import { ScrapeStats } from '@/types'

export default function Header({ stats }: { stats: ScrapeStats | null }) {
  return (
    <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 shadow-lg shadow-purple-900/20">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-all duration-300 transform group-hover:scale-110">
            <span className="text-white font-bold text-xl">LLM</span>
          </div>
          <span className="text-xl font-bold text-white">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">LLM</span>
            <span className="text-white">BattleArena</span>
          </span>
        </Link>
        
        <div className="flex items-center gap-4">
          <SearchBar />
          
          {stats && (
            <div className="hidden md:flex items-center gap-4">
              <div className="hidden lg:flex flex-col items-center px-3">
                <div className="text-sm font-bold text-purple-400">{stats.totalModels}</div>
                <div className="text-xs text-gray-400">Models</div>
              </div>
              <div className="hidden lg:flex flex-col items-center px-3">
                <div className="text-sm font-bold text-blue-400">{stats.huggingFaceCount}</div>
                <div className="text-xs text-gray-400">HF</div>
              </div>
              <div className="hidden lg:flex flex-col items-center px-3">
                <div className="text-sm font-bold text-purple-400">{stats.ollamaCount}</div>
                <div className="text-xs text-gray-400">Ollama</div>
              </div>
              <div className="hidden lg:flex flex-col items-center px-3">
                <div className="text-xs text-gray-400 font-medium">
                  {new Date(stats.timestamp).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
