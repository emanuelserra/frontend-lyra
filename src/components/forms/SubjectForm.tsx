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
import { coursesService, type Course } from '@/services/courses.service'
import type { Subject } from '@/services/subjects.service'

const subjectSchema = z.object({
  name: z.string().min(3, 'Il nome deve essere di almeno 3 caratteri'),
  duration_hours: z.number().min(1, 'Minimo 1 ora').max(1000, 'Massimo 1000 ore'),
  course_id: z.string().min(1, 'Seleziona un corso'),
})

type SubjectFormData = z.infer<typeof subjectSchema>

interface SubjectFormProps {
  subject?: Subject
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export default function SubjectForm({
  subject,
  onSubmit,
  onCancel,
  loading = false,
}: SubjectFormProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loadingCourses, setLoadingCourses] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: subject
      ? {
          name: subject.name,
          duration_hours: subject.duration_hours,
          course_id: String(subject.course_id),
        }
      : {
          name: '',
          duration_hours: 0,
          course_id: '',
        },
  })

  const courseId = watch('course_id')

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    if (subject) {
      reset({
        name: subject.name,
        duration_hours: subject.duration_hours,
        course_id: String(subject.course_id),
      })
    }
  }, [subject, reset])

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

  const handleFormSubmit = (data: SubjectFormData) => {
    return onSubmit({
      name: data.name,
      duration_hours: data.duration_hours,
      course_id: parseInt(data.course_id),
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {/* Nome Materia */}
        <div className="space-y-2">
          <Label htmlFor="name">Nome Materia *</Label>
          <Input
            id="name"
            placeholder="es. Programmazione Web"
            {...register('name')}
            disabled={loading}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        {/* Durata Ore */}
        <div className="space-y-2">
          <Label htmlFor="duration_hours">Ore Totali *</Label>
          <Input
            id="duration_hours"
            type="number"
            min="1"
            max="1000"
            placeholder="es. 120"
            {...register('duration_hours', { valueAsNumber: true })}
            disabled={loading}
          />
          {errors.duration_hours && (
            <p className="text-sm text-red-500">{errors.duration_hours.message}</p>
          )}
        </div>

        {/* Corso */}
        <div className="space-y-2">
          <Label htmlFor="course_id">Corso *</Label>
          <Select
            value={courseId}
            onValueChange={(value) => setValue('course_id', value)}
            disabled={loading || loadingCourses}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona un corso..." />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
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
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Annulla
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvataggio...' : subject ? 'Aggiorna' : 'Crea Materia'}
        </Button>
      </div>
    </form>
  )
}
