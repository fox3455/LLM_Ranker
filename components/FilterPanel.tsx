import type { ProcessedModel } from '@/types'

interface FilterState {
  minDownloads: number
  minLikes: number
  maxParameters: number
  selectedTasks: string[]
}

const AVAILABLE_TASKS = [
  'Text Generation',
  'Vision',
  'Audio',
  'TTS',
  'Image Generation',
  'Video Generation',
  'Chat/Conversational',
  'Translation',
  'Summarization',
  'NLP',
  'QA',
  'Text Classification',
  'Image Classification',
  'Image Segmentation',
  'Audio Classification',
  'Voice Detection',
  'ASR',
  'General',
]

export default function FilterPanel({
  filters,
  setFilters,
  availableTasks,
}: {
  filters: FilterState
  setFilters: (filters: FilterState) => void
  availableTasks: string[]
}) {
  const toggleTask = (task: string) => {
    const selectedTasks = filters.selectedTasks.includes(task)
      ? filters.selectedTasks.filter(t => t !== task)
      : [...filters.selectedTasks, task]
    setFilters({ ...filters, selectedTasks })
  }

  const taskCounts: Record<string, number> = {}
  for (const task of availableTasks) {
    taskCounts[task] = 0
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Minimum Downloads
            </label>
            <input
              type="number"
              min="0"
              value={filters.minDownloads}
              onChange={(e) => setFilters({ ...filters, minDownloads: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Minimum Likes
            </label>
            <input
              type="number"
              min="0"
              value={filters.minLikes}
              onChange={(e) => setFilters({ ...filters, minLikes: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Parameter Size (Billion)
            </label>
            <input
              type="number"
              min="0"
              value={filters.maxParameters}
              onChange={(e) => setFilters({ ...filters, maxParameters: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Use Cases / Tasks
        </label>
        <div className="flex flex-wrap gap-2">
          {availableTasks.map(task => (
            <button
              key={task}
              onClick={() => toggleTask(task)}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                filters.selectedTasks.includes(task)
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {task}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
