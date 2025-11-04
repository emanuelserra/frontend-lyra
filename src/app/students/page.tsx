'use client'

import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'sonner'
import { ProtectedRoute, PageHeader, DataTable } from '@/components/shared'
import type { Column } from '@/components/shared'
import { StudentForm } from '@/components/forms'
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
import { studentsService, type Student } from '@/services/students.service'
import { usersService } from '@/services/users.service'
import { getUserRole } from '@/lib/utils/role-utils'

function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | undefined>(undefined)
  const [formLoading, setFormLoading] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    setUserRole(getUserRole())
    fetchStudents()
  }, [])

  async function fetchStudents() {
    setLoading(true)
    try {
      const data = await studentsService.getAllStudents()
      setStudents(data)
    } catch (error) {
      console.error('Error fetching students:', error)
      toast.error('Errore nel caricamento degli studenti')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateOrUpdate(data: any) {
    setFormLoading(true)
    try {
      if (editingStudent) {
        // Update student
        await studentsService.updateStudent(editingStudent.id, {
          course_id: parseInt(data.course_id),
          enrollment_number: data.enrollment_number,
          enrollment_year: parseInt(data.enrollment_year),
          status: data.status,
        })

        // Update user data
        if (editingStudent.user_id) {
          await usersService.updateUser(editingStudent.user_id, {
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            phone: data.phone,
            birth_date: data.birth_date,
          })
        }

        toast.success('Studente aggiornato con successo')
      } else {
        // Create user first
        const user = await usersService.createUser({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          password: data.password,
          phone: data.phone,
          birth_date: data.birth_date,
          role: 'student',
        })

        // Create student profile
        await studentsService.createStudent({
          user_id: user.id,
          course_id: parseInt(data.course_id),
          enrollment_number: data.enrollment_number,
          enrollment_year: parseInt(data.enrollment_year),
        })

        toast.success('Studente creato con successo')
      }

      setIsDialogOpen(false)
      setEditingStudent(undefined)
      fetchStudents()
    } catch (error: any) {
      console.error('Error saving student:', error)
      toast.error(error.response?.data?.message || 'Errore nel salvataggio')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleDelete(student: Student) {
    if (!confirm(`Sei sicuro di voler eliminare lo studente ${student.user?.first_name} ${student.user?.last_name}?`)) {
      return
    }

    try {
      await studentsService.deleteStudent(student.id)
      toast.success('Studente eliminato con successo')
      fetchStudents()
    } catch (error: any) {
      console.error('Error deleting student:', error)
      toast.error('Errore nell\'eliminazione dello studente')
    }
  }

  function handleEdit(student: Student) {
    setEditingStudent(student)
    setIsDialogOpen(true)
  }

  function handleCloseDialog() {
    setIsDialogOpen(false)
    setEditingStudent(undefined)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'default' | 'secondary'> = {
      active: 'success',
      graduated: 'default',
      retired: 'secondary',
    }
    const labels: Record<string, string> = {
      active: 'Attivo',
      graduated: 'Diplomato',
      retired: 'Ritirato',
    }
    return <Badge variant={variants[status]}>{labels[status]}</Badge>
  }

  const columns: Column<Student>[] = [
    {
      header: 'Nome',
      accessor: row => `${row.user?.first_name} ${row.user?.last_name}`,
    },
    {
      header: 'Email',
      accessor: row => row.user?.email || '-',
    },
    {
      header: 'Matricola',
      accessor: 'enrollment_number',
    },
    {
      header: 'Corso',
      accessor: row => row.course?.name || '-',
    },
    {
      header: 'Anno',
      accessor: 'enrollment_year',
    },
    {
      header: 'Stato',
      accessor: row => getStatusBadge(row.status),
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
              title="Studenti"
              description="Gestione degli studenti iscritti"
            >
              {isAdmin && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <FontAwesomeIcon icon={faPlus} className="w-4 h-4 mr-2" />
                  Nuovo Studente
                </Button>
              )}
            </PageHeader>

            <div className="bg-white rounded-lg shadow p-6">
              <DataTable
                data={students}
                columns={columns}
                loading={loading}
                searchPlaceholder="Cerca studente..."
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
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingStudent ? 'Modifica Studente' : 'Nuovo Studente'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingStudent
                      ? 'Modifica i dati dello studente'
                      : 'Compila i dati per creare un nuovo studente'}
                  </DialogDescription>
                </DialogHeader>
                <StudentForm
                  student={editingStudent}
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
    <ProtectedRoute allowedRoles={['admin', 'professor', 'tutor']}>
      <StudentsPage />
    </ProtectedRoute>
  )
}
