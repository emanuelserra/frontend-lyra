'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Course } from '@/services/courses.service'

const courseSchema = z.object({
  name: z.string().min(3, 'Il nome deve essere di almeno 3 caratteri'),
  duration_years: z.number().min(1, 'Minimo 1 anno').max(5, 'Massimo 5 anni'),
})

type CourseFormData = z.infer<typeof courseSchema>

interface CourseFormProps {
  course?: Course
  onSubmit: (data: CourseFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export default function CourseForm({
  course,
  onSubmit,
  onCancel,
  loading = false,
}: CourseFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: course
      ? {
          name: course.name,
          duration_years: course.duration_years,
        }
      : {
          name: '',
          duration_years: 2,
        },
  })

  useEffect(() => {
    if (course) {
      reset({
        name: course.name,
        duration_years: course.duration_years,
      })
    }
  }, [course, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {/* Nome Corso */}
        <div className="space-y-2">
          <Label htmlFor="name">Nome Corso *</Label>
          <Input
            id="name"
            placeholder="es. Tecnico Superiore per l'ICT"
            {...register('name')}
            disabled={loading}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        {/* Durata */}
        <div className="space-y-2">
          <Label htmlFor="duration_years">Durata (anni) *</Label>
          <Input
            id="duration_years"
            type="number"
            min="1"
            max="5"
            {...register('duration_years', { valueAsNumber: true })}
            disabled={loading}
          />
          {errors.duration_years && (
            <p className="text-sm text-red-500">{errors.duration_years.message}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Annulla
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvataggio...' : course ? 'Aggiorna' : 'Crea Corso'}
        </Button>
      </div>
    </form>
  )
}
