'use client'

import { useEffect, useState } from 'react'
import { format, isSameDay } from 'date-fns'
import { it } from 'date-fns/locale'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faCalendar, faClock, faUser, faBook } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'sonner'
import { ProtectedRoute } from '@/components/shared'
import { LessonForm } from '@/components/forms'
import { Sidebar, Navbar } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { lessonsService, type Lesson } from '@/services/lessons.service'
import { getUserRole } from '@/lib/utils/role-utils'

function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedDayLessons, setSelectedDayLessons] = useState<Lesson[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | undefined>(undefined)
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    const role = getUserRole()
    setUserRole(role)
    fetchLessons()
  }, [])

  useEffect(() => {
    if (selectedDate) {
      filterLessonsByDate(selectedDate)
    }
  }, [selectedDate, lessons])

  async function fetchLessons() {
    setLoading(true)
    try {
      const data = await lessonsService.getAllLessons()
      setLessons(data)
    } catch (error) {
      console.error('Error fetching lessons:', error)
      toast.error('Errore nel caricamento delle lezioni')
    } finally {
      setLoading(false)
    }
  }

  function filterLessonsByDate(date: Date) {
    const filtered = lessons.filter(lesson =>
      isSameDay(new Date(lesson.lesson_date), date)
    )
    setSelectedDayLessons(filtered)
  }

  async function handleCreateOrUpdate(data: any) {
    setFormLoading(true)
    try {
      if (editingLesson) {
        await lessonsService.updateLesson(editingLesson.id, data)
        toast.success('Lezione aggiornata con successo')
      } else {
        await lessonsService.createLesson(data)
        toast.success('Lezione creata con successo')
      }

      setIsDialogOpen(false)
      setEditingLesson(undefined)
      fetchLessons()
    } catch (error: any) {
      console.error('Error saving lesson:', error)
      toast.error(error.response?.data?.message || 'Errore nel salvataggio')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleDelete(lesson: Lesson) {
    if (!confirm(`Sei sicuro di voler eliminare la lezione di "${lesson.subject?.name}"?`)) {
      return
    }

    try {
      await lessonsService.deleteLesson(lesson.id)
      toast.success('Lezione eliminata con successo')
      fetchLessons()
    } catch (error: any) {
      console.error('Error deleting lesson:', error)
      toast.error(error.response?.data?.message || 'Errore nell\'eliminazione')
    }
  }

  function handleEdit(lesson: Lesson) {
    setEditingLesson(lesson)
    setIsDialogOpen(true)
  }

  function handleCloseDialog() {
    setIsDialogOpen(false)
    setEditingLesson(undefined)
  }

  const canCreateLesson = userRole === 'admin' || userRole === 'professor'
  const canEdit = userRole === 'admin' || userRole === 'professor'
  const canDelete = userRole === 'admin'

  const daysWithLessons = lessons.map(l => new Date(l.lesson_date))

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Calendario Lezioni</h1>
                <p className="text-gray-600">
                  {userRole === 'professor' && 'Visualizzi solo le lezioni delle tue materie assegnate'}
                  {userRole === 'student' && 'Visualizzi le lezioni del tuo corso'}
                  {userRole === 'tutor' && 'Visualizzi tutte le lezioni'}
                  {userRole === 'admin' && 'Gestisci tutte le lezioni del sistema'}
                </p>
              </div>
              {canCreateLesson && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <FontAwesomeIcon icon={faPlus} className="w-4 h-4 mr-2" />
                  Nuova Lezione
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-6 lg:col-span-1">
                <h2 className="text-lg font-semibold mb-4">
                  <FontAwesomeIcon icon={faCalendar} className="w-5 h-5 mr-2" />
                  Seleziona Data
                </h2>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  modifiers={{
                    hasLesson: daysWithLessons,
                  }}
                  modifiersClassNames={{
                    hasLesson: 'bg-blue-100 font-bold',
                  }}
                />
                <div className="mt-4 text-xs text-gray-500">
                  <p className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-blue-100 rounded"></span>
                    Giorno con lezioni
                  </p>
                </div>
              </Card>

              <Card className="p-6 lg:col-span-2">
                <h2 className="text-lg font-semibold mb-4">
                  Lezioni del {selectedDate && format(selectedDate, 'dd MMMM yyyy', { locale: it })}
                </h2>

                {loading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-24 bg-gray-200 animate-pulse rounded"></div>
                    ))}
                  </div>
                ) : selectedDayLessons.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDayLessons.map(lesson => (
                      <div
                        key={lesson.id}
                        className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <FontAwesomeIcon icon={faBook} className="w-4 h-4 text-blue-500" />
                              <span className="font-semibold text-lg">{lesson.subject?.name}</span>
                              <Badge variant="secondary">{lesson.course?.name}</Badge>
                            </div>

                            <div className="space-y-1 text-sm text-gray-600">
                              <p className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faClock} className="w-4 h-4" />
                                {lesson.start_time} - {lesson.end_time}
                              </p>
                              <p className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faUser} className="w-4 h-4" />
                                Prof. {lesson.professor?.user?.first_name} {lesson.professor?.user?.last_name}
                              </p>
                            </div>
                          </div>

                          {(canEdit || canDelete) && (
                            <div className="flex gap-2">
                              {canEdit && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(lesson)}
                                >
                                  Modifica
                                </Button>
                              )}
                              {canDelete && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(lesson)}
                                >
                                  Elimina
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <FontAwesomeIcon icon={faCalendar} className="w-12 h-12 mb-4 mx-auto opacity-30" />
                    <p>Nessuna lezione in questa data</p>
                    {canCreateLesson && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => setIsDialogOpen(true)}
                      >
                        <FontAwesomeIcon icon={faPlus} className="w-4 h-4 mr-2" />
                        Crea Lezione
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingLesson ? 'Modifica Lezione' : 'Nuova Lezione'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingLesson
                      ? 'Modifica i dati della lezione'
                      : 'Compila i dati per creare una nuova lezione'}
                  </DialogDescription>
                </DialogHeader>
                <LessonForm
                  lesson={editingLesson}
                  onSubmit={handleCreateOrUpdate}
                  onCancel={handleCloseDialog}
                  loading={formLoading}
                />
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
      <LessonsPage />
    </ProtectedRoute>
  )
}
