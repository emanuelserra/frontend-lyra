'use client'

import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth.service'
import { colors, spacing, typography, sizing, effects } from '@/lib/utils/design-system'

export default function Navbar() {
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(
    typeof window !== 'undefined' && localStorage.theme === 'dark'
  )
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.theme = 'dark'
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.theme = 'light'
    }
  }, [darkMode])

  useEffect(() => {
    const storedUser = authService.getStoredUser()
    setUser(storedUser)
  }, [])

  const handleLogout = async () => {
    await authService.logout()
    router.push('/login')
  }

  return (
    <header className={`flex items-center justify-between px-6 py-3 ${colors.navbar.background} ${colors.navbar.border}`}>
      <div>
        <h1 className={`text-lg font-semibold ${colors.navbar.text}`}>Dashboard</h1>
        {user && (
          <p className={`${typography.caption} ${colors.text.secondary}`}>
            {user.first_name} {user.last_name} <span className="text-gray-400">·</span> {user.role}
          </p>
        )}
      </div>
      <div className={`flex items-center ${spacing.iconGap}`}>
        <button
          onClick={handleLogout}
          className={`p-2 ${effects.rounded} hover:bg-gray-100 ${effects.transition} ${colors.danger.DEFAULT}`}
          aria-label="Logout"
        >
          <FontAwesomeIcon icon={faRightFromBracket} className={sizing.icon.medium} />
        </button>
      </div>
    </header>
  )
}

