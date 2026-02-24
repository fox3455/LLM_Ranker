import type { Metadata } from 'next'
import Header from '@/components/Header'
import { loadStats } from '@/lib/data'
import './globals.css'

export const metadata: Metadata = {
  title: 'LLM Ranking - Open Source LLM Directory',
  description: 'Compare, rank, and discover open source LLMs from Hugging Face and Ollama',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const stats = await loadStats()

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Header stats={stats} />
        <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
        <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 py-8">
          <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
            <p className="text-sm">
              Data updated: {stats ? new Date(stats.timestamp).toLocaleDateString() : 'Never'}
            </p>
            <p className="text-xs mt-2">
             _ranking is based on downloads, likes, and use case tags.
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
