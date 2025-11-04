'use client'

import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { colors, spacing, typography, sizing, effects } from '@/lib/utils/design-system'

interface PageHeaderProps {
  title: string
  description?: string
  showBackButton?: boolean
  backHref?: string
  children?: React.ReactNode
}

export default function PageHeader({
  title,
  description,
  showBackButton = true,
  backHref = '/home',
  children,
}: PageHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (backHref) {
      router.push(backHref)
    } else {
      router.back()
    }
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <button
              onClick={handleBack}
              className={`
                ${spacing.cardCompact} ${effects.rounded}
                ${colors.card.border} ${colors.card.background}
                hover:bg-gray-50
                ${effects.transition}
              `}
              aria-label="Torna indietro"
            >
              <FontAwesomeIcon icon={faArrowLeft} className={`${sizing.icon.medium} ${colors.text.secondary}`} />
            </button>
          )}
          <div>
            <h1 className={`${typography.pageTitle} ${colors.text.primary}`}>{title}</h1>
            {description && (
              <p className={`${typography.body} ${colors.text.secondary} mt-0.5`}>{description}</p>
            )}
          </div>
        </div>
        {children && <div className="flex items-center gap-3">{children}</div>}
      </div>
    </div>
  )
}
