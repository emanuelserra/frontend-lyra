"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { studentsService, Student } from "@/services/students.service";

export default function StudentsTable() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const data = await studentsService.getAllStudents();
        setStudents(data);
      } catch (err: any) {
        console.error("Error fetching students:", err);
        setError(err.response?.data?.message || "Errore nel caricamento degli studenti");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const headerBg = isDark ? "var(--sidebar)" : "var(--card)";
  const headerColor = isDark ? "var(--sidebar-foreground)" : "var(--card-foreground)";
  const rowTextColor = "var(--foreground)";
  const rowHoverBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const zebraColor = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)";

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Attivo';
      case 'graduated':
        return 'Diplomato';
      case 'retired':
        return 'Ritirato';
      default:
        return status;
    }
  };

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
          Elenco studenti
        </h4>
      </div>

      {loading ? (
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <p style={{ color: "var(--muted-foreground)" }}>Caricamento...</p>
        </div>
      ) : error ? (
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <p style={{ color: "red" }}>{error}</p>
        </div>
      ) : students.length === 0 ? (
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <p style={{ color: "var(--muted-foreground)" }}>Nessuno studente trovato</p>
        </div>
      ) : (
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
              <th style={{ padding: "0.75rem 1rem" }}>Matricola</th>
              <th style={{ padding: "0.75rem 1rem" }}>Corso</th>
              <th style={{ padding: "0.75rem 1rem" }}>Stato</th>
            </tr>
          </thead>

          <tbody>
            {students.slice(0, 5).map((s, i) => (
              <motion.tr
                key={s.id}
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
                <td style={{ padding: "0.9rem 1rem" }}>
                  {s.user ? `${s.user.first_name} ${s.user.last_name}` : 'N/A'}
                </td>
                <td style={{ padding: "0.9rem 1rem" }}>{s.enrollment_number}</td>
                <td style={{ padding: "0.9rem 1rem" }}>
                  {s.course ? s.course.name : 'N/A'}
                </td>
                <td style={{ padding: "0.9rem 1rem" }}>{getStatusLabel(s.status)}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
