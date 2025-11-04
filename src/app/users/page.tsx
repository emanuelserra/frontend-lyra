'use client'

import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faPenToSquare, faTrash, faShield, faGraduationCap, faUsers, faUserCheck } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'sonner'
import { ProtectedRoute, PageHeader, DataTable } from '@/components/shared'
import type { Column } from '@/components/shared'
import { UserForm } from '@/components/forms'
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
import { usersService, type User } from '@/services/users.service'
import { getUserRole } from '@/lib/utils/role-utils'

function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined)
  const [formLoading, setFormLoading] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    setUserRole(getUserRole())
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoading(true)
    try {
      const data = await usersService.getAllUsers()
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Errore nel caricamento degli utenti')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateOrUpdate(data: any) {
    setFormLoading(true)
    try {
      if (editingUser) {
        // Update user (rimuovi password se vuota)
        const updateData: any = {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          birth_date: data.birth_date,
          role: data.role,
        }

        if (data.password && data.password.length > 0) {
          updateData.password = data.password
        }

        await usersService.updateUser(editingUser.id, updateData)
        toast.success('Utente aggiornato con successo')
      } else {
        // Create user
        await usersService.createUser({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          password: data.password,
          phone: data.phone,
          birth_date: data.birth_date,
          role: data.role,
        })
        toast.success('Utente creato con successo')
      }

      setIsDialogOpen(false)
      setEditingUser(undefined)
      fetchUsers()
    } catch (error: any) {
      console.error('Error saving user:', error)
      toast.error(error.response?.data?.message || 'Errore nel salvataggio')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleDelete(user: User) {
    if (!confirm(`Sei sicuro di voler eliminare l'utente "${user.first_name} ${user.last_name}"?\n\nATTENZIONE: L'operazione è irreversibile.`)) {
      return
    }

    try {
      await usersService.deleteUser(user.id)
      toast.success('Utente eliminato con successo')
      fetchUsers()
    } catch (error: any) {
      console.error('Error deleting user:', error)
      toast.error(error.response?.data?.message || 'Errore nell\'eliminazione dell\'utente')
    }
  }

  function handleEdit(user: User) {
    setEditingUser(user)
    setIsDialogOpen(true)
  }

  function handleCloseDialog() {
    setIsDialogOpen(false)
    setEditingUser(undefined)
  }

  const getRoleBadge = (role: string) => {
    const config: Record<
      string,
      { variant: 'default' | 'secondary' | 'destructive' | 'success'; icon: any; label: string; color: string }
    > = {
      admin: { variant: 'destructive', icon: faShield, label: 'Amministratore', color: 'text-purple-600' },
      professor: { variant: 'default', icon: faGraduationCap, label: 'Professore', color: 'text-blue-600' },
      tutor: { variant: 'success', icon: faUserCheck, label: 'Tutor', color: 'text-green-600' },
      student: { variant: 'secondary', icon: faUsers, label: 'Studente', color: 'text-orange-600' },
    }

    const { variant, icon, label, color } = config[role] || config.student

    return (
      <Badge variant={variant} className="flex items-center gap-1 w-fit">
        <FontAwesomeIcon icon={icon} className={`w-3 h-3 ${color}`} />
        {label}
      </Badge>
    )
  }

  const columns: Column<User>[] = [
    {
      header: 'Nome Completo',
      accessor: row => `${row.first_name} ${row.last_name}`,
    },
    {
      header: 'Email',
      accessor: 'email',
    },
    {
      header: 'Ruolo',
      accessor: row => getRoleBadge(row.role),
    },
    {
      header: 'Telefono',
      accessor: row => row.phone || '-',
    },
    {
      header: 'Data Nascita',
      accessor: row => row.birth_date ? new Date(row.birth_date).toLocaleDateString('it-IT') : '-',
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
            <PageHeader
              title="Utenti"
              description="Gestione degli utenti del sistema"
            >
              {isAdmin && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <FontAwesomeIcon icon={faPlus} className="w-4 h-4 mr-2" />
                  Nuovo Utente
                </Button>
              )}
            </PageHeader>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faShield} className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Admin</p>
                    <p className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faGraduationCap} className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Professori</p>
                    <p className="text-2xl font-bold">{users.filter(u => u.role === 'professor').length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faUserCheck} className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Tutor</p>
                    <p className="text-2xl font-bold">{users.filter(u => u.role === 'tutor').length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faUsers} className="w-8 h-8 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Studenti</p>
                    <p className="text-2xl font-bold">{users.filter(u => u.role === 'student').length}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <DataTable
                data={users}
                columns={columns}
                loading={loading}
                searchPlaceholder="Cerca utente..."
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
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingUser ? 'Modifica Utente' : 'Nuovo Utente'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingUser
                      ? 'Modifica i dati dell\'utente'
                      : 'Compila i dati per creare un nuovo utente'}
                  </DialogDescription>
                </DialogHeader>
                <UserForm
                  user={editingUser}
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
    <ProtectedRoute allowedRoles={['admin']}>
      <UsersPage />
    </ProtectedRoute>
  )
}
