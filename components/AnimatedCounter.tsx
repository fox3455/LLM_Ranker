'use client'

import { useState, useEffect } from 'react'

interface AnimatedCounterProps {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
}

export default function AnimatedCounter({ 
  value, 
  duration = 1500, 
  prefix = '',
  suffix = ''
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let start = 0
    const stepTime = duration / value
    const timer = setInterval(() => {
      start++
      setDisplayValue(start)
      if (start >= value) {
        clearInterval(timer)
        setDisplayValue(value)
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [value, duration])

  useEffect(() => {
    setDisplayValue(0)
  }, [value])

  const formatted = formatNumber(displayValue)

  return (
    <span className="font-bold">
      {prefix}{formatted}{suffix}
    </span>
  )
}

function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`
  }
  return Math.floor(num).toString()
}
