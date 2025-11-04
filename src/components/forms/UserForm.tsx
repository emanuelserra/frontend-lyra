'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { User } from '@/services/users.service'

const userSchema = z.object({
  first_name: z.string().min(2, 'Minimo 2 caratteri'),
  last_name: z.string().min(2, 'Minimo 2 caratteri'),
  email: z.string().email('Email non valida'),
  phone: z.string().optional(),
  birth_date: z.string().optional(),
  role: z.enum(['admin', 'professor', 'tutor', 'student']),
  password: z.string().min(6, 'Minimo 6 caratteri').optional(),
})

type UserFormData = z.infer<typeof userSchema>

interface UserFormProps {
  user?: User
  onSubmit: (data: UserFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

const ROLE_LABELS = {
  admin: 'Amministratore',
  professor: 'Professore',
  tutor: 'Tutor',
  student: 'Studente',
}

export default function UserForm({
  user,
  onSubmit,
  onCancel,
  loading = false,
}: UserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: user
      ? {
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone || '',
          birth_date: user.birth_date || '',
          role: user.role,
          password: '',
        }
      : {
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          birth_date: '',
          role: 'student',
          password: '',
        },
  })

  const role = watch('role')

  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone || '',
        birth_date: user.birth_date || '',
        role: user.role,
        password: '',
      })
    }
  }, [user, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nome */}
        <div className="space-y-2">
          <Label htmlFor="first_name">Nome *</Label>
          <Input
            id="first_name"
            placeholder="es. Mario"
            {...register('first_name')}
            disabled={loading}
          />
          {errors.first_name && (
            <p className="text-sm text-red-500">{errors.first_name.message}</p>
          )}
        </div>

        {/* Cognome */}
        <div className="space-y-2">
          <Label htmlFor="last_name">Cognome *</Label>
          <Input
            id="last_name"
            placeholder="es. Rossi"
            {...register('last_name')}
            disabled={loading}
          />
          {errors.last_name && (
            <p className="text-sm text-red-500">{errors.last_name.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="mario.rossi@lyra.edu"
            {...register('email')}
            disabled={loading}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Telefono */}
        <div className="space-y-2">
          <Label htmlFor="phone">Telefono</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+39 333 1234567"
            {...register('phone')}
            disabled={loading}
          />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone.message}</p>
          )}
        </div>

        {/* Data di Nascita */}
        <div className="space-y-2">
          <Label htmlFor="birth_date">Data di Nascita</Label>
          <Input
            id="birth_date"
            type="date"
            {...register('birth_date')}
            disabled={loading}
          />
          {errors.birth_date && (
            <p className="text-sm text-red-500">{errors.birth_date.message}</p>
          )}
        </div>

        {/* Ruolo */}
        <div className="space-y-2">
          <Label htmlFor="role">Ruolo *</Label>
          <Select
            value={role}
            onValueChange={(value: any) => setValue('role', value)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona ruolo..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.role && (
            <p className="text-sm text-red-500">{errors.role.message}</p>
          )}
        </div>
      </div>

      {/* Password (solo per creazione o reset) */}
      <div className="space-y-2">
        <Label htmlFor="password">
          Password {!user && '*'}
          {user && <span className="text-sm text-gray-500 ml-2">(lascia vuoto per non modificare)</span>}
        </Label>
        <Input
          id="password"
          type="password"
          placeholder={user ? '••••••••' : 'Minimo 6 caratteri'}
          {...register('password', {
            required: !user ? 'Password obbligatoria' : false,
          })}
          disabled={loading}
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      {/* Info note */}
      {role === 'student' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            ℹ️ Dopo aver creato l'utente studente, dovrai creare anche il <strong>profilo studente</strong> nella sezione Studenti per assegnarlo a un corso.
          </p>
        </div>
      )}

      {role === 'professor' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            ℹ️ Dopo aver creato l'utente professore, dovrai creare anche il <strong>profilo professore</strong> nella sezione Professori per assegnare materie e corsi.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Annulla
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvataggio...' : user ? 'Aggiorna' : 'Crea Utente'}
        </Button>
      </div>
    </form>
  )
}
