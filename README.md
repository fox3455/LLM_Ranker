# LLM Ranking - Open Source LLM Directory

A comprehensive directory and ranking system for open source Large Language Models from Hugging Face and Ollama.

## Features

- **Model Discovery**: Browse thousands of open source LLMs
- **Intelligent Ranking**: Models are ranked based on downloads, likes, and use case tags
- **GPUEstimator**: Estimate minimum GPU VRAM requirements based on model size
- **Comparison Tool**: Compare up to 3 models side by side
- **Advanced Filtering**: Filter by downloads, likes, parameter size, and use cases
- **Query Search**: Find specific models quickly

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **TypeScript**: Full type safety
- **Data Sources**: Hugging Face API, Ollama API

## Installation

```bash
# Clone the repository
cd LLM_Ranking

# Install dependencies
npm install

# Run the scraper to populate data
npm run scrape

# Start development server
npm run dev
```

## Project Structure

```
LLM_Ranking/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with header and footer
│   ├── page.tsx           # Home page with featured models
│   ├── search/            # Model search and filtering
│   ├── models/            # Individual model pages
│   └── compare/           # Model comparison page
├── components/            # React components
│   ├── Header.tsx
│   ├── SearchBar.tsx
│   ├── FilterPanel.tsx
│   ├── ModelCard.tsx
│   ├── GPUEstimator.tsx
│   └── CompareTable.tsx
├── lib/                   # Utility functions
│   └── data.ts           # Data loading and filtering logic
├── types/                 # TypeScript type definitions
├── data/                  # Cached model data (auto-generated)
├── scripts/               # Data scraping scripts
├── app/                   # API routes
├── styles/                # Global styles
├── next.config.js         # Next.js configuration
├── tailwind.config.js     # Tailwind configuration
└── package.json           # Dependencies
```

## Data Sources

### Hugging Face Models
- Endpoint: `https://huggingface.co/api/models`
- Only open-source models (Apache-2.0, MIT, Llama licenses)
- Fields: modelId, likes, downloads, tags, pipeline_tag

### Ollama Models  
- Endpoint: `https://ollama.com/api/tags`
- Fields: name, size, parameter_size, model details

## Ranking System

Models are ranked using a weighted formula:

```
Rank Score = (log10(downloads + 1) × 10) + (log10(likes + 1) × 5) + (task_count × 2)
```

This ensures newer models with good adoption are prioritized while still considering community engagement.

## GPU Requirements Estimator

Based on 4-bit quantization (most common for local inference):

- **< 1B params**: < 1 GB VRAM
- **1-7B params**: 4-8 GB VRAM  
- **7-13B params**: 8-16 GB VRAM
- **13-70B params**: 16-40 GB VRAM
- **> 70B params**: 40+ GB VRAM (multiple GPUs recommended)

## Available Use Cases

The system tracks models for:
- Text Generation
- Vision/Image-text-to-text
- Audio/TTS
- Image/Video Generation
- Chat/Conversational
- Translation, Summarization, QA
- And more...

## API Endpoints

### `/api/models`
- `GET` Fetch paginated model list
- Query params: `page`, `limit`, `sort`, `source`

## Running the Scraper

The scraper periodically updates model data from both APIs:

```bash
npm run scrape
```

Data is cached in `/data/models.json` and `/data/scrape-stats.json`.

## Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

 deployment to Vercel is recommended for serverless deployments.

## License

MIT License - feel free to use and modify.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Run tests: `npm test`
4. Run lint: `npm run lint`
5. Submit a pull request
