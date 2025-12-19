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
  total_hours: z
    .number({
      required_error: 'Le ore totali sono obbligatorie',
      invalid_type_error: 'Inserisci un numero di ore valido',
    })
    .min(1, 'Minimo 1 ora')
    .max(5000, 'Massimo 5000 ore'),

  max_absence_percentage: z
    .number({
      required_error: 'La percentuale è obbligatoria',
      invalid_type_error: 'Inserisci una percentuale valida',
    })
    .min(0, 'Minimo 0%')
    .max(100, 'Massimo 100%'),
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
          total_hours: course.total_hours,
          max_absence_percentage: (course as any ).max_absence_percentage ?? 20,
        }
      : {
          name: '',
          total_hours: 1000, // valore di default, cambialo se vuoi
          max_absence_percentage: 20,
        },
  })

  useEffect(() => {
    if (course) {
      reset({
        name: course.name,
        total_hours: course.total_hours,
        max_absence_percentage: (course as any).max_absence_percentage ?? 20,
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

        {/* Ore totali */}
        <div className="space-y-2">
          <Label htmlFor="total_hours">Ore totali del corso *</Label>
          <Input
            id="total_hours"
            type="number"
            min="1"
            max="5000"
            {...register('total_hours', { valueAsNumber: true })}
            disabled={loading}
          />
          {errors.total_hours && (
            <p className="text-sm text-red-500">{errors.total_hours.message}</p>
          )}
        </div>
        {/* Percentuale max assenze */}
        <div className="space-y-2">
          <Label htmlFor="max_absence_percentage">Max assenze (%) *</Label>
          <Input
            id="max_absence_percentage"
            type="number"
            min="0"
            max="100"
            {...register('max_absence_percentage', { valueAsNumber: true })}
            disabled={loading}
          />
          {errors.max_absence_percentage && (
            <p className="text-sm text-red-500">{errors.max_absence_percentage.message}</p>
          )}

            {/* preview ore massime */}
            <p className="text-sm text-gray-600">
              Ore massime assenza:{" "}
              <b>
                {(
                  ((Number((document.getElementById("total_hours") as HTMLInputElement)?.value) || 0) *
                    (Number((document.getElementById("max_absence_percentage") as HTMLInputElement)?.value) || 0)) /
                  100
                ).toFixed(1)}
              </b>{" "}
              ore
            </p>
          </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Annulla
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvataggio...' : course ? 'Aggiorna' : 'Crea Corso'}
        </Button>
      </div>
    </form>
  )
}
