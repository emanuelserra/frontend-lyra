'use client'

import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faPenToSquare, faTrash, faBookOpen, faSchool } from '@fortawesome/free-solid-svg-icons'
import { GraduationCap } from 'lucide-react'
import { toast } from 'sonner'
import { ProtectedRoute, PageHeader, DataTable } from '@/components/shared'
import type { Column } from '@/components/shared'
import { ProfessorForm } from '@/components/forms'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { professorsService, type Professor } from '@/services/professors.service'
import { coursesService, type Course } from '@/services/courses.service'
import { usersService } from '@/services/users.service'
import { getUserRole } from '@/lib/utils/role-utils'

function ProfessorsPage() {
  const [professors, setProfessors] = useState<Professor[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProfessor, setEditingProfessor] = useState<Professor | undefined>(undefined)
  const [formLoading, setFormLoading] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  const [isCoursesDialogOpen, setIsCoursesDialogOpen] = useState(false)
  const [managingProfessor, setManagingProfessor] = useState<Professor | undefined>(undefined)
  const [allCourses, setAllCourses] = useState<Course[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')

  useEffect(() => {
    setUserRole(getUserRole())
    fetchProfessors()
    fetchCourses()
  }, [])

  async function fetchCourses() {
    try {
      const data = await coursesService.getAllCourses()
      setAllCourses(data)
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  async function fetchProfessors() {
    setLoading(true)
    try {
      const data = await professorsService.getAllProfessors()
      setProfessors(data)
    } catch (error) {
      console.error('Error fetching professors:', error)
      toast.error('Errore nel caricamento dei professori')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateOrUpdate(data: any) {
    setFormLoading(true)
    try {
      if (editingProfessor) {
        await professorsService.updateProfessor(editingProfessor.id, data)
        toast.success('Professore aggiornato con successo')
      } else {
        await professorsService.createProfessor(data)
        toast.success('Professore creato con successo')
      }

      setIsDialogOpen(false)
      setEditingProfessor(undefined)
      fetchProfessors()
    } catch (error: any) {
      console.error('Error saving professor:', error)
      toast.error(error.response?.data?.message || 'Errore nel salvataggio')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleDelete(professor: Professor) {
    const professorName = `${professor.user?.first_name} ${professor.user?.last_name}`

    if (!confirm(`Sei sicuro di voler eliminare il professore "${professorName}"?\n\nATTENZIONE: Verranno rimosse tutte le assegnazioni di materie e corsi. Le lezioni tenute rimarranno nel sistema.`)) {
      return
    }

    try {
      await professorsService.deleteProfessor(professor.id)
      toast.success('Professore eliminato con successo')
      fetchProfessors()
    } catch (error: any) {
      console.error('Error deleting professor:', error)
      toast.error(error.response?.data?.message || 'Errore nell\'eliminazione del professore')
    }
  }

  function handleEdit(professor: Professor) {
    setEditingProfessor(professor)
    setIsDialogOpen(true)
  }

  function handleCloseDialog() {
    setIsDialogOpen(false)
    setEditingProfessor(undefined)
  }

  function handleManageCourses(professor: Professor) {
    setManagingProfessor(professor)
    setSelectedCourseId('')
    setIsCoursesDialogOpen(true)
  }

  function handleCloseCoursesDialog() {
    setIsCoursesDialogOpen(false)
    setManagingProfessor(undefined)
    setSelectedCourseId('')
  }

  async function handleAssignCourse() {
    if (!managingProfessor || !selectedCourseId) return

    try {
      await professorsService.assignCourse(managingProfessor.id, parseInt(selectedCourseId))
      toast.success('Corso assegnato con successo')
      setSelectedCourseId('')
      await fetchProfessors()
      const updated = await professorsService.getProfessorById(managingProfessor.id)
      setManagingProfessor(updated)
    } catch (error: any) {
      console.error('Error assigning course:', error)
      toast.error(error.response?.data?.message || 'Errore nell\'assegnazione')
    }
  }

  async function handleRemoveCourse(courseId: number) {
    if (!managingProfessor) return

    if (!confirm('Sei sicuro di voler rimuovere questo corso dal professore?')) {
      return
    }

    try {
      await professorsService.removeCourse(managingProfessor.id, courseId)
      toast.success('Corso rimosso con successo')
      await fetchProfessors()
      const updated = await professorsService.getProfessorById(managingProfessor.id)
      setManagingProfessor(updated)
    } catch (error: any) {
      console.error('Error removing course:', error)
      toast.error(error.response?.data?.message || 'Errore nella rimozione')
    }
  }

  async function handleEditUser(professor: Professor) {
    if (!professor.user_id) return

    // Redirect to users page (in a real app, would open user edit dialog)
    toast.info('Vai alla sezione Utenti per modificare i dati personali del professore')
  }

  const columns: Column<Professor>[] = [
    {
      header: 'Professore',
      accessor: row => (
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-blue-600" />
          <div>
            <p className="font-medium">
              {row.user?.first_name} {row.user?.last_name}
            </p>
            <p className="text-xs text-gray-500">{row.user?.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Telefono',
      accessor: row => row.user?.phone || '-',
    },
    {
      header: 'Materie Insegnate',
      accessor: row => {
        const count = row.subjects?.length || 0
        return (
          <Badge variant="default" className="flex items-center gap-1 w-fit">
            <FontAwesomeIcon icon={faBookOpen} className="w-3 h-3" />
            {count} {count === 1 ? 'materia' : 'materie'}
          </Badge>
        )
      },
    },
    {
      header: 'Corsi',
      accessor: row => {
        const count = row.courses?.length || 0
        return (
          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
            <FontAwesomeIcon icon={faSchool} className="w-3 h-3" />
            {count} {count === 1 ? 'corso' : 'corsi'}
          </Badge>
        )
      },
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
            <PageHeader
              title="Professori"
              description="Gestione dei professori e docenti"
            >
              {isAdmin && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <FontAwesomeIcon icon={faPlus} className="w-4 h-4 mr-2" />
                  Nuovo Professore
                </Button>
              )}
            </PageHeader>

            {/* Stats Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Totale Professori</p>
                    <p className="text-2xl font-bold">{professors.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faBookOpen} className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Materie Totali</p>
                    <p className="text-2xl font-bold">
                      {professors.reduce((acc, p) => acc + (p.subjects?.length || 0), 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faSchool} className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Corsi Coperti</p>
                    <p className="text-2xl font-bold">
                      {new Set(professors.flatMap(p => p.courses?.map(c => c.id) || [])).size}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <DataTable
                data={professors}
                columns={columns}
                loading={loading}
                searchPlaceholder="Cerca professore..."
                renderActions={
                  isAdmin
                    ? row => (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleManageCourses(row)}
                            title="Gestisci corsi"
                          >
                            <FontAwesomeIcon icon={faSchool} className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(row)}
                            title="Modifica professore"
                          >
                            <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(row)}
                            title="Elimina professore"
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
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProfessor ? 'Modifica Professore' : 'Nuovo Professore'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingProfessor
                      ? 'Modifica i dati del professore'
                      : 'Collega un utente esistente come professore'}
                  </DialogDescription>
                </DialogHeader>
                <ProfessorForm
                  professor={editingProfessor}
                  onSubmit={handleCreateOrUpdate}
                  onCancel={handleCloseDialog}
                  loading={formLoading}
                />
              </DialogContent>
            </Dialog>

            <Dialog open={isCoursesDialogOpen} onOpenChange={handleCloseCoursesDialog}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Gestisci Corsi</DialogTitle>
                  <DialogDescription>
                    Professore: <strong>{managingProfessor?.user?.first_name} {managingProfessor?.user?.last_name}</strong>
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-3">Aggiungi Corso</h3>
                    <div className="flex gap-2">
                      <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                        <SelectTrigger className="flex-1 bg-white">
                          <SelectValue placeholder="Seleziona corso..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {allCourses
                            .filter(course => !managingProfessor?.courses?.some(c => c.id === course.id))
                            .map(course => (
                              <SelectItem key={course.id} value={course.id.toString()}>
                                {course.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleAssignCourse}
                        disabled={!selectedCourseId}
                      >
                        <FontAwesomeIcon icon={faPlus} className="w-4 h-4 mr-2" />
                        Assegna
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-3">Corsi Assegnati</h3>
                    {managingProfessor?.courses && managingProfessor.courses.length > 0 ? (
                      <div className="space-y-2">
                        {managingProfessor.courses.map(course => (
                          <div
                            key={course.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <FontAwesomeIcon icon={faSchool} className="w-5 h-5 text-purple-500" />
                              <div>
                                <p className="font-medium">{course.name}</p>
                                <p className="text-sm text-gray-500">{course.duration_years} anni</p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveCourse(course.id)}
                            >
                              <FontAwesomeIcon icon={faTrash} className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">
                        Nessun corso assegnato
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button variant="outline" onClick={handleCloseCoursesDialog}>
                    Chiudi
                  </Button>
                </div>
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
    <ProtectedRoute allowedRoles={['admin']}>
      <ProfessorsPage />
    </ProtectedRoute>
  )
}
