"use client";

import { useEffect, useState } from "react";
import api from "@/lib/utils/api-client";
import { Plus, Check, X } from "lucide-react";

/*
  Endpoints usati:
  - /auth/me                    → dati utente loggato (ruolo + eventuale student)
  - /exam-sessions              → crea / lista / modifica / elimina sessioni
  - /subjects                   → per select materie
  - /courses                    → per select corsi
  - /exam-results?status=pending→ voti proposti dai test (per i docenti)
  - /exam-results/:id (PATCH)   → confermare / rifiutare
  - /students/me/grades         → voti dello studente loggato
*/

const EXAM_SESSIONS_ENDPOINT = "/exam-sessions";
const SUBJECTS_ENDPOINT = "/subjects";
const COURSES_ENDPOINT = "/courses";
const PENDING_RESULTS_ENDPOINT = "/exam-results?status=pending";
const CONFIRM_RESULT_ENDPOINT = "/exam-results";

type Subject = { id: number; name: string };
type Course = { id: number; name: string };

type ExamSession = {
  id: number;
  title?: string | null;
  date?: string;
  exam_date?: string;
  subject?: { id: number; name: string };
  course?: { id: number; name: string };
  subject_id?: number;
  course_id?: number;
  notes?: string | null;
  exam_time?: string | null;
};

type PendingResult = {
  id: number;
  student?: {
    id: number;
    user?: {
      name?: string;
      firstName?: string;
      first_name?: string;
      lastName?: string;
      last_name?: string;
    };
  };
  student_id?: number;
  exam_session?: {
    id: number;
    title?: string;
    subject?: { name: string };
  };
  exam_session_id?: number;
  grade?: number;
  status?: string;
};

type User = {
  id: number;
  role: "admin" | "professor" | "tutor" | "student" | string;
  student?: { id: number } | null;
};

type StudentGrade = {
  id: number;
  grade: number | null;
  passed: boolean;
  examSession?: {
    id: number;
    exam_date?: string;
    exam_time?: string | null;
    subject?: { name: string };
    course?: { name: string };
  };
};

const EDIT_ROLES = ["admin", "professor", "tutor"];

/* ───────────────────────────────
   ROOT: decide vista in base al ruolo
   ─────────────────────────────── */
export default function ExamsPage() {
  const [me, setMe] = useState<User | null>(null);
  const [loadingMe, setLoadingMe] = useState(true);

  useEffect(() => {
    let mounted = true;
    api
      .get("/auth/me")
      .then((res) => {
        if (mounted) setMe(res.data);
      })
      .catch(() => {
        if (mounted) setMe(null);
      })
      .finally(() => {
        if (mounted) setLoadingMe(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loadingMe) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-6">Caricamento...</div>
      </div>
    );
  }

  // se è STUDENTE → vista dedicata
  if (me?.role === "student") {
    return <StudentExamsView />;
  }

  // altrimenti (admin, prof, tutor, ecc.) → vista gestione sessioni + voti
  return <TeacherExamsView />;
}

/* ───────────────────────────────
   VISTA DOCENTE / ADMIN / TUTOR
   ─────────────────────────────── */
function TeacherExamsView() {
  const [activeTab, setActiveTab] = useState<"sessions" | "pending">("sessions");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Esami</h1>
            <p className="text-gray-500">
              Crea le sessioni e gestisci i voti degli studenti.
            </p>
          </div>

          <div className="inline-flex bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab("sessions")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeTab === "sessions"
                  ? "bg-black text-white"
                  : "text-gray-700"
              }`}
            >
              Sessioni
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeTab === "pending"
                  ? "bg-black text-white"
                  : "text-gray-700"
              }`}
            >
              Voti / Conferma
            </button>
          </div>
        </header>

        {activeTab === "sessions" ? <SessionsSection /> : <PendingResultsSection />}
      </div>
    </div>
  );
}

/* ───────────────────────────────
   1) SEZIONE SESSIONI ESAME
   ─────────────────────────────── */
function SessionsSection() {
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ExamSession | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadAll() {
      try {
        const [sessRes, subjRes, courseRes] = await Promise.all([
          api.get(EXAM_SESSIONS_ENDPOINT).catch(() => ({ data: [] })),
          api.get(SUBJECTS_ENDPOINT).catch(() => ({ data: [] })),
          api.get(COURSES_ENDPOINT).catch(() => ({ data: [] })),
        ]);

        if (!mounted) return;
        setSessions(Array.isArray(sessRes.data) ? sessRes.data : []);
        setSubjects(Array.isArray(subjRes.data) ? subjRes.data : []);
        setCourses(Array.isArray(courseRes.data) ? courseRes.data : []);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadAll();
    return () => {
      mounted = false;
    };
  }, []);

  const handleCreated = (s: ExamSession) => {
    setSessions((prev) => [s, ...prev]);
  };

  const handleUpdated = (s: ExamSession) => {
    setSessions((prev) => prev.map((item) => (item.id === s.id ? s : item)));
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Vuoi davvero eliminare questa sessione?")) return;
    try {
      await api.delete(`${EXAM_SESSIONS_ENDPOINT}/${id}`);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch {
      alert("Errore durante l'eliminazione");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-black text-white shadow"
        >
          <Plus size={16} />
          Nuova sessione
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">Materia</th>
              <th className="text-left p-3">Corso</th>
              <th className="text-left p-3">Data/Ora</th>
              <th className="text-right p-3">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">
                  Caricamento...
                </td>
              </tr>
            ) : sessions.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">
                  Nessuna sessione d’esame creata.
                </td>
              </tr>
            ) : (
              sessions.map((s) => {
                const dateStr =
                  s.exam_date ?? s.date ?? null;
                const timeStr = s.exam_time ?? null;
                const formatted = dateStr
                  ? new Date(dateStr).toLocaleDateString("it-IT") +
                    (timeStr ? ` ${timeStr.slice(0, 5)}` : "")
                  : "—";

                return (
                  <tr key={s.id} className="border-t">
                    <td className="p-3">
                      {s.subject?.name ??
                        (s.subject_id ? `Materia #${s.subject_id}` : "—")}
                    </td>
                    <td className="p-3">
                      {s.course?.name ??
                        (s.course_id ? `Corso #${s.course_id}` : "—")}
                    </td>
                    <td className="p-3">{formatted}</td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditing(s);
                          setOpen(true);
                        }}
                        className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200"
                      >
                        Modifica
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="px-3 py-1 text-sm rounded bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        Elimina
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <CreateExamSessionModal
          subjects={subjects}
          courses={courses}
          onClose={() => setOpen(false)}
          onCreated={handleCreated}
          onUpdated={handleUpdated}
          session={editing}
        />
      )}
    </div>
  );
}

/* modal create / edit sessione */
function CreateExamSessionModal({
  subjects,
  courses,
  onClose,
  onCreated,
  onUpdated,
  session,
}: {
  subjects: Subject[];
  courses: Course[];
  onClose: () => void;
  onCreated: (s: ExamSession) => void;
  onUpdated: (s: ExamSession) => void;
  session?: ExamSession | null;
}) {
  const isEdit = !!session;

  const initialDate =
    session?.date ??
    (session?.exam_date ? session.exam_date.slice(0, 10) : "");

  const [subjectId, setSubjectId] = useState(
    (session?.subject_id ?? session?.subject?.id)?.toString() ?? ""
  );
  const [courseId, setCourseId] = useState(
    (session?.course_id ?? session?.course?.id)?.toString() ?? ""
  );
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(session?.exam_time?.slice(0, 5) ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!subjectId || !courseId || !date) {
      setError("Materia, corso e data sono obbligatori.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        subject_id: Number(subjectId),
        course_id: Number(courseId),
        exam_date: date,
        exam_time: time || null,
      };

      if (isEdit) {
        const res = await api.patch(
          `${EXAM_SESSIONS_ENDPOINT}/${session!.id}`,
          payload
        );
        onUpdated(res.data);
      } else {
        const res = await api.post(EXAM_SESSIONS_ENDPOINT, payload);
        onCreated(res.data);
      }
      onClose();
    } catch {
      setError("Errore nel salvataggio della sessione.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white text-gray-900 rounded-xl w-[680px] p-6 shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {isEdit ? "Modifica sessione d’esame" : "Nuova sessione d’esame"}
          </h3>
          <button onClick={onClose} className="text-gray-500">
            Chiudi
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1">Materia</label>
            <select
              className="w-full p-2 border rounded bg-white"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
            >
              <option value="">Seleziona</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Corso</label>
            <select
              className="w-full p-2 border rounded bg-white"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            >
              <option value="">Seleziona</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Data</label>
            <input
              type="date"
              className="w-full p-2 border rounded bg-white"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Ora (facoltativa)</label>
            <input
              type="time"
              className="w-full p-2 border rounded bg-white"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          {error && (
            <div className="col-span-2 rounded bg-red-100 text-red-700 px-3 py-2">
              {error}
            </div>
          )}

          <div className="col-span-2 flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded bg-black text-white"
            >
              {saving
                ? "Salvo..."
                : isEdit
                ? "Salva modifiche"
                : "Crea sessione"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ───────────────────────────────
   2) VOTI / CONFERMA (DOCENTE)
   Sessioni → clic → gestione voti studenti
   ─────────────────────────────── */
function PendingResultsSection() {
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<ExamSession | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await api.get("/exam-sessions");
        if (!mounted) return;
        setSessions(Array.isArray(res.data) ? res.data : []);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, []);

  if (selectedSession) {
    return (
      <SessionGradesEditor
        session={selectedSession}
        onBack={() => setSelectedSession(null)}
      />
    );
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <table className="w-full table-auto">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-3">Materia</th>
            <th className="text-left p-3">Corso</th>
            <th className="text-left p-3">Data/Ora</th>
            <th className="text-right p-3">Azioni</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td className="p-6 text-center text-gray-500" colSpan={4}>
                Caricamento...
              </td>
            </tr>
          ) : sessions.length === 0 ? (
            <tr>
              <td className="p-6 text-center text-gray-500" colSpan={4}>
                Nessuna sessione trovata.
              </td>
            </tr>
          ) : (
            sessions.map((s) => {
              const dateStr = s.exam_date ?? s.date ?? null;
              const timeStr = s.exam_time ?? null;
              const formatted = dateStr
                ? new Date(dateStr).toLocaleDateString("it-IT") +
                  (timeStr ? ` ${timeStr.slice(0, 5)}` : "")
                : "—";

              return (
                <tr key={s.id} className="border-t">
                  <td className="p-3">{s.subject?.name ?? "—"}</td>
                  <td className="p-3">{s.course?.name ?? "—"}</td>
                  <td className="p-3">{formatted}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setSelectedSession(s)}
                      className="px-3 py-1 text-sm rounded bg-black text-white"
                    >
                      Gestisci voti
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ───────────────────────────────
   EDITOR VOTI STUDENTI PER SESSIONE
   ─────────────────────────────── */
function SessionGradesEditor({
  session,
  onBack,
}: {
  session: ExamSession;
  onBack: () => void;
}) {
  const [students, setStudents] = useState<any[]>([]);
  const [grades, setGrades] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        // 1️⃣ Otteniamo gli studenti iscritti al corso della sessione
        const res = await api.get(`/courses/${session.course_id}/students`);
        
        // 2️⃣ Otteniamo eventuali voti già salvati
        const resultsRes = await api.get(`/exam-results?session=${session.id}`);

        if (!mounted) return;

        setStudents(res.data || []);

        const gradeMap: Record<number, string> = {};
        (resultsRes.data || []).forEach((r: any) => {
          gradeMap[r.student_id] = r.grade?.toString() ?? "";
        });

        setGrades(gradeMap);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [session.id, session.course_id]);

  const handleSave = async () => {
  setSaving(true);

  try {
    const updates = Object.entries(grades).map(([studentId, grade]) => {
      return api.post("/exam-results", {
        exam_session_id: session.id,
        student_id: Number(studentId),
        grade: grade === "" ? null : Number(grade),
      });
    });

    await Promise.all(updates);

    // 🔥 Ricarico i voti aggiornati senza uscire dalla pagina
    const resultsRes = await api.get(`/exam-results?session=${session.id}`);

    const gradeMap: Record<number, string> = {};
    (resultsRes.data || []).forEach((r: any) => {
      gradeMap[r.student_id] = r.grade?.toString() ?? "";
    });

    setGrades(gradeMap);

    alert("Voti aggiornati correttamente!");
  } catch {
    alert("Errore nel salvataggio dei voti.");
  } finally {
    setSaving(false);
  }
};


  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-4">
      <button onClick={onBack} className="text-sm underline text-gray-600">
        ← Torna indietro
      </button>

      <h2 className="text-2xl font-bold">
        Gestione voti – {session.subject?.name} ({session.course?.name})
      </h2>

      {loading ? (
        <div className="text-gray-500 p-4">Caricamento studenti…</div>
      ) : students.length === 0 ? (
        <div className="text-gray-500 p-4">Nessuno studente trovato.</div>
      ) : (
        <table className="w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">Studente</th>
              <th className="text-left p-3">Voto</th>
            </tr>
          </thead>

          <tbody>
            {students.map((st) => (
              <tr key={st.id} className="border-t">
                <td className="p-3">
                  {st.user?.name ??
                    `${st.user?.first_name ?? ""} ${st.user?.last_name ?? ""}`}
                </td>

                <td className="p-3">
                  <input
                    type="number"
                    min={0}
                    max={30}
                    step={1}
                    className="border p-2 rounded w-24"
                    value={grades[st.id] ?? ""}
                    onChange={(e) =>
                      setGrades((prev) => ({
                        ...prev,
                        [st.id]: e.target.value,
                      }))
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded bg-black text-white"
        >
          {saving ? "Salvataggio…" : "Salva voti"}
        </button>
      </div>
    </div>
  );
}


/* ───────────────────────────────
   3) VISTA STUDENTE: SOLO I SUOI VOTI
   ─────────────────────────────── */
function StudentExamsView() {
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        // usa l'endpoint che hai già nel backend
        const res = await api.get<StudentGrade[]>("/students/me/grades");
        if (!mounted) return;
        setGrades(Array.isArray(res.data) ? res.data : []);
      } catch {
        if (mounted) setGrades([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <header>
          <h1 className="text-3xl font-bold">Esami</h1>
          <p className="text-gray-500">
            Qui puoi vedere i voti ottenuti nelle diverse sessioni d'esame.
          </p>
        </header>

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
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-500">
                    Caricamento...
                  </td>
                </tr>
              ) : grades.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-500">
                    Ancora nessun voto disponibile.
                  </td>
                </tr>
              ) : (
                grades.map((g) => {
                  const session = g.examSession;
                  const dateStr = session?.exam_date ?? null;
                  const timeStr = session?.exam_time ?? null;
                  const formattedDate = dateStr
                    ? new Date(dateStr).toLocaleDateString("it-IT") +
                      (timeStr ? ` ${timeStr.slice(0, 5)}` : "")
                    : "—";

                  return (
                    <tr key={g.id} className="border-t">
                      <td className="p-3">
                        {session?.subject?.name ?? "—"}
                      </td>
                      <td className="p-3">
                        {session?.course?.name ?? "—"}
                      </td>
                      <td className="p-3">{formattedDate}</td>
                      <td className="p-3">
                        {g.grade === null ? "—" : g.grade}
                      </td>
                      <td className="p-3">
                        {g.grade === null ? (
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}