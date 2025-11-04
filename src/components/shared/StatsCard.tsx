'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { colors, spacing, typography, sizing, effects } from '@/lib/utils/design-system'

interface StatsCardProps {
  title: string
  value: number | string
  icon?: IconDefinition
  loading?: boolean
  className?: string
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  loading = false,
  className = ''
}: StatsCardProps) {
  return (
    <div className={`${colors.card.background} ${effects.rounded} ${colors.card.border} ${spacing.card} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`${typography.body} ${colors.text.secondary} font-medium`}>
            {title}
          </p>
          {loading ? (
            <div className={`mt-2 h-7 w-20 ${colors.skeleton.background} animate-pulse ${effects.rounded}`} />
          ) : (
            <p className={`${typography.statValue} mt-1.5 ${colors.text.primary}`}>
              {value}
            </p>
          )}
        </div>
        {Icon && (
          <div className="ml-4">
            <div className={`p-2.5 ${colors.primary.background} ${effects.rounded}`}>
              <FontAwesomeIcon icon={Icon} className={`${sizing.icon.large} ${colors.primary.DEFAULT}`} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
