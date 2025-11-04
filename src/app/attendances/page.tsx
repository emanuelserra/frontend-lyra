'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { Calendar, CheckCircle, XCircle, Clock, LogOut } from 'lucide-react'
import { ProtectedRoute, DataTable } from '@/components/shared'
import type { Column } from '@/components/shared'
import { AttendanceForm } from '@/components/forms'
import { Sidebar, Navbar } from '@/components/layout'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { attendanceService } from '@/services/attendance.service'
import { lessonsService } from '@/services/lessons.service'
import { studentsService } from '@/services/students.service'
import { getUserRole } from '@/lib/utils/role-utils'

interface Lesson {
  id: number
  lesson_date: string
  start_time: string
  end_time: string
  subject?: { name: string }
  course?: { id: number; name: string }
}

function AttendancesPage() {
  const [userRole, setUserRole] = useState<string | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [attendances, setAttendances] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    const role = getUserRole()
    setUserRole(role)

    if (role === 'student') {
      fetchMyAttendances()
    } else {
      fetchLessons()
    }
  }, [])

  async function fetchLessons() {
    setLoading(true)
    try {
      const data = await lessonsService.getAllLessons()
      // Sort by date descending
      const sorted = data.sort((a, b) =>
        new Date(b.lesson_date).getTime() - new Date(a.lesson_date).getTime()
      )
      setLessons(sorted)
    } catch (error) {
      console.error('Error fetching lessons:', error)
      toast.error('Errore nel caricamento delle lezioni')
    } finally {
      setLoading(false)
    }
  }

  async function fetchMyAttendances() {
    setLoading(true)
    try {
      const data = await studentsService.getMyAttendances()
      setAttendances(data)
    } catch (error) {
      console.error('Error fetching attendances:', error)
      toast.error('Errore nel caricamento delle presenze')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegisterAttendances(attendancesData: any[]) {
    setFormLoading(true)
    try {
      // Create attendances for the selected lesson
      await Promise.all(
        attendancesData.map(data =>
          attendanceService.createAttendance({
            lesson_id: selectedLesson!.id,
            ...data,
          })
        )
      )

      toast.success('Presenze registrate con successo')
      setIsDialogOpen(false)
      setSelectedLesson(null)
    } catch (error: any) {
      console.error('Error registering attendances:', error)
      toast.error(error.response?.data?.message || 'Errore nella registrazione')
    } finally {
      setFormLoading(false)
    }
  }

  function handleSelectLesson(lessonId: string) {
    const lesson = lessons.find(l => l.id === parseInt(lessonId))
    if (lesson) {
      setSelectedLesson(lesson)
      setIsDialogOpen(true)
    }
  }

  const getStatusBadge = (status: string) => {
    const config: Record<
      string,
      { variant: 'success' | 'default' | 'secondary' | 'destructive'; icon: any; label: string }
    > = {
      present: { variant: 'success', icon: CheckCircle, label: 'Presente' },
      absent: { variant: 'destructive', icon: XCircle, label: 'Assente' },
      late: { variant: 'secondary', icon: Clock, label: 'In ritardo' },
      early_exit: { variant: 'default', icon: LogOut, label: 'Uscita anticipata' },
    }

    const { variant, icon: Icon, label } = config[status] || config.present

    return (
      <Badge variant={variant} className="flex items-center gap-1 w-fit">
        <Icon className="w-3 h-3" />
        {label}
      </Badge>
    )
  }

  // View for STUDENT role
  if (userRole === 'student') {
    const columns: Column<any>[] = [
      {
        header: 'Data',
        accessor: row =>
          format(new Date(row.lesson?.lesson_date), 'dd MMMM yyyy', { locale: it }),
      },
      {
        header: 'Materia',
        accessor: row => row.lesson?.subject?.name || '-',
      },
      {
        header: 'Orario',
        accessor: row => `${row.lesson?.start_time} - ${row.lesson?.end_time}`,
      },
      {
        header: 'Stato',
        accessor: row => getStatusBadge(row.status),
      },
      {
        header: 'Giustificato',
        accessor: row =>
          row.justified ? (
            <Badge variant="default">Sì</Badge>
          ) : (
            <Badge variant="secondary">No</Badge>
          ),
      },
      {
        header: 'Note',
        accessor: row => row.note || '-',
      },
    ]

    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Le Mie Presenze</h1>
                <p className="text-gray-600">
                  Storico delle tue presenze alle lezioni
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <DataTable
                  data={attendances}
                  columns={columns}
                  loading={loading}
                  searchPlaceholder="Cerca per materia..."
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  // View for PROFESSOR/TUTOR/ADMIN
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">Gestione Presenze</h1>
              <p className="text-gray-600">
                Registra le presenze degli studenti per ogni lezione
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Lesson selector */}
              <Card className="p-6 lg:col-span-1">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Seleziona Lezione
                </h2>
                <div className="space-y-4">
                  <Select onValueChange={handleSelectLesson}>
                    <SelectTrigger>
                      <SelectValue placeholder="Scegli una lezione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {lessons.map(lesson => (
                        <SelectItem key={lesson.id} value={String(lesson.id)}>
                          <div className="flex flex-col">
                            <span className="font-medium">{lesson.subject?.name}</span>
                            <span className="text-xs text-gray-500">
                              {format(new Date(lesson.lesson_date), 'dd/MM/yyyy', { locale: it })} -{' '}
                              {lesson.start_time}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {loading && (
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="h-16 bg-gray-200 animate-pulse rounded"
                        ></div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              {/* Recent attendances or instructions */}
              <Card className="p-6 lg:col-span-2">
                <h2 className="text-lg font-semibold mb-4">Istruzioni</h2>

                {userRole === 'professor' && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium mb-1">
                      ℹ️ Filtro Automatico Attivo
                    </p>
                    <p className="text-sm text-blue-700">
                      Visualizzi solo le lezioni delle <strong>materie a te assegnate</strong>.
                      Se non vedi una lezione, verifica con l'Admin che la materia ti sia stata assegnata.
                    </p>
                  </div>
                )}

                <div className="space-y-3 text-sm text-gray-600">
                  <p>1. Seleziona una lezione dal menu a sinistra</p>
                  <p>2. Si aprirà un form con la lista degli studenti del corso</p>
                  <p>3. Imposta lo stato di presenza per ogni studente</p>
                  <p>4. Aggiungi note o giustificazioni se necessario</p>
                  <p>5. Clicca su "Registra Presenze" per salvare</p>
                </div>
              </Card>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Registra Presenze</DialogTitle>
                  <DialogDescription>
                    {selectedLesson && (
                      <>
                        <span className="font-medium">{selectedLesson.subject?.name}</span> -{' '}
                        {format(new Date(selectedLesson.lesson_date), 'dd MMMM yyyy', {
                          locale: it,
                        })}{' '}
                        ore {selectedLesson.start_time}
                      </>
                    )}
                  </DialogDescription>
                </DialogHeader>
                {selectedLesson && (
                  <AttendanceForm
                    lesson_id={selectedLesson.id}
                    courseId={selectedLesson.course?.id || 0}
                    onSubmit={handleRegisterAttendances}
                    onCancel={() => {
                      setIsDialogOpen(false)
                      setSelectedLesson(null)
                    }}
                    loading={formLoading}
                  />
                )}
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'professor', 'tutor', 'student']}>
      <AttendancesPage />
    </ProtectedRoute>
  )
}
