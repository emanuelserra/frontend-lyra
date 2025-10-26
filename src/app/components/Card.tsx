import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface CardProps {
  title: string
  children: ReactNode
}

export default function Card({ title, children }: CardProps) {
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow hover:shadow-lg transition-all duration-300"
      whileHover={{ scale: 1.03 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">{title}</h3>
      <div>{children}</div>
    </motion.div>
  )
}
