'use client'

import { motion } from 'framer-motion'
import * as Tooltip from '@radix-ui/react-tooltip'
import { FaHome, FaUserGraduate, FaChalkboardTeacher, FaCalendarAlt } from 'react-icons/fa'
import { useState } from 'react'

const menuItems = [
  { name: 'Dashboard', icon: <FaHome /> },
  { name: 'Studenti', icon: <FaUserGraduate /> },
  { name: 'Corsi', icon: <FaChalkboardTeacher /> },
  { name: 'Eventi', icon: <FaCalendarAlt /> },
]

export default function Sidebar() {
  const [active, setActive] = useState('Dashboard')

  return (
    <Tooltip.Provider delayDuration={150}>
      <motion.aside
        className="w-64 bg-gray-900 text-white flex flex-col h-screen shadow-lg"
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center h-20 border-b border-gray-700">
          <span className="text-2xl font-bold">Lyra</span>
        </div>

        <nav className="flex-1 px-2 py-6 space-y-1">
          {menuItems.map(item => (
            <Tooltip.Root key={item.name}>
              <Tooltip.Trigger asChild>
                <button
                  onClick={() => setActive(item.name)}
                  className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
                    active === item.name ? 'bg-gray-700' : 'hover:bg-gray-800'
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="bg-black text-white text-xs px-2 py-1 rounded shadow"
                  side="right"
                  sideOffset={5}
                >
                  {item.name}
                  <Tooltip.Arrow className="fill-black" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          ))}
        </nav>
      </motion.aside>
    </Tooltip.Provider>
  )
}

