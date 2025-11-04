'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock } from '@fortawesome/free-solid-svg-icons'
import { formatDistanceToNow } from 'date-fns'
import { it } from 'date-fns/locale'
import type { RecentActivityCardProps } from '@/lib/types/dashboard.types'
import { colors, spacing, typography, sizing, effects } from '@/lib/utils/design-system'

export default function RecentActivityCard({ activities, loading = false }: RecentActivityCardProps) {
  if (loading) {
    return (
      <div className={`${effects.rounded} ${colors.card.border} ${colors.card.background} ${spacing.card}`}>
        <div className={`flex items-center ${spacing.iconGap} mb-3`}>
          <FontAwesomeIcon icon={faClock} className={`${sizing.icon.medium} ${colors.accent.purple.DEFAULT}`} />
          <h2 className={typography.cardTitle}>Attività Recenti</h2>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`flex ${spacing.iconGap} animate-pulse`}>
              <div className={`${sizing.iconContainer.small} ${colors.skeleton.background} rounded-full flex-shrink-0`} />
              <div className="flex-1 space-y-1.5">
                <div className={`h-3 ${colors.skeleton.background} ${effects.rounded} w-3/4`} />
                <div className={`h-2 ${colors.skeleton.background} ${effects.rounded} w-1/4`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className={`${effects.rounded} ${colors.card.border} ${colors.card.background} ${spacing.card}`}>
        <div className={`flex items-center ${spacing.iconGap} mb-3`}>
          <FontAwesomeIcon icon={faClock} className={`${sizing.icon.medium} ${colors.accent.purple.DEFAULT}`} />
          <h2 className={typography.cardTitle}>Attività Recenti</h2>
        </div>
        <div className="py-8 text-center">
          <FontAwesomeIcon icon={faClock} className={`${sizing.icon.xlarge} mb-2 ${colors.empty.icon}`} />
          <p className={`${typography.body} ${colors.empty.text}`}>Nessuna attività recente</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${effects.rounded} ${colors.card.border} ${colors.card.background} ${spacing.card}`}>
      <div className={`flex items-center ${spacing.iconGap} mb-3`}>
        <FontAwesomeIcon icon={faClock} className={`${sizing.icon.medium} ${colors.accent.purple.DEFAULT}`} />
        <h2 className={typography.cardTitle}>Attività Recenti</h2>
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {activities.map((activity, index) => (
          <div key={activity.id} className={`flex ${spacing.iconGap}`}>
            <div className="relative flex-shrink-0">
              <div className={`${sizing.iconContainer.small} rounded-full flex items-center justify-center ${activity.iconColor}`}>
                <FontAwesomeIcon icon={activity.icon} className={`${sizing.icon.small} text-white`} />
              </div>
              {index < activities.length - 1 && (
                <div className={`absolute top-7 left-1/2 -translate-x-1/2 w-px h-3 ${colors.timeline.connector}`} />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className={`${typography.body} ${colors.text.primary} leading-snug`}>
                {activity.message}
              </p>
              <p className={`${typography.cardDescription} ${colors.text.tertiary} mt-0.5`}>
                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true, locale: it })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
