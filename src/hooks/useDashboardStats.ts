import { useEffect, useState } from 'react'
import { studentsService } from '@/services/students.service'
import { coursesService } from '@/services/courses.service'
import { professorsService } from '@/services/professors.service'
import { usersService } from '@/services/users.service'
import { lessonsService } from '@/services/lessons.service'
import { getUserRole, type UserRole } from '@/lib/utils/role-utils'

interface DashboardStats {
  studentsCount: number
  coursesCount: number
  professorsCount: number
  lessonsCount: number
  usersCount: number
}

interface UseDashboardStatsReturn {
  stats: Partial<DashboardStats>
  loading: boolean
  error: string | null
}

export function useDashboardStats(): UseDashboardStatsReturn {
  const [stats, setStats] = useState<Partial<DashboardStats>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      setLoading(true)
      setError(null)

      try {
        const role = getUserRole()

        if (!role) {
          throw new Error('User role not found')
        }

        const newStats: Partial<DashboardStats> = {}

        // Admin vede tutte le statistiche
        if (role === 'admin') {
          const [students, courses, professors, users, lessons] = await Promise.all([
            studentsService.getAllStudents().catch(() => []),
            coursesService.getAllCourses().catch(() => []),
            professorsService.getAllProfessors().catch(() => []),
            usersService.getAllUsers().catch(() => []),
            lessonsService.getAllLessons().catch(() => []),
          ])

          newStats.studentsCount = students.length
          newStats.coursesCount = courses.length
          newStats.professorsCount = professors.length
          newStats.usersCount = users.length
          newStats.lessonsCount = lessons.length
        }

        // Professor vede le sue statistiche
        else if (role === 'professor') {
          const [lessons, subjects] = await Promise.all([
            professorsService.getMyLessons().catch(() => []),
            professorsService.getMySubjects().catch(() => []),
          ])

          newStats.lessonsCount = lessons.length
          newStats.coursesCount = subjects.length // Materie come proxy per corsi
        }

        // Tutor vede statistiche studenti e corsi
        else if (role === 'tutor') {
          const [students, courses] = await Promise.all([
            studentsService.getAllStudents().catch(() => []),
            coursesService.getAllCourses().catch(() => []),
          ])

          newStats.studentsCount = students.length
          newStats.coursesCount = courses.length
        }

        // Student vede le sue statistiche personali
        else if (role === 'student') {
          const [attendances, grades] = await Promise.all([
            studentsService.getMyAttendances().catch(() => []),
            studentsService.getMyGrades().catch(() => []),
          ])

          newStats.lessonsCount = attendances.length
          newStats.coursesCount = grades.length // Esami come proxy
        }

        setStats(newStats)
      } catch (err) {
        console.error('Error fetching dashboard stats:', err)
        setError(err instanceof Error ? err.message : 'Failed to load stats')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading, error }
}
