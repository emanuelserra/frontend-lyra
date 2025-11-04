"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faBook, faCheckCircle, faHourglassHalf } from "@fortawesome/free-solid-svg-icons";
import { format, isSameDay } from "date-fns";
import { it } from "date-fns/locale";
import { toast } from "sonner";
import { lessonsService, type Lesson } from "@/services/lessons.service";
import { attendanceService } from "@/services/attendance.service";

export default function AttendanceCalendar() {
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [open, setOpen] = React.useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [todayLessons, setTodayLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLessons();
  }, []);

  async function fetchLessons() {
    try {
      const data = await lessonsService.getAllLessons();
      setLessons(data);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  }

  const handleDayClick = (date: Date | undefined) => {
    if (!date) return;

    const dayLessons = lessons.filter(lesson =>
      isSameDay(new Date(lesson.lesson_date), date)
    );

    setTodayLessons(dayLessons);
    setSelectedDate(date);
    setOpen(true);
  };

  async function handleMarkAttendance(lessonId: number, status: 'present' | 'late' | 'early_exit') {
    setLoading(true);
    try {
      await attendanceService.selfMarkAttendance(lessonId, status);
      toast.success('Presenza registrata! In attesa di conferma del professore');
      fetchLessons();
    } catch (error: any) {
      console.error('Error marking attendance:', error);
      toast.error(error.response?.data?.message || 'Errore nella registrazione');
    } finally {
      setLoading(false);
    }
  }

  const daysWithLessons = lessons.map(l => new Date(l.lesson_date));
  const today = new Date();

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
              Lezioni del {selectedDate && format(selectedDate, 'dd MMMM yyyy', { locale: it })}
            </DialogTitle>
          </DialogHeader>

          {todayLessons.length > 0 ? (
            <div className="space-y-3 mt-4">
              {todayLessons.map(lesson => {
                const isToday = isSameDay(new Date(lesson.lesson_date), today);
                const attendance = (lesson as any).attendances?.[0];

                return (
                  <Card key={lesson.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FontAwesomeIcon icon={faBook} className="w-4 h-4 text-blue-500" />
                          <span className="font-semibold">{lesson.subject?.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FontAwesomeIcon icon={faClock} className="w-4 h-4" />
                          <span>{lesson.start_time} - {lesson.end_time}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Prof. {lesson.professor?.user?.first_name} {lesson.professor?.user?.last_name}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        {attendance ? (
                          <>
                            <Badge variant={attendance.confirmed ? "default" : "secondary"}>
                              <FontAwesomeIcon
                                icon={attendance.confirmed ? faCheckCircle : faHourglassHalf}
                                className="w-3 h-3 mr-1"
                              />
                              {attendance.confirmed ? 'Confermata' : 'In attesa'}
                            </Badge>
                            <Badge variant="outline">
                              {attendance.status === 'present' && 'Presente'}
                              {attendance.status === 'late' && 'In ritardo'}
                              {attendance.status === 'early_exit' && 'Uscita anticipata'}
                              {attendance.status === 'absent' && 'Assente'}
                            </Badge>
                          </>
                        ) : isToday ? (
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleMarkAttendance(lesson.id, 'present')}
                              disabled={loading}
                            >
                              Presente
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkAttendance(lesson.id, 'late')}
                              disabled={loading}
                            >
                              In ritardo
                            </Button>
                          </div>
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
