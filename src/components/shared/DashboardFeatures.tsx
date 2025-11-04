import { motion } from 'framer-motion'
import { FaUserGraduate, FaChalkboardTeacher, FaBook, FaClipboardCheck, FaDatabase } from 'react-icons/fa'

export default function DashboardFeatures() {
  const features = [
    { icon: <FaUserGraduate />, title: 'Gestione studenti' },
    { icon: <FaChalkboardTeacher />, title: 'Gestione docenti' },
    { icon: <FaBook />, title: 'Corsi e moduli' },
    { icon: <FaClipboardCheck />, title: 'Valutazioni' },
    { icon: <FaDatabase />, title: 'Statistiche' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {features.map((feature, idx) => (
        <motion.div
          key={idx}
          whileHover={{ scale: 1.08, rotate: 1 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="flex flex-col items-center justify-center bg-white p-4 rounded-xl shadow"
          style={{
            backgroundColor: "var(--card)",            // usa var per light
            color: "var(--card-foreground)",           // testo in base al tema
            boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
            transition: "background-color .2s ease, color .2s ease, transform .12s ease",
          }}
        >

          <div className="text-3xl text-blue-600 mb-2">{feature.icon}</div>
          <p className="text-sm text-gray-700 text-center">{feature.title}</p>
        </motion.div>
      ))}
    </div>
  )
}

