'use client'

import { useEffect, useState } from 'react'
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
import { coursesService } from '@/services/courses.service'
import { usersService } from '@/services/users.service'
import type { Student } from '@/services/students.service'
import type { Course } from '@/services/courses.service'

const studentSchema = z.object({
  first_name: z.string().min(2, 'Nome richiesto (minimo 2 caratteri)'),
  last_name: z.string().min(2, 'Cognome richiesto (minimo 2 caratteri)'),
  email: z.string().email('Email non valida'),
  password: z.string().min(6, 'Password minimo 6 caratteri').optional(),
  phone: z.string().optional(),
  birth_date: z.string().optional(),
  course_id: z.string().min(1, 'Corso richiesto'),
  enrollment_number: z.string().min(1, 'Matricola richiesta'),
  enrollment_year: z.string().regex(/^\d{4}$/, 'Anno non valido (es: 2024)'),
  status: z.enum(['active', 'graduated', 'retired']).optional(),
})

type StudentFormData = z.infer<typeof studentSchema>

interface StudentFormProps {
  student?: Student
  onSubmit: (data: StudentFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export default function StudentForm({
  student,
  onSubmit,
  onCancel,
  loading = false,
}: StudentFormProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loadingCourses, setLoadingCourses] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: student
      ? {
          first_name: student.user?.first_name || '',
          last_name: student.user?.last_name || '',
          email: student.user?.email || '',
          phone: student.user?.phone || '',
          birth_date: student.user?.birth_date || '',
          course_id: String(student.course_id),
          enrollment_number: student.enrollment_number,
          enrollment_year: String(student.enrollment_year),
          status: student.status,
        }
      : {
          enrollment_year: new Date().getFullYear().toString(),
          status: 'active',
        },
  })

  const selectedCourseId = watch('course_id')

  useEffect(() => {
    async function fetchCourses() {
      try {
        const data = await coursesService.getAllCourses()
        setCourses(data)
      } catch (error) {
        console.error('Error fetching courses:', error)
      } finally {
        setLoadingCourses(false)
      }
    }
    fetchCourses()
  }, [])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nome */}
        <div className="space-y-2">
          <Label htmlFor="first_name">Nome *</Label>
          <Input
            id="first_name"
            {...register('first_name')}
            placeholder="Mario"
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
            {...register('last_name')}
            placeholder="Rossi"
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
            {...register('email')}
            placeholder="mario.rossi@student.lyra.edu"
            disabled={loading || !!student}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Password (solo in creazione) */}
        {!student && (
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              placeholder="Minimo 6 caratteri"
              disabled={loading}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
        )}

        {/* Telefono */}
        <div className="space-y-2">
          <Label htmlFor="phone">Telefono</Label>
          <Input
            id="phone"
            {...register('phone')}
            placeholder="+39 333 1234567"
            disabled={loading}
          />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone.message}</p>
          )}
        </div>

        {/* Data di nascita */}
        <div className="space-y-2">
          <Label htmlFor="birth_date">Data di nascita</Label>
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

        {/* Corso */}
        <div className="space-y-2">
          <Label htmlFor="course_id">Corso *</Label>
          <Select
            value={selectedCourseId}
            onValueChange={value => setValue('course_id', value)}
            disabled={loading || loadingCourses}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona un corso" />
            </SelectTrigger>
            <SelectContent>
              {courses.map(course => (
                <SelectItem key={course.id} value={String(course.id)}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.course_id && (
            <p className="text-sm text-red-500">{errors.course_id.message}</p>
          )}
        </div>

        {/* Matricola */}
        <div className="space-y-2">
          <Label htmlFor="enrollment_number">Matricola *</Label>
          <Input
            id="enrollment_number"
            {...register('enrollment_number')}
            placeholder="2024001"
            disabled={loading}
          />
          {errors.enrollment_number && (
            <p className="text-sm text-red-500">{errors.enrollment_number.message}</p>
          )}
        </div>

        {/* Anno di iscrizione */}
        <div className="space-y-2">
          <Label htmlFor="enrollment_year">Anno di iscrizione *</Label>
          <Input
            id="enrollment_year"
            {...register('enrollment_year')}
            placeholder="2024"
            disabled={loading}
          />
          {errors.enrollment_year && (
            <p className="text-sm text-red-500">{errors.enrollment_year.message}</p>
          )}
        </div>

        {/* Status (solo in modifica) */}
        {student && (
          <div className="space-y-2">
            <Label htmlFor="status">Stato</Label>
            <Select
              value={watch('status')}
              onValueChange={value =>
                setValue('status', value as 'active' | 'graduated' | 'retired')
              }
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona stato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Attivo</SelectItem>
                <SelectItem value="graduated">Diplomato</SelectItem>
                <SelectItem value="retired">Ritirato</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Annulla
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvataggio...' : student ? 'Aggiorna' : 'Crea Studente'}
        </Button>
      </div>
    </form>
  )
}
