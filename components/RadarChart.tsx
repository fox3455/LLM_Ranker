'use client'

import { Radar } from 'react-chartjs-2'
import { Chart as ChartJS } from 'chart.js'
import {
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale
)

interface RadarChartProps {
  models: any[]
}

const radarLabels = ['Downloads', 'Likes', 'Params(B)', 'VRAM', 'Rank']

export default function RadarChart({ models }: RadarChartProps) {
  const top3 = models.slice(0, 3)

  const data = {
    labels: radarLabels,
    datasets: top3.map((model, index) => {
      const maxDownloads = 200_000_000
      const maxLikes = 5000
      const maxParams = 400
      const maxRank = 100
      const params = parseFloat(model.parameters) || 0

      return {
        label: model.name,
        data: [
          Math.min((model.downloads / maxDownloads) * 100, 100),
          Math.min((model.likes / maxLikes) * 100, 100),
          Math.min((params / maxParams) * 100, 100),
          getVramScore(model.estimatedVram),
          model.rankScore ? Math.min((model.rankScore / maxRank) * 100, 100) : 0,
        ],
        backgroundColor: `rgba(${getRadarColor(index)}, 0.2)`,
        borderColor: `rgba(${getRadarColor(index)}, 1)`,
        borderWidth: 3,
        pointBackgroundColor: `rgba(${getRadarColor(index)}, 1)`,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: `rgba(${getRadarColor(index)}, 1)`,
      }
    }),
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(31, 41, 55, 0.95)',
        titleColor: '#e2e8f0',
        bodyColor: '#94a3b8',
        borderColor: '#475569',
        borderWidth: 1,
        padding: 10,
      },
    },
    scales: {
      r: {
        angleLines: { color: '#475569' },
        grid: { color: '#475569' },
        point: {
          backgroundColor: '#e2e8f0',
        },
        ticks: {
          display: false,
          backdropColor: 'transparent',
        },
        max: 100,
        min: 0,
      },
    },
  }

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 shadow-xl">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span className="text-purple-400">🎯</span>
        Model Comparison Radar
      </h3>
      <div className="h-96 flex items-center justify-center">
        <Radar data={data} options={options} />
      </div>
      
      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        {top3.map((model, index) => (
          <div key={model.id} className="bg-gray-900/50 rounded-lg p-3">
            <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: `rgba(${getRadarColor(index)}, 1)` }} />
            <div className="font-semibold text-sm truncate">{model.name}</div>
            <div className="text-xs text-gray-400">{model.parameters}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function getRadarColor(index: number): string {
  const colors = ['234, 179, 8', '239, 68, 68', '139, 92, 246']
  return colors[index % colors.length]
}

function getVramScore(vram: string): number {
  if (vram === '< 1 GB') return 100
  if (vram === '4-8 GB') return 85
  if (vram === '8-16 GB') return 70
  if (vram === '16-40 GB') return 50
  if (vram === '40+ GB') return 30
  return 0
}
