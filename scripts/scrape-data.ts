import fs from 'fs';
import path from 'path';

interface HuggingFaceModel {
  _id: string;
  id: string;
  likes: number;
  trendingScore: number;
  private: boolean;
  downloads: number;
  tags: string[];
  pipeline_tag: string;
  library_name: string;
  createdAt: string;
  modelId: string;
}

interface OllamaModel {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    parent_model: string;
    format: string;
    family: string;
    families: string[] | null;
    parameter_size: string;
    quantization_level: string;
  };
}

interface ProcessedModel {
  id: string;
  name: string;
  source: 'huggingface' | 'ollama';
  downloads: number;
  likes: number;
  tags: string[];
  parameters: string;
  estimatedVram: string;
  sizeBytes: number;
  tasks: string[];
  weeklyDownloads?: number;
  monthlyDownloads?: number;
  trendingScore?: number;
}

interface TrendingItem {
  id: string;
  weeklyDownloads: number;
  monthlyDownloads: number;
  likes: number;
  tags: string[];
}

const TASK_TAGS: Record<string, string> = {
  'text-generation': 'Text Generation',
  'image-text-to-text': 'Vision',
  'audio-to-audio': 'Audio',
  'speech-to-speech': 'TTS',
  'text-to-speech': 'TTS',
  'text-to-image': 'Image Generation',
  'image-to-image': 'Image Generation',
  'video-to-video': 'Video Generation',
  'conversational': 'Chat/Conversational',
  'text-to-video': 'Video Generation',
  'image-classification': 'Image Classification',
  'translation': 'Translation',
  'summarization': 'Summarization',
  'fill-mask': 'NLP',
  'question-answering': 'QA',
  'text-classification': 'Text Classification',
  'token-classification': 'NLP',
  'text2text-generation': 'Text Generation',
  'automatic-speech-recognition': 'ASR',
  'image-segmentation': 'Image Segmentation',
  'audio-classification': 'Audio Classification',
  'voice-activity-detection': 'Voice Detection',
};

async function scrapeHuggingFace(limit: number = 100): Promise<HuggingFaceModel[]> {
  console.log(`Scraping Hugging Face models (limit: ${limit})...`);
  
  const models: HuggingFaceModel[] = [];
  let page = 0;
  
  while (models.length < limit) {
    try {
      const response = await fetch(
        `https://huggingface.co/api/models?limit=100&full=true&page=${page}&sort=downloads`
      );
      
      if (!response.ok) {
        console.error(`Failed to fetch Hugging Face page ${page}: ${response.status}`);
        break;
      }
      
      const data: HuggingFaceModel[] = await response.json();
      
      if (data.length === 0) {
        break;
      }
      
      models.push(...data);
      page++;
      
    } catch (error) {
      console.error(`Error fetching Hugging Face page ${page}:`, error);
      break;
    }
  }
  
  return models.slice(0, limit);
}

<<<<<<< HEAD
=======

>>>>>>> 42df20e2 (New weekly sorting algo)
async function scrapeTrending(): Promise<TrendingItem[]> {
  console.log('Scraping trending models...');

  const trendingModels: TrendingItem[] = [];

  try {
    const weekResponse = await fetch(
      'https://huggingface.co/api/trending?time=week&type=model&limit=20'
    );

    if (weekResponse.ok) {
      const weekData: any = await weekResponse.json();
      for (const item of weekData.recentlyTrending || []) {
        trendingModels.push({
          id: item.repoData.id,
          weeklyDownloads: item.repoData.downloads,
          monthlyDownloads: 0,
          likes: item.repoData.likes,
          tags: item.repoData.tags || [],
        });
      }
    } else {
      console.error(`Failed to fetch weekly trending: ${weekResponse.status}`);
    }

    const monthResponse = await fetch(
      'https://huggingface.co/api/trending?time=month&type=model&limit=20'
    );

    if (monthResponse.ok) {
      const monthData: any = await monthResponse.json();
      for (const item of monthData.recentlyTrending || []) {
        const existing = trendingModels.find(m => m.id === item.repoData.id);
        if (existing) {
          existing.monthlyDownloads = item.repoData.downloads;
        } else {
          trendingModels.push({
            id: item.repoData.id,
            weeklyDownloads: 0,
            monthlyDownloads: item.repoData.downloads,
            likes: item.repoData.likes,
            tags: item.repoData.tags || [],
          });
        }
      }
    } else {
      console.error(`Failed to fetch monthly trending: ${monthResponse.status}`);
    }
  } catch (error) {
    console.error('Error fetching trending models:', error);
  }

  console.log(`Found ${trendingModels.length} trending models:`, trendingModels.map(m => m.id));

  return trendingModels;
}

async function scrapeOllama(): Promise<OllamaModel[]> {
  console.log('Scraping Ollama models...');
  
  try {
    const response = await fetch('https://ollama.com/api/tags');
    
    if (!response.ok) {
      console.error(`Failed to fetch Ollama models: ${response.status}`);
      return [];
    }
    
    const data: { models: OllamaModel[] } = await response.json();
    return data.models;
    
  } catch (error) {
    console.error('Error fetching Ollama models:', error);
    return [];
  }
}

function extractParameters(parameterSize: string): number | null {
  if (!parameterSize || parameterSize === '') return null;
  
  const match = parameterSize.match(/(\d+(?:\.\d+)?)([kKmMgGtT]?)/);
  if (!match) return null;
  
  const [, value, unit] = match;
  const numValue = parseFloat(value);
  
  switch (unit.toLowerCase()) {
    case 'k': return numValue * 1_000;
    case 'm': return numValue * 1_000_000;
    case 'g': return numValue * 1_000_000_000;
    case 't': return numValue * 1_000_000_000_000;
    default: return numValue;
  }
}

function estimateVRAM(sizeBytes: number, params: number | null): string {
  if (!params || params === 0) {
    return 'Unknown';
  }
  
  const paramsBillion = params / 1_000_000_000;
  
  if (paramsBillion < 1) {
    return '< 1 GB';
  } else if (paramsBillion < 7) {
    return '4-8 GB';
  } else if (paramsBillion < 13) {
    return '8-16 GB';
  } else if (paramsBillion < 70) {
    return '16-40 GB';
  } else {
    return '40+ GB (multiple GPUs recommended)';
  }
}

function extractTasks(tags: string[]): string[] {
  const foundTasks: string[] = [];
  
  for (const tag of tags) {
    if (TASK_TAGS[tag]) {
      foundTasks.push(TASK_TAGS[tag]);
    }
  }
  
  if (foundTasks.length === 0) {
    return ['General'];
  }
  
  return [...new Set(foundTasks)];
}

function processModels(
  hfModels: HuggingFaceModel[],
  ollamaModels: OllamaModel[],
  trendingModels: TrendingItem[]
): ProcessedModel[] {
  const processed: ProcessedModel[] = [];
  const trendingMap = new Map(trendingModels.map(m => [m.id, m]));
  
  for (const model of hfModels) {
    const isLicenseOpen = model.tags.some(tag => 
      tag === 'license:apache-2.0' || 
      tag === 'license:mit' || 
      tag === 'license:llama' ||
      tag === 'license:llama2' ||
      tag === 'license:llama3' ||
      tag === 'license:cc-by-sa-4.0' ||
      tag === 'license:openrail'
    );
    
    if (!isLicenseOpen) continue;
    
    const nameParts = model.modelId.split('/');
    const modelName = nameParts.length > 1 ? nameParts[1] : nameParts[0];
    
    const params = extractParameters('');
    const tasks = extractTasks(model.tags);
    
    const trendingData = trendingMap.get(model.modelId);
    const downloads = trendingData?.weeklyDownloads && trendingData?.weeklyDownloads > 0 ? trendingData.weeklyDownloads : model.downloads;

    processed.push({
      id: model.modelId,
      name: modelName,
      source: 'huggingface',
      downloads,
      likes: model.likes,
      tags: model.tags,
      parameters: params ? `${(params / 1_000_000_000).toFixed(2)}B` : 'Unknown',
      estimatedVram: 'Unknown',
      sizeBytes: 0,
      tasks,
<<<<<<< HEAD
<<<<<<< HEAD
      weeklyDownloads: trendingData?.weeklyDownloads,
      monthlyDownloads: trendingData?.monthlyDownloads, 
=======
      weeklyDownloads: trendingMap.get(model.modelId)?.weeklyDownloads,
      monthlyDownloads: trendingMap.get(model.modelId)?.monthlyDownloads, 
>>>>>>> 42df20e2 (New weekly sorting algo)
=======
      weeklyDownloads: trendingData?.weeklyDownloads,
      monthlyDownloads: trendingData?.monthlyDownloads, 
>>>>>>> fc890171 (Fixed the model leaderboard bar chart.)
    });
  }
  
  for (const model of ollamaModels) {
    const nameParts = model.name.split(':');
    const modelName = nameParts[0];
    
    const params = extractParameters(model.details.parameter_size) || extractParameters(model.details.family || '');
    const sizeBytes = model.size;
    const tasks = extractTasks([]);
    
    processed.push({
      id: model.name,
      name: modelName,
      source: 'ollama',
      downloads: 0,
      likes: 0,
      tags: [],
      parameters: params ? `${(params / 1_000_000_000).toFixed(2)}B` : 'Unknown',
      estimatedVram: estimateVRAM(sizeBytes, params),
      sizeBytes,
      tasks,
    });
  }
  
<<<<<<< HEAD
  // Add trending-only models (that are not in main HF list)
  const seenBeforeTrending = new Set(processed.map(m => m.id));
  console.log("Processing trending models, seen size:", seenBeforeTrending.size);
  for (const trending of trendingModels) {
    if (!seenBeforeTrending.has(trending.id)) {
=======
  
  // Add trending-only models (that are not in main HF list)
  const seenBeforeTrending = new Set(processed.map(m => m.id));
  console.log("Processing trending models, seen size:", seenBeforeTrending.size);
  for (const trending of trendingModels) {
<<<<<<< HEAD
    if (!seen.has(trending.id)) {
>>>>>>> 42df20e2 (New weekly sorting algo)
=======
    if (!seenBeforeTrending.has(trending.id)) {
>>>>>>> fc890171 (Fixed the model leaderboard bar chart.)
      const params = extractParameters('');
      const tasks = extractTasks(trending.tags);
      
      processed.push({
        id: trending.id,
        name: trending.id.split('/')[1] || trending.id.split('/')[0],
        source: 'huggingface' as const,
<<<<<<< HEAD
<<<<<<< HEAD
        downloads: trending.weeklyDownloads,
=======
        downloads: 0,
>>>>>>> 42df20e2 (New weekly sorting algo)
=======
        downloads: trending.weeklyDownloads,
>>>>>>> fc890171 (Fixed the model leaderboard bar chart.)
        likes: trending.likes,
        tags: trending.tags || [],
        parameters: 'Unknown',
        estimatedVram: 'Unknown',
        sizeBytes: 0,
        tasks,
        weeklyDownloads: trending.weeklyDownloads,
        monthlyDownloads: trending.monthlyDownloads,
        trendingScore: 1,
      });
      console.log("Added trending:", trending.id);
    }
  }
  console.log("After adding trending models, total:", processed.length);
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> fc890171 (Fixed the model leaderboard bar chart.)
  
  // Deduplicate by ID
  const seen = new Set<string>();
  const uniqueProcessed: ProcessedModel[] = [];
  for (const model of processed) {
    if (!seen.has(model.id)) {
      seen.add(model.id);
      uniqueProcessed.push(model);
    }
  }
  return uniqueProcessed;
<<<<<<< HEAD
=======
  return processed;
>>>>>>> 42df20e2 (New weekly sorting algo)
=======
>>>>>>> fc890171 (Fixed the model leaderboard bar chart.)
}

function saveData(models: ProcessedModel[], outputPath: string): void {
  const jsonPath = path.join(outputPath, 'models.json');
  const statsPath = path.join(outputPath, 'scrape-stats.json');
  
  const stats = {
    totalModels: models.length,
    huggingFaceCount: models.filter(m => m.source === 'huggingface').length,
    ollamaCount: models.filter(m => m.source === 'ollama').length,
    timestamp: new Date().toISOString(),
  };
  
  fs.writeFileSync(jsonPath, JSON.stringify(models, null, 2));
  fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
  
  console.log(`Saved ${models.length} models to ${jsonPath}`);
  console.log(`Scrape stats saved to ${statsPath}`);
}

async function main() {
  console.log('Starting LLM model scraper...');
  
  const outputDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const [hfModels, ollamaModels, trendingModels] = await Promise.all([
    scrapeHuggingFace(200),
    scrapeOllama(),
    scrapeTrending(),
  ]);
  
  console.log(`Fetched ${hfModels.length} Hugging Face models`);
  console.log(`Fetched ${ollamaModels.length} Ollama models`);
  console.log(`Fetched ${trendingModels.length} trending models`);
  console.log('Trending models:', trendingModels.map(m => ({id: m.id, weekly: m.weeklyDownloads})));
  
  const processedModels = processModels(hfModels, ollamaModels, trendingModels);
  
  saveData(processedModels, outputDir);
  
  console.log('Scraper completed successfully!');
}

main().catch(console.error);
