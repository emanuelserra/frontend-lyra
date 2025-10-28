'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(
    typeof window !== 'undefined' && localStorage.theme === 'dark'
  )

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.theme = 'dark'
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.theme = 'light'
    }
  }, [darkMode])

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-[var(--card)] text-[var(--card-foreground)] shadow">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="p-2 rounded-full hover:bg-[var(--muted)] transition"
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </header>
  )
}

