'use client'

import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { QuickActionsPanelProps } from '@/lib/types/dashboard.types'
import { colors, spacing, typography, sizing, effects } from '@/lib/utils/design-system'

export default function QuickActionsPanel({ actions }: QuickActionsPanelProps) {
  if (actions.length === 0) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className={`
            group relative overflow-hidden ${effects.rounded}
            ${colors.card.border} ${colors.card.background} ${spacing.card}
            ${effects.transitionAll} ${effects.shadow} ${colors.primary.borderHover}
          `}
        >
          <div className={`flex items-center ${spacing.iconGap}`}>
            <div className={`
              flex ${sizing.iconContainer.medium} items-center justify-center ${effects.rounded}
              ${colors.primary.background} ${colors.primary.DEFAULT}
              ${colors.primary.backgroundHover} ${effects.transition}
            `}>
              <FontAwesomeIcon icon={action.icon} className={sizing.icon.large} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`${typography.cardTitle} ${colors.text.primary}`}>
                {action.label}
              </h3>
              {action.description && (
                <p className={`${typography.cardDescription} ${colors.text.secondary} truncate`}>
                  {action.description}
                </p>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
