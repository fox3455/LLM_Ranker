export interface HuggingFaceModel {
  _id: string
  id: string
  likes: number
  trendingScore: number
  private: boolean
  downloads: number
  tags: string[]
  pipeline_tag: string
  library_name: string
  createdAt: string
  modelId: string
}

export interface OllamaModel {
  name: string
  model: string
  modified_at: string
  size: number
  digest: string
  details: {
    parent_model: string
    format: string
    family: string
    families: string[] | null
    parameter_size: string
    quantization_level: string
  }
}

export interface ProcessedModel {
  id: string
  name: string
  source: 'huggingface' | 'ollama'
  downloads: number
  likes: number
  tags: string[]
  parameters: string
  estimatedVram: string
  sizeBytes: number
  tasks: string[]
  rankScore?: number
  trendingScore?: number
  weeklyDownloads?: number
  monthlyDownloads?: number
}

export interface ScrapeStats {
  totalModels: number
  huggingFaceCount: number
  ollamaCount: number
  timestamp: string
}

export interface FilterState {
  minDownloads: number
  minLikes: number
  maxParameters: number
  selectedTasks: string[]
  selectedVramTiers: string[]
  selectedGPU?: string
}

export interface RankConfig {
  downloadWeight: number
  likeWeight: number
  tagWeight: number
}
