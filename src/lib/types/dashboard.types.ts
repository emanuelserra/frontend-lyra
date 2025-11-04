import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

export interface QuickAction {
  label: string
  icon: IconDefinition
  href: string
  color: 'blue' | 'green' | 'purple' | 'orange'
  description?: string
}

export interface QuickActionsPanelProps {
  actions: QuickAction[]
}

export interface LessonItem {
  id: number
  subject: string
  date: string
  startTime: string
  endTime: string
  professor?: string
  course?: string
  isToday: boolean
  isTomorrow: boolean
}

export interface UpcomingLessonsCardProps {
  lessons: LessonItem[]
  loading?: boolean
  canRegisterAttendance?: boolean
  onRegister?: (lessonId: number) => void
}

export type AlertType = 'warning' | 'error' | 'info'

export interface Alert {
  id: string
  type: AlertType
  title: string
  message: string
  count?: number
  href?: string
}

export interface AlertsCardProps {
  alerts: Alert[]
  loading?: boolean
}

export type ActivityType =
  | 'user_created'
  | 'course_created'
  | 'attendance_registered'
  | 'exam_graded'
  | 'student_enrolled'
  | 'lesson_created'

export interface Activity {
  id: string
  type: ActivityType
  message: string
  timestamp: string
  icon: IconDefinition
  iconColor: string
}

export interface RecentActivityCardProps {
  activities: Activity[]
  loading?: boolean
}

export interface SubjectProgress {
  subjectName: string
  attendedHours: number
  totalHours: number
  percentage: number
}

export interface ProgressCardProps {
  subjects: SubjectProgress[]
  loading?: boolean
}

export interface DashboardStats {
  studentsCount?: number
  coursesCount?: number
  professorsCount?: number
  lessonsCount?: number
}
