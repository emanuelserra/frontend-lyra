"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/utils/api-client";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const STUDENT_GRADES_ENDPOINT = "/students/me/grades";
const STUDENT_ATTENDANCE_ENDPOINT = "/students/me/attendance";

type StudentAbsenceRow = {
  id: number;
  lesson_date: string | null;
  lesson_start_time: string | null;
  course_name: string | null;
  subject_name: string | null;
  status: "present" | "absent" | "late" | "early_exit";
};


type SubjectName = string;

type StudentGrade = {
  id: number;
  grade: number | string | null; // ✅ accetto anche string perché spesso arriva così
  passed: boolean;
  examSession?: {
    id: number;
    exam_date?: string | null; // "YYYY-MM-DD"
    exam_time?: string | null; // "HH:mm:ss" o "HH:mm"
    subject?: { name: string };
    course?: { name: string };
  };
};

type FrontStats = {
  count: number;
  average: number | null;
  variance: number | null;
  min: number | null;
  max: number | null;
  passedCount: number;
  failedCount: number;
  passRate: number | null;
  distribution: { grade: string; count: number }[];
  trend: { date: string; average: number }[];
};

function toHHmm(time?: string | null) {
  if (!time) return "00:00";
  return time.length >= 5 ? time.slice(0, 5) : "00:00";
}

function safeDateKey(d?: string | null) {
  return d ? d.slice(0, 10) : null;
}

function formatITDate(d?: string | null) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString("it-IT");
}

function toNumberGrade(v: unknown): number | null {
  if (typeof v === "number") return Number.isNaN(v) ? null : v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

export default function StudentReport() {
  const [reportType, setReportType] = useState<"grades" | "attendance">("grades");

  // ---- GRADES ----
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [loadingGrades, setLoadingGrades] = useState(true);

  // ---- ASSENZE ----
    const [absences, setAbsences] = useState<StudentAbsenceRow[]>([]);
    const [loadingAttendance, setLoadingAttendance] = useState(true);


  // filtri student: SOLO materia (nome) + date
  const [filters, setFilters] = useState({
    subjectName: "",
    from: "",
    to: "",
  });

  // Carico tutti i voti di base (senza “applica filtri”)
  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoadingGrades(true);
      try {
        const res = await api.get<StudentGrade[]>(STUDENT_GRADES_ENDPOINT);
        if (!mounted) return;
        setGrades(Array.isArray(res.data) ? res.data : []);
      } catch {
        if (mounted) setGrades([]);
      } finally {
        if (mounted) setLoadingGrades(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);
  useEffect(() => {
  let mounted = true;

  async function loadAbsences() {
    setLoadingAttendance(true);
    try {
      const res = await api.get<StudentAbsenceRow[]>(STUDENT_ATTENDANCE_ENDPOINT);
      if (!mounted) return;

      const rows = Array.isArray(res.data) ? res.data : [];
      // 🔥 SOLO ASSENZE
      setAbsences(rows.filter((r) => r.status === "absent"));
    } catch {
      if (mounted) setAbsences([]);
    } finally {
      if (mounted) setLoadingAttendance(false);
    }
  }

  loadAbsences();
  return () => {
    mounted = false;
  };
}, []);


  // Materie disponibili (in base ai voti)
  const subjectOptions: SubjectName[] = useMemo(() => {
    const set = new Set<string>();
    for (const g of grades) {
      const name = g.examSession?.subject?.name?.trim();
      if (name) set.add(name);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [grades]);

  // Applico filtri SOLO lato front (materia per nome + date)
  const filteredGrades = useMemo(() => {
    const from = filters.from ? new Date(filters.from).getTime() : null;
    const to = filters.to ? new Date(filters.to).getTime() : null;

    return grades.filter((g) => {
      const subject = g.examSession?.subject?.name ?? "";
      if (filters.subjectName && subject !== filters.subjectName) return false;

      const dKey = safeDateKey(g.examSession?.exam_date ?? null);
      if (!dKey) return true;

      const t = new Date(dKey).getTime();
      if (from != null && t < from) return false;
      if (to != null && t > to) return false;
      return true;
    });
  }, [grades, filters]);

  // Ordine: dal più recente al meno recente
  const sortedGrades = useMemo(() => {
    return [...filteredGrades].sort((a, b) => {
      const ad = safeDateKey(a.examSession?.exam_date ?? null);
      const bd = safeDateKey(b.examSession?.exam_date ?? null);

      const at = ad ? new Date(ad).getTime() : 0;
      const bt = bd ? new Date(bd).getTime() : 0;

      if (bt !== at) return bt - at;

      const ah = toHHmm(a.examSession?.exam_time ?? null);
      const bh = toHHmm(b.examSession?.exam_time ?? null);
      return bh.localeCompare(ah);
    });
  }, [filteredGrades]);

const filteredAbsences = useMemo(() => {
  const from = filters.from ? new Date(filters.from).getTime() : null;
  const to = filters.to ? new Date(filters.to).getTime() : null;

  return absences.filter((a) => {
    if (filters.subjectName && a.subject_name !== filters.subjectName) return false;

    const dKey = safeDateKey(a.lesson_date ?? null);
    if (!dKey) return true;

    const t = new Date(dKey).getTime();
    if (from != null && t < from) return false;
    if (to != null && t > to) return false;

    return true;
  });
}, [absences, filters]);


  // ✅ Statistiche lato front (FIX: conversione voto a number)
  const stats: FrontStats = useMemo(() => {
    const numericGrades: number[] = sortedGrades
      .map((g) => toNumberGrade(g.grade))
      .filter((v): v is number => v !== null);

    const count = numericGrades.length;

    const average =
      count > 0 ? numericGrades.reduce((acc, v) => acc + v, 0) / count : null;

    const variance =
      count > 1 && average != null
        ? numericGrades.reduce((acc, v) => acc + Math.pow(v - average, 2), 0) / count
        : null;

    const min = count > 0 ? Math.min(...numericGrades) : null;
    const max = count > 0 ? Math.max(...numericGrades) : null;

    let passedCount = 0;
    let failedCount = 0;

    for (const g of sortedGrades) {
      const gv = toNumberGrade(g.grade);
      if (gv == null) continue;
      if (g.passed) passedCount++;
      else failedCount++;
    }

    const evaluatedCount = passedCount + failedCount; // ✅ meglio di "count" se vuoi ignorare null
    const passRate = evaluatedCount > 0 ? passedCount / evaluatedCount : null;

    const distributionMap: Record<string, number> = {};
    for (const v of numericGrades) {
      const key = String(v);
      distributionMap[key] = (distributionMap[key] ?? 0) + 1;
    }

    const distribution = Object.entries(distributionMap)
      .map(([grade, c]) => ({ grade, count: c }))
      .sort((a, b) => Number(a.grade) - Number(b.grade));

    const trendMap: Record<string, { sum: number; count: number }> = {};
    for (const g of sortedGrades) {
      const dKey = safeDateKey(g.examSession?.exam_date ?? null);
      if (!dKey) continue;

      const gv = toNumberGrade(g.grade);
      if (gv == null) continue;

      if (!trendMap[dKey]) trendMap[dKey] = { sum: 0, count: 0 };
      trendMap[dKey].sum += gv;
      trendMap[dKey].count += 1;
    }

    const trend = Object.entries(trendMap)
      .map(([date, { sum, count }]) => ({ date, average: sum / count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      count,
      average,
      variance,
      min,
      max,
      passedCount,
      failedCount,
      passRate,
      distribution,
      trend,
    };
  }, [sortedGrades]);

  const passFailData = useMemo(
    () => [
      { name: "Superato", value: stats.passedCount },
      { name: "Non superato", value: stats.failedCount },
    ],
    [stats.passedCount, stats.failedCount]
  );

  const hasGrades = sortedGrades.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* HEADER + SWITCH */}
        <header className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {reportType === "grades" ? "Report – Voti" : "Report – Assenze"}
            </h1>
            <p className="text-gray-500 mt-1">
              {reportType === "grades"
                ? "Qui vedi tutti i tuoi voti. Puoi filtrare per materia e data."
                : "Qui vedi tutte le assenze effettuate."}
            </p>

            <div className="inline-flex bg-white rounded-lg p-1 shadow-sm mt-3">
              <button
                onClick={() => setReportType("grades")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  reportType === "grades" ? "bg-black text-white" : "text-gray-700"
                }`}
              >
                Voti
              </button>
              <button
                onClick={() => setReportType("attendance")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  reportType === "attendance" ? "bg-black text-white" : "text-gray-700"
                }`}
              >
                Assenze
              </button>
            </div>
          </div>
        </header>

        {/* ----------- REPORT VOTI ----------- */}
        {reportType === "grades" && (
          <>
            {/* FILTRI (solo materia nome + data) */}
            <div className="bg-white shadow rounded-xl p-4 grid grid-cols-4 gap-4">
              <select
                value={filters.subjectName}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, subjectName: e.target.value }))
                }
                className="border p-2 rounded"
              >
                <option value="">Tutte le materie</option>
                {subjectOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>

              <input
                type="date"
                className="border p-2 rounded"
                value={filters.from}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, from: e.target.value }))
                }
              />

              <input
                type="date"
                className="border p-2 rounded"
                value={filters.to}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, to: e.target.value }))
                }
              />

              <button
                type="button"
                onClick={() => setFilters({ subjectName: "", from: "", to: "" })}
                className="px-4 py-2 rounded-md border border-gray-300 text-sm"
              >
                Reset filtri
              </button>
            </div>

            {/* STATISTICHE + GRAFICI */}
            {loadingGrades ? (
              <div className="bg-white rounded-xl shadow p-6 text-gray-500">
                Caricamento...
              </div>
            ) : hasGrades ? (
              <div className="bg-white shadow rounded-xl p-4 space-y-6">
                <h2 className="text-xl font-semibold">Statistiche</h2>

                <div className="grid grid-cols-4 gap-4">
                  <div className="border p-4 rounded">
                    <h3 className="font-bold text-sm text-gray-500">Numero voti</h3>
                    <p className="text-2xl">{stats.count}</p>
                  </div>

                  <div className="border p-4 rounded">
                    <h3 className="font-bold text-sm text-gray-500">Media</h3>
                    <p className="text-2xl">
                      {stats.average != null ? stats.average.toFixed(2) : "—"}
                    </p>
                  </div>

                  <div className="border p-4 rounded">
                    <h3 className="font-bold text-sm text-gray-500">Varianza</h3>
                    <p className="text-2xl">
                      {stats.variance != null ? stats.variance.toFixed(2) : "—"}
                    </p>
                  </div>

                  <div className="border p-4 rounded">
                    <h3 className="font-bold text-sm text-gray-500">Pass rate</h3>
                    <p className="text-2xl">
                      {stats.passRate != null
                        ? `${(stats.passRate * 100).toFixed(1)}%`
                        : "—"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="border p-4 rounded">
                    <h3 className="font-semibold mb-2">Distribuzione voti</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={stats.distribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="grade" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="border p-4 rounded">
                    <h3 className="font-semibold mb-2">Trend nel tempo (media)</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={stats.trend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={(v) => formatITDate(v)} />
                        <YAxis />
                        <Tooltip labelFormatter={(v) => formatITDate(String(v))} />
                        <Line type="monotone" dataKey="average" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="border p-4 rounded">
                    <h3 className="font-semibold mb-2">
                      Esiti (superati / non superati)
                    </h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={passFailData}
                          dataKey="value"
                          nameKey="name"
                          outerRadius={80}
                          label
                        >
                          <Cell fill="#22c55e" />
                          <Cell fill="#ef4444" />
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow p-6 text-gray-500">
                Nessun voto trovato con questi filtri.
              </div>
            )}

            {/* TABELLA VOTI */}
            {!loadingGrades && hasGrades && (
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full table-auto">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left p-3">Materia</th>
                      <th className="text-left p-3">Corso</th>
                      <th className="text-left p-3">Data/Ora</th>
                      <th className="text-left p-3">Voto</th>
                      <th className="text-left p-3">Esito</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedGrades.map((g) => {
                      const session = g.examSession;
                      const dateStr = safeDateKey(session?.exam_date ?? null);
                      const timeStr = toHHmm(session?.exam_time ?? null);
                      const formatted = dateStr
                        ? `${formatITDate(dateStr)} ${timeStr}`
                        : `— ${timeStr}`;

                      const gv = toNumberGrade(g.grade);

                      return (
                        <tr key={g.id} className="border-t">
                          <td className="p-3">{session?.subject?.name ?? "—"}</td>
                          <td className="p-3">{session?.course?.name ?? "—"}</td>
                          <td className="p-3">{formatted}</td>
                          <td className="p-3">{gv == null ? "—" : gv}</td>
                          <td className="p-3">
                            {gv == null ? (
                              <span className="text-gray-500 text-sm">
                                In attesa di conferma
                              </span>
                            ) : g.passed ? (
                              <span className="inline-flex px-2 py-1 rounded bg-green-100 text-green-800 text-sm">
                                Superato
                              </span>
                            ) : (
                              <span className="inline-flex px-2 py-1 rounded bg-red-100 text-red-800 text-sm">
                                Non superato
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ----------- REPORT ASSENZE (placeholder) ----------- */}
        {reportType === "attendance" && (
  <>
    {/* FILTRI (stessi dei voti) */}
    <div className="bg-white shadow rounded-xl p-4 grid grid-cols-4 gap-4">
      <select
        value={filters.subjectName}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, subjectName: e.target.value }))
        }
        className="border p-2 rounded"
      >
        <option value="">Tutte le materie</option>
        {subjectOptions.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>

      <input
        type="date"
        className="border p-2 rounded"
        value={filters.from}
        onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))}
      />

      <input
        type="date"
        className="border p-2 rounded"
        value={filters.to}
        onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))}
      />

      <button
        type="button"
        onClick={() => setFilters({ subjectName: "", from: "", to: "" })}
        className="px-4 py-2 rounded-md border border-gray-300 text-sm"
      >
        Reset filtri
      </button>
    </div>

    {loadingAttendance ? (
      <div className="bg-white rounded-xl shadow p-6 text-gray-500">
        Caricamento assenze...
      </div>
    ) : (
      <>
        {/* NUMERO ASSENZE */}
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-xl font-semibold">Assenze totali</h2>
          <p className="text-3xl font-bold mt-2">{filteredAbsences.length}</p>
        </div>

        {/* TABELLA ASSENZE */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-3">Materia</th>
                <th className="text-left p-3">Corso</th>
                <th className="text-left p-3">Data</th>
                <th className="text-left p-3">Ora</th>
              </tr>
            </thead>
            <tbody>
              {filteredAbsences.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-500">
                    Nessuna assenza trovata con questi filtri.
                  </td>
                </tr>
              ) : (
                filteredAbsences.map((a) => {
                  const dateStr = safeDateKey(a.lesson_date ?? null);
                  const timeStr = toHHmm(a.lesson_start_time ?? null);

                  return (
                    <tr key={a.id} className="border-t">
                      <td className="p-3">{a.subject_name ?? "—"}</td>
                      <td className="p-3">{a.course_name ?? "—"}</td>
                      <td className="p-3">{dateStr ? formatITDate(dateStr) : "—"}</td>
                      <td className="p-3">{timeStr}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </>
    )}
  </>
)}
      </div>
    </div>
  );
}
