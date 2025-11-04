'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import { subjectsService, type Subject } from '@/services/subjects.service'
import { coursesService, type Course } from '@/services/courses.service'
import { professorsService, type Professor } from '@/services/professors.service'
import { getUserRole } from '@/lib/utils/role-utils'

const lessonSchema = z.object({
  subject_id: z.number().min(1, 'Materia obbligatoria'),
  course_id: z.number().min(1, 'Corso obbligatorio'),
  professor_id: z.number().min(1, 'Professore obbligatorio'),
  lesson_date: z.string().min(1, 'Data obbligatoria'),
  start_time: z.string().min(1, 'Ora inizio obbligatoria'),
  end_time: z.string().min(1, 'Ora fine obbligatoria'),
})

type LessonFormData = z.infer<typeof lessonSchema>

interface LessonFormProps {
  lesson?: any
  onSubmit: (data: LessonFormData) => void
  onCancel: () => void
  loading?: boolean
}

export function LessonForm({ lesson, onSubmit, onCancel, loading }: LessonFormProps) {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [professors, setProfessors] = useState<Professor[]>([])
  const [userRole, setUserRole] = useState<string | null>(null)
  const [currentProfessorId, setCurrentProfessorId] = useState<number | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: lesson
      ? {
          subject_id: lesson.subject_id,
          course_id: lesson.course_id,
          professor_id: lesson.professor_id,
          lesson_date: lesson.lesson_date,
          start_time: lesson.start_time,
          end_time: lesson.end_time,
        }
      : undefined,
  })

  const selectedSubjectId = watch('subject_id')
  const selectedCourseId = watch('course_id')
  const selectedProfessorId = watch('professor_id')

  useEffect(() => {
    const role = getUserRole()
    setUserRole(role)
    fetchData(role)
  }, [])

  async function fetchData(role: string | null) {
    try {
      const [subjectsData, coursesData, professorsData] = await Promise.all([
        subjectsService.getAllSubjects(),
        coursesService.getAllCourses(),
        professorsService.getAllProfessors(),
      ])

      if (role === 'professor') {
        const myProfile = await professorsService.getMyProfile()
        setCurrentProfessorId(myProfile.id)
        setValue('professor_id', myProfile.id)

        const mySubjects = myProfile.subjects || []
        setSubjects(mySubjects)
      } else {
        setSubjects(subjectsData)
      }

      setCourses(coursesData)
      setProfessors(professorsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {userRole === 'professor' && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          ℹ️ Puoi creare lezioni solo per le <strong>materie a te assegnate</strong>
        </div>
      )}

      <div>
        <Label htmlFor="subject_id">Materia *</Label>
        <Select
          value={selectedSubjectId?.toString()}
          onValueChange={value => setValue('subject_id', parseInt(value))}
          disabled={loading || userRole === 'professor'}
        >
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Seleziona materia..." />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {subjects.map(subject => (
              <SelectItem key={subject.id} value={subject.id.toString()}>
                {subject.name} ({subject.course?.name})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.subject_id && (
          <p className="text-red-500 text-sm mt-1">{errors.subject_id.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="course_id">Corso *</Label>
        <Select
          value={selectedCourseId?.toString()}
          onValueChange={value => setValue('course_id', parseInt(value))}
          disabled={loading}
        >
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Seleziona corso..." />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {courses.map(course => (
              <SelectItem key={course.id} value={course.id.toString()}>
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.course_id && (
          <p className="text-red-500 text-sm mt-1">{errors.course_id.message}</p>
        )}
        {selectedSubject && selectedSubject.course_id !== selectedCourseId && (
          <p className="text-orange-600 text-sm mt-1">
            ⚠️ La materia appartiene al corso "{selectedSubject.course?.name}"
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="professor_id">Professore *</Label>
        <Select
          value={selectedProfessorId?.toString()}
          onValueChange={value => setValue('professor_id', parseInt(value))}
          disabled={loading || userRole === 'professor'}
        >
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Seleziona professore..." />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {professors.map(prof => (
              <SelectItem key={prof.id} value={prof.id.toString()}>
                {prof.user?.first_name} {prof.user?.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.professor_id && (
          <p className="text-red-500 text-sm mt-1">{errors.professor_id.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="lesson_date">Data Lezione *</Label>
        <Input
          id="lesson_date"
          type="date"
          {...register('lesson_date')}
          disabled={loading}
        />
        {errors.lesson_date && (
          <p className="text-red-500 text-sm mt-1">{errors.lesson_date.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start_time">Ora Inizio *</Label>
          <Input
            id="start_time"
            type="time"
            {...register('start_time')}
            disabled={loading}
          />
          {errors.start_time && (
            <p className="text-red-500 text-sm mt-1">{errors.start_time.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="end_time">Ora Fine *</Label>
          <Input
            id="end_time"
            type="time"
            {...register('end_time')}
            disabled={loading}
          />
          {errors.end_time && (
            <p className="text-red-500 text-sm mt-1">{errors.end_time.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Annulla
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvataggio...' : lesson ? 'Aggiorna' : 'Crea Lezione'}
        </Button>
      </div>
    </form>
  )
}
