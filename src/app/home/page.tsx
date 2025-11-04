'use client'

import { useEffect, useState } from 'react'
import { Sidebar, Navbar } from '@/components/layout'
import { StatsCard, ProtectedRoute } from '@/components/shared'
import AttendanceCalendar from '@/components/shared/AttendanceCalendar'
import QuickActionsPanel from '@/components/dashboard/QuickActionsPanel'
import UpcomingLessonsCard from '@/components/dashboard/UpcomingLessonsCard'
import AlertsCard from '@/components/dashboard/AlertsCard'
import RecentActivityCard from '@/components/dashboard/RecentActivityCard'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { useDashboardData } from '@/hooks/useDashboardData'
import { getUserRole, type UserRole } from '@/lib/utils/role-utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUsers,
  faBook,
  faGraduationCap,
  faCalendarDays,
  faSchool,
  faUserPlus,
  faBookOpen,
  faFileAlt,
  faClipboardCheck,
  faChalkboardTeacher,
  faPenToSquare,
  faCalendarPlus,
  faEye,
  faAward,
} from '@fortawesome/free-solid-svg-icons'
import type { QuickAction } from '@/lib/types/dashboard.types'

function getQuickActionsForRole(role: UserRole): QuickAction[] {
  switch (role) {
    case 'admin':
      return [
        { label: 'Crea Utente', icon: faUserPlus, href: '/users', color: 'blue', description: 'Aggiungi nuovo utente' },
        { label: 'Crea Corso', icon: faBookOpen, href: '/courses', color: 'green', description: 'Nuovo corso formativo' },
        { label: 'Report', icon: faFileAlt, href: '/students', color: 'purple', description: 'Visualizza statistiche' },
      ]
    case 'professor':
      return [
        { label: 'Registra Presenze', icon: faClipboardCheck, href: '/attendances', color: 'blue' },
        { label: 'Crea Lezione', icon: faCalendarPlus, href: '/lessons', color: 'green' },
        { label: 'Inserisci Voti', icon: faPenToSquare, href: '/exams', color: 'orange' },
      ]
    case 'tutor':
      return [
        { label: 'Registra Presenze', icon: faClipboardCheck, href: '/attendances', color: 'blue' },
        { label: 'Studenti', icon: faUsers, href: '/students', color: 'green' },
        { label: 'Report', icon: faFileAlt, href: '/courses', color: 'purple' },
      ]
    case 'student':
      return [
        { label: 'Orario Lezioni', icon: faCalendarDays, href: '/lessons', color: 'blue' },
        { label: 'I Miei Voti', icon: faAward, href: '/exams', color: 'green' },
        { label: 'Presenze', icon: faEye, href: '/attendances', color: 'orange' },
      ]
    default:
      return []
  }
}

function DashboardContent() {
  const { stats, loading: statsLoading } = useDashboardStats()
  const { lessons, alerts, activities, loading: dataLoading } = useDashboardData()
  const [userRole, setUserRole] = useState<UserRole | null>(null)

  useEffect(() => {
    setUserRole(getUserRole())
  }, [])

  const quickActions = userRole ? getQuickActionsForRole(userRole) : []
  const loading = statsLoading || dataLoading

  const renderStats = () => {
    if (!userRole) return null

    switch (userRole) {
      case 'admin':
        return (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <StatsCard title="Studenti" value={stats.studentsCount ?? 0} icon={faUsers} loading={statsLoading} />
            <StatsCard title="Corsi" value={stats.coursesCount ?? 0} icon={faBook} loading={statsLoading} />
            <StatsCard title="Professori" value={stats.professorsCount ?? 0} icon={faGraduationCap} loading={statsLoading} />
            <StatsCard title="Lezioni" value={stats.lessonsCount ?? 0} icon={faCalendarDays} loading={statsLoading} />
          </div>
        )
      case 'professor':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <StatsCard title="Le Mie Lezioni" value={stats.lessonsCount ?? 0} icon={faChalkboardTeacher} loading={statsLoading} />
            <StatsCard title="Materie" value={stats.coursesCount ?? 0} icon={faBook} loading={statsLoading} />
            <StatsCard title="Studenti" value={stats.studentsCount ?? 0} icon={faUsers} loading={statsLoading} />
          </div>
        )
      case 'tutor':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <StatsCard title="Studenti" value={stats.studentsCount ?? 0} icon={faUsers} loading={statsLoading} />
            <StatsCard title="Corsi" value={stats.coursesCount ?? 0} icon={faSchool} loading={statsLoading} />
            <StatsCard title="Presenze Oggi" value={0} icon={faCalendarDays} loading={statsLoading} />
          </div>
        )
      case 'student':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <StatsCard title="Presenze" value={stats.lessonsCount ?? 0} icon={faCalendarDays} loading={statsLoading} />
            <StatsCard title="Esami" value={stats.coursesCount ?? 0} icon={faGraduationCap} loading={statsLoading} />
            <StatsCard title="Media Voti" value="-" icon={faBook} loading={statsLoading} />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto p-6 space-y-5 bg-gray-50">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600 mt-0.5">Panoramica attività</p>
          </div>

          {renderStats()}
          <QuickActionsPanel actions={quickActions} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {userRole === 'student' ? (
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold mb-4">Calendario Presenze</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Clicca su un giorno per vedere le lezioni e segnare la tua presenza.
                    Il professore confermerà successivamente.
                  </p>
                  <AttendanceCalendar />
                </div>
              </div>
            ) : (
              <>
                <UpcomingLessonsCard
                  lessons={lessons}
                  loading={dataLoading}
                  canRegisterAttendance={userRole === 'professor' || userRole === 'tutor'}
                  onRegister={(id) => console.log('Register attendance for lesson', id)}
                />
                <AlertsCard alerts={alerts} loading={dataLoading} />
              </>
            )}
          </div>

          {userRole !== 'student' && (
            <RecentActivityCard activities={activities} loading={dataLoading} />
          )}
        </main>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
