'use client'

import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell, faExclamationTriangle, faInfoCircle, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { Badge } from '@/components/ui/badge'
import type { AlertsCardProps, AlertType } from '@/lib/types/dashboard.types'
import { colors, spacing, typography, sizing, effects } from '@/lib/utils/design-system'

const alertConfig: Record<AlertType, { border: string; bg: string; text: string; icon: any }> = {
  error: {
    border: colors.danger.border,
    bg: colors.danger.background,
    text: colors.danger.DEFAULT,
    icon: faExclamationTriangle,
  },
  warning: {
    border: colors.warning.border,
    bg: colors.warning.background,
    text: colors.warning.DEFAULT,
    icon: faExclamationTriangle,
  },
  info: {
    border: colors.info.border,
    bg: colors.info.background,
    text: colors.info.DEFAULT,
    icon: faInfoCircle,
  },
}

export default function AlertsCard({ alerts, loading = false }: AlertsCardProps) {
  if (loading) {
    return (
      <div className={`${effects.rounded} ${colors.card.border} ${colors.card.background} ${spacing.card}`}>
        <div className={`flex items-center ${spacing.iconGap} mb-3`}>
          <FontAwesomeIcon icon={faBell} className={`${sizing.icon.medium} ${colors.accent.orange.DEFAULT}`} />
          <h2 className={typography.cardTitle}>Notifiche</h2>
        </div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`h-14 ${colors.skeleton.background} animate-pulse ${effects.roundedMd}`} />
          ))}
        </div>
      </div>
    )
  }

  if (alerts.length === 0) {
    return (
      <div className={`${effects.rounded} ${colors.card.border} ${colors.card.background} ${spacing.card}`}>
        <div className={`flex items-center ${spacing.iconGap} mb-3`}>
          <FontAwesomeIcon icon={faBell} className={`${sizing.icon.medium} ${colors.accent.orange.DEFAULT}`} />
          <h2 className={typography.cardTitle}>Notifiche</h2>
        </div>
        <div className="py-8 text-center">
          <FontAwesomeIcon icon={faBell} className={`${sizing.icon.xlarge} mb-2 ${colors.empty.icon}`} />
          <p className={`${typography.body} ${colors.empty.text}`}>Nessuna notifica</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${effects.rounded} ${colors.card.border} ${colors.card.background} ${spacing.card}`}>
      <div className={`flex items-center ${spacing.iconGap} mb-3`}>
        <FontAwesomeIcon icon={faBell} className={`${sizing.icon.medium} ${colors.accent.orange.DEFAULT}`} />
        <h2 className={typography.cardTitle}>Notifiche</h2>
      </div>

      <div className="space-y-2">
        {alerts.map((alert) => {
          const config = alertConfig[alert.type]
          const Component = alert.href ? Link : 'div'
          const props = alert.href ? { href: alert.href } : {}

          return (
            <Component
              key={alert.id}
              {...props}
              className={`
                flex items-start ${spacing.iconGap} ${spacing.cardInner} ${effects.roundedMd} border
                ${config.border} ${config.bg}
                ${alert.href ? `${effects.shadow} transition-shadow cursor-pointer` : ''}
              `}
            >
              <FontAwesomeIcon icon={config.icon} className={`${sizing.icon.medium} ${config.text} flex-shrink-0 mt-0.5`} />

              <div className="flex-1 min-w-0">
                <div className={`flex items-center ${spacing.iconGap} mb-0.5`}>
                  <h4 className={`${typography.body} font-medium`}>{alert.title}</h4>
                  {alert.count !== undefined && (
                    <Badge variant="secondary" className={`${typography.cardDescription} px-1.5 py-0`}>{alert.count}</Badge>
                  )}
                </div>
                <p className={`${typography.cardDescription} ${colors.text.secondary}`}>{alert.message}</p>
              </div>

              {alert.href && (
                <FontAwesomeIcon icon={faChevronRight} className={`${sizing.icon.small} ${colors.text.muted} flex-shrink-0 mt-1`} />
              )}
            </Component>
          )
        })}
      </div>
    </div>
  )
}
