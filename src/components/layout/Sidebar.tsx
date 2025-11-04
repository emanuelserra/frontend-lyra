'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getMenuItemsByRole, getUserRole, type UserRole } from '@/lib/utils/role-utils'
import { colors, spacing, typography, effects } from '@/lib/utils/design-system'

export default function Sidebar() {
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<UserRole | null>(null)

  useEffect(() => {
    const role = getUserRole()
    setUserRole(role)
  }, [])

  const menuItems = userRole ? getMenuItemsByRole(userRole) : []

  return (
    <aside className={`w-64 ${colors.sidebar.background} ${colors.sidebar.text} flex flex-col h-screen border-r ${colors.sidebar.border}`}>
      <div className={`flex items-center justify-center h-16 border-b ${colors.sidebar.border}`}>
        <span className={`${typography.pageTitle} font-bold`}>Lyra</span>
      </div>

      <nav className={`flex-1 px-3 py-4 ${spacing.section}`}>
        {menuItems.map(item => {
          const isActive = pathname === item.href
          const IconComponent = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center w-full px-3 py-2.5 ${effects.rounded} ${effects.transition}
                ${isActive ? colors.sidebar.itemActive : colors.sidebar.itemHover}
              `}
            >
              <span className="mr-3 text-base">
                <IconComponent />
              </span>
              <span className={`${typography.body} font-medium`}>{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

