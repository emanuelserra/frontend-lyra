'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usersService, type User } from '@/services/users.service'
import type { Professor } from '@/services/professors.service'

const professorSchema = z.object({
  user_id: z.string().min(1, 'Seleziona un utente'),
})

type ProfessorFormData = z.infer<typeof professorSchema>

interface ProfessorFormProps {
  professor?: Professor
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export default function ProfessorForm({
  professor,
  onSubmit,
  onCancel,
  loading = false,
}: ProfessorFormProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProfessorFormData>({
    resolver: zodResolver(professorSchema),
    defaultValues: professor
      ? {
          user_id: String(professor.user_id),
        }
      : {
          user_id: '',
        },
  })

  const userId = watch('user_id')

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      const allUsers = await usersService.getAllUsers()
      // Filtra solo utenti con ruolo professor che non sono già professori
      const professorUsers = allUsers.filter(u => u.role === 'professor')
      setUsers(professorUsers)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleFormSubmit = (data: ProfessorFormData) => {
    return onSubmit({
      user_id: parseInt(data.user_id),
    })
  }

  const selectedUser = users.find(u => String(u.id) === userId)

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Info Box */}
      {!professor && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            ℹ️ Per creare un professore, devi prima aver creato un <strong>utente con ruolo "Professore"</strong> nella sezione Utenti.
          </p>
        </div>
      )}

      {/* User Selection */}
      <div className="space-y-2">
        <Label htmlFor="user_id">Utente *</Label>
        <Select
          value={userId}
          onValueChange={(value) => setValue('user_id', value)}
          disabled={loading || loadingUsers || !!professor}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleziona un utente professore..." />
          </SelectTrigger>
          <SelectContent>
            {users.length === 0 && !loadingUsers && (
              <div className="px-2 py-4 text-sm text-gray-500 text-center">
                Nessun utente professore disponibile.<br/>
                Crea prima un utente con ruolo "Professore".
              </div>
            )}
            {users.map((user) => (
              <SelectItem key={user.id} value={String(user.id)}>
                <div className="flex flex-col">
                  <span className="font-medium">{user.first_name} {user.last_name}</span>
                  <span className="text-xs text-gray-500">{user.email}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.user_id && (
          <p className="text-sm text-red-500">{errors.user_id.message}</p>
        )}
        {professor && (
          <p className="text-xs text-gray-500">Non è possibile cambiare l'utente associato dopo la creazione.</p>
        )}
      </div>

      {/* Selected User Info */}
      {selectedUser && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium mb-3">Informazioni Utente Selezionato</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Nome</p>
              <p className="font-medium">{selectedUser.first_name} {selectedUser.last_name}</p>
            </div>
            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-medium">{selectedUser.email}</p>
            </div>
            <div>
              <p className="text-gray-500">Telefono</p>
              <p className="font-medium">{selectedUser.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500">Data Nascita</p>
              <p className="font-medium">
                {selectedUser.birth_date
                  ? new Date(selectedUser.birth_date).toLocaleDateString('it-IT')
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info about subjects/courses */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          💡 <strong>Assegnazione Materie e Corsi:</strong><br/>
          Le materie e i corsi vengono assegnati ai professori tramite la gestione delle Materie. Un professore può insegnare più materie in più corsi.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Annulla
        </Button>
        <Button type="submit" disabled={loading || loadingUsers || users.length === 0}>
          {loading ? 'Salvataggio...' : professor ? 'Aggiorna' : 'Crea Professore'}
        </Button>
      </div>
    </form>
  )
}
