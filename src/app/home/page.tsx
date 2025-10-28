'use client'

import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import DashboardFeatures from '../components/DashboardFeatures'
import Card from '../components/Card'
import StudentsTable from '../components/StudentsTable'
import { motion } from 'framer-motion'

export default function HomePage() {
  return (
    <motion.div
      className="flex min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <motion.main
          className="p-6 flex-1 overflow-auto space-y-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <DashboardFeatures />

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card title="Studenti iscritti"><div className="text-2xl font-bold">1200</div></Card>
            <Card title="Corsi attivi"><div className="text-2xl font-bold">25</div></Card>
            <Card title="Docenti"><div className="text-2xl font-bold">40</div></Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card title="Elenco studenti (anteprima)">
              <StudentsTable />
            </Card>
            <Card title="Prossimi eventi">
              <p>Calendario, scadenze, ecc.</p>
            </Card>
          </div>
        </motion.main>
      </div>
    </motion.div>
  )
}
