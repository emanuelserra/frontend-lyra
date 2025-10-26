'use client'

import { motion } from 'framer-motion'

export default function StudentsTable() {
  const students = [
    { name: 'Mario Rossi', course: 'Informatica', status: 'Attivo' },
    { name: 'Luca Bianchi', course: 'Matematica', status: 'Inattivo' },
    { name: 'Anna Verdi', course: 'Fisica', status: 'Attivo' },
  ]

  return (
    <table className="w-full border-collapse text-sm text-gray-700 dark:text-gray-200">
      <thead>
        <tr className="bg-gray-100 dark:bg-gray-700">
          <th className="p-2 text-left">Nome</th>
          <th className="p-2 text-left">Corso</th>
          <th className="p-2 text-left">Stato</th>
        </tr>
      </thead>
      <tbody>
        {students.map((s, i) => (
          <motion.tr
            key={i}
            whileHover={{ scale: 1.01, backgroundColor: 'rgba(59,130,246,0.1)' }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <td className="p-2">{s.name}</td>
            <td className="p-2">{s.course}</td>
            <td className="p-2">{s.status}</td>
          </motion.tr>
        ))}
      </tbody>
    </table>
  )
}

