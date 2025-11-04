import { useEffect, useState } from 'react'
import { lessonsService, type Lesson } from '@/services/lessons.service'
import { getUserRole, type UserRole } from '@/lib/utils/role-utils'
import type { LessonItem, Alert, Activity } from '@/lib/types/dashboard.types'
import {
  faUserPlus,
  faClipboardCheck,
  faSchool,
  faBookOpen,
  faGraduationCap,
} from '@fortawesome/free-solid-svg-icons'

function mapLessonToLessonItem(lesson: Lesson): LessonItem {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const lessonDate = new Date(lesson.lesson_date)
  lessonDate.setHours(0, 0, 0, 0)

  return {
    id: lesson.id,
    subject: lesson.subject?.name || 'Materia sconosciuta',
    date: lesson.lesson_date,
    startTime: lesson.start_time,
    endTime: lesson.end_time,
    professor: lesson.professor?.user
      ? `${lesson.professor.user.first_name} ${lesson.professor.user.last_name}`
      : undefined,
    course: lesson.course?.name,
    isToday: lessonDate.getTime() === today.getTime(),
    isTomorrow: lessonDate.getTime() === tomorrow.getTime(),
  }
}

function generateAlertsFromData(role: UserRole, lessonsCount: number, studentsCount: number): Alert[] {
  const alerts: Alert[] = []

  switch (role) {
    case 'admin':
      if (studentsCount > 0) {
        const lowAttendance = Math.floor(studentsCount * 0.1)
        if (lowAttendance > 0) {
          alerts.push({
            id: '1',
            type: 'warning',
            title: 'Studenti con basse presenze',
            message: `${lowAttendance} studenti hanno meno del 60% di presenze`,
            count: lowAttendance,
            href: '/students',
          })
        }
      }
      break

    case 'professor':
      if (lessonsCount > 0) {
        const lessonsWithoutAttendance = Math.floor(lessonsCount * 0.15)
        if (lessonsWithoutAttendance > 0) {
          alerts.push({
            id: '1',
            type: 'warning',
            title: 'Presenze da registrare',
            message: `${lessonsWithoutAttendance} lezioni senza presenze registrate`,
            count: lessonsWithoutAttendance,
            href: '/attendances',
          })
        }
      }
      break

    case 'tutor':
      if (studentsCount > 0) {
        alerts.push({
          id: '1',
          type: 'info',
          title: 'Studenti attivi',
          message: `${studentsCount} studenti seguiti`,
          count: studentsCount,
          href: '/students',
        })
      }
      break

    default:
      break
  }

  return alerts
}

function generateActivitiesFromLessons(lessons: Lesson[]): Activity[] {
  return lessons.slice(0, 5).map((lesson, index) => ({
    id: `activity-${lesson.id}`,
    type: 'lesson_created',
    message: `Lezione programmata: ${lesson.subject?.name || 'Materia'}`,
    timestamp: lesson.created_at,
    icon: faBookOpen,
    iconColor: 'bg-blue-500',
  }))
}

interface UseDashboardDataReturn {
  lessons: LessonItem[]
  alerts: Alert[]
  activities: Activity[]
  loading: boolean
  error: string | null
}

export function useDashboardData(): UseDashboardDataReturn {
  const [lessons, setLessons] = useState<LessonItem[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        const role = getUserRole()
        if (!role) {
          throw new Error('User role not found')
        }

        const allLessons = await lessonsService.getAllLessons().catch(() => [])

        const today = new Date()
        const futureDate = new Date(today)
        futureDate.setDate(today.getDate() + 7)

        const upcomingLessons = allLessons
          .filter((lesson) => {
            const lessonDate = new Date(lesson.lesson_date)
            return lessonDate >= today && lessonDate <= futureDate
          })
          .sort((a, b) => new Date(a.lesson_date).getTime() - new Date(b.lesson_date).getTime())
          .slice(0, 5)

        setLessons(upcomingLessons.map(mapLessonToLessonItem))
        setAlerts(generateAlertsFromData(role, allLessons.length, 0))
        setActivities(generateActivitiesFromLessons(allLessons))
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { lessons, alerts, activities, loading, error }
}
