'use client'

import { useState, useEffect, useRef } from 'react'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsFocused(false)
      }
    }

    if (showResults) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showResults])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`
      setShowResults(false)
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
    if (query.length > 0) {
      setShowResults(true)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md">
      <div className={`relative transition-all duration-300 ${isFocused ? 'scale-105 shadow-lg shadow-purple-500/20' : ''}`}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search models..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setShowResults(e.target.value.length > 0)
          }}
          onFocus={handleFocus}
          className="w-full pl-11 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 transition-all shadow-md"
          autoComplete="off"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        {isFocused && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-mono">
            ⌘K
          </div>
        )}
      </div>
      
      {showResults && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl shadow-purple-500/20 overflow-hidden z-50 max-h-80 overflow-y-auto">
          <div className="p-3 border-b border-gray-800 bg-gray-800/50">
            <p className="text-xs text-gray-400">Press Enter to search</p>
          </div>
          <div className="py-2">
            <div className="px-4 py-2 text-sm text-purple-400">Recent Searches</div>
            <div className="px-4 py-2 text-sm text-gray-500">No recent searches</div>
          </div>
        </div>
      )}
    </form>
  )
}
