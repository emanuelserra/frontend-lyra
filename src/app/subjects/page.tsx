'use client'

import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faPenToSquare, faTrash, faBookOpen, faUserTie } from '@fortawesome/free-solid-svg-icons'
import { BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import { ProtectedRoute, DataTable, type Column } from '@/components/shared'
import { SubjectForm } from '@/components/forms'
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
import { subjectsService, type Subject } from '@/services/subjects.service'
import { professorsService, type Professor } from '@/services/professors.service'
import { getUserRole } from '@/lib/utils/role-utils'

function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | undefined>(undefined)
  const [formLoading, setFormLoading] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  const [isProfessorsDialogOpen, setIsProfessorsDialogOpen] = useState(false)
  const [managingSubject, setManagingSubject] = useState<Subject | undefined>(undefined)
  const [allProfessors, setAllProfessors] = useState<Professor[]>([])
  const [selectedProfessorId, setSelectedProfessorId] = useState<string>('')

  useEffect(() => {
    setUserRole(getUserRole())
    fetchSubjects()
    fetchProfessors()
  }, [])

  async function fetchProfessors() {
    try {
      const data = await professorsService.getAllProfessors()
      setAllProfessors(data)
    } catch (error) {
      console.error('Error fetching professors:', error)
    }
  }

  async function fetchSubjects() {
    setLoading(true)
    try {
      const data = await subjectsService.getAllSubjects()
      setSubjects(data)
    } catch (error) {
      console.error('Error fetching subjects:', error)
      toast.error('Errore nel caricamento delle materie')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateOrUpdate(data: any) {
    setFormLoading(true)
    try {
      if (editingSubject) {
        await subjectsService.updateSubject(editingSubject.id, data)
        toast.success('Materia aggiornata con successo')
      } else {
        await subjectsService.createSubject(data)
        toast.success('Materia creata con successo')
      }

      setIsDialogOpen(false)
      setEditingSubject(undefined)
      fetchSubjects()
    } catch (error: any) {
      console.error('Error saving subject:', error)
      toast.error(error.response?.data?.message || 'Errore nel salvataggio')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleDelete(subject: Subject) {
    if (!confirm(`Sei sicuro di voler eliminare la materia "${subject.name}"?\n\nATTENZIONE: Verranno eliminate anche tutte le lezioni e i risultati degli esami associati.`)) {
      return
    }

    try {
      await subjectsService.deleteSubject(subject.id)
      toast.success('Materia eliminata con successo')
      fetchSubjects()
    } catch (error: any) {
      console.error('Error deleting subject:', error)
      toast.error(error.response?.data?.message || 'Errore nell\'eliminazione della materia')
    }
  }

  function handleEdit(subject: Subject) {
    setEditingSubject(subject)
    setIsDialogOpen(true)
  }

  function handleCloseDialog() {
    setIsDialogOpen(false)
    setEditingSubject(undefined)
  }

  function handleManageProfessors(subject: Subject) {
    setManagingSubject(subject)
    setSelectedProfessorId('')
    setIsProfessorsDialogOpen(true)
  }

  function handleCloseProfessorsDialog() {
    setIsProfessorsDialogOpen(false)
    setManagingSubject(undefined)
    setSelectedProfessorId('')
  }

  async function handleAssignProfessor() {
    if (!managingSubject || !selectedProfessorId) return

    try {
      await subjectsService.assignProfessor(managingSubject.id, parseInt(selectedProfessorId))
      toast.success('Professore assegnato con successo')
      setSelectedProfessorId('')
      await fetchSubjects()
      const updated = await subjectsService.getSubjectById(managingSubject.id)
      setManagingSubject(updated)
    } catch (error: any) {
      console.error('Error assigning professor:', error)
      toast.error(error.response?.data?.message || 'Errore nell\'assegnazione')
    }
  }

  async function handleRemoveProfessor(professorId: number) {
    if (!managingSubject) return

    if (!confirm('Sei sicuro di voler rimuovere questo professore dalla materia?')) {
      return
    }

    try {
      await subjectsService.removeProfessor(managingSubject.id, professorId)
      toast.success('Professore rimosso con successo')
      await fetchSubjects()
      const updated = await subjectsService.getSubjectById(managingSubject.id)
      setManagingSubject(updated)
    } catch (error: any) {
      console.error('Error removing professor:', error)
      toast.error(error.response?.data?.message || 'Errore nella rimozione')
    }
  }

  const columns: Column<Subject>[] = [
    {
      header: 'Materia',
      accessor: row => (
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-500" />
          <span className="font-medium">{row.name}</span>
        </div>
      ),
    },
    {
      header: 'Corso',
      accessor: row => row.course?.name || '-',
    },
    {
      header: 'Ore Totali',
      accessor: row => (
        <Badge variant="default">
          {row.duration_hours}h
        </Badge>
      ),
    },
    {
      header: 'Professori',
      accessor: row => {
        const count = row.professors?.length || 0
        return (
          <Badge variant="secondary">
            {count} {count === 1 ? 'docente' : 'docenti'}
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
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Materie</h1>
                <p className="text-gray-600">
                  Gestione delle materie e insegnamenti
                </p>
              </div>
              {isAdmin && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <FontAwesomeIcon icon={faPlus} className="w-4 h-4 mr-2" />
                  Nuova Materia
                </Button>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <DataTable
                data={subjects}
                columns={columns}
                loading={loading}
                searchPlaceholder="Cerca materia..."
                renderActions={
                  isAdmin
                    ? row => (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleManageProfessors(row)}
                            title="Gestisci professori"
                          >
                            <FontAwesomeIcon icon={faUserTie} className="w-4 h-4" />
                          </Button>
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
                    {editingSubject ? 'Modifica Materia' : 'Nuova Materia'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingSubject
                      ? 'Modifica i dati della materia'
                      : 'Compila i dati per creare una nuova materia'}
                  </DialogDescription>
                </DialogHeader>
                <SubjectForm
                  subject={editingSubject}
                  onSubmit={handleCreateOrUpdate}
                  onCancel={handleCloseDialog}
                  loading={formLoading}
                />
              </DialogContent>
            </Dialog>

            <Dialog open={isProfessorsDialogOpen} onOpenChange={handleCloseProfessorsDialog}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Gestisci Professori</DialogTitle>
                  <DialogDescription>
                    Materia: <strong>{managingSubject?.name}</strong>
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-3">Aggiungi Professore</h3>
                    <div className="flex gap-2">
                      <Select value={selectedProfessorId} onValueChange={setSelectedProfessorId}>
                        <SelectTrigger className="flex-1 bg-white">
                          <SelectValue placeholder="Seleziona professore..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {allProfessors
                            .filter(prof => !managingSubject?.professors?.some(p => p.id === prof.id))
                            .map(professor => (
                              <SelectItem key={professor.id} value={professor.id.toString()}>
                                {professor.user?.first_name} {professor.user?.last_name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleAssignProfessor}
                        disabled={!selectedProfessorId}
                      >
                        <FontAwesomeIcon icon={faPlus} className="w-4 h-4 mr-2" />
                        Assegna
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-3">Professori Assegnati</h3>
                    {managingSubject?.professors && managingSubject.professors.length > 0 ? (
                      <div className="space-y-2">
                        {managingSubject.professors.map(professor => (
                          <div
                            key={professor.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <FontAwesomeIcon icon={faUserTie} className="w-5 h-5 text-blue-500" />
                              <div>
                                <p className="font-medium">
                                  {professor.user?.first_name} {professor.user?.last_name}
                                </p>
                                <p className="text-sm text-gray-500">{professor.user?.email}</p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveProfessor(professor.id)}
                            >
                              <FontAwesomeIcon icon={faTrash} className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">
                        Nessun professore assegnato
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button variant="outline" onClick={handleCloseProfessorsDialog}>
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
      <SubjectsPage />
    </ProtectedRoute>
  )
}
