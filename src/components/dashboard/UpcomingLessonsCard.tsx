'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarDays, faClipboardCheck, faClock } from '@fortawesome/free-solid-svg-icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { UpcomingLessonsCardProps } from '@/lib/types/dashboard.types'
import { colors, spacing, typography, sizing, effects } from '@/lib/utils/design-system'

export default function UpcomingLessonsCard({
  lessons,
  loading = false,
  canRegisterAttendance = false,
  onRegister,
}: UpcomingLessonsCardProps) {
  if (loading) {
    return (
      <div className={`${effects.rounded} ${colors.card.border} ${colors.card.background} ${spacing.card}`}>
        <div className="flex items-center justify-between mb-3">
          <div className={`flex items-center ${spacing.iconGap}`}>
            <FontAwesomeIcon icon={faCalendarDays} className={`${sizing.icon.medium} ${colors.primary.DEFAULT}`} />
            <h2 className={typography.cardTitle}>Prossime Lezioni</h2>
          </div>
        </div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`h-16 ${colors.skeleton.background} animate-pulse ${effects.roundedMd}`} />
          ))}
        </div>
      </div>
    )
  }

  if (lessons.length === 0) {
    return (
      <div className={`${effects.rounded} ${colors.card.border} ${colors.card.background} ${spacing.card}`}>
        <div className={`flex items-center ${spacing.iconGap} mb-3`}>
          <FontAwesomeIcon icon={faCalendarDays} className={`${sizing.icon.medium} ${colors.primary.DEFAULT}`} />
          <h2 className={typography.cardTitle}>Prossime Lezioni</h2>
        </div>
        <div className="py-8 text-center">
          <FontAwesomeIcon icon={faCalendarDays} className={`${sizing.icon.xlarge} mb-2 ${colors.empty.icon}`} />
          <p className={`${typography.body} ${colors.empty.text}`}>Nessuna lezione programmata</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${effects.rounded} ${colors.card.border} ${colors.card.background} ${spacing.card}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`flex items-center ${spacing.iconGap}`}>
          <FontAwesomeIcon icon={faCalendarDays} className={`${sizing.icon.medium} ${colors.primary.DEFAULT}`} />
          <h2 className={typography.cardTitle}>Prossime Lezioni</h2>
        </div>
        <Badge variant="secondary" className={typography.cardDescription}>{lessons.length}</Badge>
      </div>

      <div className="space-y-2 max-h-[320px] overflow-y-auto">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className={`
              ${effects.roundedMd} ${colors.cardInner.border} ${colors.cardInner.background}
              ${spacing.cardInner} ${colors.cardInner.hover} ${effects.transition}
            `}
          >
            <div className={`flex items-start justify-between ${spacing.iconGap}`}>
              <div className="flex-1 min-w-0">
                <div className={`flex items-center ${spacing.iconGap} mb-1`}>
                  <h3 className={`${typography.body} font-medium truncate`}>{lesson.subject}</h3>
                  {lesson.isToday && (
                    <Badge variant="destructive" className={`${typography.cardDescription} px-1.5 py-0`}>OGGI</Badge>
                  )}
                  {lesson.isTomorrow && !lesson.isToday && (
                    <Badge className={`${typography.cardDescription} px-1.5 py-0 ${colors.accent.orange.solid}`}>DOMANI</Badge>
                  )}
                </div>

                <div className={`flex items-center gap-3 ${typography.cardDescription} ${colors.text.tertiary}`}>
                  <div className={`flex items-center ${spacing.iconGapSmall}`}>
                    <FontAwesomeIcon icon={faClock} className={sizing.icon.small} />
                    <span>{lesson.startTime} - {lesson.endTime}</span>
                  </div>
                  {lesson.professor && (
                    <span className="truncate">Prof. {lesson.professor}</span>
                  )}
                </div>
              </div>

              {canRegisterAttendance && onRegister && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRegister(lesson.id)}
                  className="flex-shrink-0 h-7 px-2"
                >
                  <FontAwesomeIcon icon={faClipboardCheck} className={sizing.icon.small} />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
