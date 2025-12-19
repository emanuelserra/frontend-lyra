"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faBook,
  faCheckCircle,
  faHourglassHalf,
} from "@fortawesome/free-solid-svg-icons";
import { format, isSameDay } from "date-fns";
import { it } from "date-fns/locale";
import { lessonsService, type Lesson } from "@/services/lessons.service";
import api from "@/lib/utils/api-client";

type StudentAttendanceRow = {
  id: number;
  lesson_date: string | null;
  lesson_start_time: string | null;
  lesson_end_time: string | null;
  course_name: string | null;
  subject_name: string | null;
  status: "present" | "absent" | "late" | "early_exit";
};

export default function AttendanceCalendar() {
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [open, setOpen] = React.useState(false);

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [todayLessons, setTodayLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);

  // attendances dello studente loggato (endpoint: /students/me/attendance)
  const [myAttendance, setMyAttendance] = useState<StudentAttendanceRow[]>([]);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [lessonsData, myAttRes] = await Promise.all([
        lessonsService.getAllLessons().catch(() => [] as Lesson[]),
        api.get<StudentAttendanceRow[]>("/students/me/attendance").catch(() => ({ data: [] as StudentAttendanceRow[] })),
      ]);

      setLessons(Array.isArray(lessonsData) ? lessonsData : []);
      setMyAttendance(Array.isArray(myAttRes.data) ? myAttRes.data : []);
    } finally {
      setLoading(false);
    }
  }

  // Mappa chiave "YYYY-MM-DD|HH:mm" -> status
  const attendanceMap = useMemo(() => {
    const map = new Map<string, StudentAttendanceRow>();
    for (const a of myAttendance) {
      const d = a.lesson_date ? a.lesson_date.slice(0, 10) : "";
      const t = a.lesson_start_time ? a.lesson_start_time.slice(0, 5) : "";
      if (!d) continue;
      map.set(`${d}|${t}`, a);
    }
    return map;
  }, [myAttendance]);

  const handleDayClick = (date: Date | undefined) => {
    if (!date) return;

    const dayLessons = lessons.filter((lesson) =>
      isSameDay(new Date(lesson.lesson_date), date)
    );

    setTodayLessons(dayLessons);
    setSelectedDate(date);
    setOpen(true);
  };

  const daysWithLessons = lessons.map((l) => new Date(l.lesson_date));
  const today = new Date();

  const statusLabel = (s: StudentAttendanceRow["status"]) => {
    if (s === "present") return "Presente";
    if (s === "late") return "In ritardo";
    if (s === "early_exit") return "Uscita anticipata";
    return "Assente";
  };

  const statusBadgeVariant = (s: StudentAttendanceRow["status"]) => {
    // Badge shadcn: "default" | "secondary" | "destructive" | "outline"
    if (s === "present") return "default";
    if (s === "absent") return "destructive";
    return "secondary";
  };

  return (
    <>
      <Calendar
        mode="single"
        selected={selectedDate ?? undefined}
        onSelect={handleDayClick}
        className="rounded-md border shadow"
        modifiers={{
          today,
          hasLesson: daysWithLessons,
        }}
        modifiersClassNames={{
          today: "ring-2 ring-blue-400",
          hasLesson: "bg-blue-50 font-semibold",
        }}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Lezioni del{" "}
              {selectedDate && format(selectedDate, "dd MMMM yyyy", { locale: it })}
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <p className="text-center text-gray-500 py-8">Caricamento...</p>
          ) : todayLessons.length > 0 ? (
            <div className="space-y-3 mt-4">
              {todayLessons.map((lesson) => {
                const lessonDateKey = new Date(lesson.lesson_date)
                  .toISOString()
                  .slice(0, 10);

                const startKey = lesson.start_time
                  ? lesson.start_time.slice(0, 5)
                  : "";

                const a = attendanceMap.get(`${lessonDateKey}|${startKey}`) ?? null;

                return (
                  <Card key={lesson.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FontAwesomeIcon
                            icon={faBook}
                            className="w-4 h-4 text-blue-500"
                          />
                          <span className="font-semibold">
                            {lesson.subject?.name ?? "—"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FontAwesomeIcon icon={faClock} className="w-4 h-4" />
                          <span>
                            {lesson.start_time} - {lesson.end_time}
                          </span>
                        </div>

                        <p className="text-sm text-gray-500 mt-1">
                          Prof. {lesson.professor?.user?.first_name}{" "}
                          {lesson.professor?.user?.last_name}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {a ? (
                          <>
                            {/* Qui non abbiamo "confirmed" nel tuo endpoint student/me/attendance,
                                quindi MOSTRO SOLO lo stato. */}
                            <Badge variant={statusBadgeVariant(a.status) as any}>
                              {statusLabel(a.status)}
                            </Badge>

                            {/* Se un domani aggiungi confirmed, puoi riattivare questo */}
                            <Badge variant="outline">
                              <FontAwesomeIcon
                                icon={faCheckCircle}
                                className="w-3 h-3 mr-1"
                              />
                              Registrata
                            </Badge>
                          </>
                        ) : (
                          <Badge variant="secondary">Non registrata</Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              Nessuna lezione in questa data
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
