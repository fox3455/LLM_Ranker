import type { ProcessedModel, FilterState } from '@/types'

// VRAM calculation constants
export const VRAM_FORMULA = {
  fourBit: 0.7,
  eightBit: 1.0,
  sixteenBit: 2.0,
  baseOverhead: 2,
} as const

export function calculateVRAM(parametersGB: number, quantization: '4bit' | '8bit' | '16bit' = '4bit'): number {
  const baseVRAM = parametersGB * VRAM_FORMULA[quantization === '4bit' ? 'fourBit' : quantization === '8bit' ? 'eightBit' : 'sixteenBit']
  const overhead = VRAM_FORMULA.baseOverhead
  return Math.ceil(baseVRAM + overhead)
}

// Use require() for JSON imports - Next.js webpack handles this at build time
// At runtime in Node.js, this works fine too
const modelsData: ProcessedModel[] = require('../data/models.json')
const statsData: any = require('../data/scrape-stats.json')

export function parseParameters(paramString: string): number | null {
  if (paramString === 'Unknown' || !paramString) return null
  const match = paramString.match(/([\d.]+)\s*(billion|billion|\s*b|\s*B)?/i)
  if (!match) return null
  const value = parseFloat(match[1])
  if (isNaN(value)) return null
  const unit = (match[2] || '').toLowerCase()
  if (unit.includes('billion') || unit.includes('b')) {
    return value
  }
  return value / 1000
}

export function estimateParametersFromName(name: string): number | null {
  const nameLower = name.toLowerCase()
  
  if (nameLower.includes('minilm')) {
    const match = nameLower.match(/(\d+)b?/i)
    if (match) {
      return parseFloat(match[1])
    }
    return 0.3
  }
  
  if (nameLower.includes('bert')) {
    if (nameLower.includes('large')) return 11
    if (nameLower.includes('xlarge')) return 20
    if (nameLower.includes('base')) return 1.1
    return 1
  }
  
  if (nameLower.includes('llama')) {
    const match = nameLower.match(/(\d+)/)
    if (match) return parseFloat(match[1])
    return 7
  }
  
  if (nameLower.includes('mistral')) {
    if (nameLower.includes('3')) return 22
    return 7
  }
  
  if (nameLower.includes('gemma')) {
    if (nameLower.includes('27')) return 27
    if (nameLower.includes('7')) return 7
    return 2
  }
  
  return null
}

export function estimateVRAM(model: ProcessedModel): string {
  let params = parseParameters(model.parameters)
  
  if (params === null || params === 0) {
    params = estimateParametersFromName(model.name)
  }
  
  if (params === null || params === 0) return 'Unknown'
  
  const estimated = calculateVRAM(params, '4bit')
  
  if (estimated <= 6) return 'RTX 3050 (6GB)'
  if (estimated <= 12) return 'RTX 3060 (12GB)'
  if (estimated <= 16) return 'RTX 4060 Ti (8GB) / RTX 4070 (12GB)'
  if (estimated <= 24) return 'RTX 4080 (16GB) / RTX 4090 (24GB)'
  if (estimated <= 48) return 'RTX 4090 (24GB)'
  if (estimated <= 128) return 'NVIDIA GB10 (128GB VRAM)'
  return 'Enterprise Multi-GPU'
}

export function getRecommendedGPU(vramGB: string): string {
  if (vramGB === 'Unknown') return 'Unknown - Parameters not available'
  if (vramGB === 'RTX 3050 (6GB)') return 'Entry GPU (GTX 1650 / RTX 3050)'
  if (vramGB === 'RTX 3060 (12GB)') return 'RTX 3060 (12GB) - Most common gaming GPU (4.28%)'
  if (vramGB === 'RTX 4060 Ti (8GB) / RTX 4070 (12GB)') return 'RTX 4060 Ti (8GB) / RTX 4070 (12GB)'
  if (vramGB === 'RTX 4080 (16GB) / RTX 4090 (24GB)') return 'RTX 4080 (16GB) / RTX 4090 (24GB)'
  if (vramGB === 'RTX 4090 (24GB)') return 'RTX 4090 (24GB)'
  if (vramGB === 'NVIDIA GB10 (128GB VRAM)') return 'NVIDIA GB10 (128GB VRAM)'
  return 'Enterprise Multi-GPU or NVIDIA GB10 Cluster'
}

export async function loadModels(): Promise<ProcessedModel[]> {
  try {
    const rawModels = modelsData as ProcessedModel[]
    
    return rawModels.map(model => {
      const vramEstimate = estimateVRAM(model)
      const vramTag = vramEstimate !== 'Unknown' ? vramEstimate : null
      return {
        ...model,
        estimatedVram: vramEstimate,
        tasks: vramTag ? [...model.tasks, vramTag] : model.tasks
      }
    })
  } catch (error) {
    console.error('Error loading models:', error)
    return []
  }
}

export async function loadStats() {
  try {
    return statsData as any
  } catch (error) {
    return null
  }
}

export function filterModels(
  models: ProcessedModel[],
  query: string = '',
  filters: FilterState = { minDownloads: 0, minLikes: 0, maxParameters: Infinity, selectedTasks: [], selectedVramTiers: [], selectedGPU: undefined }
): ProcessedModel[] {
  const gpuVRAM: Record<string, number> = {
    'RTX 3050 (6GB)': 6,
    'RTX 3060 (12GB)': 12,
    'RTX 4060 Ti (8GB) / RTX 4070 (12GB)': 12,
    'RTX 4080 (16GB) / RTX 4090 (24GB)': 16,
    'RTX 4090 (24GB)': 24,
    'NVIDIA GB10 (128GB VRAM)': 48,
    'Enterprise Multi-GPU': 128
  }
  
  const minGPUVRAM = filters.selectedGPU ? (gpuVRAM[filters.selectedGPU] as number || 0) : 0
  
  return models.filter(model => {
    const queryLower = query.toLowerCase()
    const matchesSearch = 
      model.name.toLowerCase().includes(queryLower) || 
      model.id.toLowerCase().includes(queryLower) ||
      model.tasks.some(task => task.toLowerCase().includes(queryLower))

    const matchesDownloads = model.downloads >= filters.minDownloads
    const matchesLikes = model.likes >= filters.minLikes
    
    const modelParams = parseFloat(model.parameters)
    const matchesParams = isNaN(modelParams) ? true : modelParams <= filters.maxParameters
    
    const matchesTasks = 
      filters.selectedTasks.length === 0 || 
      filters.selectedTasks.some(task => model.tasks.includes(task))
    
    const matchesVRAM = 
      filters.selectedVramTiers.length === 0 || 
      model.estimatedVram !== 'Unknown' &&
      filters.selectedVramTiers.some(tier => model.estimatedVram === tier)
    
    const matchesGPU = 
      !filters.selectedGPU || 
      model.estimatedVram !== 'Unknown' &&
      parseVRAMToGB(model.estimatedVram) <= minGPUVRAM

    return matchesSearch && matchesDownloads && matchesLikes && matchesParams && matchesTasks && matchesVRAM && matchesGPU
  })
}

function parseVRAMToGB(vramStr: string): number {
  if (vramStr === 'Unknown') return Infinity
  const match = vramStr.match(/(\d+)(?:-(\d+))?/)
  if (match) {
    if (match[2]) return parseFloat(match[2])
    return parseFloat(match[1])
  }
  return 0
}

export function calculateRank(models: ProcessedModel[], rankMode: 'overall' | 'weekly' | 'monthly' = 'overall'): ProcessedModel[] {
  const ranked = models.map(model => {
    let trendingScore = 0
    if (rankMode === 'weekly') {
      trendingScore = model.weeklyDownloads 
        ? Math.log10(model.weeklyDownloads + 1) * 70 
        : 0
    } else if (rankMode === 'monthly') {
      trendingScore = model.monthlyDownloads 
        ? Math.log10(model.monthlyDownloads + 1) * 70 
        : 0
    }
    
    const downloadScore = Math.log10(model.downloads + 1) * 3
    const likeScore = Math.log10(model.likes + 1) * 1.5
    const tagScore = model.tasks.length * 0.6
    const overallScore = downloadScore + likeScore + tagScore
    
    let rankScore: number
    if (rankMode === 'overall') {
      rankScore = overallScore * 0.7 + trendingScore * 0.3
    } else {
      rankScore = trendingScore * 0.7 + overallScore * 0.3
    }
    
    return { ...model, rankScore, rankScoreTrending: trendingScore }
  })

  return ranked.sort((a, b) => (b.rankScore || 0) - (a.rankScore || 0))
}

export function findComparables(model: ProcessedModel, allModels: ProcessedModel[], count: number = 5) {
  const sameSource = allModels.filter(m => m.source === model.source && m.id !== model.id)
  
  const byTasks = sameSource.filter(m => 
    m.tasks.some(t => model.tasks.includes(t))
  )
  
  if (byTasks.length >= count) {
    return byTasks.sort((a, b) => (b.rankScore || 0) - (a.rankScore || 0)).slice(0, count)
  }
  
  const byParams = sameSource.filter(m => {
    const aParams = parseFloat(model.parameters) || 0
    const bParams = parseFloat(m.parameters) || 0
    return Math.abs(aParams - bParams) <= 5
  })
  
  if (byParams.length >= count) {
    return byParams.sort((a, b) => (b.rankScore || 0) - (a.rankScore || 0)).slice(0, count)
  }
  
  return sameSource.sort((a, b) => (b.rankScore || 0) - (a.rankScore || 0)).slice(0, count)
}
