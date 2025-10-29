"use client";

import { motion } from "framer-motion";
import { FaUserGraduate, FaChalkboardTeacher, FaBook, FaClipboardCheck, FaDatabase } from "react-icons/fa";

export default function DashboardFeatures() {
  const features = [
    { icon: <FaUserGraduate />, title: "Gestione studenti" },
    { icon: <FaChalkboardTeacher />, title: "Gestione docenti" },
    { icon: <FaBook />, title: "Corsi e moduli" },
    { icon: <FaClipboardCheck />, title: "Valutazioni" },
    { icon: <FaDatabase />, title: "Statistiche" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {features.map((feature, idx) => (
        <motion.div
          key={idx}
          whileHover={{ scale: 1.08, rotate: 1 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.02 }}
          className="flex flex-col items-center justify-center p-4 rounded-xl shadow"
          style={{
            backgroundColor: "var(--card)",
            color: "var(--card-foreground)",
            boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
            transition: "background-color .2s ease, color .2s ease, transform .12s ease",
          }}
        >
          <div
            style={{
              color: "var(--primary)", // icona usa colore accent
              marginBottom: 8,
              fontSize: 22,
              lineHeight: 1,
            }}
            aria-hidden
          >
            {feature.icon}
          </div>

          <p
            style={{
              margin: 0,
              fontSize: 13,
              textAlign: "center",
              color: "var(--card-foreground)", // testo leggibile in entrambi i temi
            }}
          >
            {feature.title}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
