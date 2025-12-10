"use client";

import { useEffect, useRef, useState } from "react";
import api from "@/lib/utils/api-client";

// Grafici
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

// Export PDF / Excel
import jsPDF from "jspdf";
import * as htmlToImage from "html-to-image";
import * as XLSX from "xlsx";

const REPORT_ENDPOINT = "/reports/grades";
const ATTENDANCE_ENDPOINT = "/reports/attendance";

type Subject = { id: number; name: string };

type Student = {
  id: number;
  user?: {
    name?: string;
    first_name?: string;
    last_name?: string;
  };
};

type Course = {
  id: number;
  name: string;
  subjects?: Subject[];
  students?: Student[];
};

type ReportRow = {
  id: number;
  student_id: number;
  student_name: string;
  course_id: number | null;
  course_name: string | null;
  subject_id: number | null;
  subject_name: string | null;
  exam_session_id: number;
  exam_date: string | null;
  exam_time: string | null;
  grade: number | string | null;
  passed: boolean;
  status: string;
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

/* -------- TIPI PER REPORT PRESENZE / ASSENZE -------- */

type AttendanceStatus = "present" | "absent" | "late" | "early_exit";

type AttendanceRow = {
  id: number;
  student_id: number;
  student_name: string;
  course_id: number | null;
  course_name: string | null;
  subject_id: number | null;
  subject_name: string | null;
  lesson_id: number | null;
  lesson_date: string | null; // "YYYY-MM-DD" (come da service)
  lesson_start_time: string | null;
  lesson_end_time: string | null;
  status: AttendanceStatus;
  justified: boolean;
  note: string | null;
};

type AttendanceStats = {
  total: number;
  presenceCount: number;
  absenceCount: number;
  justifiedAbsenceCount: number;
  earlyExitCount: number;
  lateCount: number;
  presenceRate: number | null;
  absenceRate: number | null;
  distributionByStatus: { status: string; count: number }[];
  trendByDate: { date: string; presenceRate: number }[];
};

export default function GradesReportPage() {
  const [reportType, setReportType] = useState<"grades" | "attendance">(
    "grades"
  );

  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [filters, setFilters] = useState({
    course: "",
    subject: "",
    student: "",
    from: "",
    to: "",
  });

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ReportRow[]>([]);

  const [stats, setStats] = useState<FrontStats>({
    count: 0,
    average: null,
    variance: null,
    min: null,
    max: null,
    passedCount: 0,
    failedCount: 0,
    passRate: null,
    distribution: [],
    trend: [],
  });

  // ---- PRESENZE / ASSENZE ----
  const [attendanceResults, setAttendanceResults] = useState<
    AttendanceRow[]
  >([]);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>({
    total: 0,
    presenceCount: 0,
    absenceCount: 0,
    justifiedAbsenceCount: 0,
    earlyExitCount: 0,
    lateCount: 0,
    presenceRate: null,
    absenceRate: null,
    distributionByStatus: [],
    trendByDate: [],
  });

  const reportRef = useRef<HTMLDivElement | null>(null);

  /* ------------------- FUNZIONE PER NOME STUDENTE ------------------- */
  const getStudentLabel = (s: Student) => {
    const u = s.user;
    if (u?.name && u.name.trim().length > 0) return u.name;
    const full = `${u?.first_name ?? ""} ${u?.last_name ?? ""}`.trim();
    if (full.length > 0) return full;
    return `Studente #${s.id}`;
  };

  /* ------------------- CARICO I CORSI ------------------- */

  useEffect(() => {
    api.get("/courses").then((res) => setCourses(res.data || []));
  }, []);

  /* ------------------- QUANDO CAMBIA IL CORSO CARICO MATERIE + STUDENTI ------------------- */

  useEffect(() => {
    if (!filters.course) {
      setSubjects([]);
      setStudents([]);
      return;
    }

    api.get(`/courses/${filters.course}`).then((res) => {
      const data: Course = res.data;
      setSubjects(data?.subjects || []);
      setStudents(data?.students || []);
    });
  }, [filters.course]);

  /* ------------------- LOAD REPORT (VOTI) ------------------- */

  const loadReport = async () => {
    setLoading(true);

    const params: any = {};
    if (filters.course) params.course_id = Number(filters.course);
    if (filters.subject) params.subject_id = Number(filters.subject);
    if (filters.student) params.student_id = Number(filters.student);
    if (filters.from) params.from_date = filters.from;
    if (filters.to) params.to_date = filters.to;

    try {
      const res = await api.get(REPORT_ENDPOINT, { params });
      const data = res.data || {};

      const grades: ReportRow[] = data.grades || [];
      const backendStats = data.stats || {};

      setResults(grades);

      /* --- Calcolo statistiche lato front --- */

      const numericGrades: number[] = grades
        .map((g) => {
          const value =
            typeof g.grade === "number" ? g.grade : Number(g.grade);
          return Number.isNaN(value) ? null : value;
        })
        .filter((v): v is number => v !== null);

      const count = numericGrades.length;

      const average =
        count > 0
          ? numericGrades.reduce((acc, v) => acc + v, 0) / count
          : null;

      const variance =
        count > 1 && average != null
          ? numericGrades.reduce(
            (acc, v) => acc + Math.pow(v - average, 2),
            0
          ) / count
          : null;

      const min = count > 0 ? Math.min(...numericGrades) : null;
      const max = count > 0 ? Math.max(...numericGrades) : null;

      let passedCount = 0;
      let failedCount = 0;
      for (const r of grades) {
        if (r.grade == null) continue;
        if (r.passed) passedCount++;
        else failedCount++;
      }

      const passRate = count > 0 ? passedCount / count : null;

      const distributionMap: Record<string, number> = {};
      for (const g of numericGrades) {
        const key = String(g);
        distributionMap[key] = (distributionMap[key] ?? 0) + 1;
      }

      const distribution = Object.entries(distributionMap).map(
        ([grade, c]) => ({
          grade,
          count: c,
        })
      );

      const trendMap: Record<string, { sum: number; count: number }> = {};
      for (const r of grades) {
        if (!r.exam_date || r.grade == null) continue;

        const gv =
          typeof r.grade === "number" ? r.grade : Number(r.grade);

        if (Number.isNaN(gv)) continue;

        if (!trendMap[r.exam_date]) {
          trendMap[r.exam_date] = { sum: 0, count: 0 };
        }

        trendMap[r.exam_date].sum += gv;
        trendMap[r.exam_date].count += 1;
      }

      const trend = Object.entries(trendMap)
        .map(([date, { sum, count }]) => ({
          date,
          average: sum / count,
        }))
        .sort(
          (a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

      setStats({
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
      });
    } finally {
      setLoading(false);
    }
  };

  /* ------------------- LOAD REPORT (PRESENZE / ASSENZE) ------------------- */

  const loadAttendanceReport = async () => {
    setLoading(true);

    const params: any = {};
    if (filters.course) params.course_id = Number(filters.course);
    if (filters.subject) params.subject_id = Number(filters.subject);
    if (filters.student) params.student_id = Number(filters.student);
    if (filters.from) params.from_date = filters.from;
    if (filters.to) params.to_date = filters.to;

    try {
      const res = await api.get(ATTENDANCE_ENDPOINT, { params });
      const data = res.data || {};

      const rows: AttendanceRow[] = data.attendance || [];

      setAttendanceResults(rows);

      // --- Statistiche lato front, derivate dalle righe ---

      const total = rows.length;

      const presenceCount = rows.filter((r) => r.status === "present")
        .length;
      const absenceCount = rows.filter((r) => r.status === "absent")
        .length;
      const earlyExitCount = rows.filter(
        (r) => r.status === "early_exit"
      ).length;
      const lateCount = rows.filter((r) => r.status === "late").length;
      const justifiedAbsenceCount = rows.filter(
        (r) => r.status === "absent" && r.justified
      ).length;

      const presenceRate = total > 0 ? presenceCount / total : null;
      const absenceRate = total > 0 ? absenceCount / total : null;

      const distributionMap: Record<string, number> = {};
      for (const r of rows) {
        distributionMap[r.status] =
          (distributionMap[r.status] ?? 0) + 1;
      }
      const distributionByStatus = Object.entries(distributionMap).map(
        ([status, count]) => ({ status, count })
      );

      const trendMap: Record<
        string,
        { present: number; total: number }
      > = {};
      for (const r of rows) {
        if (!r.lesson_date) continue;
        const key = r.lesson_date; // "YYYY-MM-DD"

        if (!trendMap[key]) {
          trendMap[key] = { present: 0, total: 0 };
        }

        trendMap[key].total += 1;
        if (r.status === "present") {
          trendMap[key].present += 1;
        }
      }

      const trendByDate = Object.entries(trendMap)
        .map(([date, { present, total }]) => ({
          date,
          presenceRate: total > 0 ? present / total : 0,
        }))
        .sort(
          (a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

      setAttendanceStats({
        total,
        presenceCount,
        absenceCount,
        justifiedAbsenceCount,
        earlyExitCount,
        lateCount,
        presenceRate,
        absenceRate,
        distributionByStatus,
        trendByDate,
      });
    } finally {
      setLoading(false);
    }
  };

  /* ------------------- EXPORT PDF ------------------- */

  const handleExportPDF = async () => {
    if (!reportRef.current) return;

    const dataUrl = await htmlToImage.toPng(reportRef.current, {
      backgroundColor: "#ffffff",
    });

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();

    const img = new Image();
    img.src = dataUrl;

    img.onload = () => {
      const imgHeight = (img.height * pdfWidth) / img.width;
      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, imgHeight);
      pdf.save(
        reportType === "grades"
          ? "report-voti.pdf"
          : "report-presenze.pdf"
      );
    };
  };

  /* ------------------- EXPORT EXCEL (VOTI) ------------------- */

  const handleExportExcel = () => {
    if (!results.length) return;

    const wb = XLSX.utils.book_new();

    const votesData = [
      ["Studente", "Corso", "Materia", "Data", "Voto", "Esito"],
      ...results.map((r) => [
        r.student_name,
        r.course_name ?? "",
        r.subject_name ?? "",
        r.exam_date
          ? new Date(r.exam_date).toLocaleDateString("it-IT")
          : "",
        r.grade ?? "",
        r.passed ? "Superato" : "Non superato",
      ]),
    ];
    const votesSheet = XLSX.utils.aoa_to_sheet(votesData);
    XLSX.utils.book_append_sheet(wb, votesSheet, "Voti");

    const statsData = [
      ["Numero voti", stats.count],
      ["Media", stats.average ?? ""],
      ["Varianza", stats.variance ?? ""],
      ["Min", stats.min ?? ""],
      ["Max", stats.max ?? ""],
      ["Pass rate (%)", stats.passRate != null ? stats.passRate * 100 : ""],
      ["Superati", stats.passedCount],
      ["Non superati", stats.failedCount],
      [],
      ["Distribuzione voti"],
      ["Voto", "Conteggio"],
      ...stats.distribution.map((d) => [d.grade, d.count]),
    ];
    const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
    XLSX.utils.book_append_sheet(wb, statsSheet, "Statistiche");

    XLSX.writeFile(wb, "report-voti.xlsx");
  };

  /* ------------------- EXPORT EXCEL (PRESENZE) ------------------- */

  const handleExportExcelAttendance = () => {
    if (!attendanceResults.length) return;

    const wb = XLSX.utils.book_new();

    const attData = [
      [
        "Studente",
        "Corso",
        "Materia",
        "Data",
        "Ora inizio",
        "Ora fine",
        "Stato",
        "Giustificata",
      ],
      ...attendanceResults.map((r) => [
        r.student_name,
        r.course_name ?? "",
        r.subject_name ?? "",
        r.lesson_date
          ? new Date(r.lesson_date).toLocaleDateString("it-IT")
          : "",
        r.lesson_start_time ?? "",
        r.lesson_end_time ?? "",
        r.status,
        r.justified ? "Sì" : "No",
      ]),
    ];
    const attSheet = XLSX.utils.aoa_to_sheet(attData);
    XLSX.utils.book_append_sheet(wb, attSheet, "Presenze");

    const statsData = [
      ["Numero lezioni", attendanceStats.total],
      ["Presenze", attendanceStats.presenceCount],
      ["Assenze", attendanceStats.absenceCount],
      ["Assenze giustificate", attendanceStats.justifiedAbsenceCount],
      ["Uscite anticipate", attendanceStats.earlyExitCount],
      ["Ritardi", attendanceStats.lateCount],
      [
        "Presence rate (%)",
        attendanceStats.presenceRate != null
          ? attendanceStats.presenceRate * 100
          : "",
      ],
      [
        "Absence rate (%)",
        attendanceStats.absenceRate != null
          ? attendanceStats.absenceRate * 100
          : "",
      ],
      [],
      ["Distribuzione per stato"],
      ["Stato", "Conteggio"],
      ...attendanceStats.distributionByStatus.map((d) => [
        d.status,
        d.count,
      ]),
    ];
    const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
    XLSX.utils.book_append_sheet(wb, statsSheet, "Statistiche presenze");

    XLSX.writeFile(wb, "report-presenze.xlsx");
  };

  /* ------------------- RENDER ------------------- */

  const hasResults = results.length > 0;
  const hasAttendanceResults = attendanceResults.length > 0;

  const passFailData = [
    { name: "Superato", value: stats.passedCount },
    { name: "Non superato", value: stats.failedCount },
  ];

  const attendancePieData = [
    { name: "Presenze", value: attendanceStats.presenceCount },
    { name: "Assenze", value: attendanceStats.absenceCount },
  ];

  return (
    <div className="p-6 space-y-6" ref={reportRef}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {reportType === "grades" ? "Report – Voti" : "Report – Assenze"}
          </h1>

          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setReportType("grades")}
              className={`px-4 py-2 rounded-md text-sm ${reportType === "grades"
                  ? "bg-black text-white"
                  : "border border-gray-300"
                }`}
            >
              Report Voti
            </button>

            <button
              onClick={() => setReportType("attendance")}
              className={`px-4 py-2 rounded-md text-sm ${reportType === "attendance"
                  ? "bg-black text-white"
                  : "border border-gray-300"
                }`}
            >
              Report Assenze
            </button>
          </div>

          <p className="text-gray-500 mt-2">
            {reportType === "grades"
              ? "Analizza l'andamento dei voti per corso, materia e studente."
              : "Analizza le assenze per corso, materia e studente."}
          </p>
        </div>

        {reportType === "grades" && hasResults && (
          <div className="flex gap-2">
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 rounded-md border border-gray-300 text-sm"
            >
              Esporta PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="px-4 py-2 rounded-md bg-black text-white text-sm"
            >
              Esporta Excel
            </button>
          </div>
        )}

        {reportType === "attendance" && hasAttendanceResults && (
          <div className="flex gap-2">
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 rounded-md border border-gray-300 text-sm"
            >
              Esporta PDF
            </button>
            <button
              onClick={handleExportExcelAttendance}
              className="px-4 py-2 rounded-md bg-black text-white text-sm"
            >
              Esporta Excel
            </button>
          </div>
        )}
      </div>

      {/* ------------- REPORT VOTI ------------- */}
      {reportType === "grades" && (
        <>
          {/* FILTRI */}
          <div className="bg-white shadow rounded-xl p-4 grid grid-cols-5 gap-4">
            <select
              value={filters.course}
              onChange={(e) =>
                setFilters({ ...filters, course: e.target.value })
              }
              className="border p-2 rounded"
            >
              <option value="">Corso...</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={filters.subject}
              onChange={(e) =>
                setFilters({ ...filters, subject: e.target.value })
              }
              className="border p-2 rounded"
              disabled={!subjects.length}
            >
              <option value="">Materia...</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* STUDENTE */}
            <select
              value={filters.student}
              onChange={(e) =>
                setFilters({ ...filters, student: e.target.value })
              }
              className="border p-2 rounded"
              disabled={!students.length}
            >
              <option value="">Studente...</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {getStudentLabel(s)}
                </option>
              ))}
            </select>

            <input
              type="date"
              className="border p-2 rounded"
              value={filters.from}
              onChange={(e) =>
                setFilters({ ...filters, from: e.target.value })
              }
            />

            <input
              type="date"
              className="border p-2 rounded"
              value={filters.to}
              onChange={(e) =>
                setFilters({ ...filters, to: e.target.value })
              }
            />

            <button
              onClick={loadReport}
              disabled={loading}
              className="col-span-5 bg-black text-white rounded-md py-2"
            >
              {loading ? "Caricamento..." : "APPLICA FILTRI"}
            </button>
          </div>

          {/* STATISTICHE + GRAFICI */}
          {hasResults && (
            <div className="bg-white shadow rounded-xl p-4 space-y-6">
              <h2 className="text-xl font-semibold">Statistiche</h2>

              <div className="grid grid-cols-4 gap-4">
                <div className="border p-4 rounded">
                  <h3 className="font-bold text-sm text-gray-500">
                    Numero voti
                  </h3>
                  <p className="text-2xl">{stats.count}</p>
                </div>

                <div className="border p-4 rounded">
                  <h3 className="font-bold text-sm text-gray-500">Media</h3>
                  <p className="text-2xl">
                    {stats.average != null
                      ? stats.average.toFixed(2)
                      : "—"}
                  </p>
                </div>

                <div className="border p-4 rounded">
                  <h3 className="font-bold text-sm text-gray-500">
                    Varianza
                  </h3>
                  <p className="text-2xl">
                    {stats.variance != null
                      ? stats.variance.toFixed(2)
                      : "—"}
                  </p>
                </div>

                <div className="border p-4 rounded">
                  <h3 className="font-bold text-sm text-gray-500">
                    Pass rate
                  </h3>
                  <p className="text-2xl">
                    {stats.passRate != null
                      ? `${(stats.passRate * 100).toFixed(1)}%`
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {/* Distribuzione voti */}
                <div className="border p-4 rounded">
                  <h3 className="font-semibold mb-2">
                    Distribuzione voti
                  </h3>
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

                {/* Trend nel tempo */}
                <div className="border p-4 rounded">
                  <h3 className="font-semibold mb-2">
                    Trend nel tempo (media)
                  </h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={stats.trend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) =>
                          new Date(value).toLocaleDateString("it-IT")
                        }
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(value) =>
                          new Date(value).toLocaleDateString("it-IT")
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="average"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Esiti */}
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
          )}

          {/* TABELLONE */}
          {hasResults && (
            <div className="bg-white shadow rounded-xl overflow-hidden">
              <table className="w-full table-auto">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">Studente</th>
                    <th className="p-3 text-left">Corso</th>
                    <th className="p-3 text-left">Materia</th>
                    <th className="p-3 text-left">Data</th>
                    <th className="p-3 text-left">Voto</th>
                    <th className="p-3 text-left">Esito</th>
                  </tr>
                </thead>

                <tbody>
                  {results.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="p-3">{r.student_name}</td>
                      <td className="p-3">{r.course_name ?? "—"}</td>
                      <td className="p-3">
                        {r.subject_name ?? "—"}
                      </td>
                      <td className="p-3">
                        {r.exam_date
                          ? new Date(
                            r.exam_date
                          ).toLocaleDateString("it-IT")
                          : "—"}
                      </td>
                      <td className="p-3">{r.grade ?? "—"}</td>
                      <td className="p-3">
                        {r.grade == null ? (
                          <span className="text-gray-500 text-sm">
                            In attesa di conferma
                          </span>
                        ) : r.passed ? (
                          <span className="text-green-600 text-sm">
                            Superato
                          </span>
                        ) : (
                          <span className="text-red-600 text-sm">
                            Non superato
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!hasResults && !loading && (
            <p className="text-gray-500">
              Applica un filtro e genera il report per vedere i risultati.
            </p>
          )}
        </>
      )}

      {/* ------------- REPORT ASSENZE ------------- */}
      {reportType === "attendance" && (
        <>
          {/* FILTRI (stessa UX dei voti) */}
          <div className="bg-white shadow rounded-xl p-4 grid grid-cols-5 gap-4">
            <select
              value={filters.course}
              onChange={(e) =>
                setFilters({ ...filters, course: e.target.value })
              }
              className="border p-2 rounded"
            >
              <option value="">Corso...</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={filters.subject}
              onChange={(e) =>
                setFilters({ ...filters, subject: e.target.value })
              }
              className="border p-2 rounded"
              disabled={!subjects.length}
            >
              <option value="">Materia...</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* STUDENTE */}
            <select
              value={filters.student}
              onChange={(e) =>
                setFilters({ ...filters, student: e.target.value })
              }
              className="border p-2 rounded"
              disabled={!students.length}
            >
              <option value="">Studente...</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {getStudentLabel(s)}
                </option>
              ))}
            </select>

            <input
              type="date"
              className="border p-2 rounded"
              value={filters.from}
              onChange={(e) =>
                setFilters({ ...filters, from: e.target.value })
              }
            />

            <input
              type="date"
              className="border p-2 rounded"
              value={filters.to}
              onChange={(e) =>
                setFilters({ ...filters, to: e.target.value })
              }
            />

            <button
              onClick={loadAttendanceReport}
              disabled={loading}
              className="col-span-5 bg-black text-white rounded-md py-2"
            >
              {loading ? "Caricamento..." : "APPLICA FILTRI"}
            </button>
          </div>

          {/* STATISTICHE + GRAFICI PRESENZE */}
          {hasAttendanceResults && (
            <div className="bg-white shadow rounded-xl p-4 space-y-6">
              <h2 className="text-xl font-semibold">
                Statistiche presenze / assenze
              </h2>

              <div className="grid grid-cols-4 gap-4">
                <div className="border p-4 rounded">
                  <h3 className="font-bold text-sm text-gray-500">
                    Numero lezioni
                  </h3>
                  <p className="text-2xl">{attendanceStats.total}</p>
                </div>

                <div className="border p-4 rounded">
                  <h3 className="font-bold text-sm text-gray-500">
                    Presenze
                  </h3>
                  <p className="text-2xl">
                    {attendanceStats.presenceCount}
                  </p>
                </div>

                <div className="border p-4 rounded">
                  <h3 className="font-bold text-sm text-gray-500">
                    Assenze
                  </h3>
                  <p className="text-2xl">
                    {attendanceStats.absenceCount}
                  </p>
                </div>

                <div className="border p-4 rounded">
                  <h3 className="font-bold text-sm text-gray-500">
                    Presence rate
                  </h3>
                  <p className="text-2xl">
                    {attendanceStats.presenceRate != null
                      ? `${(
                        attendanceStats.presenceRate * 100
                      ).toFixed(1)}%`
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {/* Distribuzione per stato */}
                <div className="border p-4 rounded">
                  <h3 className="font-semibold mb-2">
                    Distribuzione presenze / assenze
                  </h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={attendanceStats.distributionByStatus}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Trend nel tempo */}
                <div className="border p-4 rounded">
                  <h3 className="font-semibold mb-2">
                    Trend nel tempo (presence rate)
                  </h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={attendanceStats.trendByDate}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) =>
                          new Date(value).toLocaleDateString("it-IT")
                        }
                      />
                      <YAxis
                        tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                      />
                      <Tooltip
                        labelFormatter={(value) =>
                          new Date(value).toLocaleDateString("it-IT")
                        }
                        formatter={(value: any) =>
                          `${(value * 100).toFixed(1)}%`
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="presenceRate"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Presenze vs Assenze */}
                <div className="border p-4 rounded">
                  <h3 className="font-semibold mb-2">
                    Presenze vs Assenze
                  </h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={attendancePieData}
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
          )}

          {/* TABELLONE PRESENZE */}
          {hasAttendanceResults && (
            <div className="bg-white shadow rounded-xl overflow-hidden">
              <table className="w-full table-auto">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">Studente</th>
                    <th className="p-3 text-left">Corso</th>
                    <th className="p-3 text-left">Materia</th>
                    <th className="p-3 text-left">Data</th>
                    <th className="p-3 text-left">Ora inizio</th>
                    <th className="p-3 text-left">Ora fine</th>
                    <th className="p-3 text-left">Stato</th>
                  </tr>
                </thead>

                <tbody>
                  {attendanceResults.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="p-3">{r.student_name}</td>
                      <td className="p-3">{r.course_name ?? "—"}</td>
                      <td className="p-3">
                        {r.subject_name ?? "—"}
                      </td>
                      <td className="p-3">
                        {r.lesson_date
                          ? new Date(
                            r.lesson_date
                          ).toLocaleDateString("it-IT")
                          : "—"}
                      </td>
                      <td className="p-3">
                        {r.lesson_start_time ?? "—"}
                      </td>
                      <td className="p-3">
                        {r.lesson_end_time ?? "—"}
                      </td>
                      <td className="p-3">
                        {r.status === "present" && (
                          <span className="text-green-600 text-sm">
                            Presente
                          </span>
                        )}
                        {r.status === "absent" && (
                          <span
                            className={`text-sm ${r.justified
                                ? "text-amber-600"
                                : "text-red-600"
                              }`}
                          >
                            {r.justified
                              ? "Assente giustificato"
                              : "Assente"}
                          </span>
                        )}
                        {r.status === "early_exit" && (
                          <span className="text-blue-600 text-sm">
                            Uscita anticipata
                          </span>
                        )}
                        {r.status === "late" && (
                          <span className="text-purple-600 text-sm">
                            In ritardo
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!hasAttendanceResults && !loading && (
            <p className="text-gray-500">
              Applica un filtro e genera il report presenze per vedere i
              risultati.
            </p>
          )}
        </>
      )}
    </div>
  );
}

