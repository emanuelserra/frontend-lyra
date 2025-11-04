'use client'

import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'sonner'
import { ProtectedRoute, DataTable } from '@/components/shared'
import type { Column } from '@/components/shared'
import { CourseForm } from '@/components/forms'
import { Sidebar, Navbar } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { coursesService, type Course } from '@/services/courses.service'
import { studentsService } from '@/services/students.service'
import { subjectsService } from '@/services/subjects.service'
import { getUserRole } from '@/lib/utils/role-utils'

interface CourseWithStats extends Course {
  studentsCount?: number
  subjectsCount?: number
}

function CoursesPage() {
  const [courses, setCourses] = useState<CourseWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | undefined>(undefined)
  const [formLoading, setFormLoading] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    setUserRole(getUserRole())
    fetchCourses()
  }, [])

  async function fetchCourses() {
    setLoading(true)
    try {
      const coursesData = await coursesService.getAllCourses()

      // Fetch stats per course
      const coursesWithStats = await Promise.all(
        coursesData.map(async (course) => {
          try {
            const [students, subjects] = await Promise.all([
              studentsService.getAllStudents(),
              subjectsService.getAllSubjects(),
            ])

            const studentsCount = students.filter(s => s.course_id === course.id).length
            const subjectsCount = subjects.filter(s => s.course_id === course.id).length

            return { ...course, studentsCount, subjectsCount }
          } catch {
            return { ...course, studentsCount: 0, subjectsCount: 0 }
          }
        })
      )

      setCourses(coursesWithStats)
    } catch (error) {
      console.error('Error fetching courses:', error)
      toast.error('Errore nel caricamento dei corsi')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateOrUpdate(data: any) {
    setFormLoading(true)
    try {
      if (editingCourse) {
        await coursesService.updateCourse(editingCourse.id, data)
        toast.success('Corso aggiornato con successo')
      } else {
        await coursesService.createCourse(data)
        toast.success('Corso creato con successo')
      }

      setIsDialogOpen(false)
      setEditingCourse(undefined)
      fetchCourses()
    } catch (error: any) {
      console.error('Error saving course:', error)
      toast.error(error.response?.data?.message || 'Errore nel salvataggio')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleDelete(course: Course) {
    if (!confirm(`Sei sicuro di voler eliminare il corso "${course.name}"?\n\nATTENZIONE: Verranno eliminate anche tutte le materie e gli studenti associati.`)) {
      return
    }

    try {
      await coursesService.deleteCourse(course.id)
      toast.success('Corso eliminato con successo')
      fetchCourses()
    } catch (error: any) {
      console.error('Error deleting course:', error)
      toast.error(error.response?.data?.message || 'Errore nell\'eliminazione del corso')
    }
  }

  function handleEdit(course: Course) {
    setEditingCourse(course)
    setIsDialogOpen(true)
  }

  function handleCloseDialog() {
    setIsDialogOpen(false)
    setEditingCourse(undefined)
  }

  const columns: Column<CourseWithStats>[] = [
    {
      header: 'Nome Corso',
      accessor: 'name',
    },
    {
      header: 'Durata',
      accessor: row => (
        <Badge variant="default">
          {row.duration_years} {row.duration_years === 1 ? 'anno' : 'anni'}
        </Badge>
      ),
    },
    {
      header: 'N° Studenti',
      accessor: row => (
        <Badge variant="secondary">
          {row.studentsCount ?? 0} studenti
        </Badge>
      ),
    },
    {
      header: 'N° Materie',
      accessor: row => (
        <Badge variant="secondary">
          {row.subjectsCount ?? 0} materie
        </Badge>
      ),
    },
    {
      header: 'Creato il',
      accessor: row => new Date(row.created_at).toLocaleDateString('it-IT'),
    },
  ]

  const isAdmin = userRole === 'admin'

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Corsi</h1>
                <p className="text-gray-600">
                  Gestione dei corsi formativi
                </p>
              </div>
              {isAdmin && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <FontAwesomeIcon icon={faPlus} className="w-4 h-4 mr-2" />
                  Nuovo Corso
                </Button>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <DataTable
                data={courses}
                columns={columns}
                loading={loading}
                searchPlaceholder="Cerca corso..."
                renderActions={
                  isAdmin
                    ? row => (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(row)}
                          >
                            <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(row)}
                          >
                            <FontAwesomeIcon icon={faTrash} className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      )
                    : undefined
                }
              />
            </div>

            <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingCourse ? 'Modifica Corso' : 'Nuovo Corso'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCourse
                      ? 'Modifica i dati del corso'
                      : 'Compila i dati per creare un nuovo corso'}
                  </DialogDescription>
                </DialogHeader>
                <CourseForm
                  course={editingCourse}
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
      <CoursesPage />
    </ProtectedRoute>
  )
}
