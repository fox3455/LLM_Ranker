'use client'

import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('react-chartjs-2').then(m => m.Bar), { ssr: false })

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface LeaderboardChartProps {
  models: any[]
  period?: 'overall' | 'weekly' | 'monthly'
}

const gradientColors = [
  'rgba(234, 179, 8, 0.8)',
  'rgba(239, 68, 68, 0.8)',
  'rgba(245, 158, 11, 0.8)',
  'rgba(139, 92, 246, 0.8)',
  'rgba(99, 102, 241, 0.8)',
  'rgba(59, 130, 246, 0.8)',
  'rgba(16, 185, 129, 0.8)',
  'rgba(249, 115, 22, 0.8)',
  'rgba(225, 29, 72, 0.8)',
  'rgba(147, 51, 234, 0.8)',
]

export default function LeaderboardChart({ models, period = 'overall' }: LeaderboardChartProps) {
  const getMetric = (model: any) => {
    if (period === 'weekly') return model.weeklyDownloads ?? model.downloads
    if (period === 'monthly') return model.monthlyDownloads ?? model.downloads
    return model.downloads
  }
  
  const top10 = [...models].sort((a, b) => (b.rankScore || 0) - (a.rankScore || 0)).slice(0, 10)

  const data = {
    labels: top10.map(m => m.name.length > 15 ? m.name.substring(0, 13) + '...' : m.name),
    datasets: [
      {
        label: period === 'weekly' ? 'Weekly Downloads' : period === 'monthly' ? 'Monthly Downloads' : 'Total Downloads',
        data: top10.map(m => getMetric(m)),
        backgroundColor: gradientColors.slice(0, top10.length),
        borderColor: gradientColors.map(c => c.replace('0.8', '1')),
        borderWidth: 2,
        borderRadius: 8,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
    ],
  }

  const options = {
    indexAxis: 'y' as const,
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
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context: any) => `${period === 'weekly' ? 'Weekly' : period === 'monthly' ? 'Monthly' : 'Total'} Downloads: ${formatNumber(context.raw)}`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: '#374151',
        },
        ticks: {
          color: '#94a3b8',
          callback: (value: number | string) => {
            if (typeof value === 'number' && value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
            if (typeof value === 'number' && value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
            return value.toString()
          },
        },
      },
      y: {
        grid: { display: false },
        ticks: { color: '#94a3b8' },
      },
    },
  }

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 shadow-xl">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span className="text-yellow-400">📊</span>
        {period === 'weekly' ? 'Weekly' : period === 'monthly' ? 'Monthly' : 'All-Time'} Download Leaderboard (Top 10)
      </h3>
      <div className="h-96">
        <Chart data={data} options={options} />
      </div>
    </div>
  )
}

function formatNumber(num: number): string {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return num.toString()
}
