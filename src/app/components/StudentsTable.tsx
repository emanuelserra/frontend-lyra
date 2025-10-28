"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function StudentsTable() {
  const students = [
    { name: "Mario Rossi", course: "Informatica", status: "Attivo" },
    { name: "Luca Bianchi", course: "Matematica", status: "Inattivo" },
    { name: "Anna Verdi", course: "Fisica", status: "Attivo" },
  ];

  const [isDark, setIsDark] = useState<boolean>(() =>
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false
  );

  useEffect(() => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    const mo = new MutationObserver(() => {
      setIsDark(html.classList.contains("dark"));
    });
    mo.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);

  const headerBg = isDark ? "var(--sidebar)" : "var(--card)";
  const headerColor = isDark ? "var(--sidebar-foreground)" : "var(--card-foreground)";
  const rowTextColor = "var(--foreground)";
  const rowHoverBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const zebraColor = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)";

  return (
    <div
      className="rounded-xl overflow-hidden shadow"
      style={{
        background: "var(--card)",
        color: "var(--card-foreground)",
        transition: "background-color .2s ease, color .2s ease",
      }}
    >
      <div style={{ padding: "0.75rem 1rem" }}>
        <h4 style={{ margin: 0, fontWeight: 600, color: "var(--card-foreground)" }}>
          Elenco studenti (anteprima)
        </h4>
      </div>

      <table className="w-full" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr
            style={{
              background: headerBg,
              color: headerColor,
              textAlign: "left",
            }}
          >
            <th style={{ padding: "0.75rem 1rem" }}>Nome</th>
            <th style={{ padding: "0.75rem 1rem" }}>Corso</th>
            <th style={{ padding: "0.75rem 1rem" }}>Stato</th>
          </tr>
        </thead>

        <tbody>
          {students.map((s, i) => (
            <motion.tr
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
              whileHover={{ scale: 1.01, backgroundColor: rowHoverBg }}
              style={{
                backgroundColor: i % 2 === 0 ? zebraColor : "transparent",
                borderBottom: `1px solid ${borderColor}`,
                color: rowTextColor,
                transition: "background-color .12s linear, color .12s linear",
              }}
            >
              <td style={{ padding: "0.9rem 1rem" }}>{s.name}</td>
              <td style={{ padding: "0.9rem 1rem" }}>{s.course}</td>
              <td style={{ padding: "0.9rem 1rem" }}>{s.status}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
