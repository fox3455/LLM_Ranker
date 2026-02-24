'use client'

interface TierBadgeProps {
  rank: number
}

export default function TierBadge({ rank }: TierBadgeProps) {
  const tiers = [
    { name: 'L1', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50', label: 'MYTHIC' },
    { name: 'L2', color: 'bg-purple-500/20 text-purple-400 border-purple-500/50', label: 'LEGENDARY' },
    { name: 'L3', color: 'bg-blue-500/20 text-blue-400 border-blue-500/50', label: 'EPIC' },
    { name: 'L4', color: 'bg-green-500/20 text-green-400 border-green-500/50', label: 'RARE' },
    { name: 'L5', color: 'bg-gray-500/20 text-gray-400 border-gray-500/50', label: 'COMMON' },
  ]

  const tier = tiers[Math.min(rank - 1, 4)]

  return (
    <span className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border
      ${tier.color}
    `}>
      {tier.name} {tier.label}
    </span>
  )
}
